/**
 * Trends Panel
 * Middle panel: Top 3 trending items with time window selector
 */

import React from 'react';
import { CensusZone, TimeWindow } from 'frontend-shell/types';

interface TrendsPanelProps {
  zone: CensusZone;
  timeWindow: TimeWindow;
  onTimeWindowChange: (window: TimeWindow) => void;
  trends: Array<{ entity: string; count: number }>;
}

export const TrendsPanel: React.FC<TrendsPanelProps> = ({
  zone,
  timeWindow,
  onTimeWindowChange,
  trends,
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-6 text-gray-900">Demand Trends</h2>

      {/* Time Window Toggle */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
          Time Window
        </label>
        <div className="flex gap-2">
          {(['10m', '1h'] as const).map((window) => (
            <button
              key={window}
              onClick={() => onTimeWindowChange(window)}
              className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                timeWindow === window
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {window === '10m' ? 'Last 10 min' : 'Last hour'}
            </button>
          ))}
        </div>
      </div>

      {/* Trends List */}
      <div className="space-y-3">
        {trends.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">Start recording to see trends</p>
          </div>
        ) : (
          trends.map((trend, index) => (
            <div key={`${trend.entity}-${index}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-900">{trend.entity}</span>
                <span className="text-xs font-semibold text-cyan-600">
                  {trend.count} mention{trend.count !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (trend.count / Math.max(...trends.map(t => t.count), 1)) * 100)}%`,
                    }}
                  ></div>
                </div>
                {index === 0 && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-yellow-600">
                    ⭐ Top
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Zone Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Showing trends for <span className="font-semibold text-gray-700">{zone}</span>
        </p>
      </div>
    </div>
  );
};
