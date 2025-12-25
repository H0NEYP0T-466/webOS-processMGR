/**
 * API client for WebOS backend
 */

const API_URL = import.meta.env.VITE_API_URL || '';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const data = await this.request<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.token = data.access_token;
    return data;
  }

  async register(username: string, password: string) {
    const data = await this.request<{ access_token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.token = data.access_token;
    return data;
  }

  async getMe() {
    return this.request<{ id: string; username: string; roles: string[] }>('/auth/me');
  }

  // File endpoints
  async getFileTree() {
    return this.request<{ nodes: Array<{
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
    }> }>('/files/tree');
  }

  async createFolder(name: string, parent_id?: string) {
    return this.request('/files/folder', {
      method: 'POST',
      body: JSON.stringify({ name, parent_id }),
    });
  }

  async createFile(name: string, parent_id?: string, content = '', mime_type = 'text/plain') {
    return this.request('/files/file', {
      method: 'POST',
      body: JSON.stringify({ name, parent_id, content, mime_type }),
    });
  }

  async getNode(nodeId: string) {
    return this.request(`/files/node/${nodeId}`);
  }

  async updateNode(nodeId: string, data: { name?: string; parent_id?: string; content?: string }) {
    return this.request(`/files/node/${nodeId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteNode(nodeId: string) {
    return this.request(`/files/node/${nodeId}`, {
      method: 'DELETE',
    });
  }

  // Desktop state endpoints
  async getDesktopState() {
    return this.request<{
      id: string;
      owner_id: string;
      wallpaper: string;
      icons: Array<{ node_id: string; x: number; y: number }>;
      windows: Array<{
        window_id: string;
        app: string;
        x: number;
        y: number;
        w: number;
        h: number;
        minimized: boolean;
        maximized: boolean;
        z: number;
      }>;
      settings: Record<string, unknown>;
    }>('/desktop/state');
  }

  async updateDesktopState(state: {
    wallpaper: string;
    icons: Array<{ node_id: string; x: number; y: number }>;
    windows: Array<{
      window_id: string;
      app: string;
      x: number;
      y: number;
      w: number;
      h: number;
      minimized: boolean;
      maximized: boolean;
      z: number;
    }>;
    settings: Record<string, unknown>;
  }) {
    return this.request('/desktop/state', {
      method: 'PUT',
      body: JSON.stringify(state),
    });
  }

  // Virtual process endpoints
  async listVirtualProcesses() {
    return this.request<{ processes: Array<{
      id: string;
      owner_id: string;
      app: string;
      status: 'running' | 'stopped' | 'suspended';
      cpu: number;
      mem: number;
      started_at: string;
      updated_at: string;
      metadata: Record<string, unknown>;
    }> }>('/vproc/list');
  }

  async startVirtualProcess(app: string, metadata?: Record<string, unknown>) {
    return this.request('/vproc/start', {
      method: 'POST',
      body: JSON.stringify({ app, metadata }),
    });
  }

  async stopVirtualProcess(processId: string) {
    return this.request(`/vproc/stop/${processId}`, {
      method: 'POST',
    });
  }

  async deleteVirtualProcess(processId: string) {
    return this.request(`/vproc/${processId}`, {
      method: 'DELETE',
    });
  }

  // Host process endpoints
  async listHostProcesses() {
    return this.request<{ processes: Array<{
      pid: number;
      name: string;
      username: string | null;
      cpu_percent: number;
      memory_percent: number;
      status: string;
      create_time: string | null;
      cmdline: string | null;
      num_threads: number;
    }> }>('/hproc/list');
  }

  async getHostMetrics() {
    return this.request<{
      cpu_percent: number;
      memory_percent: number;
      top_processes: Array<{
        pid: number;
        name: string;
        username: string | null;
        cpu_percent: number;
        memory_percent: number;
        status: string;
        create_time: string | null;
        cmdline: string | null;
        num_threads: number;
      }>;
    }>('/hproc/metrics');
  }

  async terminateHostProcess(pid: number) {
    return this.request<{ pid: number; success: boolean; message: string }>(
      `/hproc/terminate/${pid}`,
      { method: 'POST' }
    );
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export const api = new ApiClient();
