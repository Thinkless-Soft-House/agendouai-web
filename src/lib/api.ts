/**
 * Gets the base API URL from environment variables
 */
export const getApiUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

/**
 * Creates a full API URL by appending the path to the base URL
 */
export const getApiEndpoint = (path: string): string => {
  const baseUrl = getApiUrl();
  // Ensure path starts with a slash and base URL doesn't end with one
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const normalizedBaseUrl = baseUrl.endsWith('/') 
    ? baseUrl.slice(0, -1) 
    : baseUrl;
    
  return `${normalizedBaseUrl}${normalizedPath}`;
};
