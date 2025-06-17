import { GenerateExpansionRequest, ValueMeter, PostRedditRequest, Thought } from '../types';
import { storage } from '../data/storage';
import { GroqService } from './groq';

// Initialize Groq service for AI expansion
const groqService = new GroqService(
  import.meta.env.VITE_GROQ_API_KEY || ''
);

// AI expansion service using Groq (free alternative to OpenAI)
export const generateExpansion = async (request: GenerateExpansionRequest): Promise<string> => {
  const { raw_text, mode_selected } = request;
  
  try {
    console.log(`Generating ${mode_selected} expansion for: "${raw_text}"`);
    
    // Check if Groq API key is available
    if (!import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROQ_API_KEY === 'your_groq_api_key_here') {
      console.log('Groq API key not configured, using fallback expansion');
      return await generateMockExpansion(request);
    }
    
    // Use Groq to generate dynamic expansion
    const expansion = await groqService.expandThought(raw_text, mode_selected);
    
    if (expansion && expansion.trim()) {
      console.log('Groq expansion generated successfully');
      return expansion.trim();
    }
    
    // Fallback to mock if Groq fails
    console.log('Groq failed or returned empty response, using fallback expansion');
    return await generateMockExpansion(request);
    
  } catch (error) {
    console.error('Error generating expansion:', error);
    return await generateMockExpansion(request);
  }
};

// Fallback mock expansion (keeping original logic as backup)
const generateMockExpansion = async (request: GenerateExpansionRequest): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  const { raw_text, mode_selected } = request;
  
  // Mock AI responses based on mode
  const responses = {
    essay: `This thought opens a fascinating window into the human condition. "${raw_text}" isn't just a random observation—it's a profound reflection of how we navigate the complexities of modern life. When we examine this more deeply, we discover layers of meaning that speak to our collective experience and the paradoxes we face daily.

The beauty of this observation lies in its simplicity yet profound implications. It challenges our assumptions about language, society, and the way we structure our world. This seemingly innocent question reveals the arbitrary nature of many conventions we take for granted.

Consider how this reflects our relationship with language itself—how words evolve, meanings shift, and logic sometimes takes a backseat to historical precedent. It's a perfect example of how the most mundane aspects of our daily lives can spark deeper philosophical inquiries about meaning, purpose, and the human experience.`,
    
    startup_pitch: `Introducing ThoughtFlow: The revolutionary platform that turns "${raw_text}" into actionable insights. We're disrupting a $50B market by leveraging AI to transform everyday observations into breakthrough innovations. 

Our proprietary algorithm has identified this as a key pain point affecting millions globally. With our solution, we can scale this insight into a unicorn-level opportunity. We've already secured pre-seed funding and have partnerships lined up with major tech companies.

The market is ready for disruption. Traditional thinking patterns are outdated. We're not just building a product—we're creating an entirely new category. Our vision is to democratize genius-level insights and make profound thinking accessible to everyone. Join us in revolutionizing how humanity processes and shares breakthrough ideas.`,
    
    rap_verse: `Yo, check it out, here's the deal, let me break it down real
"${raw_text}" got me thinking what's surreal
Breaking down the system with my mental appeal
These thoughts in my head, they're the truth I reveal

From the shower to the stage, keeping it one hundred
Making wisdom from the water, got my mind all thundered
Every drop that hits my skin brings another revelation
Turning bathroom philosophy into lyrical sensation

They say the best ideas come when you least expect
In the steam and the heat, that's when thoughts connect
So I'm spitting these bars with that shower power
Turning three-minute thoughts into my finest hour`,
    
    counter_argument: `While "${raw_text}" might seem obvious at first glance, there's actually a compelling counter-perspective that deserves serious consideration. The underlying assumptions here warrant careful scrutiny, and when we examine the evidence more thoroughly, we discover that the opposite viewpoint has significant merit.

First, let's challenge the fundamental premise. The conventional wisdom embedded in this statement may actually be based on outdated information or cultural biases that no longer apply in our modern context. Recent research and evolving perspectives suggest that what we've long accepted as truth might need substantial revision.

Furthermore, this perspective fails to account for important variables and alternative explanations that could completely reframe our understanding. When we consider the broader implications and examine case studies that contradict this viewpoint, we find compelling evidence that suggests the opposite conclusion may be more accurate and useful.`
  };

  return responses[mode_selected] || responses.essay;
};

// Voice generation using free browser speech
export async function generateVoice(text: string): Promise<string | null> {
  const { voiceGenerator } = await import('./voice-generator');
  
  try {
    const result = await voiceGenerator.generateVoice(text);
    
    if (result.success) {
      console.log(`✅ Voice generated using ${result.service}`);
      return result.audioUrl || null;
    } else {
      console.error('❌ Voice generation failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Voice generation error:', error);
    return null;
  }
}

// Enhanced value rating using Groq
export const rateValueMeter = async (expanded_text: string): Promise<ValueMeter> => {
  try {
    // Check if Groq API key is available
    if (import.meta.env.VITE_GROQ_API_KEY && import.meta.env.VITE_GROQ_API_KEY !== 'your_groq_api_key_here') {
      const rating = await groqService.rateContent(expanded_text);
      
      if (rating) {
        return rating as ValueMeter;
      }
    }
  } catch (error) {
    console.error('Error rating with Groq:', error);
  }

  // Fallback to original logic
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const wordCount = expanded_text.split(' ').length;
  const hasKeywords = /revolutionary|breakthrough|innovative|genius|profound|exceptional|brilliant|groundbreaking/.test(expanded_text.toLowerCase());
  
  if (wordCount > 150 && hasKeywords) {
    return 'unicorn';
  } else if (wordCount > 80) {
    return 'seedling';
  } else {
    return 'trash';
  }
};

// Mock Reddit posting service
export const postReddit = async (request: PostRedditRequest): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock Reddit permalink
  return `https://reddit.com/r/Showerthoughts/comments/mockpost_${request.thought_id}`;
};

// Combined service to create and process a thought
export const createAndProcessThought = async (
  raw_text: string, 
  mode_selected: 'essay' | 'startup_pitch' | 'rap_verse' | 'counter_argument'
) => {
  // Create the thought
  const thought = storage.createThought(raw_text, mode_selected);
  
  try {
    // Generate expansion using Groq
    const expanded_text = await generateExpansion({
      thought_id: thought.id,
      raw_text,
      mode_selected
    });
    
    // Update with expansion
    storage.updateThought(thought.id, { expanded_text });
    
    // Generate voice with proper error handling
    try {
      const voice_url = await generateVoice(expanded_text);
      
      // Update with voice URL (convert null to undefined for TypeScript compatibility)
      storage.updateThought(thought.id, { voice_url: voice_url || undefined });
    } catch (voiceError) {
      console.error('Voice generation failed:', voiceError);
      // Continue without voice - don't fail the entire process
    }
    
    // Rate the thought using Groq
    const value_meter = await rateValueMeter(expanded_text);
    
    // Final update
    storage.updateThought(thought.id, { value_meter });
    
    return storage.getThought(thought.id)!;
  } catch (error) {
    console.error('Error processing thought:', error);
    return thought;
  }
};