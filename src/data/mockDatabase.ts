import { UNNE_README_NOTES } from './unneReadmeNotes';

export interface Subject {
  id: string;
  code: string;
  name: string;
  year: 1 | 2 | 3 | 4 | 5;
  semester: 1 | 2;
  hasCompiler?: boolean;
  correlativesForRegular: string[];
  correlativesForApproved: string[];
  difficulty: number;
  promotionAvailable: boolean;
  nextExamDates: string[];
  topTopics: { topic: string; frequency: number; tip: string }[];
  professorTips: { author: string; text: string; votes: number }[];
}

export type NoteCategory =
  | 'Teoría y Apuntes'
  | 'Práctica y TPs'
  | 'Parcial Práctico'
  | 'Parcial Teórico'
  | 'Proyectos'
  | 'Finales'
  | 'Exámenes Libres'
  | 'Bibliografía y Libros';

export const NOTE_CATEGORIES: NoteCategory[] = [
  'Teoría y Apuntes',
  'Práctica y TPs',
  'Parcial Práctico',
  'Parcial Teórico',
  'Proyectos',
  'Finales',
  'Exámenes Libres',
  'Bibliografía y Libros',
];

export type ParcialInstance =
  | '1° Parcial'
  | '2° Parcial'
  | '3° Parcial'
  | 'Recuperatorio';

export const PARCIAL_INSTANCES: ParcialInstance[] = [
  '1° Parcial',
  '2° Parcial',
  '3° Parcial',
  'Recuperatorio',
];

export interface StudyNote {
  id: string;
  title: string;
  subjectId: string;
  category: NoteCategory;
  parcialInstance?: ParcialInstance;
  author: string;
  createdAt: string;
  votes: number;
  verifiedByStudents: boolean;
  tags: string[];
  summary: string;
  contentMarkdown: string;
  linkedExamId?: string;
  externalFileUrl?: string;
  folderPath?: string;
  fileExt?: string;
  fileSizeBytes?: number;
  isArchiveBase?: boolean;
}

export interface ProfessorRecommendation {
  id: string;
  professorName: string;
  roleOrCommission: string;
  subjectId: string;
  examFocus: string;
  recommendationText: string;
  clarityRating: number;
  strictnessRating: number;
  author: string;
  createdAt: string;
  votes: number;
}

export interface StudentTipItem {
  id: string;
  subjectId: string;
  tipCategory: 'Parciales' | 'Final Oral' | 'Cursada y TPs' | 'Examen Libre';
  title: string;
  content: string;
  author: string;
  createdAt: string;
  votes: number;
}

export interface ProfessorContact {
  id: string;
  name: string;
  subjectId: string;
  email: string;
}

export interface SubjectChecklist {
  subjectId: string;
  minGradeRegular: number;
  minAveragePromo: number;
  minEveryExamPromo: number;
  items: {
    id: string;
    instance: '1° Parcial' | '2° Parcial' | 'Final';
    label: string;
    critical: boolean;
  }[];
}

export interface RubricCriterion {
  id: string;
  label: string;
  description: string;
  points: number;
  requiredPatterns: string[];
  hintIfMissing: string;
}

export interface ExamChallenge {
  id: string;
  year: 1 | 2 | 3 | 4 | 5;
  subjectId: string;
  title: string;
  examType: '1er Parcial' | '2do Parcial' | 'Recuperatorio' | 'Final Libre';
  yearLabel: string;
  durationMinutes: number;
  language: 'c' | 'funcional' | 'java';
  passingScore: number;
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
    customImageUrl?: string;
  };
  starterCode: string;
  referenceSolution: string;
  rubric: RubricCriterion[];
}

export interface Flashcard {
  id: string;
  subjectId: string;
  topic: string;
  question: string;
  answer: string;
  connectedConcepts: string[];
}

