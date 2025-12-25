/**
 * OS State Management using Zustand
 */
import { create } from 'zustand';
import type { 
  User, 
  FSNode, 
  WindowState, 
  VirtualProcess, 
  SystemMetrics 
} from '../types';

interface OSState {
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Boot
  bootPhase: 'bios' | 'loading' | 'services' | 'ready' | 'done';
  bootProgress: number;
  bootMessage: string;
  
  // Desktop
  wallpaper: string;
  windows: WindowState[];
  activeWindowId: string | null;
  maxZIndex: number;
  
  // File system
  fileTree: FSNode[];
  
  // Processes
  virtualProcesses: VirtualProcess[];
  systemMetrics: SystemMetrics | null;
  
  // Settings
  theme: 'light' | 'dark';
  animations: boolean;
  
  // Actions
  setUser: (user: User | null, token: string | null) => void;
  logout: () => void;
  
  setBootPhase: (phase: OSState['bootPhase']) => void;
  setBootProgress: (progress: number, message: string) => void;
  
  setWallpaper: (wallpaper: string) => void;
  
  openWindow: (window: Omit<WindowState, 'z'>) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  updateWindowPosition: (windowId: string, x: number, y: number) => void;
  updateWindowSize: (windowId: string, w: number, h: number) => void;
  
  setFileTree: (nodes: FSNode[]) => void;
  addNode: (node: FSNode) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<FSNode>) => void;
  
  setVirtualProcesses: (processes: VirtualProcess[]) => void;
  addVirtualProcess: (process: VirtualProcess) => void;
  removeVirtualProcess: (processId: string) => void;
  
  setSystemMetrics: (metrics: SystemMetrics) => void;
  
  setTheme: (theme: 'light' | 'dark') => void;
  toggleAnimations: () => void;
  
  // Desktop state
  getDesktopState: () => {
    wallpaper: string;
    windows: WindowState[];
    settings: Record<string, unknown>;
  };
  loadDesktopState: (state: {
    wallpaper: string;
    windows: WindowState[];
    settings: Record<string, unknown>;
  }) => void;
}

export const useOSStore = create<OSState>((set, get) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  
  bootPhase: 'bios',
  bootProgress: 0,
  bootMessage: 'Initializing...',
  
  wallpaper: '/wallpapers/default.jpg',
  windows: [],
  activeWindowId: null,
  maxZIndex: 0,
  
  fileTree: [],
  
  virtualProcesses: [],
  systemMetrics: null,
  
  theme: 'dark',
  animations: true,
  
  // Auth actions
  setUser: (user, token) => set({ 
    user, 
    token, 
    isAuthenticated: !!user 
  }),
  
  logout: () => set({ 
    user: null, 
    token: null, 
    isAuthenticated: false,
    windows: [],
    fileTree: [],
    virtualProcesses: []
  }),
  
  // Boot actions
  setBootPhase: (bootPhase) => set({ bootPhase }),
  setBootProgress: (bootProgress, bootMessage) => set({ bootProgress, bootMessage }),
  
  // Desktop actions
  setWallpaper: (wallpaper) => set({ wallpaper }),
  
  openWindow: (window) => {
    const { maxZIndex, windows } = get();
    let newZ = maxZIndex + 1;
    
    // Normalize z-indexes if they get too high
    if (newZ > 10000) {
      const sortedWindows = [...windows].sort((a, b) => a.z - b.z);
      const normalizedWindows = sortedWindows.map((w, i) => ({ ...w, z: i + 1 }));
      newZ = normalizedWindows.length + 1;
      const newWindow = { ...window, z: newZ };
      set({
        windows: [...normalizedWindows, newWindow],
        activeWindowId: window.window_id,
        maxZIndex: newZ
      });
      return;
    }
    
    const newWindow = { ...window, z: newZ };
    
    set({
      windows: [...windows, newWindow],
      activeWindowId: window.window_id,
      maxZIndex: newZ
    });
  },
  
  closeWindow: (windowId) => {
    const { windows, activeWindowId } = get();
    const newWindows = windows.filter(w => w.window_id !== windowId);
    
    set({
      windows: newWindows,
      activeWindowId: activeWindowId === windowId 
        ? (newWindows.length > 0 ? newWindows[newWindows.length - 1].window_id : null)
        : activeWindowId
    });
  },
  
  minimizeWindow: (windowId) => {
    const { windows } = get();
    set({
      windows: windows.map(w => 
        w.window_id === windowId ? { ...w, minimized: true } : w
      )
    });
  },
  
  maximizeWindow: (windowId) => {
    const { windows } = get();
    set({
      windows: windows.map(w =>
        w.window_id === windowId ? { ...w, maximized: true, minimized: false } : w
      )
    });
  },
  
  restoreWindow: (windowId) => {
    const { windows, maxZIndex } = get();
    const newZ = maxZIndex + 1;
    
    set({
      windows: windows.map(w =>
        w.window_id === windowId 
          ? { ...w, minimized: false, maximized: false, z: newZ }
          : w
      ),
      activeWindowId: windowId,
      maxZIndex: newZ
    });
  },
  
  focusWindow: (windowId) => {
    const { windows, maxZIndex } = get();
    const newZ = maxZIndex + 1;
    
    set({
      windows: windows.map(w =>
        w.window_id === windowId ? { ...w, z: newZ, minimized: false } : w
      ),
      activeWindowId: windowId,
      maxZIndex: newZ
    });
  },
  
  updateWindowPosition: (windowId, x, y) => {
    const { windows } = get();
    set({
      windows: windows.map(w =>
        w.window_id === windowId ? { ...w, x, y } : w
      )
    });
  },
  
  updateWindowSize: (windowId, w, h) => {
    const { windows } = get();
    set({
      windows: windows.map(win =>
        win.window_id === windowId ? { ...win, w, h } : win
      )
    });
  },
  
  // File tree actions
  setFileTree: (nodes) => set({ fileTree: nodes }),
  
  addNode: (node) => {
    const { fileTree } = get();
    set({ fileTree: [...fileTree, node] });
  },
  
  removeNode: (nodeId) => {
    const { fileTree } = get();
    set({ fileTree: fileTree.filter(n => n.id !== nodeId) });
  },
  
  updateNode: (nodeId, updates) => {
    const { fileTree } = get();
    set({
      fileTree: fileTree.map(n =>
        n.id === nodeId ? { ...n, ...updates } : n
      )
    });
  },
  
  // Virtual process actions
  setVirtualProcesses: (processes) => set({ virtualProcesses: processes }),
  
  addVirtualProcess: (process) => {
    const { virtualProcesses } = get();
    set({ virtualProcesses: [...virtualProcesses, process] });
  },
  
  removeVirtualProcess: (processId) => {
    const { virtualProcesses } = get();
    set({ virtualProcesses: virtualProcesses.filter(p => p.id !== processId) });
  },
  
  // System metrics
  setSystemMetrics: (metrics) => set({ systemMetrics: metrics }),
  
  // Settings
  setTheme: (theme) => set({ theme }),
  toggleAnimations: () => set(state => ({ animations: !state.animations })),
  
  // Desktop state helpers
  getDesktopState: () => {
    const { wallpaper, windows, theme, animations } = get();
    return {
      wallpaper,
      windows,
      settings: { theme, animations }
    };
  },
  
  loadDesktopState: (state) => {
    const settings = state.settings as { theme?: 'light' | 'dark'; animations?: boolean };
    set({
      wallpaper: state.wallpaper,
      windows: state.windows,
      theme: settings.theme || 'dark',
      animations: settings.animations !== false
    });
  }
}));
