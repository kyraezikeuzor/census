import React, { useState, useEffect } from 'react';
import { PitchDeck } from '../members/3-pitch/PitchDeck';
import { Dashboard } from '../members/2-dashboard/Dashboard';
import { AnalyticsDashboard } from '../members/2-dashboard/AnalyticsDashboard';
import { Canvas } from '@react-three/fiber';
import { MainScene } from '../members/1-threejs/MainScene';
import { EventSimulator } from './EventSimulator';
import { useStore } from '@core/store';
import { useCensusStore } from '@core/censusStore';

// Lead: Only I touch this layout.
// Members should call for updates if they need structural changes.

const App: React.FC = () => {
    const [view, setView] = useState<'pitch' | 'demo' | 'analytics'>(() => {
        const path = window.location.pathname;
        if (path === '/demo') return 'demo';
        if (path === '/analytics') return 'analytics';
        return 'pitch';
    });
    const visualMode = useStore(state => state.visualMode);
    const currentZone = useCensusStore(state => state.currentZone);
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        const saved = window.localStorage.getItem('census.theme');
        return saved === 'light' ? 'light' : 'dark';
    });

    useEffect(() => {
        document.body.dataset.theme = theme;
        window.localStorage.setItem('census.theme', theme);
    }, [theme]);

    // Sync URL with view state
    useEffect(() => {
        if (view === 'demo' && window.location.pathname !== '/demo') {
            window.history.pushState({}, '', '/demo');
        } else if (view === 'analytics' && window.location.pathname !== '/analytics') {
            window.history.pushState({}, '', '/analytics');
        } else if (view === 'pitch' && window.location.pathname !== '/') {
            window.history.pushState({}, '', '/');
        }
    }, [view]);

    // Handle browser back/forward buttons
    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            if (path === '/demo') {
                setView('demo');
            } else if (path === '/analytics') {
                setView('analytics');
            } else {
                setView('pitch');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    if (view === 'pitch') {
        return (
            <div className="w-full h-screen">
                <PitchDeck onStartDemo={() => setView('demo')} />
                <EventSimulator
                    theme={theme}
                    onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                />
                <div className="fixed bottom-16 right-4 text-xs text-gray-500 opacity-50 bg-black/50 p-2 rounded">
                    DEEP LABS // VOICE2AD // STANDBY
                </div>
            </div>
        );
    }

    if (view === 'analytics') {
        return (
            <div className="w-full h-screen overflow-auto bg-slate-900">
                <AnalyticsDashboard />
                <button
                    onClick={() => setView('demo')}
                    className="fixed bottom-4 right-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-mono z-50 transition-colors"
                >
                    ← Back to Demo
                </button>
            </div>
        );
    }

    // Demo view: 3D visualization + Dashboard with integrated Census recording
    return (
        <div className="w-full h-screen items-between flex transition-colors duration-1000 bg-[#1e1e1e]">
            <EventSimulator
                theme={theme}
                onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />

            {/* Visual Canvas (Member 1) */}
            <div className="w-[600px] h-full relative ">
                <Canvas>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <MainScene theme={theme} />
                </Canvas>

                {/* Lead Overlay */}
                <div className="absolute top-4 left-4 z-10 font-mono text-xs flex flex-col gap-1">
                    <div className="text-indigo-400 font-bold">SYSTEM_MODE: {visualMode}</div>
                    <div className="text-emerald-400 font-bold">VIEWING: {currentZone}</div>
                    <div className="text-zinc-500">LATENCY: 142ms</div>
                </div>
            </div>

            {/* Dashboard Panel (Member 2) - now with integrated Census recording */}
            <div className="w-[800px] h-full border-l border-white/5 ">
                <Dashboard />
                <button
                    onClick={() => setView('analytics')}
                    className="absolute bottom-4 right-4 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-mono z-40 transition-colors"
                    title="View company analytics dashboard"
                >
                    📊 Analytics
                </button>
            </div>
        </div>
    );
};

export default App;
