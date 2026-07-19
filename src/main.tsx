import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LocaleProvider, detectLocale, saveLocale } from './i18n';
import './index.css';

function Bootstrap() {
  useEffect(() => {
    saveLocale(detectLocale());
  }, []);

  return (
    <LocaleProvider>
      <App />
    </LocaleProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Bootstrap />
  </StrictMode>,
);
