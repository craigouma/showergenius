import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, Mic, MessageSquare } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ExpansionMode } from '../types';

interface NewThoughtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, mode: ExpansionMode) => Promise<void>;
  isLoading?: boolean;
}

export const NewThoughtModal: React.FC<NewThoughtModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [text, setText] = useState('');
  const [selectedMode, setSelectedMode] = useState<ExpansionMode>('essay');

  const modes = [
    { value: 'essay' as ExpansionMode, label: 'Essay', icon: MessageSquare, color: 'blue' },
    { value: 'startup_pitch' as ExpansionMode, label: 'Startup Pitch', icon: Lightbulb, color: 'green' },
    { value: 'rap_verse' as ExpansionMode, label: 'Rap Verse', icon: Mic, color: 'purple' },
    { value: 'counter_argument' as ExpansionMode, label: 'Counter Argument', icon: Brain, color: 'orange' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    
    await onSubmit(text.trim(), selectedMode);
    setText('');
    setSelectedMode('essay');
    onClose();
  };

  const handleClose = () => {
    if (!isLoading) {
      setText('');
      setSelectedMode('essay');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Shower Thought">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Text Input */}
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What deep thought hit you in the shower?"
            className="w-full h-32 p-4 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={500}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-2">
            {text.length}/500 characters
          </p>
        </div>

        {/* Mode Selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            How should we expand this thought?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.value;
              
              return (
                <motion.button
                  key={mode.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMode(mode.value)}
                  disabled={isLoading}
                  className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-2 ${
                    isSelected
                      ? `border-${mode.color}-500 bg-${mode.color}-50 text-${mode.color}-700`
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{mode.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                Creating...
              </>
            ) : (
              'Create Thought'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};