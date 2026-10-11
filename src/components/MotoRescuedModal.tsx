import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { Check, ShieldCheck, MapPin, Star, UserCheck } from 'lucide-react';

interface MotoRescuedModalProps {
  order: Order;
  isOpen: boolean;
  onProceedToRating: () => void;
}

export const MotoRescuedModal: React.FC<MotoRescuedModalProps> = ({
  order,
  isOpen,
  onProceedToRating,
}) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onProceedToRating();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, onProceedToRating]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-[94%] max-w-sm mx-auto bg-slate-900 border-2 border-emerald-400 rounded-3xl p-6 text-center shadow-2xl shadow-emerald-500/30 space-y-4 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* Ambient radial glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Paloma verde tipo check list centrada y brillante */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-60" />
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 border-4 border-emerald-300 text-slate-950 flex items-center justify-center shadow-2xl shadow-emerald-500/50 animate-in zoom-in-50 duration-300">
            <Check className="w-14 h-14 stroke-[4] text-slate-950 drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]" />
          </div>
        </div>

        {/* Encabezado principal obligatorio */}
        <div className="space-y-1">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-widest bg-emerald-950/90 text-emerald-300 border border-emerald-500/40">
            Rescátalo Moto · Viaje Culminado
          </span>
          <h2 className="text-2xl font-black text-white pt-1 tracking-tight leading-tight">
            ¡Has sido rescatado!
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Has llegado a tu destino con éxito y seguridad. Tu rescatista en Moto Taxi ha completado el servicio de transporte.
          </p>
        </div>

        {/* Rescatista & Destino info card */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2.5">
          <div className="flex items-center gap-3">
            <img
              src={
                order.driverAvatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
              }
              alt={order.driverName || 'Rescatista'}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/40 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                  Rescatista Asignado:
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <h4 className="text-sm font-black text-white truncate">
                {order.driverName || 'Conductor de Rescátalo'}
              </h4>
              <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                Moto Taxi · Valle de la Pascua
              </span>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 truncate">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[200px] text-[11px]">
                {order.destination?.name || 'Destino final'}
              </span>
            </div>
            <span className="font-mono font-bold text-white shrink-0">
              ${order.totalCostUSD?.toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Countdown progress bar */}
        <div className="space-y-1 pt-1">
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 5) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Pasando a calificar al rescatista en:</span>
            <strong className="text-emerald-400 font-bold">{countdown}s</strong>
          </div>
        </div>

        {/* Proceed to rating button */}
        <button
          type="button"
          onClick={onProceedToRating}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl cursor-pointer shadow-xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Star className="w-4 h-4 fill-slate-950" />
          <span>Calificar al Rescatista / Moto Taxi</span>
        </button>
      </div>
    </div>
  );
};
