/**
 * Localization & Multi-language Support
 * i18n for Census and accessibility features
 */

export type SupportedLanguage = 'en' | 'es' | 'zh' | 'ar' | 'fr' | 'ja';
export type LanguageCode = SupportedLanguage;

export interface TranslationSet {
  [key: string]: string | TranslationSet;
}

const TRANSLATIONS: Record<SupportedLanguage, TranslationSet> = {
  en: {
    ui: {
      recordButton: 'Record',
      stopButton: 'Stop',
      reset: 'Reset',
      trends: 'Trends',
      detected: 'Detected',
      zone: 'Zone',
      timeWindow: 'Time Window',
    },
    census: {
      recording: 'Census Recording',
      lastDetection: 'Last Detection',
      globalTrends: 'Global Trends',
      recentActivity: 'Recent Activity',
    },
    alerts: {
      fireAlert: 'Fire Alert',
      evacuate: 'Evacuate to nearest exit',
      highDemand: 'High demand detected',
      anomaly: 'Unusual pattern detected',
    },
    insights: {
      risingDemand: 'Rising Demand',
      crossSell: 'Cross-Sell Opportunity',
      staffing: 'Staffing Recommendation',
    },
  },
  es: {
    ui: {
      recordButton: 'Grabar',
      stopButton: 'Parar',
      reset: 'Restablecer',
      trends: 'Tendencias',
      detected: 'Detectado',
      zone: 'Zona',
      timeWindow: 'Ventana de Tiempo',
    },
    census: {
      recording: 'Grabación del Censo',
      lastDetection: 'Última Detección',
      globalTrends: 'Tendencias Globales',
      recentActivity: 'Actividad Reciente',
    },
    alerts: {
      fireAlert: 'Alerta de Incendio',
      evacuate: 'Evacuar a la salida más cercana',
      highDemand: 'Alta demanda detectada',
      anomaly: 'Patrón inusual detectado',
    },
    insights: {
      risingDemand: 'Demanda Creciente',
      crossSell: 'Oportunidad de Venta Cruzada',
      staffing: 'Recomendación de Personal',
    },
  },
  zh: {
    ui: {
      recordButton: '录音',
      stopButton: '停止',
      reset: '重置',
      trends: '趋势',
      detected: '检测到',
      zone: '区域',
      timeWindow: '时间窗口',
    },
    census: {
      recording: '普查录音',
      lastDetection: '最后检测',
      globalTrends: '全球趋势',
      recentActivity: '最近活动',
    },
    alerts: {
      fireAlert: '火灾警报',
      evacuate: '撤离到最近的出口',
      highDemand: '检测到高需求',
      anomaly: '检测到异常模式',
    },
    insights: {
      risingDemand: '需求上升',
      crossSell: '交叉销售机会',
      staffing: '人员配置建议',
    },
  },
  ar: {
    ui: {
      recordButton: 'تسجيل',
      stopButton: 'إيقاف',
      reset: 'إعادة تعيين',
      trends: 'الاتجاهات',
      detected: 'تم الكشف',
      zone: 'المنطقة',
      timeWindow: 'نطاق زمني',
    },
    census: {
      recording: 'تسجيل الإحصاء',
      lastDetection: 'آخر كشف',
      globalTrends: 'الاتجاهات العالمية',
      recentActivity: 'النشاط الأخير',
    },
    alerts: {
      fireAlert: 'تنبيه حريق',
      evacuate: 'الإخلاء إلى أقرب مخرج',
      highDemand: 'كشف طلب عالي',
      anomaly: 'تم كشف نمط غير عادي',
    },
    insights: {
      risingDemand: 'ارتفاع الطلب',
      crossSell: 'فرصة البيع الإضافي',
      staffing: 'توصية الموظفين',
    },
  },
  fr: {
    ui: {
      recordButton: 'Enregistrer',
      stopButton: 'Arrêter',
      reset: 'Réinitialiser',
      trends: 'Tendances',
      detected: 'Détecté',
      zone: 'Zone',
      timeWindow: 'Intervalle de temps',
    },
    census: {
      recording: 'Enregistrement du Recensement',
      lastDetection: 'Dernière Détection',
      globalTrends: 'Tendances Mondiales',
      recentActivity: 'Activité Récente',
    },
    alerts: {
      fireAlert: 'Alerte Incendie',
      evacuate: 'Évacuer vers la sortie la plus proche',
      highDemand: 'Demande élevée détectée',
      anomaly: 'Motif anormal détecté',
    },
    insights: {
      risingDemand: 'Demande Croissante',
      crossSell: 'Opportunité de Vente Croisée',
      staffing: 'Recommandation en Matière de Personnel',
    },
  },
  ja: {
    ui: {
      recordButton: '録音',
      stopButton: '停止',
      reset: 'リセット',
      trends: 'トレンド',
      detected: '検出',
      zone: 'ゾーン',
      timeWindow: '時間窓',
    },
    census: {
      recording: '国勢調査録音',
      lastDetection: '最後の検出',
      globalTrends: 'グローバルトレンド',
      recentActivity: '最近のアクティビティ',
    },
    alerts: {
      fireAlert: '火災警報',
      evacuate: '最寄りの出口に避難',
      highDemand: '高い需要が検出されました',
      anomaly: '異常なパターンが検出されました',
    },
    insights: {
      risingDemand: '需要の上昇',
      crossSell: 'クロスセル機会',
      staffing: 'スタッフィングの推奨',
    },
  },
};

