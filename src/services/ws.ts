/**
 * WebSocket client for real-time updates
 */

// Use relative WebSocket URL with current host, or override with environment variable
const WS_URL = import.meta.env.VITE_WS_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

type MessageHandler = (data: unknown) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.token) {
        reject(new Error('No token set'));
        return;
      }

      const url = `${WS_URL}?token=${encodeURIComponent(this.token)}`;
      
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private handleMessage(message: { topic?: string; type?: string; data?: unknown }) {
    const { topic, type } = message;

    // Handle specific message types
    if (type === 'subscribed' || type === 'unsubscribed' || type === 'pong') {
      return;
    }

    // Route to topic handlers
    if (topic) {
      const topicHandlers = this.handlers.get(topic);
      if (topicHandlers) {
        topicHandlers.forEach(handler => handler(message.data));
      }
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      // Capped exponential backoff: max 30 seconds
      const maxDelay = 30000;
      const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), maxDelay);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, delay);
    }
  }

  subscribe(topic: string, handler: MessageHandler) {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());
    }
    this.handlers.get(topic)!.add(handler);

    // Send subscribe message to server
    this.send({ action: 'subscribe', topic });

    // Return unsubscribe function
    return () => {
      this.unsubscribe(topic, handler);
    };
  }

  unsubscribe(topic: string, handler: MessageHandler) {
    const topicHandlers = this.handlers.get(topic);
    if (topicHandlers) {
      topicHandlers.delete(handler);
      
      if (topicHandlers.size === 0) {
        this.handlers.delete(topic);
        this.send({ action: 'unsubscribe', topic });
      }
    }
  }

  send(data: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  ping() {
    this.send({ action: 'ping' });
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new WebSocketClient();

// WebSocket topics
export const WS_TOPICS = {
  METRICS_HOST: 'metrics.host',
  VPROC_EVENTS: 'vproc.events',
  FS_EVENTS: 'fs.events',
} as const;
