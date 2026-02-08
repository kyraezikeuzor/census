/**
 * Census Global Store
 * 
 * Manages Census demo state for use across the app:
 * - Current zone
 * - Time window
 * - Global trends (all zones combined)
 * - Recent detections
 * 
 * This allows Member2's Dashboard to display real-time Census analytics.
 */

import { create } from 'zustand';
import { CensusZone, TimeWindow, TrendEntry } from 'frontend-shell/types';

interface CensusStore {
  // Current selection
  currentZone: CensusZone;
  timeWindow: TimeWindow;
  
  // Global data
  globalTrends: TrendEntry[];
  zonesTrends: Record<CensusZone, TrendEntry[]>;
  
  // Ad screens per zone
  adScreens: Record<CensusZone, {
    type: 'TREND' | 'PROMOTION' | 'ALERT';
    title: string;
    message: string;
    entity?: string;
    updatedAt: number;
  }>;

  // Recent activity
  lastDetections: Array<{
    zone: CensusZone;
    intent: string;
    entity: string;
    timestamp: number;
  }>;
  
  // Actions
  setZone: (zone: CensusZone) => void;
  setTimeWindow: (window: TimeWindow) => void;
  updateGlobalTrends: (trends: TrendEntry[]) => void;
  updateZoneTrends: (zone: CensusZone, trends: TrendEntry[]) => void;
  addDetection: (zone: CensusZone, intent: string, entity: string) => void;
  setAdForZone: (zone: CensusZone, ad: CensusStore['adScreens'][CensusZone]) => void;
  setAdForAllZones: (ad: CensusStore['adScreens'][CensusZone]) => void;
  seedAds: () => void;
  reset: () => void;
}

const INITIAL_ZONES: Record<CensusZone, TrendEntry[]> = {
  'Food Court': [],
  'Atrium': [],
  'West Wing': [],
  'Entrance': [],
};

const DEFAULT_ADS: Record<CensusZone, CensusStore['adScreens'][CensusZone]> = {
  'Food Court': { type: 'TREND', title: 'Trending', message: 'Burger King is #1', entity: 'Burger King', updatedAt: Date.now() },
  'Atrium': { type: 'TREND', title: 'Trending', message: 'Auntie Anne’s is rising', entity: "Auntie Anne's", updatedAt: Date.now() },
  'West Wing': { type: 'TREND', title: 'Trending', message: 'Coffee demand spikes', entity: 'Coffee', updatedAt: Date.now() },
  'Entrance': { type: 'TREND', title: 'Trending', message: 'Pizza interest up', entity: 'Pizza', updatedAt: Date.now() },
};

const AD_STORAGE_KEY = 'census.ads.v1';

const loadAds = (): Record<CensusZone, CensusStore['adScreens'][CensusZone]> => {
  if (typeof window === 'undefined') return DEFAULT_ADS;
  try {
    const raw = window.localStorage.getItem(AD_STORAGE_KEY);
    if (!raw) return DEFAULT_ADS;
    const parsed = JSON.parse(raw) as Record<CensusZone, CensusStore['adScreens'][CensusZone]>;
    return parsed || DEFAULT_ADS;
  } catch {
    return DEFAULT_ADS;
  }
};

const persistAds = (ads: Record<CensusZone, CensusStore['adScreens'][CensusZone]>) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(AD_STORAGE_KEY, JSON.stringify(ads));
  } catch {
    // ignore storage errors
  }
};

export const useCensusStore = create<CensusStore>((set) => ({
  currentZone: 'Food Court',
  timeWindow: '10m',
  globalTrends: [],
  zonesTrends: INITIAL_ZONES,
  adScreens: loadAds(),
  lastDetections: [],

  setZone: (zone) => set({ currentZone: zone }),
  
  setTimeWindow: (window) => set({ timeWindow: window }),
  
  updateGlobalTrends: (trends) => set({ globalTrends: trends }),
  
  updateZoneTrends: (zone, trends) =>
    set((state) => ({
      zonesTrends: {
        ...state.zonesTrends,
        [zone]: trends,
      },
    })),
  
  addDetection: (zone, intent, entity) =>
    set((state) => ({
      lastDetections: [
        { zone, intent, entity, timestamp: Date.now() },
        ...state.lastDetections.slice(0, 19), // Keep last 20
      ],
    })),

  setAdForZone: (zone, ad) =>
    set((state) => {
      const next = {
        ...state.adScreens,
        [zone]: ad,
      };
      persistAds(next);
      return { adScreens: next };
    }),

  setAdForAllZones: (ad) =>
    set((state) => {
      const next = {
        ...state.adScreens,
        'Food Court': ad,
        'Atrium': ad,
        'West Wing': ad,
        'Entrance': ad,
      };
      persistAds(next);
      return { adScreens: next };
    }),

  seedAds: () =>
    set((state) => {
      const next = { ...DEFAULT_ADS, ...state.adScreens };
      persistAds(next);
      return { adScreens: next };
    }),
  
  reset: () => set({
    currentZone: 'Food Court',
    timeWindow: '10m',
    globalTrends: [],
    zonesTrends: INITIAL_ZONES,
    adScreens: DEFAULT_ADS,
    lastDetections: [],
  }),
}));