export const INITIAL_SUBJECTS: Subject[] = [
  // ==========================================
  // 1° AÑO (Plan 2023 / 2009 — UNNE LSI)
  // ==========================================
  {
    id: 'algoritmos-1',
    code: 'LSI-101',
    name: 'Algoritmos y Estructuras de Datos I',
    year: 1,
    semester: 1,
    hasCompiler: true,
    correlativesForRegular: [],
    correlativesForApproved: [],
    difficulty: 3.5,
    promotionAvailable: true,
    nextExamDates: ['2026-11-24', '2026-12-15', '2027-02-18'],
    topTopics: [
      { topic: 'Estructuras Secuenciales, Condicionales, Ciclos y Corte de Control', frequency: 95, tip: 'Inicializar siempre los acumuladores parciales dentro del ciclo externo.' },
      { topic: 'Arreglos Unidimensionales, Ordenamiento y Búsqueda Binaria', frequency: 92, tip: 'En el 2do parcial siempre piden trazar el código paso a paso.' },
    ],
    professorTips: [
      { author: '@matias_lsi', text: 'Para promocionar practicá con los parciales de años anteriores; suelen repetir la estructura del ejercicio de corte de control.', votes: 42 },
    ],
  },
  {
    id: 'algebra',
    code: 'LSI-102',
    name: 'Álgebra',
    year: 1,
    semester: 1,
    hasCompiler: false,
    correlativesForRegular: [],
    correlativesForApproved: [],
    difficulty: 3.4,
    promotionAvailable: true,
    nextExamDates: ['2026-11-28', '2026-12-19'],
    topTopics: [
      { topic: 'Matrices, Determinantes, Sistemas de Ecuaciones y Gauss-Jordan', frequency: 94, tip: 'Verificar siempre el rango de la matriz ampliada para clasificar el sistema.' },
      { topic: 'Espacios Vectoriales, Vectores en R²/R³ y Transformaciones Lineales', frequency: 88, tip: 'Comprobar independencia lineal planteando combinación nula.' },
    ],
    professorTips: [
      { author: '@carla_exactas', text: 'Repasar los modelos de parciales viejos de Álgebra: la estructura de ejercicios se repite bastante.', votes: 29 },
    ],
  },
  {
    id: 'algoritmos-2',
    code: 'LSI-103',
    name: 'Algoritmos y Estructuras de Datos II',
    year: 1,
    semester: 2,
    hasCompiler: true,
    correlativesForRegular: ['algoritmos-1'],
    correlativesForApproved: [],
    difficulty: 4.1,
    promotionAvailable: true,
    nextExamDates: ['2026-11-26', '2026-12-17', '2027-02-20'],
    topTopics: [
      { topic: 'Punteros, Gestión Dinámica de Memoria y Listas Enlazadas', frequency: 96, tip: 'Cuidado con perder la referencia al nodo cabecera (head) al insertar al principio.' },
      { topic: 'Pilas, Colas, Recursividad y Árboles Binarios de Búsqueda (ABB)', frequency: 90, tip: 'Siempre verificá el caso base (nodo == NULL) en los recorridos recursivos.' },
    ],
    professorTips: [
      { author: '@sofi_dev', text: 'En el parcial práctico te hacen programar inserción ordenada y eliminación en una lista doblemente enlazada.', votes: 54 },
    ],
  },
  {
    id: 'logica-computacional',
    code: 'LSI-104',
    name: 'Lógica y Matemática Computacional',
    year: 1,
    semester: 2,
    hasCompiler: false,
    correlativesForRegular: ['algebra'],
    correlativesForApproved: [],
    difficulty: 3.6,
    promotionAvailable: true,
    nextExamDates: ['2026-11-29', '2026-12-20'],
    topTopics: [
      { topic: 'Lógica Proposicional, Deducción Natural y Álgebra de Boole', frequency: 93, tip: 'Usar leyes lógicas (De Morgan, Condicional) con justificación explícita.' },
      { topic: 'Relaciones, Funciones, Grafos y Principio de Inducción Matemática', frequency: 87, tip: 'Marcar explícitamente paso base e hipótesis inductiva.' },
    ],
    professorTips: [
      { author: '@valen_lsi', text: 'Tener resumidas las equivalencias lógicas y propiedades de relaciones de equivalencia/orden.', votes: 31 },
    ],
  },
  {
    id: 'sistemas-organizaciones',
    code: 'LSI-105',
    name: 'Sistemas y Organizaciones',
    year: 1,
    semester: 2,
    hasCompiler: false,
    correlativesForRegular: [],
    correlativesForApproved: [],
    difficulty: 2.8,
    promotionAvailable: true,
    nextExamDates: ['2026-12-01', '2026-12-18'],
    topTopics: [
      { topic: 'Teoría General de Sistemas, Organigramas y Procesos Organizacionales', frequency: 90, tip: 'Distinguir bien sistemas abiertos, retroalimentación y niveles gerenciales.' },
      { topic: 'Sistemas de Información, Toma de Decisiones y Flujos Administrativos', frequency: 85, tip: 'Leer toda la bibliografía obligatoria de cada módulo.' },
    ],
    professorTips: [
      { author: '@lucho_lsi', text: 'La lectura de los módulos y ejemplos de empresas reales suma muchísimo en los prácticos.', votes: 22 },
    ],
  },

  // ==========================================
  // 2° AÑO (Plan 2023 / 2009 — UNNE LSI)
  // ==========================================
  {
    id: 'paradigmas',
    code: 'LSI-201',
    name: 'Paradigmas y Lenguajes',
    year: 2,
    semester: 1,
    hasCompiler: true,
    correlativesForRegular: ['algoritmos-2'],
    correlativesForApproved: ['algoritmos-1'],
    difficulty: 3.9,
    promotionAvailable: true,
    nextExamDates: ['2026-11-25', '2026-12-16', '2027-02-19'],
    topTopics: [
      { topic: 'Paradigma Funcional (Common Lisp / Haskell): Inmutabilidad, Recursión y Orden Superior', frequency: 95, tip: 'Evitá usar variables mutables; resolvé todo componiendo funciones.' },
      { topic: 'Paradigma Lógico (Prolog): Hechos, Reglas, Unificación y Backtracking', frequency: 89, tip: 'Asegurate de que todos los predicados manejen correctamente el corte (!).' },
    ],
    professorTips: [
      { author: '@rami_func', text: 'En el parcial de Funcional usar mapcar/filter/reduce y recursión limpia suma todos los puntos de expresividad.', votes: 63 },
    ],
  },
  {
    id: 'arquitectura',
    code: 'LSI-202',
    name: 'Arquitectura y Organización de Computadoras',
    year: 2,
    semester: 1,
    hasCompiler: false,
    correlativesForRegular: ['logica-computacional', 'algoritmos-1'],
    correlativesForApproved: ['logica-computacional'],
    difficulty: 3.7,
    promotionAvailable: false,
    nextExamDates: ['2026-11-26', '2026-12-17'],
    topTopics: [
      { topic: 'Ciclo de Instrucción, Registros CPU, Assembler y Representación Numérica (IEEE 754)', frequency: 92, tip: 'Dominar PC, IR, MAR, MBR, Complemento a 2 y punto flotante.' },
      { topic: 'Álgebra de Boole, Compuertas Lógicas y Mapas de Karnaugh', frequency: 88, tip: 'Simplificar agrupando potencias de 2 antes de dibujar el circuito.' },
    ],
    professorTips: [
      { author: '@nico_unne', text: 'El libro de Morris Mano y las prácticas de IEEE 754 + Assembler son clave para aprobar el primer parcial.', votes: 35 },
    ],
  },
  {
    id: 'calculo',
    code: 'LSI-203',
    name: 'Cálculo Diferencial e Integral',
    year: 2,
    semester: 1,
    hasCompiler: false,
    correlativesForRegular: ['logica-computacional', 'algebra'],
    correlativesForApproved: ['algebra', 'logica-computacional'],
    difficulty: 4.4,
    promotionAvailable: true,
    nextExamDates: ['2026-11-27', '2026-12-18', '2027-02-21'],
    topTopics: [
      { topic: 'Límites, Continuidad, Derivadas y Teoremas del Cálculo (Rolle, Lagrange)', frequency: 96, tip: 'Practicar demostraciones teóricas 2025/2026 junto con estudio completo de funciones.' },
      { topic: 'Integrales Indefinidas/Definidas, Áreas y Series Numéricas', frequency: 92, tip: 'Usar las tablas de propiedades y repasar criterios de convergencia.' },
    ],
    professorTips: [
      { author: '@tobi_unne', text: 'Hacer todas las guías prácticas y repasar las demostraciones paso a paso antes del examen.', votes: 58 },
    ],
  },
  {
    id: 'paradigmas-poo',
    code: 'LSI-204',
    name: 'Programación Orientada a Objetos (POO)',
    year: 2,
    semester: 2,
    hasCompiler: true,
    correlativesForRegular: ['paradigmas', 'algoritmos-2'],
    correlativesForApproved: ['algoritmos-1'],
    difficulty: 4.0,
    promotionAvailable: true,
    nextExamDates: ['2026-11-27', '2026-12-18', '2027-02-22'],
    topTopics: [
      { topic: 'Herencia, Polimorfismo y Clases Abstractas', frequency: 96, tip: 'Nunca uses if/instanceof para resolver lo que debe hacerse con métodos polimórficos.' },
      { topic: 'Encapsulamiento, Colecciones (ArrayList) y Diagramas UML a Java', frequency: 89, tip: 'Todos los atributos privados y lógica dentro de la entidad correspondiente.' },
    ],
    professorTips: [
      { author: '@lucas_code', text: 'Si en el parcial ponés lógica de cálculo en el main en vez de delegar en la entidad, te bajan puntos.', votes: 67 },
    ],
  },
  {
    id: 'sistemas-operativos',
    code: 'LSI-205',
    name: 'Sistemas Operativos',
    year: 2,
    semester: 2,
    hasCompiler: false,
    correlativesForRegular: ['arquitectura', 'algoritmos-2'],
    correlativesForApproved: ['algoritmos-1'],
    difficulty: 4.6,
    promotionAvailable: false,
    nextExamDates: ['2026-11-30', '2026-12-21', '2027-02-25'],
    topTopics: [
      { topic: 'Planificación de CPU (FIFO, SJF, Round Robin) y Semáforos', frequency: 95, tip: 'Armar diagrama de Gantt y verificar exclusión mutua sin Deadlock.' },
      { topic: 'Gestión de Memoria: Paginación, Segmentación y Fallos de Página', frequency: 88, tip: 'Marcar claramente Hits y Page Faults en FIFO/LRU.' },
    ],
    professorTips: [
      { author: '@agus_kernel', text: 'En el final entran los estados de proceso (5 y 7 estados) más un ejercicio práctico de memoria o sincronización.', votes: 76 },
    ],
  },
  {
    id: 'base-de-datos-1',
    code: 'LSI-206',
    name: 'Bases de Datos I',
    year: 2,
    semester: 2,
    hasCompiler: false,
    correlativesForRegular: ['arquitectura'],
    correlativesForApproved: ['algoritmos-1'],
    difficulty: 4.3,
    promotionAvailable: true,
    nextExamDates: ['2026-11-25', '2026-12-16', '2027-02-19'],
    topTopics: [
      { topic: 'Pasaje de DER a Modelo Relacional + Restricciones', frequency: 98, tip: 'Nombrar todas las CONSTRAINT (PK_, FK_, UQ_, CK_) explícitamente.' },
      { topic: 'Consultas SQL (JOIN, GROUP BY, HAVING) y Normalización (1FN-3FN)', frequency: 94, tip: 'Identificar dependencias funcionales y clave candidata antes de descomponer.' },
    ],
    professorTips: [
      { author: '@facu_sql', text: 'En el 1er parcial práctico siempre piden pasar un DER a modelo relacional y resolver consultas SQL.', votes: 84 },
    ],
  },
  {
    id: 'administracion-gestion',
    code: 'LSI-207',
    name: 'Administración y Gestión de Organizaciones',
    year: 2,
    semester: 2,
    hasCompiler: false,
    correlativesForRegular: ['sistemas-organizaciones'],
    correlativesForApproved: ['sistemas-organizaciones'],
    difficulty: 2.9,
    promotionAvailable: true,
    nextExamDates: ['2026-12-02', '2026-12-19'],
    topTopics: [
      { topic: 'Planeamiento Estratégico, Estructura Organizacional y Cuadro de Mando', frequency: 90, tip: 'Relacionar teoría administrativa con casos prácticos de organizaciones.' },
      { topic: 'Procesos de Gestión, Presupuestos y Toma de Decisiones', frequency: 84, tip: 'Repasar los TPs integradores y modelos de finales.' },
    ],
    professorTips: [
      { author: '@mili_admin', text: 'Los modelos de parciales y finales anteriores ayudan mucho a ver qué enfoque toma la cátedra.', votes: 27 },
    ],
  },

  // ==========================================
  // 3° AÑO (Plan 2023 / 2009 — UNNE LSI)
  // ==========================================
  {
    id: 'comunicaciones-datos',
    code: 'LSI-301',
    name: 'Comunicaciones de Datos',
    year: 3,
    semester: 1,
    hasCompiler: false,
    correlativesForRegular: ['sistemas-operativos', 'arquitectura'],
    correlativesForApproved: ['sistemas-operativos'],
    difficulty: 4.0,
    promotionAvailable: false,
    nextExamDates: ['2026-12-01', '2026-12-21'],
    topTopics: [
      { topic: 'Capa Física, Modulación, Medios de Transmisión y Espectro Electromagnético', frequency: 92, tip: 'Repasar los cuestionarios de cátedra y cálculos de ancho de banda / Shannon.' },
      { topic: 'Capa de Enlace, Detección/Corrección de Errores (CRC) y Multiplexación', frequency: 88, tip: 'Practicar los laboratorios de Wireshark / tramas y monografías.' },
    ],
    professorTips: [
      { author: '@marco_com', text: 'Hacer todos los cuestionarios semanales y entregar prolijos los laboratorios de laboratorio/monografías.', votes: 34 },
    ],
  },
  {
    id: 'ingenieria-software',
    code: 'LSI-302',
    name: 'Ingeniería de Software I',
    year: 3,
    semester: 1,
    hasCompiler: false,
    correlativesForRegular: ['paradigmas-poo', 'base-de-datos-1'],
    correlativesForApproved: ['algoritmos-2'],
    difficulty: 3.8,
    promotionAvailable: true,
    nextExamDates: ['2026-12-03', '2026-12-22'],
    topTopics: [
      { topic: 'Requerimientos, Casos de Uso, Diagramas UML y Trabajo de Campo', frequency: 91, tip: 'Diferenciar requerimientos funcionales de no funcionales y mantener trazabilidad.' },
      { topic: 'Ciclos de Vida, Metodologías Ágiles y Gestión de Calidad', frequency: 86, tip: 'Estudiar los parciales de 2024/2025 para el estilo de preguntas.' },
    ],
    professorTips: [
      { author: '@valen_arq', text: 'El Trabajo de Campo define gran parte de la cursada; elegí un dominio real y bien delimitado.', votes: 28 },
    ],
  },
  {
    id: 'taller-programacion-1',
    code: 'LSI-303',
    name: 'Taller de Programación I',
    year: 3,
    semester: 1,
    hasCompiler: false,
    correlativesForRegular: ['paradigmas', 'paradigmas-poo'],
    correlativesForApproved: ['paradigmas-poo'],
    difficulty: 3.4,
    promotionAvailable: true,
    nextExamDates: ['2026-12-04', '2026-12-20'],
    topTopics: [
      { topic: 'Desarrollo de Aplicaciones de Escritorio, Capas y Persistencia', frequency: 90, tip: 'Separar claramente lógica de negocio, acceso a datos e interfaz.' },
    ],
    professorTips: [
      { author: '@dev_unne', text: 'Presentar avances funcionales semanales en el taller evita atrasarse al final.', votes: 21 },
    ],
  },
  {
    id: 'probabilidad-estadistica',
    code: 'LSI-304',
    name: 'Probabilidad y Estadística',
    year: 3,
    semester: 2,
    hasCompiler: false,
    correlativesForRegular: ['calculo', 'logica-computacional'],
    correlativesForApproved: ['calculo'],
    difficulty: 4.2,
    promotionAvailable: true,
    nextExamDates: ['2026-12-05', '2026-12-22', '2027-02-26'],
    topTopics: [
      { topic: 'Variables Aleatorias, Distribuciones (Binomial, Poisson, Normal) y Esperanza', frequency: 95, tip: 'Identificar correctamente el modelo probabilístico antes de aplicar tablas.' },
      { topic: 'Inferencia Estadística, Intervalos de Confianza y Pruebas de Hipótesis', frequency: 90, tip: 'Practicar todos los modelos de parciales y finales recopilados.' },
    ],
    professorTips: [
      { author: '@sol_stat', text: 'Llevar formulario claro de distribuciones y practicar muchos exámenes de finales previos.', votes: 41 },
    ],
  },
  {
    id: 'ingenieria-software-2',
    code: 'LSI-305',
    name: 'Ingeniería de Software II',
    year: 3,
    semester: 2,
    hasCompiler: false,
    correlativesForRegular: ['ingenieria-software', 'base-de-datos-1'],
    correlativesForApproved: ['ingenieria-software'],
    difficulty: 4.0,
    promotionAvailable: true,
    nextExamDates: ['2026-12-06', '2026-12-23'],
    topTopics: [
      { topic: 'Arquitectura de Software, Patrones Arquitectónicos y Diseño Detallado', frequency: 93, tip: 'Apoyarse en Software Architecture Atlas y diagramas C4 / componentes.' },
      { topic: 'Testing, Aseguramiento de Calidad (QA) y Métricas', frequency: 88, tip: 'Completar los cuestionarios de autoevaluación e investigaciones individuales.' },
    ],
    professorTips: [
      { author: '@lucia_ing2', text: 'Las investigaciones individuales y cuestionarios de autoevaluación cubren casi toda la teoría del parcial.', votes: 37 },
    ],
  },
  {
    id: 'taller-programacion-2',
    code: 'LSI-306',
    name: 'Taller de Programación II',
    year: 3,
    semester: 2,
    hasCompiler: false,
    correlativesForRegular: ['ingenieria-software', 'paradigmas-poo', 'taller-programacion-1'],
    correlativesForApproved: ['taller-programacion-1'],
    difficulty: 3.7,
    promotionAvailable: true,
    nextExamDates: ['2026-12-07', '2026-12-23'],
    topTopics: [
      { topic: 'Desarrollo Web / Full-Stack con .NET / C#, SQL y Patrones MVC/API', frequency: 92, tip: 'Organizar soluciones limpias sin subir binarios ni carpetas obj/bin.' },
    ],
    professorTips: [
      { author: '@tobi_unne', text: 'Probar cada endpoint y flujo CRUD de punta a punta antes de las entregas.', votes: 33 },
    ],
  },
  {
    id: 'ingles-tecnico',
    code: 'LSI-307',
    name: 'Inglés Técnico Informático',
    year: 3,
    semester: 2,
    hasCompiler: false,
    correlativesForRegular: [],
    correlativesForApproved: [],
    difficulty: 2.3,
    promotionAvailable: true,
    nextExamDates: ['2026-12-08', '2026-12-19'],
    topTopics: [
      { topic: 'Comprensión Lectora de Documentación Técnica (Unidades 1 a 10)', frequency: 95, tip: 'Repasar vocabulario técnico y estructuras pasivas en textos de computación.' },
    ],
    professorTips: [
      { author: '@agus_apu', text: 'Requisito obligatorio para tramitar el título intermedio de Analista Programador Universitario (APU).', votes: 29 },
    ],
  },

  // ==========================================
  // 4° AÑO (Plan 2023 / 2009 — UNNE LSI)
  // ==========================================
  {
    id: 'teoria-computacion',
    code: 'LSI-401',
    name: 'Teoría de la Computación',
    year: 4,
    semester: 1,
    hasCompiler: false,
    correlativesForRegular: ['probabilidad-estadistica', 'calculo'],
    correlativesForApproved: ['probabilidad-estadistica'],
    difficulty: 4.5,
    promotionAvailable: false,
    nextExamDates: ['2026-12-04', '2026-12-22'],
    topTopics: [
      { topic: 'Autómatas Finitos (AFD/AFND), Expresiones Regulares y Gramáticas', frequency: 96, tip: 'Practicar paso a paso conversión AFND → AFD y minimización.' },
      { topic: 'Autómatas con Pila, Máquinas de Turing y Decidibilidad (P vs NP)', frequency: 91, tip: 'Repasar los modelos 2020–2025 de Primer Parcial Teórico.' },
    ],
    professorTips: [
      { author: '@leo_tcomp', text: 'Hacer los modelos de exámenes teóricos 2020–2025: las preguntas conceptuales se repiten con variantes.', votes: 44 },
    ],
  },
  {
    id: 'economia-aplicada',
    code: 'LSI-402',
    name: 'Economía Aplicada',
    year: 4,
    semester: 1,
    hasCompiler: false,
    correlativesForRegular: ['administracion-gestion', 'ingenieria-software'],
    correlativesForApproved: ['ingenieria-software'],
    difficulty: 3.1,
    promotionAvailable: true,
    nextExamDates: ['2026-12-05', '2026-12-21'],
    topTopics: [
      { topic: 'Estudio de Mercado, Fijación de Precios, Flujos Financieros y CANVAS', frequency: 92, tip: 'Armar planillas claras de VAN, TIR y flujo de fondos.' },
    ],
    professorTips: [
      { author: '@carla_eco', text: 'Las filminas actualizadas y los prácticos resueltos son la base directa del parcial.', votes: 26 },
    ],
  },
  {
    id: 'redes-datos',
    code: 'LSI-403',
    name: 'Redes de Datos y Comunicaciones',
    year: 4,
    semester: 1,
    hasCompiler: false,
    correlativesForRegular: ['comunicaciones-datos', 'sistemas-operativos'],
    correlativesForApproved: ['comunicaciones-datos'],
    difficulty: 4.2,
    promotionAvailable: false,
    nextExamDates: ['2026-12-04', '2026-12-23'],
    topTopics: [
      { topic: 'Subnetting IPv4 / VLSM y Tablas de Enrutamiento', frequency: 96, tip: 'Ordenar siempre las subredes de mayor a menor cantidad de hosts antes de asignar máscaras.' },
      { topic: 'Modelo OSI vs TCP/IP, DNS, HTTP y Seguridad de Red', frequency: 89, tip: 'Saber qué PDU corresponde a cada capa.' },
    ],
    professorTips: [
      { author: '@franco_net', text: 'Si fallás en el cálculo de dirección de broadcast en VLSM no te aprueban el práctico, verificalo en binario.', votes: 49 },
    ],
  },
  {
    id: 'bases-de-datos-2',
    code: 'LSI-404',
    name: 'Bases de Datos II',
    year: 4,
    semester: 2,
    hasCompiler: false,
    correlativesForRegular: ['probabilidad-estadistica', 'base-de-datos-1'],
    correlativesForApproved: ['probabilidad-estadistica'],
    difficulty: 4.3,
    promotionAvailable: true,
    nextExamDates: ['2026-12-09', '2026-12-23'],
    topTopics: [
      { topic: 'Transacciones ACID, Control de Concurrencia, Índices y Optimización de Consultas', frequency: 94, tip: 'Estudiar bloqueos 2PL, timestamps y planes de ejecución.' },
      { topic: 'Bases de Datos Distribuidas, NoSQL, Data Warehousing y Laboratorios', frequency: 89, tip: 'Revisar los laboratorios y monografías 2020/2023.' },
    ],
    professorTips: [
      { author: '@martu_sql', text: 'En los parciales y modelos toman ejercicios de seriabilidad de grafos y control de concurrencia.', votes: 46 },
    ],
  },

  // ==========================================
  // 5° AÑO (Plan 2023 / 2009 — UNNE LSI)
  // ==========================================
  {
    id: 'auditoria-seguridad',
    code: 'LSI-501',
    name: 'Auditoría y Seguridad Informática',
    year: 5,
    semester: 1,
    hasCompiler: false,
    correlativesForRegular: ['redes-datos', 'ingenieria-software-2'],
    correlativesForApproved: ['bases-de-datos-2', 'ingenieria-software-2'],
    difficulty: 3.9,
    promotionAvailable: true,
    nextExamDates: ['2026-12-09', '2026-12-23'],
    topTopics: [
      { topic: 'Criptografía Simétrica, Asimétrica (RSA) y Hashing', frequency: 91, tip: 'Saber explicar cómo se combina AES con RSA en TLS/HTTPS.' },
      { topic: 'OWASP Top 10, Matriz de Riesgos ISO 27001 y Auditoría de Sistemas', frequency: 88, tip: 'En el práctico siempre piden mitigar vulnerabilidades en el código.' },
    ],
    professorTips: [
      { author: '@julian_sec', text: 'Para el proyecto final armá un laboratorio corto en Docker mostrando la vulnerabilidad y el parche.', votes: 34 },
    ],
  },
  {
    id: 'proyecto-final-carrera',
    code: 'LSI-502',
    name: 'Proyecto Integrador de Carrera / Ciencia de Datos',
    year: 5,
    semester: 2,
    hasCompiler: false,
    correlativesForRegular: ['auditoria-seguridad', 'bases-de-datos-2'],
    correlativesForApproved: ['ingenieria-software-2', 'redes-datos'],
    difficulty: 4.5,
    promotionAvailable: true,
    nextExamDates: ['2026-12-18', '2027-03-05'],
    topTopics: [
      { topic: 'Arquitectura de Software, Despliegue Cloud y Métricas de Validación', frequency: 95, tip: 'El tribunal evalúa mucho la justificación técnica de las tecnologías elegidas.' },
    ],
    professorTips: [
      { author: '@egresado_lsi', text: 'Documentá las decisiones de arquitectura (ADR) desde el primer mes para no sufrir al redactar la tesina.', votes: 61 },
    ],
  },
];

