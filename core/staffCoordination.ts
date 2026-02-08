/**
 * Staff Coordination System
 * Real-time alerts and task management for store staff
 */

export type AlertType = 'high_demand' | 'low_inventory' | 'customer_waiting' | 'emergency' | 'task';

export interface StaffAlert {
  id: string;
  type: AlertType;
  zone: string;
  entity: string; // Store/product name
  message: string;
  urgency: 'low' | 'medium' | 'high';
  createdAt: number;
  assignedTo?: string; // Staff member ID
  status: 'new' | 'acknowledged' | 'completed' | 'dismissed';
  estimatedDuration?: number; // seconds
  metadata?: Record<string, any>;
}

export interface StaffTask {
  id: string;
  zone: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  dueDate: number;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: number;
  completedAt?: number;
}

export interface StaffMember {
  id: string;
  name: string;
  zone: string;
  role: 'cashier' | 'stocker' | 'manager' | 'supervisor';
  status: 'available' | 'busy' | 'break' | 'offline';
  activeAlerts: number;
  completedTasks: number;
}

export class StaffCoordinator {
  private alerts: Map<string, StaffAlert> = new Map();
  private tasks: Map<string, StaffTask> = new Map();
  private staff: Map<string, StaffMember> = new Map();
  private alertCallbacks: Array<(alert: StaffAlert) => void> = [];

  /**
   * Create a new alert
   */
  createAlert(
    type: AlertType,
    zone: string,
    entity: string,
    message: string,
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ): StaffAlert {
    const alert: StaffAlert = {
      id: Math.random().toString(36).substring(7),
      type,
      zone,
      entity,
      message,
      urgency,
      createdAt: Date.now(),
      status: 'new',
    };

    this.alerts.set(alert.id, alert);

    // Find best staff member to assign
    const assignee = this.findBestStaff(zone, urgency);
    if (assignee) {
      alert.assignedTo = assignee.id;
    }

    // Trigger callbacks
    this.alertCallbacks.forEach(cb => cb(alert));

    // Auto-dismiss low priority alerts after 5 minutes
    if (urgency === 'low') {
      setTimeout(() => {
        const current = this.alerts.get(alert.id);
        if (current && current.status === 'new') {
          this.dismissAlert(alert.id);
        }
      }, 5 * 60 * 1000);
    }

    return alert;
  }

  /**
   * Acknowledge an alert (staff member seen it)
   */
  acknowledgeAlert(alertId: string, staffId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = 'acknowledged';
      alert.assignedTo = staffId;
    }
  }

  /**
   * Complete an alert
   */
  completeAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = 'completed';
    }
  }

  /**
   * Dismiss an alert
   */
  dismissAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = 'dismissed';
    }
  }

  /**
   * Create a task
   */
  createTask(
    zone: string,
    title: string,
    description: string,
    priority: 'low' | 'medium' | 'high' = 'medium',
    dueDate: number = Date.now() + 24 * 60 * 60 * 1000 // Tomorrow by default
  ): StaffTask {
    const task: StaffTask = {
      id: Math.random().toString(36).substring(7),
      zone,
      title,
      description,
      priority,
      dueDate,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed'): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      if (status === 'completed') {
        task.completedAt = Date.now();
      }
    }
  }

  /**
   * Register a staff member
   */
  registerStaff(
    id: string,
    name: string,
    zone: string,
    role: 'cashier' | 'stocker' | 'manager' | 'supervisor'
  ): StaffMember {
    const member: StaffMember = {
      id,
      name,
      zone,
      role,
      status: 'available',
      activeAlerts: 0,
      completedTasks: 0,
    };

    this.staff.set(id, member);
    return member;
  }

  /**
   * Update staff status
   */
  updateStaffStatus(staffId: string, status: 'available' | 'busy' | 'break' | 'offline'): void {
    const member = this.staff.get(staffId);
    if (member) {
      member.status = status;
    }
  }

  /**
   * Get active alerts for a zone
   */
  getZoneAlerts(zone: string): StaffAlert[] {
    return Array.from(this.alerts.values()).filter(
      a => a.zone === zone && (a.status === 'new' || a.status === 'acknowledged')
    );
  }

  /**
   * Get alerts for a staff member
   */
  getStaffAlerts(staffId: string): StaffAlert[] {
    return Array.from(this.alerts.values()).filter(
      a => a.assignedTo === staffId && (a.status === 'new' || a.status === 'acknowledged')
    );
  }

  /**
   * Get tasks for a zone
   */
  getZoneTasks(zone: string): StaffTask[] {
    return Array.from(this.tasks.values()).filter(
      t => t.zone === zone && t.status !== 'completed'
    );
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): StaffAlert[] {
    return Array.from(this.alerts.values()).filter(
      a => a.status === 'new' || a.status === 'acknowledged'
    );
  }

  /**
   * Find best staff member to assign task
   */
  private findBestStaff(zone: string, urgency: string): StaffMember | null {
    const zoneStaff = Array.from(this.staff.values()).filter(s => s.zone === zone);

    if (urgency === 'high') {
      // Managers first
      return (
        zoneStaff.find(s => s.role === 'manager' && s.status === 'available') ||
        zoneStaff.find(s => s.status === 'available') ||
        null
      );
    }

    // Any available staff
    return zoneStaff.find(s => s.status === 'available') || null;
  }

  /**
   * Register alert callback
   */
  onAlert(callback: (alert: StaffAlert) => void): () => void {
    this.alertCallbacks.push(callback);
    return () => {
      this.alertCallbacks = this.alertCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Generate smart alerts based on trends
   */
  generateSmartAlerts(
    zoneTrends: Record<string, Array<{ entity: string; count: number }>>,
    predictions: Array<{ entity: string; nextHourForecast: number }>
  ): void {
    // Alert 1: Very high demand
    predictions.forEach(pred => {
      if (pred.nextHourForecast > 100) {
        Object.entries(zoneTrends).forEach(([zone, trends]) => {
          const entityTrend = trends.find(t => t.entity === pred.entity);
          if (entityTrend && entityTrend.count > 50) {
            this.createAlert(
              'high_demand',
              zone,
              pred.entity,
              `Expected surge: ${pred.nextHourForecast}+ orders predicted`,
              'high'
            );
          }
        });
      }
    });
  }

  /**
   * Calculate staff efficiency metrics
   */
  getEfficiencyMetrics(): Record<string, any> {
    const allAlerts = Array.from(this.alerts.values());
    const completedAlerts = allAlerts.filter(a => a.status === 'completed');
    const avgResolutionTime =
      completedAlerts.length > 0
        ? completedAlerts.reduce((sum, a) => sum + (Date.now() - a.createdAt), 0) / completedAlerts.length
        : 0;

    return {
      totalAlerts: allAlerts.length,
      completedAlerts: completedAlerts.length,
      activeAlerts: allAlerts.filter(a => a.status === 'new' || a.status === 'acknowledged').length,
      avgResolutionTimeMinutes: Math.round(avgResolutionTime / 60000),
      staffOnline: Array.from(this.staff.values()).filter(s => s.status !== 'offline').length,
    };
  }
}

export const staffCoordinator = new StaffCoordinator();
