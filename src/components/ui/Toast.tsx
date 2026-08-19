import React from 'react';
import { useTasty } from '../../context/TastyContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useTasty();

  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          let icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;
          let borderClass = 'border-blue-200 bg-white text-slate-800';

          if (toast.type === 'success') {
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
            borderClass = 'border-emerald-200 bg-white text-slate-800';
          } else if (toast.type === 'warning') {
            icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
            borderClass = 'border-amber-200 bg-white text-slate-800';
          } else if (toast.type === 'error') {
            icon = <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
            borderClass = 'border-rose-200 bg-white text-slate-800';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              id={`toast-${toast.id}`}
              className={`pointer-events-auto p-4 rounded-xl border shadow-lg flex items-start gap-3 transition-all ${borderClass}`}
            >
              {icon}
              <div className="flex-1 text-sm">
                <div className="font-semibold text-slate-900 leading-snug">{toast.title}</div>
                <div className="text-slate-600 text-xs mt-0.5">{toast.message}</div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
