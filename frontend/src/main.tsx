import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { client } from './lib/apollo';
import { AuthProvider } from './context/AuthContext';
import { router } from './routes';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
);
