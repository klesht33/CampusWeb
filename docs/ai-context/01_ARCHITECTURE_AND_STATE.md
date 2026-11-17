# 01 — Architecture, File Structure & State Machine

## 1. Repository File Structure

```text
plataforma-web/
├── AI_CONTEXT.md                          # Master AI entrypoint & rules
├── index.html                             # Google Fonts (Playfair Display, Inter, JetBrains Mono) + root mount
├── package.json                           # React 18, Vite 5, Tailwind CSS 3, lucide-react
├── tailwind.config.js                     # Custom font families (sans, editorial, mono) & theme extensions
├── tsconfig.json                          # Strict TypeScript configuration
├── docs/
│   └── ai-context/
│       ├── 01_ARCHITECTURE_AND_STATE.md   # (This file) Architecture, routing & state machine
│       ├── 02_DESIGN_SYSTEM_AND_AESTHETIC.md
│       ├── 03_MODULES_AND_SECTIONS.md
│       ├── 04_AUTH_ROLES_AND_ADMIN.md
│       └── 05_SECURITY_AND_DATA_MODELS.md
└── src/
    ├── main.tsx                           # React DOM root mounting <App />
    ├── index.css                          # Warm Minimalist Dark Mode CSS variables & component utility classes
    ├── App.tsx                            # Main application controller, layout shell, navigation & note feeds
    ├── data/
    │   └── mockDatabase.ts                # Core TypeScript interfaces + seed data (1°-5° Año subjects, notes, exams, contacts)
    ├── utils/
    │   └── securityShield.ts              # SHA-256 hashing, session signature, rate limiting, Anti-XSS/SQLi, file validator
    └── components/
        ├── AuthLoginScreen.tsx            # Login / Registration (Username-only, Google, Apple) + Role selector (User/Admin)
        ├── AdminDashboard.tsx             # Real-time Admin telemetry, global NoteDisplayMode switcher, CRUD & security log
        ├── ExamSimulatorLab.tsx           # Year-separated Exam Compiler (1° Alg 1/2, 2° Paradigmas/POO) + real-time syntax highlighting
        ├── ProfessorDirectory.tsx         # Professor email directory (strictly Name + Email only)
        ├── StudentTipsAndProfessors.tsx   # Professor clarity/difficulty reviews & student tips
        ├── PromoCalculatorAndChecklist.tsx# UNNE promotion grade calculator & interactive exam checklist
        ├── CorrelativesMap.tsx            # Interactive curriculum correlativity tree (Regular / Aprobada / Pendiente)
        └── RadarAndFlashcards.tsx         # Frequent exam question radar & active-recall flashcards
```

---

## 2. Application State Machine (`src/App.tsx`)

`App.tsx` acts as the single-page application router and state coordinator. Below are the primary state variables and how they interact:

### 2.1 Authentication & Role State
- `currentUser: AuthSessionUser | null`:
  - Loaded on startup from `localStorage.getItem('campus_unne_auth_session_v2')` and verified via `verifySessionIntegrity()` (`src/utils/securityShield.ts`).
  - If `null`, `<App />` renders `<AuthLoginScreen />` exclusively.
- `registeredUsers: AuthUserRecord[]`:
  - Persisted in `localStorage['campus_unne_registered_users_v2']`.
- `adminModeView: 'admin-panel' | 'user-view'`:
  - Available when `currentUser.role === 'admin'`. Controls whether the admin sees `<AdminDashboard />` or the regular student interface.
- `adminPreviewingAsUser: boolean`:
  - Allows an admin to inspect the student view with an top banner button to return to the Admin Dashboard.
- `effectiveIsAdmin: boolean`:
  - Computed as `Boolean(currentUser?.role === 'admin' && !adminPreviewingAsUser)`.