export const INITIAL_PROFESSOR_RECOMMENDATIONS: ProfessorRecommendation[] = [
  {
    id: 'prof-rec-alg1',
    professorName: 'Prof. Titular — Algoritmos y Estructuras de Datos I',
    roleOrCommission: '1° Año • Comisión Mañana (Teoría y Práctica)',
    subjectId: 'algoritmos-1',
    examFocus: 'Traza de escritorio prolija, nombres descriptivos de variables y corte de control sin errores de borde.',
    recommendationText:
      'En el 1° Parcial siempre revisa que hayas inicializado los contadores y acumuladores exactamente donde corresponde antes del ciclo mientras.',
    clarityRating: 5,
    strictnessRating: 4,
    author: '@matias_lsi',
    createdAt: 'Hace 2 días',
    votes: 88,
  },
  {
    id: 'prof-rec-alg2',
    professorName: 'JTP Práctica — Algoritmos y Estructuras de Datos II',
    roleOrCommission: '1° Año • Punteros y Listas Dinámicas',
    subjectId: 'algoritmos-2',
    examFocus: 'Manejo seguro de punteros (no dejar memoria huérfana ni desreferenciar NULL).',
    recommendationText:
      'Dibujá al costado de la hoja del parcial el estado de los punteros antes y después de conectar el nodo nuevo; si el dibujo está bien te considera gran parte del puntaje.',
    clarityRating: 5,
    strictnessRating: 5,
    author: '@sofi_dev',
    createdAt: 'Hace 4 días',
    votes: 94,
  },
  {
    id: 'prof-rec-paradigmas',
    professorName: 'Cátedra Paradigmas de Programación (Comisión 1)',
    roleOrCommission: '2° Año • Funcional y Lógico',
    subjectId: 'paradigmas',
    examFocus: 'Composición de funciones, inmutabilidad y uso de map/filter/fold.',
    recommendationText:
      'Para aprobar el 1° Parcial de Funcional no uses guardas anidadas gigantes: dividí el problema en funciones chicas con nombres expresivos y delegá.',
    clarityRating: 5,
    strictnessRating: 4,
    author: '@rami_func',
    createdAt: 'Hace 3 días',
    votes: 91,
  },
  {
    id: 'prof-rec-3',
    professorName: 'Prof. Cátedra POO (Comisión 1 — Práctica Java)',
    roleOrCommission: '2° Año • Corrección de 1° y 2° Parcial Práctico + Defensa de TP',
    subjectId: 'paradigmas-poo',
    examFocus: 'Delegación de responsabilidades, cero lógica en el método main y uso estricto de polimorfismo.',
    recommendationText:
      'Cuando defiendas el parcial o el TP, siempre te pregunta: "¿Por qué pusiste este método en esta clase y no en la otra?". Si respetás que cada clase calcule sus propios datos y la clase contenedora solo recorra el ArrayList delegando, aprobás seguro.',
    clarityRating: 4,
    strictnessRating: 4,
    author: '@lucas_code',
    createdAt: 'Hace 1 semana',
    votes: 85,
  },
  {
    id: 'prof-rec-4',
    professorName: 'Tribunal de Final — Sistemas Operativos',
    roleOrCommission: '2° Año • Mesa de Examen Final (Oral y Pizarrón)',
    subjectId: 'sistemas-operativos',
    examFocus: 'Transiciones de estados de procesos, semáforos sin interbloqueo y traducción de direcciones en paginación.',
    recommendationText:
      'Arrancá preparando un tema firme (por ejemplo Memoria Virtual o Planificación), pero asegurate de dominar el diagrama de 5 y 7 estados.',
    clarityRating: 4,
    strictnessRating: 5,
    author: '@agus_kernel',
    createdAt: 'Hace 4 días',
    votes: 110,
  },
  {
    id: 'prof-rec-arq',
    professorName: 'Cátedra Arquitectura de Computadoras',
    roleOrCommission: '2° Año • Circuitos, Complemento a 2 y Ciclo de Instrucción',
    subjectId: 'arquitectura',
    examFocus: 'Conversión numérica exacta (IEEE 754, Ca2) y simplificación por Mapas de Karnaugh.',
    recommendationText:
      'No saltees pasos en los pasajes de base ni en Karnaugh: mostrar cada agrupamiento de unos te salva puntos aunque te equivoques en una compuerta final.',
    clarityRating: 4,
    strictnessRating: 4,
    author: '@nico_hw',
    createdAt: 'Hace 5 días',
    votes: 64,
  },
  {
    id: 'prof-rec-algebra',
    professorName: 'Cátedra Álgebra (1° Año)',
    roleOrCommission: '1° Año • Matrices, Vectores y Transformaciones Lineales',
    subjectId: 'algebra',
    examFocus: 'Resolución ordenada por Gauss-Jordan y justificación de independencia lineal.',
    recommendationText:
      'Mostrá cada operación elemental entre filas al escalonar y verificá el resultado sustituyendo en las ecuaciones originales.',
    clarityRating: 4,
    strictnessRating: 4,
    author: '@carla_exactas',
    createdAt: 'Hace 4 días',
    votes: 68,
  },
  {
    id: 'prof-rec-alg-log',
    professorName: 'Cátedra Lógica y Matemática Computacional',
    roleOrCommission: '1° Año • Tablas de Verdad, Deducción Natural e Inducción',
    subjectId: 'logica-computacional',
    examFocus: 'Justificación formal paso a paso usando leyes lógicas e inducción matemática.',
    recommendationText:
      'Escribí explícitamente qué ley lógica aplicás en cada línea (De Morgan, distributiva, implicación); la cátedra evalúa la justificación más que el resultado aislado.',
    clarityRating: 4,
    strictnessRating: 5,
    author: '@valen_lsi',
    createdAt: 'Hace 6 días',
    votes: 71,
  },
  {
    id: 'prof-rec-bd1',
    professorName: 'Cátedra Base de Datos I (Comisión Práctica)',
    roleOrCommission: '2° Año • DER, Normalización y SQL',
    subjectId: 'base-de-datos-1',
    examFocus: 'Cardinalidades en DER, dependencias funcionales en 3FN y JOINs sin productos cartesianos.',
    recommendationText:
      'Justificá siempre por qué una relación rompe 2FN o 3FN antes de partir la tabla, y verificá que ninguna consulta SQL repita filas por falta de DISTINCT o clave correcta.',
    clarityRating: 5,
    strictnessRating: 4,
    author: '@martu_sql',
    createdAt: 'Hace 3 días',
    votes: 82,
  },
  {
    id: 'prof-rec-ingsoft',
    professorName: 'Cátedra Ingeniería de Software I',
    roleOrCommission: '3° Año • Requerimientos, Casos de Uso y Calidad',
    subjectId: 'ingenieria-software',
    examFocus: 'Coherencia entre historias de usuario, diagramas de secuencia y criterios de aceptación.',
    recommendationText:
      'En los TPs integradores priorizá que los casos de uso y los flujos alternativos cubran validaciones reales de negocio antes de adornar el documento.',
    clarityRating: 5,
    strictnessRating: 4,
    author: '@fede_ing',
    createdAt: 'Hace 5 días',
    votes: 59,
  },
  {
    id: 'prof-rec-redes',
    professorName: 'Cátedra Redes de Datos y Comunicaciones',
    roleOrCommission: '3° Año • Subnetting, TCP/IP y Enrutamiento',
    subjectId: 'redes-datos',
    examFocus: 'Cálculo exacto de máscaras VLSM, cabeceras TCP/UDP y encapsulamiento por capas.',
    recommendationText:
      'Ordená siempre las subredes de mayor a menor cantidad de hosts antes de asignar rangos VLSM; si invertís el orden se solapan las IPs y te anulan el ejercicio.',
    clarityRating: 4,
    strictnessRating: 5,
    author: '@lucho_net',
    createdAt: 'Hace 4 días',
    votes: 73,
  },
  {
    id: 'prof-rec-seg',
    professorName: 'Cátedra Seguridad Informática y Auditoría',
    roleOrCommission: '4° Año • Análisis de Riesgos, OWASP y Criptografía',
    subjectId: 'auditoria-seguridad',
    examFocus: 'Clasificación de vulnerabilidades, mitigación práctica y trazabilidad de auditoría.',
    recommendationText:
      'No alcanza con nombrar el ataque (ej. SQLi o XSS): siempre explicá impacto, vector de entrada y el control técnico exacto para mitigarlo.',
    clarityRating: 5,
    strictnessRating: 4,
    author: '@carla_sec',
    createdAt: 'Hace 1 semana',
    votes: 54,
  },
  {
    id: 'prof-rec-pf',
    professorName: 'Tribunal de Proyecto Final de Carrera',
    roleOrCommission: '5° Año • Anteproyecto, Arquitectura y Defensa',
    subjectId: 'proyecto-final-carrera',
    examFocus: 'Alcance medible del MVP, métricas de validación y justificación técnica de decisiones.',
    recommendationText:
      'Definí un alcance realista en el anteproyecto y documentá las decisiones de arquitectura desde el día 1; el tribunal valora métricas concretas de pruebas.',
    clarityRating: 5,
    strictnessRating: 4,
    author: '@diego_grad',
    createdAt: 'Hace 1 semana',
    votes: 67,
  },
];

