# AI_CONTEXT.md — Master Context & System Specification for AI Agents

> **PURPOSE OF THIS DOCUMENT**: This file and the `docs/ai-context/` directory provide a **100% decoupled, permanent technical context** of the **CampusLab UNNE (FACENA - LSI)** web application. Any AI coding assistant, LLM, or developer starting a new session should read this file first to understand the exact architecture, business rules, UI design system, data schemas, and non-negotiable user constraints without needing prior chat history.

---

## 1. Quick System Identity

- **Project Name**: CampusLab — Plataforma Académica Interactiva (Licenciatura en Sistemas de Información - FACENA - UNNE).
- **Project Root**: `c:\Users\cuent\Documents\UNNE\Clon\plataforma-web`
- **Stack**:
  - **Framework**: React 18 (`^18.3.1`) + TypeScript (`^5.5.3`)
  - **Bundler / Dev Server**: Vite 5 (`^5.4.2`, default port `http://localhost:5173/`)
  - **Styling**: Tailwind CSS (`^3.4.10`) + Custom CSS Design Tokens in `src/index.css`
  - **Icons**: `lucide-react` (`^0.441.0`)
  - **Persistence**: Client-side `localStorage` with cryptographic integrity signatures (`src/utils/securityShield.ts`)

---

## 2. Decoupled Context Index (`docs/ai-context/`)

Read the following modular files according to the task you are performing:

1. **[`docs/ai-context/01_ARCHITECTURE_AND_STATE.md`](./docs/ai-context/01_ARCHITECTURE_AND_STATE.md)**
   - File tree, application state machine in `src/App.tsx`, navigation flows, Year-First Isolation Rule, and `localStorage` keys.
2. **[`docs/ai-context/02_DESIGN_SYSTEM_AND_AESTHETIC.md`](./docs/ai-context/02_DESIGN_SYSTEM_AND_AESTHETIC.md)**
   - Warm Minimalist Dark Mode palette (`#0e0c0a`, `#171411`, `#d6b892`, `#f3ece2`), editorial serif (`Playfair Display`) + sans (`Inter`) + mono (`JetBrains Mono`) typography, custom CSS classes, and anti-redundancy layout rules.
3. **[`docs/ai-context/03_MODULES_AND_SECTIONS.md`](./docs/ai-context/03_MODULES_AND_SECTIONS.md)**
   - Detailed functional behavior of every section:
     - **3 Note View Formats** (`grid` Filas con Columnas, `detailed` Solo Columnas, `file-preview` Vista Reducida 1 línea) + Live Right-Hand Document Preview (`Vista previa`).
     - **2 Mandatory Note Sections** (`1. Apuntes Verificados` vs `2. Apuntes No Verificados`) + Parcial sub-filters (`1° Parcial`, `2° Parcial`, `Recuperatorio`).
     - **Interactive Exam Compiler (`ExamSimulatorLab.tsx`)** separated by year (`1° Año`: Algoritmos 1 & 2; `2° Año`: Paradigmas & POO; **NO SQL**) with real-time syntax highlighting for reserved words.
     - **Professor Directory (`ProfessorDirectory.tsx`)** containing **ONLY Professor Name + Institutional Email**.
     - **Collapsible Right Sidebar Widgets**, **Promo Calculator & Checklist**, **Correlatives Map**, and **Radar & Flashcards**.
4. **[`docs/ai-context/04_AUTH_ROLES_AND_ADMIN.md`](./docs/ai-context/04_AUTH_ROLES_AND_ADMIN.md)**
   - Login system (`username-only` without email, `Google`, `Apple`), role separation (`user` vs `admin`), real-time Admin Dashboard metrics (online users, registered users, 24h peak chart, live activity log), and global view mode control.
5. **[`docs/ai-context/05_SECURITY_AND_DATA_MODELS.md`](./docs/ai-context/05_SECURITY_AND_DATA_MODELS.md)**
   - All TypeScript interfaces (`Subject`, `StudyNote`, `ExamChallenge`, `ProfessorContact`, `AuthUserRecord`, `SecurityAuditEvent`, `NoteDisplayMode`) and the 5-layer security hardening in `src/utils/securityShield.ts`.

6. **[`docs/ai-context/06_THEMING_SYSTEM.md`](./docs/ai-context/06_THEMING_SYSTEM.md)**
   - User-selectable color palettes (section **Apariencia**): all UI colors are CSS-variable-backed `k-<hex>` Tailwind tokens; engine in `src/theme/palettes.ts`. **Read before touching any color/class.**

---