### 2.2 Top-Level Navigation State
- `mainNavSection: 'inicio' | 'materias' | 'profesores' | 'calendario' | 'comunidad' | 'herramientas' | 'perfil' | 'apariencia'`:
  - Controlled by the Left Sidebar (`Inicio`, `Materias`, `Correos Profesores`, `Calendario`, `Comunidad`, `Herramientas`, `Perfil`, `Apariencia`).
  - **`'inicio'`**: Renders the Warm Minimalist Dark Dashboard (Hero welcome card, "Mis herramientas" 4-card grid, "Documentos destacados / Para vos" note feed with the 3 view modes, "Tu progreso académico", and right-hand column with "Accesos rápidos", live "Vista previa", "Tu progreso" 72% ring, and "Próximos eventos").
  - **`'profesores'`**: Renders `<ProfessorDirectory />` across all 5 years with year/subject filter pills and search.
  - **`'calendario'`**: Renders `<AcademicCalendar />` (`src/components/AcademicCalendar.tsx` + `src/data/academicCalendar.ts`) with interactive monthly calendar grid, official final exam dates, and custom exam/TP events persisted in `localStorage['campus_unne_calendar_v1']`.
  - **`'perfil'`**: Renders account summary, SHA-256 security status, and the 3-way `NoteDisplayMode` preference selector.
  - **`'apariencia'`**: Renders `<ThemePaletteSection />` (`src/components/ThemePaletteSection.tsx`) for live color palette switching.
  - **`'materias'` | `'comunidad'` | `'herramientas'`**: Uses the Year-First Isolation flow described below. Clicking `"Materias"`, `"Ver mis materias"`, or any subject in the left sidebar always resets `topView` to `'apuntes-flow'`.

### 2.3 Year-First & Subject-Selection Isolation State (`selectedYear`, `selectedSubjectId`, `needsSubjectSelection`)
- `selectedYear: number | null`:
  - When `selectedYear === null` (and `mainNavSection` is `'materias'`, `'comunidad'`, or `'herramientas'`), `<App />` renders **Pantalla 1: Selección de Año (`1° Año` a `5° Año`)** showing the 5 academic year cards.
  - When the user clicks a year (`handleSelectYear(year)`), `selectedYear` is set to `1..5`, `selectedSubjectId` resets to `'all'`, `needsSubjectSelection` becomes `true`, and `topView` sets to `'apuntes-flow'`.
  - When `selectedYear !== null && mainNavSection === 'materias' && topView === 'apuntes-flow' && needsSubjectSelection && searchQuery.trim() === ''`, `<App />` renders **Pantalla 2: Selección de Materia (`selectedYear`° Año)** organized by `1° Cuatrimestre` / `2° Cuatrimestre` with cards per subject so notes are never mixed together by default.
  - `subjectsOfSelectedYear` is computed as `subjects.filter(s => s.year === selectedYear)`.
  - **Strict Isolation Rule**: Inside the left sidebar and subject views, **only** `subjectsOfSelectedYear` are displayed. To see subjects from another year, the user clicks **"Cambiar de Año"** (`handleBackToSelectYear`), which sets `selectedYear(null)`. To switch subjects within the year, the user clicks **"Cambiar de Materia"** (`handleBackToSelectSubject`) or selects a subject from the sidebar (`handleSelectSubject`).
- `selectedSubjectId: string | 'all'`:
  - Filters notes, compiler challenges, professor emails, tips, flashcards, and checklists to the chosen subject within `selectedYear` (or `'all'` subjects of that year).

### 2.4 Sub-View Routing Inside a Selected Year (`topView`)
- `topView: TopToolView` controls which main module renders in the central column when `selectedYear !== null`:
  - `'apuntes-flow'`: Note & Exam feed (`General`, `Parcial Teórico`, `Parcial Práctico`, `Finales`, `Exámenes Libres`, `Proyectos`, `Comunidad`, `Ranking`).
  - `'simulator'`: `<ExamSimulatorLab />` (Interactive Exam Compiler for 1° and 2° Año).
  - `'professor-emails-view'`: `<ProfessorDirectory />` (Professor Name, Subject & Email).
  - `'calendar-view'`: `<AcademicCalendar />` (Interactive monthly calendar & custom events).
  - `'professors-view'`: `<StudentTipsAndProfessors mode="professors" />`.
  - `'student-tips-view'`: `<StudentTipsAndProfessors mode="tips" />`.
  - `'calculator-checklist-view'`: `<PromoCalculatorAndChecklist />`.
  - `'correlatives'`: `<CorrelativesMap />`.
  - `'radar'`: `<RadarAndFlashcards />`.

