import { BrowserSpeechService } from './browser-speech';

export interface VoiceGenerationResult {
  success: boolean;
  audioUrl?: string;
  service: 'browser';
  error?: string;
}

export class VoiceGenerator {
  private browserSpeech: BrowserSpeechService;

  constructor() {
    this.browserSpeech = new BrowserSpeechService();
  }

  async generateVoice(text: string, options?: {
    voice?: string;
    rate?: number;
    pitch?: number;
  }): Promise<VoiceGenerationResult> {
    const maxLength = 500; // Reasonable limit for voice generation
    
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
      console.log(`⚠️ Text truncated to ${maxLength} characters for voice generation`);
    }

    // Use free browser speech synthesis
    if (BrowserSpeechService.isSupported()) {
      try {
        console.log('🆓 Using browser speech synthesis (FREE & unlimited)');
        const result = await this.browserSpeech.generateSpeechUrl(text, options);
        if (result) {
          return {
            success: true,
            audioUrl: result,
            service: 'browser'
          };
        }
      } catch (error) {
        console.log('⚠️ Browser speech failed:', error);
      }
    }

    return {
      success: false,
      service: 'browser',
      error: 'Browser speech synthesis not supported or failed'
    };
  }

  // Get available voices for browser speech
  getAvailableVoices() {
    if (BrowserSpeechService.isSupported()) {
      return this.browserSpeech.getVoiceInfo();
    }
    return [];
  }

  // Stop any ongoing speech
  stopSpeech() {
    this.browserSpeech.stop();
  }

  // Check service availability
  async checkServiceAvailability(): Promise<{ browser: boolean }> {
    return {
      browser: BrowserSpeechService.isSupported()
    };
  }
}

// Create a singleton instance
export const voiceGenerator = new VoiceGenerator(); 