export const INITIAL_STUDENT_TIPS: StudentTipItem[] = [
  {
    id: 'tip-alg1',
    subjectId: 'algoritmos-1',
    tipCategory: 'Parciales',
    title: 'Cómo hacer el Corte de Control en el 1° Parcial de Algoritmos I sin equivocarse',
    content:
      'Guardá siempre la clave anterior (ej. resguardoSucursal = reg.sucursal) antes de entrar al ciclo interno y verificá ambas condiciones: (!finDeArchivo && reg.sucursal == resguardoSucursal).',
    author: '@matias_lsi',
    createdAt: 'Hace 2 días',
    votes: 112,
  },
  {
    id: 'tip-alg2',
    subjectId: 'algoritmos-2',
    tipCategory: 'Parciales',
    title: 'Cómo no perderte con Punteros y Listas Enlazadas en Algoritmos II',
    content:
      'Siempre dibujá en una hoja cuadriculada los nodos con su caja [dato | sig] antes de escribir una sola línea de código. Si movés el puntero cabecera sin guardar la referencia en un auxiliar, perdés toda la lista.',
    author: '@sofi_dev',
    createdAt: 'Hace 4 días',
    votes: 98,
  },
  {
    id: 'tip-arq1',
    subjectId: 'arquitectura',
    tipCategory: 'Parciales',
    title: 'Truco rápido para no errar en Complemento a 2 y Overflow',
    content:
      'Verificá el bit de signo antes y después de sumar: solo hay overflow si sumás dos positivos y da negativo, o dos negativos y da positivo. Si tienen distinto signo, nunca hay desbordamiento.',
    author: '@nico_hw',
    createdAt: 'Hace 5 días',
    votes: 76,
  },
  {
    id: 'tip-algebra1',
    subjectId: 'algebra',
    tipCategory: 'Parciales',
    title: 'Practicá Gauss-Jordan y determinantes con parciales anteriores',
    content:
      'En Álgebra los modelos de parciales viejos repiten la estructura de sistemas con parámetros y bases de subespacios.',
    author: '@carla_exactas',
    createdAt: 'Hace 4 días',
    votes: 74,
  },
  {
    id: 'tip-alglog1',
    subjectId: 'logica-computacional',
    tipCategory: 'Cursada y TPs',
    title: 'Armá tu hoja de equivalencias lógicas antes de practicar deducción',
    content:
      'Tener a mano De Morgan, doble negación, condicional (p -> q ≡ ¬p v q) y absorción te acelera muchísimo las simplificaciones sin tener que armar tablas de verdad gigantes.',
    author: '@valen_lsi',
    createdAt: 'Hace 6 días',
    votes: 69,
  },
  {
    id: 'tip-paradigmas',
    subjectId: 'paradigmas',
    tipCategory: 'Parciales',
    title: 'Cuándo usar map, filter y fold en el Parcial de Paradigmas',
    content:
      '• Si entra una lista de N elementos y sale otra de N elementos transformados -> map.\n• Si querés quedarte solo con los que cumplen una condición -> filter.\n• Si querés reducir toda la lista a un único valor (suma, máximo, booleano) -> fold / reduce.',
    author: '@rami_func',
    createdAt: 'Hace 3 días',
    votes: 124,
  },
  {
    id: 'tip-2',
    subjectId: 'paradigmas-poo',
    tipCategory: 'Parciales',
    title: 'El error #1 por el que bochan en el 2° Parcial de POO',
    content:
      'Nunca preguntes con un if (empleado instanceof Gerente) para calcular un sueldo o descuento. Creá un método abstracto en la superclase y sobrescribilo con @Override en cada subclase.',
    author: '@camila_sistemas',
    createdAt: 'Hace 4 días',
    votes: 118,
  },
  {
    id: 'tip-bd1',
    subjectId: 'base-de-datos-1',
    tipCategory: 'Parciales',
    title: 'Checklist antes de entregar el DER y la Normalización en Base de Datos I',
    content:
      'Revisá que toda relación N:M se haya transformado en tabla intermedia con clave compuesta, y que en 3FN ningún atributo no clave dependa de otro atributo no clave.',
    author: '@martu_sql',
    createdAt: 'Hace 3 días',
    votes: 93,
  },
  {
    id: 'tip-so1',
    subjectId: 'sistemas-operativos',
    tipCategory: 'Final Oral',
    title: 'Cómo defender Semáforos y Memoria Virtual en el Final de Sistemas Operativos',
    content:
      'Tené bien clara la diferencia entre espera activa y bloqueo, dibujá la tabla de páginas + TLB y explicá qué pasa paso a paso cuando ocurre un Page Fault.',
    author: '@agus_kernel',
    createdAt: 'Hace 2 días',
    votes: 105,
  },
  {
    id: 'tip-ingsoft1',
    subjectId: 'ingenieria-software',
    tipCategory: 'Cursada y TPs',
    title: 'Mantené trazabilidad entre Requerimientos, Casos de Uso y Pruebas',
    content:
      'Numerá cada requisito (RF-01, RNF-01) y referencialo en tus casos de uso y matriz de testing; eso demuestra consistencia automática frente a la cátedra.',
    author: '@fede_ing',
    createdAt: 'Hace 5 días',
    votes: 61,
  },
  {
    id: 'tip-redes1',
    subjectId: 'redes-datos',
    tipCategory: 'Parciales',
    title: 'Regla de oro para ejercicios de Subnetting VLSM',
    content:
      'Calculá primero el bloque de potencias de 2 que cubra (hosts + 2) para red y broadcast, ordenando siempre de la subred más grande a la más chica.',
    author: '@lucho_net',
    createdAt: 'Hace 4 días',
    votes: 84,
  },
  {
    id: 'tip-seg1',
    subjectId: 'auditoria-seguridad',
    tipCategory: 'Parciales',
    title: 'Cómo estructurar respuestas de análisis de vulnerabilidades',
    content:
      'Respondé siempre en 4 puntos: Vulnerabilidad (OWASP), Escenario de explotación, Impacto en CIA (Confidencialidad/Integridad/Disponibilidad) y Remediación técnica.',
    author: '@carla_sec',
    createdAt: 'Hace 1 semana',
    votes: 57,
  },
  {
    id: 'tip-pf1',
    subjectId: 'proyecto-final-carrera',
    tipCategory: 'Final Oral',
    title: 'Armá la demo del Proyecto Final con datos cargados y plan B offline',
    content:
      'Grabá un video corto de respaldo de los flujos críticos y dejá un usuario demo precargado para que la defensa no dependa de imprevistos de red o carga manual.',
    author: '@diego_grad',
    createdAt: 'Hace 1 semana',
    votes: 72,
  },
];

