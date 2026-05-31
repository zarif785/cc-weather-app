import { useState, useEffect, useRef } from 'react';
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

  const skipSearch = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (skipSearch.current) {
      skipSearch.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await client.get('/cities', { params: { q: query } });
        setSuggestions(res.data);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);


  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(city: City) {
    skipSearch.current = true;
    selectCity(city.name, city.state || '', city.lat, city.lon);
    setQuery(city.name);
    setSuggestions([]);
  }

  return (
    <div ref={containerRef} className="relative">
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
