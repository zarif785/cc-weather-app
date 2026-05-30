import { create } from 'zustand';
import client from '../api/client';

interface User {
  username: string;
}

interface AuthStore {
  user: User | null;
  initialized: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  initialized: false,

  login: async (username, password) => {
    const res = await client.post('/auth/login', { username, password });
    set({ user: res.data });
  },

  signup: async (username, password) => {
    const res = await client.post('/auth/signup', { username, password });
    set({ user: res.data });
  },

  logout: async () => {
    await client.post('/auth/logout');
    set({ user: null });
  },

  fetchMe: async () => {
    try {
      const res = await client.get('/auth/me');
      set({ user: res.data, initialized: true });
    } catch {
      set({ user: null, initialized: true });
    }
  },
}));
