import React from 'react';
import { useTasty } from '../../context/TastyContext';
import { motion } from 'motion/react';
import { Cart } from './Cart';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen } = useTasty();

  if (!isCartOpen) return null;

  return (
    <div 
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCartOpen(false);
      }}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        id="cart-drawer-panel"
        className="w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-slate-200 dark:border-slate-800"
      >
        <Cart onClose={() => setIsCartOpen(false)} />
      </motion.div>
    </div>
  );
};
