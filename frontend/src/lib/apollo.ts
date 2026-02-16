import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// In production, VITE_API_URL should be the full backend URL (e.g., https://backend-xxxx.onrender.com)
// In development, defaults to localhost
let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Ensure URL has protocol
if (apiUrl && !apiUrl.startsWith('http')) {
  apiUrl = `https://${apiUrl}`;
}

const httpLink = createHttpLink({
  uri: `${apiUrl}/graphql`,
});

// Auth link that adds JWT to requests
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('auth_token');

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const client = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
