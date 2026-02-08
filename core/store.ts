import { create } from 'zustand';
import { IntentType, DedalusState } from 'frontend-shell/types';

interface AppStore extends DedalusState {
    // Actions
    setIntent: (intent: IntentType, text: string, confidence: number) => void;
    setVisualMode: (mode: 'IDLE' | 'AD' | 'ALERT') => void;
    setAudioLevel: (level: number) => void;
    setAudioSpectrum: (spectrum: number[]) => void;
    reset: () => void;
}

export const useStore = create<AppStore>((set) => ({
    currentIntent: 'AMBIENT',
    confidenceScore: 0,
    detectedText: '',
    isProcessing: false,
    visualMode: 'IDLE',
    audioLevel: 0,
    audioSpectrum: [],

    setIntent: (intent, text, confidence) => set({
        currentIntent: intent,
        detectedText: text,
        confidenceScore: confidence,
        visualMode: intent === 'EMERGENCY' ? 'ALERT' : (intent === 'PROMOTION' ? 'AD' : 'IDLE')
    }),

    setVisualMode: (mode) => set({ visualMode: mode }),

    setAudioLevel: (level) => set({ audioLevel: level }),
    setAudioSpectrum: (spectrum) => set({ audioSpectrum: spectrum }),

    reset: () => set({
        currentIntent: 'AMBIENT',
        confidenceScore: 0,
        detectedText: '',
        isProcessing: false,
        visualMode: 'IDLE',
        audioLevel: 0,
        audioSpectrum: []
    })
}));
