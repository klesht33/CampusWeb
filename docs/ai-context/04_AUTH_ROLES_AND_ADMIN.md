# 04 — Authentication, Roles & Admin Dashboard

## 1. Authentication Screen (`src/components/AuthLoginScreen.tsx`)

### 1.1 Supported Login / Registration Methods (`AuthProviderType`)
1. **`'username-only'` (Usuario sin correo electrónico)**:
   - Allows students or admins to create an account or sign in using **only a username** (e.g., `@alestte` or `@alumno_unne`) and password—**no email address is required**.
   - Includes a 1-click quick-access button: **`Entrar directo como @alestte (Usuario Normal)`** and **`Entrar directo como @admin_unne (Rol Admin)`**.
2. **`'google'` (Continuar con Google)**:
   - Interactive OAuth account-picker simulation allowing instant login with a university or personal Google account.
3. **`'apple'` (Continuar con Apple)**:
   - Interactive Apple ID login simulation (with privacy relay option).

### 1.2 Role Separation (`'user'` vs `'admin'`)
- **`'user'` (Rol Estudiante / Usuario Normal)**:
  - Default role. Accesses the full CampusLab platform (`Inicio`, `Materias` 1°–5° Año, `Compilador`, `Comunidad`, `Herramientas`, `Perfil`) without administrative mutation buttons.
- **`'admin'` (Rol Administrador)**:
  - Activated either via the quick Admin access button or by entering the admin secret code:
    - Accepted Admin Codes: `UNNE-ADMIN`, `ADMIN123`, or `FACENA2026`.
  - Grants access to:
    1. **`<AdminDashboard />`** (Full real-time telemetry and platform management panel).
    2. **Inline Admin Controls inside the User View**: Verify/Unverify any note (`toggleVerifyNote`), delete any note (`deleteNote`), add/remove subjects, and add/remove professor emails in `ProfessorDirectory.tsx`.
    3. **Top-bar View Switcher**: Instant toggle between **`Panel Admin`** and **`Vista Usuario Normal`**.

---

## 2. Admin Dashboard (`src/components/AdminDashboard.tsx`)

When an admin is in `adminModeView === 'admin-panel'`, `<AdminDashboard />` provides:

### 2.1 Real-Time Telemetry & User Metrics
- **Usuarios Activos Ahora (En Tiempo Real)**:
  - Live counter (with pause/resume toggle `'En Vivo'` / `'Pausado'`) simulating real-time WebSocket heartbeats of students connected across `1° Año` to `5° Año`.
- **Total de Usuarios Registrados**:
  - Tracks total registered accounts (`registeredUsers.length` + historical cohort baseline) and breakdown by authentication provider (`Sin correo @usuario`, `Google`, `Apple`).
- **Picos de Conexión en Tiempo Real (24h Hourly Bar Chart)**:
  - Interactive 24-slot bar chart (`00:00` to `23:00`) highlighting peak concurrent student connections (e.g., `19:00`–`22:00` pre-exam study peak) and the current hour in real time.
- **Feed de Actividad en Vivo**:
  - Real-time stream of student actions (downloads, compiler runs, note uploads, logins).

### 2.2 Global Publication Display Mode Switcher (`NoteDisplayMode`)
Admins can change the default publication view format for the entire platform in real time:
1. **`'grid'` — 1. Filas con Columnas (Cuadrícula con Miniatura)**: Multi-column cards with top page preview.
2. **`'detailed'` — 2. Solo Columnas (Tarjetas Horizontales)**: Single-column editorial cards with left `UNNE` cover, summary, save, and download.
3. **`'file-preview'` — 3. Vista Reducida (Solo Línea de Texto del Nombre)**: Compact single-line rows with file badge, document title, preview, and download.

### 2.3 Content Moderation & Subject Management
- **Gestión de Apuntes**: Search, filter, verify (`Verificado` ↔ `No Verificado`), or delete any publication, and create new verified official notes directly.
- **Gestión de Materias por Año**: Create or delete subjects in any year (`1°` to `5° Año`).
- **Auditoría de Seguridad (`SecurityAuditEvent[]`)**: View blocked XSS/SQLi payloads, failed login attempts, and session integrity checks.
