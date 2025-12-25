'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { successCheck } from '@/utils/animations';

interface SuccessAnimationProps {
  size?: number;
  className?: string;
}

/**
 * Animated success checkmark for action confirmations
 */
export function SuccessAnimation({ size = 64, className }: SuccessAnimationProps) {
  return (
    <motion.div
      className={className}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 20,
        duration: 0.6,
      }}
    >
      <CheckCircle2 
        size={size} 
        className="text-blue-400" 
        strokeWidth={2}
      />
    </motion.div>
  );
}
