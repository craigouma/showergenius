import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Droplets } from 'lucide-react';
import { Button } from './ui/Button';

interface EmptyStateProps {
  onCreateFirst: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateFirst }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="relative mb-8">
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4"
        >
          <Brain className="w-12 h-12 text-blue-600" />
        </motion.div>
        
        <motion.div
          animate={{ 
            y: [-5, 5, -5],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
          className="absolute -top-2 -right-2"
        >
          <Droplets className="w-8 h-8 text-blue-400" />
        </motion.div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Your brain is still loading...
      </h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        No shower thoughts yet! Share your first profound realization from the shower.
      </p>
      
      <Button onClick={onCreateFirst} size="lg">
        Create Your First Thought
      </Button>
    </motion.div>
  );
};