## 3. Non-Negotiable User Rules (CRITICAL CONSTRAINTS)

Any future modification **MUST** preserve these explicit user requirements:

1. **Workspace Isolation**:
   - All web application code lives strictly inside `c:\Users\cuent\Documents\UNNE\Clon\plataforma-web`.
   - **NEVER** read, move, modify, or use personal files located in the parent folder `c:\Users\cuent\Documents\UNNE\Clon` outside `plataforma-web`.
2. **Warm Minimalist Dark Mode Aesthetic**:
   - The entire platform uses a cohesive Warm Minimalist Dark theme (espresso/obsidian backgrounds `#0e0c0a` / `#171411`, sand-gold accents `#d6b892`, warm cream text `#f3ece2`, and `Playfair Display` serif titles). Avoid cold blue/slate (`slate-900` / `indigo-600`) or bright white backgrounds on new UI surfaces.
3. **No Redundant Subject Selectors**:
   - Inside a selected year (`Materias` / `Herramientas`), the **left sidebar already lists the subjects of that year**. Child components (`ProfessorDirectory`, `StudentTipsAndProfessors`, `PromoCalculatorAndChecklist`) **must not** render duplicate horizontal subject filter bars.
4. **Year-First Subject Isolation**:
   - When the user enters `Materias` and selects a year (`1° Año` to `5° Año`), **only** the subjects belonging to that selected year appear in the sidebar. To switch to another year's subjects, the user clicks **"Cambiar de Año"** (`handleBackToSelectYear`) to return to the year selector.
5. **Three Selectable Note Display Formats (`NoteDisplayMode`)**:
   - `'grid'` (**Filas y Columnas**): Multi-column grid of cards with top warm-paper page miniature (`PDF`, `C / TXT`, `JAVA`), title, likes `♡`, file size, and download.
   - `'detailed'` (**Solo Columnas**): Single-column stack of horizontal cards with a left `UNNE` cover miniature (`PDF • X pág.`), subject/category/verified pills, serif title, summary, author, `Guardar`, and `Descargar`.
   - `'file-preview'` (**Vista Reducida**): Single-line compact row showing only the file badge, verification icon, the single line of text with the document name, `Vista previa`, and `Descargar`.
   - **Never revert to the old Reddit-style vertical upvote/downvote left bar.**
6. **Verified vs. Unverified Notes Separation**:
   - Inside every subject's note feed, notes are strictly divided into:
     1. **Sección de Apuntes Verificados** (`verifiedByStudents === true`)
     2. **Sección de Apuntes No Verificados** (`verifiedByStudents === false`)
7. **Compiler Separated by Year (No SQL) + Colored Reserved Words**:
   - `1° Año`: Only **Algoritmos y Estructuras de Datos I** and **Algoritmos y Estructuras de Datos II** (C / Pseudocode).
   - `2° Año`: First **Paradigmas de Programación** (Functional) and second **Programación Orientada a Objetos (POO)** (Java).
   - **SQL is excluded** from the compiler.
   - Reserved words, data types, built-in functions, constants, and comments in the compiler editor must remain color-highlighted in real time.
8. **Simplified Professor Directory**:
   - Displays **ONLY the professor's name and email** (plus subject badge and copy/mailto actions). Consultation hours and email-writing tips are permanently removed.
9. **User-Selectable Color Palette (no hardcoded hex)**:
   - The **Apariencia** section lets users switch palettes (presets + custom hue/intensity/light-dark). Therefore all colors must use the `k-<hex>` tokens (e.g. `bg-k-14110e`), never `bg-[#14110e]` or raw hex in JSX/CSS. See `docs/ai-context/06_THEMING_SYSTEM.md`.

---

## 4. Environment & Build Commands (Windows PowerShell)

- **Shell constraint**: Windows PowerShell 5.1 does not support `&&` as a command separator and blocks `.ps1` wrappers (`npm.ps1`, `npx.ps1`). Always use `;` to chain commands and invoke `npm.cmd` / `npx.cmd`.
- **Start Dev Server**:
  ```powershell
  npm.cmd --prefix "c:\Users\cuent\Documents\UNNE\Clon\plataforma-web" run dev -- --open
  ```
- **Typecheck + Production Build**:
  ```powershell
  npx.cmd --prefix "c:\Users\cuent\Documents\UNNE\Clon\plataforma-web" tsc --noEmit -p "c:\Users\cuent\Documents\UNNE\Clon\plataforma-web\tsconfig.json"; npm.cmd --prefix "c:\Users\cuent\Documents\UNNE\Clon\plataforma-web" run build
  ```
