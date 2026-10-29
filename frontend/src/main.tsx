import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { IoTProvider } from './context/IoTContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <IoTProvider>
          <App />
        </IoTProvider>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);
