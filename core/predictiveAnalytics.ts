/**
 * Predictive Analytics Module
 * - Trend forecasting using exponential smoothing
 * - Anomaly detection
 * - Peak time prediction
 * - Demand spikes forecast
 */

export interface Prediction {
  entity: string;
  currentTrend: number;
  nextHourForecast: number;
  confidence: number;
  trend: 'rising' | 'stable' | 'falling';
  estimatedPeakTime: string; // HH:MM
  anomalyScore: number; // 0-1, >0.7 = anomaly
}

export interface DemandPattern {
  entity: string;
  hourlyDistribution: number[]; // 0-23 hours
  weeklyPattern: number[]; // 0-6 days
  averageWait: number; // seconds
  peakHours: number[];
}

export class PredictiveAnalytics {
  private historicalData: Map<string, number[]> = new Map();
  private patterns: Map<string, DemandPattern> = new Map();

  /**
   * Add a detection event for historical tracking
   */
  recordEvent(entity: string, count: number = 1, timestamp?: Date) {
    const time = timestamp || new Date();
    const key = `${entity}_${time.getHours()}`;

    const current = this.historicalData.get(key) || [];
    current.push(count);
    this.historicalData.set(key, current);
  }

  /**
   * Forecast next hour demand using exponential smoothing
   * Simple yet effective: newer data gets more weight
   */
  predictNextHour(
    entity: string,
    currentCount: number,
    recentCounts: number[]
  ): Prediction {
    // Exponential smoothing: α=0.3 (balance between current and history)
    const alpha = 0.3;

    let forecast = currentCount;
    for (let i = 0; i < recentCounts.length; i++) {
      const weight = Math.pow(1 - alpha, i);
      forecast = alpha * recentCounts[i] * weight + (1 - alpha) * forecast;
    }

    // Calculate trend
    const avgRecent = recentCounts.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
    const trend =
      currentCount > avgRecent * 1.2 ? 'rising' : currentCount < avgRecent * 0.8 ? 'falling' : 'stable';

    // Anomaly detection (z-score)
    const mean = recentCounts.reduce((a, b) => a + b, 0) / recentCounts.length;
    const variance =
      recentCounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recentCounts.length;
    const stdDev = Math.sqrt(variance + 0.1); // +0.1 to avoid division by zero
    const zScore = Math.abs((currentCount - mean) / stdDev);
    const anomalyScore = Math.min(zScore / 3, 1); // Normalize to 0-1

    // Estimate peak time (simplified: assume current hour + 2-4 hours)
    const now = new Date();
    const peakHour = (now.getHours() + 2 + Math.random() * 2) % 24;
    const peakTime = String(Math.floor(peakHour)).padStart(2, '0') + ':00';

    return {
      entity,
      currentTrend: currentCount,
      nextHourForecast: Math.round(forecast),
      confidence: Math.max(0.6, Math.min(1, 1 - anomalyScore * 0.2)),
      trend,
      estimatedPeakTime: peakTime,
      anomalyScore,
    };
  }

  /**
   * Detect anomalies (spikes, unexpected patterns)
   */
  detectAnomaly(entity: string, currentValue: number, baseline: number[]): boolean {
    if (baseline.length === 0) return false;

    const mean = baseline.reduce((a, b) => a + b) / baseline.length;
    const stdDev = Math.sqrt(
      baseline.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / baseline.length
    );

    // Flag if > 2.5 standard deviations from mean
    const zScore = Math.abs((currentValue - mean) / (stdDev + 0.1));
    return zScore > 2.5;
  }

  /**
   * Identify peak hours for an entity
   */
  getPeakHours(entity: string): number[] {
    const key = `pattern_${entity}`;
    const pattern = this.patterns.get(key);

    if (!pattern) {
      // Default: lunch and evening peaks
      return [12, 13, 18, 19];
    }

    return pattern.peakHours.sort((a, b) => pattern.hourlyDistribution[b] - pattern.hourlyDistribution[a]).slice(0, 4);
  }

  /**
   * Recommend staffing levels based on predicted demand
   */
  recommendStaffing(predictions: Prediction[]): Record<string, number> {
    const recommendations: Record<string, number> = {};

    predictions.forEach(pred => {
      // Staff formula: 1 staff per 3 forecasted units, minimum 1
      const recommendedStaff = Math.max(1, Math.ceil(pred.nextHourForecast / 3));
      recommendations[pred.entity] = recommendedStaff;
    });

    return recommendations;
  }

  /**
   * Calculate waiting time estimate
   */
  estimateWaitTime(entity: string, currentQueueLength: number): number {
    // Rough estimate: 90 seconds per customer
    const serviceTimePerCustomer = 90;
    return currentQueueLength * serviceTimePerCustomer;
  }

  /**
   * Get demand trend comparison (comparing different time periods)
   */
  compareTrends(
    entity: string,
    period1: number[],
    period2: number[]
  ): { growth: number; direction: 'up' | 'down' | 'stable' } {
    const sum1 = period1.reduce((a, b) => a + b, 0);
    const sum2 = period2.reduce((a, b) => a + b, 0);
    const growth = sum1 === 0 ? 0 : ((sum2 - sum1) / sum1) * 100;

    return {
      growth,
      direction: growth > 5 ? 'up' : growth < -5 ? 'down' : 'stable',
    };
  }
}

export const predictiveAnalytics = new PredictiveAnalytics();
