import axios from 'axios';

// 🚨 DO NOT USE localhost fallback in production
const envBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!envBaseUrl) {
    throw new Error('❌ VITE_API_BASE_URL is not defined');
}

// Ensure URL always ends with /api/v1
// Handles: https://richclub01.onrender.com -> adds /api/v1
// Handles: https://richclub01.onrender.com/ -> adds api/v1
// Handles: https://richclub01.onrender.com/api/v1 -> keeps as is
const API_BASE_URL = envBaseUrl.endsWith('/api/v1')
    ? envBaseUrl
    : envBaseUrl.endsWith('/')
        ? `${envBaseUrl}api/v1`
        : `${envBaseUrl}/api/v1`;

console.log('🔌 Axios Base URL (Final):', API_BASE_URL);

// Create axios instance with centralized base configuration
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

export { API_BASE_URL };
export default api;
