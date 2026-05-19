/*
 * vite.config.js
 * Purpose: Configure Vite with the React plugin.
 * Why it exists: Vite needs to know how to transform JSX.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()]
});
