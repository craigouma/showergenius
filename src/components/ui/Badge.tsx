import React from 'react';
import { cn } from '../../utils/cn';
import { ExpansionMode, ValueMeter } from '../../types';

interface BadgeProps {
  variant: 'mode' | 'value';
  value: ExpansionMode | ValueMeter;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, value, className }) => {
  const baseStyles = 'inline-flex items-center px-3 py-1 rounded-2xl text-xs font-medium';
  
  if (variant === 'mode') {
    const modeStyles = {
      essay: 'bg-blue-100 text-blue-800',
      startup_pitch: 'bg-green-100 text-green-800',
      rap_verse: 'bg-purple-100 text-purple-800',
      counter_argument: 'bg-orange-100 text-orange-800'
    };
    
    const labels = {
      essay: 'Essay',
      startup_pitch: 'Startup Pitch',
      rap_verse: 'Rap Verse',
      counter_argument: 'Counter Argument'
    };
    
    return (
      <span className={cn(baseStyles, modeStyles[value as ExpansionMode], className)}>
        {labels[value as ExpansionMode]}
      </span>
    );
  }
  
  if (variant === 'value') {
    const valueStyles = {
      unicorn: 'bg-pink-100 text-pink-800',
      seedling: 'bg-green-100 text-green-800',
      trash: 'bg-gray-100 text-gray-800'
    };
    
    const valueEmojis = {
      unicorn: '🦄',
      seedling: '🌱',
      trash: '🗑️'
    };
    
    return (
      <span className={cn(baseStyles, valueStyles[value as ValueMeter], className)}>
        {valueEmojis[value as ValueMeter]} {value}
      </span>
    );
  }
  
  return null;
};