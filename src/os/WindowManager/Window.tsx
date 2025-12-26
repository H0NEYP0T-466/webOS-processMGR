/**
 * Window Component - Draggable, Resizable Window
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOSStore } from '../../state/osStore';
import { api } from '../../services/api';
import type { WindowState } from '../../types';
import './Window.css';

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
  title: string;
  icon?: string;
}

export function Window({ window: win, children, title, icon = '📁' }: WindowProps) {
  const { 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow, 
    restoreWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    activeWindowId
  } = useOSStore();
  
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [windowStart, setWindowStart] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const isActive = activeWindowId === win.window_id;

  const handleClose = useCallback(async () => {
    // Find and delete the virtual process associated with this window.
    // We fetch directly from API to ensure we have the latest process list,
    // since the Zustand store may not have up-to-date process information.
    try {
      const data = await api.listVirtualProcesses();
      // First try to find by exact window_id match (stored in metadata when process was started)
      let process = data.processes.find(
        p => p.metadata?.window_id === win.window_id
      );
      // Fallback: if no exact match and there's exactly one process for this app,
      // it must be the one associated with this window (safe to delete).
      // This handles legacy processes that may not have window_id in metadata.
      if (!process) {
        const appProcesses = data.processes.filter(p => p.app === win.app);
        if (appProcesses.length === 1) {
          process = appProcesses[0];
        }
      }
      if (process) {
        // Delete the process entirely so it doesn't show up in task manager
        await api.deleteVirtualProcess(process.id);
      }
    } catch (error) {
      console.error('Failed to delete virtual process:', error);
    }
    closeWindow(win.window_id);
  }, [closeWindow, win.window_id, win.app]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    focusWindow(win.window_id);
  }, [focusWindow, win.window_id]);

  const handleTitleBarMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    if (win.maximized) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setWindowStart({ x: win.x, y: win.y, w: win.w, h: win.h });
  }, [win.maximized, win.x, win.y, win.w, win.h]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (win.maximized) return;
    
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setWindowStart({ x: win.x, y: win.y, w: win.w, h: win.h });
  }, [win.maximized, win.x, win.y, win.w, win.h]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        updateWindowPosition(win.window_id, windowStart.x + dx, Math.max(0, windowStart.y + dy));
      }
      
      if (isResizing) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        updateWindowSize(
          win.window_id, 
          Math.max(300, windowStart.w + dx), 
          Math.max(200, windowStart.h + dy)
        );
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, windowStart, win.window_id, updateWindowPosition, updateWindowSize]);

  if (win.minimized) {
    return null;
  }

  const style: React.CSSProperties = win.maximized
    ? {
        left: 0,
        top: 0,
        width: '100%',
        height: 'calc(100% - 48px)',
        zIndex: win.z,
      }
    : {
        left: win.x,
        top: win.y,
        width: win.w,
        height: win.h,
        zIndex: win.z,
      };

  return (
    <motion.div
      ref={windowRef}
      className={`window ${isActive ? 'active' : ''} ${win.maximized ? 'maximized' : ''}`}
      style={style}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.15 }}
      onMouseDown={handleMouseDown}
    >
      <div 
        className="window-title-bar"
        onMouseDown={handleTitleBarMouseDown}
        onDoubleClick={() => win.maximized ? restoreWindow(win.window_id) : maximizeWindow(win.window_id)}
      >
        <div className="window-title">
          <span className="window-icon">{icon}</span>
          <span className="window-title-text">{title}</span>
        </div>
        <div className="window-controls">
          <button 
            className="window-control minimize"
            onClick={() => minimizeWindow(win.window_id)}
          >
            −
          </button>
          <button 
            className="window-control maximize"
            onClick={() => win.maximized ? restoreWindow(win.window_id) : maximizeWindow(win.window_id)}
          >
            {win.maximized ? '❐' : '□'}
          </button>
          <button 
            className="window-control close"
            onClick={handleClose}
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="window-content">
        {children}
      </div>
      
      {!win.maximized && (
        <div 
          className="window-resize-handle"
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </motion.div>
  );
}
