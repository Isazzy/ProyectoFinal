// ========================================
// src/App.jsx
// ========================================
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { AppRouter } from './router/AppRouter';

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <AppRouter />
      </UIProvider>
    </AuthProvider>
  );
}

export default App;





// ========================================
// .env.example
// ========================================
/*
# API Configuration
REACT_APP_API_URL=http://localhost:8000/api

# App Settings
REACT_APP_APP_NAME=Mi Tiempo
REACT_APP_DEFAULT_LOCALE=es-AR
*/
