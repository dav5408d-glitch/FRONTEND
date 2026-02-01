'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export default function AnimatedCard({ 
  children, 
  className = '', 
  delay = 0, 
  hover = true,
  glass = false,
  onClick 
}: AnimatedCardProps) {
  const baseClasses = glass 
    ? 'glass-card' 
    : 'bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm';
  
  const hoverClasses = hover 
    ? 'hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-white/5' 
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.25, 0.1, 0.25, 1.0] // Courbe d'animation plus douce
      }}
      whileHover={hover ? { 
        scale: 1.015,
        transition: { duration: 0.3, ease: "easeOut" }
      } : {}}
      whileTap={onClick ? { scale: 0.985 } : {}}
      onClick={onClick}
      className={`${baseClasses} ${hoverClasses} ${className} cursor-pointer transition-all duration-300`}
    >
      {children}
    </motion.div>
  );
}
