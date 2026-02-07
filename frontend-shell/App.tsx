import React, { useState } from 'react';
import { PitchDeck } from '@members/member3_pitch_ui/PitchDeck';
import { Dashboard } from '@members/member2_dashboard/Dashboard';
import { Canvas } from '@react-three/fiber';
import { MainScene } from '@members/member1_threejs/MainScene';
import { EventSimulator } from './EventSimulator';
import { useStore } from '@core/store';

// Lead: Only I touch this layout.
// Members should call for updates if they need structural changes.

const App: React.FC = () => {
    const [view, setView] = useState<'pitch' | 'demo'>('pitch');
    const visualMode = useStore(state => state.visualMode);

    if (view === 'pitch') {
        return (
            <div className="w-full h-screen cursor-pointer" onClick={() => setView('demo')}>
                <PitchDeck />
                <EventSimulator />
                <div className="fixed bottom-16 right-4 text-xs text-gray-500 opacity-50 bg-black/50 p-2 rounded">
                    DEEP LABS // VOICE2AD // STANDBY
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-screen flex transition-colors duration-1000 ${visualMode === 'ALERT' ? 'bg-red-950' : 'bg-black'}`}>
            <EventSimulator />

            {/* Visual Canvas (Member 1) */}
            <div className="flex-grow h-full relative">
                <Canvas>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <MainScene />
                </Canvas>

                {/* Lead Overlay */}
                <div className="absolute top-4 left-4 z-10 font-mono text-xs flex flex-col gap-1">
                    <div className="text-indigo-400 font-bold">SYSTEM_MODE: {visualMode}</div>
                    <div className="text-zinc-500">LATENCY: 142ms</div>
                </div>
            </div>

            {/* Dashboard Panel (Member 2) */}
            <div className="w-1/3 h-full border-l border-white/5">
                <Dashboard />
            </div>
        </div>
    );
};

export default App;
