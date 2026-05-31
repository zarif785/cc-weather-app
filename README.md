# Weather App

A full-stack weather application with authentication, city search with live weather, and
real-time broadcast messages delivered over WebSockets.

- **Frontend:** React 19 + TypeScript (Vite), Tailwind CSS v4, Zustand, React Router 7, Motion, Socket.IO client
- **Backend:** Node.js + Express, Socket.IO, JWT auth, bcryptjs, in-memory store
- **Weather data:** OpenWeatherMap (geocoding + current weather)

---

## Architecture

```
Browser (React, :5173)
   │  /api      → Vite proxy ─┐
   │  /socket.io→ Vite proxy ─┤
   ▼                          ▼
              Express + Socket.IO (:3001)
                     │
                     ▼
            OpenWeatherMap API
```

- The **Vite dev proxy** (`client/vite.config.ts`) forwards `/api` and `/socket.io` to
  `localhost:3001`. This avoids CORS and keeps the OpenWeatherMap key on the server only.
- **One HTTP server** is shared by Express and Socket.IO. The server is created with the
  Express app as its request handler, then `io.attach()` is called, so Socket.IO intercepts
  `/socket.io/*` and everything else falls through to Express.
- **Auth:** JWT issued on login/signup, stored in an **httpOnly cookie**. Protected HTTP
  routes and the WebSocket handshake both verify this cookie.
- **Storage is in-memory** (a `Map`), per the brief. It resets when the server restarts.

### Two kinds of authorization (important)

| Actor | How they authenticate | What they can do |
|-------|----------------------|------------------|
| **App user** (recipient) | JWT httpOnly cookie (login) | View weather, receive message popups |
| **Message pusher** (system) | `x-api-key` header (shared secret) | Push a message to a city via the endpoint |

The message **push endpoint is a system endpoint**, not a user action — it is secured with an
API key (like a webhook), not a user login. App users only *receive* messages.

---

## Key components

**Server (`server/src/`)**
- `index.js` — boots the HTTP server, attaches Socket.IO, starts listening
- `app.js` — `createApp({ io })` factory; wires all routes and middleware
- `routes/auth.js` — signup / login / logout / me
- `routes/weather.js` — city autocomplete + current weather (proxies OpenWeatherMap)
- `routes/messages.js` — the push endpoint (broadcasts to a city room)
- `socket/io.js` — Socket.IO auth middleware + `join-city` / `leave-city` room handling
- `middleware/requireAuth.js` — verifies the JWT cookie for protected routes
- `middleware/requireApiKey.js` — verifies the `x-api-key` header for the push endpoint
- `store/userStore.js` — in-memory user `Map` (bcrypt password hashing)

**Client (`client/src/`)** — see the Frontend section below.

---

## Setup

```bash
# 1. Install all dependencies (root, server, client)
npm run install:all

# 2. Create the server env file
cp server/.env.example server/.env
#    then edit server/.env (see below)

# 3. Start both servers
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3001

### Environment variables (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `OWM_API_KEY` | yes | OpenWeatherMap free-tier API key |
| `JWT_SECRET` | yes | Any long random string used to sign auth tokens |
| `MESSAGE_API_KEY` | yes | **Any alphanumeric string** — the shared secret to push messages |
| `PORT` | no | Server port (default `3001`) |
| `CLIENT_ORIGIN` | no | Allowed Socket.IO origin (default `http://localhost:5173`) |

> `JWT_SECRET` and `MESSAGE_API_KEY` are secrets **you choose** — they can be any value.
> Keep them on one line with no spaces and no `#` or `=` characters. Changing `JWT_SECRET`
> invalidates existing logins (users must sign in again). `server/.env` is gitignored.

### Scripts

```bash
npm run dev          # client (:5173) + server (:3001) concurrently
npm --prefix server run dev    # server only
npm --prefix client run dev    # client only
```

---

## HTTP API

Base path: `/api` (via the Vite proxy in the browser, or directly at `http://localhost:3001/api`).

| Method | Path | Auth | Body / Query | Returns |
|--------|------|------|--------------|---------|
| `GET`  | `/api/health` | none | — | `{ ok: true }` |
| `POST` | `/api/auth/signup` | none | `{ username, password }` | `{ username }` + sets cookie |
| `POST` | `/api/auth/login` | none | `{ username, password }` | `{ username }` + sets cookie |
| `POST` | `/api/auth/logout` | none | — | `{ ok: true }`, clears cookie |
| `GET`  | `/api/auth/me` | cookie | — | `{ username }` or `401` |
| `GET`  | `/api/cities?q=<text>` | cookie | query `q` | `[{ name, country, state?, lat, lon }]` |
| `GET`  | `/api/weather?lat=&lon=` | cookie | `lat`+`lon` (or `city`) | `{ city, country, temp, feels_like, humidity, description, icon, timezone }` |
| `POST` | `/api/messages` | **API key** | `{ city, state?, message }` | `{ ok: true }` |

