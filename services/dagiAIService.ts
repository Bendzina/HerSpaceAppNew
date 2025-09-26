import { authorizedFetch } from './authService';

export interface TarotCard {
  id: number;
  name: string;
  description: string;
  image_url?: string;
  is_active: boolean;
  is_major_arcana: boolean;
  suit: 'major' | 'cups' | 'pentacles' | 'swords' | 'wands';
  upright_meanings: string[];
  reversed_meanings: string[];
  created_at: string;
  updated_at: string;
}

export interface TarotReading {
  id: number;
  prompt_type: 'single_card' | 'three_card' | 'celtic_cross' | 'daily' | 'custom';
  question: string;
  cards_drawn: Array<{
    card_id: number;
    name: string;
    suit: string;
    is_major_arcana: boolean;
    is_reversed: boolean;
    position: number;
    meanings: string[];
  }>;
  interpretation: string;
  advice: string;
  is_ai_generated: boolean;
  ai_model_used?: string;
  created_at: string;
  updated_at: string;
}

export interface AIConversation {
  id: number;
  conversation_type: 'tarot' | 'general' | 'guidance' | 'reflection';
  user_message: string;
  ai_response: string;
  context_data: Record<string, any>;
  is_favorite: boolean;
  created_at: string;
}

export interface DagiAIResponse {
  message: string;
  reading?: TarotReading;
  conversation?: AIConversation;
  temporary_note?: string;
}

class DagiAIService {
  private readonly baseUrl = 'http://192.168.100.4:8000/api/journal';

  /**
   * Send a message to Dagi AI (handles both general chat and tarot requests)
   */
  async sendMessage(prompt: string): Promise<DagiAIResponse> {
    try {
      const response = await authorizedFetch(`${this.baseUrl}/dagi-ai/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`AI request failed: ${errorData || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Dagi AI Service Error:', error);
      throw error;
    }
  }

  /**
   * Get all available tarot cards
   */
  async getTarotCards(): Promise<TarotCard[]> {
    try {
      const response = await authorizedFetch(`${this.baseUrl}/tarot/cards/`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tarot cards: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tarot cards:', error);
      throw error;
    }
  }

  /**
   * Get user's tarot reading history
   */
  async getTarotReadings(): Promise<TarotReading[]> {
    try {
      const response = await authorizedFetch(`${this.baseUrl}/tarot/readings/`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tarot readings: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tarot readings:', error);
      throw error;
    }
  }

  /**
   * Get a specific tarot reading
   */
  async getTarotReading(id: number): Promise<TarotReading> {
    try {
      const response = await authorizedFetch(`${this.baseUrl}/tarot/readings/${id}/`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tarot reading: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tarot reading:', error);
      throw error;
    }
  }

  /**
   * Get user's AI conversation history
   */
  async getAIConversations(): Promise<AIConversation[]> {
    try {
      const response = await authorizedFetch(`${this.baseUrl}/ai/conversations/`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch AI conversations: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching AI conversations:', error);
      throw error;
    }
  }

  /**
   * Get a specific AI conversation
   */
  async getAIConversation(id: number): Promise<AIConversation> {
    try {
      const response = await authorizedFetch(`${this.baseUrl}/ai/conversations/${id}/`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch AI conversation: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching AI conversation:', error);
      throw error;
    }
  }

  /**
   * Create a new AI conversation
   */
  async createAIConversation(
    conversationType: 'tarot' | 'general' | 'guidance' | 'reflection',
    userMessage: string,
    contextData?: Record<string, any>
  ): Promise<AIConversation> {
    try {
      const response = await authorizedFetch(`${this.baseUrl}/ai/conversations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_type: conversationType,
          user_message: userMessage,
          context_data: contextData || {},
          is_favorite: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create AI conversation: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating AI conversation:', error);
      throw error;
    }
  }

  /**
   * Helper method to detect if a prompt is tarot-related
   */
  isTarotPrompt(prompt: string): boolean {
    const tarotKeywords = ['tarot', 'card', 'reading', 'tarot reading', 'draw cards', 'tarot cards'];
    const lowerPrompt = prompt.toLowerCase();
    return tarotKeywords.some(keyword => lowerPrompt.includes(keyword));
  }

  /**
   * Helper method to extract reading type from prompt
   */
  getReadingType(prompt: string): 'single_card' | 'three_card' | 'celtic_cross' | 'daily' | 'custom' {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('single') || lowerPrompt.includes('one card')) {
      return 'single_card';
    } else if (lowerPrompt.includes('three') || lowerPrompt.includes('past present future')) {
      return 'three_card';
    } else if (lowerPrompt.includes('celtic') || lowerPrompt.includes('cross')) {
      return 'celtic_cross';
    } else if (lowerPrompt.includes('daily')) {
      return 'daily';
    } else {
      return 'custom';
    }
  }
}

// Export singleton instance
export const dagiAIService = new DagiAIService();
export default dagiAIService;
