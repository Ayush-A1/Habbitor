import axios from 'axios';
import { useAuth } from '../store/auth';

const BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = false;
let queue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];
const flush = (err: unknown, token: string | null) => {
  queue.forEach((p) => (err ? p.reject(err) : p.resolve(token!)));
  queue = [];
};

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      if (refreshing) {
        return new Promise((res, rej) => queue.push({ resolve: res, reject: rej })).then((t) => {
          orig.headers.Authorization = `Bearer ${t}`;
          return api(orig);
        });
      }
      orig._retry = true;
      refreshing = true;
      try {
        const { refreshToken, setTokens } = useAuth.getState();
        if (!refreshToken) throw new Error('no token');
        const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken });
        setTokens(data.accessToken, refreshToken);
        flush(null, data.accessToken);
        orig.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(orig);
      } catch (e) {
        flush(e, null);
        useAuth.getState().logout();
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
