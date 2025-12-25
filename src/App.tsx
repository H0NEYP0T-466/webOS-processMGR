/**
 * WebOS - Web-based Operating System
 */
import { useState, useEffect } from 'react';
import { Boot } from './os/Boot';
import { Login } from './os/Login';
import { Desktop } from './os/Desktop';
import { useOSStore } from './state/osStore';
import { api } from './services/api';
import { wsClient } from './services/ws';
import './App.css';

type AppPhase = 'boot' | 'login' | 'desktop';

function App() {
  const [phase, setPhase] = useState<AppPhase>('boot');
  const { isAuthenticated, setUser, token, theme } = useOSStore();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('webos_token');
    if (storedToken) {
      api.setToken(storedToken);
      wsClient.setToken(storedToken);
      
      // Verify token is still valid
      api.getMe()
        .then(user => {
          setUser(user, storedToken);
          wsClient.connect().catch(console.error);
        })
        .catch(() => {
          localStorage.removeItem('webos_token');
        });
    }
  }, [setUser]);

  // Save token to localStorage when it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('webos_token', token);
    } else {
      localStorage.removeItem('webos_token');
    }
  }, [token]);

  // Handle boot complete
  const handleBootComplete = () => {
    if (isAuthenticated) {
      setPhase('desktop');
    } else {
      setPhase('login');
    }
  };

  // Handle login success
  const handleLoginSuccess = () => {
    setPhase('desktop');
  };

  // Render based on phase
  if (phase === 'boot') {
    return <Boot onComplete={handleBootComplete} skipBoot={false} />;
  }

  if (phase === 'login' && !isAuthenticated) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  return <Desktop />;
}

export default App;
