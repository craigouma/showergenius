import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { playVoiceFromUrl, stopVoice, isVoicePlaying } from '../utils/voice-player';

interface AudioPlayerProps {
  src: string;
  text?: string; // Text content for browser speech
  className?: string;
  onRetry?: () => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onError?: (errorMessage: string) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, text, className = '', onRetry, onPlayStateChange, onError }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  // Check if this is a browser speech URL
  const isBrowserSpeech = src.startsWith('browser-speech-ready:');

  // Poll for browser speech state
  useEffect(() => {
    if (isBrowserSpeech) {
      const interval = setInterval(() => {
        const playing = isVoicePlaying();
        if (playing !== isPlaying) {
          setIsPlaying(playing);
        }
      }, 100); // Check every 100ms

      return () => clearInterval(interval);
    }
  }, [isBrowserSpeech, isPlaying]);

  useEffect(() => {
    // Reset states when src changes
    setHasError(false);
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setErrorMessage('');
    
    // Check if the audio source is valid
    if (isBrowserSpeech) {
      // Browser speech is always ready if we have text
      if (text && text.trim()) {
        setHasError(false);
        setIsLoading(false);
      } else {
        setHasError(true);
        setIsLoading(false);
        setErrorMessage('No text available for browser speech.');
      }
    } else if (src.startsWith('blob:') || src.startsWith('http')) {
      setHasError(false);
      setIsLoading(false);
    } else if (src.includes('/api/audio/')) {
      // Mock audio files - show error state
      setHasError(true);
      setIsLoading(false);
      setErrorMessage('Voice generation failed. This is a placeholder audio file.');
    } else {
      setHasError(true);
      setIsLoading(false);
      setErrorMessage('Invalid audio source.');
    }
  }, [src, text, isBrowserSpeech]);

  const handlePlay = async () => {
    if (!src) return;

    try {
      if (isPlaying) {
        // Stop current playback
        if (isBrowserSpeech) {
          stopVoice();
        } else if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
        onPlayStateChange?.(false);
      } else {
        // Start playback
        if (isBrowserSpeech) {
          setIsPlaying(true);
          onPlayStateChange?.(true);
          
          const success = await playVoiceFromUrl(src, text);
          
          if (!success) {
            setIsPlaying(false);
            onPlayStateChange?.(false);
            onError?.('Browser speech playback failed');
          }
          
          // For browser speech, we need to manually handle the end state
          // since it's play/stop rather than play/pause
          setTimeout(() => {
            setIsPlaying(false);
            onPlayStateChange?.(false);
          }, 100);
          
        } else {
          // Regular audio playback
          if (audioRef.current) {
            setIsPlaying(true);
            onPlayStateChange?.(true);
            await audioRef.current.play();
          }
        }
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
      onPlayStateChange?.(false);
      onError?.('Audio playback failed');
    }
  };

  const handleStop = () => {
    if (isBrowserSpeech) {
      stopVoice();
      setIsPlaying(false);
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
    setHasError(false);
    setIsLoading(false);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleAudioError = () => {
    setHasError(true);
    setIsLoading(false);
    setErrorMessage('Failed to load audio file.');
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || isBrowserSpeech) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    if (onRetry) {
      onRetry();
    }
  };

  if (hasError) {
    return (
      <div className={`bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center gap-4 text-red-700">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Voice Generation Failed</p>
            <p className="text-sm text-red-600 mt-1">
              {errorMessage || 'Unable to generate voice audio. Please check your API configuration and try again.'}
            </p>
          </div>
          {onRetry && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl p-4 shadow-md ${className}`}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex justify-between mt-2">
              <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-md ${className}`}>
      {/* Hidden audio element for non-browser speech */}
      {!isBrowserSpeech && (
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
          onError={handleAudioError}
          preload="metadata"
        />
      )}

      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={handlePlay}
          className="w-10 h-10 rounded-full p-0 flex items-center justify-center"
        >
          {isPlaying ? (
            isBrowserSpeech ? (
              <Square className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </Button>

        {/* Stop Button - Only show when playing */}
        {isPlaying && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleStop}
            className="w-8 h-8 rounded-full p-0 flex items-center justify-center"
          >
            <Square className="w-3 h-3" />
          </Button>
        )}

        {/* Progress Bar and Time - Only for regular audio */}
        {!isBrowserSpeech && (
          <div className="flex-1">
            <div
              className="h-2 bg-gray-200 rounded-full cursor-pointer mb-2"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                style={{
                  width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* Browser Speech Info */}
        {isBrowserSpeech && (
          <div className="flex-1">
            <div className="text-sm text-gray-600">
              🆓 Browser Speech {isPlaying ? '(Speaking...)' : 'Ready'}
            </div>
            <div className="text-xs text-gray-500">
              {isPlaying ? 'Click to stop speech' : 'Click to start speech'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};