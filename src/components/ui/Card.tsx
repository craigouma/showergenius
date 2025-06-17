import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  onClick,
  hover = true 
}) => {
  const baseStyles = 'bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden';
  
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(baseStyles, onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};