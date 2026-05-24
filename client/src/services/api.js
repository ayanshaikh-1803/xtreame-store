import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  withCredentials: true
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('xtreame_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('xtreame_token');
      localStorage.removeItem('xtreame_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:          (data) => API.post('/auth/register', data),
  verifyEmail:       (data) => API.post('/auth/verify-email', data),
  resendOTP:         (data) => API.post('/auth/resend-otp', data),
  login:             (data) => API.post('/auth/login', data),
  forgotPassword:    (data) => API.post('/auth/forgot-password', data),
  verifyForgotOTP:   (data) => API.post('/auth/verify-forgot-otp', data),
  resetPassword:     (data) => API.post('/auth/reset-password', data),
  sendMobileOTP:     (data) => API.post('/auth/send-mobile-otp', data),
  verifyMobileOTP:   (data) => API.post('/auth/verify-mobile-otp', data),
  getMe:             ()     => API.get('/auth/me')
};

// ─── IDs ──────────────────────────────────────────────────────────────────────
export const idsAPI = {
  getAll: (params) => API.get('/ids', { params }),
  getById: (id) => API.get(`/ids/${id}`),
  getFeatured: () => API.get('/ids/featured'),
  getTrending: () => API.get('/ids/trending'),
  getByCategory: (category) => API.get(`/ids/category/${category}`)
};

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const cartAPI = {
  get: () => API.get('/cart'),
  add: (idId) => API.post('/cart/add', { idId }),
  remove: (idId) => API.delete(`/cart/remove/${idId}`),
  clear: () => API.delete('/cart/clear')
};

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const wishlistAPI = {
  get: () => API.get('/wishlist'),
  toggle: (idId) => API.post('/wishlist/toggle', { idId })
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getAnalytics: () => API.get('/admin/analytics'),
  getUsers: () => API.get('/admin/users'),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  addID: (data) => API.post('/admin/ids', data),
  updateID: (id, data) => API.put(`/admin/ids/${id}`, data),
  deleteID: (id) => API.delete(`/admin/ids/${id}`),
  markSold: (id) => API.patch(`/admin/ids/${id}/sold`),
  markAvailable: (id) => API.patch(`/admin/ids/${id}/available`),
  uploadImages: (formData) => API.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export default API;
