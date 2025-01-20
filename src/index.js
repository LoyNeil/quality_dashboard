import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { NavBar } from './Navbar';
import { LoadingProvider } from './ContextLoader';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LoadingProvider>
    <App />
    <NavBar />
    </LoadingProvider>
  </React.StrictMode>
);
