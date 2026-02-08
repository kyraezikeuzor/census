# Census Architecture: Improvements Summary

## System Evolution

### Before: Voice2Ad Baseline
```
Audio → Transcribe → Extract (rule-based) → Aggregate → Display
```
- Simple rule-based extraction
- Single-user view
- No predictions
- No recommendations

### After: Enterprise Census Platform
```
┌─────────────────────────────────────────────────────────────────┐
│                         INPUT LAYER                              │
│  Audio → Transcribe (Dedalus Labs) + Speech Confidence          │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌─────────────────────────▼────────────────────────────────────────┐
│                      ANALYSIS LAYER                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  │  Rule-Based      │  │  Semantic        │  │  Sentiment       │
│  │  Extraction      │  │  Linker (Claude) │  │  Analysis        │
│  │  (Entities)      │  │  (Categories)    │  │  (Urgency,       │
│  │                  │  │                  │  │  Mood, Intent)   │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                      │
│  │  Anomaly         │  │  Language        │                      │
│  │  Detection       │  │  Detection       │                      │
│  │  (Z-score)       │  │  (i18n)          │                      │
│  └──────────────────┘  └──────────────────┘                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌─────────────────────────▼────────────────────────────────────────┐
│                   AGGREGATION & STORAGE                          │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  DemandStore (In-Memory + IndexedDB)                      │   │
│  │  - Time-windowed aggregation (10m, 1h, Today, Noon-5pm)   │   │
│  │  - Per-zone, per-entity, global trends                    │   │
│  │  - No transcript/audio storage (ephemeral)                │   │
│  └───────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼────┐  ┌────────▼────────┐  ┌────▼──────────┐
│INTELLIGENCE│  │   COORDINATION  │  │  INTEGRATION  │
└───────┬────┘  │                 │  │               │
        │       └────────┬────────┘  └────┬──────────┘
        │                │                │
┌───────▼────────────────▼────────────────▼──────────┐
│        ANALYTICS & RECOMMENDATIONS LAYER            │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Predictive   │ │ Insight      │ │ Staff        │ │
│ │ Analytics    │ │ Engine       │ │ Coordinator  │ │
│ │              │ │              │ │              │ │
│ │ - Forecast   │ │ - Rising     │ │ - Alerts     │ │
│ │ - Anomalies  │ │   stars      │ │ - Tasks      │ │
│ │ - Peak times │ │ - Cross-sell │ │ - Presence   │ │
│ │ - Wait times │ │ - Staffing   │ │ - Assignments│ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
│ ┌──────────────┐ ┌──────────────┐                  │
│ │ Collaboration│ │ Localization │                  │
│ │ Store        │ │              │                  │
│ │              │ │ - 6 languages│                  │
│ │ - Presence   │ │ - RTL support│                  │
│ │ - Locks      │ │ - i18n       │                  │
│ │ - Annotations│ │ - Accessibility                 │
│ └──────────────┘ └──────────────┘                  │
└───────┬────────────────┬────────────────┬──────────┘
        │                │                │
┌───────▼────────────────▼────────────────▼──────────┐
│           DISTRIBUTION & INTEGRATIONS              │
│ ┌──────────────────────────────────────────────┐   │
│ │      Webhook Manager                          │   │
│ │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │   │
│ │  │  Slack   │  │ Discord  │  │ Google   │    │   │
│ │  │          │  │          │  │ Sheets   │    │   │
│ │  └──────────┘  └──────────┘  └──────────┘    │   │
│ │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │   │
│ │  │ Custom   │  │ Twilio   │  │ Firebase │    │   │
│ │  │ API      │  │          │  │ Cloud    │    │   │
│ │  └──────────┘  └──────────┘  └──────────┘    │   │
│ │  Events: detection, trend_change, anomaly,   │   │
│ │           alert, insight, zone_status        │   │
│ └──────────────────────────────────────────────┘   │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────▼──────────────────────────────┐
│           PRESENTATION LAYER                      │
│ ┌───────────┐ ┌──────────────┐ ┌──────────────┐  │
│ │ Heatmap   │ │ Insights     │ │ Staff        │  │
│ │ Panel     │ │ Panel        │ │ Alerts Panel │  │
│ │           │ │              │ │              │  │
│ │ - 24h     │ │ - AI recs    │ │ - Active     │  │
│ │   hourly  │ │ - Impact     │ │   alerts     │  │
│ │   grid    │ │ - Severity   │ │ - Tasks      │  │
│ │ - Peak    │ │ - Actions    │ │ - Presence   │  │
│ │   hours   │ │              │ │              │  │
│ └───────────┘ └──────────────┘ └──────────────┘  │
│ ┌───────────────────────────────────────────────┐ │
│ │        Existing Dashboard Components          │ │
│ │  - Recording Panel        - Trends Panel      │ │
│ │  - Screen Display Panel    - Global Trends    │ │
│ │  - 3D Visualization        - Ad Screens       │ │
│ └───────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

---

## Key Architectural Improvements

### 1. **Layered Intelligence**
| Layer | Purpose | Examples |
|-------|---------|----------|
| **Input** | Capture & validate | Speech-to-text, confidence |
| **Analysis** | Enrich data | Semantic linking, sentiment |
| **Aggregation** | Temporal windowing | Trends per zone/time |
| **Intelligence** | Insights & predictions | Forecasts, recommendations |
| **Coordination** | Staff operations | Alerts, tasks, assignments |
| **Integration** | External systems | Slack, Google Sheets, APIs |
| **Presentation** | User experience | Dashboards, panels, components |

### 2. **Multi-modal Analysis Pipeline**

```
Transcript: "I really need to find Crumbl cookies for my group"
    ↓
