import React from 'react';
import { Mic, Square } from 'lucide-react';
import { CensusZone, CensusDetection } from 'frontend-shell/types';

interface RecordingPanelProps {
  zone: CensusZone;
  onZoneChange: (zone: CensusZone) => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  lastDetection: CensusDetection | null;
}

const ZONES: CensusZone[] = ['Food Court', 'Atrium', 'West Wing', 'Entrance'];

export const RecordingPanel: React.FC<RecordingPanelProps> = ({
  zone,
  onZoneChange,
  isRecording,
  onStartRecording,
  onStopRecording,
  lastDetection,
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-6 text-gray-900">Simulate Ambient Audio</h2>

      {/* Zone Selector */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
          Zone
        </label>
        <select
          value={zone}
          onChange={(e) => onZoneChange(e.target.value as CensusZone)}
          disabled={isRecording}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
        >
          {ZONES.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </div>

      {/* Recording Controls */}
      <div className="mb-6 space-y-3">
        {!isRecording ? (
          <button
            onClick={onStartRecording}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Mic size={18} />
            Start Recording
          </button>
        ) : (
          <button
            onClick={onStopRecording}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors animate-pulse"
          >
            <Square size={18} />
            Stop Recording
          </button>
        )}
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
            <p className="text-sm text-red-700 font-medium">Recording...</p>
          </div>
        </div>
      )}

      {/* Last Detection Result */}
      {lastDetection && (
        <div className="space-y-3 pt-6 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Last Detection
          </p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Intent</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span className="text-sm font-semibold text-blue-900">{lastDetection.intent}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Entity</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-100 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-600"></span>
                <span className="text-sm font-semibold text-cyan-900">{lastDetection.entity}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
