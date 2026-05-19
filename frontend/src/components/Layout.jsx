/*
 * Layout.jsx
 * Purpose: Provide a shared layout with a navigation bar.
 * Why it exists: It keeps the UI consistent across pages.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';

const linkBase =
  'px-3 py-2 rounded text-sm font-medium hover:bg-slate-200 transition';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-lg font-semibold">Logistics Manager</p>
            <p className="text-xs text-slate-500">Simple interview-ready project</p>
          </div>
          <nav className="flex gap-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/shipments/new"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700'}`
              }
            >
              Create Shipment
            </NavLink>
            <NavLink
              to="/tracking"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700'}`
              }
            >
              Tracking
            </NavLink>
            <NavLink
              to="/inventory"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700'}`
              }
            >
              Inventory
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
