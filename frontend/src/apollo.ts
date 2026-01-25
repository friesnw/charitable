import { ApolloClient, InMemoryCache } from '@apollo/client';

// In production, VITE_API_URL should be the full backend URL (e.g., https://backend-xxxx.onrender.com)
// In development, defaults to localhost
let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Ensure URL has protocol
if (apiUrl && !apiUrl.startsWith('http')) {
  apiUrl = `https://${apiUrl}`;
}

export const client = new ApolloClient({
  uri: apiUrl,
  cache: new InMemoryCache(),
});
