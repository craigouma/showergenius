// Free browser-based text-to-speech using Web Speech API
export class BrowserSpeechService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices(): void {
    this.voices = this.synth.getVoices();
    
    // Voices might not be loaded immediately
    if (this.voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  getBestVoices(): SpeechSynthesisVoice[] {
    const voices = this.getVoices();
    
    // Prefer English voices, then high-quality ones
    return voices
      .filter(voice => voice.lang.startsWith('en'))
      .sort((a, b) => {
        // Prefer Google/Microsoft voices
        if (a.name.includes('Google') && !b.name.includes('Google')) return -1;
        if (b.name.includes('Google') && !a.name.includes('Google')) return 1;
        if (a.name.includes('Microsoft') && !b.name.includes('Microsoft')) return -1;
        if (b.name.includes('Microsoft') && !a.name.includes('Microsoft')) return 1;
        
        // Prefer local voices (higher quality)
        if (a.localService && !b.localService) return -1;
        if (b.localService && !a.localService) return 1;
        
        return 0;
      });
  }

  // Prepare speech without speaking (for use during thought creation)
  prepareSpeech(text: string, options?: {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  }): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find the requested voice or use the best available
    const voices = this.getBestVoices();
    if (options?.voice) {
      const requestedVoice = voices.find(v => 
        v.name.includes(options.voice!) || 
        v.voiceURI.includes(options.voice!)
      );
      if (requestedVoice) {
        utterance.voice = requestedVoice;
      }
    } else if (voices.length > 0) {
      // Use the best available voice
      utterance.voice = voices[0];
    }

    // Set speech parameters
    utterance.rate = options?.rate || 0.9; // Slightly slower for clarity
    utterance.pitch = options?.pitch || 1.0;
    utterance.volume = options?.volume || 1.0;

    // Store for later use
    this.currentUtterance = utterance;
    
    console.log('🎵 Browser speech prepared (ready to play on demand)');
    return utterance;
  }

  // Actually speak the prepared or new text
  async speak(utteranceOrText?: SpeechSynthesisUtterance | string, options?: {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  }): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        console.error('Speech synthesis not supported');
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synth.cancel();

      let utterance: SpeechSynthesisUtterance;
      
      if (typeof utteranceOrText === 'string') {
        // Create new utterance from text
        utterance = this.prepareSpeech(utteranceOrText, options);
      } else if (utteranceOrText instanceof SpeechSynthesisUtterance) {
        // Use provided utterance
        utterance = utteranceOrText;
      } else if (this.currentUtterance) {
        // Use previously prepared utterance
        utterance = this.currentUtterance;
      } else {
        console.error('No speech content available');
        reject(new Error('No speech content available'));
        return;
      }

      utterance.onend = () => {
        resolve(true);
      };

      utterance.onerror = (event) => {
        console.error('Browser speech synthesis failed:', event.error);
        reject(new Error(`Speech synthesis failed: ${event.error}`));
      };

      utterance.onstart = () => {
        // Speech started successfully
      };

      try {
        this.synth.speak(utterance);
      } catch (error) {
        console.error('Error calling speechSynthesis.speak():', error);
        reject(error);
      }
    });
  }

  // For compatibility with the existing API - now only prepares speech
  async generateSpeechUrl(text: string, options?: {
    voice?: string;
    rate?: number;
    pitch?: number;
  }): Promise<string | null> {
    try {
      // Only prepare the speech, don't speak it yet
      this.prepareSpeech(text, options);
      
      // Return a special URL that indicates speech is ready
      return `browser-speech-ready:${Date.now()}`;
    } catch (error) {
      console.error('Failed to prepare browser speech:', error);
      return null;
    }
  }

  // Legacy method for direct speech (kept for backward compatibility)
  async generateSpeech(text: string, options?: {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  }): Promise<boolean> {
    return this.speak(text, options);
  }

  // Play the currently prepared speech
  async playPreparedSpeech(): Promise<boolean> {
    if (!this.currentUtterance) {
      console.warn('No speech prepared to play');
      return false;
    }
    
    return this.speak(this.currentUtterance);
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  // Check if speech is ready to play
  isReady(): boolean {
    return this.currentUtterance !== null;
  }

  // Check if the browser supports speech synthesis
  static isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  // Get information about available voices
  getVoiceInfo(): Array<{
    name: string;
    lang: string;
    gender: string;
    quality: string;
  }> {
    return this.getBestVoices().map(voice => ({
      name: voice.name,
      lang: voice.lang,
      gender: this.guessGender(voice.name),
      quality: voice.localService ? 'High' : 'Network'
    }));
  }

  private guessGender(voiceName: string): string {
    const name = voiceName.toLowerCase();
    const femaleNames = ['female', 'woman', 'samantha', 'victoria', 'karen', 'susan', 'emma'];
    const maleNames = ['male', 'man', 'daniel', 'alex', 'david', 'tom', 'george'];
    
    if (femaleNames.some(n => name.includes(n))) return 'Female';
    if (maleNames.some(n => name.includes(n))) return 'Male';
    return 'Unknown';
  }
} 