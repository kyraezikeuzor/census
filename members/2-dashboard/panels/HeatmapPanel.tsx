/**
 * Advanced Heatmap Visualization Panel
 * Real-time zone demand visualization with temporal insights
 */

import React, { useMemo, useState } from 'react';
import { Flame, TrendingUp, Clock } from 'lucide-react';

export interface HeatmapData {
  zones: string[];
  hourly: Record<string, number[]>; // zone -> [0-23 hours] demand values
  current: Record<string, number>;  // zone -> current demand
}

interface HeatmapPanelProps {
  data: HeatmapData;
  maxValue?: number;
}

export const HeatmapPanel: React.FC<HeatmapPanelProps> = ({ data, maxValue = 100 }) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(data.zones[0] || null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h');

  const heatmapGradient = useMemo(() => {
    return (value: number, max: number) => {
      const normalized = Math.min(value / max, 1);
      if (normalized < 0.33) return 'bg-blue-900';
      if (normalized < 0.66) return 'bg-yellow-600';
      if (normalized < 0.85) return 'bg-orange-600';
      return 'bg-red-600';
    };
  }, []);

  const selectedZoneData = selectedZone ? data.hourly[selectedZone] || [] : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Flame size={14} className="text-red-500" />
        <h3 className="text-[10px] text-red-400 uppercase tracking-widest font-bold">
          Zone Heatmap
        </h3>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setTimeRange('24h')}
            className={`text-[9px] px-2 py-1 rounded ${
              timeRange === '24h'
                ? 'bg-red-500/30 text-red-300'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            24h
          </button>
          <button
            onClick={() => setTimeRange('7d')}
            className={`text-[9px] px-2 py-1 rounded ${
              timeRange === '7d'
                ? 'bg-red-500/30 text-red-300'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            7d
          </button>
        </div>
      </div>

      {/* Current Demand Grid */}
      <div className="grid grid-cols-2 gap-2">
        {data.zones.map((zone) => {
          const current = data.current[zone] || 0;
          const intensity = Math.min(current / maxValue, 1);
          const isSelected = zone === selectedZone;

          return (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`border rounded p-3 text-left transition ${
                isSelected
                  ? 'border-red-500/50 bg-red-500/10'
                  : 'border-white/10 bg-zinc-900/30 hover:bg-zinc-800/30'
              }`}
            >
              <div className="text-[10px] text-zinc-400 uppercase mb-1">{zone}</div>
              <div className="flex items-end gap-2">
                <div className="text-lg font-bold text-white">{current}</div>
                <div className="text-[9px] text-zinc-500">units</div>
              </div>

              {/* Mini intensity bar */}
              <div className="mt-2 w-full h-1 bg-zinc-800 rounded overflow-hidden">
                <div
                  className={`h-full transition-all ${heatmapGradient(current, maxValue)}`}
                  style={{ width: `${intensity * 100}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Hourly Breakdown */}
      {selectedZone && selectedZoneData.length > 0 && (
        <div className="border border-white/10 rounded p-3 bg-zinc-900/30">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={12} className="text-cyan-400" />
            <h4 className="text-[9px] text-cyan-400 uppercase">
              {selectedZone} - Hourly Pattern
            </h4>
          </div>

          {/* Heatmap Visualization */}
          <div className="grid grid-cols-12 gap-1">
            {selectedZoneData.slice(0, 24).map((value, hour) => {
              const intensity = Math.min(value / maxValue, 1);
              return (
                <div
                  key={hour}
                  className={`aspect-square rounded text-[7px] flex items-center justify-center font-bold text-white cursor-pointer hover:ring-1 hover:ring-cyan-400 transition ${heatmapGradient(value, maxValue)}`}
                  title={`${hour}:00 - ${value} units`}
                >
                  {hour % 3 === 0 ? hour : ''}
                </div>
              );
            })}
          </div>

          {/* Hour labels */}
          <div className="grid grid-cols-12 gap-1 mt-1 text-[7px] text-zinc-500">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="text-center">
                {i % 3 === 0 ? `${i}h` : ''}
              </div>
            ))}
          </div>

          {/* Peak Hour Info */}
          {selectedZoneData.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10 space-y-1 text-[9px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Peak Hour:</span>
                <span className="text-yellow-400 font-bold">
                  {selectedZoneData.indexOf(Math.max(...selectedZoneData))}:00
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Avg Demand:</span>
                <span className="text-cyan-400">
                  {(selectedZoneData.reduce((a, b) => a + b, 0) / selectedZoneData.length).toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Peak Value:</span>
                <span className="text-red-400 font-bold">{Math.max(...selectedZoneData)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Color Legend */}
      <div className="border border-white/10 rounded p-2 bg-zinc-900/30">
        <div className="text-[8px] text-zinc-500 uppercase mb-2">Intensity Scale</div>
        <div className="grid grid-cols-4 gap-1 text-[8px]">
          <div className="flex flex-col items-center gap-1">
            <div className="w-full h-3 bg-blue-900 rounded" />
            <span className="text-zinc-400">Low</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-full h-3 bg-yellow-600 rounded" />
            <span className="text-zinc-400">Medium</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-full h-3 bg-orange-600 rounded" />
            <span className="text-zinc-400">High</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-full h-3 bg-red-600 rounded" />
            <span className="text-zinc-400">Extreme</span>
          </div>
        </div>
      </div>
    </div>
  );
};
