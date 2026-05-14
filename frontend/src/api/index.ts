import api from '../lib/api';
import {
  Habit, HabitLog, Goal, Note,
  AnalyticsOverview, HeatmapEntry, TrendEntry, WeeklyEntry,
  AuthResponse, LogStatus,
} from '../types';

export const authApi = {
  register: (d: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', d).then((r) => r.data),
  login: (d: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', d).then((r) => r.data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const habitsApi = {
  getAll: () => api.get<Habit[]>('/habits').then((r) => r.data),
  create: (d: any) => api.post<Habit>('/habits', d).then((r) => r.data),
  update: (id: string, d: any) => api.put<Habit>(`/habits/${id}`, d).then((r) => r.data),
  remove: (id: string) => api.delete(`/habits/${id}`),
};

export const logsApi = {
  log: (d: { habitId: string; date: string; status: LogStatus; note?: string }) =>
    api.post<HabitLog>('/logs', d).then((r) => r.data),
  forDate: (date: string) =>
    api.get<HabitLog[]>(`/logs/date/${date}`).then((r) => r.data),
  forHabit: (id: string, from?: string, to?: string) =>
    api.get<HabitLog[]>(`/logs/habit/${id}`, { params: { from, to } }).then((r) => r.data),
};

export const goalsApi = {
  getAll: () => api.get<Goal[]>('/goals').then((r) => r.data),
  create: (d: any) => api.post<Goal>('/goals', d).then((r) => r.data),
  update: (id: string, d: any) => api.put<Goal>(`/goals/${id}`, d).then((r) => r.data),
  remove: (id: string) => api.delete(`/goals/${id}`),
  progress: (id: string) =>
    api.get<{ progress: number }>(`/goals/${id}/progress`).then((r) => r.data),
};

export const notesApi = {
  getAll: (p?: { q?: string; tag?: string; color?: string }) =>
    api.get<Note[]>('/notes', { params: p }).then((r) => r.data),
  create: (d: any) => api.post<Note>('/notes', d).then((r) => r.data),
  update: (id: string, d: any) => api.put<Note>(`/notes/${id}`, d).then((r) => r.data),
  pin: (id: string) => api.patch<Note>(`/notes/${id}/pin`).then((r) => r.data),
  remove: (id: string) => api.delete(`/notes/${id}`),
  tags: () => api.get<string[]>('/notes/tags').then((r) => r.data),
};

export const analyticsApi = {
  overview: () => api.get<AnalyticsOverview>('/analytics/overview').then((r) => r.data),
  heatmap: (days?: number) =>
    api.get<HeatmapEntry[]>('/analytics/heatmap', { params: { days } }).then((r) => r.data),
  trends: (days?: number) =>
    api.get<TrendEntry[]>('/analytics/trends', { params: { days } }).then((r) => r.data),
  weekly: () => api.get<WeeklyEntry[]>('/analytics/weekly').then((r) => r.data),
};
