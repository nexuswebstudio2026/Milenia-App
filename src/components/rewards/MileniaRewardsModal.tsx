import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Crown, 
  Award, 
  Sparkles, 
  Wine, 
  Check, 
  Lock, 
  ArrowRight, 
  Gift, 
  Clock, 
  CreditCard,
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useTasty } from '../../context/TastyContext';

export const MileniaRewardsModal: React.FC = () => {
  const { 
    isRewardsOpen, 
    setIsRewardsOpen, 
    rewardsProfile, 
    redeemRewardBenefit,
    language 
  } = useTasty();

  if (!isRewardsOpen) return null;

  const tiers = [
    { name: 'Silver', points: 0, label: language === 'es' ? 'Gourmet' : 'Gourmet', color: 'from-stone-400 to-stone-600' },
    { name: 'Gold', points: 500, label: language === 'es' ? 'Sommelier' : 'Sommelier', color: 'from-amber-400 to-amber-600' },
    { name: 'Platinum', points: 1500, label: language === 'es' ? 'Haute Cuisine' : 'Haute Cuisine', color: 'from-cyan-400 to-blue-600' },
    { name: 'Black Diamond', points: 3000, label: language === 'es' ? 'VIP Privé' : 'VIP Privé', color: 'from-purple-500 via-rose-500 to-amber-500' },
  ];

  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'Black Diamond':
        return 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-stone-950 font-bold border-amber-300/40';
      case 'Platinum':
        return 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold border-cyan-300/40';
      case 'Gold':
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 font-bold border-amber-300/40';
      default:
        return 'bg-stone-700 text-stone-200 border-stone-600';
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="milenia-rewards-modal-overlay" 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          id="milenia-rewards-modal-container"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-stone-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-auto text-stone-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/70 p-5 sm:p-6 border-b border-amber-500/20 relative">
            <button
              id="btn-close-rewards-modal"
              onClick={() => setIsRewardsOpen(false)}
              className="absolute top-5 right-5 p-2 text-stone-400 hover:text-white bg-stone-800/80 hover:bg-stone-800 rounded-full transition-colors"
              aria-label="Cerrar Milenia Rewards"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Milenia Rewards Club
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-100">
              {language === 'es' ? 'Club de Fidelización & Beneficios VIP' : 'Loyalty Club & VIP Privileges'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              {language === 'es' 
                ? 'Acumula 10 puntos por cada 1€ gastado y desbloquea experiencias gastronómicas exclusivas.' 
                : 'Earn 10 points per 1€ spent and unlock exclusive gastronomic experiences.'}
            </p>
          </div>

          <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* VIP Membership Card */}
            <div 
              id="milenia-vip-card" 
              className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 border border-amber-500/40 shadow-xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif tracking-wider font-bold text-amber-300 text-lg">MILENIA</span>
                    <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider bg-amber-500/20 text-amber-200 border border-amber-500/30">
                      Privilege
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5 font-mono">{rewardsProfile.membershipNumber}</p>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs flex items-center gap-1.5 shadow-md border ${getTierBadgeStyle(rewardsProfile.tier)}`}>
                  <Crown className="w-3.5 h-3.5" />
                  <span>{rewardsProfile.tier}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold">
                    {language === 'es' ? 'Titular de la Cuenta' : 'Cardholder'}
                  </p>
                  <p className="text-base font-serif font-bold text-stone-100 mt-0.5">{rewardsProfile.userName}</p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold">
                    {language === 'es' ? 'Saldo Disponible' : 'Points Balance'}
                  </p>
                  <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-300">
                    {rewardsProfile.currentPoints.toLocaleString()} <span className="text-sm font-sans text-stone-300">pts</span>
                  </p>
                </div>
              </div>

              {/* Tier Progress Bar */}
              <div className="mt-5 pt-4 border-t border-stone-800">
                <div className="flex items-center justify-between text-xs text-stone-300 mb-1.5">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    {language === 'es' ? 'Progreso hacia' : 'Progress toward'}{' '}
                    <strong className="text-amber-300 font-semibold">{rewardsProfile.nextTier || 'Black Diamond VIP'}</strong>
                  </span>
                  <span className="font-mono font-semibold text-amber-400">
                    {rewardsProfile.tierProgressPercentage}%
                  </span>
                </div>

                <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden p-0.5 border border-stone-700/60">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${rewardsProfile.tierProgressPercentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 rounded-full shadow-sm"
                  />
                </div>

                <p className="text-[11px] text-stone-400 mt-1.5">
                  {rewardsProfile.pointsToNextTier > 0 
                    ? (language === 'es' 
                        ? `Te faltan ${rewardsProfile.pointsToNextTier} pts para desbloquear el siguiente nivel y nuevos beneficios.` 
                        : `${rewardsProfile.pointsToNextTier} pts needed to unlock next tier.`)
                    : (language === 'es' ? '¡Nivel máximo alcanzado! Disfruta de atención VIP permanente.' : 'Maximum VIP tier reached!')}
                </p>
              </div>
            </div>

            {/* Tiers Overview */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-300/90 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />
                {language === 'es' ? 'Escala de Niveles Milenia' : 'Milenia Tier Scale'}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {tiers.map((t) => {
                  const isCurrent = rewardsProfile.tier === t.name;
                  return (
                    <div 
                      key={t.name}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isCurrent 
                          ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/40' 
                          : 'bg-stone-950/60 border-stone-800 text-stone-400'
                      }`}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isCurrent ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-400'
                      }`}>
                        {t.name}
                      </span>
                      <p className="font-serif font-bold text-stone-200 text-xs mt-1.5">{t.label}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">{t.points}+ pts</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Unlockable Benefits Section */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-300/90 mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                {language === 'es' ? 'Beneficios Desbloqueables' : 'Unlockable Benefits & Rewards'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rewardsProfile.benefits.map((benefit) => {
                  const canRedeem = benefit.unlocked || rewardsProfile.currentPoints >= benefit.pointsRequired;
                  return (
                    <div 
                      key={benefit.id}
                      id={`benefit-card-${benefit.id}`}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        benefit.unlocked
                          ? 'bg-stone-950/80 border-amber-500/30 hover:border-amber-500/50'
                          : 'bg-stone-950/40 border-stone-800 opacity-80'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-amber-400">
                            {benefit.icon === 'Wine' ? <Wine className="w-4 h-4" /> :
                             benefit.icon === 'Crown' ? <Crown className="w-4 h-4" /> :
                             benefit.icon === 'Award' ? <Award className="w-4 h-4" /> :
                             <Sparkles className="w-4 h-4" />}
                          </div>

                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                            benefit.unlocked
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-stone-800 text-stone-400 border border-stone-700'
                          }`}>
                            {benefit.unlocked ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                {language === 'es' ? 'Desbloqueado' : 'Unlocked'}
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 text-stone-400" />
                                {benefit.tierRequired} ({benefit.pointsRequired} pts)
                              </>
                            )}
                          </span>
                        </div>

                        <h5 className="font-serif font-bold text-stone-100 text-sm mt-2.5">
                          {language === 'es' ? benefit.title : benefit.titleEn}
                        </h5>
                        <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                          {language === 'es' ? benefit.description : benefit.descriptionEn}
                        </p>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-stone-800/80 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-amber-400/90 font-semibold">
                          {benefit.pointsRequired} pts
                        </span>

                        <button
                          id={`btn-redeem-${benefit.id}`}
                          onClick={() => redeemRewardBenefit(benefit.id)}
                          disabled={!canRedeem}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            canRedeem
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-md active:scale-95'
                              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          <span>{benefit.unlocked ? (language === 'es' ? 'Activar en Pedido' : 'Apply') : (language === 'es' ? 'Canjear Puntos' : 'Redeem')}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity Log */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-300/90 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {language === 'es' ? 'Historial de Puntos' : 'Points Activity'}
              </h4>

              <div className="space-y-2">
                {rewardsProfile.recentActivity.map((act) => (
                  <div 
                    key={act.id} 
                    className="p-3 rounded-lg bg-stone-950/50 border border-stone-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-medium text-stone-200">{language === 'es' ? act.title : act.titleEn}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">{act.date}</p>
                    </div>

                    <span className={`font-mono font-bold text-xs ${act.points >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {act.points > 0 ? `+${act.points}` : act.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-stone-400">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{language === 'es' ? 'Los puntos no caducan mientras la cuenta esté activa' : 'Points never expire with active account'}</span>
            </div>

            <button
              id="btn-close-rewards-bottom"
              onClick={() => setIsRewardsOpen(false)}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
            >
              {language === 'es' ? 'Entendido' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