export const INITIAL_NOTES: StudyNote[] = [
  // ==========================================
  // APUNTES DE 1° AÑO (VERIFICADOS Y NO VERIFICADOS)
  // ==========================================
  {
    id: 'note-alg1-parcial1-verif',
    title: '1° Parcial Práctico Resuelto — Corte de Control, Arreglos y Búsqueda Binaria',
    subjectId: 'algoritmos-1',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
    author: 'Valentina G.',
    createdAt: 'Hace 2 días',
    votes: 142,
    verifiedByStudents: true,
    linkedExamId: 'exam-alg1-parcial1',
    tags: ['1° Parcial', 'Corte de Control', 'Arreglos', 'Búsqueda Binaria'],
    summary: 'Resolución verificada por la cátedra con traza de escritorio completa y plantilla de corte de control de 2 niveles.',
    contentMarkdown: `# 1° Parcial Práctico — Algoritmos y Estructuras de Datos I

Incluye el algoritmo completo de carga, ordenamiento por inserción, búsqueda dicotómica (binaria) y corte de control por sucursal.`,
  },
  {
    id: 'note-alg1-parcial1-noverif',
    title: 'Resolución Alternativa 1° Parcial Práctico Tema B (Hecha en clase de repaso)',
    subjectId: 'algoritmos-1',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
    author: 'Tomás P.',
    createdAt: 'Hace 1 día',
    votes: 19,
    verifiedByStudents: true,
    tags: ['1° Parcial', 'Tema B', 'Ciclos'],
    summary: 'Aporte subido por un alumno con una variante del ejercicio de vectores paralelos (pendiente de verificación por la comunidad).',
    contentMarkdown: `# Resolución Tema B — Algoritmos I

Resolución propuesta en grupo de estudio usando dos vectores paralelos para almacenar legajo y promedio.`,
  },
  {
    id: 'note-alg2-parcial1-verif',
    title: '1° Parcial Práctico Resuelto — Listas Simplemente y Doblemente Enlazadas con Punteros',
    subjectId: 'algoritmos-2',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
    author: 'Sofía D.',
    createdAt: 'Hace 3 días',
    votes: 156,
    verifiedByStudents: true,
    linkedExamId: 'exam-alg2-parcial1',
    tags: ['1° Parcial', 'Punteros', 'Listas Enlazadas', 'Nodos'],
    summary: 'Código completo y verificado para crear nodo, insertar ordenado sin perder la cabecera y eliminar nodos duplicados.',
    contentMarkdown: `# 1° Parcial Práctico — Algoritmos y Estructuras de Datos II

\`\`\`c
typedef struct Nodo {
    int legajo;
    struct Nodo* sig;
} Nodo;
\`\`\``,
  },
  {
    id: 'note-alg2-parcial2-noverif',
    title: 'Borrador de 2° Parcial Práctico — Recorridos en Árboles Binarios (In-Order y Pre-Order)',
    subjectId: 'algoritmos-2',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
    author: 'Nicolás M.',
    createdAt: 'Hace 12 horas',
    votes: 14,
    verifiedByStudents: true,
    tags: ['2° Parcial', 'Árboles ABB', 'Recursividad'],
    summary: 'Ejercicios resueltos de árboles binarios de búsqueda subidos por la comunidad para revisar antes del 2° parcial.',
    contentMarkdown: `# Árboles Binarios — Práctica 2° Parcial

Funciones recursivas para contar hojas y calcular la altura de un ABB.`,
  },

  // ==========================================
  // APUNTES DE 2° AÑO (PARADIGMAS, POO, BD1, SO — VERIFICADOS Y NO VERIFICADOS)
  // ==========================================
  {
    id: 'note-paradigmas-parcial1-verif',
    title: '1° Parcial Práctico Resuelto — Paradigma Funcional (Orden Superior, Map, Filter, Fold y Composición)',
    subjectId: 'paradigmas',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
    author: 'Ramiro F.',
    createdAt: 'Hace 2 días',
    votes: 164,
    verifiedByStudents: true,
    linkedExamId: 'exam-paradigmas-parcial1',
    tags: ['1° Parcial', 'Funcional', 'Orden Superior', 'Map', 'Filter'],
    summary: 'Parcial práctico aprobado con 10 verificando inmutabilidad, aplicación parcial y funciones de orden superior.',
    contentMarkdown: `# 1° Parcial Práctico — Paradigmas de Programación

Resolución completa aplicando \`filter\`, \`map\` y \`reduce\` sobre colecciones inmutables.`,
  },
  {
    id: 'note-paradigmas-parcial2-noverif',
    title: 'Práctica 2° Parcial — Predicados Lógicos, Unificación e Inversibilidad',
    subjectId: 'paradigmas',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
    author: 'Julieta R.',
    createdAt: 'Hace 1 día',
    votes: 27,
    verifiedByStudents: true,
    tags: ['2° Parcial', 'Paradigma Lógico', 'Prolog', 'Backtracking'],
    summary: 'Resolución subida por alumnos del simulacro de paradigma lógico con cuantificadores.',
    contentMarkdown: `# 2° Parcial — Paradigma Lógico

Recordar ligar todas las variables antes de usar negación \`not(...)\` para garantizar inversibilidad.`,
  },
  {
    id: 'note-poo-parcial-practico-1',
    title: '1° Parcial Práctico POO Resuelto en Java — Liquidación de Empleados y Laboratorio',
    subjectId: 'paradigmas-poo',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
    author: 'Lucas C.',
    createdAt: 'Hace 3 días',
    votes: 149,
    verifiedByStudents: true,
    linkedExamId: 'exam-poo-parcial1-java',
    tags: ['Java', '1° Parcial', 'ArrayList', 'Encapsulamiento', 'UML'],
    summary: 'Código Java completo y verificado del 1° Parcial de Laboratorio y Empleados aplicando delegación y colecciones sin usar lógica en el main.',
    contentMarkdown: `# 1° Parcial Práctico POO — Solución Verificada

Recordá que el método \`totalSueldosAPagar()\` va en la clase \`Laboratorio\` recorriendo la colección \`ArrayList<Empleado>\` y delegando el cálculo de \`sueldoNeto()\` a cada instancia de \`Empleado\`.`,
  },
  {
    id: 'note-poo-parcial-practico-2',
    title: '2° Parcial Práctico POO Resuelto — Herencia, Polimorfismo y Clases Abstractas',
    subjectId: 'paradigmas-poo',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
    author: 'Camila S.',
    createdAt: 'Hace 5 días',
    votes: 121,
    verifiedByStudents: true,
    tags: ['Java', '2° Parcial', 'Polimorfismo', 'Clases Abstractas', '@Override'],
    summary: 'Resolución verificada del 2° Parcial Práctico aplicando jerarquía de herencia, métodos abstractos y ligadura dinámica.',
    contentMarkdown: `# 2° Parcial Práctico POO — Herencia y Polimorfismo

Cada subclase sobrescribe \`@Override public double calcularCostoAlquiler()\` evitando por completo el uso de \`if\` o \`instanceof\`.`,
  },
  {
    id: 'note-poo-recu-noverif',
    title: 'Recuperatorio 1° Parcial POO — Gestión de Expedientes y Clientes (Aporte de alumno)',
    subjectId: 'paradigmas-poo',
    category: 'Parcial Práctico',
    parcialInstance: 'Recuperatorio',
    author: 'Gonzalo T.',
    createdAt: 'Hace 8 horas',
    votes: 18,
    verifiedByStudents: true,
    tags: ['Recuperatorio', 'Java', 'Constructores'],
    summary: 'Resolución subida tras salir del recuperatorio del turno tarde (pendiente de revisión de cátedra).',
    contentMarkdown: `# Recuperatorio POO

Implementación de clases \`Cliente\` y \`Expediente\` con sus respectivos constructores y getters.`,
  },
  {
    id: 'note-bd-parcial-teorico-1',
    title: 'Cuestionario Resuelto 1° Parcial Teórico — Modelo Relacional, Claves y Álgebra Relacional',
    subjectId: 'base-de-datos-1',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
    author: 'Micaela S.',
    createdAt: 'Hace 4 días',
    votes: 97,
    verifiedByStudents: true,
    tags: ['1° Parcial', 'Álgebra Relacional', 'Integridad', 'Claves Candidatas'],
    summary: 'Las 25 preguntas teóricas más repetidas en el 1° Parcial Teórico con su justificación exacta.',
    contentMarkdown: `# Preguntas Clásicas del 1° Parcial Teórico (BD1)

1. **¿Puede una Clave Foránea (FK) aceptar valores NULL?**
   Sí, siempre y cuando el atributo no esté declarado como \`NOT NULL\`.`,
  },
  {
    id: 'note-so-finales',
    title: 'Recopilación de 12 Finales Orales y Escritos de Sistemas Operativos (2024-2026)',
    subjectId: 'sistemas-operativos',
    category: 'Finales',
    author: 'Agustín K.',
    createdAt: 'Hace 5 días',
    votes: 141,
    verifiedByStudents: true,
    tags: ['Final', 'Coloquio', 'Planificación CPU', 'Paginación', 'Semáforos'],
    summary: 'Preguntas exactas que hicieron los profesores en las últimas mesas de diciembre y febrero con sus respuestas desarrolladas.',
    contentMarkdown: `# Finales de Sistemas Operativos

1. Diferencia entre proceso e hilo (Thread) a nivel de PCB y espacio de direcciones.
2. Ejercicio práctico de reemplazo de páginas (FIFO, Óptimo y LRU).`,
  },
  {
    id: 'note-so-libre-noverif',
    title: 'Resumen Rápido de Semáforos y Monitores para Examen Libre',
    subjectId: 'sistemas-operativos',
    category: 'Exámenes Libres',
    author: 'Federico L.',
    createdAt: 'Hace 2 días',
    votes: 22,
    verifiedByStudents: true,
    tags: ['Examen Libre', 'Semáforos', 'Sincronización'],
    summary: 'Apunte colaborativo con casos de estudio de lectores-escritores y filósofos comensales.',
    contentMarkdown: `# Semáforos para Examen Libre

Revisión de casos clásicos de exclusión mutua y prevención de inanición.`,
  },
  ...UNNE_README_NOTES,
];

