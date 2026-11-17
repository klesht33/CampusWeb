# 05 — Security Hardening & Data Models

## 1. 5-Layer Client-Side Security Architecture (`src/utils/securityShield.ts`)

Because the platform stores state in `localStorage` and accepts user-submitted notes, code snippets, and file uploads, `securityShield.ts` enforces 5 defensive layers:

### Layer 1: Cryptographic Password Hashing (`sha256Hex`)
- Uses the native browser **Web Crypto API (`crypto.subtle.digest('SHA-256', ...)`** with a deterministic fallback) and a domain salt (`CAMPUS_UNNE_SALT_v2_9f8a7b`) so plaintext passwords are never stored in `localStorage`.

### Layer 2: Anti-Tampering Session Signature (`computeSessionIntegrityTag` & `verifySessionIntegrity`)
- Prevents a normal user (`role: 'user'`) from opening Chrome DevTools (`F12` → Application → `localStorage`) and manually editing `"role": "user"` to `"role": "admin"`.
- Every `AuthSessionUser` object includes an `integrityTag` computed over `id | username | role | provider | createdAt` plus a secret pepper.
- On every load and periodic check in `App.tsx`, `verifySessionIntegrity(session)` validates the signature. If tampered, the session is immediately revoked (`localStorage.removeItem('campus_unne_auth_session_v2')`) and a `CRITICAL` security audit event is logged.

### Layer 3: Anti-Brute-Force Login Rate Limiter (`checkLoginRateLimit` & `recordFailedLoginAttempt`)
- Tracks failed login attempts or invalid admin codes in `localStorage['campus_unne_login_guard_v1']`.
- Locks login temporarily for **60 seconds** after **5 consecutive failed attempts**.

### Layer 4: Anti-XSS & Anti-Injection Sanitizer (`sanitizeText` & `detectMaliciousPayload`)
- Inspects all user inputs (login usernames, note titles, summaries, markdown content, professor contacts, search queries).
- Detects and blocks `<script>`, `javascript:`, `onerror=`, `onload=`, `<iframe>`, `eval(`, `document.cookie`, and SQL injection patterns (`DROP TABLE`, `UNION SELECT`), logging blocked attempts to `campus_unne_security_audit_v1`.

### Layer 5: Upload File Type & Size Validator (`validateUploadedFile`)
- Validates both extension whitelist (`.pdf`, `.txt`, `.md`, `.c`, `.cpp`, `.java`, `.py`, `.sql`, `.png`, `.jpg`, `.jpeg`, `.webp`), MIME type, double-extension spoofing (e.g., `apunte.pdf.exe` is rejected), and maximum file size (`10 MB`).

---

## 2. Core TypeScript Data Models (`src/data/mockDatabase.ts` & `AdminDashboard.tsx`)

### 2.1 `Subject`
```ts
export type SubjectStatus = 'pendiente' | 'regular' | 'aprobada';

export interface Subject {
  id: string;                 // e.g. 'algoritmos-1', 'algoritmos-2', 'paradigmas', 'paradigmas-poo'
  name: string;               // Display name
  year: number;               // 1 | 2 | 3 | 4 | 5
  semester: '1° Cuatrimestre' | '2° Cuatrimestre' | 'Anual';
  regularizedPrereqs: string[]; // Subject IDs required as 'regular' or 'aprobada'
  approvedPrereqs: string[];    // Subject IDs required as 'aprobada'
}
```

### 2.2 `StudyNote` & `NoteDisplayMode`
```ts
export type NoteCategory =
  | 'Parcial Teórico'
  | 'Parcial Práctico'
  | 'Finales'
  | 'Exámenes Libres'
  | 'Proyectos';

export type ParcialInstance = '1° Parcial' | '2° Parcial' | 'Recuperatorio';

export type NoteDisplayMode = 'grid' | 'detailed' | 'file-preview';

export interface StudyNote {
  id: string;
  title: string;
  subjectId: string;
  category: NoteCategory;
  parcialInstance?: ParcialInstance;
  author: string;
  createdAt: string;
  votes: number;
  verifiedByStudents: boolean; // true = 1. Sección Verificados | false = 2. Sección No Verificados
  tags: string[];
  summary: string;
  contentMarkdown: string;
  attachmentName?: string;
}
```

### 2.3 `ExamChallenge` (Used by `ExamSimulatorLab.tsx`)
```ts
export interface ExamRubricItem {
  id: string;
  label: string;
  description: string;
  points: number;
  requiredPatterns: string[]; // Regex strings tested against student code
  hintIfMissing: string;
}

export interface ExamChallenge {
  id: string;
  year: number;               // 1 (Algoritmos 1 & 2) or 2 (Paradigmas & POO)
  subjectId: string;
  title: string;
  examType: '1er Parcial' | '2do Parcial' | 'Recuperatorio' | 'Final';
  yearLabel: string;
  durationMinutes: number;
  language: 'c' | 'funcional' | 'java'; // SQL is excluded
  passingScore: number;       // 60 out of 100
  examSheetVisual: {
    headerInstitution: string;
    headerSubject: string;
    instructions: string;
    diagramTitle: string;
    entitiesOrBoxes: {
      name: string;
      attributes: string[];
      relations?: string[];
    }[];
    tasks: string[];
  };
  starterCode: string;
  referenceSolution: string;
  rubric: ExamRubricItem[];
}
```

### 2.4 `ProfessorContact` (Used by `ProfessorDirectory.tsx`)
```ts
export interface ProfessorContact {
  id: string;
  subjectId: string;
  name: string;               // ONLY Professor Name
  email: string;              // ONLY Institutional Email
  role?: string;
}
```

### 2.5 `AuthSessionUser` & `AuthUserRecord`
```ts
export type UserRole = 'user' | 'admin';
export type AuthProviderType = 'username-only' | 'google' | 'apple';

export interface AuthSessionUser {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  provider: AuthProviderType;
  createdAt: string;
  integrityTag?: string;      // Anti-tampering signature verified by securityShield.ts
}
```
