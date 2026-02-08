/**
 * Webhook Manager
 * System for integrating Census data with external services
 * Supports: Slack, Discord, custom REST APIs, Google Sheets, etc.
 */

export type WebhookEvent =
  | 'detection'          // New entity detection
  | 'trend_change'       // Significant trend shift
  | 'anomaly'            // Unusual pattern detected
  | 'alert'              // Emergency alert (fire, etc)
  | 'insight'            // New business insight
  | 'zone_status';       // Zone status update

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: WebhookEvent[];
  active: boolean;
  headers?: Record<string, string>;
  retryCount: number;
  retryDelay: number; // milliseconds
  timeout: number;
  metadata?: Record<string, any>;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: number;
  source: 'census';
  data: Record<string, any>;
}

export interface WebhookLog {
  id: string;
  endpointId: string;
  event: WebhookEvent;
  payload: WebhookPayload;
  status: 'success' | 'failed' | 'retrying';
  statusCode?: number;
  error?: string;
  timestamp: number;
  duration: number; // milliseconds
}

export class WebhookManager {
  private endpoints: Map<string, WebhookEndpoint> = new Map();
  private logs: WebhookLog[] = [];
  private readonly maxLogs = 1000;

  /**
   * Register a new webhook endpoint
   */
  registerEndpoint(endpoint: Omit<WebhookEndpoint, 'id'>): WebhookEndpoint {
    const id = Math.random().toString(36).substring(7);
    const full: WebhookEndpoint = { ...endpoint, id };
    this.endpoints.set(id, full);
    this.persistEndpoints();
    return full;
  }

  /**
   * Remove a webhook endpoint
   */
  unregisterEndpoint(id: string): void {
    this.endpoints.delete(id);
    this.persistEndpoints();
  }

  /**
   * Trigger a webhook event
   */
  async triggerEvent(event: WebhookEvent, data: Record<string, any>): Promise<void> {
    const payload: WebhookPayload = {
      event,
      timestamp: Date.now(),
      source: 'census',
      data,
    };

    const endpoints = Array.from(this.endpoints.values()).filter(
      ep => ep.active && ep.events.includes(event)
    );

    // Trigger all endpoints in parallel
    await Promise.all(endpoints.map(ep => this.sendWebhook(ep, payload)));
  }

  /**
   * Send webhook with retry logic
   */
  private async sendWebhook(endpoint: WebhookEndpoint, payload: WebhookPayload): Promise<void> {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < endpoint.retryCount) {
      try {
        const startTime = Date.now();

        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Census-Signature': this.generateSignature(payload),
            ...endpoint.headers,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(endpoint.timeout),
        });

        const duration = Date.now() - startTime;

        if (response.ok) {
          this.logWebhook({
            id: Math.random().toString(36).substring(7),
            endpointId: endpoint.id,
            event: payload.event,
            payload,
            status: 'success',
            statusCode: response.status,
            timestamp: Date.now(),
            duration,
          });
          return;
        } else {
          lastError = new Error(`HTTP ${response.status}`);
        }
      } catch (err) {
        lastError = err as Error;
      }

      attempt++;
      if (attempt < endpoint.retryCount) {
        await new Promise(resolve => setTimeout(resolve, endpoint.retryDelay));
      }
    }

    // All retries exhausted
    this.logWebhook({
      id: Math.random().toString(36).substring(7),
      endpointId: endpoint.id,
      event: payload.event,
      payload,
      status: 'failed',
      error: lastError?.message || 'Unknown error',
      timestamp: Date.now(),
      duration: 0,
    });
  }

  /**
   * Log webhook attempt
   */
  private logWebhook(log: WebhookLog): void {
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  /**
   * Get webhook logs
   */
  getLogs(endpointId?: string, limit: number = 50): WebhookLog[] {
    let filtered = this.logs;
    if (endpointId) {
      filtered = filtered.filter(log => log.endpointId === endpointId);
    }
    return filtered.slice(0, limit);
  }

  /**
   * Get endpoint status/stats
   */
  getEndpointStats(endpointId: string) {
    const logs = this.logs.filter(log => log.endpointId === endpointId);
    const successful = logs.filter(log => log.status === 'success').length;
    const failed = logs.filter(log => log.status === 'failed').length;
    const avgDuration =
      logs.length > 0 ? logs.reduce((sum, log) => sum + log.duration, 0) / logs.length : 0;

    return {
      total: logs.length,
      successful,
      failed,
      successRate: logs.length > 0 ? (successful / logs.length) * 100 : 0,
      avgDuration,
      lastAttempt: logs[0]?.timestamp || null,
    };
  }

  /**
   * Generate HMAC signature for webhook verification
   */
  private generateSignature(payload: WebhookPayload): string {
    // In production, use actual HMAC-SHA256 signing
    const str = JSON.stringify(payload);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return 'sig_' + Math.abs(hash).toString(16);
  }

  /**
   * Persist endpoints to localStorage
   */
  private persistEndpoints(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = Array.from(this.endpoints.values());
      window.localStorage.setItem('census.webhooks.v1', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to persist webhooks:', err);
    }
  }

  /**
   * Load endpoints from localStorage
   */
  loadEndpoints(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = window.localStorage.getItem('census.webhooks.v1');
      if (data) {
        const endpoints = JSON.parse(data) as WebhookEndpoint[];
        endpoints.forEach(ep => this.endpoints.set(ep.id, ep));
      }
    } catch (err) {
      console.error('Failed to load webhooks:', err);
    }
  }

  /**
   * Get all endpoints
   */
  getEndpoints(): WebhookEndpoint[] {
    return Array.from(this.endpoints.values());
  }
}

/**
 * Pre-built integrations
 */
export const WEBHOOK_TEMPLATES = {
  slack: (webhookUrl: string): Omit<WebhookEndpoint, 'id'> => ({
    url: webhookUrl,
    events: ['alert', 'insight', 'anomaly'],
    active: true,
    headers: {
      'X-Integration': 'slack',
    },
    retryCount: 3,
    retryDelay: 1000,
    timeout: 10000,
  }),

  discord: (webhookUrl: string): Omit<WebhookEndpoint, 'id'> => ({
    url: webhookUrl,
    events: ['alert', 'insight'],
    active: true,
    headers: {
      'X-Integration': 'discord',
    },
    retryCount: 3,
    retryDelay: 1000,
    timeout: 10000,
  }),

  googleSheets: (apiKey: string): Omit<WebhookEndpoint, 'id'> => ({
    url: 'https://sheets.googleapis.com/v4/spreadsheets',
    events: ['detection', 'trend_change'],
    active: true,
    headers: {
      'X-API-Key': apiKey,
      'X-Integration': 'google-sheets',
    },
    retryCount: 2,
    retryDelay: 2000,
    timeout: 15000,
  }),

  generic: (url: string): Omit<WebhookEndpoint, 'id'> => ({
    url,
    events: ['detection', 'trend_change', 'alert', 'insight'],
    active: true,
    retryCount: 3,
    retryDelay: 1000,
    timeout: 10000,
  }),
};

export const webhookManager = new WebhookManager();
