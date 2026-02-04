import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// הסרנו את הייבוא של ה-CSS כי הקובץ לא קיים והייתה בו טעות כתיב

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);