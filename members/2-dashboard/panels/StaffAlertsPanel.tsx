/**
 * Staff Alerts & Coordination Panel
 * Real-time alerts and task management for store staff
 */

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Clock, Users, ChevronRight } from 'lucide-react';
import type { StaffAlert, StaffTask, StaffMember } from '@core/staffCoordination';

interface StaffAlertsPanelProps {
  activeAlerts: StaffAlert[];
  activeTasks: StaffTask[];
  staffOnline: StaffMember[];
  onAcknowledgeAlert?: (alertId: string) => void;
  onCompleteAlert?: (alertId: string) => void;
  onCompleteTask?: (taskId: string) => void;
}

export const StaffAlertsPanel: React.FC<StaffAlertsPanelProps> = ({
  activeAlerts,
  activeTasks,
  staffOnline,
  onAcknowledgeAlert,
  onCompleteAlert,
  onCompleteTask,
}) => {
  const [tab, setTab] = useState<'alerts' | 'tasks' | 'staff'>('alerts');

  const getAlertColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'border-red-500/50 bg-red-900/20';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-900/20';
      default:
        return 'border-blue-500/50 bg-blue-900/20';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      default:
        return 'text-blue-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') return <AlertCircle size={12} className="text-red-400" />;
    if (priority === 'medium') return <Clock size={12} className="text-yellow-400" />;
    return <CheckCircle size={12} className="text-cyan-400" />;
  };

  return (
    <div className="border border-white/10 rounded overflow-hidden bg-zinc-900/30">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {(['alerts', 'tasks', 'staff'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-3 py-2 text-[9px] uppercase font-bold transition ${
              tab === t
                ? 'bg-white/10 text-cyan-400'
                : 'text-zinc-500 hover:text-zinc-400'
            }`}
          >
            {t === 'alerts' && `Alerts (${activeAlerts.length})`}
            {t === 'tasks' && `Tasks (${activeTasks.length})`}
            {t === 'staff' && `Staff (${staffOnline.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
        {tab === 'alerts' && (
          <>
            {activeAlerts.length === 0 ? (
              <div className="text-center py-4 text-zinc-500 text-[9px]">
                No active alerts
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded p-2 ${getAlertColor(alert.urgency)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className={`text-[10px] font-bold ${getUrgencyText(alert.urgency)}`}>
                        {alert.entity}
                      </div>
                      <div className="text-[8px] text-zinc-400 mt-1">{alert.message}</div>
                      <div className="text-[8px] text-zinc-500 mt-1">
                        {alert.zone} •{' '}
                        {alert.assignedTo
                          ? `Assigned to ${alert.assignedTo}`
                          : 'Unassigned'}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {alert.status === 'new' && (
                        <button
                          onClick={() => onAcknowledgeAlert?.(alert.id)}
                          className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-[8px] text-white transition"
                        >
                          ACK
                        </button>
                      )}
                      <button
                        onClick={() => onCompleteAlert?.(alert.id)}
                        className="px-2 py-1 bg-green-900/30 hover:bg-green-900/50 rounded text-[8px] text-green-400 transition"
                      >
                        DONE
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {tab === 'tasks' && (
          <>
            {activeTasks.length === 0 ? (
              <div className="text-center py-4 text-zinc-500 text-[9px]">
                No pending tasks
              </div>
            ) : (
              activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-white/10 rounded p-2 bg-black/20 hover:bg-black/40 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(task.priority)}
                        <span className="text-[10px] font-bold text-white">
                          {task.title}
                        </span>
                      </div>
                      <div className="text-[8px] text-zinc-400 mt-1">{task.description}</div>
                      <div className="text-[8px] text-zinc-500 mt-1">
                        {task.zone} •{' '}
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => onCompleteTask?.(task.id)}
                      className="px-2 py-1 bg-green-900/30 hover:bg-green-900/50 rounded text-[8px] text-green-400 transition"
                    >
                      ✓
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {tab === 'staff' && (
          <>
            {staffOnline.length === 0 ? (
              <div className="text-center py-4 text-zinc-500 text-[9px]">
                No staff online
              </div>
            ) : (
              staffOnline.map((member) => (
                <div
                  key={member.id}
                  className={`border rounded p-2 flex items-center justify-between ${
                    member.status === 'available'
                      ? 'border-green-500/30 bg-green-900/10'
                      : member.status === 'busy'
                        ? 'border-yellow-500/30 bg-yellow-900/10'
                        : 'border-red-500/30 bg-red-900/10'
                  }`}
                >
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-white">
                      {member.name}
                    </div>
                    <div className="text-[8px] text-zinc-400">
                      {member.role} • {member.zone}
                    </div>
                    <div className="text-[8px] text-zinc-500 mt-1">
                      {member.activeAlerts} alerts • {member.completedTasks} done
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-[8px] font-bold ${
                      member.status === 'available'
                        ? 'bg-green-900/30 text-green-400'
                        : member.status === 'busy'
                          ? 'bg-yellow-900/30 text-yellow-400'
                          : 'bg-red-900/30 text-red-400'
                    }`}
                  >
                    {member.status.toUpperCase()}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};
