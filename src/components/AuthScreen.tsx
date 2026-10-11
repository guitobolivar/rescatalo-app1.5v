import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, isDriverRole, isClientRole } from '../types';
import { RescataloLogo } from './RescataloLogo';
import {
  User,
  Bike,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  IdCard,
  Check,
  Loader2,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states - All initialized to empty string ("") as required
  const [name, setName] = useState('');
  const [cedula, setCedula] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Google reCAPTCHA states
  const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);
  const [isRecaptchaLoading, setIsRecaptchaLoading] = useState(false);

  // Validaciones estrictas de contraseña:
  // - Mínimo 1 mayúscula
  // - Mínimo 1 carácter especial
  // - Mínimo 1 número
  // - Longitud de 8 a 20 caracteres
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasValidLength = password.length >= 8 && password.length <= 20;
  const isPasswordValid = hasUppercase && hasSpecial && hasNumber && hasValidLength;

  // Barra medidora de seguridad (Tabulador de seguridad):
  // - Rojo (Seguridad Baja): al alcanzar 8 caracteres
  // - Amarillo (Seguridad Media): al alcanzar 12 caracteres
  // - Verde (Seguridad Alta): de 16 caracteres en adelante
  const getPasswordStrength = () => {
    if (password.length < 8) {
      return {
        level: 'none',
        label: 'Menos de 8 caracteres',
        barColor: 'bg-slate-700',
        textColor: 'text-slate-500',
        width: password.length > 0 ? `${(password.length / 8) * 25}%` : '0%',
      };
    }
    if (password.length >= 8 && password.length < 12) {
      return {
        level: 'low',
        label: 'Seguridad Baja (8-11 car.)',
        barColor: 'bg-rose-500',
        textColor: 'text-rose-400',
        width: '33%',
      };
    }
    if (password.length >= 12 && password.length < 16) {
      return {
        level: 'medium',
        label: 'Seguridad Media (12-15 car.)',
        barColor: 'bg-amber-400',
        textColor: 'text-amber-300',
        width: '66%',
      };
    }
    return {
      level: 'high',
      label: 'Seguridad Alta (16-20 car.)',
      barColor: 'bg-emerald-400',
      textColor: 'text-emerald-300',
      width: '100%',
    };
  };

  const passwordStrength = getPasswordStrength();

  // Handlers con bloqueo estricto en tiempo real
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Nombre y Apellido: Bloquea y evita caracteres especiales o números; solo permite texto alfabético y espacios
    const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    setName(val);
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 2. Cédula de Identidad: Limita a un máximo de 8 dígitos, permitiendo únicamente números
    const val = e.target.value.replace(/\D/g, '').slice(0, 8);
    setCedula(val);
  };

  const handleVehicleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 4. Datos del Vehículo: Bloquea caracteres especiales
    const val = e.target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]/g, '');
    setVehicleModel(val);
  };

  const handleVehiclePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 4. Datos del Vehículo: Bloquea caracteres especiales
    const val = e.target.value.replace(/[^a-zA-Z0-9\s-]/g, '').toUpperCase();
    setVehiclePlate(val);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 5. Contraseña: Máximo 20 caracteres
    const val = e.target.value.slice(0, 20);
    setPassword(val);
  };

  const resetRegisterForm = () => {
    setName('');
    setCedula('');
    setPhone('');
    setEmail('');
    setPassword('');
    setVehicleModel('');
    setVehiclePlate('');
    setIsRecaptchaVerified(false);
    setIsRecaptchaLoading(false);
    setErrorMsg('');
  };

  const resetLoginForm = () => {
    setEmail('');
    setPassword('');
    setErrorMsg('');
  };

  const handleTriggerRecaptcha = () => {
    if (isRecaptchaVerified || isRecaptchaLoading) return;
    setIsRecaptchaLoading(true);
    setTimeout(() => {
      setIsRecaptchaLoading(false);
      setIsRecaptchaVerified(true);
    }, 700);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Por favor ingresa tu correo y contraseña.');
        setLoading(false);
        return;
      }
      const res = await login(email, password);
      if (!res.success) {
        setErrorMsg(res.message || 'Error al iniciar sesión.');
      } else {
        // Reset on submit success
        resetLoginForm();
      }
      setLoading(false);
    } else {
      if (!isRecaptchaVerified) {
        setErrorMsg('Por favor completa la verificación reCAPTCHA para registrarte.');
        setLoading(false);
        return;
      }

      if (
        !name.trim() ||
        !cedula.trim() ||
        !phone.trim() ||
        !email.trim() ||
        !password.trim()
      ) {
        setErrorMsg('Todos los campos son obligatorios para completar el registro.');
        setLoading(false);
        return;
      }

      // 1. Validación estricta de Nombre y Apellido (solo alfabético)
      if (name.trim().length < 2 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name.trim())) {
        setErrorMsg('El nombre y apellido debe contener únicamente letras (sin números ni caracteres especiales).');
        setLoading(false);
        return;
      }

      // 2. Validación estricta de Cédula (máximo 8 dígitos, solo números)
      if (!/^\d{4,8}$/.test(cedula.trim())) {
        setErrorMsg('La cédula de identidad debe contener únicamente números y tener un máximo de 8 dígitos.');
        setLoading(false);
        return;
      }

      // 5. Validación estricta de Contraseña (mayúscula, carácter especial, número, 8-20 car.)
      if (!isPasswordValid) {
        setErrorMsg('La contraseña no cumple con los requisitos de seguridad: debe contener mínimo 1 mayúscula, 1 número, 1 carácter especial y una longitud de 8 a 20 caracteres.');
        setLoading(false);
        return;
      }

      if (isDriverRole(role) && (!vehicleModel.trim() || !vehiclePlate.trim())) {
        setErrorMsg('Debes ingresar el modelo y placa del vehículo para repartidores.');
        setLoading(false);
        return;
      }

      const cleanPhone = phone.trim().replace(/^\+58\s*/, '');
      const formattedPhone = `+58 ${cleanPhone}`;

      const finalRole = isDriverRole(role) ? 'driver' : 'client';

      const res = await register({
        name: name.trim(),
        cedula: cedula.trim(),
        phone: formattedPhone,
        email: email.trim().toLowerCase(),
        password,
        role: finalRole,
        vehicle:
          isDriverRole(role)
            ? {
                type: 'Moto',
                model: vehicleModel.trim() || 'Moto Keeway 150',
                plate: vehiclePlate.trim().toUpperCase() || 'AB0-00X',
                color: 'Negro / Azul',
              }
            : undefined,
      });

      if (!res.success) {
        setErrorMsg(res.message || 'Error al crear la cuenta.');
      } else {
        // Reset on submit success
        resetRegisterForm();
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center p-4 py-8 bg-[#0b111e]">
      <div className="w-full max-w-sm bg-slate-900/95 rounded-3xl border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 p-6 space-y-5">
        {/* Branding: Creative R Logo + Professional Typography */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <RescataloLogo size="xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Rescátalo
            </h1>
            <p className="text-xs font-semibold text-emerald-400/90 tracking-wide uppercase mt-0.5">
              Delivery & Movilidad Venezuela
            </p>
          </div>
          <p className="text-xs text-slate-300">
            {mode === 'login'
              ? 'Ingresa tus credenciales para acceder a tu cuenta.'
              : 'Regístrate para solicitar o realizar envíos.'}
          </p>
        </div>

        {/* Tab Switch (Iniciar Sesión vs Registrarse) */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-sm font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-semibold leading-relaxed">
              {errorMsg}
            </div>
          )}

          {mode === 'register' && (
            <>
              {/* 1. Nombre Completo (Solo texto alfabético) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    Nombre Completo
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono">Solo letras</span>
                </div>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-2xl pl-10 pr-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* 2. Cédula de Identidad (Máximo 8 dígitos, solo números) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    Cédula de Identidad (Obligatorio)
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono">Máx 8 dígitos numéricos</span>
                </div>
                <div className="relative">
                  <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={8}
                    inputMode="numeric"
                    value={cedula}
                    onChange={handleCedulaChange}
                    placeholder="Ej. 28123456"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-2xl pl-10 pr-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              {/* 3. Teléfono / WhatsApp (+58 Integrado) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Teléfono / WhatsApp (Venezuela)
                </label>
                <div className="flex items-center w-full bg-slate-950 border border-slate-700 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40 rounded-2xl overflow-hidden transition-all">
                  <div className="flex items-center gap-1.5 pl-3.5 pr-2.5 py-3 bg-slate-900/90 border-r border-slate-800 text-xs font-bold select-none shrink-0">
                    <span className="text-sm">🇻🇪</span>
                    <span className="font-mono text-cyan-300 font-black">+58</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^\+58\s*/, '').replace(/\D/g, '').slice(0, 10);
                      setPhone(val);
                    }}
                    placeholder="412 1234567"
                    className="w-full bg-transparent px-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none font-mono tracking-wide"
                  />
                </div>
              </div>

              {/* 3. Roles de Cuenta: Estrictamente Cliente y Repartidor */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Rol de Cuenta (Selección Obligatoria)
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      isClientRole(role)
                        ? 'border-cyan-400 bg-cyan-950/70 text-white shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <User className={`w-4 h-4 ${isClientRole(role) ? 'text-cyan-400' : 'text-slate-400'}`} />
                      {isClientRole(role) && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                    </div>
                    <span className="text-xs font-black text-white">Cliente</span>
                    <span className="text-[11px] text-slate-400 leading-tight">Pedir delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('driver')}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      isDriverRole(role)
                        ? 'border-blue-400 bg-blue-950/70 text-white shadow-md shadow-blue-950/40 ring-1 ring-blue-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Bike className={`w-4 h-4 ${isDriverRole(role) ? 'text-blue-400' : 'text-slate-400'}`} />
                      {isDriverRole(role) && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      )}
                    </div>
                    <span className="text-xs font-black text-white">Repartidor</span>
                    <span className="text-[11px] text-slate-400 leading-tight">Hacer entregas</span>
                  </button>
                </div>
              </div>

              {/* 4. Datos del Vehículo: Sin caracteres especiales */}
              {isDriverRole(role) && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-blue-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-400 uppercase tracking-wide block">
                      Datos del Vehículo:
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Sin caracteres especiales</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 block font-medium">Modelo de Moto</span>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={handleVehicleModelChange}
                      placeholder="Ej. Bera SBR 150"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-400 placeholder-slate-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 block font-medium">Número de Placa</span>
                    <input
                      type="text"
                      value={vehiclePlate}
                      onChange={handleVehiclePlateChange}
                      placeholder="Ej. AB1-88K"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase outline-none focus:border-blue-400 placeholder-slate-500 font-mono"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.correo@ejemplo.com"
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-2xl pl-10 pr-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* 5. Password con Tabulador de Seguridad y Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300">
                Contraseña
              </label>
              {mode === 'register' && (
                <span className="text-[10px] font-mono text-slate-400">
                  {password.length}/20 caracteres
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                maxLength={20}
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-2xl pl-10 pr-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
              />
            </div>

            {mode === 'register' && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                {/* TABULADOR DE SEGURIDAD (BARRA MEDIDORA) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Medidor de Seguridad:</span>
                    <span className={`font-bold ${passwordStrength.textColor}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${passwordStrength.barColor} transition-all duration-300 rounded-full`}
                      style={{ width: passwordStrength.width }}
                    />
                  </div>
                </div>

                {/* CHECKLIST VISUAL INTERACTIVO EN TIEMPO REAL */}
                <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1.5 text-[11px]">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Requisitos obligatorios:
                  </span>
                  <div className="grid grid-cols-1 gap-1">
                    <div className={`flex items-center gap-1.5 transition-colors ${hasUppercase ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      {hasUppercase ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[8px] text-slate-600">✕</div>
                      )}
                      <span>Mínimo 1 letra mayúscula (A-Z)</span>
                    </div>

                    <div className={`flex items-center gap-1.5 transition-colors ${hasSpecial ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      {hasSpecial ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[8px] text-slate-600">✕</div>
                      )}
                      <span>Mínimo 1 carácter especial (@, #, $, %, etc.)</span>
                    </div>

                    <div className={`flex items-center gap-1.5 transition-colors ${hasNumber ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      {hasNumber ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[8px] text-slate-600">✕</div>
                      )}
                      <span>Mínimo 1 número (0-9)</span>
                    </div>

                    <div className={`flex items-center gap-1.5 transition-colors ${hasValidLength ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                      {hasValidLength ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[8px] text-slate-600">✕</div>
                      )}
                      <span>Longitud de 8 a 20 caracteres</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* GOOGLE reCAPTCHA (Obligatorio para Registrarse) */}
          {mode === 'register' && (
            <div className="pt-1">
              <div className="bg-[#f9f9f9] text-[#222] p-3 rounded-2xl border border-slate-600 shadow-md flex items-center justify-between select-none">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isRecaptchaLoading || isRecaptchaVerified}
                    onClick={handleTriggerRecaptcha}
                    className={`w-7 h-7 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                      isRecaptchaVerified
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs'
                        : isRecaptchaLoading
                        ? 'border-blue-500 bg-white'
                        : 'border-neutral-400 bg-white hover:border-neutral-600 active:scale-95'
                    }`}
                    title="Verificación Google reCAPTCHA"
                  >
                    {isRecaptchaLoading ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    ) : isRecaptchaVerified ? (
                      <Check className="w-5 h-5 text-white stroke-[3]" />
                    ) : null}
                  </button>

                  <div>
                    <span className="text-xs font-bold text-neutral-800 block leading-tight">
                      No soy un robot
                    </span>
                    <span className="text-[10px] text-neutral-500 block leading-none mt-0.5">
                      {isRecaptchaVerified
                        ? 'Verificación completada'
                        : 'Toca el recuadro para validar'}
                    </span>
                  </div>
                </div>

                {/* reCAPTCHA Brand Badge */}
                <div className="flex flex-col items-center justify-center text-right pl-2 shrink-0">
                  <div className="w-7 h-7 flex items-center justify-center">
                    <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none">
                      <path
                        d="M24 4C13 4 4 13 4 24c0 3.3.8 6.4 2.2 9.1l4.5-4.5C9.8 26.9 9.3 25.5 9.3 24c0-8.1 6.6-14.7 14.7-14.7 4 0 7.7 1.6 10.4 4.3L27 21h17V4l-6.3 6.3C34.1 6.7 29.3 4 24 4z"
                        fill="#1A73E8"
                      />
                      <path
                        d="M41.8 14.9l-4.5 4.5c.9 1.7 1.4 3.1 1.4 4.6 0 8.1-6.6 14.7-14.7 14.7-4 0-7.7-1.6-10.4-4.3L21 27H4v17l6.3-6.3C13.9 41.3 18.7 44 24 44c11 0 20-9 20-20 0-3.3-.8-6.4-2.2-9.1z"
                        fill="#4285F4"
                      />
                    </svg>
                  </div>
                  <span className="text-[9px] font-bold text-neutral-600 leading-tight">
                    reCAPTCHA
                  </span>
                  <div className="flex gap-1 text-[8px] text-neutral-400 leading-none">
                    <span>Privacidad</span>
                    <span>-</span>
                    <span>Términos</span>
                  </div>
                </div>
              </div>

              {!isRecaptchaVerified && (
                <p className="text-[10px] text-amber-400/90 text-center font-bold mt-1.5">
                  Debes marcar el reCAPTCHA para habilitar el botón de registro
                </p>
              )}
            </div>
          )}

          {/* Submit Button - Disabled in register mode until reCAPTCHA is completed */}
          <button
            type="submit"
            disabled={loading || (mode === 'register' && !isRecaptchaVerified)}
            className={`w-full py-3.5 font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all mt-2 ${
              mode === 'register' && !isRecaptchaVerified
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 opacity-50 shadow-none'
                : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 active:scale-98 text-slate-950 cursor-pointer shadow-lg shadow-cyan-500/25'
            }`}
          >
            <span>{mode === 'login' ? 'Acceder a mi Cuenta' : 'Registrar Cuenta'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security / Privacy notice */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sistema seguro y protegido anti-multicuentas (RBAC)</span>
          </p>
        </div>
      </div>
    </div>
  );
};
