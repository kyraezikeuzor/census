import React from 'react';
import { useStore } from '@core/store';

export const Dashboard: React.FC = () => {
    const { currentIntent, confidenceScore, detectedText, visualMode } = useStore();

    return (
        <div className="bg-zinc-950 text-emerald-400 p-4 font-mono h-full w-full border-l border-white/10 flex flex-col gap-4">
            <h2 className="text-xs tracking-widest text-zinc-500 border-b border-white/10 pb-2">
                MALL_OPS_v0.1 // {visualMode}
            </h2>

            <div className="space-y-4">
                <div className="border border-white/5 p-3 bg-zinc-900/50">
                    <h3 className="text-[10px] text-zinc-500 uppercase mb-1">Live Transcript</h3>
                    <p className="text-sm text-white min-h-[3rem] italic">
                        "{detectedText || 'Waiting for audio...'}"
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="border border-white/5 p-3 bg-zinc-900/50">
                        <h3 className="text-[10px] text-zinc-500 uppercase">Intent</h3>
                        <p className={`text-lg font-bold ${currentIntent === 'EMERGENCY' ? 'text-red-500' : 'text-indigo-400'}`}>
                            {currentIntent}
                        </p>
                    </div>
                    <div className="border border-white/5 p-3 bg-zinc-900/50">
                        <h3 className="text-[10px] text-zinc-500 uppercase">Confidence</h3>
                        <p className="text-xl font-bold">{(confidenceScore * 100).toFixed(1)}%</p>
                    </div>
                </div>
            </div>

            <div className="mt-auto opacity-20 text-[10px]">
                CONNECTION_LOG: SECURE_SOCKET_ESTABLISHED
            </div>
        </div>
    );
};
