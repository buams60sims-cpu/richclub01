// Centralized API Configuration
// This file is the single source of truth for the API URL

const API_VERSION = 'v1';
let envBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Remove trailing slash if present
if (envBaseUrl.endsWith('/')) {
    envBaseUrl = envBaseUrl.slice(0, -1);
}

// If the env var ALREADY includes /api/v1, we keep it (backward compatibility)
// Otherwise we append it. This supports both:
// VITE_API_BASE_URL=https://richclub01.onrender.com (Standard)
// VITE_API_BASE_URL=https://richclub01.onrender.com/api/v1 (Legacy/Error)

const API_BASE = envBaseUrl.includes(`/api/${API_VERSION}`)
    ? envBaseUrl
    : `${envBaseUrl}/api/${API_VERSION}`;

console.log('🔌 API Base URL Configured:', API_BASE);

export { API_BASE };
export const API_VERSION_TAG = API_VERSION;
