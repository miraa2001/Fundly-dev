import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AuthSessionProvider } from './lib/auth-context';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthSessionProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </AuthSessionProvider>
  </React.StrictMode>,
);
