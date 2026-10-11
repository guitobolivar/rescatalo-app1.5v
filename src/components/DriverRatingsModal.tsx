import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { DriverRatingRecord } from '../types';
import { subscribeToDriverRatings } from '../services/firebase';
import {
  Star,
  Award,
  X,
  MessageSquare,
  Calendar,
  User,
  Package,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface DriverRatingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverId: string;
  driverName: string;
}

export const DriverRatingsModal: React.FC<DriverRatingsModalProps> = ({
  isOpen,
  onClose,
  driverId,
  driverName,
}) => {
  const { currentUser, orders } = useApp();
  const [firestoreRatings, setFirestoreRatings] = useState<DriverRatingRecord[]>([]);

  // Escuchar calificaciones en Firestore en tiempo real
  useEffect(() => {
    if (!isOpen || !driverId) return;

    const unsub = subscribeToDriverRatings(driverId, (records) => {
      if (Array.isArray(records)) {
        setFirestoreRatings(records as DriverRatingRecord[]);
      }
    });

    return () => {
      unsub?.();
    };
  }, [isOpen, driverId]);

  if (!isOpen) return null;

  // Extraer también calificaciones de órdenes completadas en memoria/contexto
  const localRatedOrders = orders
    .filter(
      (o) =>
        o.driverId === driverId &&
        o.ratingGiven &&
        typeof o.ratingGiven.stars === 'number'
    )
    .map((o) => ({
      id: `ord-rating-${o.id}`,
      orderId: o.id,
      driverId: o.driverId || driverId,
      driverName: o.driverName || driverName,
      clientId: o.clientId,
      clientName: o.clientName || 'Cliente Rescátalo',
      stars: o.ratingGiven!.stars,
      tags: o.ratingGiven!.tags || [],
      comment: o.ratingGiven!.comment || null,
      serviceType: o.serviceType,
      createdAt: o.completedAt || o.createdAt,
    }));

  // Combinar desduplicando por orderId
  const ratingsMap = new Map<string, DriverRatingRecord>();
  firestoreRatings.forEach((r) => {
    if (r.orderId) ratingsMap.set(r.orderId, r);
    else if (r.id) ratingsMap.set(r.id, r);
  });
  localRatedOrders.forEach((r) => {
    if (!ratingsMap.has(r.orderId)) {
      ratingsMap.set(r.orderId, r);
    }
  });

  const combinedRatings = Array.from(ratingsMap.values()).sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  );

  // Estadísticas del perfil del repartidor
  const rawAvg =
    currentUser?.ratingAverage ??
    currentUser?.rating ??
    (combinedRatings.length > 0
      ? combinedRatings.reduce((acc, curr) => acc + curr.stars, 0) /
        combinedRatings.length
      : 5.0);
  const ratingAverage = Math.round(rawAvg * 10) / 10;
  const totalRated =
    currentUser?.totalRatings ||
    currentUser?.ratingsCount ||
    combinedRatings.length;

  // Conteo por estrellas
  const countStars = (n: number) =>
    combinedRatings.filter((r) => Math.round(r.stars) === n).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-[94%] max-w-md mx-auto bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl shadow-amber-950/40 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-md">
              <Award className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white leading-tight">
                Historial de Calificaciones
              </h3>
              <p className="text-[11px] text-amber-300 font-medium">
                {driverName} · Rescátalo Venezuela
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* Promedio General Card */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/30 rounded-3xl p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-black block">
                  Puntaje General
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black text-white tracking-tight">
                    {ratingAverage.toFixed(1)}
                  </span>
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(ratingAverage)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Basado en{' '}
                  <strong className="text-slate-200">{totalRated}</strong>{' '}
                  servicios valorados
                </span>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {ratingAverage >= 4.8
                      ? 'Excelente'
                      : ratingAverage >= 4.0
                      ? 'Muy Bueno'
                      : 'En Desarrollo'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                  Prioridad:{' '}
                  {currentUser?.priorityWeight ??
                    (ratingAverage >= 4.5 ? 100 : 70)}
                  %
                </span>
              </div>
            </div>

            {/* Barras de distribución */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-[11px]">
              {[5, 4, 3, 2, 1].map((n) => {
                const count = countStars(n);
                const total = combinedRatings.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={n} className="flex items-center gap-2 text-slate-400">
                    <span className="w-3 font-mono text-right">{n}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <div className="flex-1 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-slate-500 text-[10px]">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historial detallado de valoraciones */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Últimas Valoraciones ({combinedRatings.length})</span>
              </h4>
            </div>

            {combinedRatings.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-950/70 border border-slate-800 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <Star className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h5 className="text-sm font-bold text-slate-300">
                  Sin calificaciones aún
                </h5>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Al completar servicios, los clientes dejarán aquí sus estrellas, etiquetas y comentarios en tiempo real.
                </p>
              </div>
            ) : (
              combinedRatings.map((rating) => {
                const dateStr = rating.createdAt
                  ? new Date(rating.createdAt).toLocaleDateString('es-VE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Fecha reciente';

                return (
                  <div
                    key={rating.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 shadow-md hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block leading-tight">
                            {rating.clientName || 'Cliente'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {dateStr}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-xl">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= rating.stars
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-black text-amber-300 ml-1">
                          {rating.stars}
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    {rating.tags && rating.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {rating.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold"
                          >
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Comment */}
                    {rating.comment ? (
                      <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 italic leading-relaxed">
                        "{rating.comment}"
                      </p>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic block">
                        Calificación sin comentario escrito.
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Cerrar Historial
          </button>
        </div>
      </div>
    </div>
  );
};
