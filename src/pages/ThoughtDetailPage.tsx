import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Share2, Copy, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Thought } from '../types';
import { storage } from '../data/storage';
import { postReddit } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AudioPlayer } from '../components/AudioPlayer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const ThoughtDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [thought, setThought] = useState<Thought | null>(null);
  const [activeTab, setActiveTab] = useState<'expansion' | 'voice' | 'share'>('expansion');
  const [isPostingToReddit, setIsPostingToReddit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundThought = storage.getThought(id);
      setThought(foundThought || null);
    }
    setIsLoading(false);
  }, [id]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  const handlePostToReddit = async () => {
    if (!thought || !thought.expanded_text) return;
    
    setIsPostingToReddit(true);
    try {
      const permalink = await postReddit({
        thought_id: thought.id,
        raw_text: thought.raw_text,
        expanded_text: thought.expanded_text
      });
      window.open(permalink, '_blank');
    } catch (error) {
      console.error('Failed to post to Reddit:', error);
    } finally {
      setIsPostingToReddit(false);
    }
  };

  const handleShareTwitter = () => {
    if (!thought) return;
    const text = `"${thought.raw_text}" - Check out this shower thought expanded by AI! ${window.location.href}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!thought) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Thought Not Found</h1>
          <p className="text-gray-600 mb-6">This shower thought seems to have slipped down the drain.</p>
          <Button onClick={() => navigate('/')}>
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'expansion' as const, label: 'Expansion', disabled: !thought.expanded_text },
    { id: 'voice' as const, label: 'Voice', disabled: !thought.voice_url },
    { id: 'share' as const, label: 'Share', disabled: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">Thought Details</h1>
            </div>
            {thought.value_meter && (
              <Badge variant="value" value={thought.value_meter} />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Thought Header */}
          <div className="text-center">
            <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 italic leading-relaxed">
              "{thought.raw_text}"
            </blockquote>
            <div className="mt-4 flex items-center justify-center gap-4">
              <Badge variant="mode" value={thought.mode_selected} />
              <span className="text-sm text-gray-500">
                {new Date(thought.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    disabled={tab.disabled}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : tab.disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8">
              {/* Expansion Tab */}
              {activeTab === 'expansion' && thought.expanded_text && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose prose-gray max-w-none"
                >
                  <ReactMarkdown>{thought.expanded_text}</ReactMarkdown>
                </motion.div>
              )}

              {/* Voice Tab */}
              {activeTab === 'voice' && thought.voice_url && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Listen to your thought
                    </h3>
                    <p className="text-gray-600 mb-6">
                      AI-generated voice reading of your expanded thought
                    </p>
                  </div>
                  <AudioPlayer 
                    src={thought.voice_url} 
                    text={thought.expanded_text}
                  />
                </motion.div>
              )}

              {/* Share Tab */}
              {activeTab === 'share' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Share your genius
                    </h3>
                    <p className="text-gray-600">
                      Spread your shower thoughts across the internet
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <Button
                      onClick={handleCopyLink}
                      variant="secondary"
                      className="flex items-center justify-center gap-3 py-4"
                    >
                      <Copy className="w-5 h-5" />
                      Copy Link
                    </Button>

                    <Button
                      onClick={handleShareTwitter}
                      variant="secondary"
                      className="flex items-center justify-center gap-3 py-4"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Share on Twitter
                    </Button>

                    <Button
                      onClick={handlePostToReddit}
                      disabled={isPostingToReddit || !thought.expanded_text}
                      className="flex items-center justify-center gap-3 py-4"
                    >
                      {isPostingToReddit ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-5 h-5" />
                          Post to r/Showerthoughts
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};