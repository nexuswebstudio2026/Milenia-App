import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Utensils } from 'lucide-react';
import { MeniaLogo } from './MeniaLogo';

export const MileniaLogoLoader: React.FC<{ message?: string; className?: string }> = ({ 
  message = 'Cargando carta de autor...', 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-4 text-center ${className}`}>
      <div className="relative">
        {/* Ambient background glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl"
        />

        {/* Pulsing crest frame */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-amber-500/40 flex items-center justify-center p-2"
        >
          <MeniaLogo className="w-10 h-10 sm:w-12 sm:h-12" animated />
        </motion.div>

        {/* Tiny sparkle accent */}
        <motion.div
          animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-1 -right-1 text-amber-400"
        >
          <Sparkles className="w-4 h-4" />
        </motion.div>
      </div>

      <div className="space-y-1">
        <p className="font-serif text-sm sm:text-base font-semibold text-stone-200 tracking-wide">
          {message}
        </p>
        <p className="text-[11px] uppercase tracking-widest text-amber-400/80 font-mono">
          MILENIA • Haute Cuisine
        </p>
      </div>
    </div>
  );
};

export const MileniaCardSkeleton: React.FC = () => {
  return (
    <div className="relative rounded-2xl bg-stone-900/80 border border-stone-800/80 overflow-hidden shadow-lg animate-pulse">
      {/* Image Skeleton with Milenia Crest Watermark */}
      <div className="relative w-full h-48 bg-stone-800/60 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stone-700/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        <div className="opacity-20 flex flex-col items-center gap-1 text-amber-400">
          <MeniaLogo className="w-10 h-10" />
          <span className="text-[9px] uppercase tracking-widest font-mono font-bold">MILENIA</span>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Category & prep time pill placeholder */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-stone-800 rounded-full" />
          <div className="h-3 w-12 bg-stone-800 rounded-full" />
        </div>

        {/* Title */}
        <div className="h-5 w-3/4 bg-stone-800 rounded-md" />

        {/* Description */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-stone-800/60 rounded" />
          <div className="h-3 w-5/6 bg-stone-800/60 rounded" />
        </div>

        {/* Price and button placeholder */}
        <div className="pt-2 flex items-center justify-between border-t border-stone-800">
          <div className="h-6 w-16 bg-amber-500/20 rounded-md" />
          <div className="h-8 w-24 bg-stone-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const MileniaMenuSkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <MileniaCardSkeleton key={i} />
      ))}
    </div>
  );
};
