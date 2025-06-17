import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ThoughtDetailPage } from './pages/ThoughtDetailPage';
// Import test utilities for API testing
import './utils/api-test';
// Import voice player utilities to make them globally available
import './utils/voice-player';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/thought/:id" element={<ThoughtDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;