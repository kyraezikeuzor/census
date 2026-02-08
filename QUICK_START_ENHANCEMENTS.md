# Quick Start: Using Census Enhancements

Get started with the new features in 5 minutes.

---

## ⚡ 1. Enable Claude Semantic Analysis

Add to your `.env.local`:
```
VITE_CLAUDE_API_KEY=sk-ant-xxxxx
```

Update Dashboard.tsx to use it:
```typescript
import { semanticAnalyzer } from '@core/semanticAnalyzer';

// In processAudioChunks, after transcription:
const semantic = await semanticAnalyzer.analyze(
  cleanTranscript,
  intent,
  entities
);

console.log('Sentiment:', semantic.sentiment);
console.log('Urgency:', semantic.urgency);
console.log('Linked Categories:', semantic.linkedCategories);
```

**Result:** Voice inputs now understood at semantic level with sentiment, urgency, and context.

---

## 📊 2. Add Heatmap to Dashboard

In [Dashboard.tsx](members/2-dashboard/Dashboard.tsx), import and display:

```typescript
import { HeatmapPanel } from './panels/HeatmapPanel';

// Create heatmap data from trends
const heatmapData = {
  zones: ['Food Court', 'Atrium', 'West Wing', 'Entrance'],
  hourly: {
    'Food Court': [10, 15, 25, 40, 50, 45, ...], // 0-23 hours
    'Atrium': [5, 8, 12, 20, 30, ...],
    // ... other zones
  },
  current: {
    'Food Court': 50,
    'Atrium': 30,
    'West Wing': 20,
    'Entrance': 15,
  },
};

// In your JSX:
<HeatmapPanel data={heatmapData} maxValue={100} />
```

**Result:** Managers see zone demand intensity with peak hour visualization.

---

## 💡 3. Display AI Insights

```typescript
import { InsightsPanel } from './panels/InsightsPanel';
import { insightEngine } from '@core/insightEngine';

// Generate insights from current data
const insights = insightEngine.generateInsights(
  zoneTrends,      // Record<string, Array<{ entity, count }>>
  globalTrends,    // Array<{ entity, count }>
  historicalData   // Map<string, number[]>
);

// In your JSX:
<InsightsPanel
  insights={insights}
  onActionClick={(insight) => {
    console.log('Acting on:', insight.recommendation);
  }}
/>
```

**Result:** Automatic business recommendations (cross-sell, staffing, promotions).

---

## 👥 4. Setup Staff Alerts

```typescript
import { staffCoordinator } from '@core/staffCoordination';

// On app start, register staff
staffCoordinator.registerStaff('staff1', 'Alice', 'Food Court', 'manager');
staffCoordinator.registerStaff('staff2', 'Bob', 'Food Court', 'stocker');

// Create alert when demand spikes
staffCoordinator.createAlert(
  'high_demand',
  'Food Court',
  'Crumbl',
  'Expected 150+ orders in next hour',
  'high'
);

// Listen for alerts in your UI
const unsubscribe = staffCoordinator.onAlert((alert) => {
  console.log('New alert:', alert.message);
  // Send push notification, SMS, etc.
});
```

Add to Dashboard:
```typescript
import { StaffAlertsPanel } from './panels/StaffAlertsPanel';

const activeAlerts = staffCoordinator.getActiveAlerts();
const tasks = staffCoordinator.getZoneTasks(currentZone);

<StaffAlertsPanel
  activeAlerts={activeAlerts}
  activeTasks={tasks}
  staffOnline={staffMembers}
/>
```

**Result:** Staff see live alerts and tasks with auto-assignment.

---

## 🔗 5. Setup Slack Notifications

Add to your `.env.local`:
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
```

Register webhook:
```typescript
import { webhookManager, WEBHOOK_TEMPLATES } from '@core/webhookManager';

webhookManager.loadEndpoints();
webhookManager.registerEndpoint(
  WEBHOOK_TEMPLATES.slack(import.meta.env.SLACK_WEBHOOK_URL)
);
```

Trigger events:
```typescript
// When high-demand alert created
webhookManager.triggerEvent('alert', {
  zone: 'Food Court',
  entity: 'Crumbl',
  urgency: 'high',
  expectedOrders: 150,
});

// When insight generated
webhookManager.triggerEvent('insight', {
  title: 'Rising Demand',
  recommendation: 'Increase staff by 2 people',
  impact: '+$2000/day potential',
});
```

**Result:** Slack channel gets real-time notifications of alerts and opportunities.

---

## 📈 6. Add Demand Predictions

```typescript
import { predictiveAnalytics } from '@core/predictiveAnalytics';

// After collecting trend data
const prediction = predictiveAnalytics.predictNextHour(
  'Crumbl',
  currentTrendCount,  // e.g., 50
  recentCounts        // e.g., [45, 48, 50, 49, 52]
);

console.log('Next hour forecast:', prediction.nextHourForecast); // ~51
console.log('Trend:', prediction.trend);                       // 'rising'
console.log('Anomaly score:', prediction.anomalyScore);        // 0.1 (normal)

// Staff recommendations based on forecast
const staffRecs = predictiveAnalytics.recommendStaffing(
  predictions
);
// { 'Crumbl': 2 staff, 'Auntie Anne's': 1 staff, ... }
```

**Result:** Predict demand 1 hour ahead, recommend proactive staffing.

---

## 🌍 7. Enable Multi-language UI

```typescript
import { localization } from '@core/localization';

