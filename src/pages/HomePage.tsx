import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Thought } from '../types';
import { storage } from '../data/storage';
import { createAndProcessThought } from '../services/api';
import { ThoughtCard } from '../components/ThoughtCard';
import { NewThoughtModal } from '../components/NewThoughtModal';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { playVoiceFromUrl } from '../utils/voice-player';

export const HomePage: React.FC = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize seed data and load thoughts
    storage.initializeSeedData();
    setThoughts(storage.getAllThoughts());
    setIsLoading(false);
  }, []);

  const handleCreateThought = async (text: string, mode: Thought['mode_selected']) => {
    setIsCreating(true);
    try {
      const newThought = await createAndProcessThought(text, mode);
      setThoughts(storage.getAllThoughts());
      
      // Trigger confetti for new thoughts
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      console.error('Failed to create thought:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handlePlayVoice = async (voiceUrl: string, thoughtId?: string) => {
    try {
      // Find the thought to get its expanded text
      let textToSpeak = undefined;
      if (thoughtId) {
        const thought = thoughts.find(t => t.id === thoughtId);
        textToSpeak = thought?.expanded_text;
      }
      
      const success = await playVoiceFromUrl(voiceUrl, textToSpeak);
      if (!success) {
        console.log('Voice playback failed');
        alert('Voice playback failed. Please try again.');
      }
    } catch (error) {
      console.log('Audio playback failed:', error);
      alert('Voice playback failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const userThoughts = thoughts.filter((_, index) => index < thoughts.length - 3); // Exclude seed data for empty state check
  const showEmptyState = userThoughts.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ShowerGenius
            </h1>
            <p className="text-gray-600 mt-2">
              Transform your shower thoughts into creative masterpieces
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {showEmptyState ? (
          <EmptyState onCreateFirst={() => setIsModalOpen(true)} />
        ) : (
          <div className="space-y-6">
            {thoughts.map((thought, index) => (
              <motion.div
                key={thought.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ThoughtCard
                  thought={thought}
                  onPlayVoice={handlePlayVoice}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500">
        <p className="text-sm">
          Built with{' '}
          <a 
            href="https://bolt.new" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Bolt.new
          </a>
        </p>
      </footer>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setIsModalOpen(true)} />

      {/* New Thought Modal */}
      <NewThoughtModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateThought}
        isLoading={isCreating}
      />
    </div>
  );
};