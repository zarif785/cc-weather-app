import { create } from 'zustand';
import client from '../api/client';

interface Weather {
  city: string;
  country: string;
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  timezone: number;
}

interface CityStore {
  city: string;
  country: string;
  weather: Weather | null;
  loading: boolean;
  error: string | null;
  unit: 'C' | 'F';
  setUnit: (unit: 'C' | 'F') => void;
  selectCity: (name: string, country: string, lat: number, lon: number) => Promise<void>;
}

export const useCityStore = create<CityStore>((set) => ({
  city: '',
  country: '',
  weather: null,
  loading: false,
  error: null,
  unit: 'C',

  setUnit: (unit) => set({ unit }),

  selectCity: async (name, country, lat, lon) => {
    set({ city: name, country, loading: true, error: null });
    try {
      const res = await client.get('/weather', { params: { lat, lon } });
      // OWM returns the nearest weather station's name for given coordinates,
      // which can differ from the place the user picked. Show the picked name.
      set({ weather: { ...res.data, city: name }, loading: false });
    } catch {
      set({ weather: null, loading: false, error: 'Could not load weather' });
    }
  },
}));
