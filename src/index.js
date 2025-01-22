import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LoadingProfile } from './LoaderContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <LoadingProfile>
    <App />
  </LoadingProfile>
);
