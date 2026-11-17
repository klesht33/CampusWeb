# 03 — Functional Specification of Modules & Sections

## 1. Note & Document System (`renderNoteCard` in `src/App.tsx`)

### 1.1 The 3 Mandatory View Formats (`NoteDisplayMode`)
The user (and Admin globally) can switch between 3 distinct layouts for ordering and viewing study notes, both in **`Inicio` ("Documentos destacados")** and inside **`Materias`**:

1. **`'grid'` — Filas con Columnas (Multi-Column Card Grid)**
   - **Container**: `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4`
   - **Card Anatomy**:
     - **Top Half (`h-32`)**: Warm parchment miniature (`#e9decb` → `#dfd2bc`) simulating a real printed page or code sheet, with a top-left file type badge (`PDF`, `C / TXT`, `JAVA`), top-right verification badge (`✓`), and miniature lines/preview text.
     - **Bottom Half**: Document title (`line-clamp-1`), subject name (`algoritmos-1`, etc.), and a footer with likes (`♡ {note.votes}`), estimated file size (`4 MB`, `12 KB`), and a quick download icon button.
2. **`'detailed'` — Solo Columnas (Single-Column Horizontal Editorial Cards)**
   - **Container**: `flex flex-col gap-3.5`
   - **Card Anatomy**:
     - **Left Cover Miniature (`w-28`)**: Vertical warm paper cover (`UNNE` header, simulated lines, or dark terminal miniature for code notes, with bottom pill `PDF • 18 pág.`).
     - **Center Body**: Top pill row (`Subject Name`, `Category`, `Parcial Instance`, `✓ Verificado` or `Pendiente`), `Playfair Display` serif title (`text-lg`), 2-line summary, and metadata footer (`Por @Author`, `♡ votes`, `createdAt`).
     - **Right Action Column**: Two pill buttons stacked/aligned on the right: **`🔖 Guardar`** (`toggleSaveNote`) and **`⬇ Descargar`** (`handleDownloadNoteFile`), plus Admin verify/delete buttons when `isAdmin` is active.
3. **`'file-preview'` — Vista Reducida (Single-Line Compact List)**
   - **Container**: `flex flex-col gap-2`
   - **Row Anatomy**:
     - Single horizontal line (`px-4 py-2.5`) containing only: File type badge (`PDF` / `C / TXT` / `JAVA`), verification indicator (`✓`), **the single line of text with the document title** (`truncate`), subtle subject label, and right-aligned **`Vista previa`** + **`⬇ Descargar`** buttons.

### 1.2 Live Right-Hand Document Preview (`Vista previa`)
- Rendered in the right column of both **`Inicio`** and **`Materias`**.
- Clicking any note card in `'grid'`, `'detailed'`, or `'file-preview'` sets `previewNoteId(note.id)`.
- Shows:
  - Header: `Vista previa` | `← 1 / N →` | **`Abrir en visor ↗`** (opens the full modal viewer `selectedNoteModal`).
  - Warm parchment sheet (`#efe5d4` → `#dfd1bc`) displaying the institution header, note title, summary, and a monospace excerpt of `note.contentMarkdown`.
  - Footer buttons: **`Descargar documento`** and **`🔖 Guardar`**.

### 1.3 Mandatory 2-Section Verification Split in `Materias`
Inside any subject or year note feed (`topView === 'apuntes-flow'`), notes are separated into two explicit sections:
1. **`1. Apuntes Verificados`** (`note.verifiedByStudents === true`): Reviewed notes and exam solutions that passed with an approved grade.
2. **`2. Apuntes No Verificados`** (`note.verifiedByStudents === false`): Student-uploaded notes pending verification.
- Users can filter via the top bar: `Ver Ambas`, `Verificados`, or `No Verificados`.
- When viewing `General`, `Parcial Teórico`, or `Parcial Práctico`, a secondary filter bar allows filtering by exam instance: **`Todos`**, **`1er Parcial` (`1° Parcial`)**, **`2do Parcial` (`2° Parcial`)**, or **`Recuperatorio`**.

