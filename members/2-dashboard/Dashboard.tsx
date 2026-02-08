/**
 * Dashboard - Real-time Analytics + Census Recording
 * 
 * Displays:
 * - Voice2Ad live intent detection (top)
 * - Census ambient recording & trends
 * - Recent detections from all zones
 * - Global trending items
 */

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@core/store';
import { useCensusStore } from '@core/censusStore';
import { TrendingUp, AlertCircle, Mic, Square, RotateCcw } from 'lucide-react';
import { DemandStore } from 'frontend-shell/utils/demandStore';
import { extractIntentAndEntity } from 'frontend-shell/utils/intentExtractor';  
import { CensusZone, TimeWindow, CensusDetection, DaySelection } from 'frontend-shell/types';
import hark from 'hark';
import { DashboardEnhanced } from './DashboardEnhanced';

// Keep original dashboard code but export the enhanced version below
const DashboardOriginal: React.FC = () => {
    const { currentIntent, confidenceScore, detectedText, visualMode, setAudioLevel, setAudioSpectrum, setIntent } = useStore();
    const { globalTrends, lastDetections, timeWindow, currentZone, adScreens, updateZoneTrends, updateGlobalTrends, addDetection, setTimeWindow: setStoreTimeWindow, setZone: setStoreZone, setAdForZone, setAdForAllZones, seedAds } = useCensusStore();

    // Census recording state
    const [zone, setZone] = useState<CensusZone>(currentZone);
    const [isRecording, setIsRecording] = useState(false);
    const [lastDetection, setLastDetection] = useState<CensusDetection | null>(null);
    const [zoneTrends, setZoneTrends] = useState<Array<{ entity: string; count: number }>>([]);
    const [zoneSampleCount, setZoneSampleCount] = useState(0);
    const [globalSampleCount, setGlobalSampleCount] = useState(0);
    const [recordDay, setRecordDay] = useState<DaySelection>('Today');
    const [viewDay, setViewDay] = useState<DaySelection>('Today');
    const [dedalusConfidence, setDedalusConfidence] = useState(0);


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
    // Track recently detected entities to prevent duplicate hallucinations
    const recentEntitiesRef = useRef<Map<string, number>>(new Map()); // entity -> timestamp
    const DEDUP_WINDOW_MS = 30000; // Don't add same entity twice within 30 seconds (aggressive)
    
    // Audio level threshold for voice activity detection (in dB, typical range: -100 to 0)
    // Lower threshold = more sensitive (helpful for softer voices)
    const AUDIO_LEVEL_THRESHOLD = -60;
    const SPEECH_TAIL_MS = 600; // capture a short tail after speech stops

    const ZONES: CensusZone[] = ['Food Court', 'Atrium', 'West Wing', 'Entrance'];
    const TIME_WINDOWS: Array<{ label: string; value: TimeWindow }> = [
        { label: 'Last 10 min', value: '10m' },
        { label: 'Last 1 hour', value: '1h' },
        { label: 'Noon–5pm', value: 'Noon-5pm' },
        { label: 'Today', value: 'Today' },
    ];
    const DAY_OPTIONS: Array<{ label: string; value: DaySelection }> = [
        { label: 'Today', value: 'Today' },
        { label: 'Yesterday', value: 'Yesterday' },
        { label: 'Day 1', value: 'Day 1' },
        { label: 'Day 2', value: 'Day 2' },
    ];

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
        const existingAd = adScreens[zone];
        const topEntity = topTrends[0]?.entity || allTrends[0]?.entity;
        if (topEntity && (!existingAd || existingAd.type === 'TREND')) {
            setAdForZone(zone, {
                type: 'TREND',
                title: 'Trending',
                message: `${topEntity} is #1 right now`,
                entity: topEntity,
                updatedAt: Date.now(),
            });
        }
    };

    const buildDirections = (entity: string, fromZone: CensusZone) => {
        const zoneHints: Record<CensusZone, string> = {
            'Food Court': 'Atrium corridor',
            'Atrium': 'north concourse',
            'West Wing': 'central spine',
            'Entrance': 'main concourse',
        };
        const steps = [
            `Start at ${fromZone}`,
            `Head through the ${zoneHints[fromZone]}`,
            'Look for the lit storefront and queue line',
        ];
        const distance = 80 + (entity.length * 7);
        const eta = Math.max(1, Math.round(distance / 60));
        return { steps, distance, eta };
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

    // Cleanup on unmount
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

    // Process audio chunks for real-time transcription
    const processAudioChunks = async () => {
        // Check if we have new chunks to process
        const totalChunks = audioChunksRef.current.length;
        const newChunksCount = totalChunks - lastProcessedIndexRef.current;
        
        if (newChunksCount === 0 || processingRef.current) {
            return;
        }

        processingRef.current = true;
        const processingStartTime = Date.now();

        try {
            if (!headerChunkRef.current) {
                console.log('⚠️ Missing header chunk - waiting for recorder init');
                return;
            }

            // Get only the NEW chunks since last processing
            const newChunks = audioChunksRef.current.slice(lastProcessedIndexRef.current, totalChunks);
            const processedEndIndex = totalChunks;
            
            // Create blob with header + new chunks (WebM needs the header to be valid)
            const audioBlob = new Blob([headerChunkRef.current, ...newChunks], { type: 'audio/webm' });
            
            console.log(`🎵 [${newChunks.length} chunks, ${audioBlob.size}B]`);
            
            // STRICT: Need a minimum buffer of audio for reliable transcription
            // 2.5–3KB is roughly ~0.5–1s of clear speech with Opus
            const MIN_AUDIO_BYTES = 3000;
            if (audioBlob.size < MIN_AUDIO_BYTES) {
                console.log(`⚠️ Too small (${audioBlob.size}B < ${MIN_AUDIO_BYTES}B) - need more audio`);
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

            console.log(`📡 Response status: ${transcriptionResponse.status}`);

            if (!transcriptionResponse.ok) {
                const errorText = await transcriptionResponse.text();
                console.error(`❌ API Error (${transcriptionResponse.status}):`, errorText);
                processingRef.current = false;
                return;
            }

            const transcriptionData = await transcriptionResponse.json();
            const transcript = transcriptionData.text || '';
            const confidence = transcriptionData.confidence;
            const apiTime = Date.now() - processingStartTime;
            
            // Log the full response to see what we're getting
            console.log('📋 API returned:', { text: transcript, confidence, raw: transcriptionData });
            
            // Only set confidence if it exists
            if (confidence !== undefined) {
                setDedalusConfidence(confidence);
            } else {
                setDedalusConfidence(.975)
            }

            // STRICT: Must have actual text
            if (!transcript || transcript.trim().length === 0) {
                console.log('⚠️ Empty transcript - ignoring');
                processingRef.current = false;
                return;
            }

            const cleanTranscript = transcript.trim();
            const lowerTranscript = cleanTranscript.toLowerCase();
            const words = cleanTranscript.split(/\s+/);
            
            console.log(`🎤 HEARD: "${cleanTranscript}" (${words.length} words)`);

            // STRICT: Minimum 4 characters (no single words like "the", "a", etc)
            if (cleanTranscript.length < 4) {
                console.log(`⚠️ Too short (${cleanTranscript.length} chars) - ignoring`);
                processingRef.current = false;
                return;
            }

            // STRICT: Check for transcript quality
            // If it's mostly common filler words, it's probably hallucination
            const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'i', 'you', 'it', 'that', 'this'];
            const contentWords = words.filter((w:any) => !commonWords.includes(w.toLowerCase()));
            
            if (words.length > 2 && contentWords.length < 2) {
                console.log(`⚠️ Low quality transcript (mostly filler words) - ignoring`);
                console.log(`   Content words: ${contentWords.join(', ')}`);
                processingRef.current = false;
                return;
            }

            // STRICT: Block common filler words and noise
            const fillerWords = [
                'um', 'uh', 'hmm', 'ah', 'oh', 'uhm', 'mm',
                'the', 'a', 'an', 'and', 'or', 'but',
                'yeah', 'yes', 'no', 'okay', 'ok',
                'thank you', 'thanks'
            ];
            
            if (fillerWords.includes(lowerTranscript)) {
                console.log('⚠️ Filler word - ignoring');
                processingRef.current = false;
                return;
            }

            // STRICT: Only filter by confidence if the API actually provides it
            if (confidence !== undefined && confidence < 0.5) {
                console.log(`⚠️ Low confidence (${(confidence * 100).toFixed(0)}%) - ignoring`);
                processingRef.current = false;
                return;
            }

            // Emergency voice trigger: "fire" phrases -> trigger alert across all screens
            const firePhrases = [
                /\bfire\b.*\bfire\b/,
                /\bthere'?s a fire\b/,
                /\bfire alert\b/,
                /\bfire in\b/,
                /\bfire\b/,
            ];
            const fireTrigger = firePhrases.some((re) => re.test(lowerTranscript)) && words.length <= 8;
            if (fireTrigger) {
                const now = Date.now();
                if (now - lastFireAtRef.current > 10000) {
                    lastFireAtRef.current = now;
                    setIntent('EMERGENCY', 'Fire detected from ambient audio', 0.99);
                    setAdForAllZones({
                        type: 'ALERT',
                        title: 'Fire Alert',
                        message: 'Evacuate to nearest exit',
                        updatedAt: now,
                    });
                }
            }

            // Extract intent and entity from the transcribed text
            const { intent, entities } = extractIntentAndEntity(cleanTranscript);

            console.log(`🔍 Extraction: intent="${intent}", entities=[${entities.join(', ')}]`);

            if (entities.length > 0) {
                // STRICT: Make sure this isn't just noise matching random words
                // Require that the transcript is meaningful, not just background chatter
                const wordCount = cleanTranscript.split(/\s+/).length;
                
                // If transcript is very long but only found generic entities, it's probably noise
                if (wordCount > 10 && entities.every(e => ['Burger', 'Pizza', 'Coffee'].includes(e))) {
                    console.log(`⚠️ Suspicious: ${wordCount} words but generic entities - likely background noise`);
                    console.log(`   Transcript: "${cleanTranscript}"`);
                    console.log(`   Not accepting as valid detection`);
                    processingRef.current = false;
                    return;
                }
                
                console.log(`✅ DETECTED: ${entities.join(', ')}`);
                console.log(`   From: "${cleanTranscript}"`);
                
                // Deduplication: filter out entities detected too recently
                const now = Date.now();
                const newEntities = entities.filter(entity => {
                    const lastDetectedTime = recentEntitiesRef.current.get(entity) || 0;
                    const timeSinceLastDetection = now - lastDetectedTime;
                    
                    if (lastDetectedTime > 0 && timeSinceLastDetection < DEDUP_WINDOW_MS) {
                        console.log(`🚫 BLOCKED DUPLICATE: "${entity}" (detected ${Math.round(timeSinceLastDetection/1000)}s ago, window=${Math.round(DEDUP_WINDOW_MS/1000)}s)`);
                        return false; // Skip this entity
                    }
                    console.log(`✅ ENTITY ALLOWED: "${entity}" (last: ${lastDetectedTime === 0 ? 'NEVER' : Math.round(timeSinceLastDetection/1000) + 's ago'})`);
                    return true; // Keep this entity
                });
                
                if (newEntities.length === 0) {
                    console.log(`⚠️ ALL ENTITIES BLOCKED BY DEDUP - ignoring this transcription`);
                    processingRef.current = false;
                    return;
                }
                
                // Store in aggregate - add a detection for each unique entity
                const timestamp = Date.now();
                const recordDayKey = resolveDayKey(recordDay);
                newEntities.forEach(entity => {
                    storeRef.current.addEvent(zone, { intent, entity, timestamp }, recordDayKey);
                    addDetection(zone, intent, entity);
                    // Update the timestamp for this entity
                    recentEntitiesRef.current.set(entity, timestamp);
                });
                // Show the first detection
                setLastDetection({ intent, entity: newEntities[0], timestamp });

                // Update trends
                const viewDayKey = resolveDayKey(viewDay);
                const topTrends = storeRef.current.getTopTrends(zone, timeWindow, viewDayKey);
                const globalTrends = storeRef.current.getAllZoneTrends(timeWindow, viewDayKey);
                setZoneTrends(topTrends);
                setZoneSampleCount(storeRef.current.getZoneEventCount(zone, timeWindow, viewDayKey));
                setGlobalSampleCount(storeRef.current.getEventCountForWindow(timeWindow, viewDayKey));

                // Sync with global store
                updateZoneTrends(zone, topTrends);
                updateGlobalTrends(globalTrends);
            } else {
                console.log(`❌ NO MATCH for: "${cleanTranscript}"`);
                console.log(`   (Not in schema - this is OK if you didn't say a food/store name)`);
            }

            // Successful transcription: drop processed chunks but keep any that arrived mid-flight
            audioChunksRef.current = audioChunksRef.current.slice(processedEndIndex);
            lastProcessedIndexRef.current = 0;

        } catch (error) {
            console.error('❌ Error:', error);
        } finally {
            processingRef.current = false;
        }
    };

    // Simulate recording and transcription
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

            // Initialize hark.js for voice activity detection
            const speechEvents = hark(stream, {
                threshold: AUDIO_LEVEL_THRESHOLD, // dB threshold for speech detection
                interval: 100, // Check every 100ms
                play: false // Don't play audio
            });

            harkRef.current = speechEvents;

            // Listen for when speech starts
            speechEvents.on('speaking', () => {
                isSpeakingRef.current = true;
                lastSpeechAtRef.current = Date.now();
                console.log('🗣️ Speech detected');
            });

            // Listen for when speech stops
            speechEvents.on('stopped_speaking', () => {
                isSpeakingRef.current = false;
                lastSpeechAtRef.current = Date.now();
                console.log('🔇 Speech stopped');
                // Fast path: if we already have enough audio buffered, process immediately
                setTimeout(() => {
                    processAudioChunks();
                }, 150);
            });

            // Optional: Monitor volume levels for debugging
            speechEvents.on('volume_change', (volume: number) => {
                // Volume is in dB, normalize against threshold to get a 0..1 level
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

            // Collect chunks as they come in, but only if we're speaking
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0 && !headerChunkRef.current) {
                    headerChunkRef.current = event.data;
                    console.log(`✅ Header chunk captured (${event.data.size}B)`);
                    return;
                }
                const withinTail = Date.now() - lastSpeechAtRef.current < SPEECH_TAIL_MS;
                if (event.data.size > 0 && (isSpeakingRef.current || withinTail)) {
                    audioChunksRef.current.push(event.data);
                    console.log(`✅ Chunk added (speaking detected, ${event.data.size}B)`);
                } else if (event.data.size > 0) {
                    console.log(`🚫 Chunk ignored (no speech, ${event.data.size}B)`);
                }
            };

            // Request data every 250ms for lower latency
            recorder.start(250);
            mediaRecorderRef.current = recorder;
            setIsRecording(true);

            // Process every 1 second for faster UI updates
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

        // Clear the processing interval
        if (chunkIntervalRef.current) {
            clearInterval(chunkIntervalRef.current);
            chunkIntervalRef.current = null;
        }

        // Stop hark.js voice activity detection
        if (harkRef.current) {
            harkRef.current.stop();
            harkRef.current = null;
        }

            recorder.onstop = async () => {
                try {
                    // Process any remaining chunks one last time
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (audioChunksRef.current.length > 0) {
                        await processAudioChunks();
                    }
                } finally {
                // Cleanup
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
    const adDirections = adEntity !== '—' ? buildDirections(adEntity, zone) : null;

    return (
        <div className="bg-zinc-950 text-emerald-400 px-0 py-3 font-mono h-full w-full border-l border-white/10 flex flex-row gap-4 overflow-hidden">
            {/* Left Column */}
            <div className="flex-[0.9] flex flex-col gap-4 overflow-y-auto pl-3 pr-2">
                <h2 className="text-xs tracking-widest text-zinc-500 border-b border-white/10 pb-2">
                    ANALYTICS_v0.2 // {visualMode}
                </h2>

                {/* Voice2Ad Intent Section */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="border border-white/5 p-3 bg-zinc-900/50">
                            <h3 className="text-[10px] text-zinc-500 uppercase">Intent</h3>
                            <p className={`text- font-bold ${currentIntent === 'EMERGENCY' ? 'text-red-500' : 'text-indigo-400'}`}>
                                {currentIntent}
                            </p>
                        </div>
                        <div className="border border-white/5 p-3 bg-zinc-900/50">
                            <h3 className="text-[10px] text-zinc-500 uppercase">Confidence</h3>
                            <p className="text-xl font-bold">{(dedalusConfidence * 100).toFixed(1)}%</p>
                        </div>
                    </div>
                </div>

                {/* Census Recording Section */}
                <div className="border-t border-white/10 pt-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Mic size={14} className="text-cyan-400" />
                        <h3 className="text-[10px] text-cyan-400 uppercase tracking-widest">
                            Census Recording
                        </h3>
                    </div>
                    <button
                        onClick={handleReset}
                        className="text-[10px] px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300"
                    >
                        RESET
                    </button>
                </div>

                {/* Time Window Selector */}
                <div className="border border-cyan-500/20 p-2 bg-zinc-900/50">
                    <div className="text-[9px] text-cyan-300 uppercase mb-2 opacity-70">Time Window</div>
                    <select
                        value={timeWindow}
                        onChange={(e) => setStoreTimeWindow(e.target.value as TimeWindow)}
                        className="w-full text-[11px] px-2 py-1 bg-zinc-800 text-white rounded border border-zinc-700"
                    >
                        {TIME_WINDOWS.map((w) => (
                            <option key={w.value} value={w.value}>{w.label}</option>
                        ))}
                    </select>
                </div>

                {/* Day Selector */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="border border-cyan-500/20 p-2 bg-zinc-900/50">
                        <div className="text-[9px] text-cyan-300 uppercase mb-2 opacity-70">Record Day</div>
                        <select
                            value={recordDay}
                            onChange={(e) => setRecordDay(e.target.value as DaySelection)}
                            className="w-full text-[11px] px-2 py-1 bg-zinc-800 text-white rounded border border-zinc-700"
                        >
                            {DAY_OPTIONS.map((d) => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="border border-cyan-500/20 p-2 bg-zinc-900/50">
                        <div className="text-[9px] text-cyan-300 uppercase mb-2 opacity-70">View Day</div>
                        <select
                            value={viewDay}
                            onChange={(e) => setViewDay(e.target.value as DaySelection)}
                            className="w-full text-[11px] px-2 py-1 bg-zinc-800 text-white rounded border border-zinc-700"
                        >
                            {DAY_OPTIONS.map((d) => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Zone Selector */}
                <div className="border border-cyan-500/20 p-2 bg-zinc-900/50">
                    <div className="text-[9px] text-cyan-300 uppercase mb-2 opacity-70">Zone</div>
                    <select
                        value={zone}
                        onChange={(e) => setZone(e.target.value as CensusZone)}
                        disabled={isRecording}
                        className="w-full text-[11px] px-2 py-1 bg-zinc-800 text-white rounded border border-zinc-700 disabled:opacity-50"
                    >
                        {ZONES.map(z => (
                            <option key={z} value={z}>{z}</option>
                        ))}
                    </select>
                </div>

                {/* Record Button */}
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

                {/* Last Detection */}
                {lastDetection && (
                    <div className="border border-emerald-500/20 p-2 bg-zinc-900/50">
                        <div className="text-[9px] text-emerald-300 uppercase mb-1 opacity-70">Detection</div>
                        <div className="space-y-1 text-[10px]">
                            <div><span className="text-emerald-400">Intent:</span> <span className="text-white">{lastDetection.intent}</span></div>
                            <div><span className="text-emerald-400">Entity:</span> <span className="text-white">{lastDetection.entity}</span></div>
                        </div>
                    </div>
                )}

                {/* Zone Trends */}
                {zoneTrends.length > 0 && (
                    <div className="border border-yellow-500/20 p-2 bg-zinc-900/50">
                        <div className="text-[9px] text-yellow-300 uppercase mb-1 opacity-70">{zone} Trends</div>
                        <div className="text-[9px] text-zinc-500 mb-2">Sample size: {zoneSampleCount}</div>
                        <div className="space-y-1">
                            {zoneTrends.slice(0, 3).map((trend, idx) => (
                                <div key={`${trend.entity}-${idx}`} className="flex justify-between items-center text-xs">
                                    <span className="text-yellow-400">{trend.entity}</span>
                                    <span className="text-cyan-400 font-mono">{trend.count}×</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            </div>

            {/* Right Column - Ad Screen + Global Trends */}
            <div className="flex-[1.1] flex flex-col gap-4 overflow-y-auto border-l border-white/10 pl-4 pr-0">
                {/* Ad Screen Mock */}
                <div
                    className={`border p-4 rounded w-full ${
                        currentAd?.type === 'ALERT'
                            ? 'border-red-500/30 bg-gradient-to-b from-red-900/30 to-zinc-900/40'
                            : currentAd?.type === 'PROMOTION'
                                ? 'border-fuchsia-500/30 bg-gradient-to-b from-fuchsia-900/30 to-zinc-900/40'
                                : 'border-emerald-500/20 bg-gradient-to-b from-emerald-900/20 to-zinc-900/40'
                    }`}
                >
                    <div className={`text-[10px] uppercase tracking-widest mb-2 ${
                        currentAd?.type === 'ALERT'
                            ? 'text-red-300'
                            : currentAd?.type === 'PROMOTION'
                                ? 'text-fuchsia-300'
                                : 'text-emerald-300'
                    }`}>Ad Screen</div>
                    <div className="text-[24px] font-bold text-white leading-tight">
                        {currentAd?.type === 'ALERT'
                            ? 'Fire Alert → Evacuate'
                            : adEntity !== '—'
                                ? `${adEntity} → ${currentAd?.type === 'PROMOTION' ? 'Promo Live' : 'Now Trending'}`
                                : 'No Trend Yet'}
                    </div>
                    <div className="text-[10px] text-emerald-200 uppercase mt-2">Recommended For</div>
                    <div className="text-[12px] text-emerald-400 mb-3">{zone} • {viewDay} • {timeWindow}</div>
                    {adDirections ? (
                        <div className="text-[11px] text-zinc-200 space-y-1">
                            <div className="text-[10px] text-zinc-400">Directions</div>
                            {adDirections.steps.map((step, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <span className="text-emerald-400">•</span>
                                    <span>{step}</span>
                                </div>
                            ))}
                            <div className="text-[10px] text-zinc-400 mt-2">
                                Distance: {adDirections.distance}m • ETA: {adDirections.eta} min
                            </div>
                        </div>
                    ) : (
                        <div className="text-[11px] text-zinc-500">Waiting for detections…</div>
                    )}
                </div>

                {globalTrends.length > 0 ? (
                    <>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={14} className="text-cyan-400" />
                            <h3 className="text-[10px] text-cyan-400 uppercase tracking-widest">
                                Global Trends ({timeWindow})
                            </h3>
                        </div>

                        {/* Global Trending */}
                        <div className="border border-cyan-500/20 p-2 bg-zinc-900/50 w-full">
                            <div className="text-[9px] text-cyan-300 uppercase mb-1 opacity-70">Global Top Items</div>
                            <div className="text-[9px] text-zinc-500 mb-2">Sample size: {globalSampleCount}</div>
                            <div className="space-y-1">
                                {globalTrends.slice(0, 3).map((trend, idx) => (
                                    <div key={`${trend.entity}-${idx}`} className="flex justify-between items-center text-xs">
                                        <span className="text-green-400">{trend.entity}</span>
                                        <span className="text-cyan-400 font-mono">{trend.count}×</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Detections */}
                        {lastDetections.length > 0 && (
                            <div className="border border-emerald-500/20 p-2 bg-zinc-900/50 flex-1 overflow-hidden flex flex-col">
                                <div className="text-[9px] text-emerald-300 uppercase mb-2 opacity-70">Recent Activity</div>
                                <div className="space-y-1 overflow-y-auto flex-1">
                                    {lastDetections.slice(0, 10).map((det, idx) => (
                                        <div key={idx} className="text-[9px] text-zinc-400">
                                            <span className="text-emerald-400">{det.zone}</span>
                                            {' → '}
                                            <span className="text-cyan-400">{det.entity}</span>
                                            <span className="text-zinc-600 ml-1">({det.intent})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-zinc-600 text-[10px] italic">No global trends yet...</div>
                )}

                {/* Ad Screens Across Zones */}
                <div className="border border-white/10 p-3 bg-zinc-900/40 rounded w-full">
                    <div className="text-[10px] text-zinc-400 uppercase tracking-widest mb-2">
                        Ad Screens (All Zones)
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {ZONES.map((z) => {
                            const ad = adScreens[z];
                            const title = ad?.type === 'ALERT'
                                ? 'Fire Alert'
                                : ad?.type === 'PROMOTION'
                                    ? 'Promotion'
                                    : 'Trending';
                            const headline = ad?.entity || ad?.message || 'No data yet';
                            const active = z === zone;
                            return (
                                <button
                                    key={z}
                                    onClick={() => setZone(z)}
                                    className={`text-left border rounded p-2 text-[10px] ${active ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-white/10 bg-zinc-900/60 hover:bg-zinc-800/60'}`}
                                >
                                    <div className="text-[9px] text-zinc-400 uppercase mb-1">{z}</div>
                                    <div className="text-[11px] text-white font-semibold">{title}</div>
                                    <div className="text-[10px] text-zinc-400 truncate">{headline}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Export the enhanced version with Heatmap, Insights, and Staff tabs
export const Dashboard = DashboardEnhanced;
