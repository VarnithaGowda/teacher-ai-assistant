/**
 * services/api.js - Centralized Axios API client
 * 
 * All API calls go through this module.
 * Automatically attaches JWT token to every request.
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance with base config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 minutes (AI calls can be slow)
})

// ── Request Interceptor: attach JWT token ──────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor: handle 401 (token expired) ──────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth API ──────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/me', data),
}

// ─── Lesson Plan API ───────────────────────────────────────────
export const lessonAPI = {
  generate: (data) => api.post('/api/lesson/generate', data),
  list: () => api.get('/api/lesson/'),
  getById: (id) => api.get(`/api/lesson/${id}`),
}

// ─── Rubric API ────────────────────────────────────────────────
export const rubricAPI = {
  generate: (data) => api.post('/api/rubric/generate', data),
  list: () => api.get('/api/rubric/'),
  getById: (id) => api.get(`/api/rubric/${id}`),
}

// ─── Evaluation API ────────────────────────────────────────────
export const evaluationAPI = {
  evaluate: (formData) => api.post('/api/evaluation/evaluate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  list: () => api.get('/api/evaluation/'),
}

// ─── Chatbot API ───────────────────────────────────────────────
export const chatAPI = {
  sendMessage: (data) => api.post('/api/chat/message', data),
  getHistory: (sessionId) => api.get('/api/chat/history', { params: { session_id: sessionId } }),
  getSessions: () => api.get('/api/chat/sessions'),
}

// ─── RAG / Documents API ───────────────────────────────────────
export const ragAPI = {
  uploadDocument: (formData) => api.post('/api/rag/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  listDocuments: () => api.get('/api/rag/documents'),
  deleteDocument: (id) => api.delete(`/api/rag/documents/${id}`),
}

// ─── Analytics API ─────────────────────────────────────────────
export const analyticsAPI = {
  getSummary: () => api.get('/api/analytics/summary'),
  getChartData: () => api.get('/api/analytics/evaluations/chart'),
}

// ─── Workflow API ──────────────────────────────────────────────
export const workflowAPI = {
  run: (formData) => api.post('/api/workflow/run', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getHistory: () => api.get('/api/workflow/history'),
  getById: (id) => api.get(`/api/workflow/${id}`),
}

export default api
