/**
 * Insights & Recommendations Panel
 * Displays AI-generated business insights and recommendations
 */

import React, { useState } from 'react';
import { Lightbulb, ChevronDown, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import type { Insight } from '@core/insightEngine';

interface InsightsPanelProps {
  insights: Insight[];
  onActionClick?: (insight: Insight) => void;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights, onActionClick }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getIcon = (category: string) => {
    switch (category) {
      case 'opportunity':
        return <TrendingUp size={12} className="text-green-400" />;
      case 'warning':
        return <AlertTriangle size={12} className="text-yellow-400" />;
      case 'optimization':
        return <Zap size={12} className="text-blue-400" />;
      default:
        return <Lightbulb size={12} className="text-cyan-400" />;
    }
  };

  const getBgColor = (category: string) => {
    switch (category) {
      case 'opportunity':
        return 'bg-green-900/20 border-green-500/20';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-500/20';
      case 'optimization':
        return 'bg-blue-900/20 border-blue-500/20';
      default:
        return 'bg-cyan-900/20 border-cyan-500/20';
    }
  };

  const getTextColor = (category: string) => {
    switch (category) {
      case 'opportunity':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'optimization':
        return 'text-blue-400';
      default:
        return 'text-cyan-400';
    }
  };

  if (insights.length === 0) {
    return (
      <div className="border border-white/10 rounded p-4 text-center bg-zinc-900/30">
        <Lightbulb size={24} className="mx-auto mb-2 text-zinc-600" />
        <p className="text-[10px] text-zinc-500">Gathering data for insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <Lightbulb size={14} className="text-cyan-400" />
        <h3 className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">
          AI Insights
        </h3>
        <span className="ml-auto text-[9px] text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
          {insights.length} active
        </span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`border rounded-lg overflow-hidden transition ${getBgColor(insight.category)}`}
          >
            {/* Header */}
            <button
              onClick={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
              className="w-full p-2 text-left hover:bg-white/5 transition flex items-start justify-between"
            >
              <div className="flex items-start gap-2 flex-1">
                {getIcon(insight.category)}
                <div className="flex-1">
                  <div className={`text-[10px] font-bold ${getTextColor(insight.category)}`}>
                    {insight.title}
                  </div>
                  <div className="text-[9px] text-zinc-400 mt-1">{insight.description}</div>
                </div>
              </div>
              <ChevronDown
                size={14}
                className={`text-zinc-500 transition ${expandedId === insight.id ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Expanded Details */}
            {expandedId === insight.id && (
              <div className="border-t border-white/10 p-3 bg-black/20 space-y-2 text-[9px]">
                {/* Affected Items */}
                {insight.affectedEntities.length > 0 && (
                  <div>
                    <div className="text-zinc-500 uppercase text-[8px] mb-1">Entities</div>
                    <div className="flex flex-wrap gap-1">
                      {insight.affectedEntities.map((entity) => (
                        <span
                          key={entity}
                          className="bg-white/10 text-white px-2 py-0.5 rounded text-[8px]"
                        >
                          {entity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                <div>
                  <div className="text-zinc-500 uppercase text-[8px] mb-1">Recommendation</div>
                  <p className="text-zinc-300">{insight.recommendation}</p>
                </div>

                {/* Impact & Severity */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <div>
                    <div className="text-zinc-500 text-[7px] uppercase mb-0.5">Impact</div>
                    <div className={`text-[10px] font-bold ${getTextColor(insight.category)}`}>
                      {insight.impact}
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-[7px] uppercase mb-0.5">Severity</div>
                    <div className={`text-[10px] font-bold ${
                      insight.severity === 'high' ? 'text-red-400' :
                      insight.severity === 'medium' ? 'text-yellow-400' :
                      'text-cyan-400'
                    }`}>
                      {insight.severity.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {insight.actionable && (
                  <button
                    onClick={() => onActionClick?.(insight)}
                    className="w-full mt-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-[9px] font-semibold transition"
                  >
                    Take Action
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
