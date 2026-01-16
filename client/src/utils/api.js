import axios from 'axios';

// Get base URL from environment variable
const envBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!envBaseUrl) {
    throw new Error('❌ VITE_API_BASE_URL is not defined');
}

// Create axios instance with /api/v1 suffix
const api = axios.create({
    baseURL: `${envBaseUrl}/api/v1`,
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

        // Debug log
        console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);

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

export default api;
