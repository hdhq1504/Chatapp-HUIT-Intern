import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';

const initTheme = () => {
  try {
    const saved = localStorage.getItem('theme');
    const prefersDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (saved !== 'light' && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
  } catch {
    console.log('Error initializing theme');
  }
};

initTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
