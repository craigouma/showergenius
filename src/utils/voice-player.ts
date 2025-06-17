import { BrowserSpeechService } from '../services/browser-speech';

// Global instance for voice playback
let browserSpeech: BrowserSpeechService | null = null;
let currentlyPlaying = false;

// Initialize the browser speech service
function initBrowserSpeech(): BrowserSpeechService {
  if (!browserSpeech) {
    browserSpeech = new BrowserSpeechService();
  }
  return browserSpeech;
}

// Check if voice is currently playing
export function isVoicePlaying(): boolean {
  return currentlyPlaying;
}

// Play audio from URL - handles both browser speech and external URLs
export async function playVoiceFromUrl(audioUrl: string, text?: string): Promise<boolean> {
  try {
    // Check if it's a browser speech URL
    if (audioUrl.startsWith('browser-speech-ready:')) {
      // Check if browser speech is supported
      if (!BrowserSpeechService.isSupported()) {
        console.error('Browser speech not supported');
        return false;
      }
      
      // Stop any currently playing speech first
      if (currentlyPlaying) {
        stopVoice();
        // Wait a bit for the cancellation to take effect
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const speech = initBrowserSpeech();
      
      // If we have text, prepare and play it directly
      if (text && text.trim()) {
        currentlyPlaying = true;
        
        try {
          // Create fresh utterance each time
          const utterance = speech.prepareSpeech(text);
          
          utterance.onstart = () => {
            currentlyPlaying = true;
          };
          
          utterance.onend = () => {
            currentlyPlaying = false;
          };
          
          utterance.onerror = (event) => {
            console.error('Browser speech error:', event.error);
            currentlyPlaying = false;
          };
          
          await speech.speak(utterance);
          return true;
        } catch (error) {
          console.error('Browser speech failed:', error);
          currentlyPlaying = false;
          return false;
        }
      }
      
      // Fallback: try to play any pre-prepared speech
      if (speech.isReady()) {
        currentlyPlaying = true;
        
        try {
          const result = await speech.playPreparedSpeech();
          currentlyPlaying = false;
          return result;
        } catch (error) {
          console.error('Pre-prepared speech failed:', error);
          currentlyPlaying = false;
          return false;
        }
      } else {
        console.warn('No text provided and no browser speech prepared to play');
        return false;
      }
    }
    
    // Handle regular audio URLs (for future use)
    return playAudioUrl(audioUrl);
    
  } catch (error) {
    console.error('playVoiceFromUrl failed:', error);
    currentlyPlaying = false;
    return false;
  }
}

// Play regular audio URLs using HTML5 Audio
async function playAudioUrl(url: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    
    audio.oncanplaythrough = () => {
      audio.play()
        .then(() => {
          resolve(true);
        })
        .catch(error => {
          console.error('Audio playback failed:', error);
          reject(error);
        });
    };
    
    audio.onerror = () => {
      console.error('Audio loading failed');
      reject(new Error('Audio loading failed'));
    };
    
    audio.onended = () => {
      console.log('Audio playback completed');
    };
    
    // Start loading the audio
    audio.load();
  });
}

// Stop any ongoing speech
export function stopVoice(): void {
  currentlyPlaying = false;
  
  if (browserSpeech) {
    browserSpeech.stop();
  }
}

// Check if browser speech is available
export function isBrowserSpeechSupported(): boolean {
  return BrowserSpeechService.isSupported();
}

// Prepare speech for later playback (called during thought creation)
export function prepareBrowserSpeech(text: string): string | null {
  if (!BrowserSpeechService.isSupported()) {
    return null;
  }
  
  try {
    const speech = initBrowserSpeech();
    speech.prepareSpeech(text);
    return `browser-speech-ready:${Date.now()}`;
  } catch (error) {
    console.error('Failed to prepare browser speech:', error);
    return null;
  }
}

// Play speech directly from text (for immediate playback)
export async function playTextAsSpeech(text: string): Promise<boolean> {
  if (!BrowserSpeechService.isSupported()) {
    console.warn('Browser speech not supported');
    return false;
  }
  
  try {
    const speech = initBrowserSpeech();
    currentlyPlaying = true;
    
    const result = await speech.speak(text);
    currentlyPlaying = false;
    return result;
  } catch (error) {
    console.error('Failed to speak text:', error);
    currentlyPlaying = false;
    return false;
  }
}

// Make functions available globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).playVoiceFromUrl = playVoiceFromUrl;
  (window as any).stopVoice = stopVoice;
  (window as any).isVoicePlaying = isVoicePlaying;
  (window as any).prepareBrowserSpeech = prepareBrowserSpeech;
  (window as any).playTextAsSpeech = playTextAsSpeech;
} 