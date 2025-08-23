// AI-powered allergen and dietary tag detection service
import { AIProcessingRequest, AIProcessingResponse, REGIONAL_ALLERGENS, DIETARY_OPTIONS } from '@/lib/types/menu';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class AllergenDetectionService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';
  private model = 'gpt-4';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured. AI allergen detection will use fallback mode.');
    }
  }

  /**
   * Process menu items for allergen and dietary tag detection
   */
  async processMenuItems(request: AIProcessingRequest): Promise<AIProcessingResponse> {
    console.log(`[AI Allergen Detection] Processing ${request.items.length} items for region: ${request.region}`);

    if (!this.apiKey) {
      return this.getFallbackResponse(request);
    }

    try {
      const startTime = Date.now();
      
      // Get regional allergen requirements
      const regionalConfig = REGIONAL_ALLERGENS[request.region];
      if (!regionalConfig) {
        throw new Error(`Unsupported region: ${request.region}`);
      }

      // Create AI prompt
      const prompt = this.createAllergenDetectionPrompt(request, regionalConfig);
      
      // Call OpenAI API
      const response = await this.callOpenAI(prompt);
      
      // Parse response
      const processedItems = this.parseAIResponse(response, request.items);
      
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        processedItems,
        warnings: this.generateWarnings(processedItems),
        errors: [],
        processingTime,
        modelUsed: this.model,
      };

    } catch (error) {
      console.error('[AI Allergen Detection] Error:', error);
      return {
        success: false,
        processedItems: [],
        warnings: [],
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        processingTime: 0,
        modelUsed: this.model,
      };
    }
  }

  /**
   * Create AI prompt for allergen detection
   */
  private createAllergenDetectionPrompt(request: AIProcessingRequest, regionalConfig: any): OpenAIMessage[] {
    const allergenList = regionalConfig.mandatoryAllergens.map((a: any) => a.name).join(', ');
    const dietaryList = DIETARY_OPTIONS.map(d => d.name).join(', ');

    const systemPrompt = `You are an expert food allergen and dietary restriction analyzer. Your task is to analyze menu items and identify potential allergens and dietary classifications.

REGION: ${request.region} (${regionalConfig.name})
MANDATORY ALLERGENS FOR THIS REGION: ${allergenList}
DIETARY OPTIONS TO CONSIDER: ${dietaryList}

For each menu item, analyze the name, description, and any ingredients mentioned. Return a JSON response with the following structure:

{
  "items": [
    {
      "name": "item name",
      "allergens": [
        {
          "tag": "allergen_name",
          "confidence": 85,
          "reasoning": "brief explanation"
        }
      ],
      "dietary": [
        {
          "tag": "dietary_tag",
          "confidence": 90,
          "reasoning": "brief explanation"
        }
      ],
      "suggestions": ["any suggestions for improvement"]
    }
  ]
}

IMPORTANT GUIDELINES:
1. Only include allergens that are LIKELY present based on typical ingredients
2. Use confidence scores: 90-100 (very likely), 70-89 (likely), 50-69 (possible), below 50 (unlikely - don't include)
3. Be conservative - it's better to over-identify potential allergens than miss them
4. Consider cross-contamination risks in commercial kitchens
5. For dietary tags, be strict - only mark as vegetarian/vegan if you're confident
6. Provide brief, clear reasoning for each tag
7. Use the exact allergen names from the mandatory list for this region
8. If unsure about an item, include it in suggestions for manual review`;

    const userPrompt = `Please analyze these menu items:

${request.items.map((item, index) => 
  `${index + 1}. ${item.name}${item.description ? ` - ${item.description}` : ''}${item.ingredients ? ` (Ingredients: ${item.ingredients})` : ''}`
).join('\n')}

${request.options?.customPrompt ? `\nAdditional instructions: ${request.options.customPrompt}` : ''}`;

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(messages: OpenAIMessage[]): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.1, // Low temperature for consistent results
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const data: OpenAIResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenAI API');
    }

    return data.choices[0].message.content;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(aiResponse: string, originalItems: any[]): any[] {
    try {
      const parsed = JSON.parse(aiResponse);
      
      if (!parsed.items || !Array.isArray(parsed.items)) {
        throw new Error('Invalid AI response format');
      }

      return parsed.items.map((item: any, index: number) => {
        const originalItem = originalItems[index] || {};
        return {
          // Preserve all original item data
          ...originalItem,
          // Override with AI-processed data
          name: item.name || originalItem.name || `Item ${index + 1}`,
          allergens: (item.allergens || []).filter((a: any) => a.confidence >= 50),
          dietary: (item.dietary || []).filter((d: any) => d.confidence >= 50),
          suggestions: item.suggestions || [],
        };
      });

    } catch (error) {
      console.error('[AI Allergen Detection] Error parsing AI response:', error);
      // Return fallback structure preserving original data
      return originalItems.map((item, index) => ({
        ...item, // Preserve all original item data
        allergens: [],
        dietary: [],
        suggestions: ['AI parsing failed - manual review required'],
      }));
    }
  }

  /**
   * Generate warnings based on processed items
   */
  private generateWarnings(processedItems: any[]): string[] {
    const warnings: string[] = [];

    // Check for items with no allergen tags
    const itemsWithoutAllergens = processedItems.filter(item => item.allergens.length === 0);
    if (itemsWithoutAllergens.length > 0) {
      warnings.push(`${itemsWithoutAllergens.length} items have no allergen tags - please review manually`);
    }

    // Check for low confidence tags
    const lowConfidenceItems = processedItems.filter(item => 
      [...item.allergens, ...item.dietary].some((tag: any) => tag.confidence < 70)
    );
    if (lowConfidenceItems.length > 0) {
      warnings.push(`${lowConfidenceItems.length} items have low-confidence tags - manual review recommended`);
    }

    return warnings;
  }

  /**
   * Fallback response when AI is not available
   */
  private getFallbackResponse(request: AIProcessingRequest): AIProcessingResponse {
    console.log('[AI Allergen Detection] Using fallback mode - no AI processing');

    return {
      success: false,
      processedItems: request.items.map(item => ({
        ...item, // Preserve all original item data
        allergens: [],
        dietary: [],
        suggestions: ['AI service not available - manual tagging required'],
      })),
      warnings: ['AI allergen detection is not available - all items require manual review'],
      errors: ['OpenAI API key not configured'],
      processingTime: 0,
      modelUsed: 'fallback',
    };
  }

  /**
   * Validate AI response against regional requirements
   */
  validateRegionalCompliance(processedItems: any[], region: string): {
    compliant: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    const regionalConfig = REGIONAL_ALLERGENS[region];

    if (!regionalConfig) {
      return {
        compliant: false,
        issues: [`Unknown region: ${region}`],
      };
    }

    // Check each item for potential compliance issues
    processedItems.forEach((item, index) => {
      // Check for common allergens that might be missing
      const itemName = item.name.toLowerCase();
      const itemDescription = item.description?.toLowerCase() || '';
      
      // Basic keyword detection for common allergens
      const keywordChecks = [
        { keywords: ['bread', 'pasta', 'wheat', 'flour'], allergen: 'gluten' },
        { keywords: ['cheese', 'milk', 'cream', 'butter'], allergen: 'milk' },
        { keywords: ['egg', 'mayo', 'mayonnaise'], allergen: 'eggs' },
        { keywords: ['nut', 'almond', 'walnut', 'pecan'], allergen: 'nuts' },
        { keywords: ['peanut'], allergen: 'peanuts' },
        { keywords: ['fish', 'salmon', 'tuna', 'cod'], allergen: 'fish' },
        { keywords: ['shrimp', 'crab', 'lobster', 'shellfish'], allergen: 'shellfish' },
      ];

      keywordChecks.forEach(check => {
        const hasKeyword = check.keywords.some(keyword => 
          itemName.includes(keyword) || itemDescription.includes(keyword)
        );
        
        if (hasKeyword) {
          const hasAllergenTag = item.allergens.some((a: any) => 
            a.tag.toLowerCase().includes(check.allergen)
          );
          
          if (!hasAllergenTag) {
            issues.push(`Item "${item.name}" may contain ${check.allergen} but is not tagged`);
          }
        }
      });
    });

    return {
      compliant: issues.length === 0,
      issues,
    };
  }
}

// Export singleton instance
export const allergenDetectionService = new AllergenDetectionService();
