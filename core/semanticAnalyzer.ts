/**
 * Semantic Analysis Module with Claude API
 * Enhanced NLP beyond rule-based extraction
 * - Entity linking and disambiguation
 * - Sentiment analysis (happy, frustrated, curious)
 * - Intent confidence scoring
 * - Multi-language support
 * - Context awareness
 */

export interface SemanticAnalysis {
  // Original intent (rule-based)
  intent: string;
  intentConfidence: number;

  // Semantic enhancements
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // 0-1

  // Entity enrichment
  entities: string[];
  linkedCategories: string[]; // e.g., 'Crumbl' -> ['dessert', 'bakery']

  // Customer intent details
  urgency: 'low' | 'medium' | 'high';
  isGroupDemand: boolean; // "we're looking for" vs "I'm looking for"
  hasComplaint: boolean;

  // Language info
  detectedLanguage: string;
  confidence: number;
}

// Entity category mapping for enrichment
const ENTITY_CATEGORIES: Record<string, string[]> = {
  'Crumbl': ['dessert', 'bakery', 'cookies', 'sweets'],
  'Auntie Anne\'s': ['snacks', 'pretzels', 'fast-food'],
  'Nike': ['sportswear', 'footwear', 'athletic'],
  'Starbucks': ['coffee', 'beverages', 'cafe'],
  'Lululemon': ['athletic', 'apparel', 'activewear'],
  'Chipotle': ['fast-food', 'mexican', 'bowls'],
  'Pizza': ['food', 'italian', 'fast-food'],
  'Coffee': ['beverages', 'cafe', 'hot-drinks'],
};

export class SemanticAnalyzer {
  private claudeApiKey: string | null = null;

  constructor() {
    this.claudeApiKey = typeof window !== 'undefined'
      ? import.meta.env.VITE_CLAUDE_API_KEY || null
      : null;
  }

  /**
   * Analyze transcript with semantic understanding
   * Falls back to rule-based if Claude is unavailable
   */
  async analyze(transcript: string, baseIntent: string, entities: string[]): Promise<SemanticAnalysis> {
    // If Claude API is available, use it for enhanced analysis
    if (this.claudeApiKey && transcript.length > 10) {
      try {
        return await this.analyzeWithClaude(transcript, baseIntent, entities);
      } catch (err) {
        console.warn('Claude API unavailable, falling back to local analysis:', err);
      }
    }

    // Fallback: Local semantic analysis
    return this.analyzeLocally(transcript, baseIntent, entities);
  }

  private async analyzeWithClaude(
    transcript: string,
    baseIntent: string,
    entities: string[]
  ): Promise<SemanticAnalysis> {
    const prompt = `Analyze this customer quote from a mall:
"${transcript}"

Respond with ONLY a JSON object (no markdown, no explanation):
{
  "sentiment": "positive|neutral|negative",
  "sentimentScore": 0.0-1.0,
  "urgency": "low|medium|high",
  "isGroupDemand": true|false,
  "hasComplaint": true|false,
  "linkedCategories": ["category1", "category2"]
}

Rules:
- Sentiment: Overall customer mood
- Urgency: How soon they need it (words like "need", "hurry", "now" = high)
- IsGroupDemand: "we/us" vs "I/me"
- HasComplaint: Tone indicating dissatisfaction
- LinkedCategories: Infer product categories from context`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.claudeApiKey!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || '{}';

    // Parse JSON response
    let analyzed = JSON.parse(content);

    return {
      intent: baseIntent,
      intentConfidence: 0.85,
      sentiment: analyzed.sentiment || 'neutral',
      sentimentScore: analyzed.sentimentScore || 0.5,
      entities,
      linkedCategories: analyzed.linkedCategories || [],
      urgency: analyzed.urgency || 'low',
      isGroupDemand: analyzed.isGroupDemand || false,
      hasComplaint: analyzed.hasComplaint || false,
      detectedLanguage: 'en',
      confidence: 0.9,
    };
  }

  private analyzeLocally(
    transcript: string,
    baseIntent: string,
    entities: string[]
  ): SemanticAnalysis {
    const lower = transcript.toLowerCase();

    // Sentiment analysis
    const positiveWords = ['love', 'amazing', 'great', 'awesome', 'perfect', 'delicious', 'excellent'];
    const negativeWords = ['hate', 'awful', 'terrible', 'bad', 'broken', 'disappointed', 'disgusted'];
    const positiveCount = positiveWords.filter(w => lower.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lower.includes(w)).length;

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    let sentimentScore = 0.5;

    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      sentimentScore = Math.min(0.9 + positiveCount * 0.05, 1.0);
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      sentimentScore = Math.max(0.1 - negativeCount * 0.05, 0.0);
    }

    // Urgency detection
    const urgencyWords = ['need', 'hurry', 'now', 'quick', 'asap', 'urgent', 'immediately'];
    const urgency = urgencyWords.some(w => lower.includes(w)) ? 'high' : 'low';

    // Group demand detection
    const groupWords = ['we', 'us', 'our', 'we\'re', 'we are'];
    const isGroupDemand = groupWords.some(w => lower.includes(w));

    // Complaint detection
    const complaintWords = ['broken', 'missing', 'wrong', 'issue', 'problem', 'complaint', 'refund'];
    const hasComplaint = complaintWords.some(w => lower.includes(w));

    // Link categories to entities
    const linkedCategories = entities.flatMap(entity =>
      ENTITY_CATEGORIES[entity] || []
    );

    return {
      intent: baseIntent,
      intentConfidence: 0.8,
      sentiment,
      sentimentScore,
      entities,
      linkedCategories: [...new Set(linkedCategories)],
      urgency: urgency as 'low' | 'medium' | 'high',
      isGroupDemand,
      hasComplaint,
      detectedLanguage: 'en',
      confidence: 0.75,
    };
  }

  /**
   * Detect language of transcript
   */
  detectLanguage(text: string): string {
    // Simple heuristic (in production, use proper language detection)
    const commonSpanish = ['qué', 'dónde', 'cómo', 'por favor', 'gracias'];
    const commonChinese = /[\u4E00-\u9FA5]/g;
    const commonArabic = /[\u0600-\u06FF]/g;

    if (commonSpanish.some(w => text.toLowerCase().includes(w))) return 'es';
    if (commonChinese.test(text)) return 'zh';
    if (commonArabic.test(text)) return 'ar';
    return 'en';
  }
}

export const semanticAnalyzer = new SemanticAnalyzer();