// =========================================================================
// COMPILADOR DE EXÁMENES SEPARADO POR AÑOS (SIN SQL):
// - 1° AÑO: Algoritmos y Estructuras de Datos I, Algoritmos y Estructuras de Datos II
// - 2° AÑO: Primero Paradigmas de Programación y después POO
// =========================================================================
export const INITIAL_EXAMS: ExamChallenge[] = [
  // 1° AÑO — ALGORITMOS 1
  {
    id: 'exam-alg1-parcial1',
    year: 1,
    subjectId: 'algoritmos-1',
    title: '1° Parcial Práctico — Algoritmos I: Vector de Ventas, Promedio y Búsqueda Binaria',
    examType: '1er Parcial',
    yearLabel: '1° Año • Algoritmos I',
    durationMinutes: 90,
    language: 'c',
    passingScore: 60,
    examSheetVisual: {
      headerInstitution: 'FACULTAD DE CIENCIAS EXACTAS Y NATURALES Y AGRIMENSURA — LSI',
      headerSubject: 'ALGORITMOS Y ESTRUCTURAS DE DATOS I — 1° Parcial Práctico (1° Año)',
      instructions:
        'Implemente en C / Pseudocódigo estructurado las funciones solicitadas para procesar un arreglo de N ventas ordenadas por código, calcular el promedio general y realizar una búsqueda binaria (dicotómica). Se aprueba con 60/100 puntos.',
      diagramTitle: 'ESTRUCTURA DEL ARREGLO Y MÓDULOS A IMPLEMENTAR',
      entitiesOrBoxes: [
        {
          name: 'Vector de Ventas (int ventas[N])',
          attributes: [
            'Índice: 0 .. N-1',
            'Almacena montos enteros ordenados de menor a mayor',
            'Tamaño lógico: int n',
          ],
        },
        {
          name: 'Funciones Pedidas',
          attributes: [
            '+ float calcularPromedio(int v[], int n)',
            '+ int busquedaBinaria(int v[], int n, int buscado)',
            'Ciclo acumulador con validación de n > 0',
            'Partición izq, der y centro = (izq + der) / 2',
          ],
          relations: ['Retorna posición del elemento o -1 si no existe'],
        },
      ],
      tasks: [
        '1. Implementar la función calcularPromedio(int v[], int n) usando un acumulador suma y un ciclo for.',
        '2. Implementar la función busquedaBinaria(int v[], int n, int buscado) usando límites izq, der y centro.',
        '3. Retornar el índice encontrado o -1 en caso de no hallarse el elemento.',
      ],
    },
    starterCode: `#include <stdio.h>

float calcularPromedio(int v[], int n) {
    int suma = 0;
    for (int i = 0; i < n; i++) {
        suma += v[i];
    }
    return (float)suma / n;
}

// Completá la función busquedaBinaria(int v[], int n, int buscado) para aprobar el parcial:
int busquedaBinaria(int v[], int n, int buscado) {
    int izq = 0;
    int der = n - 1;
    // Escribí el ciclo while y el cálculo de centro acá:

    return -1;
}
`,
    referenceSolution: `#include <stdio.h>

float calcularPromedio(int v[], int n) {
    int suma = 0;
    for (int i = 0; i < n; i++) {
        suma += v[i];
    }
    return (float)suma / n;
}

int busquedaBinaria(int v[], int n, int buscado) {
    int izq = 0;
    int der = n - 1;
    while (izq <= der) {
        int centro = (izq + der) / 2;
        if (v[centro] == buscado) {
            return centro;
        } else if (v[centro] < buscado) {
            izq = centro + 1;
        } else {
            der = centro - 1;
        }
    }
    return -1;
}`,
    rubric: [
      {
        id: 'alg1-promedio',
        label: 'Función calcularPromedio con acumulador suma y ciclo for',
        description: 'Recorre el arreglo de 0 a n-1 acumulando en suma y divide por n.',
        points: 30,
        requiredPatterns: ['calcularPromedio', 'for\\s*\\(', 'suma'],
        hintIfMissing: 'Implementá calcularPromedio(int v[], int n) con un ciclo for que sume v[i].',
      },
      {
        id: 'alg1-limites',
        label: 'Inicialización de límites izq = 0 y der = n - 1',
        description: 'Define los extremos del intervalo de búsqueda.',
        points: 20,
        requiredPatterns: ['izq\\s*=\\s*0', 'der\\s*=\\s*n\\s*-\\s*1'],
        hintIfMissing: 'Declarar int izq = 0; e int der = n - 1; al comienzo de busquedaBinaria.',
      },
      {
        id: 'alg1-while-centro',
        label: 'Ciclo while (izq <= der) y cálculo del punto medio (centro)',
        description: 'Divide el espacio de búsqueda a la mitad en cada iteración.',
        points: 30,
        requiredPatterns: ['while\\s*\\(\\s*izq\\s*<=\\s*der\\s*\\)', 'centro\\s*=\\s*\\(\\s*izq\\s*\\+\\s*der\\s*\\)\\s*\\/\\s*2'],
        hintIfMissing: 'Agregá while (izq <= der) y dentro calculá int centro = (izq + der) / 2;',
      },
      {
        id: 'alg1-desplazamiento',
        label: 'Actualización de extremos (centro + 1 / centro - 1) y retorno',
        description: 'Descarta la mitad izquierda o derecha según la comparación.',
        points: 20,
        requiredPatterns: ['centro\\s*\\+\\s*1', 'centro\\s*-\\s*1', 'return\\s+centro'],
        hintIfMissing: 'Si v[centro] == buscado retorná centro; si es menor hacé izq = centro + 1; si no, der = centro - 1;',
      },
    ],
  },

  // 1° AÑO — ALGORITMOS 2
  {
    id: 'exam-alg2-parcial1',
    year: 1,
    subjectId: 'algoritmos-2',
    title: '1° Parcial Práctico — Algoritmos II: Punteros e Inserción en Lista Enlazada',
    examType: '1er Parcial',
    yearLabel: '1° Año • Algoritmos II',
    durationMinutes: 90,
    language: 'c',
    passingScore: 60,
    examSheetVisual: {
      headerInstitution: 'FACULTAD DE CIENCIAS EXACTAS Y NATURALES Y AGRIMENSURA — LSI',
      headerSubject: 'ALGORITMOS Y ESTRUCTURAS DE DATOS II — 1° Parcial Práctico (1° Año)',
      instructions:
        'Defina la estructura autorreferenciada Nodo e implemente la inserción al principio y el conteo de nodos en una lista simplemente enlazada utilizando punteros dinámicos (malloc). Se aprueba con 60/100 puntos.',
      diagramTitle: 'ESQUEMA DE PUNTEROS Y NODOS EN MEMORIA DINÁMICA',
      entitiesOrBoxes: [
        {
          name: 'struct Nodo',
          attributes: [
            'int dato (Legajo o Valor)',
            'struct Nodo* sig (Puntero al siguiente nodo)',
          ],
        },
        {
          name: 'Operaciones con Punteros',
          attributes: [
            '+ Nodo* insertarAlPrincipio(Nodo* cabecera, int valor)',
            '+ int contarNodos(Nodo* cabecera)',
            'Reserva dinámica con malloc(sizeof(Nodo))',
            'Reasignación: nuevo->sig = cabecera',
          ],
          relations: ['cabecera -> [dato | sig] -> [dato | sig] -> NULL'],
        },
      ],
      tasks: [
        '1. Definir struct Nodo con el campo entero dato y el puntero struct Nodo* sig.',
        '2. En insertarAlPrincipio, reservar memoria con malloc, asignar nuevo->dato y apuntar nuevo->sig = cabecera.',
        '3. Implementar contarNodos recorriendo con un puntero auxiliar mientras aux != NULL.',
      ],
    },
    starterCode: `#include <stdio.h>
#include <stdlib.h>

typedef struct Nodo {
    int dato;
    struct Nodo* sig;
} Nodo;

Nodo* insertarAlPrincipio(Nodo* cabecera, int valor) {
    Nodo* nuevo = (Nodo*)malloc(sizeof(Nodo));
    nuevo->dato = valor;
    // Conectá el puntero sig del nuevo nodo a la cabecera y retorná el nuevo nodo:

}

// Completá la función contarNodos recorriendo hasta NULL:
int contarNodos(Nodo* cabecera) {
    int contador = 0;

    return contador;
}
`,
    referenceSolution: `#include <stdio.h>
#include <stdlib.h>

typedef struct Nodo {
    int dato;
    struct Nodo* sig;
} Nodo;

Nodo* insertarAlPrincipio(Nodo* cabecera, int valor) {
    Nodo* nuevo = (Nodo*)malloc(sizeof(Nodo));
    nuevo->dato = valor;
    nuevo->sig = cabecera;
    return nuevo;
}

int contarNodos(Nodo* cabecera) {
    int contador = 0;
    Nodo* aux = cabecera;
    while (aux != NULL) {
        contador++;
        aux = aux->sig;
    }
    return contador;
}`,
    rubric: [
      {
        id: 'alg2-struct',
        label: 'Definición de struct Nodo autorreferenciada (dato y puntero sig)',
        description: 'Define la estructura del nodo con su puntero al siguiente elemento.',
        points: 25,
        requiredPatterns: ['struct\\s+Nodo', 'Nodo\\*\\s+sig'],
        hintIfMissing: 'Definí typedef struct Nodo { int dato; struct Nodo* sig; } Nodo;',
      },
      {
        id: 'alg2-malloc',
        label: 'Reserva dinámica de memoria con malloc(sizeof(Nodo))',
        description: 'Aloca espacio en el heap para el nuevo nodo.',
        points: 25,
        requiredPatterns: ['malloc\\s*\\(\\s*sizeof\\s*\\(\\s*Nodo\\s*\\)\\s*\\)', 'nuevo->dato\\s*='],
        hintIfMissing: 'Usá malloc(sizeof(Nodo)) y asigná nuevo->dato = valor;',
      },
      {
        id: 'alg2-enlace',
        label: 'Enlace de puntero nuevo->sig = cabecera y return nuevo',
        description: 'Conecta el nuevo nodo como nueva cabecera sin perder el resto de la lista.',
        points: 25,
        requiredPatterns: ['nuevo->sig\\s*=\\s*cabecera', 'return\\s+nuevo'],
        hintIfMissing: 'Hacé nuevo->sig = cabecera; y return nuevo; dentro de insertarAlPrincipio.',
      },
      {
        id: 'alg2-recorrido',
        label: 'Recorrido de lista con while (aux != NULL) y avance aux = aux->sig',
        description: 'Recorre la lista enlazada contando los nodos hasta encontrar NULL.',
        points: 25,
        requiredPatterns: ['!=\\s*NULL', '->sig'],
        hintIfMissing: 'En contarNodos usá un ciclo while (aux != NULL) avanzando con aux = aux->sig;',
      },
    ],
  },

  // 2° AÑO — PRIMERO PARADIGMAS DE PROGRAMACIÓN
  {
    id: 'exam-paradigmas-parcial1',
    year: 2,
    subjectId: 'paradigmas',
    title: '1° Parcial Práctico — Paradigmas: Funciones de Orden Superior (Filter, Map y Reduce)',
    examType: '1er Parcial',
    yearLabel: '2° Año • Paradigmas',
    durationMinutes: 90,
    language: 'funcional',
    passingScore: 60,
    examSheetVisual: {
      headerInstitution: 'FACULTAD DE CIENCIAS EXACTAS Y NATURALES Y AGRIMENSURA — LSI',
      headerSubject: 'PARADIGMAS DE PROGRAMACIÓN — 1° Parcial Práctico (2° Año)',
      instructions:
        'Resuelva aplicando exclusivamente el Paradigma Funcional (inmutabilidad y funciones de orden superior filter, map y reduce/fold, sin usar ciclos for/while mutables). Se aprueba con 60/100 puntos.',
      diagramTitle: 'ESPECIFICACIÓN DE FUNCIONES PURAS Y ORDEN SUPERIOR',
      entitiesOrBoxes: [
        {
          name: 'Alumno (Registro Inmutable)',
          attributes: [
            'nombre: String',
            'notas: Lista de Números [n1, n2]',
            'promedio: (n1 + n2) / 2',
          ],
        },
        {
          name: 'Pipeline Funcional Pedido',
          attributes: [
            '+ esPromocionado(alumno): promedio(alumno) >= 7',
            '+ nombresPromocionados(alumnos): filter + map',
            '+ sumaTotalPromedios(alumnos): reduce / fold',
          ],
          relations: ['Prohibido usar variables mutables o bucles imperativos'],
        },
      ],
      tasks: [
        '1. Definir la función pura esPromocionado(alumno) que evalúe si su promedio es >= 7.',
        '2. Implementar nombresPromocionados(alumnos) encadenando filter(esPromocionado) y map(a => a.nombre).',
        '3. Implementar sumaTotalPromedios(alumnos) usando reduce para acumular sin mutación.',
      ],
    },
    starterCode: `// Resolución Funcional — 1° Parcial de Paradigmas de Programación
const promedio = (alumno) => (alumno.nota1 + alumno.nota2) / 2;

const esPromocionado = (alumno) => promedio(alumno) >= 7;

// Completá nombresPromocionados usando .filter(...) y .map(...) y sumaTotalPromedios usando .reduce(...):
const nombresPromocionados = (alumnos) => {
  return alumnos.filter(esPromocionado); // Agregá el .map para obtener solo el nombre
};
`,
    referenceSolution: `// Resolución Funcional — 1° Parcial de Paradigmas de Programación
const promedio = (alumno) => (alumno.nota1 + alumno.nota2) / 2;

const esPromocionado = (alumno) => promedio(alumno) >= 7;

const nombresPromocionados = (alumnos) =>
  alumnos
    .filter(esPromocionado)
    .map((alumno) => alumno.nombre);

const sumaTotalPromedios = (alumnos) =>
  alumnos.reduce((acum, alumno) => acum + promedio(alumno), 0);`,
    rubric: [
      {
        id: 'par-predicado',
        label: 'Predicado puro esPromocionado evaluando promedio >= 7',
        description: 'Define una función pura booleana sin efectos secundarios.',
        points: 25,
        requiredPatterns: ['esPromocionado', '>=\\s*7'],
        hintIfMissing: 'Definí const esPromocionado = (alumno) => promedio(alumno) >= 7;',
      },
      {
        id: 'par-filter',
        label: 'Aplicación de orden superior con filter(esPromocionado)',
        description: 'Filtra la colección de alumnos delegando en el predicado.',
        points: 25,
        requiredPatterns: ['\\.filter\\s*\\('],
        hintIfMissing: 'Usá alumnos.filter(esPromocionado) para filtrar la lista de forma inmutable.',
      },
      {
        id: 'par-map',
        label: 'Transformación con map para proyectar el nombre del alumno',
        description: 'Transforma cada registro filtrado en su nombre.',
        points: 25,
        requiredPatterns: ['\\.map\\s*\\(', '\\.nombre'],
        hintIfMissing: 'Encadená .map((alumno) => alumno.nombre) después del .filter(...).',
      },
      {
        id: 'par-reduce',
        label: 'Plegado / Reducción con reduce para sumar los promedios',
        description: 'Usa reduce (fold) con acumulador inicial en 0 sin ciclos imperativos.',
        points: 25,
        requiredPatterns: ['sumaTotalPromedios', '\\.reduce\\s*\\('],
        hintIfMissing: 'Implementá sumaTotalPromedios usando alumnos.reduce((acum, alumno) => acum + promedio(alumno), 0);',
      },
    ],
  },

  // 2° AÑO — DESPUÉS PROGRAMACIÓN ORIENTADA A OBJETOS (POO)
  {
    id: 'exam-poo-parcial1-java',
    year: 2,
    subjectId: 'paradigmas-poo',
    title: '1° Parcial Práctico — POO: Sistema de Liquidación de Empleados y Laboratorio (Java)',
    examType: '1er Parcial',
    yearLabel: '2° Año • POO',
    durationMinutes: 120,
    language: 'java',
    passingScore: 60,
    examSheetVisual: {
      headerInstitution: 'FACULTAD DE CIENCIAS EXACTAS Y NATURALES Y AGRIMENSURA — LSI',
      headerSubject: 'PROGRAMACIÓN ORIENTADA A OBJETOS — 1° Parcial Práctico (2° Año)',
      instructions:
        'Implemente en Java las clases del diagrama UML respetando encapsulamiento estricto, constructores, colección de objetos y métodos de cálculo de negocio.',
      diagramTitle: 'DIAGRAMA DE CLASES UML DEL PARCIAL',
      entitiesOrBoxes: [
        {
          name: 'Empleado',
          attributes: [
            '- cuil: long',
            '- apellidoYNombre: String',
            '- sueldoBasico: double',
            '- anioIngreso: int',
            '+ Empleado(cuil, apellidoYNombre, sueldoBasico, anioIngreso)',
            '+ antiguedad(anioActual: int): int',
            '+ sueldoNeto(anioActual: int): double',
            '+ mostrar(): void',
          ],
        },
        {
          name: 'Laboratorio',
          attributes: [
            '- nombre: String',
            '- domicilio: String',
            '- empleados: ArrayList<Empleado>',
            '+ agregarEmpleado(emp: Empleado): void',
            '+ totalSueldosAPagar(anioActual: int): double',
          ],
          relations: ['Contiene 1..* objetos Empleado (ArrayList<Empleado>)'],
        },
      ],
      tasks: [
        '1. Definir la clase Empleado con atributos privados (private) y su constructor completo.',
        '2. Implementar el método antiguedad() y sueldoNeto() que sume un adicional según antigüedad y descuente obra social.',
        '3. Definir la clase Laboratorio con un ArrayList<Empleado> que permita agregar empleados y calcular el total de sueldos.',
      ],
    },
    starterCode: `import java.util.ArrayList;

public class Empleado {
    private long cuil;
    private String apellidoYNombre;
    private double sueldoBasico;
    private int anioIngreso;

    public Empleado(long cuil, String apellidoYNombre, double sueldoBasico, int anioIngreso) {
        this.cuil = cuil;
        this.apellidoYNombre = apellidoYNombre;
        this.sueldoBasico = sueldoBasico;
        this.anioIngreso = anioIngreso;
    }

    // Completá los métodos antiguedad, sueldoNeto, mostrar y la clase Laboratorio:
}
`,
    referenceSolution: `import java.util.ArrayList;

public class Empleado {
    private long cuil;
    private String apellidoYNombre;
    private double sueldoBasico;
    private int anioIngreso;

    public Empleado(long cuil, String apellidoYNombre, double sueldoBasico, int anioIngreso) {
        this.cuil = cuil;
        this.apellidoYNombre = apellidoYNombre;
        this.sueldoBasico = sueldoBasico;
        this.anioIngreso = anioIngreso;
    }

    public int antiguedad(int anioActual) {
        return anioActual - this.anioIngreso;
    }

    public double sueldoNeto(int anioActual) {
        double adicional = (this.antiguedad(anioActual) >= 5) ? this.sueldoBasico * 0.15 : this.sueldoBasico * 0.05;
        double descuentos = this.sueldoBasico * 0.06;
        return this.sueldoBasico + adicional - descuentos;
    }

    public void mostrar() {
        System.out.println("Empleado: " + this.apellidoYNombre + " | CUIL: " + this.cuil);
    }
}

class Laboratorio {
    private String nombre;
    private ArrayList<Empleado> empleados = new ArrayList<>();

    public void agregarEmpleado(Empleado emp) {
        this.empleados.add(emp);
    }

    public double totalSueldosAPagar(int anioActual) {
        double total = 0;
        for (Empleado e : this.empleados) {
            total += e.sueldoNeto(anioActual);
        }
        return total;
    }
}`,
    rubric: [
      {
        id: 'poo-encapsulamiento',
        label: 'Encapsulamiento estricto (atributos private en Empleado)',
        description: 'Todos los atributos de instancia están declarados como private.',
        points: 20,
        requiredPatterns: ['private\\s+long\\s+cuil', 'private\\s+String\\s+apellidoYNombre', 'private\\s+double\\s+sueldoBasico'],
        hintIfMissing: 'Declarar cuil, apellidoYNombre, sueldoBasico y anioIngreso con el modificador private.',
      },
      {
        id: 'poo-constructor',
        label: 'Constructor parametrizado con inicialización de atributos',
        description: 'Inicializa las variables de instancia mediante this.',
        points: 15,
        requiredPatterns: ['public\\s+Empleado\\s*\\(', 'this\\.sueldoBasico\\s*='],
        hintIfMissing: 'Definí el constructor public Empleado(...) asignando los parámetros con this.',
      },
      {
        id: 'poo-metodos-negocio',
        label: 'Métodos de negocio antiguedad() y sueldoNeto()',
        description: 'Calcula la antigüedad y el sueldo neto dentro de la clase Empleado.',
        points: 25,
        requiredPatterns: ['antiguedad\\s*\\(', 'double\\s+sueldoNeto\\s*\\('],
        hintIfMissing: 'Implementá los métodos antiguedad(...) y public double sueldoNeto(...) dentro de Empleado.',
      },
      {
        id: 'poo-mostrar',
        label: 'Método mostrar() con salida por consola',
        description: 'Imprime los datos formateados del empleado con System.out.println.',
        points: 15,
        requiredPatterns: ['void\\s+mostrar\\s*\\(', 'System\\.out\\.print'],
        hintIfMissing: 'Agregá el método public void mostrar() que imprima con System.out.println.',
      },
      {
        id: 'poo-coleccion-lab',
        label: 'Clase Laboratorio con ArrayList<Empleado> y recorrido polimórfico',
        description: 'Administra la colección de empleados y suma sueldoNeto().',
        points: 25,
        requiredPatterns: ['class\\s+Laboratorio', 'ArrayList<Empleado>', 'agregarEmpleado', 'totalSueldosAPagar'],
        hintIfMissing: 'Creá la clase Laboratorio con ArrayList<Empleado>, agregarEmpleado() y totalSueldosAPagar() recorriendo la colección.',
      },
    ],
  },
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-alg1',
    subjectId: 'algoritmos-1',
    topic: 'Búsqueda Binaria',
    question: '¿Cuál es el requisito obligatorio para poder aplicar Búsqueda Binaria (Dicotómica) sobre un arreglo?',
    answer: 'El arreglo debe estar previamente ORDENADO por la clave de búsqueda, lo que permite descartar la mitad de los elementos en cada comparación logrando complejidad O(log n).',
    connectedConcepts: ['Ordenamiento', 'Complejidad O(log n)', 'Arreglos'],
  },
  {
    id: 'fc-alg2',
    subjectId: 'algoritmos-2',
    topic: 'Listas Enlazadas',
    question: '¿Por qué al insertar un nodo al principio de una lista primero hacemos nuevo->sig = cabecera y recién después cabecera = nuevo?',
    answer: 'Porque si asignáramos primero cabecera = nuevo perderíamos la dirección de memoria del resto de la lista (memory leak).',
    connectedConcepts: ['Punteros', 'Memoria Dinámica', 'malloc'],
  },
  {
    id: 'fc-paradigmas',
    subjectId: 'paradigmas',
    topic: 'Transparencia Referencial',
    question: '¿Qué significa que una función tenga Transparencia Referencial en el Paradigma Funcional?',
    answer: 'Que ante los mismos argumentos siempre devuelve exactamente el mismo resultado y no produce ningún efecto secundario (no muta estado global ni variables externas).',
    connectedConcepts: ['Inmutabilidad', 'Funciones Puras', 'Orden Superior'],
  },
  {
    id: 'fc-3',
    subjectId: 'paradigmas-poo',
    topic: 'Polimorfismo y Ligadura Dinámica',
    question: '¿Por qué usar clases abstractas y métodos sobrescritos (@Override) es mejor que usar un bloque if/switch preguntando por el tipo de objeto?',
    answer: 'Porque respeta el Principio Abierto/Cerrado (OCP): si mañana se agrega una nueva subclase, el código que recorre la colección sigue funcionando sin modificarse gracias al despacho dinámico de métodos.',
    connectedConcepts: ['Herencia', 'Clases Abstractas', 'Colecciones'],
  },
  {
    id: 'fc-4',
    subjectId: 'sistemas-operativos',
    topic: 'Sincronización',
    question: '¿Cuáles son las 4 condiciones de Coffman necesarias para que ocurra un Interbloqueo (Deadlock)?',
    answer: '1) Exclusión mutua, 2) Retención y espera (Hold and Wait), 3) No apropiación (No Preemption), y 4) Espera circular.',
    connectedConcepts: ['Semáforos', 'Exclusión Mutua', 'Inanición'],
  },
];

