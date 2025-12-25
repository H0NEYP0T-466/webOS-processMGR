/**
 * Login Screen Component
 */
import { useState } from 'react';
import { api } from '../../services/api';
import { wsClient } from '../../services/ws';
import { useOSStore } from '../../state/osStore';
import './Login.css';

interface LoginProps {
  onSuccess: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const setUser = useOSStore(state => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        await api.register(username, password);
      } else {
        await api.login(username, password);
      }
      
      // Get user info
      const user = await api.getMe();
      const token = api.getToken();
      
      // Set up WebSocket
      wsClient.setToken(token);
      try {
        await wsClient.connect();
      } catch {
        console.warn('WebSocket connection failed, continuing without real-time updates');
      }
      
      // Update store
      setUser(user, token);
      
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="user-avatar">👤</div>
            <h2>{isRegistering ? 'Create Account' : 'Welcome'}</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner">⟳</span>
              ) : (
                isRegistering ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <button 
            className="toggle-mode"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
          >
            {isRegistering 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Create one"}
          </button>
        </div>

        <div className="login-footer">
          <p>WebOS v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