export class Localization {
  private currentLanguage: SupportedLanguage = 'en';
  private detectedLanguage: SupportedLanguage = 'en';

  /**
   * Set the active language
   */
  setLanguage(lang: SupportedLanguage): void {
    if (Object.keys(TRANSLATIONS).includes(lang)) {
      this.currentLanguage = lang;
      this.persistLanguage();
    }
  }

  /**
   * Get current language
   */
  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Detect user's preferred language from browser
   */
  detectLanguage(): SupportedLanguage {
    if (typeof navigator === 'undefined') return 'en';

    const lang = navigator.language.split('-')[0].toLowerCase() as SupportedLanguage;
    if (Object.keys(TRANSLATIONS).includes(lang)) {
      this.detectedLanguage = lang;
      return lang;
    }

    return 'en';
  }

  /**
   * Get translation by key (dot-notation: ui.recordButton)
   */
  t(key: string): string {
    const keys = key.split('.');
    let current: any = TRANSLATIONS[this.currentLanguage];

    for (const k of keys) {
      current = current?.[k];
      if (!current) {
        // Fallback to English
        current = TRANSLATIONS.en;
        for (const fallbackKey of keys) {
          current = current?.[fallbackKey];
        }
        return current || key;
      }
    }

    return current || key;
  }

  /**
   * Format a number in locale format
   */
  formatNumber(num: number): string {
    return new Intl.NumberFormat(this.currentLanguage).format(num);
  }

  /**
   * Format a date in locale format
   */
  formatDate(date: Date | number): string {
    return new Intl.DateTimeFormat(this.currentLanguage).format(new Date(date));
  }

  /**
   * Format time in locale format
   */
  formatTime(date: Date | number): string {
    return new Intl.DateTimeFormat(this.currentLanguage, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }

  /**
   * Persist language choice
   */
  private persistLanguage(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('census.language', this.currentLanguage);
    }
  }

  /**
   * Load language from storage
   */
  loadLanguage(): void {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('census.language') as SupportedLanguage;
      if (stored && Object.keys(TRANSLATIONS).includes(stored)) {
        this.currentLanguage = stored;
      }
    }
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages(): Array<{ code: SupportedLanguage; name: string }> {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'zh', name: '中文' },
      { code: 'ar', name: 'العربية' },
      { code: 'fr', name: 'Français' },
      { code: 'ja', name: '日本語' },
    ];
  }

  /**
   * Check if RTL language
   */
  isRTL(): boolean {
    return ['ar'].includes(this.currentLanguage);
  }
}

export const localization = new Localization();
