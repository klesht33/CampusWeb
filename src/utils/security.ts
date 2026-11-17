// ============================================================================
// MÓDULO CENTRAL DE SEGURIDAD — CAMPUSLAB
// Incluye:
// 1. Hashing criptográfico SHA-256 con Salt (Web Crypto API)
// 2. Firma de integridad de sesión Anti-Tampering (protege contra edición en F12 / LocalStorage)
// 3. Protección Anti-Fuerza Bruta con bloqueo temporal (Rate Limiting)
// 4. Sanitización Anti-XSS e Inyección de código
// 5. Escáner de seguridad para archivos subidos (extensión, tamaño y payloads)
// 6. Registro de Auditoría de Seguridad (Security Audit Log)
// ============================================================================

export type SecuritySeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface SecurityAuditEvent {
  id: string;
  timestamp: string;
  severity: SecuritySeverity;
  eventType:
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'BRUTE_FORCE_LOCKOUT'
    | 'SESSION_TAMPERING_BLOCKED'
    | 'XSS_PAYLOAD_BLOCKED'
    | 'MALICIOUS_FILE_BLOCKED'
    | 'ADMIN_PRIVILEGE_ACTION'
    | 'RATE_LIMIT_TRIGGERED';
  actor: string;
  details: string;
}

const AUDIT_LOG_KEY = 'campuslab_sec_audit_v1';
const LOCKOUT_STATE_KEY = 'campuslab_sec_lockout_v1';
const SESSION_PEPPER = 'CLAB_UNNE_SEC_2026_HMAC_99481A7F';

export interface LockoutState {
  failedAttempts: number;
  lockedUntil: number | null; // timestamp en ms
}

