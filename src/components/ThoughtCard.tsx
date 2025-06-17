import React from 'react';
import { motion } from 'framer-motion';
import { Play, Share2, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Thought } from '../types';
import { formatDistanceToNow } from '../utils/dateUtils';

interface ThoughtCardProps {
  thought: Thought;
  onPlayVoice?: (voiceUrl: string, thoughtId: string) => void;
  onShare?: (thought: Thought) => void;
}

export const ThoughtCard: React.FC<ThoughtCardProps> = ({
  thought,
  onPlayVoice,
  onShare
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/thought/${thought.id}`);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/thought/${thought.id}`;
    navigator.clipboard.writeText(url).then(() => {
      // Show a brief success message
      const button = e.target as HTMLElement;
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 1000);
    });
  };

  const handleShareReddit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://reddit.com/r/Showerthoughts/submit?title=${encodeURIComponent(thought.raw_text)}`;
    window.open(url, '_blank');
  };

  const handlePlayVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (thought.voice_url && onPlayVoice) {
      onPlayVoice(thought.voice_url, thought.id);
    } else {
      alert('Voice generation is not available for this thought.');
    }
  };

  const isVoiceAvailable = thought.voice_url && 
    (thought.voice_url.startsWith('blob:') || 
     thought.voice_url.startsWith('http') || 
     thought.voice_url.startsWith('browser-speech-ready:'));

  return (
    <Card onClick={handleCardClick} className="p-6 cursor-pointer">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-lg text-gray-900 font-medium leading-relaxed">
              "{thought.raw_text}"
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {formatDistanceToNow(thought.created_at)} ago
            </p>
          </div>
          {thought.value_meter && (
            <Badge variant="value" value={thought.value_meter} />
          )}
        </div>

        {/* Mode Badge */}
        <div>
          <Badge variant="mode" value={thought.mode_selected} />
        </div>

        {/* Expansion Preview */}
        {thought.expanded_text && (
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-sm text-gray-700 line-clamp-3">
              {thought.expanded_text.substring(0, 150)}...
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {thought.voice_url && (
            <Button
              variant={isVoiceAvailable ? "secondary" : "ghost"}
              size="sm"
              onClick={handlePlayVoice}
              className={`flex items-center gap-2 ${
                !isVoiceAvailable ? 'text-red-600 hover:text-red-700' : ''
              }`}
            >
              {isVoiceAvailable ? (
                <Play className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {isVoiceAvailable ? 'Play Voice' : 'Voice Failed'}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy Link
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShareReddit}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Reddit
          </Button>
        </div>
      </div>
    </Card>
  );
};