import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useCityStore } from '../store/cityStore';

function WeatherCard() {
  const weather = useCityStore((s) => s.weather);
  const loading = useCityStore((s) => s.loading);
  const error = useCityStore((s) => s.error);
  const unit = useCityStore((s) => s.unit);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Weather is stored in Celsius; convert only for display.
  const toDisplay = (celsius: number) =>
    unit === 'C' ? celsius : Math.round((celsius * 9) / 5 + 32);

  if (loading) {
    return <p className="font-display text-lg text-ink-soft">Loading…</p>;
  }

  if (error) {
    return <p className="text-sm text-accent">{error}</p>;
  }

  if (!weather) {
    return (
      <p className="font-display text-lg text-ink-soft">Search for a city above.</p>
    );
  }

  // OWM gives the city's UTC offset in seconds. Add it to the current UTC
  // instant, then format in UTC, so we read the city's wall-clock time.
  const localTime = new Date(now + weather.timezone * 1000).toLocaleTimeString(
    'en-GB',
    { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' },
  );

  return (
    <motion.div
      key={`${weather.city}-${weather.country}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="text-[0.7rem] uppercase tracking-[0.3em] text-ink-soft">
        {weather.city}, {weather.country}
      </p>

      <p className="mt-1 font-display text-sm text-ink-soft">
        Local time {localTime}
      </p>

      <span className="mt-2 block font-display text-[7rem] font-light leading-none text-ink">
        {toDisplay(weather.temp)}°{unit}
      </span>

      <p className="mt-1 font-display text-2xl capitalize text-ink">
        {weather.description}
      </p>

      <div className="mt-6 grid grid-cols-2 border-t border-rule">
        <div className="border-r border-rule py-3 pr-4">
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft">
            Feels like
          </p>
          <p className="font-display text-2xl text-ink">
            {toDisplay(weather.feels_like)}°{unit}
          </p>
        </div>
        <div className="py-3 pl-4">
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft">
            Humidity
          </p>
          <p className="font-display text-2xl text-ink">{weather.humidity}%</p>
        </div>
      </div>
    </motion.div>
  );
}

export default WeatherCard;
