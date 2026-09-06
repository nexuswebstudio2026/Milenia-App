import React from 'react';
import { KitchenOrder } from '../../types/milenia';
import { ChefHat, Clock, CheckCircle, Flame, AlertTriangle } from 'lucide-react';

interface MileniaKdsViewProps {
  orders: KitchenOrder[];
  onUpdateStatus: (orderId: string, status: KitchenOrder['status']) => void;
  onRemoveOrder: (orderId: string) => void;
}

export const MileniaKdsView: React.FC<MileniaKdsViewProps> = ({
  orders,
  onUpdateStatus,
  onRemoveOrder
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-500" />
            <span>KDS - Comandas de Cocina & Parrilla</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor en tiempo real para jefes de cocina y parrilleros.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            <span>{orders.length} comandas activas</span>
          </span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3 shadow-sm">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">¡Cocina al día!</h3>
          <p className="text-xs max-w-sm mx-auto text-slate-500">
            No hay comandas pendientes de preparación en este momento. Los nuevos pedidos tomados en el POS aparecerán aquí al instante.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(order => {
            const isUrgent = order.urgency === 'urgente';
            const isCooking = order.status === 'en_cocina';
            const isReady = order.status === 'listo';

            return (
              <div
                key={order.id}
                className={`rounded-3xl border p-5 flex flex-col justify-between shadow-sm transition bg-white dark:bg-slate-900 ${
                  isUrgent 
                    ? 'border-red-500 ring-2 ring-red-500/20' 
                    : isCooking 
                    ? 'border-amber-400 ring-2 ring-amber-400/20'
                    : isReady
                    ? 'border-emerald-500'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Top Bar of Ticket */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg font-mono text-slate-900 dark:text-white">
                        Mesa {order.tableNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {order.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{order.createdAt}</span>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 ${
                      isReady
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : isCooking
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {isReady ? 'Listo para entrega' : isCooking ? 'En preparación' : 'Pendiente'}
                    </span>

                    {isUrgent && (
                      <span className="flex items-center gap-1 font-black text-red-500 text-[11px] animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" /> URGENTE
                      </span>
                    )}
                  </div>

                  {/* Items to Cook */}
                  <div className="mt-4 space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80"
                      >
                        <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center font-mono shrink-0">
                          {item.quantity}
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-tight pt-0.5">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  {order.status === 'pendiente' && (
                    <button
                      onClick={() => onUpdateStatus(order.id, 'en_cocina')}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition cursor-pointer shadow-sm"
                    >
                      Comenzar Preparación
                    </button>
                  )}

                  {order.status === 'en_cocina' && (
                    <button
                      onClick={() => onUpdateStatus(order.id, 'listo')}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition cursor-pointer shadow-sm"
                    >
                      Marcar Listo
                    </button>
                  )}

                  {order.status === 'listo' && (
                    <button
                      onClick={() => onRemoveOrder(order.id)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
                    >
                      Despachar / Retirar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
