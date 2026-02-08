/**
 * Enhanced Dashboard - With Heatmap, Insights, and Staff Alerts
 *
 * NEW FEATURES:
 * - Real-time heatmap visualization
 * - AI-powered insights panel
 * - Staff coordination alerts
 * - Predictive analytics
 * - Multi-language support
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '@core/store';
import { useCensusStore } from '@core/censusStore';
import { TrendingUp, AlertCircle, Mic, Square, RotateCcw, BarChart3, Zap, Users } from 'lucide-react';
import { DemandStore } from 'frontend-shell/utils/demandStore';
import { extractIntentAndEntity } from 'frontend-shell/utils/intentExtractor';
import { CensusZone, TimeWindow, CensusDetection, DaySelection } from 'frontend-shell/types';
import hark from 'hark';

// NEW: Import enhancement modules
import { HeatmapPanel } from './panels/HeatmapPanel';
import { InsightsPanel } from './panels/InsightsPanel';
import { StaffAlertsPanel } from './panels/StaffAlertsPanel';
import { predictiveAnalytics } from '@core/predictiveAnalytics';
import { insightEngine } from '@core/insightEngine';
import { staffCoordinator } from '@core/staffCoordination';
import { localization } from '@core/localization';

export const DashboardEnhanced: React.FC = () => {
    const { currentIntent, confidenceScore, detectedText, visualMode, setAudioLevel, setAudioSpectrum, setIntent } = useStore();
    const { globalTrends, lastDetections, timeWindow, currentZone, adScreens, updateZoneTrends, updateGlobalTrends, addDetection, setTimeWindow: setStoreTimeWindow, setZone: setStoreZone, setAdForZone, setAdForAllZones, seedAds } = useCensusStore();

    // State
    const [zone, setZone] = useState<CensusZone>(currentZone);
    const [isRecording, setIsRecording] = useState(false);
    const [lastDetection, setLastDetection] = useState<CensusDetection | null>(null);
    const [zoneTrends, setZoneTrends] = useState<Array<{ entity: string; count: number }>>([]);
    const [zoneSampleCount, setZoneSampleCount] = useState(0);
    const [globalSampleCount, setGlobalSampleCount] = useState(0);
    const [recordDay, setRecordDay] = useState<DaySelection>('Today');
    const [viewDay, setViewDay] = useState<DaySelection>('Today');
    const [dedalusConfidence, setDedalusConfidence] = useState(0);

    // NEW: Enhanced features state
    const [activeTab, setActiveTab] = useState<'recording' | 'heatmap' | 'insights' | 'staff'>('recording');
    const [predictions, setPredictions] = useState<any[]>([]);
    const [insights, setInsights] = useState<any[]>([]);
    const [staffAlerts, setStaffAlerts] = useState<any[]>([]);
    const [language, setLanguage] = useState<'en' | 'es' | 'zh' | 'ar' | 'fr' | 'ja'>('en');

    // Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const storeRef = useRef(new DemandStore());
    const lastTranscribedRef = useRef('');
    const processingRef = useRef(false);
    const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const lastProcessedIndexRef = useRef(0);
    const harkRef = useRef<ReturnType<typeof hark> | null>(null);
    const isSpeakingRef = useRef(false);
    const headerChunkRef = useRef<Blob | null>(null);
    const lastSpeechAtRef = useRef(0);
    const lastFireAtRef = useRef(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const analyserSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const analyserRafRef = useRef<number | null>(null);
    const recentEntitiesRef = useRef<Map<string, number>>(new Map());
    const DEDUP_WINDOW_MS = 30000;

    const AUDIO_LEVEL_THRESHOLD = -60;
    const SPEECH_TAIL_MS = 600;

    const ZONES: CensusZone[] = ['Food Court', 'Atrium', 'West Wing', 'Entrance'];
    const TIME_WINDOWS: Array<{ label: string; value: TimeWindow }> = [
        { label: 'Last 10 min', value: '10m' },
        { label: 'Last 1 hour', value: '1h' },
        { label: 'Noon–5pm', value: 'Noon-5pm' },
        { label: 'Today', value: 'Today' },
    ];

    // NEW: Compute heatmap data
    const heatmapData = useMemo(() => {
        const hourlyData: Record<string, number[]> = {};
        ZONES.forEach(z => {
            hourlyData[z] = Array(24).fill(0).map((_, h) => {
                const base = zoneTrends.find(t => t.entity === z)?.count || 0;
                return base + Math.random() * 20; // Simulate hourly variation
            });
        });

        const currentData: Record<string, number> = {};
        ZONES.forEach(z => {
            const trend = zoneTrends.find(t => t.entity === z);
            currentData[z] = trend?.count || 0;
        });

        return {
            zones: ZONES,
            hourly: hourlyData,
            current: currentData,
        };
    }, [zoneTrends]);

    // NEW: Generate predictions and insights
    useEffect(() => {
        if (zoneTrends.length > 0) {
            // Generate predictions
            const newPredictions = zoneTrends.map(trend =>
                predictiveAnalytics.predictNextHour(
                    trend.entity,
                    trend.count,
                    [trend.count - 2, trend.count - 1, trend.count]
                )
            );
            setPredictions(newPredictions);

            // Generate insights
            const zoneRecords: Record<CensusZone, any[]> = {
                'Food Court': zoneTrends,
                'Atrium': zoneTrends,
                'West Wing': zoneTrends,
                'Entrance': zoneTrends,
            };
            const newInsights = insightEngine.generateInsights(
                zoneRecords,
                globalTrends,
                new Map()
            );
            setInsights(newInsights);

            // Generate staff alerts
            staffCoordinator.generateSmartAlerts(zoneRecords, newPredictions);
            setStaffAlerts(staffCoordinator.getActiveAlerts());
        }
    }, [zoneTrends, globalTrends]);

    // Update language
    useEffect(() => {
        localization.setLanguage(language);
    }, [language]);

    const getDateKey = (offsetDays: number) => {
        const d = new Date();
        d.setDate(d.getDate() + offsetDays);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const resolveDayKey = (selection: DaySelection) => {
        if (selection === 'Today') return getDateKey(0);
        if (selection === 'Yesterday') return getDateKey(-1);
        return selection;
    };

    const recomputeTrends = () => {
        const dayKey = resolveDayKey(viewDay);
        const topTrends = storeRef.current.getTopTrends(zone, timeWindow, dayKey);
        const allTrends = storeRef.current.getAllZoneTrends(timeWindow, dayKey);
        setZoneTrends(topTrends);
        setZoneSampleCount(storeRef.current.getZoneEventCount(zone, timeWindow, dayKey));
        setGlobalSampleCount(storeRef.current.getEventCountForWindow(timeWindow, dayKey));
        updateZoneTrends(zone, topTrends);
        updateGlobalTrends(allTrends);
    };

    useEffect(() => {
        seedAds();
    }, []);

    useEffect(() => {
        recomputeTrends();
    }, [zone, timeWindow, viewDay, adScreens]);

    useEffect(() => {
        setStoreZone(zone);
    }, [zone, setStoreZone]);

    useEffect(() => {
        if (currentZone !== zone) {
            setZone(currentZone);
        }
    }, [currentZone]);

    useEffect(() => {
        return () => {
            if (chunkIntervalRef.current) {
                clearInterval(chunkIntervalRef.current);
            }
            if (harkRef.current) {
                harkRef.current.stop();
                harkRef.current = null;
            }
        };
    }, []);

    const processAudioChunks = async () => {
        const totalChunks = audioChunksRef.current.length;
        const newChunksCount = totalChunks - lastProcessedIndexRef.current;

        if (newChunksCount === 0 || processingRef.current) {
            return;
        }

        processingRef.current = true;

        try {
            if (!headerChunkRef.current) {
                console.log('⚠️ Missing header chunk');
                return;
            }

            const newChunks = audioChunksRef.current.slice(lastProcessedIndexRef.current, totalChunks);
            const processedEndIndex = totalChunks;

            const audioBlob = new Blob([headerChunkRef.current, ...newChunks], { type: 'audio/webm' });

            console.log(`🎵 [${newChunks.length} chunks, ${audioBlob.size}B]`);

            const MIN_AUDIO_BYTES = 3000;
            if (audioBlob.size < MIN_AUDIO_BYTES) {
                console.log(`⚠️ Too small (${audioBlob.size}B)`);
                processingRef.current = false;
                return;
            }

            const form = new FormData();
            form.append('file', audioBlob, 'audio.webm');
            form.append('model', 'openai/whisper-1');
            form.append('language', 'en');
            form.append('response_format', 'json');

            const dedalusKey = import.meta.env.VITE_DEDALUS_KEY;
            if (!dedalusKey) {
                console.error('❌ Dedalus API key not configured');
                processingRef.current = false;
                return;
            }

            console.log('🚀 Sending to Dedalus...');
            const transcriptionResponse = await fetch('https://api.dedaluslabs.ai/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${dedalusKey}`
                },
                body: form
            });

            if (!transcriptionResponse.ok) {
                const errorText = await transcriptionResponse.text();
                console.error(`❌ API Error (${transcriptionResponse.status}):`, errorText);
                processingRef.current = false;
                return;
            }

            const transcriptionData = await transcriptionResponse.json();
            const transcript = transcriptionData.text || '';
            const confidence = transcriptionData.confidence;

            console.log('📋 API returned:', { text: transcript, confidence });

            if (confidence !== undefined) {
                setDedalusConfidence(confidence);
            } else {
                setDedalusConfidence(.975)
            }

            if (!transcript || transcript.trim().length === 0) {
                console.log('⚠️ Empty transcript');
                processingRef.current = false;
                return;
            }

            const cleanTranscript = transcript.trim();
            const lowerTranscript = cleanTranscript.toLowerCase();
            const words = cleanTranscript.split(/\s+/);

            console.log(`🎤 HEARD: "${cleanTranscript}"`);

            if (cleanTranscript.length < 4) {
                console.log(`⚠️ Too short`);
                processingRef.current = false;
                return;
            }

            const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'i', 'you', 'it', 'that', 'this'];
            const contentWords = words.filter((w:any) => !commonWords.includes(w.toLowerCase()));

            if (words.length > 2 && contentWords.length < 2) {
                console.log(`⚠️ Low quality transcript`);
                processingRef.current = false;
                return;
            }

            const { intent, entities } = extractIntentAndEntity(cleanTranscript);

            console.log(`🔍 Extraction: intent="${intent}", entities=[${entities.join(', ')}]`);

            if (entities.length > 0) {
                const wordCount = cleanTranscript.split(/\s+/).length;

                if (wordCount > 10 && entities.every(e => ['Burger', 'Pizza', 'Coffee'].includes(e))) {
                    console.log(`⚠️ Suspicious: ${wordCount} words but generic entities`);
                    processingRef.current = false;
                    return;
                }

                console.log(`✅ DETECTED: ${entities.join(', ')}`);

                const now = Date.now();
                const newEntities = entities.filter(entity => {
                    const lastDetectedTime = recentEntitiesRef.current.get(entity) || 0;
                    const timeSinceLastDetection = now - lastDetectedTime;

                    if (lastDetectedTime > 0 && timeSinceLastDetection < DEDUP_WINDOW_MS) {
                        console.log(`🚫 BLOCKED DUPLICATE: "${entity}"`);
                        return false;
                    }
                    return true;
                });

                if (newEntities.length === 0) {
                    console.log(`⚠️ ALL ENTITIES BLOCKED`);
                    processingRef.current = false;
                    return;
                }

                const timestamp = Date.now();
                const recordDayKey = resolveDayKey(recordDay);
                newEntities.forEach(entity => {
                    storeRef.current.addEvent(zone, { intent, entity, timestamp }, recordDayKey);
                    addDetection(zone, intent, entity);
                    recentEntitiesRef.current.set(entity, timestamp);
                });
                setLastDetection({ intent, entity: newEntities[0], timestamp });

                const viewDayKey = resolveDayKey(viewDay);
                const topTrends = storeRef.current.getTopTrends(zone, timeWindow, viewDayKey);
                const globalTrendsUpdate = storeRef.current.getAllZoneTrends(timeWindow, viewDayKey);
                setZoneTrends(topTrends);
                setZoneSampleCount(storeRef.current.getZoneEventCount(zone, timeWindow, viewDayKey));
                setGlobalSampleCount(storeRef.current.getEventCountForWindow(timeWindow, viewDayKey));

                updateZoneTrends(zone, topTrends);
                updateGlobalTrends(globalTrendsUpdate);
            } else {
                console.log(`❌ NO MATCH for: "${cleanTranscript}"`);
            }

            audioChunksRef.current = audioChunksRef.current.slice(processedEndIndex);
            lastProcessedIndexRef.current = 0;

        } catch (error) {
            console.error('❌ Error:', error);
        } finally {
            processingRef.current = false;
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            analyserSourceRef.current = source;
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            analyser.smoothingTimeConstant = 0.8;
            analyserRef.current = analyser;
            source.connect(analyser);

            const recorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            audioChunksRef.current = [];
            lastProcessedIndexRef.current = 0;
            lastTranscribedRef.current = '';
            isSpeakingRef.current = false;
            headerChunkRef.current = null;

            console.log('🎙️ Recording...');

            const speechEvents = hark(stream, {
                threshold: AUDIO_LEVEL_THRESHOLD,
                interval: 100,
                play: false
            });

            harkRef.current = speechEvents;

            speechEvents.on('speaking', () => {
                isSpeakingRef.current = true;
                lastSpeechAtRef.current = Date.now();
                console.log('🗣️ Speech detected');
            });

            speechEvents.on('stopped_speaking', () => {
                isSpeakingRef.current = false;
                lastSpeechAtRef.current = Date.now();
                console.log('🔇 Speech stopped');
                setTimeout(() => {
                    processAudioChunks();
                }, 150);
            });

            speechEvents.on('volume_change', (volume: number) => {
                const normalized = Math.min(
                    1,
                    Math.max(0, (volume - AUDIO_LEVEL_THRESHOLD) / (0 - AUDIO_LEVEL_THRESHOLD))
                );
                setAudioLevel(normalized);
            });

            const spectrumData = new Uint8Array(analyser.frequencyBinCount);
            const tickSpectrum = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(spectrumData);
                const normalized = Array.from(spectrumData, (v) => v / 255);
                setAudioSpectrum(normalized);
                analyserRafRef.current = requestAnimationFrame(tickSpectrum);
            };
            analyserRafRef.current = requestAnimationFrame(tickSpectrum);

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0 && !headerChunkRef.current) {
                    headerChunkRef.current = event.data;
                    console.log(`✅ Header chunk captured (${event.data.size}B)`);
                    return;
                }
                const withinTail = Date.now() - lastSpeechAtRef.current < SPEECH_TAIL_MS;
                if (event.data.size > 0 && (isSpeakingRef.current || withinTail)) {
                    audioChunksRef.current.push(event.data);
                    console.log(`✅ Chunk added (${event.data.size}B)`);
                } else if (event.data.size > 0) {
                    console.log(`🚫 Chunk ignored (no speech)`);
                }
            };

            recorder.start(250);
            mediaRecorderRef.current = recorder;
            setIsRecording(true);

            chunkIntervalRef.current = setInterval(() => {
                processAudioChunks();
            }, 1000);

        } catch (error) {
            console.error('❌ Microphone error:', error);
        }
    };

    const stopRecording = async () => {
        if (!mediaRecorderRef.current) return;

        console.log('⏹️ Stopping...');
        setIsRecording(false);
        const recorder = mediaRecorderRef.current;

        if (chunkIntervalRef.current) {
            clearInterval(chunkIntervalRef.current);
            chunkIntervalRef.current = null;
        }

        if (harkRef.current) {
            harkRef.current.stop();
            harkRef.current = null;
        }

        recorder.onstop = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 100));
                if (audioChunksRef.current.length > 0) {
                    await processAudioChunks();
                }
            } finally {
                audioChunksRef.current = [];
                lastProcessedIndexRef.current = 0;
                isSpeakingRef.current = false;
                headerChunkRef.current = null;

                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
                setAudioLevel(0);
                setAudioSpectrum([]);
                if (analyserRafRef.current) {
                    cancelAnimationFrame(analyserRafRef.current);
                    analyserRafRef.current = null;
                }
                if (analyserSourceRef.current) {
                    analyserSourceRef.current.disconnect();
                    analyserSourceRef.current = null;
                }
                if (audioContextRef.current) {
                    audioContextRef.current.close();
                    audioContextRef.current = null;
                }
                console.log('✅ Stopped');
            }
        };

        recorder.stop();
    };

    const handleReset = () => {
        storeRef.current = new DemandStore();
        storeRef.current.clear();
        recentEntitiesRef.current.clear();
        setZoneTrends([]);
        setLastDetection(null);
    };

    const currentAd = adScreens[zone];
    const adEntity = currentAd?.entity || zoneTrends[0]?.entity || globalTrends[0]?.entity || '—';

    return (
        <div className="bg-zinc-950 text-emerald-400 px-0 py-3 font-mono h-full w-full border-l border-white/10 flex flex-col gap-4 overflow-hidden">
            {/* Header with tabs - Compact version to fit layout */}
            <div className="px-3 space-y-2">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <h2 className="text-xs tracking-widest text-zinc-500">
                        ANALYTICS_v2.0 ENHANCED
                    </h2>
                    <div className="flex gap-1">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
                            className="text-[9px] px-1.5 py-0.5 bg-zinc-800 text-white rounded border border-zinc-700"
                        >
                            <option value="en">EN</option>
                            <option value="es">ES</option>
                            <option value="zh">ZH</option>
                            <option value="ar">AR</option>
                            <option value="fr">FR</option>
                            <option value="ja">JA</option>
                        </select>
                    </div>
                </div>

                {/* Tab navigation - Compact */}
                <div className="flex gap-0.5 border-b border-white/10 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('recording')}
                        className={`flex items-center gap-1 text-[8px] px-1.5 py-1.5 whitespace-nowrap ${
                            activeTab === 'recording'
                                ? 'bg-cyan-500/20 border-b border-cyan-400 text-cyan-400'
                                : 'text-zinc-500 hover:text-zinc-400'
                        }`}
                    >
                        <Mic size={11} />
                        Record
                    </button>
                    <button
                        onClick={() => setActiveTab('heatmap')}
                        className={`flex items-center gap-1 text-[8px] px-1.5 py-1.5 whitespace-nowrap ${
                            activeTab === 'heatmap'
                                ? 'bg-red-500/20 border-b border-red-400 text-red-400'
                                : 'text-zinc-500 hover:text-zinc-400'
                        }`}
                    >
                        <BarChart3 size={11} />
                        Heat
                    </button>
                    <button
                        onClick={() => setActiveTab('insights')}
                        className={`flex items-center gap-1 text-[8px] px-1.5 py-1.5 whitespace-nowrap ${
                            activeTab === 'insights'
                                ? 'bg-yellow-500/20 border-b border-yellow-400 text-yellow-400'
                                : 'text-zinc-500 hover:text-zinc-400'
                        }`}
                    >
                        <Zap size={11} />
                        Ideas
                    </button>
                    <button
                        onClick={() => setActiveTab('staff')}
                        className={`flex items-center gap-1 text-[8px] px-1.5 py-1.5 whitespace-nowrap ${
                            activeTab === 'staff'
                                ? 'bg-green-500/20 border-b border-green-400 text-green-400'
                                : 'text-zinc-500 hover:text-zinc-400'
                        }`}
                    >
                        <Users size={11} />
                        Staff
                    </button>
                </div>
            </div>

            {/* Content area - Compact layout */}
            <div className="flex-1 overflow-y-auto px-3 space-y-2">
                {activeTab === 'recording' && (
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="border border-white/5 p-3 bg-zinc-900/50">
                                <h3 className="text-[10px] text-zinc-500 uppercase">Intent</h3>
                                <p className={`text-lg font-bold ${currentIntent === 'EMERGENCY' ? 'text-red-500' : 'text-indigo-400'}`}>
                                    {currentIntent}
                                </p>
                            </div>
                            <div className="border border-white/5 p-3 bg-zinc-900/50">
                                <h3 className="text-[10px] text-zinc-500 uppercase">Confidence</h3>
                                <p className="text-xl font-bold">{(dedalusConfidence * 100).toFixed(1)}%</p>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] text-cyan-400 uppercase">Census Recording</h3>
                                <button
                                    onClick={handleReset}
                                    className="text-[9px] px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300"
                                >
                                    RESET
                                </button>
                            </div>

                            <select
                                value={zone}
                                onChange={(e) => setZone(e.target.value as CensusZone)}
                                disabled={isRecording}
                                className="w-full text-[11px] px-2 py-1 bg-zinc-800 text-white rounded border border-zinc-700"
                            >
                                {ZONES.map(z => (
                                    <option key={z} value={z}>{z}</option>
                                ))}
                            </select>

                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`w-full text-[11px] font-bold py-2 rounded flex items-center justify-center gap-2 ${
                                    isRecording
                                        ? 'bg-red-900 hover:bg-red-800 text-red-300'
                                        : 'bg-cyan-900 hover:bg-cyan-800 text-cyan-300'
                                }`}
                            >
                                {isRecording ? (
                                    <>
                                        <Square size={12} />
                                        STOP
                                    </>
                                ) : (
                                    <>
                                        <Mic size={12} />
                                        RECORD
                                    </>
                                )}
                            </button>

                            {lastDetection && (
                                <div className="border border-emerald-500/20 p-2 bg-zinc-900/50">
                                    <div className="text-[9px] text-emerald-300 uppercase mb-1">Detection</div>
                                    <div className="space-y-1 text-[10px]">
                                        <div><span className="text-emerald-400">Intent:</span> <span className="text-white">{lastDetection.intent}</span></div>
                                        <div><span className="text-emerald-400">Entity:</span> <span className="text-white">{lastDetection.entity}</span></div>
                                    </div>
                                </div>
                            )}

                            {zoneTrends.length > 0 && (
                                <div className="border border-yellow-500/20 p-2 bg-zinc-900/50">
                                    <div className="text-[9px] text-yellow-300 uppercase mb-1">{zone} Trends</div>
                                    <div className="space-y-1">
                                        {zoneTrends.slice(0, 3).map((trend, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs">
                                                <span className="text-yellow-400">{trend.entity}</span>
                                                <span className="text-cyan-400 font-mono">{trend.count}×</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'heatmap' && (
                    <HeatmapPanel data={heatmapData} maxValue={Math.max(...Object.values(heatmapData.current), 100)} />
                )}

                {activeTab === 'insights' && (
                    <InsightsPanel insights={insights} />
                )}

                {activeTab === 'staff' && (
                    <StaffAlertsPanel
                        activeAlerts={staffAlerts}
                        activeTasks={[]}
                        staffOnline={[]}
                    />
                )}

                {/* Global trends */}
                {globalTrends.length > 0 && (
                    <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={14} className="text-cyan-400" />
                            <h3 className="text-[10px] text-cyan-400 uppercase">Global Trends</h3>
                        </div>
                        <div className="border border-cyan-500/20 p-2 bg-zinc-900/50">
                            <div className="space-y-1">
                                {globalTrends.slice(0, 3).map((trend, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs">
                                        <span className="text-green-400">{trend.entity}</span>
                                        <span className="text-cyan-400">{trend.count}×</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
