import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
import { 
  Star, 
  MessageSquarePlus, 
  CheckCircle2, 
  ThumbsUp, 
  Utensils, 
  Sparkles, 
  User, 
  X,
  Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ReviewsView: React.FC = () => {
  const { reviews, addReview, language } = useTasty();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [speedRating, setSpeedRating] = useState(5);

  const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;

    addReview({
      author,
      rating,
      comment,
      foodRating,
      serviceRating,
      speedRating,
      verifiedOrder: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
    });

    setIsModalOpen(false);
    setAuthor('');
    setComment('');
  };

  return (
    <div id="reviews-view" className="max-w-4xl mx-auto space-y-8">
      
      {/* Header & Overall Score */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-colors duration-300">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{language === 'es' ? 'Experiencia & Críticas' : 'Verified Reviews'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white">
            {language === 'es' ? 'Opiniones de Comensales en MILENIA' : 'Guest Reviews at MILENIA'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
            {language === 'es'
              ? 'Conoce la valoración de comensales que han disfrutado de nuestras creaciones culinarias y servicio de sala.'
              : 'Read authentic thoughts from diners who have enjoyed our haute cuisine creations.'}
          </p>
        </div>

        {/* Score badge & action */}
        <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 dark:text-white">{averageRating}</div>
            <div>
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{reviews.length} {language === 'es' ? 'opiniones verificadas' : 'verified reviews'}</div>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            id="open-add-review-btn"
            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{language === 'es' ? 'Escribir mi Opinión' : 'Write a Review'}</span>
          </button>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            id={`review-card-${rev.id}`}
            className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors duration-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={rev.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                  alt={rev.author}
                  className="w-10 h-10 rounded-full object-cover bg-slate-100 dark:bg-slate-800 ring-2 ring-amber-500/20"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <span>{rev.author}</span>
                    {rev.verifiedOrder && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {language === 'es' ? 'Comensal Verificado' : 'Verified Diner'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">{rev.date}</div>
                </div>
              </div>

              {/* Star Score */}
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/60">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="font-black text-xs text-amber-900 dark:text-amber-300">{rev.rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Comment Text */}
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif italic">
              "{rev.comment}"
            </p>

            {/* Sub ratings pills */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">🍷 {language === 'es' ? 'Plato' : 'Dish'}: {rev.foodRating}/5</span>
              <span className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">🛎️ {language === 'es' ? 'Servicio' : 'Service'}: {rev.serviceRating}/5</span>
              <span className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">⚡ {language === 'es' ? 'Rapidez' : 'Speed'}: {rev.speedRating}/5</span>
            </div>
          </div>
        ))}
      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-serif font-bold text-slate-900 dark:text-white text-lg">
                {language === 'es' ? 'Escribir una Opinión' : 'Write a Review'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{language === 'es' ? 'Tu Nombre' : 'Your Name'}</label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Ej: Daniel Sánchez"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              {/* Star selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{language === 'es' ? 'Calificación General' : 'Overall Rating'}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-amber-400 transition cursor-pointer"
                    >
                      <Star className={`w-6 h-6 ${rating >= star ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{language === 'es' ? 'Tu Reseña' : 'Your Review'}</label>
                <textarea
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={language === 'es' ? 'Cuéntanos qué te pareció la comida, la entrega y la atención...' : 'Tell us about your dining experience...'}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm h-24 outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm py-3 rounded-xl transition cursor-pointer"
                >
                  {language === 'es' ? 'Publicar Opinión' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
