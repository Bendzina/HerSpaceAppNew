// services/aiService.ts
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AIService {
  private useRealAPI: boolean = false; // ეს შეცვალე true-ზე როცა ready იქნები
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
  }

  async sendMessage(
    messages: ChatMessage[], 
    language: 'ka' | 'en' = 'ka'
  ): Promise<string> {
    
    // თუ real API enabled არაა, მაშინ mock response
    if (!this.useRealAPI || !this.apiKey) {
      return this.getMockResponse(messages, language);
    }

    // Real OpenAI API call
    return this.getRealResponse(messages, language);
  }

  private async getMockResponse(
    messages: ChatMessage[], 
    language: 'ka' | 'en'
  ): Promise<string> {
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
    
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    
    // Smart mock responses based on user input
    const georgianResponses = this.getGeorgianResponses();
    const englishResponses = this.getEnglishResponses();
    
    const responses = language === 'ka' ? georgianResponses : englishResponses;
    
    // Keyword-based responses
    if (lastMessage.includes('სმუთი') || lastMessage.includes('კვება') || lastMessage.includes('eat') || lastMessage.includes('diet')) {
      return responses.nutrition[Math.floor(Math.random() * responses.nutrition.length)];
    }
    
    if (lastMessage.includes('ძილი') || lastMessage.includes('დღე') || lastMessage.includes('sleep') || lastMessage.includes('tired')) {
      return responses.sleep[Math.floor(Math.random() * responses.sleep.length)];
    }
    
    if (lastMessage.includes('სტრესი') || lastMessage.includes('შფოთვა') || lastMessage.includes('stress') || lastMessage.includes('anxiety')) {
      return responses.stress[Math.floor(Math.random() * responses.stress.length)];
    }
    
    if (lastMessage.includes('სპორტი') || lastMessage.includes('ვარჯიში') || lastMessage.includes('exercise') || lastMessage.includes('workout')) {
      return responses.exercise[Math.floor(Math.random() * responses.exercise.length)];
    }
    
    // Default general responses
    return responses.general[Math.floor(Math.random() * responses.general.length)];
  }

  private getGeorgianResponses() {
    return {
      general: [
        'ვესმი შენს გრძნობას. ეს ნორმალურია და ყველას ახდება ზოგჯერ 💙',
        'დარწმუნებული ვარ რომ შევძლებთ ამის გადაჭრას ერთად. მითხარი მეტი დეტალი 🌟',
        'მნიშვნელოვანია რომ ამაზე საუბარობ. ეს პირველი ნაბიჯია გამოჯანმრთელებისკენ ✨',
        'შენ ძალიან ძლიერი ხარ რომ ამაზე ფიქრობ. რას ფიქრობ, სად დავიწყოთ? 🤗',
        'ეს საინტერესო თემაა! შემიძლია რამდენიმე იდეა მოგცე რაც შეიძლება დაგეხმაროს 💡',
      ],
      stress: [
        'სტრესი ცხოვრების ნაწილია, მაგრამ მისი მართვა შესაძლებელია. სცადე სუნთქვის ვარჯიში 🧘‍♀️',
        'როცა სტრესს გრძნობ, 4-7-8 ტექნიკა სცადე: 4 წამი ჩასუნთქე, 7 წამი დაიკავე, 8 წამი ამოისუნთქე 💨',
        'სტრესის დროს ბუნებაში სეირნობა ძალიან კარგია. ან მარტივი მედიტაცია 5 წუთით 🌱',
        'სტრესი თავს რომ არ გაგიკვდეს, დღიური წერა სცადე. ყველაფერი რაც გაწუხებს ჩაწერე ქაღალდზე 📝',
      ],
      sleep: [
        'კარგი ძილი მენტალური ჯანმრთელობის საფუძველია! სცადე ყოველდღე ერთ დროს დაძინება 😴',
        'ძილის ტელეფონი 1 საათით ადრე ჩააცილე. ეკრანის შუქი ძილს ზიანს აყენებს 📱',
        'საღამოს ჩაის დალევა (კამომილი ან ლავანდა) დაგეხმარება დამშვიდებაში 🍵',
        'ძილამდე 5-10 წუთი კითხვა ან მუსიკის მოსმენა ძალიან კარგია დასვენების რიტმისთვის 📚',
      ],
      nutrition: [
        'საკვები და განწყობა ერთმანეთთან ძალიან კავშირშია! სცადე მეტი ხილი და ბოსტნეული 🥗',
        'წყალი ბევრი დალევა მნიშვნელოვანია. დღეში 8 ჭიქა წყლის მიღება სცადე 💧',
        'დილის საუზმეს არ გამოტოვო! ეს დღის ენერგიისა და განწყობის საწყისია 🌅',
        'შაქრის ბევრი მიღება განწყობას ძალიან უარყოფითად მოქმედებს. ნატურალური ტკბილეული სცადე 🍯',
      ],
      exercise: [
        'ფიზიკური აქტივობა ბუნებრივი ანტიდეპრესანტია! 20-30 წუთი ყოველდღე საკმარისია 🏃‍♀️',
        'სეირნობა ყველაზე მარტივი და ეფექტური ვარჯიშია. სცადე დღეში 30 წუთი 🚶‍♂️',
        'იოგა სტრესის შემცირებისა და ფიზიკური ფორმის შენარჩუნებისთვის შესანიშნავია 🧘',
        'ცეკვა, ფეხბურთი, ველოსიპედი - ისარგებლე იმით რაც გიყვარს! მთავარია მოძრაობა 💃',
      ]
    };
  }

  private getEnglishResponses() {
    return {
      general: [
        'I understand how you feel. This is completely normal and happens to everyone sometimes 💙',
        "I'm confident we can work through this together. Tell me more details 🌟",
        "It's important that you're talking about this. That's the first step towards healing ✨",
        "You're very strong for thinking about this. Where do you think we should start? 🤗",
        "That's an interesting topic! I can give you some ideas that might help 💡",
      ],
      stress: [
        'Stress is part of life, but managing it is possible. Try breathing exercises 🧘‍♀️',
        'When you feel stress, try the 4-7-8 technique: breathe in for 4 seconds, hold for 7, breathe out for 8 💨',
        'During stress, walking in nature is great. Or simple meditation for 5 minutes 🌱',
        'To prevent stress from overwhelming you, try journaling. Write down everything that bothers you 📝',
      ],
      sleep: [
        'Good sleep is the foundation of mental health! Try going to bed at the same time every day 😴',
        'Put your phone away 1 hour before sleep. Screen light damages sleep quality 📱',
        'Evening tea (chamomile or lavender) will help you relax 🍵',
        '5-10 minutes of reading or listening to music before bed is great for your sleep routine 📚',
      ],
      nutrition: [
        'Food and mood are very connected! Try eating more fruits and vegetables 🥗',
        'Drinking plenty of water is important. Try to drink 8 glasses of water per day 💧',
        "Don't skip breakfast! It's the foundation of daily energy and mood 🌅",
        'Too much sugar affects mood very negatively. Try natural sweeteners 🍯',
      ],
      exercise: [
        'Physical activity is a natural antidepressant! 20-30 minutes daily is enough 🏃‍♀️',
        'Walking is the simplest and most effective exercise. Try 30 minutes a day 🚶‍♂️',
        'Yoga is excellent for reducing stress and maintaining physical fitness 🧘',
        'Dancing, football, cycling - use what you love! The main thing is movement 💃',
      ]
    };
  }

  private async getRealResponse(
    messages: ChatMessage[], 
    language: 'ka' | 'en'
  ): Promise<string> {
    const systemPrompt: ChatMessage = {
      role: 'system',
      content: language === 'ka' 
        ? `შენ ხარ Dagi - AI ასისტენტი მენტალური კეთილდღეობისათვის. 
           მიპასუხე ქართულად, იყავი თბილი, თანადგომისმოყვარე და მხარდამჭერი. 
           შენი მიზანია დაეხმარო ადამიანებს მენტალური ჯანმრთელობის გაუმჯობესებაში.
           გამოიყენე emojis და პოზიტიური ენერგია. მაქსიმუმ 150 სიტყვაში მიპასუხე.`
        : `You are Dagi - an AI assistant for mental well-being. 
           Be warm, empathetic and supportive. Your goal is to help people 
           improve their mental health. Use emojis and positive energy.
           Respond in maximum 150 words.`
    };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [systemPrompt, ...messages],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('API Error');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'უკაცრავად, ვერ მივიღე პასუხი';

    } catch (error) {
      console.error('Real API Error:', error);
      // Fallback to mock response
      return this.getMockResponse(messages, language);
    }
  }

  // Method to switch to real API when ready
  enableRealAPI(enable: boolean = true) {
    this.useRealAPI = enable;
    console.log(`AI Service: Real API ${enable ? 'enabled' : 'disabled'}`);
  }
}

export const aiService = new AIService();

// Export for easy switching
export const enableRealAPI = (enable: boolean) => aiService.enableRealAPI(enable);
