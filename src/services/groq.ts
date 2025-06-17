interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqRequest {
  model: string;
  messages: GroqMessage[];
  max_tokens?: number;
  temperature?: number;
}

interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export class GroqService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateCompletion(messages: GroqMessage[], options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<string | null> {
    if (!this.apiKey || this.apiKey === 'your_groq_api_key_here') {
      console.warn('Groq API key not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options?.model || 'llama3-8b-8192',
          messages,
          max_tokens: options?.maxTokens || 1000,
          temperature: options?.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        console.error(`Groq API error: ${response.status} - ${response.statusText}`, errorData);
        return null;
      }

      const data: GroqResponse = await response.json();
      return data.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('Groq API request failed:', error);
      return null;
    }
  }

  async expandThought(rawText: string, mode: string): Promise<string | null> {
    const systemPrompts = {
      essay: `You are a thoughtful essayist who transforms simple observations into profound, well-structured essays. Take the user's shower thought and expand it into a compelling 3-4 paragraph essay that explores the deeper implications, philosophical angles, and broader connections to human experience. Write in an engaging, intellectual tone that makes the reader think deeply about the topic. Make each expansion unique and avoid repetitive content.`,
      
      startup_pitch: `You are a charismatic startup founder who can turn any idea into a billion-dollar opportunity. Transform the user's shower thought into an exciting startup pitch. Include the problem it solves, the market opportunity, your unique solution, traction potential, and funding ask. Be enthusiastic, use startup buzzwords naturally, and make it sound like the next unicorn company. Keep it energetic and compelling. Create a unique pitch each time.`,
      
      rap_verse: `You are a skilled rapper who creates clever, rhythmic verses. Transform the user's shower thought into a creative rap verse with good flow, internal rhymes, wordplay, and rhythm. Make it clever and entertaining while staying true to the original thought. Include multiple bars that build on the theme with creative metaphors and smooth delivery. Each verse should be original and unique.`,
      
      counter_argument: `You are a critical thinker who challenges conventional wisdom. Take the user's shower thought and present a well-reasoned counter-argument that challenges its assumptions. Examine the premise critically, present alternative perspectives, cite potential flaws in the logic, and offer a compelling opposing viewpoint. Be intellectually rigorous while remaining respectful of the original thought. Provide fresh counterarguments each time.`
    };

    const systemPrompt = systemPrompts[mode as keyof typeof systemPrompts] || systemPrompts.essay;

    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `Please expand on this shower thought: "${rawText}"`
      }
    ];

    try {
      return await this.generateCompletion(messages, {
        model: 'llama3-8b-8192',
        maxTokens: 800,
        temperature: 0.8
      });
    } catch (error) {
      console.error('Failed to expand thought with Groq:', error);
      return null;
    }
  }

  async rateContent(expandedText: string): Promise<'unicorn' | 'seedling' | 'trash' | null> {
    try {
      const rating = await this.generateCompletion([
        {
          role: 'system',
          content: 'You are an expert evaluator of creative content. Rate the following expanded thought on a scale: "unicorn" (exceptional, groundbreaking, highly creative), "seedling" (good, interesting, has potential), or "trash" (poor, unoriginal, low quality). Respond with only one word: unicorn, seedling, or trash.'
        },
        {
          role: 'user',
          content: `Please rate this expanded thought:\n\n${expandedText}`
        }
      ], {
        maxTokens: 10,
        temperature: 0.3,
        model: 'llama3-8b-8192'
      });

      const normalizedRating = rating?.toLowerCase().trim();
      if (normalizedRating === 'unicorn' || normalizedRating === 'seedling' || normalizedRating === 'trash') {
        return normalizedRating as 'unicorn' | 'seedling' | 'trash';
      }
      return null;
    } catch (error) {
      console.error('Error rating with Groq:', error);
      return null;
    }
  }
}