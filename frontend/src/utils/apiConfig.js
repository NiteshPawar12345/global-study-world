// API Configuration with production URL and localhost fallback
const PRODUCTION_URL = 'https://backend.globalstudyworld.com';
const LOCAL_URL = 'http://localhost:5000';

// Cache for the API base URL
let cachedApiBase = null;

// Get API base URL - tries production first, falls back to localhost
export const getApiBase = () => {
  // Return cached value if available
  if (cachedApiBase) {
    return cachedApiBase;
  }

  // Check if we're in development mode (localhost)
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // In development, prefer localhost; otherwise use production
  // But allow override via localStorage
  const overrideUrl = localStorage.getItem('api_base_url');
  if (overrideUrl) {
    cachedApiBase = overrideUrl;
    return overrideUrl;
  }

  // Default: use production in production, localhost in development
  cachedApiBase = isDevelopment ? LOCAL_URL : PRODUCTION_URL;
  return cachedApiBase;
};

// Helper function to make API calls with automatic fallback
export const apiFetch = async (endpoint, options = {}) => {
  const baseUrl = getApiBase();
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    // If production fails and we're using production, try localhost
    if (baseUrl === PRODUCTION_URL && !localStorage.getItem('api_base_url')) {
      console.warn('Production API failed, trying localhost fallback...');
      cachedApiBase = LOCAL_URL;
      const fallbackUrl = `${LOCAL_URL}${endpoint}`;
      return fetch(fallbackUrl, options);
    }
    throw error;
  }
};

// Reset cache (useful for testing or manual override)
export const resetApiCache = () => {
  cachedApiBase = null;
};

