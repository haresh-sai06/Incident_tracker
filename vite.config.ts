
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // FIX: __dirname is not available in ES modules.
      // The line below uses import.meta.url to get the current module's URL,
      // converts it to a file path, gets the directory name, and resolves it
      // to create an absolute path for the '@' alias, pointing to the project root.
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), './'),
    },
  },
});
