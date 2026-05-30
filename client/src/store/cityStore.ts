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
}

interface CityStore {
  city: string;
  weather: Weather | null;
  loading: boolean;
  error: string | null;
  selectCity: (name: string) => Promise<void>;
}

export const useCityStore = create<CityStore>((set) => ({
  city: '',
  weather: null,
  loading: false,
  error: null,

  selectCity: async (name) => {
    set({ city: name, loading: true, error: null });
    try {
      const res = await client.get('/weather', { params: { city: name } });
      set({ weather: res.data, loading: false });
    } catch {
      set({ weather: null, loading: false, error: 'Could not load weather' });
    }
  },
}));