### 2.5 Note Filtering & Display Mode State
- `activeSubTab: NoteCategory | 'General' | 'Comunidad' | 'Ranking'`:
  - Filters the category of notes shown in `'apuntes-flow'`.
- `parcialInstanceFilter: 'Todos' | '1° Parcial' | '2° Parcial' | 'Recuperatorio'`:
  - Sub-filter pill bar that appears automatically when `activeSubTab` is `'General'`, `'Parcial Teórico'`, or `'Parcial Práctico'`.
- `verificationFilter: 'both' | 'only-verified' | 'only-unverified'`:
  - Controls whether the user views both sections (`1. Apuntes Verificados` and `2. Apuntes No Verificados`) or isolates one.
- `noteDisplayMode: NoteDisplayMode` (`'grid' | 'detailed' | 'file-preview'`):
  - Persisted in `localStorage['campus_unne_note_display_mode_v1']`.
  - Controls how `renderNoteCard()` renders every note card across `Inicio` and `Materias`:
    1. `'grid'`: **Filas y Columnas** (Multi-column grid with top warm paper preview).
    2. `'detailed'`: **Solo Columnas** (Single-column horizontal editorial cards with left `UNNE` page cover).
    3. `'file-preview'`: **Vista Reducida** (Single-line compact row with only file badge, title text, preview, and download).
- `previewNoteId: string`:
  - ID of the note currently displayed in the right-hand **"Vista previa"** paper widget. Clicking any note card in any view mode updates `previewNoteId`.
- `savedNoteIds: string[]`:
  - Persisted in `localStorage['campus_unne_saved_notes_v1']`. Tracks bookmarked notes for the `Guardados` tab.

---

## 3. `localStorage` Persistence Keys Reference

| Key | Type | Description |
| :--- | :--- | :--- |
| `campus_unne_subjects_v3` | `Subject[]` | All subjects across years 1 to 5 |
| `campus_unne_notes_v3` | `StudyNote[]` | All verified and unverified study notes |
| `campus_unne_status_v3` | `Record<string, SubjectStatus>` | Student progress (`pendiente`, `regular`, `aprobada`) |
| `campus_unne_votes_v3` | `Record<string, 'up' \| 'down'>` | User likes/votes per note ID |
| `campus_unne_contacts_v3` | `ProfessorContact[]` | Professor names & emails |
| `campus_unne_auth_session_v2` | `AuthSessionUser` | Active user session signed with `integrityTag` |
| `campus_unne_registered_users_v2` | `AuthUserRecord[]` | Registered accounts with SHA-256 password hashes |
| `campus_unne_note_display_mode_v1` | `'grid' \| 'detailed' \| 'file-preview'` | Selected note layout format |
| `campus_unne_saved_notes_v1` | `string[]` | Array of bookmarked note IDs |
| `campus_unne_security_audit_v1` | `SecurityAuditEvent[]` | Security audit log for Admin Dashboard |
| `campus_unne_login_guard_v1` | `RateLimitState` | Anti-brute-force login attempt counter |
| `campus_unne_theme_v1` | `StoredTheme` | Selected color palette (`presetId` + custom hue/sat/mode) |

> `mainNavSection` also includes `'apariencia'` (palette selector, `ThemePaletteSection.tsx`). New files: `src/theme/palettes.ts`, `src/theme/baseColors.ts`, `src/components/ThemePaletteSection.tsx`.