---

## 2. Interactive Exam Compiler (`src/components/ExamSimulatorLab.tsx`)

### 2.1 Strict Year & Subject Separation (No SQL)
The compiler filters `INITIAL_EXAMS` by `selectedYear`:
- **`1° Año`**:
  1. **Algoritmos y Estructuras de Datos I** (`algoritmos-1`): Vectors, averages, and binary search in C / Pseudocode.
  2. **Algoritmos y Estructuras de Datos II** (`algoritmos-2`): Self-referential `struct Nodo`, dynamic pointers (`malloc`), and linked list traversal in C.
- **`2° Año`** (Strictly in this order):
  1. **Paradigmas de Programación** (`paradigmas`): Pure functions and higher-order functions (`filter`, `map`, `reduce`).
  2. **Programación Orientada a Objetos (POO)** (`paradigmas-poo`): Encapsulation, classes (`Empleado`, `Laboratorio`), constructors, and `ArrayList` in Java.
- **`3° a 5° Año`**: Displays a prompt to switch to `1° Año` or `2° Año` (`onBackToSelectYear`).
- **SQL is strictly excluded** from the compiler.

### 2.2 Real-Time Syntax Highlighting for Reserved Words (`renderHighlightedCode`)
The compiler editor uses a synchronized dual-layer overlay (`<pre aria-hidden="true">` underneath + transparent-text `<textarea>` with visible caret on top + synchronized line-number gutter on the left):
- **Control & Structure Reserved Words (`#f0a45d` Amber Gold)**:
  - C/Java/JS: `if`, `else`, `while`, `for`, `do`, `switch`, `case`, `default`, `break`, `continue`, `return`, `sizeof`, `typedef`, `struct`, `class`, `interface`, `abstract`, `extends`, `implements`, `public`, `private`, `protected`, `static`, `final`, `const`, `let`, `var`, `function`, `new`, `this`, `super`, `import`, `package`, `try`, `catch`, `finally`, `throw`, `throws`.
  - UNNE Pseudocode: `Accion`, `Es`, `Ambiente`, `Proceso`, `Fin_Accion`, `Si`, `Entonces`, `Sino`, `Fin_Si`, `Mientras`, `Hacer`, `Fin_Mientras`, `Para`, `Hasta`, `Fin_Para`, `Segun`, `Fin_Segun`, `Funcion`, `Fin_Funcion`, `Procedimiento`, `Fin_Procedimiento`, `Registro`, `Fin_Registro`, `Nuevo`, `Disponer`, `Escribir`, `Leer`, `MOD`, `DIV`, `Y`, `O`, `NO`.
- **Data Types & Classes (`#78c5d6` Cyan Turquoise)**:
  - `int`, `float`, `double`, `char`, `void`, `bool`, `boolean`, `long`, `short`, `unsigned`, `String`, `ArrayList`, `List`, `Map`, `HashMap`, `Set`, `Nodo`, `Empleado`, `Laboratorio`, `Alumno`, `Entero`, `Real`, `Alfanumerico`, `Logico`, `Puntero`.
- **Built-in & Higher-Order Functions (`#c59bf0` Warm Lavender)**:
  - `malloc`, `calloc`, `realloc`, `free`, `printf`, `scanf`, `fopen`, `fclose`, `filter`, `map`, `reduce`, `forEach`, `find`, `add`, `get`, `size`, `println`.
- **Preprocessor Directives & Annotations (`#e58a67` Terracotta)**:
  - `#include`, `#define`, `@Override`.
- **Constants, Booleans & Numbers**:
  - `NULL`, `NIL`, `null`, `true`, `false`, `Verdadero`, `Falso` in `#e07a88` (Soft Coral); numeric literals in `#98c992` (Sage Green).
