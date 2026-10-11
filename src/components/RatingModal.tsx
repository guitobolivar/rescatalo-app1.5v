import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { Star, CheckCircle, ThumbsUp, X, Bike, Package } from 'lucide-react';

interface RatingModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

const DELIVERY_TAGS = [
  'Puntual',
  'Manejo seguro',
  'Pedido intacto',
  'Excelente trato',
  'Buena comunicación',
  'Súper rápido',
];

const MOTO_TAXI_TAGS = [
  'Manejo seguro',
  'Puntual',
  'Casco incluido',
  'Excelente trato',
  'Buena comunicación',
  'Súper rápido',
  'Ruta óptima',
];

export const RatingModal: React.FC<RatingModalProps> = ({ order, isOpen, onClose }) => {
  const { submitRating, confirmOrderReception } = useApp();
  const [stars, setStars] = useState<number>(5);

  const isMotoTaxi = Boolean(
    order.serviceType === 'rescate_moto' ||
    order.serviceType?.toLowerCase().includes('moto') ||
    order.serviceType?.toLowerCase().includes('taxi') ||
    order.serviceType?.toLowerCase().includes('transporte')
  );

  const availableTags = isMotoTaxi ? MOTO_TAXI_TAGS : DELIVERY_TAGS;
  const [selectedTags, setSelectedTags] = useState<string[]>(
    isMotoTaxi ? ['Manejo seguro', 'Puntual', 'Casco incluido'] : ['Puntual', 'Pedido intacto']
  );
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRating(order.id, stars, selectedTags, comment);
    // Asegurar que el estado quede en COMPLETED
    confirmOrderReception(order.id);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[94%] max-w-sm mx-auto bg-slate-900 rounded-3xl shadow-2xl border-2 border-emerald-400/80 overflow-hidden max-h-[85vh] overflow-y-auto relative">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="p-7 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white">¡Calificación Registrada!</h3>
            <p className="text-xs text-slate-300">
              {isMotoTaxi
                ? 'Gracias por valorar a tu rescatista en Moto Taxi. Tu opinión mejora el servicio en Valle de la Pascua.'
                : 'Gracias por impulsar la confianza en Rescátalo Valle de la Pascua.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="text-center pt-2">
              <img
                src={
                  order.driverAvatar ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                }
                alt={order.driverName || 'Rescatista'}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-md mx-auto mb-2.5"
              />
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500/30 mb-1">
                {isMotoTaxi ? 'Moto Taxi · Rescatista' : 'Delivery Express'}
              </span>
              <h3 className="text-base font-black text-white">
                {isMotoTaxi ? '¡Califica a tu Rescatista!' : '¡Entrega Completada!'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {isMotoTaxi
                  ? `¿Cómo fue tu traslado con ${order.driverName || 'el conductor'}?`
                  : `Califica el servicio de ${order.driverName || 'tu conductor'}`}
              </p>
            </div>

            {/* Stars */}
            <div className="flex justify-center items-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setStars(val)}
                  className="p-1 cursor-pointer focus:outline-none hover:scale-115 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      val <= stars
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-700 fill-slate-800'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Service Tags */}
            <div>
              <label className="block text-xs font-black text-emerald-400 uppercase mb-2">
                Aspectos destacados del traslado:
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-xs'
                          : 'bg-slate-950 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment */}
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  isMotoTaxi
                    ? 'Escribe una breve reseña de tu viaje en moto (opcional)...'
                    : 'Escribe una breve reseña (opcional)...'
                }
                rows={2}
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 resize-none placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-sm rounded-2xl cursor-pointer active:scale-98 transition-all shadow-lg shadow-emerald-500/25"
            >
              Enviar Calificación
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