// On app init
localization.loadLanguage(); // Load saved preference
localization.detectLanguage(); // Auto-detect if first time

// Set language from UI
const handleLanguageChange = (lang) => {
  localization.setLanguage(lang);
  setCurrentLanguage(lang);
  // Re-render to pick up new strings
};

// In your components
const recordText = localization.t('ui.recordButton'); // "Record" / "Grabar" / "录音"
const resetText = localization.t('ui.reset');

// Format numbers/dates
const formatted = localization.formatDate(new Date());
const number = localization.formatNumber(1234.56);
```

Add language selector:
```typescript
{localization.getSupportedLanguages().map(lang => (
  <button key={lang.code} onClick={() => handleLanguageChange(lang.code)}>
    {lang.name}
  </button>
))}
```

**Result:** Support Spanish, Chinese, Arabic, French, Japanese users.

---

## 🔍 8. Real-time Collaboration (Team View)

```typescript
import { useCollaborationStore, createUser, createAnnotation } from '@core/collaborationStore';

const store = useCollaborationStore();

// On login
const user = createUser('user123', 'Alice', 'manager', 'Food Court');
store.setCurrentUser(user);
store.updatePresence(user);

// Share observations
store.addAnnotation(
  createAnnotation(
    'user123',
    'Food Court',
    'Crumbl line super long, customers leaving',
    'alert',
    'Crumbl'
  )
);

// Lock entity to prevent conflicts
const got = store.acquireLock('entity', 'Crumbl', 'user123');
if (got) {
  // Make changes...
  store.releaseLock('entity', 'Crumbl');
}

// In UI, show active users and their annotations
const activeUsers = store.activeUsers;
const zoneAnnotations = store.annotations.filter(a => a.zone === currentZone);
```

**Result:** Multiple managers see what each other are doing in real-time.

---

## 📋 Minimal Integration Example

```typescript
// minimal-integration.ts
import { semanticAnalyzer } from '@core/semanticAnalyzer';
import { insightEngine } from '@core/insightEngine';
import { predictiveAnalytics } from '@core/predictiveAnalytics';
import { staffCoordinator } from '@core/staffCoordination';
import { webhookManager } from '@core/webhookManager';

export async function processNewDetection(
  zone: string,
  entity: string,
  transcript: string,
  currentCount: number,
  zoneTrends: Record<string, any>,
  globalTrends: any[]
) {
  // 1. Semantic analysis
  const semantic = await semanticAnalyzer.analyze(
    transcript,
    'FIND_STORE',
    [entity]
  );

  // 2. Predict impact
  const prediction = predictiveAnalytics.predictNextHour(
    entity,
    currentCount,
    [currentCount - 5, currentCount - 2, currentCount]
  );

  // 3. Generate insights
  const insights = insightEngine.generateInsights(
    zoneTrends,
    globalTrends,
    new Map()
  );

  // 4. Alert staff
  if (prediction.trend === 'rising' && prediction.anomalyScore > 0.7) {
    staffCoordinator.createAlert(
      'high_demand',
      zone,
      entity,
      `Anomalous surge detected for ${entity}`,
      'high'
    );
  }

  // 5. Notify external systems
  webhookManager.triggerEvent('detection', {
    zone,
    entity,
    sentiment: semantic.sentiment,
    urgency: semantic.urgency,
    forecast: prediction.nextHourForecast,
  });

  return { semantic, prediction, insights };
}
```

---

## ✅ Testing the Enhancements

**Test Semantic Analysis:**
```
Voice input: "I really need to find Crumbl cookies for my group"
Expected: sentiment='positive', urgency='high', isGroupDemand=true,
         linkedCategories=['dessert', 'bakery']
```

**Test Predictions:**
```
Current: 50, Recent: [48, 49, 50, 51, 50]
Expected forecast: ~51, trend='stable', anomalyScore<0.3
```

**Test Insights:**
```
Given: Crumbl at 100/hour (2x average)
Expected: "Rising Demand in Food Court" insight with +20-30% impact
```

**Test Staff Alerts:**
```
Register: Bob at Food Court
Create: High demand alert
Expected: Alert assigned to Bob, visible in UI, Bob can acknowledge
```

---

## 🚀 Next Steps

1. **Start with any ONE module** above
2. **Test in isolation** - don't integrate everything at once
3. **Hook into existing data flow** - use current trends/detections
4. **Add UI components** - Heatmap, Insights, StaffAlerts panels
5. **Setup integrations** - Slack, Claude API, etc. (optional)
6. **Monitor metrics** - Track what works, iterate

---

## 📚 Reference

Full documentation: [ENHANCEMENTS.md](ENHANCEMENTS.md)

Module exports:
- `core/semanticAnalyzer.ts` → `semanticAnalyzer` (singleton)
- `core/predictiveAnalytics.ts` → `predictiveAnalytics` (singleton)
- `core/insightEngine.ts` → `insightEngine` (singleton)
- `core/staffCoordination.ts` → `staffCoordinator` (singleton)
- `core/webhookManager.ts` → `webhookManager` (singleton)
- `core/localization.ts` → `localization` (singleton)
- `core/collaborationStore.ts` → `useCollaborationStore` (Zustand hook)

All components are **client-side** and **privacy-preserving** - no customer data leaves the browser.

---

*Questions? Check ENHANCEMENTS.md for detailed docs.*

Happy hacking! 🎉
