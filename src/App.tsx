/**
 * WebOS - Web-based Operating System
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Boot } from './os/Boot';
import { Login } from './os/Login';
import { Desktop } from './os/Desktop';
import { Shutdown } from './os/Shutdown';
import { useOSStore } from './state/osStore';
import { api } from './services/api';
import { wsClient } from './services/ws';
import './App.css';

type AppPhase = 'boot' | 'login' | 'desktop' | 'shutdown';

function App() {
  const [internalPhase, setInternalPhase] = useState<AppPhase>('boot');
  const { isAuthenticated, setUser, token, theme, systemState, setSystemState } = useOSStore();

  // Compute effective phase: system state (shutdown/restarting) takes precedence over internal phase
  const phase = useMemo((): AppPhase => {
    if (systemState === 'shutdown') {
      return 'shutdown';
    }
    if (systemState === 'restarting') {
      return 'boot';
    }
    return internalPhase;
  }, [systemState, internalPhase]);

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
  const handleBootComplete = useCallback(() => {
    // Reset system state if we were restarting
    if (systemState === 'restarting') {
      setSystemState('running');
    }
    
    if (isAuthenticated) {
      setInternalPhase('desktop');
    } else {
      setInternalPhase('login');
    }
  }, [isAuthenticated, systemState, setSystemState]);

  // Handle login success
  const handleLoginSuccess = useCallback(() => {
    setInternalPhase('desktop');
  }, []);

  // Handle boot up from shutdown state
  const handleBootUp = useCallback(() => {
    setSystemState('running');
    setInternalPhase('boot');
  }, [setSystemState]);

  // Render based on phase
  if (phase === 'shutdown') {
    return <Shutdown onBootUp={handleBootUp} />;
  }

  if (phase === 'boot') {
    return <Boot onComplete={handleBootComplete} skipBoot={false} />;
  }

  if (!isAuthenticated) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  return <Desktop />;
}

export default App;
