# 02 — Design System & Warm Minimalist Dark Mode Aesthetic

## 1. Visual Philosophy

The platform follows an **Editorial Warm Minimalist Dark Mode** aesthetic:
- **No cold neon blues or slate grays (`slate-900`, `indigo-600`)**: Every background, card, border, and button uses warm espresso, roasted umber, sand gold, and parchment cream tones.
- **No bright white exam sheets**: Even the exam consigna in `<ExamSimulatorLab />` uses warm dark espresso surfaces (`#14110e`, `#1b1713`), while document miniature thumbnails and the right-hand `"Vista previa"` widget use a warm vintage parchment tone (`#efe5d4` to `#dfd1bc`) with dark espresso ink (`#231d17`).
- **Editorial Serif + Clean Sans-Serif + IDE Monospace**: Titles and section headers use `Playfair Display` (`.font-editorial`), body UI uses `Inter`, and code/compiler elements use `JetBrains Mono`.

---

## 2. Color Palette & Hex Tokens

> **The hex values below are the DEFAULT palette (Arena Dorada) and double as token names.** In code they are written as `k-<hex>` Tailwind classes backed by CSS variables so users can switch palettes at runtime (see `06_THEMING_SYSTEM.md`). Do not write raw hex in components.

| Token Role | Hex Value | Usage |
| :--- | :--- | :--- |
| **App Background (Primary)** | `#0e0c0a` | Root body background and deepest canvas |
| **Header / Sidebar Surface** | `#14110e` / `#13100d` | Left collapsible sidebar, top navbar, compiler header |
| **Card Surface (`.campus-surface`)** | `#171411` to `#12100d` | Main containers, widgets, modals, right-hand panels |
| **Elevated / Active Surface** | `#241f1a` / `#2c241d` | Active navigation items, selected filter pills, hover states |
| **Border Subtle** | `#26211c` / `#2b241d` | Default card and divider borders |
| **Border Accent** | `#d6b892` (30%–50% alpha) | Active card outlines, verified badges, primary focus rings |
| **Primary Accent (Sand Gold)** | `#d6b892` (hover `#e3c7a3`) | Primary CTA buttons, active icons, progress bars, highlights |
| **Secondary Accent (Warm Bronze)** | `#c8ab86` | Event badges, secondary highlights |
| **Text Primary (Warm Cream)** | `#f3ece2` | Main headings, document titles, active labels |
| **Text Secondary (Stone Cream)** | `#d8cfc4` / `#c8bcb0` | Body copy, descriptions, table cells |
| **Text Muted (Warm Taupe)** | `#9e9285` / `#8c7f72` | Timestamps, subtitles, inactive tabs, metadata |
| **Paper Miniature Surface** | `#efe5d4` → `#dfd1bc` | Document page thumbnails (`grid` & `detailed`) and live `Vista previa` sheet |

---

## 3. Typography (`index.html` & `tailwind.config.js`)

1. **Editorial Serif (`font-editorial` / `Playfair Display`)**:
   - Used on hero greetings (`Bienvenido de nuevo, alestte`), section titles (`Mis herramientas`, `Documentos destacados`, `Tu progreso académico`, `Vista previa`), note titles in `detailed` mode, and academic year headers.
2. **UI Sans-Serif (`font-sans` / `Inter`)**:
   - Used on navigation links, filter pills, descriptions, metadata, form controls, and tables.
3. **Code Monospace (`font-mono` / `JetBrains Mono`)**:
   - Used in `<ExamSimulatorLab />`, code snippets, file type badges (`PDF`, `C / TXT`, `JAVA`), timers, and SHA-256 security tags.

---

## 4. Custom CSS Utility Classes (`src/index.css`)

- `.font-editorial`: Sets `font-family: 'Playfair Display', Georgia, serif;`
- `.campus-bg`: Radial warm dark gradient (`#1e1915` at top-right to `#0e0c0a` base).
- `.campus-surface`: Linear gradient `180deg` from `rgba(28, 24, 20, 0.92)` to `rgba(20, 17, 14, 0.96)` with `1px solid rgba(214, 184, 146, 0.11)` border and deep shadow.
- `.campus-card`: Interactive card surface (`rgba(33, 28, 23, 0.88)`) with hover border `rgba(214, 184, 146, 0.28)`.
- `.campus-tool-card`: Warm bronze gradient (`145deg`, `rgba(62, 51, 41, 0.72)` to `rgba(31, 26, 21, 0.92)`) used for the 4 tool cards in `Inicio` and the 5 Academic Year cards.
- `.campus-hero-banner`: Hero welcome card gradient with right-side architectural SVG illustration of the UNNE FACENA building.
- `.campus-pill`: Pill button (`rgba(42, 35, 29, 0.85)`) with subtle sand-gold border.
- `.campus-input`: Dark espresso input (`rgba(20, 17, 14, 0.9)`) with sand-gold focus ring.

---

## 5. Layout Shell & Anti-Redundancy Rules

### 5.0 Soft Borders Rule (user preference)
Borders and divider lines must stay **subtle** (low contrast between blocks). Implemented globally in `src/index.css` (bottom of file):
- Default `border-color` for all elements is `rgb(var(--k-26211c) / 0.5)` (also covers plain `border` with no color class).
- Any element with a `border-k-*` class and no opacity modifier gets `--tw-border-opacity: 0.55`.
- `.campus-surface` / `.campus-card` borders are ~6% sand-gold; hover ~17%. Legacy `border-slate-*` and `border-indigo/emerald/amber-*` overrides are attenuated too.
- Accent borders with opacity modifiers use low values (`/15`–`/35`, e.g. `border-k-d6b892/20`). **Do not add strong borders** (`/50`+ or opaque light colors) to ordinary blocks; reserve stronger borders for the single active/selected item.

### 5.1 Left Collapsible Sidebar (`App.tsx`)
- Toggleable between **Expanded (`w-64`)** and **Minimized (`w-[72px]`)** via `leftSidebarExpanded`.
- Contains:
  1. **Brand Logo**: `✦ UNNE` (returns to `Inicio`).
  2. **5 Main Navigation Items**: `Inicio`, `Materias`, `Comunidad`, `Herramientas`, `Perfil`.
  3. **Contextual Year Subjects List**: Appears below the divider when `selectedYear !== null`, listing **only** the subjects of `selectedYear`, plus a `"Cambiar de Año"` button.
  4. **Bottom User Footer**: Avatar badge, `@username`, role label (`Admin` / `Alumno`), and logout button.

### 5.2 Top Header Bar (`App.tsx`)
- Displays:
  - Global search input (`Buscar materias, apuntes, herramientas...`) wired directly to `searchQuery`.
  - Quick navigation links (`Inicio`, `Materias`, `Comunidad`, `Herramientas`, `Perfil`).
  - Admin quick-switch button (`Panel Admin` / `Vista Usuario`) if logged in as `admin`.
  - Notification bell + User pill (`@alestte`).

### 5.3 Strict Anti-Redundancy Rule
- Because the left sidebar already lists the subjects of the active year (`subjectsOfSelectedYear`), **never** add duplicate subject selection blocks or horizontal subject pill bars inside:
  - `Inicio` (do not add a "Materias de 1° Año" block on the home screen)
  - `Materias` main header
  - `ProfessorDirectory.tsx`
  - `StudentTipsAndProfessors.tsx`
  - `PromoCalculatorAndChecklist.tsx`
