import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import api from './api';

export default function App() {
  const [route, setRoute] = useState('onboarding'); 
  const [onboardStep, setOnboardStep] = useState(0);
  const [user, setUser] = useState(null);

  async function handleAuth(credentials) {
    try {
      const resp = await api.post('/auth/login', credentials);
      setUser(resp.user || { 
        name: resp.name || 'User',
        email: resp.email || credentials.email 
      });
      setRoute('app');
    } catch (err) {
      alert(err.message || 'Auth failed');
    }
  }

  return (
    <div className="app-root">
      {route === 'onboarding' && (
        <Onboarding
          step={onboardStep}
          setStep={setOnboardStep}
          onFinish={() => setRoute('login')}
        />
      )}

      {(route === 'login' || route === 'signup') && (
        <Auth
          mode={route}
          goToSignUp={() => setRoute('signup')}
          goToLogin={() => setRoute('login')}
          onAuth={handleAuth}
        />
      )}

      {route === 'app' && <Dashboard user={user} />}
    </div>
  );
}
