import React from 'react';
import './App.css';
import { NavBar } from './Navbar';
import { LoadingProfile } from './LoaderContext.js';

export default function App() {
  return (
      <div>
        <LoadingProfile>
          <h1>Quality Dashboard</h1>
          <NavBar />
        </LoadingProfile>
      </div>
  );
}
