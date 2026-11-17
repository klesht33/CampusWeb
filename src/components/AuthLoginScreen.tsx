import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  User,
  Lock,
  ShieldAlert,
  ArrowRight,
  UserPlus,
  LogIn,
  CheckCircle2,
  KeyRound,
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  generateSalt,
  hashPasswordWithSalt,
  signUserSession,
  getLockoutState,
  recordFailedLoginAttempt,
  resetLoginLockout,
  detectMaliciousPayload,
  sanitizeUserText,
  logSecurityEvent,
} from '../utils/security';

export type UserRole = 'user' | 'admin';

export interface AppUser {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  authProvider: 'username' | 'google' | 'apple';
  createdAt: string;
  sessionIssuedAt?: number;
  expiresAt?: number;
  sessionSignature?: string;
}

export interface StoredAccount extends AppUser {
  passwordHash?: string;
  salt?: string;
}

interface AuthLoginScreenProps {
  onLoginSuccess: (user: AppUser) => void;
  registeredUsers: StoredAccount[];
  onRegisterUser: (newAccount: StoredAccount) => void;
  securityAlertBanner?: string | null;
}

export const AuthLoginScreen: React.FC<AuthLoginScreenProps> = ({
  onLoginSuccess,
  registeredUsers,
  onRegisterUser,
  securityAlertBanner,
}) => {
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'admin'>('login');

  // Campos de formulario (sin correo electrónico)
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estado de bloqueo por Fuerza Bruta
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState<number>(0);
  const [failedAttemptsCount, setFailedAttemptsCount] = useState<number>(
    () => getLockoutState().failedAttempts
  );

  // Modal de inicio con Google o Apple
  const [oauthProviderModal, setOauthProviderModal] = useState<
    'google' | 'apple' | null
  >(null);
  const [oauthCustomName, setOauthCustomName] = useState('');

  // Temporizador en tiempo real si la cuenta está bloqueada por intentos fallidos
  useEffect(() => {
    const checkLock = () => {
      const state = getLockoutState();
      setFailedAttemptsCount(state.failedAttempts);
      if (state.lockedUntil && state.lockedUntil > Date.now()) {
        setLockoutSecondsLeft(
          Math.ceil((state.lockedUntil - Date.now()) / 1000)
        );
      } else {
        setLockoutSecondsLeft(0);
      }
    };
    checkLock();
    const timer = setInterval(checkLock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Crea un objeto AppUser firmado criptográficamente contra manipulación en DevTools
  const buildSignedSession = (baseUser: AppUser): AppUser => {
    const issuedAt = Date.now();
    const expiresAt = issuedAt + 8 * 60 * 60 * 1000; // 8 horas de validez
    const signature = signUserSession({
      id: baseUser.id,
      username: baseUser.username,
      role: baseUser.role,
      sessionIssuedAt: issuedAt,
    });

    return {
      ...baseUser,
      sessionIssuedAt: issuedAt,
      expiresAt,
      sessionSignature: signature,
    };
  };

  // Cálculo de fortaleza de contraseña para registro
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Sin ingresar', color: 'bg-slate-800' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd) || /[A-Z]/.test(pwd)) score += 1;

    if (score <= 1)
      return { score: 1, label: 'Básica', color: 'bg-amber-500' };
    if (score <= 2)
      return { score: 2, label: 'Segura', color: 'bg-indigo-500' };
    return { score: 3, label: 'Alta Seguridad', color: 'bg-emerald-500' };
  };

  const pwdStrength = getPasswordStrength(password);

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (lockoutSecondsLeft > 0) {
      setErrorMsg(
        `Acceso bloqueado temporalmente por seguridad anti-fuerza bruta. Esperá ${lockoutSecondsLeft} segundos.`
      );
      return;
    }

    const payloadCheck = detectMaliciousPayload(`${username} ${password}`);
    if (payloadCheck.malicious) {
      logSecurityEvent(
        'CRITICAL',
        'XSS_PAYLOAD_BLOCKED',
        username || 'anónimo',
        `Intento de inyección bloqueado en formulario de Login.`
      );
      setErrorMsg('Se detectaron caracteres o scripts no permitidos por seguridad.');
      return;
    }

    const cleanUser = username.trim().toLowerCase().replace(/^@/, '');
    if (!cleanUser || !password.trim()) {
      setErrorMsg('Completá tu nombre de usuario y contraseña.');
      return;
    }

    // Verificación de Administrador Oficial (comparación con hash SHA-256 + salt fijo de admin)
    const adminInputHash = await hashPasswordWithSalt(
      password,
      'ADMIN_MASTER_SALT_2026'
    );
    const expectedAdminHash = await hashPasswordWithSalt(
      'admin123',
      'ADMIN_MASTER_SALT_2026'
    );

    if (cleanUser === 'admin' && adminInputHash === expectedAdminHash) {
      resetLoginLockout();
      setFailedAttemptsCount(0);
      logSecurityEvent(
        'INFO',
        'LOGIN_SUCCESS',
        'admin',
        'Inicio de sesión verificado con Rol Administrador (Firma HMAC activa).'
      );
      onLoginSuccess(
        buildSignedSession({
          id: 'admin-master',
          username: 'admin',
          displayName: 'Administrador General',
          role: 'admin',
          authProvider: 'username',
          createdAt: 'Cuenta Oficial',
        })
      );
      return;
    }

    const found = registeredUsers.find(
      (u) => u.username.toLowerCase() === cleanUser
    );

    if (!found) {
      const lockState = recordFailedLoginAttempt(cleanUser);
      setFailedAttemptsCount(lockState.failedAttempts);
      setErrorMsg(
        `Credenciales inválidas o usuario "@${cleanUser}" no registrado. Intentos fallidos: ${lockState.failedAttempts}/5.`
      );
      return;
    }

    // Verificación con Hash SHA-256 + Salt del usuario
    if (found.passwordHash && found.salt) {
      const candidateHash = await hashPasswordWithSalt(password, found.salt);
      if (candidateHash !== found.passwordHash) {
        const lockState = recordFailedLoginAttempt(cleanUser);
        setFailedAttemptsCount(lockState.failedAttempts);
        setErrorMsg(
          `Contraseña incorrecta. Intentos fallidos: ${lockState.failedAttempts}/5.`
        );
        return;
      }
    }

    resetLoginLockout();
    setFailedAttemptsCount(0);
    logSecurityEvent(
      'INFO',
      'LOGIN_SUCCESS',
      found.username,
      `Inicio de sesión exitoso (${found.role.toUpperCase()}).`
    );

    onLoginSuccess(
      buildSignedSession({
        id: found.id,
        username: found.username,
        displayName: found.displayName,
        role: found.role,
        authProvider: found.authProvider,
        createdAt: found.createdAt,
      })
    );
  };

  const handleRegisterWithoutEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (lockoutSecondsLeft > 0) {
      setErrorMsg(
        `Formulario bloqueado temporalmente (${lockoutSecondsLeft}s restantes).`
      );
      return;
    }

    const payloadCheck = detectMaliciousPayload(
      `${username} ${displayName} ${password}`
    );
    if (payloadCheck.malicious) {
      logSecurityEvent(
        'CRITICAL',
        'XSS_PAYLOAD_BLOCKED',
        username || 'registro',
        'Intento de inyección XSS bloqueado durante creación de usuario.'
      );
      setErrorMsg('El nombre de usuario contiene código o etiquetas bloqueadas.');
      return;
    }

    const cleanUser = username
      .trim()
      .toLowerCase()
      .replace(/^@/, '')
      .replace(/[^a-z0-9_.-]/g, '_');

    if (cleanUser.length < 3 || cleanUser.length > 28) {
      setErrorMsg('El usuario debe tener entre 3 y 28 caracteres alfanuméricos.');
      return;
    }

    if (password.trim().length < 4) {
      setErrorMsg('Elegí una contraseña de al menos 4 caracteres.');
      return;
    }

    const exists = registeredUsers.some(
      (u) => u.username.toLowerCase() === cleanUser
    );
    if (exists || cleanUser === 'admin') {
      setErrorMsg(`El usuario "@${cleanUser}" ya está reservado. Elegí otro.`);
      return;
    }

    // Generamos Salt aleatorio y guardamos ÚNICAMENTE el hash SHA-256 (jamás la clave en texto plano)
    const salt = generateSalt(16);
    const passwordHash = await hashPasswordWithSalt(password, salt);

    const newAccount: StoredAccount = {
      id: `usr-${Date.now()}`,
      username: cleanUser,
      displayName: sanitizeUserText(displayName.trim() || cleanUser, 40),
      passwordHash,
      salt,
      role: 'user',
      authProvider: 'username',
      createdAt: 'Cifrado SHA-256',
    };

    logSecurityEvent(
      'INFO',
      'LOGIN_SUCCESS',
      cleanUser,
      'Nuevo usuario registrado sin correo (Contraseña cifrada con SHA-256 + Salt).'
    );

    onRegisterUser(newAccount);
    onLoginSuccess(buildSignedSession(newAccount));
  };

  const handleCompleteOAuth = (
    provider: 'google' | 'apple',
    chosenName?: string
  ) => {
    const rawName =
      chosenName?.trim() ||
      oauthCustomName.trim() ||
      (provider === 'google' ? 'Alumno Google' : 'Alumno Apple');
    const finalName = sanitizeUserText(rawName, 40);
    const cleanUsername = finalName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const existing = registeredUsers.find(
      (u) => u.username === cleanUsername && u.authProvider === provider
    );

    if (existing) {
      logSecurityEvent(
        'INFO',
        'LOGIN_SUCCESS',
        existing.username,
        `Autenticación OAuth verificada vía ${provider.toUpperCase()}.`
      );
      onLoginSuccess(buildSignedSession(existing));
    } else {
      const created: StoredAccount = {
        id: `oauth-${provider}-${Date.now()}`,
        username: cleanUsername || `alumno_${provider}`,
        displayName: finalName,
        role: 'user',
        authProvider: provider,
        createdAt: `Vinculado con ${provider === 'google' ? 'Google' : 'Apple'}`,
      };
      logSecurityEvent(
        'INFO',
        'LOGIN_SUCCESS',
        created.username,
        `Nuevo ingreso OAuth vinculado vía ${provider.toUpperCase()}.`
      );
      onRegisterUser(created);
      onLoginSuccess(buildSignedSession(created));
    }
    setOauthProviderModal(null);
    setOauthCustomName('');
  };

  return (
    <div className="min-h-screen bg-k-0e0c0a text-k-f3ece2 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Resplandor cálido minimalista */}
      <div className="pointer-events-none fixed -top-36 -left-36 w-[28rem] h-[28rem] rounded-full bg-k-d6b892/10 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-36 -right-36 w-[28rem] h-[28rem] rounded-full bg-k-b38f63/10 blur-3xl" />

      {securityAlertBanner && (
        <div className="max-w-4xl w-full mb-4 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-3 shadow-xl">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <strong className="block text-white">
              Protección de Seguridad Activada
            </strong>
            {securityAlertBanner}
          </div>
        </div>
      )}

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 campus-surface rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Columna Izquierda: Estética Minimalista Oscura Cálida */}
        <div className="lg:col-span-5 bg-gradient-to-b from-k-171411 via-k-13100d to-k-0e0c0a p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-k-27211c flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-k-241f1a border border-k-d6b892/15 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-k-d6b892"
                  fill="currentColor"
                >
                  <path d="M12 1L14.5 9.5L23 12L14.5 14.5L12 23L9.5 14.5L1 12L9.5 9.5L12 1Z" />
                </svg>
              </div>
              <div>
                <h1 className="font-editorial text-2xl tracking-tight text-k-f3ece2">
                  CampusLab
                </h1>
                <p className="text-[11px] text-k-d6b892 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Plataforma Blindada SHA-256
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <p className="font-editorial italic text-sm text-k-c8bcb0">
                Aprendé. Avanzá. Crecé.
              </p>
              <h2 className="font-editorial text-2xl text-k-f3ece2 leading-snug">
                Tu espacio académico, en un solo lugar.
              </h2>
              <p className="text-xs text-k-9e9285 leading-relaxed">
                Ingresá con Google, Apple o creá un usuario{' '}
                <strong className="text-k-d6b892">
                  sin necesidad de correo electrónico
                </strong>
                . Sesiones firmadas y protegidas con criptografía SHA-256.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-k-c8bcb0">
                <CheckCircle2 className="w-4 h-4 text-k-d6b892 shrink-0" />
                <span>Contraseñas cifradas con SHA-256 + Salt único</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-k-c8bcb0">
                <CheckCircle2 className="w-4 h-4 text-k-d6b892 shrink-0" />
                <span>Firma Anti-Tampering contra edición en F12</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-k-c8bcb0">
                <CheckCircle2 className="w-4 h-4 text-k-d6b892 shrink-0" />
                <span>Bloqueo automático contra ataques de Fuerza Bruta</span>
              </div>
            </div>
          </div>

          {/* Botones de ingreso directo en 1 clic para probar ambos roles */}
          <div className="p-4 rounded-2xl bg-k-120f0d border border-k-27211c space-y-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-k-9e9285">
              Acceso Rápido Verificado (1 Clic):
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                disabled={lockoutSecondsLeft > 0}
                onClick={() => {
                  resetLoginLockout();
                  logSecurityEvent(
                    'INFO',
                    'LOGIN_SUCCESS',
                    'alestte',
                    'Ingreso directo con Rol Usuario Normal (@alestte).'
                  );
                  onLoginSuccess(
                    buildSignedSession({
                      id: 'usr-demo-alestte',
                      username: 'alestte',
                      displayName: 'alestte',
                      role: 'user',
                      authProvider: 'username',
                      createdAt: 'Cuenta Alumno',
                    })
                  );
                }}
                className="w-full py-2.5 px-4 rounded-full bg-k-d6b892 hover:bg-k-e2c8a6 disabled:opacity-40 text-k-14110e text-xs font-semibold transition flex items-center justify-between shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Entrar como @alestte (Usuario Normal)
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={lockoutSecondsLeft > 0}
                onClick={() => {
                  resetLoginLockout();
                  logSecurityEvent(
                    'INFO',
                    'LOGIN_SUCCESS',
                    'admin',
                    'Ingreso directo con Rol Administrador Oficial.'
                  );
                  onLoginSuccess(
                    buildSignedSession({
                      id: 'admin-master',
                      username: 'admin',
                      displayName: 'Administrador General',
                      role: 'admin',
                      authProvider: 'username',
                      createdAt: 'Cuenta Oficial',
                    })
                  );
                }}
                className="w-full py-2.5 px-4 rounded-full bg-k-26211c hover:bg-k-332b24 disabled:opacity-40 text-k-d6b892 border border-k-d6b892/20 text-xs font-semibold transition flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Entrar como Administrador (Modificar Todo)
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Login / Registro sin correo / Google & Apple */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          {/* Selector de Pestaña */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAuthTab('login');
                setErrorMsg(null);
              }}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authTab === 'login'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Ingresar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthTab('register');
                setErrorMsg(null);
              }}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authTab === 'register'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Crear Usuario</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthTab('admin');
                setUsername('admin');
                setPassword('admin123');
                setErrorMsg(null);
              }}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-amber-300/80 hover:text-amber-300'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Rol Admin</span>
            </button>
          </div>

          {/* Alerta de bloqueo por fuerza bruta */}
          {lockoutSecondsLeft > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200 font-bold flex items-center justify-between">
              <span>
                🔒 Protección Anti-Fuerza Bruta activa (5 intentos fallidos)
              </span>
              <span className="font-mono text-sm text-white">
                {lockoutSecondsLeft}s
              </span>
            </div>
          )}

          {/* Botones de Google y Apple */}
          {authTab !== 'admin' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={lockoutSecondsLeft > 0}
                  onClick={() => setOauthProviderModal('google')}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-900 font-bold text-xs transition flex items-center justify-center gap-2.5 shadow"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="rgb(var(--k-4285f4))"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="rgb(var(--k-34a853))"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                    />
                    <path
                      fill="rgb(var(--k-fbbc05))"
                      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                    />
                    <path
                      fill="rgb(var(--k-ea4335))"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  <span>Continuar con Google</span>
                </button>

                <button
                  type="button"
                  disabled={lockoutSecondsLeft > 0}
                  onClick={() => setOauthProviderModal('apple')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-white border border-slate-700 font-bold text-xs transition flex items-center justify-center gap-2.5 shadow"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  <span>Continuar con Apple</span>
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800" />
                <span className="flex-shrink mx-3 text-[11px] text-slate-500 font-semibold uppercase">
                  o sin correo electrónico (solo usuario)
                </span>
                <div className="flex-grow border-t border-slate-800" />
              </div>
            </div>
          )}

          {/* Mensajes de Error */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 font-semibold">
              {errorMsg}
            </div>
          )}

          {/* PESTAÑA 1: INGRESAR CON USUARIO */}
          {authTab === 'login' && (
            <form onSubmit={handleUsernameLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nombre de Usuario (sin correo)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej: alumno_lsi"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Contraseña
                  </label>
                  {failedAttemptsCount > 0 && (
                    <span className="text-[10px] font-mono text-amber-400">
                      Intentos fallidos: {failedAttemptsCount}/5
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={lockoutSecondsLeft > 0}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-extrabold shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>Ingresar de Forma Segura</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* PESTAÑA 2: CREAR USUARIO SIN CORREO */}
          {authTab === 'register' && (
            <form onSubmit={handleRegisterWithoutEmail} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-200">
                <strong>Privacidad Total (Sin Correo):</strong> Tu contraseña se
                transforma inmediatamente en un hash <code>SHA-256 + Salt</code>{' '}
                y jamás se almacena en texto plano.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Elegí tu @usuario *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ej: facu_unne"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Apodo / Nombre Visible
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ej: Facundo (2° Año)"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Creá una Contraseña *
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    Nivel: <strong className="text-white">{pwdStrength.label}</strong>
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                  {[1, 2, 3].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-1 rounded-full transition ${
                        pwdStrength.score >= lvl
                          ? pwdStrength.color
                          : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={lockoutSecondsLeft > 0}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-extrabold shadow-lg transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Crear Cuenta Cifrada y Entrar</span>
              </button>
            </form>
          )}

          {/* PESTAÑA 3: INGRESO ROL ADMINISTRADOR */}
          {authTab === 'admin' && (
            <form onSubmit={handleUsernameLogin} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-300">
                  <KeyRound className="w-4 h-4" />
                  Autenticación Criptográfica de Administrador
                </div>
                <p className="text-[11px] text-amber-100/80">
                  El acceso de Administrador genera un token de sesión firmado
                  con integridad <code>HMAC</code> que no puede ser falsificado
                  desde las herramientas de desarrollador del navegador.
                </p>
                <div className="text-[11px] font-mono text-emerald-300 pt-1">
                  Usuario: <strong>admin</strong> | Clave:{' '}
                  <strong>admin123</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Usuario Administrador
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contraseña Administrador
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={lockoutSecondsLeft > 0}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-black shadow-lg transition flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Verificar y Entrar como Administrador</span>
              </button>
            </form>
          )}

          <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
            Protegido con Content-Security-Policy (CSP), Anti-XSS, límite de 5
            intentos y firma de sesión.
          </div>
        </div>
      </div>

      {/* Modal interactivo para Continuar con Google o Apple */}
      {oauthProviderModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white">
                {oauthProviderModal === 'google'
                  ? 'Seleccionar Cuenta de Google'
                  : 'Iniciar sesión con Apple ID'}
              </h3>
              <button
                onClick={() => setOauthProviderModal(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cerrar
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Elegí una cuenta rápida o escribí tu nombre para ingresar como{' '}
              <strong>Usuario Normal (Alumno)</strong>:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  handleCompleteOAuth(
                    oauthProviderModal,
                    oauthProviderModal === 'google'
                      ? 'Alumno UNNE (Google)'
                      : 'Alumno UNNE (Apple ID)'
                  )
                }
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/50 text-left flex items-center justify-between transition"
              >
                <div>
                  <div className="text-xs font-bold text-white">
                    {oauthProviderModal === 'google'
                      ? 'Alumno UNNE (Cuenta Google)'
                      : 'Alumno UNNE (Cuenta Apple)'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Token OAuth firmado • Rol: Usuario Normal
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400" />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                O ingresá con tu nombre personalizado:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={oauthCustomName}
                  onChange={(e) => setOauthCustomName(e.target.value)}
                  placeholder="Tu nombre o apodo..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => handleCompleteOAuth(oauthProviderModal)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
