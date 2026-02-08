// Voice2Ad Types
export type IntentType = 'EMERGENCY' | 'PROMOTION' | 'ANNOUNCEMENT' | 'AMBIENT';

export interface DedalusState {
    currentIntent: IntentType;
    confidenceScore: number;
    detectedText: string;
    isProcessing: boolean;
    visualMode: 'IDLE' | 'AD' | 'ALERT';
    audioLevel: number;
    audioSpectrum: number[];
}

export interface AdPayload {
    brandDetails: {
        name: string;
        colors: string[];
    };
    durationMs: number;
    triggerPhrase: string;
}

// Census Demo Types
export type CensusZone = 'Food Court' | 'Atrium' | 'West Wing' | 'Entrance';
export type TimeWindow = '10m' | '1h' | 'Noon-5pm' | 'Today';
export type DaySelection = 'Today' | 'Yesterday' | 'Day 1' | 'Day 2';

export interface CensusDetection {
    intent: string;
    entity: string;
    timestamp: number;
}

export interface TrendEntry {
    entity: string;
    count: number;
    lastSeen?: number;
}