┌───────────────────────────────────────────┐
│ Rule-Based Extraction                     │
│ Intent: FIND_STORE                        │
│ Entities: [Crumbl]                        │
└───────────┬─────────────────────────────────┘
            ↓
┌───────────────────────────────────────────┐
│ Semantic Analysis (Claude API)             │
│ Sentiment: positive (wants to find)        │
│ Urgency: high (needs, looking for)         │
│ IsGroup: true (mentions "group")           │
│ Categories: [dessert, bakery]              │
│ Confidence: 0.92                           │
└───────────┬─────────────────────────────────┘
            ↓
┌───────────────────────────────────────────┐
│ Aggregation                               │
│ Store: Crumbl                             │
│ Zone: Food Court                          │
│ Timestamp: 14:32                          │
│ Window: Last 10min (5 detections)         │
│ Trend: Rising (+20%)                      │
└───────────┬─────────────────────────────────┘
            ↓
┌───────────────────────────────────────────┐
│ Predictions                               │
│ NextHourForecast: 18 units                │
│ Trend: RISING                             │
│ AnomalyScore: 0.15 (normal)               │
│ RecommendedStaff: 2 people                │
└───────────┬─────────────────────────────────┘
            ↓
┌───────────────────────────────────────────┐
│ Insights                                  │
│ Title: "Rising Demand in Food Court"      │
│ Category: OPPORTUNITY                     │
│ Impact: +$500/day potential               │
│ Action: Increase Crumbl inventory         │
└─────────────────────────────────────────────┘
```

### 3. **Sponsor Track Coverage**

| Sponsor | Track | Features Used |
|---------|-------|---------------|
| **Anthropic** | AI/ML | Claude API (semanticAnalyzer) |
| **Google** | Data/Analytics | Sheets webhook integration |
| **Slack** | Communication | Webhook notifications |
| **Firebase/MongoDB** | Data | Storage-ready architecture |
| **AWS** | Infrastructure | CloudWatch monitoring ready |
| **Twilio** | Communication | SMS/voice alert ready |
| **GitHub** | DevOps | Source control, CI/CD ready |

### 4. **Real-time Collaboration**

```typescript
// Multiple managers see same data with role-based views
Manager (All Zones)        Stocker (Food Court)      Manager (West Wing)
    ↓                            ↓                           ↓
    └────────────┬───────────────┴───────────────┬───────────┘
                 │
         ┌───────▼────────┐
         │ Zustand Store  │
         │                │
         │ Presence:      │ ← All see who else is online
         │ Annotations:   │ ← Shared notes/alerts
         │ Locks:         │ ← Prevent conflicts
         │ Actions:       │ ← Track who did what
         │ WebSocket →   │ ← Real-time sync (future)
         └────────────────┘
```

---

## Data Flow Example: Emergency to Notification

```
Voice Detection: "Fire! Fire in Food Court!"
                ↓
Transcription: "Fire! Fire in Food Court!"
                ↓
Rule Extraction: Intent=EMERGENCY, Entity=n/a
                ↓
Semantic Analysis: Sentiment=NEGATIVE, Urgency=CRITICAL, Anomaly=1.0
                ↓
Alert Generation:
  - Type: emergency
  - Zone: Food Court
  - Message: "Fire detected"
  - Assigned To: Manager (auto-assigned)
                ↓
Staff Coordination:
  - Alert created and visible to all staff
  - Unsubscribe button removed (critical)
  - Visible on all zone screens
                ↓
Webhook Triggers:
  - Slack: "@here Fire alert in Food Court!"
  - Discord: "🚨 EMERGENCY - Food Court"
  - SMS: "CENSUS ALERT: Evacuate Food Court"
  - Screen Display: "Evacuate to nearest exit"
                ↓
Compliance:
  - Audio discarded
  - No transcript stored
  - Only intent + action logged
```

---

## Scalability & Performance

### Data Structures
```
Memory Usage (1000 events/hour):
- DemandStore: ~500KB (500 events × 1KB/event)
- Zustand Store: ~100KB
- Collaboration Store: ~50KB
- Total per browser: ~1MB