// ----------------------------------------------------------------------------
// 1. HASHING CRIPTOGRÁFICO SHA-256 CON SALT (NUNCA GUARDAR CLAVES EN TEXTO PLANO)
// ----------------------------------------------------------------------------
export function generateSalt(length = 16): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPasswordWithSalt(
  password: string,
  salt: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}::${password}::${SESSION_PEPPER}`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Hash determinístico síncrono (FNV-1a + rondas mixtas) para firma rápida de sesión en render
export function computeFastSignature(payload: string): string {
  let h1 = 0xdeadbeef ^ payload.length;
  let h2 = 0x41c6ce57 ^ payload.length;
  const full = `${payload}::${SESSION_PEPPER}`;
  for (let i = 0; i < full.length; i++) {
    const ch = full.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (
    (h2 >>> 0).toString(16).padStart(8, '0') +
    (h1 >>> 0).toString(16).padStart(8, '0')
  );
}

// ----------------------------------------------------------------------------
// 2. FIRMA Y VERIFICACIÓN DE INTEGRIDAD DE SESIÓN (ANTI-TAMPERING DEVTOOLS)
// ----------------------------------------------------------------------------
export function signUserSession(user: {
  id: string;
  username: string;
  role: string;
  sessionIssuedAt: number;
}): string {
  const raw = `${user.id}|${user.username.toLowerCase()}|${user.role}|${user.sessionIssuedAt}`;
  return computeFastSignature(raw);
}

export function verifyUserSessionSignature(user: {
  id?: string;
  username?: string;
  role?: string;
  sessionIssuedAt?: number;
  sessionSignature?: string;
  expiresAt?: number;
}): { valid: boolean; reason?: string } {
  if (
    !user ||
    !user.id ||
    !user.username ||
    !user.role ||
    !user.sessionIssuedAt ||
    !user.sessionSignature
  ) {
    return { valid: false, reason: 'Sesión incompleta o sin firma criptográfica.' };
  }

  if (user.expiresAt && Date.now() > user.expiresAt) {
    return { valid: false, reason: 'La sesión expiró por tiempo máximo de seguridad.' };
  }

  const expected = signUserSession({
    id: user.id,
    username: user.username,
    role: user.role,
    sessionIssuedAt: user.sessionIssuedAt,
  });

  if (expected !== user.sessionSignature) {
    return {
      valid: false,
      reason:
        'Alerta de seguridad: Se detectó manipulación manual de la sesión o del rol en el navegador.',
    };
  }

  return { valid: true };
}

// ----------------------------------------------------------------------------
// 3. PROTECCIÓN ANTI-FUERZA BRUTA (BLOQUEO TRAS 5 INTENTOS FALLIDOS)
// ----------------------------------------------------------------------------
export function getLockoutState(): LockoutState {
  try {
    const raw = localStorage.getItem(LOCKOUT_STATE_KEY);
    if (!raw) return { failedAttempts: 0, lockedUntil: null };
    const parsed: LockoutState = JSON.parse(raw);
    if (parsed.lockedUntil && Date.now() > parsed.lockedUntil) {
      const reset = { failedAttempts: 0, lockedUntil: null };
      localStorage.setItem(LOCKOUT_STATE_KEY, JSON.stringify(reset));
      return reset;
    }
    return parsed;
  } catch {
    return { failedAttempts: 0, lockedUntil: null };
  }
}

export function recordFailedLoginAttempt(usernameAttempt: string): LockoutState {
  const current = getLockoutState();
  const nextAttempts = current.failedAttempts + 1;
  const maxAttempts = 5;
  let lockedUntil: number | null = null;

  if (nextAttempts >= maxAttempts) {
    // Bloqueo por 60 segundos
    lockedUntil = Date.now() + 60 * 1000;
    logSecurityEvent(
      'CRITICAL',
      'BRUTE_FORCE_LOCKOUT',
      usernameAttempt || 'desconocido',
      `Se bloqueó el acceso durante 60 segundos tras ${nextAttempts} intentos fallidos consecutivos.`
    );
  } else {
    logSecurityEvent(
      'WARNING',
      'LOGIN_FAILED',
      usernameAttempt || 'desconocido',
      `Intento de inicio de sesión fallido (${nextAttempts}/${maxAttempts}).`
    );
  }

  const updated: LockoutState = {
    failedAttempts: nextAttempts,
    lockedUntil,
  };
  localStorage.setItem(LOCKOUT_STATE_KEY, JSON.stringify(updated));
  return updated;
}

export function resetLoginLockout(): void {
  localStorage.setItem(
    LOCKOUT_STATE_KEY,
    JSON.stringify({ failedAttempts: 0, lockedUntil: null })
  );
}

// ----------------------------------------------------------------------------
// 4. SANITIZACIÓN ANTI-XSS Y DETECCIÓN DE PAYLOADS MALICIOSOS
// ----------------------------------------------------------------------------
const DANGEROUS_PATTERNS: RegExp[] = [
  /<\s*script/i,
  /<\s*\/\s*script/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /data\s*:\s*text\/html/i,
  /on(error|load|click|mouseover|focus|blur|submit)\s*=/i,
  /<\s*(iframe|object|embed|applet|meta|link)/i,
  /document\s*\.\s*cookie/i,
  /localStorage\s*\.\s*(getItem|setItem|clear)/i,
  /eval\s*\(/i,
];

export function detectMaliciousPayload(input: string): {
  malicious: boolean;
  matchedRule?: string;
} {
  for (const regex of DANGEROUS_PATTERNS) {
    if (regex.test(input)) {
      return { malicious: true, matchedRule: regex.toString() };
    }
  }
  return { malicious: false };
}

export function sanitizeUserText(input: string, maxLength = 500): string {
  return input
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/[<>]/g, (ch) => (ch === '<' ? '‹' : '›'))
    .trim()
    .slice(0, maxLength);
}

export function sanitizeContentBody(input: string, maxLength = 25000): string {
  return input
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '[SCRIPT BLOQUEADO POR SEGURIDAD]')
    .replace(/javascript\s*:/gi, '[BLOQUEADO]:')
    .replace(/on(error|load|mouseover|focus)\s*=/gi, 'data-blocked=')
    .slice(0, maxLength);
}

// ----------------------------------------------------------------------------
// 5. ESCÁNER DE SEGURIDAD PARA ARCHIVOS SUBIDOS EN COMUNIDAD
// ----------------------------------------------------------------------------
const ALLOWED_EXTENSIONS = ['.md', '.txt', '.c', '.java', '.json'];
const BLOCKED_EXECUTABLE_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.ps1',
  '.sh',
  '.vbs',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.html',
  '.htm',
  '.svg',
  '.php',
  '.dll',
  '.msi',
  '.scr',
];
const MAX_UPLOAD_SIZE_BYTES = 512 * 1024; // 512 KB

export function validateUploadedFileSecurity(
  file: File,
  actorUsername: string
): { allowed: boolean; error?: string } {
  const lowerName = file.name.toLowerCase().trim();

  // Verificar tamaño máximo (previene DoS en navegador)
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    logSecurityEvent(
      'WARNING',
      'MALICIOUS_FILE_BLOCKED',
      actorUsername,
      `Archivo rechazado por exceder el límite de 512 KB: ${file.name} (${Math.round(
        file.size / 1024
      )} KB).`
    );
    return {
      allowed: false,
      error: `El archivo supera el tamaño máximo seguro permitido (512 KB).`,
    };
  }

  // Verificar extensiones ejecutables o doble extensión engañosa (ej: parcial.pdf.exe)
  for (const badExt of BLOCKED_EXECUTABLE_EXTENSIONS) {
    if (lowerName.endsWith(badExt) || lowerName.includes(`${badExt}.`)) {
      logSecurityEvent(
        'CRITICAL',
        'MALICIOUS_FILE_BLOCKED',
        actorUsername,
        `Intento de subir archivo ejecutable o peligroso bloqueado: "${file.name}".`
      );
      return {
        allowed: false,
        error: `Por seguridad, los archivos de tipo "${badExt}" están estrictamente bloqueados.`,
      };
    }
  }

  // Verificar lista blanca de extensiones permitidas
  const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) =>
    lowerName.endsWith(ext)
  );
  if (!hasAllowedExt) {
    logSecurityEvent(
      'WARNING',
      'MALICIOUS_FILE_BLOCKED',
      actorUsername,
      `Extensión no autorizada rechazada: "${file.name}".`
    );
    return {
      allowed: false,
      error: `Solo se permiten archivos de texto o código verificado (${ALLOWED_EXTENSIONS.join(
        ', '
      )}).`,
    };
  }

  return { allowed: true };
}

// ----------------------------------------------------------------------------
// 6. REGISTRO DE AUDITORÍA DE SEGURIDAD (SECURITY AUDIT LOGS)
// ----------------------------------------------------------------------------
export function getSecurityLogs(): SecurityAuditEvent[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY);
    if (!raw) {
      const initial: SecurityAuditEvent[] = [
        {
          id: 'sec-init-1',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          severity: 'INFO',
          eventType: 'ADMIN_PRIVILEGE_ACTION',
          actor: 'Sistema CampusLab',
          details:
            'Escudo de seguridad inicializado: Hash SHA-256 + Firma Anti-Tampering + Filtro Anti-XSS activos.',
        },
      ];
      localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function logSecurityEvent(
  severity: SecuritySeverity,
  eventType: SecurityAuditEvent['eventType'],
  actor: string,
  details: string
): void {
  const current = getSecurityLogs();
  const created: SecurityAuditEvent = {
    id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    severity,
    eventType,
    actor,
    details,
  };
  const updated = [created, ...current].slice(0, 80); // Mantiene los últimos 80 eventos
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(updated));
}

export function clearSecurityLogs(actor: string): SecurityAuditEvent[] {
  const resetEvent: SecurityAuditEvent = {
    id: `sec-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    severity: 'INFO',
    eventType: 'ADMIN_PRIVILEGE_ACTION',
    actor,
    details: 'El Administrador limpió el historial de auditoría de seguridad.',
  };
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify([resetEvent]));
  return [resetEvent];
}
