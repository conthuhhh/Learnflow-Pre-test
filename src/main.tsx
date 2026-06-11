import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Apply saved theme before first render (avoids flash of wrong theme)
const savedTheme = (() => {
  try {
    const raw = localStorage.getItem('learnflow-theme');
    if (raw) return (JSON.parse(raw) as { state?: { theme?: string } }).state?.theme;
  } catch { /* ignore */ }
  return null;
})();

if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
