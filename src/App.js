import React from 'react';
import './App.css';
import { NavBar } from './Navbar';
import { LoadingProfile } from './LoaderContext.js';
import Loader from './Loader';

export default function App() {
  return (
      <div>
        <LoadingProfile>
          <h1>Quality Dashboard</h1>
          <NavBar />
          <Loader />
        </LoadingProfile>
      </div>
  );
}
