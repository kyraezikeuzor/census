import React from 'react';
import { useStore } from '@core/store';
import { useCensusStore } from '@core/censusStore';

type Props = {
    theme: 'dark' | 'light';
    onToggleTheme: () => void;
};

export const EventSimulator: React.FC<Props> = ({ theme, onToggleTheme }) => {
    const { setIntent, reset } = useStore();
    const { currentZone, setAdForZone, setAdForAllZones, reset: resetCensus } = useCensusStore();

    return (
        <div className="fixed bottom-4 left-4 z-50 flex gap-2 bg-zinc-900/80 p-2 rounded-lg border border-zinc-700 backdrop-blur-md">
            <button
                onClick={() => {
                    setIntent('PROMOTION', 'Flash sale at Nike, 50% off!', 0.98);
                    setAdForZone(currentZone, {
                        type: 'PROMOTION',
                        title: 'Promotion',
                        message: 'Flash sale 50% off',
                        entity: 'Nike',
                        updatedAt: Date.now(),
                    });
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded"
            >
                PROMOTION
            </button>
            <button
                onClick={() => {
                    setIntent('EMERGENCY', 'Fire in Sector 4. Please evacuate.', 0.99);
                    setAdForAllZones({
                        type: 'ALERT',
                        title: 'Fire Alert',
                        message: 'Evacuate to nearest exit',
                        updatedAt: Date.now(),
                    });
                }}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-xs font-bold rounded"
            >
                FIRE ALERT
            </button>
            <button
                onClick={() => {
                    reset();
                    resetCensus();
                }}
                className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-xs font-bold rounded"
            >
                RESET
            </button>
            <button
                onClick={onToggleTheme}
                className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-xs font-bold rounded"
            >
                {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
            </button>
        </div>
    );
};
