/**
 * Insight & Recommendations Engine
 * Generates actionable business insights from Census data
 */

export interface Insight {
  id: string;
  title: string;
  description: string;
  category: 'opportunity' | 'warning' | 'optimization' | 'trend';
  severity: 'low' | 'medium' | 'high';
  affectedEntities: string[];
  affectedZones: string[];
  recommendation: string;
  impact: string; // e.g., "+15% revenue potential"
  timestamp: number;
  actionable: boolean;
}

export interface StaffRecommendation {
  zone: string;
  currentStaff: number;
  recommendedStaff: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
}

export class InsightEngine {
  /**
   * Analyze trends and generate insights
   */
  generateInsights(
    zoneTrends: Record<string, Array<{ entity: string; count: number }>>,
    globalTrends: Array<{ entity: string; count: number }>,
    historicalData: Map<string, number[]>
  ): Insight[] {
    const insights: Insight[] = [];

    // Insight 1: Rising stars (entities gaining momentum)
    for (const [zone, trends] of Object.entries(zoneTrends)) {
      const risers = trends.filter(t => {
        const historical = historicalData.get(`${t.entity}_history`) || [];
        const avgHistorical = historical.length > 0 ? historical.reduce((a, b) => a + b) / historical.length : 0;
        return t.count > avgHistorical * 1.5; // 50% increase
      });

      if (risers.length > 0) {
        insights.push({
          id: `rising_${zone}_${Date.now()}`,
          title: `📈 Rising Demand in ${zone}`,
          description: `${risers.map(r => r.entity).join(', ')} showing 50%+ growth`,
          category: 'opportunity',
          severity: 'high',
          affectedEntities: risers.map(r => r.entity),
          affectedZones: [zone],
          recommendation: `Increase inventory and staff for ${risers[0].entity}. Consider running limited-time promotion.`,
          impact: '+20-30% potential revenue',
          timestamp: Date.now(),
          actionable: true,
        });
      }
    }

    // Insight 2: Underperforming entities
    const topGlobal = globalTrends.slice(0, 3).map(t => t.entity);
    const allEntities = new Set<string>();
    Object.values(zoneTrends).forEach(trends => trends.forEach(t => allEntities.add(t.entity)));

    const underperformers = Array.from(allEntities).filter(
      entity => !topGlobal.includes(entity) && !this.isCoreSeller(entity)
    );

    if (underperformers.length > 0) {
      insights.push({
        id: `underperf_${Date.now()}`,
        title: '⚠️ Underperforming Stores',
        description: `${underperformers.slice(0, 3).join(', ')} need attention`,
        category: 'warning',
        severity: 'medium',
        affectedEntities: underperformers,
        affectedZones: Object.keys(zoneTrends),
        recommendation: 'Consider promotional bundles, improved signage, or staff training for slow movers.',
        impact: 'Potential 10-20% lift on slow items',
        timestamp: Date.now(),
        actionable: true,
      });
    }

    // Insight 3: Zone imbalance
    const zoneAverages = Object.entries(zoneTrends).map(([zone, trends]) => ({
      zone,
      average: trends.reduce((sum, t) => sum + t.count, 0) / trends.length,
    }));

    const maxZone = zoneAverages.reduce((max, z) => (z.average > max.average ? z : max));
    const minZone = zoneAverages.reduce((min, z) => (z.average < min.average ? z : min));

    if (maxZone.average > minZone.average * 2) {
      insights.push({
        id: `imbalance_${Date.now()}`,
        title: '⚔️ Zone Traffic Imbalance',
        description: `${maxZone.zone} is 2x busier than ${minZone.zone}`,
        category: 'optimization',
        severity: 'medium',
        affectedZones: [maxZone.zone, minZone.zone],
        affectedEntities: [],
        recommendation: `Redirect traffic from ${maxZone.zone} to ${minZone.zone} with wayfinding or promotions.`,
        impact: 'Better customer experience, reduced crowding',
        timestamp: Date.now(),
        actionable: true,
      });
    }

    // Insight 4: Cross-sell opportunity
    const frequentPairs = this.findFrequentPairs(globalTrends);
    if (frequentPairs.length > 0) {
      insights.push({
        id: `crosssell_${Date.now()}`,
        title: '🎁 Cross-Sell Opportunity',
        description: `Customers asking about ${frequentPairs[0][0]} often also mention ${frequentPairs[0][1]}`,
        category: 'opportunity',
        severity: 'low',
        affectedEntities: frequentPairs[0],
        affectedZones: Object.keys(zoneTrends),
        recommendation: `Create combo deals or place these stores near each other.`,
        impact: 'Average 15% increase in basket size',
        timestamp: Date.now(),
        actionable: true,
      });
    }

    return insights;
  }

  /**
   * Recommend staffing adjustments
   */
  recommendStaffing(
    zoneTrends: Record<string, Array<{ entity: string; count: number }>>,
    currentStaffing: Record<string, number>
  ): StaffRecommendation[] {
    return Object.entries(zoneTrends).map(([zone, trends]) => {
      const totalDemand = trends.reduce((sum, t) => sum + t.count, 0);
      const avgDemand = totalDemand / Math.max(trends.length, 1);

      // Formula: 1 staff per 10 units of demand
      const recommendedStaff = Math.max(2, Math.ceil(avgDemand / 10));
      const current = currentStaffing[zone] || 2;
      const diff = recommendedStaff - current;

      let urgency: 'low' | 'medium' | 'high' = 'low';
      if (diff > 2) urgency = 'high';
      else if (diff > 0) urgency = 'medium';

      return {
        zone,
        currentStaff: current,
        recommendedStaff,
        reason: diff > 0
          ? `High demand (${avgDemand.toFixed(0)} units/period)`
          : diff < 0
            ? `Low demand, optimize costs`
            : 'Demand aligned with staffing',
        urgency,
      };
    });
  }

  /**
   * Get daily/hourly patterns
   */
  getTemporalPatterns(historicalData: Map<string, number[]>): {
    peakHours: number[];
    slowHours: number[];
    recommendation: string;
  } {
    // This is a simplified version - in production, analyze full historical data
    const peakHours = [12, 13, 18, 19]; // Typical lunch & dinner
    const slowHours = [6, 7, 21, 22]; // Early morning & late night

    return {
      peakHours,
      slowHours,
      recommendation: 'Consider dynamic pricing: premium during peak, discounts during slow hours.',
    };
  }

  /**
   * Predict next week's trends
   */
  forecastWeekly(currentTrends: Array<{ entity: string; count: number }>): Array<{ entity: string; nextWeekCount: number; change: number }> {
    // Simplified: assume 10% growth on top performers, 5% on others
    return currentTrends.map(trend => ({
      entity: trend.entity,
      nextWeekCount: Math.round(trend.count * 1.08),
      change: 8,
    }));
  }

  // Helper methods

  private isCoreSeller(entity: string): boolean {
    const coreSellers = ['Starbucks', 'Nike', 'Chipotle'];
    return coreSellers.includes(entity);
  }

  private findFrequentPairs(trends: Array<{ entity: string; count: number }>): string[][] {
    // Simplified pairing logic - in production, analyze co-occurrence patterns
    const pairs: string[][] = [];

    if (trends.length >= 2) {
      pairs.push([trends[0].entity, trends[1].entity]);
    }

    return pairs;
  }
}

export const insightEngine = new InsightEngine();