Notes:
- **Weather is fetched by coordinates** (`lat`/`lon`) for precision — names alone are ambiguous
  (many cities share a name). `city` is supported as a fallback.
- Temperatures come from the API in **Celsius**; the UI converts to Fahrenheit on the client.

---

## Live messages (the push endpoint)

This is the "mechanism to push messages into the system." It accepts a message and a target
city, then broadcasts to every connected user currently viewing that city.

- **Auth:** send your secret in the `x-api-key` header. It must equal `MESSAGE_API_KEY` in
  `server/.env`. The key can be **any alphanumeric string** you set — there is no fixed value.
- **Target room:** messages are scoped by **city + state** → room key `city:<name>|<state>`.
  `state` is optional (some places have none); when present it disambiguates same-named cities
  (e.g. Burwood, New South Wales vs Burwood, Victoria). The `state` you push must match the
  state of the city the user selected in the app.
- **Delivery:** the app user's browser opens an authenticated WebSocket and joins the room for
  the city they selected. A matching push triggers a popup (toast) in their browser.

### Test with curl

```bash
curl -X POST http://localhost:3001/api/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: <YOUR_MESSAGE_API_KEY>" \
  -d '{"city":"Burwood","state":"Victoria","message":"Storm incoming"}'
```

Expected responses:
- `200 { "ok": true }` — broadcast sent
- `401` — missing or wrong `x-api-key`
- `400` — missing `city` or `message`

### Test with Postman

1. **POST** `http://localhost:3001/api/messages`
2. **Headers:**
   - `Content-Type: application/json`
   - `x-api-key: <YOUR_MESSAGE_API_KEY>`
3. **Body** → raw → JSON:
   ```json
   { "city": "Burwood", "state": "Victoria", "message": "Storm incoming" }
   ```
4. **Send** → `200 { "ok": true }`.

### Seeing the popup end-to-end
1. Open the app, log in, search a city and select it (e.g. **Burwood, Victoria**).
2. Push to that exact city + state (curl or Postman).
3. A popup appears in the browser. Pushing a different `state` for the same city → no popup
   (proves the targeting).

---

## WebSocket (Socket.IO)

- **Connection** is authenticated by the JWT cookie (handshake middleware in `socket/io.js`);
  unauthenticated sockets are rejected.
- **Client → server events:**
  - `join-city` `{ city, state }` — join a city's room (auto-leaves the previous one)
  - `leave-city` `{ city, state }`
- **Server → client event:**
  - `message` `{ city, state, message, timestamp }` — emitted to a room by the push endpoint
- **Rooms:** `city:<lowercase-name>|<lowercase-state>`

The client lifecycle is managed by the `useSocket` hook (connect on mount, join on city change,
disconnect on unmount).

---

## Frontend

Located in `client/src/`. Built with React + TypeScript, styled with Tailwind CSS v4
(editorial theme: warm paper background, Fraunces serif, oxblood accent), animated with Motion.

### Routes (`App.tsx`, React Router)

| Path | Page | Access |
|------|------|--------|
| `/login` | `LoginPage` | public |
| `/signup` | `SignupPage` | public |
| `/` | `HomePage` | protected (redirects to `/login` if not authenticated) |

On load, `App` calls `authStore.fetchMe()` to rehydrate auth from the cookie. `ProtectedRoute`
shows a loading state until that check finishes, then either renders the page or redirects.

### Pages (`client/src/pages/`)
- **`LoginPage`** — username/password form, show/hide password, calls `authStore.login`, redirects home.
- **`SignupPage`** — same plus confirm-password, a live password-rules checklist (8+ chars,
  letters + numbers), and a strength meter.
- **`HomePage`** — masthead (date, username, °C/°F toggle, sign out), `CitySearch`, and
  `WeatherCard`. Calls `useSocket()` to receive live messages.

### Components (`client/src/components/`)
- **`ProtectedRoute`** — auth guard wrapping protected pages.
- **`CitySearch`** — debounced autocomplete against `/api/cities`; dropdown closes on outside
  click; selecting a city loads its weather.
- **`WeatherCard`** — renders loading / error / empty / data states; big temperature, local
  time (ticking, derived from the city's UTC offset), feels-like, humidity.

### State (`client/src/store/`, Zustand)
- **`authStore`** — `user`, `initialized`, `login`, `signup`, `logout`, `fetchMe`.
- **`cityStore`** — `city`, `state`, `weather`, `loading`, `error`, `unit`, `setUnit`, `selectCity`.

### Other
- **`hooks/useSocket.ts(x)`** — Socket.IO lifecycle: connect, join/leave city rooms, show a
  toast on incoming `message`.
- **`api/client.ts`** — axios instance (`baseURL: '/api'`, `withCredentials: true`).
