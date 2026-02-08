# Voice2Ad | Census Demo

Ambient voice‑intent aggregation system. **Sense → Think → Act** without storing conversations.

## Quick Start

```bash
npm install
npm run dev
```

Navigate to:
- `/` – Pitch Deck
- `/demo` – Live Demo (3D visualization + Dashboard + Census recording)

## ✨ What’s Included

- **Pitch Deck** built in React (Member 3)
- **3D Visualization** using React Three Fiber (Member 1)
- **Analytics Dashboard** with real‑time trends and detections (Member 2)
- **Census Ambient Intent Demo** integrated into the Dashboard

## 📁 Project Structure (Key Areas)

```
frontend-shell/
├── App.tsx                    # Route orchestrator (/ and /demo)
├── EventSimulator.tsx         # Demo controls + theme toggle
├── types.ts                   # Shared types
└── utils/
    ├── intentExtractor.ts     # Rule-based NLP
    └── demandStore.ts         # Aggregation + rolling windows

core/
├── store.ts                   # Global app state (intent + visuals)
└── censusStore.ts             # Census trends + ads per zone

members/
├── 1-threejs/                 # 3D scene (MainScene.tsx)
├── 2-dashboard/               # Dashboard + recording panels
└── 3-pitch/                   # Pitch deck
```

## 🎯 Census Demo (Integrated)

### How It Works

1. **Record** ambient audio in a zone
2. **Transcribe** audio via Dedalus Whisper API
3. **Extract** intent + entity (no transcript stored)
4. **Aggregate** anonymized counts per zone/time window
5. **Display** top trends, detections, and zone ads

### Zones
- Food Court
- Atrium
- West Wing
- Entrance

### Time Windows
- Last 10 minutes
- Last hour
- Noon–5pm
- Today

### Example
Record: *“Where can I find Crumbl cookies?”*
- **Intent:** FIND_STORE
- **Entity:** Crumbl
- **Result:** Trends and zone display update in real time

## Privacy

- ✅ Audio processed ephemerally (discarded after transcription)
- ✅ No transcripts stored
- ✅ Only anonymized intent + entity counts retained
- ✅ No user‑level data stored

## 🔧 Configuration

The Dashboard’s live transcription uses Dedalus Whisper. Set the API key:

```bash
VITE_DEDALUS_KEY=your_key_here
```

## 🛠️ Tech Stack

- React 18 + TypeScript
- Zustand (state)
- Tailwind CSS
- Three.js + React Three Fiber (3D)
- Lucide Icons
- Recharts (charts)
- Vite + Vitest

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview build
npm run lint      # Lint code
npm run test      # Run tests
```

## 🚀 Demo Tips

- Speak multiple phrases in the same zone to see trends converge
- Switch zones to compare regional demand
- Toggle time windows to see recency vs. broader trends

---

Built for HackGT | February 2026
