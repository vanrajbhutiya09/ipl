import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 - redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ===== AUTH =====
export const login = (data) => api.post('/api/auth/login', data);

// ===== USER =====
export const getMyBets = () => api.get('/api/user/bets');
export const placeBet = (data) => api.post('/api/user/bets', data);
export const getWallet = () => api.get('/api/user/wallet');
export const getOpenMatches = () => api.get('/api/user/matches');
export const getAllMatchesUser = () => api.get('/api/user/matches/all');
export const getProfile = () => api.get('/api/user/profile');

// ===== ADMIN =====
export const adminGetUsers = () => api.get('/api/admin/users');
export const adminCreateUser = (data) => api.post('/api/admin/users/create', data);
export const adminAddBalance = (data) => api.post('/api/admin/users/add-balance', data);
export const adminToggleUser = (userId) => api.post(`/api/admin/users/${userId}/toggle-status`);
export const adminResetPassword = (userId, newPassword) =>
  api.post(`/api/admin/users/${userId}/reset-password`, { newPassword });

export const adminGetMatches = () => api.get('/api/admin/matches');
export const adminCreateMatch = (data) => api.post('/api/admin/matches', data);
export const adminUpdateMatch = (matchId, data) => api.put(`/api/admin/matches/${matchId}`, data);
export const adminDeclareResult = (data) => api.post('/api/admin/matches/declare-result', data);
export const adminCancelMatch = (matchId) => api.delete(`/api/admin/matches/${matchId}`);
export const adminGetBets = () => api.get('/api/admin/bets');
export const adminGetBetsByMatch = (matchId) => api.get(`/api/admin/bets/match/${matchId}`);

export default api;
