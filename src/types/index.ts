/**
 * Type definitions for WebOS
 */

// User types
export interface User {
  id: string;
  username: string;
  roles: string[];
}

// File system types
export interface FSNode {
  id: string;
  owner_id: string;
  type: 'file' | 'folder';
  name: string;
  parent_id: string | null;
  path: string;
  content?: string;
  mime_type?: string;
  size?: number;
  created_at: string;
  updated_at: string;
}

// Desktop types
export interface IconPosition {
  node_id: string;
  x: number;
  y: number;
}

export interface WindowState {
  window_id: string;
  app: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minimized: boolean;
  maximized: boolean;
  z: number;
  data?: Record<string, unknown>;
}

export interface DesktopState {
  wallpaper: string;
  icons: IconPosition[];
  windows: WindowState[];
  settings: Record<string, unknown>;
}

// Virtual process types
export interface VirtualProcess {
  id: string;
  owner_id: string;
  app: string;
  status: 'running' | 'stopped' | 'suspended';
  cpu: number;
  mem: number;
  started_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}

// Host process types
export interface HostProcess {
  pid: number;
  name: string;
  username: string | null;
  cpu_percent: number;
  memory_percent: number;
  status: string;
  create_time: string | null;
  cmdline: string | null;
  num_threads: number;
}

export interface SystemMetrics {
  cpu_percent: number;
  memory_percent: number;
  top_processes: HostProcess[];
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// App types
export type AppType = 
  | 'file-manager'
  | 'task-manager'
  | 'editor'
  | 'settings'
  | 'terminal';

export interface AppDefinition {
  id: AppType;
  name: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
}

// WebSocket message types
export interface WSMessage {
  topic?: string;
  type?: string;
  data?: unknown;
}