- **Comments & Strings**:
  - `// ...` comments in `#7d7063` italic; string literals in `#b8d49c`.
- Also supports `Tab` key indentation (4 spaces), a 90/120-minute countdown timer, custom exam sheet image upload, rubric evaluation (60/100 points to pass), and syntax-highlighted side-by-side comparison (`Tu Código` vs `Solución Oficial de Cátedra`).

---

## 3. Simplified Professor Directory (`src/components/ProfessorDirectory.tsx`)

- **Strict User Requirement**: Shows **ONLY the professor's full name and institutional email** (`c.name` and `c.email`), grouped/filtered by the subject selected in the left sidebar.
- **Removed Elements**: Consultation hours (`horarios de consulta`), office locations, and email writing tips (`consejos para redactar correos`) were permanently removed per user request.
- **Actions**:
  - One-click **Copiar correo** button (copies `c.email` to clipboard).
  - Direct **`mailto:`** link button.
  - Search input by professor name or email.
  - **Admin CRUD**: When `isAdmin` is true, allows adding a new professor (`name` + `email` + `subjectId`) or deleting an entry.

---

## 4. Other Academic Tools & Right Sidebar Widgets

0. **Collapsible side panels (`src/components/CollapsibleCard.tsx`)** — user requirement: side windows must be minimizable/expandable to avoid an overloaded screen.
   - `CollapsibleCard` is a *controlled* component (`open`, `onToggle`, `title`, `icon`, optional `action` shown only when open, optional `collapsedHint` shown only when minimized). Animated with `grid-template-rows` (0fr ↔ 1fr). Header click or chevron toggles.
   - State lives in `App.tsx` (`panelsOpen`, `isPanelOpen`, `togglePanel`, `setPanelsGroup`) persisted in `localStorage['campus_unne_panels_v1']`. Panel ids: `inicio-academico`, `inicio-accesos`, `inicio-preview`, `inicio-progreso`, `inicio-eventos`, `materias-preview`.
   - Defaults: `Tu progreso académico`, `Accesos rápidos`, `Vista previa` open; `Tu progreso` and `Próximos eventos` minimized.
   - `Inicio` right column has a **Paneles laterales → Minimizar todo / Expandir todo** control; the `Materias` right aside master toggle also includes `materias-preview` (plus the existing compiler/emails/professors/tips widgets, which keep their own `right*Open` state).
   - **Any new side panel must use `CollapsibleCard`.**

1. **Collapsible Right Sidebar Widgets (`App.tsx`)**:
   - Contains a master toggle (**`Minimizar todo` / `Expandir todo`**) plus individual collapse toggles for:
     - `Compilador (1° / 2° Año)` (`rightCompilerOpen`)
     - `Correos de Profesores` (`rightEmailsOpen`) — shows only Name and Email
     - `Recomendaciones Profesores` (`rightProfsOpen`)
     - `Tips de Alumnos` (`rightTipsOpen`)
2. **`StudentTipsAndProfessors.tsx`**:
   - Dual-mode component (`mode="professors"` or `mode="tips"`). Displays clarity ratings (`1..5`), difficulty ratings, exam style tags, and student advice for the active subject.
3. **`PromoCalculatorAndChecklist.tsx`**:
   - Calculates average grade from `1° Parcial`, `2° Parcial`, and ` Prácticos` to determine **Promoción Directa**, **Regular**, or **Libre / Recuperatorio**, paired with an interactive pre-exam topic checklist.
4. **`CorrelativesMap.tsx`**:
   - Visualizes all subjects across the 5 years, checks whether prerequisites (`regularizedPrereqs`, `approvedPrereqs`) are met, and lets students toggle each subject between `Pendiente`, `Regular`, and `Aprobada`.
5. **`RadarAndFlashcards.tsx`**:
   - Displays high-frequency exam topics (with probability % and appearances count) and flip-card flashcards for active recall.
