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
      const url = `${this.baseUrl}/dagi-ai/`;
      
      console.log('🔵 === DAGI AI REQUEST ===');
      console.log('🔵 URL:', url);
      console.log('🔵 Prompt:', prompt);
      
      const response = await authorizedFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      console.log('🔵 Response Status:', response.status);
      console.log('🔵 Response OK:', response.ok);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Error Response:', errorData);
        throw new Error(`AI request failed (${response.status}): ${errorData || response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Success Response:', JSON.stringify(data, null, 2));
      console.log('🔵 === END REQUEST ===\n');
      
      return data;
    } catch (error) {
      console.error('❌ === DAGI AI ERROR ===');
      console.error('❌ Error:', error);
      console.error('❌ === END ERROR ===\n');
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
   * Helper method to detect if a prompt is tarot-related
   */
  isTarotPrompt(prompt: string): boolean {
    const tarotKeywords = ['tarot', 'card', 'reading', 'tarot reading', 'draw cards', 'tarot cards'];
    const lowerPrompt = prompt.toLowerCase();
    return tarotKeywords.some(keyword => lowerPrompt.includes(keyword));
  }
}

// Export singleton instance
export const dagiAIService = new DagiAIService();
export default dagiAIService;