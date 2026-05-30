const express = require('express');
const axios = require('axios');

const router = express.Router();

const OWM_BASE = 'https://api.openweathermap.org';

router.get('/cities', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'q is required' });
  }

  try {
    const response = await axios.get(`${OWM_BASE}/geo/1.0/direct`, {
      params: {
        q,
        limit: 5,
        appid: process.env.OWM_API_KEY,
      },
    });

    const cities = response.data.map((city) => ({
      name: city.name,
      country: city.country,
      state: city.state,
      lat: city.lat,
      lon: city.lon,
    }));

    return res.json(cities);
  } catch {
    return res.status(502).json({ error: 'failed to fetch cities' });
  }
});

router.get('/weather', async (req, res) => {
  const { city, lat, lon } = req.query;

  if (!city && (!lat || !lon)) {
    return res.status(400).json({ error: 'city or lat/lon is required' });
  }

  const params =
    lat && lon
      ? { lat, lon, units: 'metric', appid: process.env.OWM_API_KEY }
      : { q: city, units: 'metric', appid: process.env.OWM_API_KEY };

  try {
    const response = await axios.get(`${OWM_BASE}/data/2.5/weather`, {
      params,
    });

    const data = response.data;

    return res.json({
      city: data.name,
      country: data.sys.country,
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      timezone: data.timezone,
    });
  } catch {
    return res.status(502).json({ error: 'failed to fetch weather' });
  }
});

module.exports = router;
