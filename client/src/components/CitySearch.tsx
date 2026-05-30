import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import client from '../api/client';
import { useCityStore } from '../store/cityStore';

interface City {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

function CitySearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const selectCity = useCityStore((s) => s.selectCity);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await client.get('/cities', { params: { q: query } });
        setSuggestions(res.data);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(city: City) {
    selectCity(city.name, city.lat, city.lon);
    setQuery(city.name);
    setSuggestions([]);
  }

  return (
    <div className="relative">
      <label
        htmlFor="city-search"
        className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft"
      >
        Search a city
      </label>
      <input
        id="city-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="London"
        className="w-full border-0 border-b border-rule bg-transparent pb-1 font-display text-2xl text-ink outline-none transition-colors placeholder:text-rule focus:border-accent"
      />

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute z-20 mt-2 w-full border border-rule bg-paper shadow-sm"
          >
            {suggestions.map((city) => (
              <li key={`${city.lat}-${city.lon}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(city)}
                  className="block w-full border-b border-rule px-4 py-2 text-left text-sm text-ink transition-colors last:border-b-0 hover:bg-paper-dark hover:text-accent"
                >
                  {city.name}
                  {city.state ? `, ${city.state}` : ''}, {city.country}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CitySearch;
