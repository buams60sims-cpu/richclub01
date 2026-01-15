// Centralized API Configuration
// This file is the single source of truth for the API URL

// 🚨 DO NOT USE localhost fallback in production
let envBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!envBaseUrl) {
    throw new Error('❌ VITE_API_BASE_URL is not defined in environment variables');
}

// Remove trailing slash if present
if (envBaseUrl.endsWith('/')) {
    envBaseUrl = envBaseUrl.slice(0, -1);
}

// Ensure URL ends with /api/v1
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
const API_BASE = envBaseUrl.includes(`/api/${API_VERSION}`)
    ? envBaseUrl
    : `${envBaseUrl}/api/${API_VERSION}`;

console.log('🔌 API Base URL Configured:', API_BASE);

export { API_BASE };
export const API_VERSION_TAG = API_VERSION;