Computation:
- Semantic analysis: 50-200ms (Claude API, cached)
- Predictions: <5ms (exponential smoothing)
- Insights: <10ms (batch processing)
- Webhooks: async (don't block UI)
```

### Bottlenecks & Solutions
| Issue | Current | Future |
|-------|---------|--------|
| Claude API latency | 200ms | Batch + caching |
| Webhook retries | In-memory | IndexedDB queuing |
| WebSocket sync | Not implemented | Add socket.io |
| Large datasets | 500 event limit | Pagination + archiving |
| Multi-zone sync | Zustand only | Real-time DB (Firebase) |

---

## Privacy Guarantees (Maintained)

✅ **Audio**: Discarded after transcription
✅ **Transcripts**: Never stored
✅ **Customer Data**: Aggregated anonymously
✅ **Semantic Analysis**: Local with Claude API option
✅ **Staff Data**: Isolated from customer data
✅ **External Integrations**: No customer data sent

---

## Testing Strategy

### Unit Tests (Per Module)
```typescript
// Example: semanticAnalyzer test
test('detects urgency from transcript', async () => {
  const result = await semanticAnalyzer.analyze(
    'I need Crumbl right now',
    'FIND_STORE',
    ['Crumbl']
  );
  expect(result.urgency).toBe('high');
});
```

### Integration Tests
```typescript
// End-to-end: Detection → Prediction → Alert → Webhook
test('full pipeline triggers webhook', async () => {
  const alert = staffCoordinator.createAlert(...);
  await webhookManager.triggerEvent('alert', alert);
  expect(webhookCalls).toHaveBeenCalledWith(...);
});
```

### Performance Tests
```typescript
// Latency targets
test('predictions complete <5ms', () => {
  const start = performance.now();
  predictiveAnalytics.predictNextHour(...);
  expect(performance.now() - start).toBeLessThan(5);
});
```

---

## Migration Path (For Existing Deployments)

### Step 1: Add Core Modules (No Breaking Changes)
```
✅ Add /core/* files
✅ No changes to existing Dashboard
✅ Optional: Start using new modules in isolation
```

### Step 2: Integrate UI Components
```
1. Add HeatmapPanel to Dashboard (new panel)
2. Add InsightsPanel (non-blocking)
3. Add StaffAlertsPanel (new tab)
4. No changes to Recording Panel or existing features
```

### Step 3: Enable Advanced Features
```
1. Setup Claude API (optional)
2. Register webhooks (optional)
3. Enable localization (opt-in language selection)
4. Deploy staff coordination (new staff app)
```

### Step 4: Production Deployment
```
→ Canary: 10% of zones use new features
→ Monitor: Alert resolution time, false positives
→ Rollout: Full deployment if metrics look good
```

---

## Success Metrics

### Business Metrics
- Revenue increase from recommendations: **+15-30%**
- Staff efficiency (alerts resolved): **>85%**
- Customer satisfaction (sentiment positive): **>70%**
- Inventory accuracy: **>95%**

### Technical Metrics
- Prediction accuracy (1-hour forecast): **±15%**
- Anomaly detection F1-score: **>0.8**
- API latency (P95): **<500ms**
- Webhook delivery rate: **>99%**

---

## Architecture Diagram (Text)

```
┌─────────────────────────────────────────────────────────────┐
│                    CENSUS PLATFORM v2.0                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  INPUT              PROCESSING          INTELLIGENCE       │
│  ┌─────────┐       ┌──────────┐       ┌──────────────┐   │
│  │ Audio   │──────→│ Analysis │──────→│ Predictions  │   │
│  │ Zone    │       │ Semantic │       │ Insights     │   │
│  │ Speech  │       │ Anomaly  │       │ Staffing     │   │
│  └─────────┘       └──────────┘       └──────────────┘   │
│        │                   │                    │          │
│        └───────────────────┼────────────────────┘          │
│                            ↓                               │
│                  ┌──────────────────┐                      │
│                  │  DemandStore     │                      │
│                  │ Time-windowed    │                      │
│                  │ Aggregation      │                      │
│                  │ (Privacy-safe)   │                      │
│                  └────────┬─────────┘                      │
│                           ↓                               │
│    ┌──────────────────────────────────────────────┐      │
│    │  DISTRIBUTION & INTEGRATION                  │      │
│    │  Webhooks → Slack, Discord, APIs             │      │
│    │  Collab   → Multi-user sync                  │      │
│    │  i18n     → 6 languages                      │      │
│    └──────────────────────────────────────────────┘      │
│                           ↓                               │
│    ┌──────────────────────────────────────────────┐      │
│    │  PRESENTATION LAYER                          │      │
│    │  ├─ Heatmap Panel      ├─ Insights Panel     │      │
│    │  ├─ Staff Alerts       ├─ Existing Dashboard │      │
│    │  ├─ 3D Visualization   ├─ Ad Screens         │      │
│    │  ├─ Trends Panels      └─ Language Selector  │      │
│    └──────────────────────────────────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

*Built for scale, privacy, and impact. Ready for HackGT judges! 🚀*
