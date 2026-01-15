// Axios Guard - Prevents creation of rogue axios instances
// This is a development safety net to catch violations of the "single API client" rule

import axios from 'axios';

if (import.meta.env.DEV) {
    const originalCreate = axios.create;

    axios.create = function (...args) {
        console.error('❌ ILLEGAL AXIOS INSTANCE DETECTED!');
        console.error('📍 All API calls MUST use the centralized client from utils/api.js');
        console.trace('Stack trace:');
        return originalCreate.apply(this, args);
    };
}

export default axios;