export const INITIAL_PROFESSOR_CONTACTS: ProfessorContact[] = [
  {
    id: 'contact-alg-1',
    name: 'Prof. Coordinación — Algoritmos y Estructuras de Datos I',
    subjectId: 'algoritmos-1',
    email: 'algoritmos1.lsi@exa.unne.edu.ar',
  },
  {
    id: 'contact-alg-2',
    name: 'Prof. Práctica — Algoritmos y Estructuras de Datos II',
    subjectId: 'algoritmos-2',
    email: 'algoritmos2.practica@exa.unne.edu.ar',
  },
  {
    id: 'contact-arq-1',
    name: 'Prof. Cátedra — Arquitectura y Organización de Computadoras',
    subjectId: 'arquitectura',
    email: 'arquitectura.lsi@exa.unne.edu.ar',
  },
  {
    id: 'contact-paradigmas-1',
    name: 'Prof. Titular — Paradigmas de Programación',
    subjectId: 'paradigmas',
    email: 'paradigmas.lsi@exa.unne.edu.ar',
  },
  {
    id: 'contact-poo-1',
    name: 'Prof. Titular — Programación Orientada a Objetos (POO)',
    subjectId: 'paradigmas-poo',
    email: 'poo.titular@exa.unne.edu.ar',
  },
  {
    id: 'contact-poo-2',
    name: 'Prof. Práctica Java — Programación Orientada a Objetos (POO)',
    subjectId: 'paradigmas-poo',
    email: 'poo.practica.java@exa.unne.edu.ar',
  },
  {
    id: 'contact-bd-1',
    name: 'Prof. Cátedra — Base de Datos I',
    subjectId: 'base-de-datos-1',
    email: 'catedra.basededatos1@exa.unne.edu.ar',
  },
  {
    id: 'contact-so-1',
    name: 'Prof. Cátedra — Sistemas Operativos',
    subjectId: 'sistemas-operativos',
    email: 'sistemas.operativos@exa.unne.edu.ar',
  },
];

