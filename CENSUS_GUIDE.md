# Census Demo - Developer Guide

Complete reference for the Census ambient intent aggregation demo.

## Quick Start

```bash
npm run dev
# Navigate to http://localhost:5173/census
```

## How It Works

1. **Record** audio in a zone (Food Court, Atrium, West Wing, Entrance)
2. **Extract** intent + entity using rule-based NLP
3. **Discard** audio and transcript (never stored)
4. **Aggregate** anonymized counts per zone/time window
5. **Display** top 3 trending items and #1 demand on screen

## Architecture

**Three-Panel UI:**
- **Left (Recording):** Zone selector, record button, last detection
- **Middle (Trends):** Time window toggle (10m/1h), top 3 items with counts
- **Right (Screen):** Dynamic display of #1 trending demand

**Data Flow:**
```
Audio → Transcribe → Extract Intent/Entity → Discard Audio/Transcript → Store Aggregate → Update UI
```

**State Management:**
- All state in `CensusDemo.tsx`
- `DemandStore` handles aggregation
- In-memory (resets on page refresh)

## Intent/Entity Extraction

### Intents
- `FIND_STORE`: "where", "find", "locate"
- `PRODUCT_INTEREST`: "want", "need", "looking for"

### Entities
**Stores:** Crumbl, Auntie Anne's, Lululemon, Nike, Starbucks
**Categories:** Dessert, Sneakers, Coffee, Clothing, Apparel
**Colors:** "red shoes" → "Red shoes"
**Default:** "Other" (if no match)

## File Structure

```
frontend-shell/Census/
├── CensusDemo.tsx              # Main component
├── Toast.tsx                   # Notifications
├── panels/
│   ├── RecordingPanel.tsx
│   ├── TrendsPanel.tsx
│   └── ScreenDisplayPanel.tsx
└── index.ts                    # Barrel export

frontend-shell/utils/census/
├── intentExtractor.ts          # Rule-based NLP
├── demandStore.ts              # Aggregation logic
└── index.ts                    # Barrel export
```

## Demo Tips

- Record multiple phrases in same zone → trends converge
- Switch zones → see different trends
- Use time window toggle → compare 10m vs 1h
- Hit "Reset Demo" → clear data between runs
- Perfect length: 30–60 seconds

## Testing Phrases

| Phrase | Intent | Entity |
|--------|--------|--------|
| "Where is Crumbl?" | FIND_STORE | Crumbl |
| "Looking for sneakers" | PRODUCT_INTEREST | Sneakers |
| "Find boba near here" | FIND_STORE | Boba Tea |
| "Want coffee" | PRODUCT_INTEREST | Coffee |
| "Red shoes" | PRODUCT_INTEREST | Red shoes |

## Extend This Demo

### Real Speech-to-Text
Replace `simulateTranscription()` in `CensusDemo.tsx`:

```typescript
// Web Speech API
const recognition = new (window as any).webkitSpeechRecognition();
recognition.onresult = (e: any) => resolve(e.results[0][0].transcript);

// or OpenAI Whisper API, Google Cloud, etc.
```

### Add Confidence Scores
Show confidence % next to detections:
```typescript
interface CensusDetection {
  intent: string;
  entity: string;
  confidence: number; // 0-1
}
```

### Persist to Backend
Replace in-memory `DemandStore` with:
- IndexedDB (client-side)
- Backend API (Node.js + MongoDB)
- Firebase Realtime DB

### Multi-Zone Sync
Use WebSocket to sync trends across zones in real-time.

## Privacy Guarantees

✅ Audio processed ephemerally (discarded after transcription)
✅ No transcripts stored or displayed
✅ Only anonymized aggregate counts retained
✅ No external API calls for user data
✅ Rule-based extraction (no ML models)

---

See `README.md` for project overview.
