/*
 * App.jsx
 * Purpose: Set up routes and the main layout for the React app.
 * Why it exists: Routing keeps each page focused and beginner friendly.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CreateShipment from './pages/CreateShipment.jsx';
import Tracking from './pages/Tracking.jsx';
import Inventory from './pages/Inventory.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/shipments/new" element={<CreateShipment />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/inventory" element={<Inventory />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