export const INITIAL_SUBJECT_CHECKLISTS: SubjectChecklist[] = [
  {
    subjectId: 'algoritmos-1',
    minGradeRegular: 6,
    minAveragePromo: 7,
    minEveryExamPromo: 6,
    items: [
      { id: 'chk-alg1-1', instance: '1° Parcial', label: 'Implementar Corte de Control de 1 y 2 niveles reiniciando acumuladores parciales', critical: true },
      { id: 'chk-alg1-2', instance: '2° Parcial', label: 'Programar Búsqueda Binaria (Dicotómica) y Ordenamiento por Inserción/Burbuja', critical: true },
    ],
  },
  {
    subjectId: 'algoritmos-2',
    minGradeRegular: 6,
    minAveragePromo: 7,
    minEveryExamPromo: 6,
    items: [
      { id: 'chk-alg2-1', instance: '1° Parcial', label: 'Insertar y eliminar nodos en Listas Simplemente y Doblemente Enlazadas sin perder punteros', critical: true },
      { id: 'chk-alg2-2', instance: '2° Parcial', label: 'Recorrer Árboles Binarios de Búsqueda (Pre-Order, In-Order, Post-Order) de forma recursiva', critical: true },
    ],
  },
  {
    subjectId: 'paradigmas',
    minGradeRegular: 6,
    minAveragePromo: 7,
    minEveryExamPromo: 6,
    items: [
      { id: 'chk-par-1', instance: '1° Parcial', label: 'Resolver problemas con Funciones de Orden Superior (map, filter, fold/reduce) sin mutabilidad', critical: true },
      { id: 'chk-par-2', instance: '2° Parcial', label: 'Escribir predicados inversibles en Paradigma Lógico manejando cuantificación universal (forall/not)', critical: true },
    ],
  },
  {
    subjectId: 'paradigmas-poo',
    minGradeRegular: 6,
    minAveragePromo: 7,
    minEveryExamPromo: 6,
    items: [
      { id: 'chk-poo-1', instance: '1° Parcial', label: 'Declarar todos los atributos private y constructores sobrecargados con this', critical: true },
      { id: 'chk-poo-2', instance: '1° Parcial', label: 'Manejar colecciones ArrayList<T> (add, remove, recorrido for-each) delegando responsabilidades', critical: true },
      { id: 'chk-poo-3', instance: '2° Parcial', label: 'Implementar Herencia, Clases Abstractas y Polimorfismo (@Override) sin usar if por tipo', critical: true },
      { id: 'chk-poo-4', instance: 'Final', label: 'Distinguir Asociación, Agregación y Composición en UML y su traducción a código Java', critical: true },
    ],
  },
  {
    subjectId: 'base-de-datos-1',
    minGradeRegular: 6,
    minAveragePromo: 7,
    minEveryExamPromo: 6,
    items: [
      { id: 'chk-bd-1', instance: '1° Parcial', label: 'Pasar de Diagrama Entidad-Relación (DER) a Modelo Relacional sin perder cardinalidades', critical: true },
      { id: 'chk-bd-4', instance: '2° Parcial', label: 'Dominar INNER JOIN, LEFT JOIN y diferencia entre filtrar en WHERE vs HAVING', critical: true },
      { id: 'chk-bd-6', instance: 'Final', label: 'Justificar 1FN, 2FN, 3FN y FNBC identificando dependencias funcionales y transitivas', critical: true },
    ],
  },
  {
    subjectId: 'sistemas-operativos',
    minGradeRegular: 6,
    minAveragePromo: 8,
    minEveryExamPromo: 7,
    items: [
      { id: 'chk-so-1', instance: '1° Parcial', label: 'Armar diagrama de Gantt para FIFO, SJF (apropiativo y no apropiativo) y Round Robin', critical: true },
      { id: 'chk-so-2', instance: '1° Parcial', label: 'Resolver sincronización con Semáforos (mutex, vacio, lleno) sin causar Deadlock', critical: true },
      { id: 'chk-so-3', instance: '2° Parcial', label: 'Calcular fallos de página (Page Faults) en algoritmos FIFO, Óptimo y LRU', critical: true },
    ],
  },
];
