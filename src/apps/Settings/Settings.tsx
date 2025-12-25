/**
 * Settings App
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOSStore } from '../../state/osStore';
import './Settings.css';

const WALLPAPERS = [
  { id: 'default', url: '/wallpapers/default.jpg', name: 'Default' },
  { id: 'gradient1', url: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)', name: 'Dark Gradient' },
  { id: 'gradient2', url: 'linear-gradient(135deg, #1a1a2e 0%, #2d132c 50%, #1a1a2e 100%)', name: 'Purple Night' },
  { id: 'gradient3', url: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', name: 'Ocean' },
  { id: 'gradient4', url: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)', name: 'Deep Blue' },
];

export function Settings() {
  const { theme, animations, wallpaper, setTheme, toggleAnimations, setWallpaper, user } = useOSStore();
  const [activeSection, setActiveSection] = useState('appearance');

  return (
    <div className="settings">
      {/* Sidebar */}
      <div className="settings-sidebar">
        <button 
          className={activeSection === 'appearance' ? 'active' : ''}
          onClick={() => setActiveSection('appearance')}
        >
          🎨 Appearance
        </button>
        <button 
          className={activeSection === 'performance' ? 'active' : ''}
          onClick={() => setActiveSection('performance')}
        >
          ⚡ Performance
        </button>
        <button 
          className={activeSection === 'account' ? 'active' : ''}
          onClick={() => setActiveSection('account')}
        >
          👤 Account
        </button>
        <button 
          className={activeSection === 'about' ? 'active' : ''}
          onClick={() => setActiveSection('about')}
        >
          ℹ️ About
        </button>
      </div>

      {/* Content */}
      <div className="settings-content">
        {activeSection === 'appearance' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="settings-section"
          >
            <h2>Appearance</h2>
            
            <div className="setting-group">
              <h3>Theme</h3>
              <div className="theme-selector">
                <button 
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <span className="theme-icon">🌙</span>
                  <span>Dark</span>
                </button>
                <button 
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <span className="theme-icon">☀️</span>
                  <span>Light</span>
                </button>
              </div>
            </div>

            <div className="setting-group">
              <h3>Wallpaper</h3>
              <div className="wallpaper-grid">
                {WALLPAPERS.map(wp => (
                  <button
                    key={wp.id}
                    className={`wallpaper-option ${wallpaper === wp.url ? 'active' : ''}`}
                    onClick={() => setWallpaper(wp.url)}
                    style={{ 
                      background: wp.url.startsWith('linear') ? wp.url : `url(${wp.url})`,
                      backgroundSize: 'cover'
                    }}
                  >
                    {wallpaper === wp.url && <span className="check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'performance' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="settings-section"
          >
            <h2>Performance</h2>
            
            <div className="setting-group">
              <div className="setting-row">
                <div className="setting-info">
                  <h4>Animations</h4>
                  <p>Enable smooth animations and transitions</p>
                </div>
                <button 
                  className={`toggle ${animations ? 'active' : ''}`}
                  onClick={toggleAnimations}
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'account' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="settings-section"
          >
            <h2>Account</h2>
            
            <div className="account-info">
              <div className="account-avatar">👤</div>
              <div className="account-details">
                <h3>{user?.username}</h3>
                <p>Roles: {user?.roles.length ? user.roles.join(', ') : 'Standard user'}</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'about' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="settings-section"
          >
            <h2>About WebOS</h2>
            
            <div className="about-info">
              <div className="about-logo">⚡</div>
              <h3>WebOS</h3>
              <p className="version">Version 1.0.0</p>
              <p className="description">
                A web-based operating system with process monitoring, 
                virtual file system, and rich desktop experience.
              </p>
              
              <div className="tech-stack">
                <h4>Built with</h4>
                <ul>
                  <li>React + TypeScript</li>
                  <li>FastAPI + Python</li>
                  <li>MongoDB</li>
                  <li>WebSockets</li>
                  <li>Framer Motion</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
