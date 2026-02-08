/**
 * In-memory store for aggregated demand data
 * Maintains rolling windows without storing transcripts or audio
 */

import type { TimeWindow } from 'frontend-shell/types';

type Zone = 'Food Court' | 'Atrium' | 'West Wing' | 'Entrance';

interface DemandEvent {
  intent: string;
  entity: string;
  timestamp: number;
  zone: Zone;
  dayKey: string;
}

interface TrendEntry {
  entity: string;
  count: number;
  lastSeen?: number;
}

export class DemandStore {
  private events: DemandEvent[] = [];
  private readonly storageKey = 'census.events.v1';
  private readonly maxEvents = 500;

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as DemandEvent[];
        if (Array.isArray(parsed)) {
          this.events = parsed;
        }
      }
    } catch (err) {
      // ignore storage errors
    }
  }

  private persist() {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(this.events));
    } catch (err) {
      // ignore storage errors
    }
  }

  addEvent(zone: Zone, event: { intent: string; entity: string; timestamp: number }, dayKey: string) {
    this.events.push({
      ...event,
      zone,
      dayKey,
    });
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(this.events.length - this.maxEvents);
    }
    this.persist();
  }

  private isInDay(event: DemandEvent, dayKey: string, now: number): boolean {
    if (dayKey === 'ALL') {
      return true;
    }
    return event.dayKey === dayKey;
  }

  private isInWindow(timestamp: number, window: TimeWindow, now: number): boolean {
    if (window === '10m') {
      return timestamp >= now - 10 * 60 * 1000;
    }
    if (window === '1h') {
      return timestamp >= now - 60 * 60 * 1000;
    }
    if (window === 'Today') {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      return timestamp >= startOfDay.getTime();
    }
    // Noon-5pm
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    if (timestamp < startOfDay.getTime()) {
      return false;
    }
    const eventDate = new Date(timestamp);
    const hour = eventDate.getHours() + eventDate.getMinutes() / 60;
    return hour >= 12 && hour < 17;
  }

  /**
   * Get top N trending entities for a zone within a time window
   * @param zone The zone to query
   * @param window Time window selection
   * @param topN Number of top trends to return (default 3)
   */
  getTopTrends(zone: Zone, window: TimeWindow, dayKey: string, topN: number = 3): TrendEntry[] {
    const now = Date.now();

    // Filter events for this zone and time window
    const relevantEvents = this.events.filter(
      event =>
        event.zone === zone &&
        this.isInWindow(event.timestamp, window, now) &&
        this.isInDay(event, dayKey, now)
    );

    // Count occurrences by entity
    const entityCounts = new Map<string, TrendEntry>();
    relevantEvents.forEach(event => {
      const existing = entityCounts.get(event.entity) || {
        entity: event.entity,
        count: 0,
        lastSeen: event.timestamp,
      };
      existing.count += 1;
      existing.lastSeen = Math.max(existing.lastSeen || 0, event.timestamp);
      entityCounts.set(event.entity, existing);
    });

    // Sort by count (descending), then by most recent
    const sorted = Array.from(entityCounts.values()).sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      // If counts tie, prefer the most recently seen
      return (b.lastSeen || 0) < (a.lastSeen || 0) ? -1 : (b.lastSeen || 0) > (a.lastSeen || 0) ? 1 : 0;
    });

    return sorted.slice(0, topN);
  }

  /**
   * Get trending items across all zones
   */
  getAllZoneTrends(window: TimeWindow, dayKey: string, topN: number = 5): TrendEntry[] {
    const now = Date.now();

    const relevantEvents = this.events.filter(
      event => this.isInWindow(event.timestamp, window, now) && this.isInDay(event, dayKey, now)
    );

    const entityCounts = new Map<string, TrendEntry>();
    relevantEvents.forEach(event => {
      const existing = entityCounts.get(event.entity) || {
        entity: event.entity,
        count: 0,
        lastSeen: event.timestamp,
      };
      existing.count += 1;
      existing.lastSeen = Math.max(existing.lastSeen || 0, event.timestamp);
      entityCounts.set(event.entity, existing);
    });

    const sorted = Array.from(entityCounts.values()).sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      // If counts tie, prefer the most recently seen
      return (b.lastSeen || 0) < (a.lastSeen || 0) ? -1 : (b.lastSeen || 0) > (a.lastSeen || 0) ? 1 : 0;
    });

    return sorted.slice(0, topN);
  }

  /**
   * Clear all stored events (for demo reset)
   */
  clear() {
    this.events = [];
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(this.storageKey);
      } catch (err) {
        // ignore storage errors
      }
    }
  }

  getZoneEventCount(zone: Zone, window: TimeWindow, dayKey: string): number {
    const now = Date.now();
    return this.events.filter(
      event =>
        event.zone === zone &&
        this.isInWindow(event.timestamp, window, now) &&
        this.isInDay(event, dayKey, now)
    ).length;
  }

  getEventCountForWindow(window: TimeWindow, dayKey: string): number {
    const now = Date.now();
    return this.events.filter(
      event => this.isInWindow(event.timestamp, window, now) && this.isInDay(event, dayKey, now)
    ).length;
  }

  /**
   * Get event count for debugging
   */
  getEventCount(): number {
    return this.events.length;
  }
}
