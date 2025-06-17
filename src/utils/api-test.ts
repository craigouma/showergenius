import { voiceGenerator } from '../services/voice-generator';

// Test function that can be called from browser console
export const testAPIs = async () => {
  console.log('🧪 Testing API configurations...');
  
  // Check browser speech availability
  const { BrowserSpeechService } = await import('../services/browser-speech');
  console.log('Browser Speech supported:', BrowserSpeechService.isSupported());
  
  if (BrowserSpeechService.isSupported()) {
    console.log('✅ Browser speech is available and free!');
    
    // Test browser speech directly
    try {
      const browserSpeech = new BrowserSpeechService();
      const voices = browserSpeech.getVoiceInfo();
      console.log('✅ Browser voices available:', voices.length, 'voices found');
      console.log('Available voices:', voices.slice(0, 5)); // Show first 5
    } catch (error) {
      console.error('❌ Browser speech test failed:', error);
    }
  } else {
    console.warn('❌ Browser speech not supported in this browser');
  }
  
  // Check Groq API configuration
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  console.log('Groq API key configured:', groqKey && groqKey !== 'your_groq_api_key_here' ? 'Yes' : 'No');
};

// Test the combined voice generator
export const testVoiceGenerator = async () => {
  console.log('🎵 Testing Voice Generator Service...');
  try {
    const testText = "This is a test of the voice generation system.";
    const result = await voiceGenerator.generateVoice(testText);
    
    if (result.success && result.audioUrl) {
      console.log(`✅ Voice generation successful using ${result.service}:`, result.audioUrl);
      
      // Test playing the voice
      const { playVoiceFromUrl } = await import('./voice-player');
      setTimeout(() => playVoiceFromUrl(result.audioUrl!, testText), 1000);
    } else {
      console.log('❌ Voice generation failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Voice generator test failed:', error);
  }
};

// Test browser speech directly
(window as any).testBrowserSpeech = async (text: string = 'Hello, this is a test of browser speech.') => {
  console.log('🧪 Testing Browser Speech Directly...');
  
  try {
    const { playTextAsSpeech } = await import('./voice-player');
    const success = await playTextAsSpeech(text);
    
    if (success) {
      console.log('✅ Browser speech test completed successfully!');
    } else {
      console.log('❌ Browser speech test failed');
    }
  } catch (error) {
    console.error('❌ Browser speech test failed:', error);
  }
};

// Debug test for voice URL with text
(window as any).debugVoicePlayback = async (url: string = 'browser-speech-ready:12345', text: string = 'This is a debug test') => {
  console.log('🧪 Testing voice playback with URL and text...');
  
  try {
    const { playVoiceFromUrl } = await import('./voice-player');
    const success = await playVoiceFromUrl(url, text);
    
    if (success) {
      console.log('✅ Voice playback test completed successfully!');
    } else {
      console.log('❌ Voice playback test failed');
    }
  } catch (error) {
    console.error('❌ Voice playback test failed:', error);
  }
};

// Test playing voice from a thought
(window as any).testPlayThoughtVoice = async (thoughtText: string = 'Why do we call it rush hour when nobody\'s moving?') => {
  console.log('🧪 Testing Thought Voice Generation...');
  
  try {
    const { voiceGenerator } = await import('../services/voice-generator');
    
    // Generate voice (this should only prepare, not speak)
    console.log('1. Generating voice for thought...');
    const result = await voiceGenerator.generateVoice(thoughtText);
    
    if (result.success && result.audioUrl) {
      console.log('✅ Voice generated:', result.service, result.audioUrl);
      
      // Now play it using the voice player with text
      console.log('2. Playing generated voice with text...');
      const { playVoiceFromUrl } = await import('./voice-player');
      const success = await playVoiceFromUrl(result.audioUrl, thoughtText);
      
      if (success) {
        console.log('✅ Thought voice test completed successfully!');
      } else {
        console.log('❌ Voice playback failed');
      }
    } else {
      console.log('❌ Voice generation failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Thought voice test failed:', error);
  }
};

console.log('🎵 ShowerGenius Test Functions Loaded:');
console.log('- testAPIs() - Test available APIs and browser capabilities');
console.log('- testBrowserSpeech() - Test browser speech directly');
console.log('- debugVoicePlayback(url, text) - Debug voice playback with specific URL and text');
console.log('- testPlayThoughtVoice() - Test complete voice generation flow');
console.log('- testVoiceGenerator() - Test voice generator service');

// Make functions available globally for testing
(window as any).testAPIs = testAPIs;
(window as any).testVoiceGenerator = testVoiceGenerator; 