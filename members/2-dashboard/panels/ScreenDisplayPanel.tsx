/**
 * Screen Display Panel
 * Right panel: Animated mall screen showing #1 trending demand
 * 
 * Simulates what would be displayed on a dynamic screen in each zone.
 */

import React from 'react';
import { CensusZone } from 'frontend-shell/types';

interface ScreenDisplayPanelProps {
  zone: CensusZone;
  topDemand: { entity: string; count: number } | null;
}

export const ScreenDisplayPanel: React.FC<ScreenDisplayPanelProps> = ({
  zone,
  topDemand,
}) => {
  // Map zones to fictional mall locations for display
  const zoneDisplay: Record<CensusZone, string> = {
    'Food Court': 'Level 1, Food Court',
    'Atrium': 'Central Atrium',
    'West Wing': 'West Wing, Level 2',
    'Entrance': 'Main Entrance',
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-6 text-gray-900">Screen Display</h2>

      {/* Screen Mockup */}
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 min-h-48 flex flex-col justify-center items-center text-center border-2 border-gray-800">
        {topDemand ? (
          <div className="space-y-4">
            <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-500 bg-clip-text text-transparent">
              {topDemand.entity}
            </div>
            <div className="text-lg text-gray-300">
              → {zoneDisplay[zone]}
            </div>
            <div className="text-xs text-gray-500 pt-2">
              {topDemand.count} demand signal{topDemand.count !== 1 ? 's' : ''}
            </div>
          </div>
        ) : (
          <div className="text-gray-600 text-sm">
            <p className="mb-2">Awaiting demand...</p>
            <p className="text-xs text-gray-500">Start recording to populate</p>
          </div>
        )}
      </div>

      {/* Zone Label */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Zone: <span className="font-semibold text-gray-700">{zone}</span>
        </p>
      </div>
    </div>
  );
};
