# 🔧 Exact Code Changes - Visual Guide

Shows you exactly what to change in your files.

---

## File: `members/2-dashboard/Dashboard.tsx`

### Current Code (Top of File)
```typescript
/**
 * Dashboard - Real-time Analytics + Census Recording
 * ...
 */

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@core/store';
// ... more imports
```

### What to Change

**ADD THIS IMPORT** at the top with the other imports:
```typescript
import { DashboardEnhanced } from './DashboardEnhanced';
```

---

### Current Code (Bottom of File)
```typescript
export const Dashboard: React.FC = () => {
    const { currentIntent, confidenceScore, detectedText, visualMode, ... } = useStore();
    // ... 800+ lines of component code
    return (
        <div className="bg-zinc-950 text-emerald-400 px-0 py-3 font-mono h-full w-full border-l border-white/10 flex flex-row gap-4 overflow-hidden">
            {/* ... dashboard JSX ... */}
        </div>
    );
};
```

### What to Do

**REPLACE THE ENTIRE EXPORT** at the bottom with:
```typescript
// Export the enhanced version instead
export const Dashboard = DashboardEnhanced;
```

**OR if you want to keep the original:**
```typescript
// Rename the original
const DashboardOriginal: React.FC = () => {
    const { currentIntent, confidenceScore, detectedText, visualMode, ... } = useStore();
    // ... 800+ lines of component code
    return (
        <div className="bg-zinc-950 text-emerald-400 px-0 py-3 font-mono h-full w-full border-l border-white/10 flex flex-row gap-4 overflow-hidden">
            {/* ... dashboard JSX ... */}
        </div>
    );
};

// Export the enhanced version
export const Dashboard = DashboardEnhanced;
```

---

## Visual Diff

```
BEFORE:
─────────────────────────────────
import React, { useState, ... } from 'react';
import { useStore } from '@core/store';
// ... more imports

export const Dashboard: React.FC = () => {
  // 800+ lines of dashboard code
  return <div>...</div>;
};


AFTER:
─────────────────────────────────
import React, { useState, ... } from 'react';
import { useStore } from '@core/store';
import { DashboardEnhanced } from './DashboardEnhanced';  // ← ADD THIS
// ... more imports

export const Dashboard = DashboardEnhanced;  // ← CHANGE THIS
```

---

## That's It!

3 changes:
1. ✅ Import DashboardEnhanced
2. ✅ Replace the export
3. ✅ Save file
4. ✅ Refresh browser

Done! 🎉

---

## Troubleshooting

### If you get "Module not found" error:
- Make sure `DashboardEnhanced.tsx` exists in the same folder
- Check the import path is correct: `./DashboardEnhanced`

### If the dashboard looks broken:
- Check browser console (F12)
- Make sure you saved the file
- Try a hard refresh (Ctrl+Shift+R)

### If you want to go back:
- Undo the change (Ctrl+Z)
- Restore the original export
- Refresh browser

---

## Verify

After making changes, go to: `http://localhost:5173/demo`

You should see:
```
Record │ Heat │ Ideas │ Staff │ [EN▼]
───────────────────────────────────────
(tab content changes)
```

If you see this → Success! ✅

---

That's all the code changes needed!
