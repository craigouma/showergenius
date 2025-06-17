import { Thought } from '../types';
import { nanoid } from 'nanoid';

// In-memory storage for demo purposes
let thoughts: Thought[] = [];

export const storage = {
  // Get all thoughts sorted by created_at desc
  getAllThoughts: (): Thought[] => {
    return [...thoughts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Get thought by ID
  getThought: (id: string): Thought | undefined => {
    return thoughts.find(t => t.id === id);
  },

  // Create new thought
  createThought: (raw_text: string, mode_selected: Thought['mode_selected']): Thought => {
    const thought: Thought = {
      id: nanoid(),
      raw_text,
      mode_selected,
      created_at: new Date().toISOString(),
    };
    thoughts.push(thought);
    return thought;
  },

  // Update thought
  updateThought: (id: string, updates: Partial<Thought>): Thought | undefined => {
    const index = thoughts.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    
    thoughts[index] = { ...thoughts[index], ...updates };
    return thoughts[index];
  },

  // Reset all data
  resetData: () => {
    thoughts = [];
  },

  // Initialize with seed data
  initializeSeedData: () => {
    // Clear existing data to ensure fresh seed data
    thoughts = [];
    
    const seedThoughts: Omit<Thought, 'id' | 'created_at'>[] = [
      {
        raw_text: "Why do we drive on parkways and park on driveways?",
        mode_selected: 'essay',
        expanded_text: "This linguistic paradox reveals the fascinating chaos of English etymology. Parkways, originally designed as scenic routes through park-like settings, earned their name from the landscaped beauty they traverse—not from any parking function. Meanwhile, driveways, the private roads leading to our homes, take their name from the act of driving upon them, despite being primarily used for parking.\n\nThis delightful contradiction showcases how language evolves organically, often prioritizing historical context over logical consistency. It's a perfect example of how our everyday vocabulary carries the weight of forgotten intentions and abandoned meanings.\n\nThe beauty lies in recognizing that language isn't a perfectly logical system—it's a living, breathing entity that grows through usage, cultural shifts, and historical accidents. These linguistic quirks remind us that human communication is beautifully imperfect, shaped more by tradition than by rational design.",
        value_meter: 'seedling'
      },
      {
        raw_text: "If money is time, are ATMs time machines?",
        mode_selected: 'startup_pitch',
        expanded_text: "Introducing ChronoBank: The world's first temporal financial platform. We've cracked the code that Ben Franklin hinted at centuries ago. Our revolutionary ATMs don't just dispense cash—they redistribute your most valuable resource: time itself.\n\nEvery withdrawal represents hours of your life, and every deposit adds moments back to your timeline. With ChronoBank, you can literally buy time, sell time, and even loan time to others. We're not just disrupting banking; we're revolutionizing the fabric of existence.\n\nOur proprietary TimeValue algorithm calculates the exact temporal worth of every transaction. Imagine withdrawing $100 and knowing you're trading 3.2 hours of your life. Or depositing your paycheck and watching your life expectancy increase in real-time.\n\nWe're seeking $50M Series A to scale our temporal infrastructure globally. Join us in making 'time is money' more than just a saying—make it the foundation of a $100 billion temporal economy.",
        value_meter: 'unicorn'
      },
      {
        raw_text: "Do fish think water is wet?",
        mode_selected: 'counter_argument',
        expanded_text: "Actually, fish probably don't perceive water as 'wet' at all, and this reveals a fundamental flaw in how we anthropomorphize animal experiences. Wetness is entirely a human construct based on our terrestrial experience—we feel wet when water adheres to our dry skin, creating a contrast we can perceive.\n\nFor fish, water isn't a substance that covers them; it's their entire environmental medium. They don't experience the contrast between dry and wet that defines wetness for us. It's like asking if we think air is 'airy.' We're so immersed in our atmospheric medium that we don't categorize it the same way we do other substances.\n\nFish likely perceive water through pressure gradients, temperature variations, chemical concentrations, and electrical conductivity—not as a coating substance that makes things wet. Their sensory apparatus evolved specifically for aquatic environments, making our land-based concept of 'wetness' completely irrelevant to their experience.\n\nThis question actually reveals more about human cognitive limitations than fish perception—we struggle to imagine experiences outside our own sensory framework.",
        value_meter: 'seedling'
      }
    ];

    seedThoughts.forEach(seed => {
      const thought: Thought = {
        ...seed,
        id: nanoid(),
        created_at: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString() // Random time in last 3 days
      };
      thoughts.push(thought);
    });
  }
};