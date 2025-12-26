/**
 * Desktop Component - Main desktop environment
 */
import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '../../state/osStore';
import { api } from '../../services/api';
import { WindowManager } from '../WindowManager';
import './Desktop.css';

const APPS = [
  { id: 'file-manager', name: 'Files', icon: '📁' },
  { id: 'task-manager', name: 'Task Manager', icon: '📊' },
  { id: 'editor', name: 'Editor', icon: '📝' },
  { id: 'settings', name: 'Settings', icon: '⚙️' },
];

export function Desktop() {
  const { 
    user,
    wallpaper, 
    windows,
    systemMetrics,
    openWindow, 
    loadDesktopState,
    getDesktopState,
    logout,
    shutdown,
    restart
  } = useOSStore();
  
  const [showAppLauncher, setShowAppLauncher] = useState(false);
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const [time, setTime] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);

  // Load desktop state on mount (only wallpaper and settings, not previous windows)
  useEffect(() => {
    const loadState = async () => {
      try {
        // Clear all stale virtual processes from previous sessions
        // This ensures Task Manager only shows currently running processes
        try {
          await api.clearAllVirtualProcesses();
        } catch (clearError) {
          // Log but don't block desktop loading - stale processes are not critical
          console.warn('Failed to clear stale virtual processes:', clearError);
        }
        
        const state = await api.getDesktopState();
        loadDesktopState({
          wallpaper: state.wallpaper,
          windows: [], // Don't restore previous windows - start fresh
          settings: state.settings
        });
      } catch (error) {
        console.error('Failed to load desktop state:', error);
      }
    };
    loadState();
  }, [loadDesktopState]);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-save desktop state (debounced)
  useEffect(() => {
    const saveState = async () => {
      try {
        const state = getDesktopState();
        await api.updateDesktopState({
          ...state,
          icons: []
        });
      } catch (error) {
        console.error('Failed to save desktop state:', error);
      }
    };

    const timeout = setTimeout(saveState, 2000);
    return () => clearTimeout(timeout);
  }, [windows, wallpaper, getDesktopState]);

  // Save state before action
  const saveStateBeforeAction = useCallback(async () => {
    setIsSaving(true);
    try {
      const state = getDesktopState();
      await api.updateDesktopState({
        ...state,
        icons: []
      });
      // Clean up virtual processes to ensure fresh state on next session
      await api.clearAllVirtualProcesses();
    } catch (error) {
      console.error('Failed to save state:', error);
    } finally {
      setIsSaving(false);
    }
  }, [getDesktopState]);

  const handleOpenApp = useCallback(async (appId: string) => {
    const existingWindow = windows.find(w => w.app === appId);
    
    if (existingWindow) {
      useOSStore.getState().focusWindow(existingWindow.window_id);
      return;
    }

    const windowId = `${appId}-${Date.now()}`;
    
    // Start a virtual process for this app
    try {
      await api.startVirtualProcess(appId, { window_id: windowId });
    } catch (error) {
      console.error('Failed to start virtual process:', error);
    }

    openWindow({
      window_id: windowId,
      app: appId,
      x: 100 + Math.random() * 100,
      y: 50 + Math.random() * 100,
      w: appId === 'task-manager' ? 900 : 800,
      h: appId === 'task-manager' ? 600 : 500,
      minimized: false,
      maximized: false,
    });
    
    setShowAppLauncher(false);
  }, [windows, openWindow]);

  const handleLogout = useCallback(async () => {
    setShowPowerMenu(false);
    await saveStateBeforeAction();
    logout();
  }, [logout, saveStateBeforeAction]);

  const handleShutdown = useCallback(async () => {
    setShowPowerMenu(false);
    await saveStateBeforeAction();
    shutdown();
  }, [shutdown, saveStateBeforeAction]);

  const handleRestart = useCallback(async () => {
    setShowPowerMenu(false);
    await saveStateBeforeAction();
    restart();
  }, [restart, saveStateBeforeAction]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Determine wallpaper style - gradient or image
  const wallpaperStyle = wallpaper.startsWith('linear-gradient') || wallpaper.startsWith('radial-gradient')
    ? { background: wallpaper }
    : { backgroundImage: `url(${wallpaper})` };

  return (
    <div 
      className="desktop"
      style={wallpaperStyle}
    >
      {/* Saving overlay */}
      <AnimatePresence>
        {isSaving && (
          <motion.div
            className="saving-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="saving-content">
              <span className="saving-spinner">⟳</span>
              <span>Saving state...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Icons */}
      <div className="desktop-icons">
        {APPS.map((app, index) => (
          <motion.div
            key={app.id}
            className="desktop-icon"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            onDoubleClick={() => handleOpenApp(app.id)}
          >
            <div className="icon-image">{app.icon}</div>
            <span className="icon-label">{app.name}</span>
          </motion.div>
        ))}
      </div>

      {/* Window Manager */}
      <WindowManager />

      {/* Taskbar */}
      <motion.div 
        className="taskbar"
        initial={{ y: 48 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* App Launcher */}
        <div className="taskbar-left">
          <button 
            className="app-launcher-btn"
            onClick={() => setShowAppLauncher(!showAppLauncher)}
          >
            ⚡
          </button>
          
          {/* Open Windows */}
          <div className="taskbar-windows">
            {windows.map(win => {
              const app = APPS.find(a => a.id === win.app);
              return (
                <button
                  key={win.window_id}
                  className={`taskbar-window-btn ${win.minimized ? 'minimized' : ''}`}
                  onClick={() => {
                    if (win.minimized) {
                      useOSStore.getState().restoreWindow(win.window_id);
                    } else {
                      useOSStore.getState().focusWindow(win.window_id);
                    }
                  }}
                >
                  <span className="taskbar-window-icon">{app?.icon || '📄'}</span>
                  <span className="taskbar-window-name">{app?.name || win.app}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* System Tray */}
        <div className="taskbar-right">
          {systemMetrics && (
            <div className="system-metrics">
              <span className="metric">CPU: {systemMetrics.cpu_percent.toFixed(0)}%</span>
              <span className="metric">MEM: {systemMetrics.memory_percent.toFixed(0)}%</span>
            </div>
          )}
          
          <div className="user-info">
            <span className="username">👤 {user?.username}</span>
          </div>
          
          {/* Power button */}
          <button 
            className="power-btn"
            onClick={() => setShowPowerMenu(!showPowerMenu)}
            title="Power options"
          >
            ⏻
          </button>
          
          <div className="clock">
            <span className="time">{formatTime(time)}</span>
            <span className="date">{formatDate(time)}</span>
          </div>
        </div>
      </motion.div>

      {/* Power Menu */}
      <AnimatePresence>
        {showPowerMenu && (
          <motion.div 
            className="power-menu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <button className="power-menu-item" onClick={handleLogout}>
              <span className="power-menu-icon">🚪</span>
              <span className="power-menu-text">Logout</span>
              <span className="power-menu-hint">Save state & sign out</span>
            </button>
            <button className="power-menu-item" onClick={handleRestart}>
              <span className="power-menu-icon">🔄</span>
              <span className="power-menu-text">Restart</span>
              <span className="power-menu-hint">Save state & reboot</span>
            </button>
            <button className="power-menu-item danger" onClick={handleShutdown}>
              <span className="power-menu-icon">⏻</span>
              <span className="power-menu-text">Shutdown</span>
              <span className="power-menu-hint">Save state & power off</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Launcher Popup */}
      <AnimatePresence>
        {showAppLauncher && (
          <motion.div 
            className="app-launcher"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="launcher-header">
              <h3>Applications</h3>
            </div>
            <div className="launcher-apps">
              {APPS.map(app => (
                <button
                  key={app.id}
                  className="launcher-app"
                  onClick={() => handleOpenApp(app.id)}
                >
                  <span className="launcher-app-icon">{app.icon}</span>
                  <span className="launcher-app-name">{app.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click backdrop to close menus */}
      {(showAppLauncher || showPowerMenu) && (
        <div 
          className="launcher-backdrop"
          onClick={() => {
            setShowAppLauncher(false);
            setShowPowerMenu(false);
          }}
        />
      )}
    </div>
  );
}
