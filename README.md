# Voice2Ad | Census Hackathon Demo

Ambient voice-intent aggregation system. **Sense → Think → Act** without storing conversations.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Navigate to:
- `/` – Pitch Deck
- `/demo` – Voice2Ad (3D + Dashboard)
- `/census` – **Census Ambient Intent Demo** (NEW)

## 📁 Project Structure

```
frontend-shell/
├── Census/                    # Ambient intent demo
│   ├── CensusDemo.tsx         # Main component
│   ├── Toast.tsx
│   ├── panels/
│   │   ├── RecordingPanel.tsx
│   │   ├── TrendsPanel.tsx
│   │   └── ScreenDisplayPanel.tsx
│   └── index.ts               # Barrel export
│
├── utils/
│   └── census/                # Demo utilities
│       ├── intentExtractor.ts # Rule-based NLP
│       ├── demandStore.ts     # Aggregation + rolling windows
│       └── index.ts           # Barrel export
│
├── shared-types/              # Shared TypeScript types
├── App.tsx                    # Route orchestrator
└── ...
```

## 🎯 Census Demo

### How It Works

1. **Record** ambient audio in a zone
2. **Extract** intent + entity (no transcript stored)
3. **Aggregate** anonymized counts per zone/time window
4. **Display** trending demands dynamically

### Zones
- Food Court
- Atrium
- West Wing
- Entrance

### Time Windows
- Last 10 minutes
- Last hour

### Example
Record: *"Where can I find Crumbl cookies?"*
- **Intent:** FIND_STORE
- **Entity:** Crumbl
- **Result:** Screen displays "Crumbl → Level 1, Food Court"

## 🔐 Privacy

- ✅ Audio processed ephemerally (discarded after transcription)
- ✅ No transcripts stored
- ✅ Only anonymized intent + entity counts retained
- ✅ No external API calls for user data

## 📖 Documentation

- **CENSUS_GUIDE.md** – Complete Census reference (architecture, extending, testing)
- **README_MEMBER_*.md** – Team member documentation
- **README_LEAD_ENGINEER.md** – Lead's integration guide

## 🛠️ Tech Stack

- React 18 + TypeScript
- Zustand (state)
- Tailwind CSS
- Three.js + React Three Fiber (3D)
- Lucide Icons
- Recharts (charts)

## 📊 Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview build
npm run lint      # Lint code
npm run test      # Run tests
```

## 🚀 Next Steps

**To demo:** Go to `/census`, record phrases, watch trends update.

**To extend:** Read CENSUS_GUIDE.md → "Extend This Demo"

**To hand off:** All code is organized and documented. New developers can start immediately.

---

Built for HackGT | February 2026
    *   `feat/member1-visuals`
    *   `feat/member2-analytics`
    *   `feat/member3-pitch`
    *   *If you do not follow this, your PR will be closed.*

2.  **Folder Ownership:**
    *   Member 1 touches **ONLY** `/members/member1_threejs`
    *   Member 2 touches **ONLY** `/members/member2_dashboard`
    *   Member 3 touches **ONLY** `/members/member3_pitch_ui`
    *   *If you edit `/core` or `/frontend-shell`, your PR will be closed.*

3.  **Prohibited Actions:**
    *   ❌ Changing `package.json` (Ask Lead First)
    *   ❌ Editing `tsconfig.json`
    *   ❌ Formatting the whole codebase (Only format your folder)

4.  **PR Checklist:**
    *   [ ] My code is 100% inside my folder.
    *   [ ] I have updated my `/docs/progress/Member_X_Progress.md` file.
    *   [ ] I have tested my component in isolation.

---

## 🛡️ Safe Development Guarantees

*   **Dependency Locking:** The Lead Engineer owns `pnpm-lock.yaml`. You cannot break the build for others by adding a random conflicting package.
*   **Environment Variables:** All `.env` variables are read-only for members. If you need a key, ask the Lead to add it to the CI/CD pipeline or share it securely.
*   **Mock Data First:** The `/frontend-shell` provides a Mock Mode. You can build your entire feature without the backend running. This prevents "It works on my machine" issues.

---

## 🎨 Style & Quality Bar

*   **Code Quality:**
    *   No `console.log` in production code. Use the provided logger.
    *   No `any` types in TypeScript. Define your interfaces.
*   **Aesthetics:**
    *   **"Wow" Factor:** We are here to win. If it looks standard, it's not good enough.
    *   **Animation:** Everything must transition smoothly. No jarring cuts.

**[End of General Instructions - Go to your specific README now]**
