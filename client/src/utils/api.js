import axios from 'axios';

// 🚨 DO NOT USE localhost fallback in production
// 🚨 DO NOT USE localhost fallback in production
let envBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!envBaseUrl) {
    throw new Error('❌ VITE_API_BASE_URL is not defined');
}

// Remove trailing slash if present
if (envBaseUrl.endsWith('/')) {
    envBaseUrl = envBaseUrl.slice(0, -1);
}

// Ensure URL ends with /api/v1
// This handles cases where user sets Env Var to just domain (https://richclub01.onrender.com)
// OR sets it correctly (https://richclub01.onrender.com/api/v1)
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
const API_BASE_URL = envBaseUrl.includes(`/api/${API_VERSION}`)
    ? envBaseUrl
    : `${envBaseUrl}/api/${API_VERSION}`;

console.log('🔌 API Base URL:', API_BASE_URL);

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        // If data is FormData, let the browser set the Content-Type (with boundary)
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname.startsWith('/admin')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error.response?.data || error.message);
    }
);

export { API_BASE_URL, API_VERSION };
export default api;
