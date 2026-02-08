/**
 * Real-time Collaboration Store
 * Multi-user support with presence, annotations, and shared actions
 * Uses Zustand for client-side state, ready for WebSocket sync
 */

import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
  zone: string;
  lastActive: number;
  color: string; // For cursor visualization
}

export interface Annotation {
  id: string;
  userId: string;
  zone: string;
  message: string;
  entity?: string;
  type: 'note' | 'alert' | 'insight';
  timestamp: number;
}

export interface SharedAction {
  id: string;
  userId: string;
  action: 'promotion_created' | 'alert_issued' | 'zone_optimized' | 'custom';
  target: string; // entity or zone
  details: Record<string, any>;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

interface CollaborationStore {
  // Users
  currentUser: User | null;
  activeUsers: User[];

  // Shared state
  annotations: Annotation[];
  sharedActions: SharedAction[];
  cursorPositions: Record<string, { x: number; y: number; zone: string }>;

  // Locks (prevent conflicts)
  entityLocks: Record<string, string>; // entity -> userId holding lock
  zoneLocks: Record<string, string>;   // zone -> userId holding lock

  // Actions
  setCurrentUser: (user: User) => void;
  updatePresence: (user: User) => void;
  removeUser: (userId: string) => void;

  // Annotations
  addAnnotation: (annotation: Annotation) => void;
  removeAnnotation: (annotationId: string) => void;

  // Shared actions
  recordAction: (action: SharedAction) => void;
  updateActionStatus: (actionId: string, status: 'pending' | 'completed' | 'failed') => void;

  // Locks
  acquireLock: (type: 'entity' | 'zone', target: string, userId: string) => boolean;
  releaseLock: (type: 'entity' | 'zone', target: string) => void;

  // Cleanup
  cleanup: () => void;
}

const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa502', '#6bcb77', '#d62828', '#4d96ff'];

export const useCollaborationStore = create<CollaborationStore>((set, get) => ({
  currentUser: null,
  activeUsers: [],
  annotations: [],
  sharedActions: [],
  cursorPositions: {},
  entityLocks: {},
  zoneLocks: {},

  setCurrentUser: (user) => set({ currentUser: user }),

  updatePresence: (user) =>
    set((state) => {
      const existing = state.activeUsers.find(u => u.id === user.id);
      if (existing) {
        return {
          activeUsers: state.activeUsers.map(u => (u.id === user.id ? { ...user, lastActive: Date.now() } : u)),
        };
      }
      return {
        activeUsers: [...state.activeUsers, { ...user, lastActive: Date.now() }],
      };
    }),

  removeUser: (userId) =>
    set((state) => ({
      activeUsers: state.activeUsers.filter(u => u.id !== userId),
      // Release locks held by this user
      entityLocks: Object.fromEntries(
        Object.entries(state.entityLocks).filter(([, uid]) => uid !== userId)
      ),
      zoneLocks: Object.fromEntries(
        Object.entries(state.zoneLocks).filter(([, uid]) => uid !== userId)
      ),
    })),

  addAnnotation: (annotation) =>
    set((state) => ({
      annotations: [annotation, ...state.annotations.slice(0, 49)], // Keep last 50
    })),

  removeAnnotation: (annotationId) =>
    set((state) => ({
      annotations: state.annotations.filter(a => a.id !== annotationId),
    })),

  recordAction: (action) =>
    set((state) => ({
      sharedActions: [action, ...state.sharedActions.slice(0, 99)], // Keep last 100
    })),

  updateActionStatus: (actionId, status) =>
    set((state) => ({
      sharedActions: state.sharedActions.map(a =>
        a.id === actionId ? { ...a, status } : a
      ),
    })),

  acquireLock: (type, target, userId) => {
    const state = get();
    const locks = type === 'entity' ? state.entityLocks : state.zoneLocks;

    if (locks[target] && locks[target] !== userId) {
      return false; // Lock held by someone else
    }

    set((prevState) => {
      const newLocks = { ...locks };
      newLocks[target] = userId;

      if (type === 'entity') {
        return { entityLocks: newLocks };
      } else {
        return { zoneLocks: newLocks };
      }
    });

    return true;
  },

  releaseLock: (type, target) =>
    set((state) => {
      const locks = type === 'entity' ? { ...state.entityLocks } : { ...state.zoneLocks };
      delete locks[target];

      if (type === 'entity') {
        return { entityLocks: locks };
      } else {
        return { zoneLocks: locks };
      }
    }),

  cleanup: () =>
    set({
      currentUser: null,
      activeUsers: [],
      annotations: [],
      sharedActions: [],
      cursorPositions: {},
      entityLocks: {},
      zoneLocks: {},
    }),
}));

/**
 * Helper to create a new user with random color
 */
export function createUser(id: string, name: string, role: 'admin' | 'manager' | 'staff', zone: string): User {
  return {
    id,
    name,
    role,
    zone,
    lastActive: Date.now(),
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

/**
 * Helper to create annotation
 */
export function createAnnotation(
  userId: string,
  zone: string,
  message: string,
  type: 'note' | 'alert' | 'insight' = 'note',
  entity?: string
): Annotation {
  return {
    id: Math.random().toString(36).substring(7),
    userId,
    zone,
    message,
    entity,
    type,
    timestamp: Date.now(),
  };
}

/**
 * Helper to record an action
 */
export function createAction(
  userId: string,
  action: SharedAction['action'],
  target: string,
  details: Record<string, any> = {}
): SharedAction {
  return {
    id: Math.random().toString(36).substring(7),
    userId,
    action,
    target,
    details,
    timestamp: Date.now(),
    status: 'pending',
  };
}
