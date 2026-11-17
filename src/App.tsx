import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ThumbsUp,
  ThumbsDown,
  Award,
  Code2,
  GitBranch,
  Radar,
  CheckCircle2,
  Tag,
  User,
  X,
  Sparkles,
  UploadCloud,
  ArrowLeft,
  GraduationCap,
  Layers,
  Trophy,
  Users,
  ChevronRight,
  FolderOpen,
  Filter,
  UserCheck,
  Lightbulb,
  Star,
  Mail,
  Calculator,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
  LogOut,
  Trash2,
  Settings,
  FileText,
  Eye,
  Download,
  LayoutList,
  LayoutGrid,
  Heart,
  Bookmark,
  ExternalLink,
  Home,
  BookOpen,
  Wrench,
  Bell,
  Calendar,
  Zap,
  TrendingUp,
  Moon,
  Palette,
  Copy,
  Check,
  BookMarked,
} from 'lucide-react';
import {
  INITIAL_SUBJECTS,
  INITIAL_NOTES,
  INITIAL_EXAMS,
  INITIAL_FLASHCARDS,
  INITIAL_PROFESSOR_RECOMMENDATIONS,
  INITIAL_STUDENT_TIPS,
  INITIAL_PROFESSOR_CONTACTS,
  NOTE_CATEGORIES,
  PARCIAL_INSTANCES,
  NoteCategory,
  ParcialInstance,
  StudyNote,
  Subject,
  ExamChallenge,
  ProfessorContact,
} from './data/mockDatabase';
import { ExamSimulatorLab } from './components/ExamSimulatorLab';
import { CorrelativesMap, SubjectStatus } from './components/CorrelativesMap';
import { RadarAndFlashcards } from './components/RadarAndFlashcards';
import { StudentTipsAndProfessors } from './components/StudentTipsAndProfessors';
import { ProfessorDirectory } from './components/ProfessorDirectory';
import { PromoCalculatorAndChecklist } from './components/PromoCalculatorAndChecklist';
import { AcademicCalendar } from './components/AcademicCalendar';
import {
  CalendarEvent,
  buildOfficialEvents,
  loadCustomEvents,
  saveCustomEvents,
  upcomingEvents,
  formatShortDate,
  daysUntil,
  relativeLabel,
} from './data/academicCalendar';
import { AuthLoginScreen, AppUser, StoredAccount } from './components/AuthLoginScreen';
import { AdminDashboard, NoteDisplayMode } from './components/AdminDashboard';
import { ThemePaletteSection } from './components/ThemePaletteSection';
import { CollapsibleCard } from './components/CollapsibleCard';
import {
  UNNE_ARCHIVE_FILES,
  UNNE_PLAN_FILES,
  ArchiveNoteOverride,
  archiveFileToStudyNote,
  formatFileBytes,
  getArchiveVisualMeta,
  resolveUnneFileUrl,
  IMAGE_PREVIEW_EXTENSIONS,
  TEXT_PREVIEW_EXTENSIONS,
} from './utils/unneFiles';
import {
  verifyUserSessionSignature,
  validateUploadedFileSecurity,
  detectMaliciousPayload,
  sanitizeUserText,
  sanitizeContentBody,
  logSecurityEvent,
} from './utils/security';

type TopToolView =
  | 'apuntes-flow'
  | 'professors-view'
  | 'student-tips-view'
  | 'professor-emails-view'
  | 'calculator-checklist-view'
  | 'calendar-view'
  | 'simulator'
  | 'correlatives'
  | 'radar';

type YearSubTab =
  | 'General'
  | NoteCategory
  | 'Comunidad'
  | 'Ranking';

const YEAR_SUB_TABS: { id: YearSubTab; label: string; badgeColor?: string }[] = [
  { id: 'General', label: 'Todos en General' },
  { id: 'Teoría y Apuntes', label: 'Teoría y Apuntes' },
  { id: 'Práctica y TPs', label: 'Práctica y TPs' },
  { id: 'Parcial Práctico', label: 'Parcial Práctico' },
  { id: 'Parcial Teórico', label: 'Parcial Teórico' },
  { id: 'Proyectos', label: 'Proyectos' },
  { id: 'Finales', label: 'Finales' },
  { id: 'Exámenes Libres', label: 'Exámenes Libres' },
  { id: 'Bibliografía y Libros', label: 'Bibliografía y Libros' },
  {
    id: 'Comunidad',
    label: 'Comunidad (Subir Apuntes)',
    badgeColor: 'indigo',
  },
  {
    id: 'Ranking',
    label: 'Sistema de Ranking',
    badgeColor: 'amber',
  },
];

const YEAR_DESCRIPTIONS: Record<number, { title: string; subtitle: string }> = {
  1: {
    title: '1° Año — Algoritmia y Fundamentos',
    subtitle: 'Algoritmos I y II, Álgebra, Lógica y Matemática Computacional, Sistemas y Organizaciones.',
  },
  2: {
    title: '2° Año — Paradigmas, Arquitectura, Cálculo y Datos',
    subtitle: 'Paradigmas y Lenguajes, Arquitectura de Computadoras, Cálculo, POO, Sistemas Operativos, Bases de Datos I, Administración.',
  },
  3: {
    title: '3° Año — Ingeniería, Comunicaciones y Estadística (APU)',
    subtitle: 'Comunicaciones de Datos, Ingeniería de Software I y II, Probabilidad y Estadística, Taller I y II, Inglés Técnico.',
  },
  4: {
    title: '4° Año — Teoría, Redes, Datos II y Economía',
    subtitle: 'Teoría de la Computación, Economía Aplicada, Redes de Datos y Comunicaciones, Bases de Datos II.',
  },
  5: {
    title: '5° Año — Seguridad, Proyecto Final y Especialización',
    subtitle: 'Auditoría y Seguridad Informática, Proyecto Integrador de Carrera y Ciencia de Datos.',
  },
};

const DEFAULT_REGISTERED_USERS: StoredAccount[] = [
  {
    id: 'usr-demo-alestte',
    username: 'alestte',
    displayName: 'alestte',
    role: 'user',
    authProvider: 'username',
    createdAt: 'Cuenta Alumno Cifrada',
  },
  {
    id: 'admin-master',
    username: 'admin',
    displayName: 'Administrador General',
    role: 'admin',
    authProvider: 'username',
    createdAt: 'Cuenta Oficial Cifrada',
  },
  {
    id: 'usr-demo-alumno',
    username: 'alumno_lsi',
    displayName: 'Alumno de la Comunidad',
    role: 'user',
    authProvider: 'username',
    createdAt: 'Cuenta Alumno Cifrada',
  },
];

export function App() {
  // =========================================================================
  // AUTENTICACIÓN BLINDADA Y SEPARACIÓN DE ROLES (USER vs ADMIN)
  // =========================================================================
  const [securityAlertBanner, setSecurityAlertBanner] = useState<string | null>(
    null
  );

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('campuslab_current_user_v2');
      if (!saved) return null;
      const parsed: AppUser = JSON.parse(saved);
      const check = verifyUserSessionSignature(parsed);
      if (!check.valid) {
        localStorage.removeItem('campuslab_current_user_v2');
        logSecurityEvent(
          'CRITICAL',
          'SESSION_TAMPERING_BLOCKED',
          parsed?.username || 'desconocido',
          check.reason || 'Sesión revocada por firma inválida.'
        );
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [registeredUsers, setRegisteredUsers] = useState<StoredAccount[]>(() => {
    const saved = localStorage.getItem('campuslab_registered_users_v2');
    return saved ? JSON.parse(saved) : DEFAULT_REGISTERED_USERS;
  });

  // Permite que un Administrador autenticado previsualice cómo ve la página un Alumno sin perder su sesión de Admin
  const [adminPreviewingAsUser, setAdminPreviewingAsUser] =
    useState<boolean>(false);

  // Si el usuario tiene rol 'admin', puede alternar entre el Panel Admin ('admin-panel') o la vista de usuario ('user-view')
  const [adminModeView, setAdminModeView] = useState<
    'user-view' | 'admin-panel'
  >('user-view');

  // Modo de visualización de las publicaciones ('detailed' = Detallada | 'file-preview' = Solo Título del Archivo + Vista Previa + Descarga)
  const [noteDisplayMode, setNoteDisplayMode] = useState<NoteDisplayMode>(() => {
    const saved = localStorage.getItem('campuslab_note_display_mode_v1');
    return (saved as NoteDisplayMode) || 'detailed';
  });

  useEffect(() => {
    localStorage.setItem('campuslab_note_display_mode_v1', noteDisplayMode);
  }, [noteDisplayMode]);

  // El usuario tiene permisos efectivos de Admin solo si su sesión firmada es 'admin' y no está en modo previsualización de alumno
  const isAuthenticatedAdmin = currentUser?.role === 'admin';
  const isAdmin = isAuthenticatedAdmin && !adminPreviewingAsUser;

  // Verificación continua anti-manipulación de localStorage (F12 DevTools) y auto-cierre por inactividad (30 min)
  useEffect(() => {
    if (!currentUser) return;

    const verifyIntegrity = () => {
      const check = verifyUserSessionSignature(currentUser);
      if (!check.valid) {
        logSecurityEvent(
          'CRITICAL',
          'SESSION_TAMPERING_BLOCKED',
          currentUser.username,
          check.reason || 'Intento de alteración de rol detectado.'
        );
        setSecurityAlertBanner(
          check.reason ||
            'Se detectó un intento de modificar la sesión manualmente. Por seguridad debés volver a iniciar sesión.'
        );
        setCurrentUser(null);
      }
    };

    verifyIntegrity();

    const onStorageChange = (e: StorageEvent) => {
      if (e.key === 'campuslab_current_user_v2' && e.newValue) {
        try {
          const modified = JSON.parse(e.newValue);
          const check = verifyUserSessionSignature(modified);
          if (!check.valid) {
            logSecurityEvent(
              'CRITICAL',
              'SESSION_TAMPERING_BLOCKED',
              modified?.username || 'desconocido',
              'Bloqueo inmediato: intento de escalar privilegios editando LocalStorage.'
            );
            localStorage.removeItem('campuslab_current_user_v2');
            setSecurityAlertBanner(
              'Intento de escalada de privilegios en LocalStorage bloqueado por firma criptográfica.'
            );
            setCurrentUser(null);
          }
        } catch {
          setCurrentUser(null);
        }
      }
    };

    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        'campuslab_current_user_v2',
        JSON.stringify(currentUser)
      );
    } else {
      localStorage.removeItem('campuslab_current_user_v2');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(
      'campuslab_registered_users_v2',
      JSON.stringify(registeredUsers)
    );
  }, [registeredUsers]);

  // =========================================================================
  // DATOS EDITABLES POR EL ADMINISTRADOR Y PERSISTIDOS EN LOCALSTORAGE
  // =========================================================================
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem('campuslab_subjects_v6');
      if (saved) {
        const parsed = JSON.parse(saved) as Subject[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((s) => s.id));
          return [...parsed, ...INITIAL_SUBJECTS.filter((s) => !existingIds.has(s.id))];
        }
      }
    } catch {
      // ignore corrupted storage
    }
    return INITIAL_SUBJECTS;
  });

  const [notes, setNotes] = useState<StudyNote[]>(() => {
    try {
      const saved = localStorage.getItem('campuslab_notes_v7');
      if (saved) {
        const parsed = JSON.parse(saved) as StudyNote[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((n) => n.id));
          return [...parsed, ...INITIAL_NOTES.filter((n) => !existingIds.has(n.id))];
        }
      }
    } catch {
      // ignore corrupted storage
    }
    return INITIAL_NOTES;
  });

  const [exams, setExams] = useState<ExamChallenge[]>(() => {
    const saved = localStorage.getItem('campuslab_exams_v5');
    return saved ? JSON.parse(saved) : INITIAL_EXAMS;
  });

  const [contacts, setContacts] = useState<ProfessorContact[]>(() => {
    const saved = localStorage.getItem('campuslab_prof_contacts_v3');
    return saved ? JSON.parse(saved) : INITIAL_PROFESSOR_CONTACTS;
  });

  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>(() => {
    const saved = localStorage.getItem('campuslab_votes_v5');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('campuslab_subjects_v6', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('campuslab_notes_v7', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('campuslab_exams_v5', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('campuslab_prof_contacts_v3', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('campuslab_votes_v5', JSON.stringify(userVotes));
  }, [userVotes]);

  const handleResetAllData = () => {
    setSubjects(INITIAL_SUBJECTS);
    setNotes(INITIAL_NOTES);
    setExams(INITIAL_EXAMS);
    setContacts(INITIAL_PROFESSOR_CONTACTS);
    setUserVotes({});
  };

  // =========================================================================
  // NAVEGACIÓN PRINCIPAL (BARRA LATERAL MINIMALISTA + FLUJO DE AÑO → MATERIA)
  // =========================================================================
  const [mainNavSection, setMainNavSection] = useState<
    | 'inicio'
    | 'materias'
    | 'profesores'
    | 'calendario'
    | 'comunidad'
    | 'herramientas'
    | 'perfil'
    | 'apariencia'
  >('inicio');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showNotificationsMenu, setShowNotificationsMenu] =
    useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  // Eventos personalizados del Calendario Académico
  const [customCalendarEvents, setCustomCalendarEvents] = useState<CalendarEvent[]>(
    () => loadCustomEvents()
  );
  useEffect(() => {
    saveCustomEvents(customCalendarEvents);
  }, [customCalendarEvents]);

  const allCalendarEvents = useMemo(
    () => [...buildOfficialEvents(subjects), ...customCalendarEvents],
    [subjects, customCalendarEvents]
  );

  // Estado de vista previa en vivo (panel lateral derecho) y apuntes guardados
  const [previewNoteId, setPreviewNoteId] = useState<string>(
    () => INITIAL_NOTES[0]?.id || ''
  );
  const [savedNoteIds, setSavedNoteIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('campuslab_saved_notes_v1');
    return saved ? JSON.parse(saved) : [];
  });
  const [homeFeedTab, setHomeFeedTab] = useState<
    'para-vos' | 'guardados' | 'valorados'
  >('para-vos');
  const [homeSortBy, setHomeSortBy] = useState<'recent' | 'votes'>('recent');

  useEffect(() => {
    localStorage.setItem(
      'campuslab_saved_notes_v1',
      JSON.stringify(savedNoteIds)
    );
  }, [savedNoteIds]);

  const toggleSaveNote = (noteId: string) => {
    setSavedNoteIds((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  const [topView, setTopView] = useState<TopToolView>('apuntes-flow');

  // Paso 1 Obligatorio: Selección de Año (null = pantalla de elegir Año)
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Paso 2 Obligatorio al elegir Año en Materias: elegir qué Materia ver
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | 'all'>('all');
  const [needsSubjectSelection, setNeedsSubjectSelection] = useState<boolean>(false);

  // Apartado activo dentro del año
  const [activeSubTab, setActiveSubTab] = useState<YearSubTab>('General');

  // Sub-selector de instancia de parcial
  const [selectedParcialInstance, setSelectedParcialInstance] = useState<
    ParcialInstance | 'all'
  >('all');

  // Filtro de visualización de sección Verificados vs No Verificados
  const [verificationFilter, setVerificationFilter] = useState<
    'both' | 'only-verified' | 'only-unverified'
  >('both');

  // Filtro opcional por carpeta de origen + paginación incremental
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all');
  const [visibleVerifiedLimit, setVisibleVerifiedLimit] = useState<number>(36);
  const [visibleUnverifiedLimit, setVisibleUnverifiedLimit] = useState<number>(36);
  const [showPlansModal, setShowPlansModal] = useState<boolean>(false);

  // Votos / verificaciones / bajas admin sobre archivos del archivo base UNNE-LSI (sin duplicar en localStorage)
  const [archiveOverrides, setArchiveOverrides] = useState<
    Record<string, ArchiveNoteOverride>
  >(() => {
    try {
      const saved = localStorage.getItem('campuslab_archive_overrides_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignorar error de almacenamiento
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        'campuslab_archive_overrides_v1',
        JSON.stringify(archiveOverrides)
      );
    } catch {
      // ignorar error de almacenamiento
    }
  }, [archiveOverrides]);

  // Buscador
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Estado del Mapa de Correlatividades
  const [statusMap, setStatusMap] = useState<Record<string, SubjectStatus>>({
    'algoritmos-1': 'approved',
    'algoritmos-2': 'regular',
    arquitectura: 'regular',
    paradigmas: 'regular',
  });

  // Modal de lectura de apunte y carga en vivo de archivos de código/texto
  const [selectedNoteModal, setSelectedNoteModal] = useState<StudyNote | null>(null);
  const [modalTextPreview, setModalTextPreview] = useState<string | null>(null);
  const [modalTextLoading, setModalTextLoading] = useState<boolean>(false);
  const [modalTextError, setModalTextError] = useState<string | null>(null);
  const [copiedModalCode, setCopiedModalCode] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedNoteModal) {
      setModalTextPreview(null);
      setModalTextLoading(false);
      setModalTextError(null);
      setCopiedModalCode(false);
      return;
    }
    const ext = (selectedNoteModal.fileExt || '').toLowerCase();
    if (
      !selectedNoteModal.isArchiveBase ||
      !selectedNoteModal.externalFileUrl ||
      !TEXT_PREVIEW_EXTENSIONS.has(ext)
    ) {
      setModalTextPreview(null);
      setModalTextLoading(false);
      setModalTextError(null);
      return;
    }

    let cancelled = false;
    setModalTextLoading(true);
    setModalTextError(null);
    fetch(resolveUnneFileUrl(selectedNoteModal.externalFileUrl))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((txt) => {
        if (!cancelled) {
          setModalTextPreview(txt);
          setModalTextLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setModalTextError(
            'No se pudo cargar la vista previa de texto en este entorno. Podés abrir o descargar el archivo real.'
          );
          setModalTextLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedNoteModal]);

  // Estados para expandir o minimizar las opciones del panel derecho (evita sobrecargar la pantalla)
  const [rightToolsOpen, setRightToolsOpen] = useState<boolean>(true);
  const [rightCompilerOpen, setRightCompilerOpen] = useState<boolean>(true);
  const [rightProfsOpen, setRightProfsOpen] = useState<boolean>(false);
  const [rightTipsOpen, setRightTipsOpen] = useState<boolean>(false);

  // Paneles laterales colapsables (Inicio + Vista previa de Materias). Persistido para que la pantalla
  // quede como el usuario la dejó (menos sobrecarga visual).
  const PANELS_STORAGE_KEY = 'campus_unne_panels_v1';
  const DEFAULT_PANELS: Record<string, boolean> = {
    'inicio-academico': true,
    'inicio-accesos': true,
    'inicio-preview': true,
    'inicio-progreso': false,
    'inicio-eventos': false,
    'materias-preview': true,
  };
  const [panelsOpen, setPanelsOpen] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('campus_unne_panels_v1');
      if (!raw) return DEFAULT_PANELS;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const merged = { ...DEFAULT_PANELS };
      for (const k of Object.keys(DEFAULT_PANELS)) {
        if (typeof parsed[k] === 'boolean') merged[k] = parsed[k] as boolean;
      }
      return merged;
    } catch {
      return DEFAULT_PANELS;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(PANELS_STORAGE_KEY, JSON.stringify(panelsOpen));
    } catch {
      /* sin almacenamiento: el estado dura solo la sesión */
    }
  }, [panelsOpen]);
  const isPanelOpen = (id: string) => panelsOpen[id] ?? true;
  const togglePanel = (id: string) =>
    setPanelsOpen((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  const setPanelsGroup = (ids: string[], open: boolean) =>
    setPanelsOpen((prev) => {
      const next = { ...prev };
      ids.forEach((id) => (next[id] = open));
      return next;
    });
  const INICIO_SIDE_PANELS = [
    'inicio-accesos',
    'inicio-preview',
    'inicio-progreso',
    'inicio-eventos',
  ];

  // Estado del formulario dentro del apartado "Comunidad (Subir Apuntes)"
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || 'algoritmos-1');
  const [newCategory, setNewCategory] = useState<NoteCategory>('Parcial Práctico');
  const [newParcialInstance, setNewParcialInstance] =
    useState<ParcialInstance>('1° Parcial');
  const [newAuthor, setNewAuthor] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [uploadSuccessBanner, setUploadSuccessBanner] = useState<string | null>(null);
  const [uploadSecurityError, setUploadSecurityError] = useState<string | null>(null);
  const [lastUploadTimestamp, setLastUploadTimestamp] = useState<number>(0);

  // Materias EXCLUSIVAS del año seleccionado
  const subjectsOfSelectedYear = useMemo(() => {
    if (selectedYear === null) return [];
    return subjects.filter((s) => s.year === selectedYear);
  }, [selectedYear, subjects]);

  useEffect(() => {
    if (selectedYear !== null && subjectsOfSelectedYear.length > 0) {
      setNewSubjectId(
        selectedSubjectId !== 'all'
          ? selectedSubjectId
          : subjectsOfSelectedYear[0].id
      );
    }
  }, [selectedYear, selectedSubjectId, subjectsOfSelectedYear]);

  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
    setSelectedSubjectId('all');
    setNeedsSubjectSelection(true);
    setActiveSubTab('General');
    setSelectedParcialInstance('all');
    setSelectedFolderFilter('all');
    setVerificationFilter('both');
    setVisibleVerifiedLimit(36);
    setVisibleUnverifiedLimit(36);
    setTopView('apuntes-flow');
  };

  const handleSelectSubject = (subjectId: string | 'all') => {
    setSelectedSubjectId(subjectId);
    setNeedsSubjectSelection(false);
    setMainNavSection('materias');
    setActiveSubTab('General');
    setSelectedParcialInstance('all');
    setSelectedFolderFilter('all');
    setVerificationFilter('both');
    setVisibleVerifiedLimit(36);
    setVisibleUnverifiedLimit(36);
    setTopView('apuntes-flow');
  };

  const handleBackToSelectYear = () => {
    setSelectedYear(null);
    setSelectedSubjectId('all');
    setNeedsSubjectSelection(false);
    setSelectedFolderFilter('all');
    setTopView('apuntes-flow');
  };

  const handleVote = (noteId: string, direction: 'up' | 'down') => {
    const previousVote = userVotes[noteId];
    let delta = 0;

    if (previousVote === direction) {
      delta = direction === 'up' ? -1 : 1;
      const updated = { ...userVotes };
      delete updated[noteId];
      setUserVotes(updated);
    } else if (!previousVote) {
      delta = direction === 'up' ? 1 : -1;
      setUserVotes({ ...userVotes, [noteId]: direction });
    } else {
      delta = direction === 'up' ? 2 : -2;
      setUserVotes({ ...userVotes, [noteId]: direction });
    }

    if (noteId.startsWith('unne-file-')) {
      setArchiveOverrides((prev) => ({
        ...prev,
        [noteId]: {
          ...prev[noteId],
          votesDelta: (prev[noteId]?.votesDelta || 0) + delta,
        },
      }));
      return;
    }

    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, votes: n.votes + delta } : n))
    );
  };

  // Solo el Admin puede verificar/desverificar o eliminar un apunte
  const handleToggleVerifyNote = (noteId: string) => {
    if (!isAdmin) return;
    if (noteId.startsWith('unne-file-')) {
      setArchiveOverrides((prev) => {
        const currentVerified =
          prev[noteId]?.verified !== undefined ? prev[noteId].verified : true;
        return {
          ...prev,
          [noteId]: { ...prev[noteId], verified: !currentVerified },
        };
      });
      return;
    }
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, verifiedByStudents: !n.verifiedByStudents } : n
      )
    );
  };

  const handleDeleteNoteByAdmin = (noteId: string) => {
    if (!isAdmin) return;
    if (noteId.startsWith('unne-file-')) {
      setArchiveOverrides((prev) => ({
        ...prev,
        [noteId]: { ...prev[noteId], deleted: true },
      }));
    } else {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    }
    if (selectedNoteModal?.id === noteId) {
      setSelectedNoteModal(null);
    }
  };

  const handleToggleSubjectStatus = (subjectId: string) => {
    setStatusMap((prev) => {
      const curr = prev[subjectId] || 'pending';
      const next: SubjectStatus =
        curr === 'pending' ? 'regular' : curr === 'regular' ? 'approved' : 'pending';
      return { ...prev, [subjectId]: next };
    });
  };

  const handleFileImportInCommunity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadSecurityError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Escáner de seguridad sobre el archivo (extensión, ejecutables y tamaño máximo 512 KB)
    const validation = validateUploadedFileSecurity(
      file,
      currentUser?.username || 'anónimo'
    );
    if (!validation.allowed) {
      setUploadSecurityError(
        validation.error || 'Archivo bloqueado por el escáner de seguridad.'
      );
      e.target.value = '';
      return;
    }

    if (!newTitle) {
      setNewTitle(sanitizeUserText(file.name.replace(/\.[^/.]+$/, ''), 120));
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === 'string') {
        const check = detectMaliciousPayload(text);
        if (check.malicious) {
          logSecurityEvent(
            'CRITICAL',
            'XSS_PAYLOAD_BLOCKED',
            currentUser?.username || 'anónimo',
            `Archivo "${file.name}" contenía scripts maliciosos y fue neutralizado.`
          );
          setUploadSecurityError(
            'Alerta de seguridad: El archivo contenía scripts ejecutables no permitidos y fue bloqueado.'
          );
          return;
        }
        const safeText = sanitizeContentBody(text);
        setNewContent(safeText);
        if (!newSummary) {
          setNewSummary(sanitizeUserText(safeText.slice(0, 160), 180) + '...');
        }
      }
    };
    reader.readAsText(file);
  };

  const isParcialCategory = (cat: string) =>
    cat === 'Parcial Práctico' || cat === 'Parcial Teórico';

  const handleCreateCommunityNote = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadSecurityError(null);
    if (!newTitle.trim()) return;

    // Rate limiting anti-spam (mínimo 10 segundos entre subidas consecutivas de usuarios normales)
    const now = Date.now();
    if (!isAdmin && now - lastUploadTimestamp < 10000) {
      const waitSec = Math.ceil((10000 - (now - lastUploadTimestamp)) / 1000);
      logSecurityEvent(
        'WARNING',
        'RATE_LIMIT_TRIGGERED',
        currentUser?.username || 'alumno',
        'Intento de subida masiva bloqueado por Rate Limiting Anti-Spam.'
      );
      setUploadSecurityError(
        `Protección Anti-Spam activa: Esperá ${waitSec} segundos antes de subir otro archivo.`
      );
      return;
    }

    // Escaneo Anti-XSS en todos los campos del formulario
    const combinedCheck = detectMaliciousPayload(
      `${newTitle} ${newSummary} ${newAuthor} ${newTags} ${newContent}`
    );
    if (combinedCheck.malicious) {
      logSecurityEvent(
        'CRITICAL',
        'XSS_PAYLOAD_BLOCKED',
        currentUser?.username || 'alumno',
        `Intento de inyección XSS bloqueado al subir el apunte "${newTitle.slice(
          0,
          40
        )}".`
      );
      setUploadSecurityError(
        'Escudo Anti-XSS: Se detectaron etiquetas <script> o código malicioso en el formulario. Publicación bloqueada.'
      );
      return;
    }

    const safeTitle = sanitizeUserText(newTitle, 140);
    const safeAuthor = sanitizeUserText(
      newAuthor.trim() || currentUser?.displayName || 'Alumno de la Comunidad',
      50
    );
    const safeSummary = sanitizeUserText(
      newSummary.trim() ||
        `Aporte de ${newCategory}${
          isParcialCategory(newCategory) ? ` (${newParcialInstance})` : ''
        } subido en el apartado de Comunidad.`,
      240
    );
    const safeContent = sanitizeContentBody(
      newContent.trim() || '# Contenido del apunte.'
    );

    const created: StudyNote = {
      id: `note-${Date.now()}`,
      title: safeTitle,
      subjectId: newSubjectId,
      category: newCategory,
      parcialInstance: isParcialCategory(newCategory)
        ? newParcialInstance
        : undefined,
      author: safeAuthor,
      createdAt: 'Recién subido',
      votes: 1,
      verifiedByStudents: isAdmin ? true : false,
      tags: newTags
        .split(',')
        .map((t) => sanitizeUserText(t, 28))
        .filter(Boolean)
        .slice(0, 8),
      summary: safeSummary,
      contentMarkdown: safeContent,
    };

    setLastUploadTimestamp(now);
    setNotes([created, ...notes]);
    setNewTitle('');
    setNewSummary('');
    setNewContent('');
    setNewTags('');
    setUploadSuccessBanner(
      isAdmin
        ? `¡Tu aporte "${created.title}" fue verificado y publicado con firma de Admin!`
        : `¡Tu aporte "${created.title}" pasó el escaneo de seguridad y fue publicado en Apuntes No Verificados!`
    );
    setTimeout(() => setUploadSuccessBanner(null), 5000);
  };

  // Unión transparente: apuntes subidos por la comunidad + archivos base de UNNE-LSI
  const archiveBaseNotes = useMemo(() => {
    return UNNE_ARCHIVE_FILES.filter(
      (f) => f.subjectId !== 'planes-lsi' && !archiveOverrides[f.id]?.deleted
    ).map((file) => archiveFileToStudyNote(file, archiveOverrides[file.id]));
  }, [archiveOverrides]);

  const unifiedNotes = useMemo(() => {
    return [...notes, ...archiveBaseNotes];
  }, [notes, archiveBaseNotes]);

  useEffect(() => {
    setSelectedFolderFilter('all');
    setVisibleVerifiedLimit(36);
    setVisibleUnverifiedLimit(36);
  }, [selectedYear, selectedSubjectId, activeSubTab, selectedParcialInstance]);

  // Carpetas disponibles dentro del contexto actual (Año / Materia / Categoría)
  const availableFoldersInScope = useMemo(() => {
    const counts = new Map<string, number>();
    unifiedNotes.forEach((note) => {
      if (!note.folderPath) return;
      const subj = subjects.find((s) => s.id === note.subjectId);
      if (selectedYear !== null && subj && subj.year !== selectedYear) return;
      if (selectedSubjectId !== 'all' && note.subjectId !== selectedSubjectId) return;
      if (
        activeSubTab !== 'General' &&
        activeSubTab !== 'Comunidad' &&
        activeSubTab !== 'Ranking' &&
        note.category !== activeSubTab
      ) {
        return;
      }
      if (
        (activeSubTab === 'Parcial Práctico' || activeSubTab === 'Parcial Teórico') &&
        selectedParcialInstance !== 'all' &&
        note.parcialInstance !== selectedParcialInstance
      ) {
        return;
      }
      counts.set(note.folderPath, (counts.get(note.folderPath) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0], 'es'));
  }, [
    unifiedNotes,
    subjects,
    selectedYear,
    selectedSubjectId,
    activeSubTab,
    selectedParcialInstance,
  ]);

  // Notas y archivos filtrados exclusivamente por Año, Materia, Categoría, Carpeta y Búsqueda
  const filteredNotes = useMemo(() => {
    return unifiedNotes
      .filter((note) => {
        const subj = subjects.find((s) => s.id === note.subjectId);

        if (selectedYear !== null && subj && subj.year !== selectedYear) {
          return false;
        }

        if (selectedSubjectId !== 'all' && note.subjectId !== selectedSubjectId) {
          return false;
        }

        if (
          activeSubTab !== 'General' &&
          activeSubTab !== 'Comunidad' &&
          activeSubTab !== 'Ranking'
        ) {
          if (note.category !== activeSubTab) return false;
        }

        if (
          (activeSubTab === 'Parcial Práctico' ||
            activeSubTab === 'Parcial Teórico') &&
          selectedParcialInstance !== 'all'
        ) {
          if (note.parcialInstance !== selectedParcialInstance) return false;
        }

        if (selectedFolderFilter !== 'all') {
          if (note.folderPath !== selectedFolderFilter) return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = note.title.toLowerCase().includes(q);
          const matchSummary = note.summary.toLowerCase().includes(q);
          const matchContent = note.contentMarkdown.toLowerCase().includes(q);
          const matchCategory = note.category.toLowerCase().includes(q);
          const matchInstance = note.parcialInstance?.toLowerCase().includes(q);
          const matchFolder = note.folderPath?.toLowerCase().includes(q);
          const matchTags = note.tags.some((t) => t.toLowerCase().includes(q));
          const matchSubject = subj?.name.toLowerCase().includes(q);
          return (
            matchTitle ||
            matchSummary ||
            matchContent ||
            matchCategory ||
            matchInstance ||
            matchFolder ||
            matchTags ||
            matchSubject
          );
        }

        return true;
      })
      .sort((a, b) => {
        const aRecent = a.createdAt === 'Recién subido' ? 1 : 0;
        const bRecent = b.createdAt === 'Recién subido' ? 1 : 0;
        if (aRecent !== bRecent) return bRecent - aRecent;
        if (b.votes !== a.votes) return b.votes - a.votes;
        return a.title.localeCompare(b.title, 'es');
      });
  }, [
    unifiedNotes,
    subjects,
    selectedYear,
    selectedSubjectId,
    activeSubTab,
    selectedParcialInstance,
    selectedFolderFilter,
    searchQuery,
  ]);

  const verifiedNotes = useMemo(
    () => filteredNotes.filter((n) => n.verifiedByStudents),
    [filteredNotes]
  );

  const unverifiedNotes = useMemo(
    () => filteredNotes.filter((n) => !n.verifiedByStudents),
    [filteredNotes]
  );

  const countByParcialInstance = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    PARCIAL_INSTANCES.forEach((inst) => (counts[inst] = 0));

    unifiedNotes.forEach((note) => {
      const subj = subjects.find((s) => s.id === note.subjectId);
      if (selectedYear !== null && subj?.year !== selectedYear) return;
      if (selectedSubjectId !== 'all' && note.subjectId !== selectedSubjectId) return;
      if (
        activeSubTab === 'Parcial Práctico' ||
        activeSubTab === 'Parcial Teórico'
      ) {
        if (note.category !== activeSubTab) return;
      }
      counts.all += 1;
      if (note.parcialInstance) {
        counts[note.parcialInstance] = (counts[note.parcialInstance] || 0) + 1;
      }
    });
    return counts;
  }, [unifiedNotes, subjects, selectedYear, selectedSubjectId, activeSubTab]);

  // Ranking circunscripto al año seleccionado
  const rankedNotes = useMemo(() => {
    return unifiedNotes
      .filter((note) => {
        const subj = subjects.find((s) => s.id === note.subjectId);
        if (selectedYear !== null && subj?.year !== selectedYear) {
          return false;
        }
        if (selectedSubjectId !== 'all' && note.subjectId !== selectedSubjectId) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.votes - a.votes);
  }, [unifiedNotes, subjects, selectedYear, selectedSubjectId]);

  const contributorRanking = useMemo(() => {
    const map = new Map<
      string,
      { author: string; totalVotes: number; notesCount: number; topCategory: string }
    >();
    rankedNotes.forEach((n) => {
      const existing = map.get(n.author) || {
        author: n.author,
        totalVotes: 0,
        notesCount: 0,
        topCategory: n.category,
      };
      existing.totalVotes += n.votes;
      existing.notesCount += 1;
      map.set(n.author, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.totalVotes - a.totalVotes);
  }, [rankedNotes]);

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = { General: 0 };
    NOTE_CATEGORIES.forEach((c) => (counts[c] = 0));

    unifiedNotes.forEach((note) => {
      const subj = subjects.find((s) => s.id === note.subjectId);
      if (selectedYear !== null && subj?.year !== selectedYear) return;
      if (selectedSubjectId !== 'all' && note.subjectId !== selectedSubjectId) return;
      counts.General += 1;
      counts[note.category] = (counts[note.category] || 0) + 1;
    });
    return counts;
  }, [unifiedNotes, subjects, selectedYear, selectedSubjectId]);

  // =========================================================================
  // SI NO HAY SESIÓN INICIADA, MOSTRAMOS LA PANTALLA DE LOGIN
  // =========================================================================
  if (!currentUser) {
    return (
      <AuthLoginScreen
        onLoginSuccess={(user) => {
          setSecurityAlertBanner(null);
          setAdminPreviewingAsUser(false);
          setCurrentUser(user);
          setAdminModeView('user-view');
        }}
        registeredUsers={registeredUsers}
        onRegisterUser={(newAccount) =>
          setRegisteredUsers((prev) => [...prev, newAccount])
        }
        securityAlertBanner={securityAlertBanner}
      />
    );
  }

  // Función para obtener el nombre de archivo limpio y descargar la publicación o archivo real
  const getFormattedFileName = (note: StudyNote) => {
    if (note.isArchiveBase && note.title) {
      return note.title;
    }
    const cleanSlug = note.title
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s_-]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    const ext =
      note.fileExt ||
      (note.subjectId.includes('algoritmos') && note.category === 'Parcial Práctico'
        ? '.c'
        : note.subjectId === 'paradigmas-poo' && note.category === 'Parcial Práctico'
        ? '.java'
        : '.md');
    return `${cleanSlug}${ext}`;
  };

  const handleDownloadNoteFile = (note: StudyNote) => {
    const fileName = getFormattedFileName(note);
    if (note.externalFileUrl) {
      const realUrl = resolveUnneFileUrl(note.externalFileUrl);
      const a = document.createElement('a');
      a.href = realUrl;
      a.download = fileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const content = `# ${note.title}\n# Autor: ${note.author} | Categoría: ${note.category}${
      note.parcialInstance ? ` (${note.parcialInstance})` : ''
    }\n\n${note.contentMarkdown}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Renderizador de Apuntes y Exámenes con 3 Formatos (1. Filas con Columnas [grid], 2. Solo Columnas [detailed], 3. Vista Reducida 1 Línea [file-preview])
  const renderNoteCard = (
    note: StudyNote,
    _index: number,
    isVerifiedSection: boolean
  ) => {
    const subj = subjects.find((s) => s.id === note.subjectId);
    const voteState = userVotes[note.id];
    const isSaved = savedNoteIds.includes(note.id);
    const isPreviewSelected = previewNoteId === note.id;
    const visualMeta = getArchiveVisualMeta(note.fileExt);
    const isCodeDoc = note.fileExt
      ? visualMeta.isCode
      : note.category === 'Parcial Práctico' || note.category === 'Proyectos';
    const fileBadge = note.fileExt
      ? visualMeta.extLabel
      : isCodeDoc
      ? subj?.id.includes('poo')
        ? 'JAVA'
        : 'C / TXT'
      : 'MD';
    const badgeClass = note.fileExt
      ? visualMeta.badgeClass
      : 'bg-k-26201a border-k-383028 text-k-d6b892';
    const estimatedPages = Math.max(
      6,
      Math.min(32, Math.round(note.contentMarkdown.length / 45) + 8)
    );
    const estimatedSize =
      note.fileSizeBytes !== undefined
        ? formatFileBytes(note.fileSizeBytes)
        : isCodeDoc
        ? `${Math.max(4, Math.round(note.contentMarkdown.length / 80))} KB`
        : `${Math.max(2, Math.round(estimatedPages * 0.45))} MB`;

    // =========================================================================
    // FORMATO 3: VISTA REDUCIDA (SOLO LÍNEA DE TEXTO DEL NOMBRE + ACCIONES)
    // =========================================================================
    if (noteDisplayMode === 'file-preview') {
      return (
        <div
          key={note.id}
          onClick={() => setPreviewNoteId(note.id)}
          className={`campus-file-row group cursor-pointer rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 transition border ${
            isPreviewSelected
              ? 'bg-k-241f1a border-k-d6b892/40'
              : 'border-k-2b241d hover:border-k-d6b892/30'
          }`}
        >
          {/* Izquierda: Etiqueta de tipo + Check + Únicamente la línea de texto del nombre */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span
              className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold shrink-0 ${badgeClass}`}
            >
              {fileBadge}
            </span>

            {isVerifiedSection ? (
              <span
                title="Apunte Verificado"
                className="w-4 h-4 rounded-full bg-k-d6b892/20 text-k-d6b892 flex items-center justify-center text-[10px] shrink-0"
              >
                ✓
              </span>
            ) : (
              <span
                title="No Verificado"
                className="w-2 h-2 rounded-full bg-k-8c7a67 shrink-0"
              />
            )}

            <span
              onClick={(e) => {
                e.stopPropagation();
                setPreviewNoteId(note.id);
                setSelectedNoteModal(note);
              }}
              className="text-xs sm:text-sm font-medium text-k-f3ece2 group-hover:text-k-d6b892 truncate transition"
            >
              {note.title}
            </span>

            {note.folderPath ? (
              <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-k-1e1915 border border-k-332b23 text-[10px] text-k-b5a38e truncate max-w-[200px] shrink-0">
                <FolderOpen className="w-2.5 h-2.5 text-k-d6b892 shrink-0" />
                {note.folderPath}
              </span>
            ) : (
              <span className="hidden md:inline-block text-[11px] text-k-8c7f72 truncate shrink-0">
                — {subj?.name}
              </span>
            )}
          </div>

          {/* Derecha: Likes + Vista Previa + Descargar + Controles Admin */}
          <div
            className="flex items-center gap-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleVote(note.id, 'up')}
              className={`hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] transition ${
                voteState === 'up'
                  ? 'text-k-d6b892 font-semibold'
                  : 'text-k-9e9285 hover:text-k-f3ece2'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  voteState === 'up' ? 'fill-k-d6b892 text-k-d6b892' : ''
                }`}
              />
              <span>{note.votes}</span>
            </button>

            <button
              onClick={() => {
                setPreviewNoteId(note.id);
                setSelectedNoteModal(note);
              }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-k-211c17 hover:bg-k-2d261f text-k-d8cfc4 border border-k-332b23 text-[11px] font-medium transition"
            >
              <Eye className="w-3 h-3 text-k-d6b892" />
              <span className="hidden sm:inline">Vista previa</span>
            </button>

            <button
              onClick={() => handleDownloadNoteFile(note)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-k-d6b892 hover:bg-k-e3c7a3 text-k-14110e text-[11px] font-semibold transition"
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">Descargar</span>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => handleToggleVerifyNote(note.id)}
                  title="Verificar / Desverificar (Admin)"
                  className="p-1 rounded-full bg-k-241f1a hover:bg-k-d6b892 text-k-d6b892 hover:text-k-14110e border border-k-383028 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteNoteByAdmin(note.id)}
                  title="Eliminar (Admin)"
                  className="p-1 rounded-full bg-rose-950/60 hover:bg-rose-700 text-rose-300 hover:text-white transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      );
    }

    // =========================================================================
    // FORMATO 1: FILAS CON COLUMNAS (GRILLA DE TARJETAS CON MINIATURA DE PÁGINA)
    // =========================================================================
    if (noteDisplayMode === 'grid') {
      return (
        <div
          key={note.id}
          onClick={() => setPreviewNoteId(note.id)}
          className={`group cursor-pointer rounded-3xl p-3.5 flex flex-col justify-between transition-all hover:-translate-y-0.5 border ${
            isPreviewSelected
              ? 'bg-k-211c17 border-k-d6b892/30 shadow-lg'
              : 'campus-surface hover:border-k-d6b892/20'
          }`}
        >
          {/* Miniatura Superior estilo Hoja de Documento (como Imagen 1) */}
          <div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setPreviewNoteId(note.id);
                setSelectedNoteModal(note);
              }}
              className="relative h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-k-e2d9cb via-k-d5c8b6 to-k-bfb09c text-k-1c1814 p-3.5 flex flex-col justify-between border border-k-383028/25 shadow-inner"
            >
              {/* Etiqueta superior izquierda (PDF / TXT + Verificado) */}
              <div className="flex items-center justify-between gap-2 relative z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-k-2b241d/85 text-k-f3ece2 text-[10px] font-semibold">
                  <FileText className="w-2.5 h-2.5 text-k-d6b892" />
                  {fileBadge}
                </span>
                {isVerifiedSection && (
                  <span className="px-2 py-0.5 rounded-md bg-k-1f291e/85 text-k-b7d1b0 text-[9px] font-semibold">
                    ✓ Verificado
                  </span>
                )}
              </div>

              {/* Simulación de hoja de apunte con título serif y líneas de texto/diagrama */}
              <div className="my-auto pt-1 space-y-1.5 relative z-10">
                <div className="font-editorial text-sm font-semibold text-k-181410 text-center truncate px-2">
                  {subj?.name.split(' ')[0] || 'Apunte'} — {note.category}
                </div>
                <div className="bg-white/45 rounded-lg p-2 space-y-1 border border-k-1c1814/10">
                  <p className="text-[9px] font-mono text-k-2b241d line-clamp-3 leading-tight">
                    {note.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Título del Documento */}
            <h3
              onClick={(e) => {
                e.stopPropagation();
                setPreviewNoteId(note.id);
                setSelectedNoteModal(note);
              }}
              className="text-xs sm:text-sm font-semibold text-k-f3ece2 group-hover:text-k-d6b892 line-clamp-2 mt-3 px-1 transition leading-snug"
            >
              {note.title}
            </h3>
          </div>

          {/* Pie de Tarjeta: ♡ Votos | ⬇ Tamaño/Descargar | Acciones */}
          <div
            className="pt-3 mt-2 border-t border-k-26211c px-1 flex items-center justify-between text-[11px] text-k-9e9285"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleVote(note.id, 'up')}
                className={`inline-flex items-center gap-1 transition ${
                  voteState === 'up'
                    ? 'text-k-d6b892 font-semibold'
                    : 'hover:text-k-f3ece2'
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    voteState === 'up' ? 'fill-k-d6b892 text-k-d6b892' : ''
                  }`}
                />
                <span>{note.votes}</span>
              </button>

              <button
                onClick={() => handleDownloadNoteFile(note)}
                className="inline-flex items-center gap-1 hover:text-k-d6b892 transition"
                title="Descargar archivo"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{estimatedSize}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {isAdmin && (
                <>
                  <button
                    onClick={() => handleToggleVerifyNote(note.id)}
                    title="Verificar / Desverificar (Admin)"
                    className="p-1 rounded-lg bg-k-241f1a hover:bg-k-d6b892 text-k-d6b892 hover:text-k-14110e transition"
                  >
                    <ShieldCheck className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteNoteByAdmin(note.id)}
                    title="Eliminar (Admin)"
                    className="p-1 rounded-lg bg-rose-950/60 hover:bg-rose-700 text-rose-300 hover:text-white transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setPreviewNoteId(note.id);
                  setSelectedNoteModal(note);
                }}
                className="px-2 py-0.5 rounded-md hover:bg-k-26211c text-k-c8bcb0 hover:text-k-f3ece2 font-medium transition"
              >
                Abrir
              </button>
            </div>
          </div>
        </div>
      );
    }

    // =========================================================================
    // FORMATO 2: SOLO COLUMNAS (TARJETA HORIZONTAL CON PORTADA UNNE — IMAGEN 2)
    // =========================================================================
    return (
      <div
        key={note.id}
        onClick={() => setPreviewNoteId(note.id)}
        className={`group cursor-pointer rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch gap-5 transition-all border ${
          isPreviewSelected
            ? 'bg-k-201b16 border-k-d6b892/30 shadow-lg'
            : 'campus-surface hover:border-k-d6b892/20'
        }`}
      >
        {/* Portada Izquierda estilo Cuaderno UNNE (como Imagen 2) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setPreviewNoteId(note.id);
            setSelectedNoteModal(note);
          }}
          className={`w-full sm:w-40 h-36 rounded-2xl p-3.5 flex flex-col justify-between shrink-0 relative overflow-hidden border ${
            isCodeDoc
              ? 'bg-gradient-to-br from-k-1d1915 via-k-15120f to-k-0e0c0a text-k-f3ece2 border-k-332b23'
              : 'bg-gradient-to-br from-k-e2d8c9 via-k-cbbba5 to-k-948470 text-k-171310 border-k-383028/25'
          }`}
        >
          <div className="text-[10px] font-bold tracking-wider uppercase opacity-80">
            UNNE
          </div>

          <div className="font-editorial text-sm font-semibold leading-snug line-clamp-3 relative z-10">
            {subj?.name || note.title}
          </div>

          <div className="inline-flex items-center self-start px-2.5 py-0.5 rounded-md bg-k-14110e/85 text-k-e5d5c0 text-[10px] font-mono">
            {fileBadge} • {note.fileSizeBytes !== undefined ? estimatedSize : `${estimatedPages} pág.`}
          </div>
        </div>

        {/* Contenido Central y Acciones Derecha */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
          <div className="space-y-2">
            {/* Fila superior de etiquetas + Bookmark a la derecha */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-k-2a231c border border-k-3d3329 text-k-d6b892 text-[11px] font-medium">
                  <GraduationCap className="w-3 h-3" />
                  {subj?.name || note.subjectId}
                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-k-231e19 border border-k-362e26 text-k-d8cfc4 text-[11px] font-medium">
                  {note.category}
                  {note.parcialInstance ? ` • ${note.parcialInstance}` : ''}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold ${badgeClass}`}
                >
                  {fileBadge}
                </span>

                {note.folderPath && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-k-1e1915 border border-k-332b23 text-k-b5a38e text-[11px] font-medium">
                    <FolderOpen className="w-3 h-3 text-k-d6b892" />
                    {note.folderPath}
                  </span>
                )}

                {isVerifiedSection ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-k-1e281d border border-k-495c3f/30 text-k-a9c79e text-[11px] font-medium">
                    ✓ Resuelto / Verificado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-k-2b2218 border border-k-d6b892/20 text-k-d6b892 text-[11px] font-medium">
                    Comunidad
                  </span>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaveNote(note.id);
                }}
                title={isSaved ? 'Quitar de guardados' : 'Guardar apunte'}
                className="text-k-9e9285 hover:text-k-d6b892 transition shrink-0"
              >
                <Bookmark
                  className={`w-4 h-4 ${
                    isSaved ? 'fill-k-d6b892 text-k-d6b892' : ''
                  }`}
                />
              </button>
            </div>

            {/* Título en Tipografía Editorial Serif */}
            <h3
              onClick={(e) => {
                e.stopPropagation();
                setPreviewNoteId(note.id);
                setSelectedNoteModal(note);
              }}
              className="font-editorial text-lg sm:text-xl text-k-f3ece2 group-hover:text-k-d6b892 cursor-pointer transition leading-snug"
            >
              {note.title}
            </h3>

            {/* Resumen */}
            <p className="text-xs text-k-a39688 line-clamp-2 leading-relaxed">
              {note.summary}
            </p>
          </div>

          {/* Fila inferior: Autor, Votos y Antigüedad a la izquierda | Botones Guardar y Descargar a la derecha */}
          <div
            className="pt-2 flex flex-wrap items-center justify-between gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center gap-4 text-xs text-k-9e9285">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-k-d6b892" />
                {note.author}
              </span>

              <button
                onClick={() => handleVote(note.id, 'up')}
                className={`inline-flex items-center gap-1 transition ${
                  voteState === 'up'
                    ? 'text-k-d6b892 font-semibold'
                    : 'hover:text-k-f3ece2'
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    voteState === 'up' ? 'fill-k-d6b892 text-k-d6b892' : ''
                  }`}
                />
                <span>{note.votes}</span>
              </button>

              <span>{note.createdAt}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isAdmin && (
                <>
                  <button
                    onClick={() => handleToggleVerifyNote(note.id)}
                    className="px-2.5 py-1.5 rounded-full bg-k-241f1a hover:bg-k-d6b892 text-k-d6b892 hover:text-k-14110e border border-k-383028 text-[11px] font-medium transition"
                  >
                    {note.verifiedByStudents ? 'Desverificar' : 'Verificar'}
                  </button>
                  <button
                    onClick={() => handleDeleteNoteByAdmin(note.id)}
                    className="p-1.5 rounded-full bg-rose-950/60 hover:bg-rose-700 text-rose-300 hover:text-white transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              <button
                onClick={() => toggleSaveNote(note.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-medium transition ${
                  isSaved
                    ? 'bg-k-332b23 border-k-d6b892 text-k-d6b892'
                    : 'bg-k-1a1613 hover:bg-k-25201b border-k-332b23 text-k-d8cfc4'
                }`}
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${
                    isSaved ? 'fill-k-d6b892 text-k-d6b892' : ''
                  }`}
                />
                <span>{isSaved ? 'Guardado' : 'Guardar'}</span>
              </button>

              <button
                onClick={() => handleDownloadNoteFile(note)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-k-d6b892 hover:bg-k-e3c7a3 text-k-14110e text-xs font-semibold transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const displayUsername =
    currentUser.username === 'alumno_lsi' ? 'alestte' : currentUser.username;

  return (
    <div className="min-h-screen bg-k-0e0c0a text-k-f3ece2 flex flex-col lg:flex-row">
      {/* =====================================================================
          BARRA LATERAL IZQUIERDA MINIMALISTA (ESTÉTICA MODO OSCURO CÁLIDO)
         ===================================================================== */}
      <aside
        className={`${
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
        } w-full bg-k-12100d border-b lg:border-b-0 lg:border-r border-k-241f1a flex flex-col justify-between shrink-0 lg:min-h-screen lg:sticky lg:top-0 z-30 transition-all duration-300`}
      >
        {/* Bloque Superior: Logo + Navegación Principal */}
        <div className="p-5 space-y-7">
          {/* Logo ✦ CampusLab */}
          <div
            onClick={() => {
              setAdminModeView('user-view');
              setMainNavSection('inicio');
            }}
            className="flex items-center gap-3 cursor-pointer group px-1"
          >
            <div className="w-8 h-8 flex items-center justify-center text-k-e5d5c0 group-hover:scale-110 transition">
              <svg
                viewBox="0 0 24 24"
                className="w-7 h-7"
                fill="currentColor"
              >
                <path d="M12 0.5L14.3 9.7L23.5 12L14.3 14.3L12 23.5L9.7 14.3L0.5 12L9.7 9.7L12 0.5Z" />
              </svg>
            </div>
            {!sidebarCollapsed && (
              <span className="font-editorial text-2xl tracking-tight text-k-f3ece2">
                CampusLab
              </span>
            )}
          </div>

          {/* Menú Principal de Navegación Lateral */}
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {[
              { id: 'inicio' as const, label: 'Inicio', icon: Home },
              { id: 'materias' as const, label: 'Materias', icon: Layers },
              { id: 'profesores' as const, label: 'Correos Profesores', icon: Mail },
              { id: 'calendario' as const, label: 'Calendario', icon: Calendar },
              { id: 'comunidad' as const, label: 'Comunidad', icon: Users },
              { id: 'herramientas' as const, label: 'Herramientas', icon: Wrench },
              { id: 'perfil' as const, label: 'Perfil', icon: User },
              { id: 'apariencia' as const, label: 'Apariencia', icon: Palette },
            ].map((item) => {
              const IconComp = item.icon;
              const isActive =
                adminModeView === 'user-view' && mainNavSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setAdminModeView('user-view');
                    setMainNavSection(item.id);
                    if (item.id === 'comunidad') {
                      if (selectedYear === null) setSelectedYear(1);
                      setTopView('apuntes-flow');
                      setActiveSubTab('Comunidad');
                    } else if (item.id === 'herramientas') {
                      if (selectedYear === null) {
                        setSelectedYear(1);
                        setNeedsSubjectSelection(true);
                      }
                      setTopView('simulator');
                    } else if (item.id === 'materias') {
                      setTopView('apuntes-flow');
                      if (activeSubTab === 'Comunidad') setActiveSubTab('General');
                      if (selectedYear !== null && selectedSubjectId === 'all') {
                        setNeedsSubjectSelection(true);
                      }
                    } else if (item.id === 'profesores') {
                      setTopView('professor-emails-view');
                    } else if (item.id === 'calendario') {
                      setTopView('calendar-view');
                    }
                  }}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition shrink-0 ${
                    isActive
                      ? 'bg-k-332b23 text-k-f5efe6 shadow-sm'
                      : 'text-k-a39688 hover:text-k-f3ece2 hover:bg-k-1b1713'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                      isActive
                        ? 'bg-k-d6b892 text-k-14110e'
                        : 'text-k-a39688'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}

            {/* Acceso directo al Panel Admin si tiene rol Administrador */}
            {isAdmin && (
              <button
                onClick={() =>
                  setAdminModeView(
                    adminModeView === 'admin-panel' ? 'user-view' : 'admin-panel'
                  )
                }
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition shrink-0 mt-1 ${
                  adminModeView === 'admin-panel'
                    ? 'bg-k-d6b892 text-k-14110e font-semibold'
                    : 'text-k-d6b892 hover:bg-k-1f1a15 border border-k-d6b892/15'
                }`}
              >
                <span className="w-7 h-7 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </span>
                {!sidebarCollapsed && <span>Panel Admin</span>}
              </button>
            )}
          </nav>

          {/* Divisor + Botón Píldora de Modo Oscuro / Colapsar */}
          <div className="hidden lg:flex flex-col items-center pt-3 border-t border-k-241f1a">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={
                sidebarCollapsed
                  ? 'Expandir barra lateral'
                  : 'Modo compacto / minimalista'
              }
              className="w-14 h-8 rounded-full bg-k-181512 hover:bg-k-231e19 border border-k-332b23 flex items-center justify-center text-k-d6b892 transition"
            >
              <Moon className="w-4 h-4 fill-k-d6b892" />
            </button>
          </div>
        </div>

        {/* Ilustración Arquitectónica Inferior + Lema "Aprendé. Avanzá. Crecé." */}
        {!sidebarCollapsed && (
          <div className="hidden lg:flex flex-col items-center px-5 pb-6 pt-4 text-center select-none">
            <div className="w-full max-w-[180px] opacity-75 mb-2">
              <svg
                viewBox="0 0 220 110"
                className="w-full h-auto text-k-9e8c78"
                fill="none"
              >
                <path
                  d="M15 95 H205"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeOpacity="0.5"
                />
                <polygon
                  points="45,95 45,48 115,30 115,95"
                  fill="rgb(var(--k-1c1814))"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <polygon
                  points="115,30 175,46 175,95 115,95"
                  fill="rgb(var(--k-15120f))"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <polygon
                  points="135,35 142,12 149,39"
                  fill="rgb(var(--k-241e19))"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <polygon
                  points="156,41 161,20 166,44"
                  fill="rgb(var(--k-241e19))"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <g stroke="currentColor" strokeWidth="1" opacity="0.65">
                  <rect x="56" y="54" width="10" height="8" />
                  <rect x="72" y="51" width="10" height="8" />
                  <rect x="88" y="47" width="12" height="9" />
                  <rect x="56" y="68" width="10" height="8" />
                  <rect x="72" y="66" width="10" height="8" />
                  <rect x="88" y="63" width="12" height="9" />
                  <rect x="125" y="48" width="10" height="8" />
                  <rect x="142" y="52" width="10" height="8" />
                  <rect x="125" y="64" width="10" height="8" />
                  <rect x="142" y="67" width="10" height="8" />
                </g>
                <circle
                  cx="32"
                  cy="76"
                  r="12"
                  fill="rgb(var(--k-1a1612))"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <circle
                  cx="188"
                  cy="78"
                  r="11"
                  fill="rgb(var(--k-1a1612))"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </div>
            <p className="font-editorial text-xs tracking-wide text-k-a39688">
              Aprendé. Avanzá. Crecé.
            </p>
          </div>
        )}
      </aside>

      {/* =====================================================================
          CONTENEDOR PRINCIPAL DERECHO (TOPBAR + DASHBOARD / VISTAS)
         ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR MINIMALISTA */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-k-0e0c0a/90 px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
          {/* Buscador en píldora oscura */}
          <div className="relative w-full max-w-xl">
            <Search className="w-4 h-4 text-k-8c7f72 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim().length > 0) {
                  setAdminModeView('user-view');
                  setMainNavSection('materias');
                  if (selectedYear === null) setSelectedYear(1);
                  setNeedsSubjectSelection(false);
                  setTopView('apuntes-flow');
                }
              }}
              placeholder="Buscar en la plataforma..."
              className="w-full bg-k-171411 border border-k-26211c focus:border-k-d6b892/30 rounded-full pl-11 pr-9 py-2.5 text-xs text-k-f3ece2 placeholder-k-786b5e focus:outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-k-8c7f72 hover:text-k-f3ece2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Acciones Derecha: Controles Admin + Campana + Píldora de Usuario (@alestte) */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticatedAdmin && (
              <button
                onClick={() => {
                  const nextPreview = !adminPreviewingAsUser;
                  setAdminPreviewingAsUser(nextPreview);
                  if (nextPreview) {
                    setAdminModeView('user-view');
                  }
                }}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
                  adminPreviewingAsUser
                    ? 'bg-k-d6b892 text-k-14110e border-k-d6b892'
                    : 'bg-k-1a1613 hover:bg-k-25201b text-k-d6b892 border-k-332b23'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {adminPreviewingAsUser
                    ? 'Volver a Rol Admin'
                    : 'Simular Alumno'}
                </span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() =>
                  setAdminModeView(
                    adminModeView === 'admin-panel' ? 'user-view' : 'admin-panel'
                  )
                }
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                  adminModeView === 'admin-panel'
                    ? 'bg-k-332b23 text-k-f3ece2 border border-k-d6b892/25'
                    : 'bg-k-d6b892 hover:bg-k-e2c8a6 text-k-14110e'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {adminModeView === 'admin-panel'
                    ? 'Volver al Inicio'
                    : 'Panel Admin'}
                </span>
              </button>
            )}

            {/* Campana de Notificaciones */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotificationsMenu(!showNotificationsMenu);
                  setShowProfileMenu(false);
                }}
                className="relative w-10 h-10 rounded-full bg-k-171411 hover:bg-k-221d18 border border-k-26211c flex items-center justify-center text-k-c8bcb0 hover:text-k-f3ece2 transition"
                title="Notificaciones académicas"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-k-d6b892 absolute top-2.5 right-2.5" />
              </button>

              {showNotificationsMenu && (
                <div className="absolute right-0 mt-2 w-72 campus-surface rounded-2xl p-3.5 shadow-2xl z-40 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-k-27211c pb-2">
                    <span className="font-editorial text-sm text-k-f3ece2">
                      Notificaciones
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-k-d6b892/20 text-k-d6b892">
                      3 nuevas
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div
                      onClick={() => {
                        setShowNotificationsMenu(false);
                        setMainNavSection('materias');
                        handleSelectYear(2);
                        handleSelectSubject('base-de-datos-1');
                      }}
                      className="p-2 rounded-xl hover:bg-k-211c17 cursor-pointer transition"
                    >
                      <p className="text-k-f3ece2 font-medium">
                        Parcial - Bases de Datos I
                      </p>
                      <p className="text-[11px] text-k-9e9285">
                        Viernes 14 Nov • En 2 días
                      </p>
                    </div>
                    <div
                      onClick={() => {
                        setShowNotificationsMenu(false);
                        setMainNavSection('materias');
                        handleSelectYear(1);
                        handleSelectSubject('algoritmos-2');
                      }}
                      className="p-2 rounded-xl hover:bg-k-211c17 cursor-pointer transition"
                    >
                      <p className="text-k-f3ece2 font-medium">
                        Nuevo apunte verificado en Algoritmos II
                      </p>
                      <p className="text-[11px] text-k-9e9285">
                        Árboles AVL y Grafos en C
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Píldora de Usuario (@alestte) */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotificationsMenu(false);
                }}
                className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1 rounded-full bg-k-171411 hover:bg-k-221d18 border border-k-27211c transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-k-d6b892 to-k-785f43 flex items-center justify-center text-k-14110e font-editorial font-bold text-sm overflow-hidden border border-k-d6b892/25">
                  {displayUsername.slice(0, 1).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-k-f3ece2">
                  @{displayUsername}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-k-9e9285" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-60 campus-surface rounded-2xl p-3 shadow-2xl z-40 space-y-2">
                  <div className="px-2 py-1.5 border-b border-k-27211c">
                    <div className="text-xs font-semibold text-k-f3ece2">
                      @{displayUsername}
                    </div>
                    <div className="text-[11px] text-k-d6b892">
                      {isAdmin
                        ? 'Rol: Administrador General'
                        : 'Rol: Estudiante Verificado'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setAdminModeView('user-view');
                      setMainNavSection('perfil');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-k-c8bcb0 hover:text-k-f3ece2 hover:bg-k-221d18 transition"
                  >
                    <User className="w-3.5 h-3.5 text-k-d6b892" />
                    <span>Mi Perfil y Preferencias</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setAdminModeView('user-view');
                      setMainNavSection('apariencia');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-k-c8bcb0 hover:text-k-f3ece2 hover:bg-k-221d18 transition"
                  >
                    <Palette className="w-3.5 h-3.5 text-k-d6b892" />
                    <span>Paleta de colores</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setCurrentUser(null);
                      setAdminPreviewingAsUser(false);
                      setAdminModeView('user-view');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-950/50 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar sesión segura</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* =====================================================================
            CONTENIDO PRINCIPAL SEGÚN SECCIÓN ACTIVA
           ===================================================================== */}
        {isAdmin && adminModeView === 'admin-panel' ? (
          <AdminDashboard
            notes={notes}
            onUpdateNotes={setNotes}
            subjects={subjects}
            onUpdateSubjects={setSubjects}
            exams={exams}
            onUpdateExams={setExams}
            contacts={contacts}
            onUpdateContacts={setContacts}
            users={registeredUsers}
            onUpdateUsers={setRegisteredUsers}
            noteDisplayMode={noteDisplayMode}
            onChangeNoteDisplayMode={setNoteDisplayMode}
            onSwitchToNormalView={() => setAdminModeView('user-view')}
            onResetAllData={handleResetAllData}
          />
        ) : mainNavSection === 'inicio' ? (
          /* ===================================================================
             VISTA "INICIO" — DASHBOARD MINIMALISTA MODO OSCURO (RÉPLICA EXACTA)
             =================================================================== */
          <main className="flex-1 max-w-[1380px] w-full mx-auto px-5 sm:px-8 pb-10 pt-2 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLUMNA PRINCIPAL IZQUIERDA (8 COLUMNAS) */}
            <div className="lg:col-span-8 space-y-6">
              {/* 1. HERO BANNER CON ARQUITECTURA UNIVERSITARIA Y TIPOGRAFÍA SERIF */}
              <div className="relative rounded-3xl overflow-hidden border border-k-2b241d bg-k-161310 min-h-[250px] sm:min-h-[275px] flex items-center shadow-2xl">
                {/* Ilustración / Fotografía arquitectónica monocromática cálida a la derecha */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <svg
                    viewBox="0 0 900 340"
                    preserveAspectRatio="xMidYMid slice"
                    className="w-full h-full opacity-90"
                  >
                    <defs>
                      <linearGradient id="skyWarm" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="rgb(var(--k-14110e))" />
                        <stop offset="45%" stopColor="rgb(var(--k-26201a))" />
                        <stop offset="100%" stopColor="rgb(var(--k-8c7a67))" />
                      </linearGradient>
                      <linearGradient id="buildingSide" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="rgb(var(--k-b5a38e))" />
                        <stop offset="100%" stopColor="rgb(var(--k-4f4439))" />
                      </linearGradient>
                      <linearGradient id="fadeLeft" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="rgb(var(--k-15120f))" stopOpacity="1" />
                        <stop offset="42%" stopColor="rgb(var(--k-15120f))" stopOpacity="0.94" />
                        <stop offset="72%" stopColor="rgb(var(--k-15120f))" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="rgb(var(--k-15120f))" stopOpacity="0.08" />
                      </linearGradient>
                    </defs>

                    <rect width="900" height="340" fill="url(#skyWarm)" />

                    {/* Edificio moderno de hormigón y cristal en perspectiva */}
                    <polygon
                      points="430,295 430,175 685,68 685,295"
                      fill="url(#buildingSide)"
                    />
                    <polygon
                      points="685,68 855,135 855,295 685,295"
                      fill="rgb(var(--k-3b3229))"
                    />
                    <line
                      x1="430"
                      y1="215"
                      x2="685"
                      y2="132"
                      stroke="rgb(var(--k-dfd3c3))"
                      strokeWidth="3"
                      opacity="0.7"
                    />
                    <line
                      x1="685"
                      y1="132"
                      x2="855"
                      y2="182"
                      stroke="rgb(var(--k-9e8c78))"
                      strokeWidth="2.5"
                      opacity="0.6"
                    />
                    <line
                      x1="430"
                      y1="255"
                      x2="685"
                      y2="198"
                      stroke="rgb(var(--k-dfd3c3))"
                      strokeWidth="2.5"
                      opacity="0.6"
                    />

                    {/* Ventanales */}
                    <g fill="rgb(var(--k-1d1814))" opacity="0.78">
                      <polygon points="640,95 676,80 676,125 640,138" />
                      <polygon points="595,114 632,98 632,141 595,153" />
                      <polygon points="548,133 586,118 586,156 548,169" />
                      <polygon points="502,152 540,136 540,172 502,185" />
                      <polygon points="640,152 676,141 676,188 640,198" />
                      <polygon points="595,167 632,155 632,200 595,210" />
                      <polygon points="548,181 586,170 586,212 548,221" />
                    </g>

                    {/* Árboles universitarios */}
                    <g fill="rgb(var(--k-1c1713))" opacity="0.88">
                      <circle cx="435" cy="245" r="46" />
                      <circle cx="475" cy="235" r="38" />
                      <circle cx="395" cy="260" r="34" />
                      <circle cx="845" cy="195" r="55" />
                    </g>

                    {/* Aro geométrico sutil + Estrella de 4 puntas (✦) */}
                    <circle
                      cx="645"
                      cy="165"
                      r="118"
                      fill="none"
                      stroke="rgb(var(--k-e6d7c3))"
                      strokeWidth="1"
                      opacity="0.38"
                    />
                    <path
                      d="M527 148 L531 161 L544 165 L531 169 L527 182 L523 169 L510 165 L523 161 Z"
                      fill="rgb(var(--k-e6d7c3))"
                      opacity="0.75"
                    />

                    <rect width="900" height="340" fill="url(#fadeLeft)" />
                  </svg>
                </div>

                {/* Contenido Editorial Izquierdo */}
                <div className="relative z-10 p-7 sm:p-10 space-y-3 max-w-lg">
                  <p className="font-editorial text-xl sm:text-2xl text-k-d8cfc4">
                    Bienvenido de nuevo,
                  </p>
                  <h1 className="font-editorial text-5xl sm:text-6xl text-k-f5efe6 tracking-tight leading-none">
                    {displayUsername}
                  </h1>
                  <p className="text-sm text-k-b8aca0 pt-1">
                    Tu espacio académico, en un solo lugar.
                  </p>
                  <div className="pt-3">
                    <button
                      onClick={() => {
                        setMainNavSection('materias');
                        setTopView('apuntes-flow');
                        if (activeSubTab === 'Comunidad') setActiveSubTab('General');
                      }}
                      className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-k-d6b892 hover:bg-k-e3c7a3 text-k-161310 text-xs font-semibold transition shadow-md"
                    >
                      <span>Explorar mis materias</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. SECCIÓN "MIS HERRAMIENTAS" (4 TARJETAS MINIMALISTAS) */}
              <div className="space-y-3.5">
                <h2 className="font-editorial text-xl text-k-f3ece2">
                  Mis herramientas
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    {
                      id: 'materias',
                      title: 'Materias',
                      desc: 'Accedé a tus materias y contenidos.',
                      icon: BookOpen,
                      onClick: () => {
                        setMainNavSection('materias');
                        setTopView('apuntes-flow');
                        if (activeSubTab === 'Comunidad') setActiveSubTab('General');
                      },
                    },
                    {
                      id: 'profesores',
                      title: 'Correos Profesores',
                      desc: 'Directorio de correos oficiales por cátedra.',
                      icon: Mail,
                      onClick: () => {
                        setMainNavSection('profesores');
                        setTopView('professor-emails-view');
                      },
                    },
                    {
                      id: 'calendario',
                      title: 'Calendario',
                      desc: 'Mesas de examen, parciales y entregas.',
                      icon: Calendar,
                      onClick: () => {
                        setMainNavSection('calendario');
                        setTopView('calendar-view');
                      },
                    },
                    {
                      id: 'herramientas',
                      title: 'Herramientas',
                      desc: 'Compilador, correlativas y calculadora.',
                      icon: Code2,
                      onClick: () => {
                        if (selectedYear === null) setSelectedYear(1);
                        setMainNavSection('herramientas');
                        setTopView('simulator');
                      },
                    },
                  ].map((card) => {
                    const CardIcon = card.icon;
                    return (
                      <div
                        key={card.id}
                        onClick={card.onClick}
                        className="group cursor-pointer campus-tool-card rounded-2xl p-5 flex flex-col justify-between min-h-[168px] transition-all hover:-translate-y-0.5"
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-k-d6b892">
                          <CardIcon className="w-6 h-6 stroke-[1.6]" />
                        </div>

                        <div className="space-y-1.5 pt-4">
                          <h3 className="font-editorial text-lg text-k-f3ece2 group-hover:text-k-d6b892 transition">
                            {card.title}
                          </h3>
                          <div className="flex items-end justify-between gap-2">
                            <p className="text-xs text-k-9e9285 leading-relaxed">
                              {card.desc}
                            </p>
                            <span className="w-7 h-7 rounded-full bg-k-4a3e33/70 group-hover:bg-k-d6b892 text-k-e5d5c0 group-hover:text-k-14110e flex items-center justify-center shrink-0 transition">
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2.5 SECCIÓN DE APUNTES Y DOCUMENTOS DESTACADOS (CON LOS 3 FORMATOS DE VISTA) */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-editorial text-xl sm:text-2xl text-k-f3ece2">
                      Documentos destacados
                    </h2>
                    <p className="text-xs text-k-9e9285">
                      Explorá apuntes en filas con columnas, solo columnas o vista reducida de una línea.
                    </p>
                  </div>

                  {/* Selector de los 3 formatos pedidos por el usuario */}
                  <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-k-14110e border border-k-2d261f self-start sm:self-auto">
                    <button
                      onClick={() => setNoteDisplayMode('grid')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                        noteDisplayMode === 'grid'
                          ? 'bg-k-2c241d text-k-f3ece2 border border-k-d6b892/25 shadow-sm'
                          : 'text-k-9e9285 hover:text-k-f3ece2'
                      }`}
                      title="Ver en filas con columnas (cuadrícula de tarjetas con miniatura)"
                    >
                      <LayoutGrid className="w-3.5 h-3.5 text-k-d6b892" />
                      <span>Filas y Columnas</span>
                    </button>
                    <button
                      onClick={() => setNoteDisplayMode('detailed')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                        noteDisplayMode === 'detailed'
                          ? 'bg-k-2c241d text-k-f3ece2 border border-k-d6b892/25 shadow-sm'
                          : 'text-k-9e9285 hover:text-k-f3ece2'
                      }`}
                      title="Ver solo en columnas (tarjetas horizontales detalladas)"
                    >
                      <LayoutList className="w-3.5 h-3.5 text-k-d6b892" />
                      <span>Solo Columnas</span>
                    </button>
                    <button
                      onClick={() => setNoteDisplayMode('file-preview')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                        noteDisplayMode === 'file-preview'
                          ? 'bg-k-2c241d text-k-f3ece2 border border-k-d6b892/25 shadow-sm'
                          : 'text-k-9e9285 hover:text-k-f3ece2'
                      }`}
                      title="Vista reducida solo con la línea de texto del nombre"
                    >
                      <FileText className="w-3.5 h-3.5 text-k-d6b892" />
                      <span>Vista Reducida</span>
                    </button>
                  </div>
                </div>

                {/* Barra de pestañas estilo Imagen 2: Para vos | Guardados | Más valorados + Ordenar por */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-k-26211c pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setHomeFeedTab('para-vos')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                        homeFeedTab === 'para-vos'
                          ? 'bg-k-26201a text-k-f3ece2 border border-k-3d332a'
                          : 'text-k-9e9285 hover:text-k-f3ece2'
                      }`}
                    >
                      <span className="text-k-d6b892">✦</span>
                      <span>Para vos</span>
                    </button>
                    <button
                      onClick={() => setHomeFeedTab('guardados')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                        homeFeedTab === 'guardados'
                          ? 'bg-k-26201a text-k-f3ece2 border border-k-3d332a'
                          : 'text-k-9e9285 hover:text-k-f3ece2'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5 text-k-d6b892" />
                      <span>Guardados ({savedNoteIds.length})</span>
                    </button>
                    <button
                      onClick={() => setHomeFeedTab('valorados')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                        homeFeedTab === 'valorados'
                          ? 'bg-k-26201a text-k-f3ece2 border border-k-3d332a'
                          : 'text-k-9e9285 hover:text-k-f3ece2'
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5 text-k-d6b892" />
                      <span>Más valorados</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-k-9e9285">
                    <span>Ordenar por:</span>
                    <button
                      onClick={() =>
                        setHomeSortBy(homeSortBy === 'votes' ? 'recent' : 'votes')
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-k-171411 border border-k-2c251e text-k-e5d5c0 hover:border-k-d6b892/25 transition"
                    >
                      <span>
                        {homeSortBy === 'votes' ? 'Más valorados' : 'Más recientes'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-k-d6b892" />
                    </button>
                  </div>
                </div>

                {/* Contenedor dinámico según el modo elegido:
                    - 'grid': Filas con Columnas (3 columnas en desktop)
                    - 'detailed': Solo Columnas (1 columna de tarjetas horizontales estilo Imagen 2)
                    - 'file-preview': Vista Reducida (lista compacta de 1 sola línea por apunte) */}
                {(() => {
                  let homeNotes = [...notes];
                  if (searchQuery.trim() !== '') {
                    const q = searchQuery.toLowerCase();
                    homeNotes = homeNotes.filter(
                      (n) =>
                        n.title.toLowerCase().includes(q) ||
                        n.summary.toLowerCase().includes(q) ||
                        n.author.toLowerCase().includes(q)
                    );
                  }
                  if (homeFeedTab === 'guardados') {
                    homeNotes = homeNotes.filter((n) => savedNoteIds.includes(n.id));
                  } else if (homeFeedTab === 'valorados') {
                    homeNotes.sort((a, b) => b.votes - a.votes);
                  } else if (homeSortBy === 'votes') {
                    homeNotes.sort((a, b) => b.votes - a.votes);
                  }

                  const displayedHomeNotes = homeNotes.slice(0, 6);

                  if (displayedHomeNotes.length === 0) {
                    return (
                      <div className="campus-surface rounded-2xl p-6 text-center text-xs text-k-9e9285">
                        No hay documentos en esta pestaña todavía. Hacé clic en{' '}
                        <span className="text-k-d6b892 font-medium">Guardar</span> en cualquier apunte para agregarlo a tu colección.
                      </div>
                    );
                  }

                  return (
                    <div
                      className={
                        noteDisplayMode === 'grid'
                          ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                          : noteDisplayMode === 'detailed'
                          ? 'flex flex-col gap-3.5'
                          : 'flex flex-col gap-2'
                      }
                    >
                      {displayedHomeNotes.map((note, idx) =>
                        renderNoteCard(note, idx, Boolean(note.verifiedByStudents))
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* 3. TARJETA "TU PROGRESO ACADÉMICO" */}
              <CollapsibleCard
                title="Tu progreso académico"
                icon={<GraduationCap className="w-5 h-5" />}
                open={isPanelOpen('inicio-academico')}
                onToggle={() => togglePanel('inicio-academico')}
                collapsedHint="4 materias en curso"
                bodyClassName="space-y-4"
                action={
                  <button
                    onClick={() => {
                      if (selectedYear === null) setSelectedYear(1);
                      setMainNavSection('herramientas');
                      setTopView('correlatives');
                    }}
                    className="inline-flex items-center gap-1 text-xs text-k-a39688 hover:text-k-d6b892 transition"
                  >
                    <span>Ver detalle</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                }
              >
                <div className="space-y-4">
                  {[
                    {
                      name: 'Algoritmos y Estructuras de Datos II',
                      year: 1,
                      subjectId: 'algoritmos-2',
                      pct: 100,
                      done: true,
                    },
                    {
                      name: 'Bases de Datos I',
                      year: 2,
                      subjectId: 'base-de-datos-1',
                      pct: 85,
                      done: true,
                    },
                    {
                      name: 'Arquitectura de Computadoras',
                      year: 1,
                      subjectId: 'arquitectura',
                      pct: 60,
                      done: false,
                    },
                    {
                      name: 'Matemática Discreta',
                      year: 1,
                      subjectId: 'algebra-logica',
                      pct: 40,
                      done: false,
                    },
                  ].map((item) => (
                    <div
                      key={item.name}
                      onClick={() => {
                        handleSelectYear(item.year);
                        handleSelectSubject(item.subjectId);
                      }}
                      className="grid grid-cols-12 items-center gap-3 cursor-pointer group"
                    >
                      <span className="col-span-12 sm:col-span-5 text-xs text-k-d8cfc4 group-hover:text-k-d6b892 transition truncate">
                        {item.name}
                      </span>
                      <div className="col-span-9 sm:col-span-5 h-2 rounded-full bg-k-26211c overflow-hidden">
                        <div
                          className="h-full rounded-full bg-k-d6b892 transition-all duration-500"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2.5">
                        <span className="text-xs font-semibold text-k-f3ece2">
                          {item.pct}%
                        </span>
                        {item.done ? (
                          <span className="w-4 h-4 rounded-full bg-k-d6b892 text-k-14110e flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-k-52473c" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>
            </div>

            {/* COLUMNA LATERAL DERECHA (4 COLUMNAS) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Control rápido: minimizar / expandir todos los paneles laterales */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-k-8e8275">
                  Paneles laterales
                </span>
                <button
                  onClick={() =>
                    setPanelsGroup(
                      INICIO_SIDE_PANELS,
                      !INICIO_SIDE_PANELS.every((id) => isPanelOpen(id))
                    )
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-k-d6b892 hover:text-k-e5c9a4 transition"
                >
                  {INICIO_SIDE_PANELS.every((id) => isPanelOpen(id)) ? (
                    <>
                      <Minimize2 className="w-3 h-3" /> Minimizar todo
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3 h-3" /> Expandir todo
                    </>
                  )}
                </button>
              </div>

              {/* 1. TARJETA "ACCESOS RÁPIDOS" (SIN OPCIONES REDUNDANTES CON LA BARRA IZQUIERDA) */}
              <CollapsibleCard
                title="Accesos rápidos"
                icon={<Zap className="w-4 h-4" />}
                open={isPanelOpen('inicio-accesos')}
                onToggle={() => togglePanel('inicio-accesos')}
                bodyClassName=""
              >
                <div className="space-y-2.5">
                  {[
                    {
                      label: 'Abrir compilador',
                      icon: Code2,
                      onClick: () => {
                        if (selectedYear === null) setSelectedYear(1);
                        setMainNavSection('herramientas');
                        setTopView('simulator');
                      },
                    },
                    {
                      label: 'Resolver ejercicios (Flashcards)',
                      icon: Radar,
                      onClick: () => {
                        if (selectedYear === null) setSelectedYear(1);
                        setMainNavSection('herramientas');
                        setTopView('radar');
                      },
                    },
                    {
                      label: 'Calculadora de promoción',
                      icon: Calculator,
                      onClick: () => {
                        if (selectedYear === null) setSelectedYear(1);
                        setMainNavSection('herramientas');
                        setTopView('calculator-checklist-view');
                      },
                    },
                    {
                      label: 'Mapa de correlatividades',
                      icon: GitBranch,
                      onClick: () => {
                        if (selectedYear === null) setSelectedYear(1);
                        setMainNavSection('herramientas');
                        setTopView('correlatives');
                      },
                    },
                  ].map((quick) => {
                    const QIcon = quick.icon;
                    return (
                      <button
                        key={quick.label}
                        onClick={quick.onClick}
                        className="w-full flex items-center gap-3.5 p-2 rounded-2xl hover:bg-k-221d18 text-left group transition"
                      >
                        <span className="w-9 h-9 rounded-xl bg-k-211c17 border border-k-332b23 group-hover:border-k-d6b892/25 flex items-center justify-center text-k-c8bcb0 group-hover:text-k-d6b892 transition">
                          <QIcon className="w-4 h-4" />
                        </span>
                        <span className="text-xs font-medium text-k-d8cfc4 group-hover:text-k-f3ece2 transition">
                          {quick.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CollapsibleCard>

              {/* 1.5 TARJETA "VISTA PREVIA" INTERACTIVA (COMO EN IMAGEN 1) */}
              {(() => {
                const activePreviewNote =
                  notes.find((n) => n.id === previewNoteId) || notes[0];
                if (!activePreviewNote) return null;
                const previewSubj = subjects.find(
                  (s) => s.id === activePreviewNote.subjectId
                );
                const totalPages = Math.max(
                  4,
                  Math.min(
                    32,
                    Math.round(
                      ((activePreviewNote.contentMarkdown || activePreviewNote.summary)
                        .length || 450) / 35
                    )
                  )
                );

                return (
                  <CollapsibleCard
                    title="Vista previa"
                    icon={<Eye className="w-4 h-4" />}
                    open={isPanelOpen('inicio-preview')}
                    onToggle={() => togglePanel('inicio-preview')}
                    collapsedHint={activePreviewNote.title}
                    bodyClassName="space-y-3.5"
                    action={
                      <button
                        onClick={() => setSelectedNoteModal(activePreviewNote)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-k-241f1a hover:bg-k-312a23 border border-k-3a3128 text-[11px] text-k-e5d5c0 transition"
                      >
                        <span>Abrir en visor</span>
                        <ExternalLink className="w-3 h-3 text-k-d6b892" />
                      </button>
                    }
                  >
                    <div className="text-[11px] text-k-9e9285 font-mono text-right">
                      ← 1 / {totalPages} →
                    </div>

                    {/* Hoja de papel crema con el contenido real del apunte seleccionado */}
                    <div
                      onClick={() => setSelectedNoteModal(activePreviewNote)}
                      className="cursor-pointer rounded-2xl bg-gradient-to-b from-k-efe5d4 to-k-dfd1bc text-k-231d17 p-4 shadow-inner space-y-2.5 border border-k-c8b89e transition hover:brightness-[1.02]"
                    >
                      <div className="flex items-center justify-between border-b border-k-b9a88e pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-k-5b4d3e">
                        <span className="truncate">
                          {previewSubj?.name || 'UNNE FACENA'}
                        </span>
                        <span>{activePreviewNote.category}</span>
                      </div>

                      <h4 className="font-editorial text-sm font-bold text-k-191410 leading-snug line-clamp-2">
                        {activePreviewNote.title}
                      </h4>

                      <p className="text-[11px] text-k-3a3128 leading-relaxed line-clamp-3">
                        {activePreviewNote.summary}
                      </p>

                      <div className="rounded-lg bg-k-d7c7af/70 border border-k-bda98c p-2.5 font-mono text-[10px] text-k-2b231c line-clamp-4 whitespace-pre-wrap leading-relaxed">
                        {(
                          activePreviewNote.contentMarkdown || activePreviewNote.summary
                        ).slice(0, 220)}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-k-5b4d3e">
                        <span>Por @{activePreviewNote.author}</span>
                        <span className="font-semibold text-k-231d17">
                          Pág. 1 de {totalPages}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <button
                        onClick={() => handleDownloadNoteFile(activePreviewNote)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-k-d6b892 hover:bg-k-e2c6a1 text-k-14110e text-xs font-semibold transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar documento</span>
                      </button>
                      <button
                        onClick={() => toggleSaveNote(activePreviewNote.id)}
                        className={`p-2 rounded-xl border transition ${
                          savedNoteIds.includes(activePreviewNote.id)
                            ? 'bg-k-2a231c border-k-d6b892/30 text-k-d6b892'
                            : 'bg-k-171411 border-k-2c251e text-k-9e9285 hover:text-k-f3ece2'
                        }`}
                        title="Guardar documento"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </CollapsibleCard>
                );
              })()}

              {/* 2. TARJETA "TU PROGRESO" (ANILLO 72% + 8 / 11 MATERIAS APROBADAS) */}
              <CollapsibleCard
                title="Tu progreso"
                icon={<TrendingUp className="w-4 h-4" />}
                open={isPanelOpen('inicio-progreso')}
                onToggle={() => togglePanel('inicio-progreso')}
                collapsedHint="72% · 8 / 11 aprobadas"
                bodyClassName=""
              >
                <div className="flex items-center justify-around gap-4 py-2">
                  {/* Anillo SVG 72% */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgb(var(--k-29231d))"
                        strokeWidth="9"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgb(var(--k-d6b892))"
                        strokeWidth="9"
                        strokeLinecap="round"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 * (1 - 0.72)}
                      />
                    </svg>
                    <span className="absolute font-editorial text-2xl text-k-f3ece2">
                      72%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-k-9e9285 leading-snug">
                      Materias
                      <br />
                      aprobadas
                    </p>
                    <p className="font-editorial text-2xl text-k-f3ece2">
                      8 / 11
                    </p>
                  </div>
                </div>
              </CollapsibleCard>

              {/* 3. TARJETA "PRÓXIMOS EVENTOS" */}
              <CollapsibleCard
                title="Próximos eventos"
                icon={<Calendar className="w-4 h-4" />}
                open={isPanelOpen('inicio-eventos')}
                onToggle={() => togglePanel('inicio-eventos')}
                collapsedHint={`${upcomingEvents(allCalendarEvents, 3).length} próximos`}
                bodyClassName=""
                action={
                  <button
                    onClick={() => {
                      setMainNavSection('calendario');
                      setTopView('calendar-view');
                    }}
                    className="inline-flex items-center gap-1 text-xs text-k-a39688 hover:text-k-d6b892 transition"
                  >
                    <span>Ver calendario</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                }
              >
                <div className="relative pl-4 space-y-4 before:content-[''] before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-k-332b23">
                  {upcomingEvents(allCalendarEvents, 3).map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => {
                        setMainNavSection('calendario');
                        setTopView('calendar-view');
                      }}
                      className="cursor-pointer relative flex items-center justify-between gap-2 text-xs group"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-k-d6b892 absolute -left-[15px] ring-4 ring-k-161310" />
                      <span className="text-k-9e9285 w-20 shrink-0">
                        {formatShortDate(ev.date)}
                      </span>
                      <span className="text-k-f3ece2 group-hover:text-k-d6b892 font-medium flex-1 truncate transition">
                        {ev.title}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-k-c8ab86 text-k-161310 text-[11px] font-semibold shrink-0">
                        {relativeLabel(daysUntil(ev.date))}
                      </span>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>
            </div>
          </main>
        ) : mainNavSection === 'calendario' ? (
          /* ===================================================================
             VISTA "CALENDARIO ACADÉMICO" — MESAS FINALES, PARCIALES Y ENTREGAS
             =================================================================== */
          <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-6">
            <AcademicCalendar
              subjects={subjects}
              events={allCalendarEvents}
              onChangeCustomEvents={setCustomCalendarEvents}
              onOpenSubject={(subjId) => {
                const subj = subjects.find((s) => s.id === subjId);
                if (subj) {
                  setSelectedYear(subj.year);
                }
                handleSelectSubject(subjId);
              }}
              onBack={() => setMainNavSection('inicio')}
            />
          </main>
        ) : mainNavSection === 'profesores' ? (
          /* ===================================================================
             VISTA "CORREOS DE PROFESORES" — DIRECTORIO COMPLETO POR MATERIA Y AÑO
             =================================================================== */
          <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-6">
            <ProfessorDirectory
              subjects={subjects}
              selectedSubjectId={selectedSubjectId}
              onSelectSubject={setSelectedSubjectId}
              contacts={contacts}
              onUpdateContacts={setContacts}
              isAdmin={isAdmin}
            />
          </main>
        ) : mainNavSection === 'apariencia' ? (
          /* ===================================================================
             VISTA "APARIENCIA" — SELECTOR DE PALETA DE COLORES DE TODA LA WEB
             =================================================================== */
          <ThemePaletteSection />
        ) : mainNavSection === 'perfil' ? (
          /* ===================================================================
             VISTA "PERFIL" — GESTIÓN DE CUENTA, SEGURIDAD Y PREFERENCIAS
             =================================================================== */
          <main className="flex-1 max-w-4xl w-full mx-auto px-5 sm:px-8 py-6 space-y-6">
            <div className="campus-surface rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-k-d6b892 to-k-6e563b flex items-center justify-center text-k-14110e font-editorial text-2xl font-bold">
                  {displayUsername.slice(0, 1).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <h1 className="font-editorial text-3xl text-k-f3ece2">
                    @{displayUsername}
                  </h1>
                  <p className="text-xs text-k-d6b892 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {isAdmin
                        ? 'Rol Administrador Verificado (Firma SHA-256 activa)'
                        : 'Rol Estudiante Verificado (Firma SHA-256 activa)'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setMainNavSection('inicio')}
                  className="px-4 py-2 rounded-full bg-k-241f1a hover:bg-k-332b23 text-xs text-k-f3ece2 border border-k-383028 transition"
                >
                  Volver a Inicio
                </button>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    setAdminPreviewingAsUser(false);
                    setAdminModeView('user-view');
                  }}
                  className="px-4 py-2 rounded-full bg-rose-950/60 hover:bg-rose-900 text-xs text-rose-200 border border-rose-500/30 transition"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="campus-surface rounded-3xl p-6 space-y-3">
                <h2 className="font-editorial text-xl text-k-f3ece2">
                  Modo de visualización de apuntes
                </h2>
                <p className="text-xs text-k-9e9285">
                  Elegí cómo preferís visualizar los apuntes dentro de las materias.
                </p>
                <div className="grid grid-cols-1 gap-2.5 pt-2">
                  <button
                    onClick={() => setNoteDisplayMode('grid')}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      noteDisplayMode === 'grid'
                        ? 'bg-k-2b241d border-k-d6b892 text-k-f3ece2'
                        : 'bg-k-15120f border-k-26211c text-k-9e9285'
                    }`}
                  >
                    <div className="text-xs font-semibold flex items-center gap-1.5">
                      <LayoutGrid className="w-3.5 h-3.5 text-k-d6b892" />
                      <span>1. Filas con Columnas (Cuadrícula con Miniatura)</span>
                    </div>
                    <div className="text-[11px] opacity-80 mt-0.5">
                      Tarjetas en grilla de varias columnas con vista previa superior de la hoja.
                    </div>
                  </button>
                  <button
                    onClick={() => setNoteDisplayMode('detailed')}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      noteDisplayMode === 'detailed'
                        ? 'bg-k-2b241d border-k-d6b892 text-k-f3ece2'
                        : 'bg-k-15120f border-k-26211c text-k-9e9285'
                    }`}
                  >
                    <div className="text-xs font-semibold flex items-center gap-1.5">
                      <LayoutList className="w-3.5 h-3.5 text-k-d6b892" />
                      <span>2. Solo Columnas (Tarjetas Horizontales Detalladas)</span>
                    </div>
                    <div className="text-[11px] opacity-80 mt-0.5">
                      Una sola columna con portada lateral UNNE, resumen, autor, guardar y descargar.
                    </div>
                  </button>
                  <button
                    onClick={() => setNoteDisplayMode('file-preview')}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      noteDisplayMode === 'file-preview'
                        ? 'bg-k-2b241d border-k-d6b892 text-k-f3ece2'
                        : 'bg-k-15120f border-k-26211c text-k-9e9285'
                    }`}
                  >
                    <div className="text-xs font-semibold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-k-d6b892" />
                      <span>3. Vista Reducida (Solo Línea de Texto del Nombre)</span>
                    </div>
                    <div className="text-[11px] opacity-80 mt-0.5">
                      Lista compacta de una sola línea por documento con vista previa y descarga rápida.
                    </div>
                  </button>
                </div>
              </div>

              <div className="campus-surface rounded-3xl p-6 space-y-3">
                <h2 className="font-editorial text-xl text-k-f3ece2">
                  Seguridad de la cuenta
                </h2>
                <ul className="space-y-2.5 text-xs text-k-c8bcb0 pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-k-d6b892 shrink-0" />
                    <span>Sesión firmada contra edición en LocalStorage (F12)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-k-d6b892 shrink-0" />
                    <span>Escáner Anti-XSS y validador de archivos activo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-k-d6b892 shrink-0" />
                    <span>Sin necesidad de correo electrónico (@{displayUsername})</span>
                  </li>
                </ul>
              </div>
            </div>
          </main>
        ) : selectedYear === null ? (
          /* ===================================================================
             PANTALLA DE SELECCIÓN DE AÑO (1° A 5° AÑO) EN ESTÉTICA MINIMALISTA
             =================================================================== */
          <div className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-k-26211c pb-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-k-241f1a border border-k-d6b892/20 text-k-d6b892 text-xs font-medium">
                  <GraduationCap className="w-3.5 h-3.5" /> Plan de Estudios por Año
                </div>
                <h1 className="font-editorial text-3xl sm:text-4xl text-k-f3ece2 tracking-tight">
                  ¿De qué año querés explorar las materias?
                </h1>
                <p className="text-xs sm:text-sm text-k-9e9285">
                  Al seleccionar un año, verás únicamente las materias, apuntes verificados y compilador de ese año.
                </p>
              </div>
              <button
                onClick={() => setMainNavSection('inicio')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-k-1a1613 hover:bg-k-26211c border border-k-332b23 text-xs text-k-d6b892 shrink-0 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a Inicio</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5].map((yearNum) => {
                const yearSubjects = subjects.filter((s) => s.year === yearNum);
                const yearNotesCount = notes.filter((n) => {
                  const s = subjects.find((sub) => sub.id === n.subjectId);
                  return s?.year === yearNum;
                }).length;

                const info = YEAR_DESCRIPTIONS[yearNum];

                return (
                  <div
                    key={yearNum}
                    onClick={() => handleSelectYear(yearNum)}
                    className="group cursor-pointer campus-tool-card rounded-3xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-lg"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="w-12 h-12 rounded-2xl bg-k-26211c border border-k-d6b892/20 flex items-center justify-center font-editorial text-2xl text-k-d6b892 group-hover:bg-k-d6b892 group-hover:text-k-14110e transition">
                          {yearNum}°
                        </span>
                        <span className="px-3 py-1 rounded-full bg-k-14110e border border-k-2b241d text-xs text-k-d6b892">
                          {yearNotesCount} apuntes
                        </span>
                      </div>

                      <div>
                        <h2 className="font-editorial text-xl text-k-f3ece2 group-hover:text-k-d6b892 transition">
                          {info.title}
                        </h2>
                        <p className="text-xs text-k-9e9285 mt-1.5 leading-relaxed">
                          {info.subtitle}
                        </p>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-k-26211c">
                        <div className="text-[11px] font-medium uppercase tracking-wider text-k-9e9285">
                          Materias ({yearSubjects.length}):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {yearSubjects.map((subj) => (
                            <span
                              key={subj.id}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-k-120f0d border border-k-26211c text-k-c8bcb0"
                            >
                              {subj.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-k-26211c flex items-center justify-between text-xs font-semibold text-k-d6b892">
                      <span>Explorar {yearNum}° Año</span>
                      <span className="w-7 h-7 rounded-full bg-k-332b23 group-hover:bg-k-d6b892 text-k-f3ece2 group-hover:text-k-14110e flex items-center justify-center transition">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : mainNavSection === 'materias' &&
          topView === 'apuntes-flow' &&
          needsSubjectSelection &&
          searchQuery.trim() === '' ? (
          /* ===================================================================
             PANTALLA 2: SELECCIÓN DE MATERIA DENTRO DEL AÑO ELEGIDO (SIN MEZCLAR)
             =================================================================== */
          <div className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-k-26211c pb-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-k-241f1a border border-k-d6b892/20 text-k-d6b892 text-xs font-medium">
                  <BookOpen className="w-3.5 h-3.5" /> {selectedYear}° Año •{' '}
                  {YEAR_DESCRIPTIONS[selectedYear]?.title}
                </div>
                <h1 className="font-editorial text-3xl sm:text-4xl text-k-f3ece2 tracking-tight">
                  ¿De qué materia querés ver los apuntes?
                </h1>
                <p className="text-xs sm:text-sm text-k-9e9285">
                  Cada materia tiene su espacio separado con parciales, finales, proyectos y compilador propio para evitar todo mezclado.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleBackToSelectYear}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-k-1a1613 hover:bg-k-26211c border border-k-332b23 text-xs text-k-d6b892 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cambiar de Año</span>
                </button>
                <button
                  onClick={() => handleSelectSubject('all')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-k-14110e hover:bg-k-1e1915 border border-k-2b241d text-xs text-k-9e9285 hover:text-k-f3ece2 transition"
                >
                  <span>Ver todas del año</span>
                </button>
              </div>
            </div>

            {[1, 2].map((sem) => {
              const semSubjects = subjectsOfSelectedYear.filter(
                (s) => s.semester === sem
              );
              if (semSubjects.length === 0) return null;

              return (
                <section key={sem} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-k-241f1a pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full bg-k-241f1a border border-k-332b23 text-[11px] font-semibold uppercase tracking-wider text-k-d6b892">
                        {sem}° Cuatrimestre
                      </span>
                      <span className="text-xs text-k-8e8275">
                        {semSubjects.length}{' '}
                        {semSubjects.length === 1 ? 'materia' : 'materias'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {semSubjects.map((subj) => {
                      const subjNotes = notes.filter(
                        (n) => n.subjectId === subj.id
                      );
                      const verifiedCount = subjNotes.filter(
                        (n) => n.verifiedByStudents
                      ).length;
                      const unverifiedCount = subjNotes.length - verifiedCount;
                      const profCount = contacts.filter(
                        (c) => c.subjectId === subj.id
                      ).length;

                      return (
                        <div
                          key={subj.id}
                          onClick={() => handleSelectSubject(subj.id)}
                          className="group cursor-pointer campus-tool-card rounded-3xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-lg"
                        >
                          <div className="space-y-4">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-3 py-1.5 rounded-2xl bg-k-26211c border border-k-d6b892/20 font-mono text-xs font-bold text-k-d6b892 group-hover:bg-k-d6b892 group-hover:text-k-14110e transition">
                                {subj.code}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {subj.hasCompiler && (
                                  <span
                                    title="Incluye Compilador de Examen"
                                    className="px-2.5 py-1 rounded-full bg-k-1d1814 border border-k-d6b892/25 text-[10px] font-medium text-k-d6b892 inline-flex items-center gap-1"
                                  >
                                    <Code2 className="w-3 h-3" />
                                    Compilador
                                  </span>
                                )}
                                <span className="px-3 py-1 rounded-full bg-k-14110e border border-k-2b241d text-xs text-k-d6b892">
                                  {subjNotes.length} apuntes
                                </span>
                              </div>
                            </div>

                            <div>
                              <h2 className="font-editorial text-xl text-k-f3ece2 group-hover:text-k-d6b892 transition leading-snug">
                                {subj.name}
                              </h2>
                              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-k-9e9285">
                                <span>{verifiedCount} verificados</span>
                                <span>•</span>
                                <span>{unverifiedCount} de alumnos</span>
                                {subj.promotionAvailable && (
                                  <>
                                    <span>•</span>
                                    <span className="text-k-d6b892">
                                      Promocionable
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {subj.topTopics.length > 0 && (
                              <div className="space-y-2 pt-3 border-t border-k-26211c">
                                <div className="text-[11px] font-medium uppercase tracking-wider text-k-9e9285">
                                  Temas frecuentes ({profCount} prof.):
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {subj.topTopics.slice(0, 3).map((tp) => (
                                    <span
                                      key={tp.topic}
                                      className="text-[11px] px-2.5 py-1 rounded-lg bg-k-120f0d border border-k-26211c text-k-c8bcb0 truncate max-w-full"
                                    >
                                      {tp.topic}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-6 pt-3 border-t border-k-26211c flex items-center justify-between text-xs font-semibold text-k-d6b892">
                            <span>Ver apuntes de la materia</span>
                            <span className="w-7 h-7 rounded-full bg-k-332b23 group-hover:bg-k-d6b892 text-k-f3ece2 group-hover:text-k-14110e flex items-center justify-center transition">
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
        /* =====================================================================
           PANTALLA 3 (DENTRO DE LA MATERIA Y AÑO SELECCIONADO):
           En la barra lateral y superior SOLAMENTE aparecen las materias del año elegido.
           ===================================================================== */
        <div className="flex-1 max-w-[1380px] w-full mx-auto px-5 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMNA CENTRAL PRINCIPAL (Sin lateral duplicado ni bloque redundante de materias) */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-5">
            {topView === 'apuntes-flow' && (
              <>
                {/* Selector superior de Materias del Año Activo (todas visibles, sin scroll horizontal) */}
                <div className="campus-surface rounded-2xl p-1.5 flex flex-wrap items-center gap-1">
                  {subjectsOfSelectedYear.map((subj) => {
                    const isSelected = selectedSubjectId === subj.id;
                    return (
                      <button
                        key={subj.id}
                        onClick={() => handleSelectSubject(subj.id)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition ${
                          isSelected
                            ? 'bg-k-1e1915 border border-k-332b23 text-k-f3ece2 font-semibold shadow-sm'
                            : 'border border-transparent text-k-a39688 hover:text-k-f3ece2 hover:bg-k-1e1915/60 font-medium'
                        }`}
                      >
                        {subj.hasCompiler ? (
                          <Code2
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isSelected ? 'text-k-d6b892' : 'opacity-70'
                            }`}
                          />
                        ) : (
                          <BookOpen
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isSelected ? 'text-k-d6b892' : 'opacity-70'
                            }`}
                          />
                        )}
                        <span>{subj.name}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleSelectSubject('all')}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition ${
                      selectedSubjectId === 'all'
                        ? 'bg-k-1e1915 border border-k-332b23 text-k-f3ece2 font-semibold shadow-sm'
                        : 'border border-transparent text-k-a39688 hover:text-k-f3ece2 hover:bg-k-1e1915/60 font-medium'
                    }`}
                  >
                    <Layers
                      className={`w-3.5 h-3.5 shrink-0 ${
                        selectedSubjectId === 'all'
                          ? 'text-k-d6b892'
                          : 'opacity-70'
                      }`}
                    />
                    <span>Todas ({selectedYear}° Año)</span>
                  </button>
                </div>

                {/* Cabecera Minimalista de la Materia o Año Activo */}
                <div className="campus-surface rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-k-d6b892">
                      <span>{selectedYear}° Año</span>
                      <span>•</span>
                      <span>
                        {selectedSubjectId === 'all'
                          ? 'Todas las materias del año'
                          : subjects.find((s) => s.id === selectedSubjectId)
                              ?.code}
                      </span>
                    </div>
                    <h1 className="font-editorial text-2xl sm:text-3xl text-k-f3ece2">
                      {selectedSubjectId === 'all'
                        ? YEAR_DESCRIPTIONS[selectedYear]?.title
                        : subjects.find((s) => s.id === selectedSubjectId)
                            ?.name}
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleBackToSelectYear}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-k-1e1915 hover:bg-k-2a231d border border-k-332b23 text-xs text-k-d6b892 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Cambiar de Año</span>
                    </button>
                  </div>
                </div>

                {/* Barra de Apartados */}
                <div className="campus-surface rounded-2xl p-2 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
                  {YEAR_SUB_TABS.map((tab) => {
                    const isActive = activeSubTab === tab.id;
                    const isCommunity = tab.id === 'Comunidad';
                    const isRanking = tab.id === 'Ranking';
                    const count =
                      !isCommunity && !isRanking
                        ? countByCategory[tab.id] ?? 0
                        : null;

                    let activeClass = 'bg-indigo-600 text-white shadow-md';
                    if (isCommunity && isActive) {
                      activeClass = 'bg-emerald-600 text-white shadow-md';
                    } else if (isRanking && isActive) {
                      activeClass = 'bg-amber-500 text-slate-950 shadow-md';
                    }

                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveSubTab(tab.id);
                          setSelectedParcialInstance('all');
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                          isActive
                            ? activeClass
                            : isCommunity
                            ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30'
                            : isRanking
                            ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                        }`}
                      >
                        {isCommunity && <Users className="w-3.5 h-3.5" />}
                        {isRanking && <Trophy className="w-3.5 h-3.5" />}
                        {!isCommunity && !isRanking && (
                          <Layers className="w-3.5 h-3.5 opacity-70" />
                        )}
                        <span>{tab.label}</span>
                        {count !== null && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                              isActive
                                ? 'bg-black/30 text-white'
                                : 'bg-slate-950 text-slate-400'
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Sub-selector de Instancia de Parcial */}
                {(activeSubTab === 'Parcial Práctico' ||
                  activeSubTab === 'Parcial Teórico') && (
                  <div className="bg-indigo-950/25 border border-indigo-500/30 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-200">
                      <Filter className="w-4 h-4 text-indigo-400" />
                      <span>
                        Elegí qué parcial de <strong>{activeSubTab}</strong> querés ver:
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => setSelectedParcialInstance('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          selectedParcialInstance === 'all'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                        }`}
                      >
                        Todos ({countByParcialInstance.all})
                      </button>

                      {PARCIAL_INSTANCES.map((inst) => (
                        <button
                          key={inst}
                          onClick={() => setSelectedParcialInstance(inst)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 ${
                            selectedParcialInstance === inst
                              ? 'bg-emerald-500 text-slate-950 shadow'
                              : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                          }`}
                        >
                          <span>{inst}</span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                              selectedParcialInstance === inst
                                ? 'bg-slate-950/20 text-slate-950'
                                : 'bg-slate-900 text-slate-400'
                            }`}
                          >
                            {countByParcialInstance[inst] || 0}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* APARTADO COMUNIDAD */}
                {activeSubTab === 'Comunidad' && (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="border-b border-slate-800 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Apartado de la Comunidad • {selectedYear}° Año
                      </span>
                      <h2 className="text-base font-extrabold text-white mt-0.5">
                        Subir un Parcial, Proyecto o Final de {selectedYear}° Año
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        {isAdmin
                          ? 'Como sos Administrador, los apuntes que subas quedan publicados directamente en la sección de Verificados.'
                          : 'Los nuevos apuntes ingresan primero en la sección de Apuntes No Verificados hasta ser revisados por un Administrador.'}
                      </p>
                    </div>

                    {uploadSuccessBanner && (
                      <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-200 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{uploadSuccessBanner}</span>
                      </div>
                    )}

                    {uploadSecurityError && (
                      <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200 font-semibold flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{uploadSecurityError}</span>
                      </div>
                    )}

                    <form onSubmit={handleCreateCommunityNote} className="space-y-3.5">
                      <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-dashed border-indigo-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="text-xs text-indigo-200">
                          <strong className="block text-white">
                            ¿Tenés un archivo descargado (.md, .c, .java, .txt)?
                          </strong>
                          Seleccionalo para autocompletar el formulario:
                        </div>
                        <label className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition">
                          <UploadCloud className="w-3.5 h-3.5" />
                          Cargar Archivo
                          <input
                            type="file"
                            accept=".md,.txt,.c,.java,.json"
                            onChange={handleFileImportInCommunity}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Título del Recurso
                        </label>
                        <input
                          type="text"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Ej: 1° Parcial Práctico Resuelto Tema B"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Materia de {selectedYear}° Año
                          </label>
                          <select
                            value={newSubjectId}
                            onChange={(e) => setNewSubjectId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            {subjectsOfSelectedYear.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Apartado
                          </label>
                          <select
                            value={newCategory}
                            onChange={(e) =>
                              setNewCategory(e.target.value as NoteCategory)
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            {NOTE_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {isParcialCategory(newCategory) && (
                        <div>
                          <label className="block text-xs font-semibold text-emerald-300 mb-1">
                            ¿Qué parcial es?
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {PARCIAL_INSTANCES.map((inst) => (
                              <button
                                type="button"
                                key={inst}
                                onClick={() => setNewParcialInstance(inst)}
                                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                                  newParcialInstance === inst
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                    : 'bg-slate-950 text-slate-300 border-slate-800'
                                }`}
                              >
                                {inst}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={newAuthor}
                          onChange={(e) => setNewAuthor(e.target.value)}
                          placeholder={`Tu Nombre o Apodo (${currentUser.displayName})`}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={newTags}
                          onChange={(e) => setNewTags(e.target.value)}
                          placeholder="Etiquetas (ej: Punteros, Java, Funcional)"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <input
                        type="text"
                        value={newSummary}
                        onChange={(e) => setNewSummary(e.target.value)}
                        placeholder="Resumen corto de lo que incluye"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />

                      <textarea
                        rows={5}
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Pegá aquí el contenido, preguntas o código resuelto..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200"
                      />

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg transition"
                      >
                        Publicar en la Comunidad
                      </button>
                    </form>
                  </div>
                )}

                {/* APARTADO RANKING */}
                {activeSubTab === 'Ranking' && (
                  <div className="space-y-5">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="border-b border-slate-800 pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                          Sistema de Ranking • {selectedYear}° Año
                        </span>
                        <h2 className="text-base font-extrabold text-white">
                          Apuntes y Exámenes Más Votados de {selectedYear}° Año
                        </h2>
                      </div>

                      <div className="space-y-2.5">
                        {rankedNotes.map((note, idx) => {
                          const subj = subjects.find(
                            (s) => s.id === note.subjectId
                          );
                          const voteState = userVotes[note.id];
                          return (
                            <div
                              key={note.id}
                              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span
                                  className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                                    idx === 0
                                      ? 'bg-amber-400 text-slate-950'
                                      : idx === 1
                                      ? 'bg-slate-300 text-slate-950'
                                      : idx === 2
                                      ? 'bg-amber-700 text-white'
                                      : 'bg-slate-900 text-slate-400'
                                  }`}
                                >
                                  #{idx + 1}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300">
                                      {subj?.name}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                      {note.category}
                                    </span>
                                    {note.verifiedByStudents ? (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                                        Verificado
                                      </span>
                                    ) : (
                                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">
                                        No Verificado
                                      </span>
                                    )}
                                  </div>
                                  <h3
                                    onClick={() => setSelectedNoteModal(note)}
                                    className="text-xs font-bold text-white hover:text-indigo-300 cursor-pointer truncate mt-1"
                                  >
                                    {note.title}
                                  </h3>
                                </div>
                              </div>

                              <button
                                onClick={() => handleVote(note.id, 'up')}
                                className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                                  voteState === 'up'
                                    ? 'bg-emerald-500 text-slate-950'
                                    : 'bg-slate-900 text-emerald-400 border border-slate-800'
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" /> {note.votes}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" /> Colaboradores Destacados de {selectedYear}° Año
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {contributorRanking.map((contrib, index) => (
                          <div
                            key={contrib.author}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                          >
                            <div className="text-xs font-bold text-white">
                              {index + 1}° {contrib.author}{' '}
                              <span className="text-[11px] font-normal text-slate-400">
                                ({contrib.notesCount} aportes)
                              </span>
                            </div>
                            <span className="text-xs font-mono font-extrabold text-emerald-400">
                              {contrib.totalVotes} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ===============================================================
                    LISTADO DE APUNTES DIVIDIDO EN DOS SECCIONES:
                    1. SECCIÓN DE APUNTES VERIFICADOS
                    2. SECCIÓN DE APUNTES NO VERIFICADOS
                   =============================================================== */}
                {activeSubTab !== 'Comunidad' && activeSubTab !== 'Ranking' && (
                  <div className="space-y-6">
                    {/* Selector rápido de Secciones (Verificados / No Verificados), Carpeta, Planes y Visualización */}
                    <div className="flex flex-col gap-3 campus-surface rounded-2xl p-3.5">
                      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-medium text-k-9e9285 mr-1">
                            Secciones:
                          </span>
                          <button
                            onClick={() => setVerificationFilter('both')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                              verificationFilter === 'both'
                                ? 'bg-k-d6b892 text-k-14110e font-semibold'
                                : 'bg-k-14110e text-k-9e9285 hover:text-k-f3ece2 border border-k-2b241d'
                            }`}
                          >
                            Ver Ambas ({filteredNotes.length})
                          </button>
                          <button
                            onClick={() => setVerificationFilter('only-verified')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                              verificationFilter === 'only-verified'
                                ? 'bg-k-2b241d text-k-d6b892 border border-k-d6b892/30 font-semibold'
                                : 'bg-k-14110e text-k-c8bcb0 hover:text-k-f3ece2 border border-k-2b241d'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-k-d6b892" />
                            Verificados ({verifiedNotes.length})
                          </button>
                          <button
                            onClick={() => setVerificationFilter('only-unverified')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                              verificationFilter === 'only-unverified'
                                ? 'bg-k-2b241d text-k-e5c29f border border-k-e5c29f/30 font-semibold'
                                : 'bg-k-14110e text-k-9e9285 hover:text-k-f3ece2 border border-k-2b241d'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 text-k-d6b892" />
                            No Verificados ({unverifiedNotes.length})
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            onClick={() => setShowPlansModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-k-1e1915 hover:bg-k-2b241d border border-k-383028 text-xs font-medium text-k-d6b892 transition"
                          >
                            <BookMarked className="w-3.5 h-3.5" />
                            <span>Planes 2009 / 2023 ({UNNE_PLAN_FILES.length})</span>
                          </button>

                          {/* Selector de los 3 formatos de visualización:
                              1. Filas y Columnas ('grid')
                              2. Solo Columnas ('detailed')
                              3. Vista Reducida ('file-preview') */}
                          <div className="flex flex-wrap items-center gap-1 bg-k-120f0d p-1 rounded-xl border border-k-2b241d shrink-0">
                            <button
                              onClick={() => setNoteDisplayMode('grid')}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition ${
                                noteDisplayMode === 'grid'
                                  ? 'bg-k-2c241d text-k-f3ece2 border border-k-d6b892/25 shadow-sm'
                                  : 'text-k-9e9285 hover:text-k-f3ece2'
                              }`}
                              title="Filas con columnas (cuadrícula con miniatura de hoja)"
                            >
                              <LayoutGrid className="w-3.5 h-3.5 text-k-d6b892" />
                              <span>Filas y Columnas</span>
                            </button>
                            <button
                              onClick={() => setNoteDisplayMode('detailed')}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition ${
                                noteDisplayMode === 'detailed'
                                  ? 'bg-k-2c241d text-k-f3ece2 border border-k-d6b892/25 shadow-sm'
                                  : 'text-k-9e9285 hover:text-k-f3ece2'
                              }`}
                              title="Solo columnas (tarjetas horizontales detalladas)"
                            >
                              <LayoutList className="w-3.5 h-3.5 text-k-d6b892" />
                              <span>Solo Columnas</span>
                            </button>
                            <button
                              onClick={() => setNoteDisplayMode('file-preview')}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition ${
                                noteDisplayMode === 'file-preview'
                                  ? 'bg-k-2c241d text-k-f3ece2 border border-k-d6b892/25 shadow-sm'
                                  : 'text-k-9e9285 hover:text-k-f3ece2'
                              }`}
                              title="Vista reducida solo con la línea de texto del nombre"
                            >
                              <FileText className="w-3.5 h-3.5 text-k-d6b892" />
                              <span>Vista Reducida</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Sub-filtro por Carpeta de Cátedra cuando existen carpetas en la vista actual */}
                      {availableFoldersInScope.length > 0 && (
                        <div className="pt-2.5 border-t border-k-26211c flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-k-b5a38e shrink-0">
                            <FolderOpen className="w-3.5 h-3.5 text-k-d6b892" />
                            <span>Carpeta:</span>
                          </span>
                          <select
                            value={selectedFolderFilter}
                            onChange={(e) => {
                              setSelectedFolderFilter(e.target.value);
                              setVisibleVerifiedLimit(36);
                              setVisibleUnverifiedLimit(36);
                            }}
                            className="bg-k-120f0d border border-k-332b23 rounded-xl px-3 py-1.5 text-xs text-k-f3ece2 focus:outline-none focus:border-k-d6b892/60 max-w-full"
                          >
                            <option value="all">
                              Todas las carpetas ({availableFoldersInScope.length})
                            </option>
                            {availableFoldersInScope.map(([folderName, count]) => (
                              <option key={folderName} value={folderName}>
                                {folderName} ({count})
                              </option>
                            ))}
                          </select>
                          {selectedFolderFilter !== 'all' && (
                            <button
                              onClick={() => setSelectedFolderFilter('all')}
                              className="text-xs px-2.5 py-1 rounded-lg bg-k-241f1a hover:bg-k-332b23 text-k-d6b892 transition"
                            >
                              Quitar filtro de carpeta
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* SECCIÓN 1: APUNTES Y ARCHIVOS VERIFICADOS */}
                    {(verificationFilter === 'both' ||
                      verificationFilter === 'only-verified') && (
                      <div className="space-y-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-k-1c1814 border border-k-d6b892/20">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-k-d6b892" />
                            <h3 className="font-editorial text-sm sm:text-base text-k-f3ece2">
                              1. Material Verificado y Base UNNE-LSI ({verifiedNotes.length})
                            </h3>
                          </div>
                          <span className="text-[11px] text-k-a89b8c">
                            Guías, archivos de cátedra y aportes verificados
                          </span>
                        </div>

                        {verifiedNotes.length === 0 ? (
                          <div className="p-6 text-center rounded-2xl campus-surface text-xs text-k-9e9285">
                            No hay apuntes ni archivos verificados en este filtro todavía.
                          </div>
                        ) : (
                          <>
                            <div
                              className={
                                noteDisplayMode === 'grid'
                                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
                                  : noteDisplayMode === 'detailed'
                                  ? 'flex flex-col gap-3.5'
                                  : 'flex flex-col gap-1.5'
                              }
                            >
                              {verifiedNotes
                                .slice(0, visibleVerifiedLimit)
                                .map((note, idx) => renderNoteCard(note, idx, true))}
                            </div>
                            {verifiedNotes.length > visibleVerifiedLimit && (
                              <div className="flex justify-center pt-2">
                                <button
                                  onClick={() =>
                                    setVisibleVerifiedLimit((prev) => prev + 48)
                                  }
                                  className="px-5 py-2 rounded-xl bg-k-241f1a hover:bg-k-332b23 border border-k-4a3e33 text-xs font-semibold text-k-e3c7a3 transition"
                                >
                                  Mostrar más aportes ({verifiedNotes.length - visibleVerifiedLimit}{' '}
                                  restantes)
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* SECCIÓN 2: APUNTES NO VERIFICADOS */}
                    {(verificationFilter === 'both' ||
                      verificationFilter === 'only-unverified') && (
                      <div className="space-y-3.5 pt-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-k-181512 border border-k-3a3027">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-k-c8ab86" />
                            <h3 className="font-editorial text-sm sm:text-base text-k-e5d5c0">
                              2. Apuntes No Verificados ({unverifiedNotes.length})
                            </h3>
                          </div>
                          <span className="text-[11px] text-k-9e9285">
                            Subidos por alumnos • Pendientes de validación
                          </span>
                        </div>

                        {unverifiedNotes.length === 0 ? (
                          <div className="p-6 text-center rounded-2xl campus-surface space-y-2.5">
                            <p className="text-xs text-k-9e9285">
                              No hay apuntes pendientes de verificación en este apartado.
                            </p>
                            <button
                              onClick={() => setActiveSubTab('Comunidad')}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-k-d6b892 text-k-14110e text-xs font-semibold"
                            >
                              + Subir Apunte desde Comunidad
                            </button>
                          </div>
                        ) : (
                          <>
                            <div
                              className={
                                noteDisplayMode === 'grid'
                                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
                                  : noteDisplayMode === 'detailed'
                                  ? 'flex flex-col gap-3.5'
                                  : 'flex flex-col gap-1.5'
                              }
                            >
                              {unverifiedNotes
                                .slice(0, visibleUnverifiedLimit)
                                .map((note, idx) => renderNoteCard(note, idx, false))}
                            </div>
                            {unverifiedNotes.length > visibleUnverifiedLimit && (
                              <div className="flex justify-center pt-2">
                                <button
                                  onClick={() =>
                                    setVisibleUnverifiedLimit((prev) => prev + 48)
                                  }
                                  className="px-5 py-2 rounded-xl bg-k-241f1a hover:bg-k-332b23 border border-k-4a3e33 text-xs font-semibold text-k-e3c7a3 transition"
                                >
                                  Mostrar más pendientes ({unverifiedNotes.length - visibleUnverifiedLimit}{' '}
                                  restantes)
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* APARTADO DE RECOMENDACIONES DE PROFESORES O TIPS */}
            {(topView === 'professors-view' || topView === 'student-tips-view') && (
              <StudentTipsAndProfessors
                mode={topView === 'professors-view' ? 'professors' : 'tips'}
                subjects={subjectsOfSelectedYear}
                selectedSubjectId={selectedSubjectId}
                onSelectSubject={setSelectedSubjectId}
                onSwitchMode={(m) =>
                  setTopView(m === 'professors' ? 'professors-view' : 'student-tips-view')
                }
              />
            )}

            {/* CORREOS DE PROFESORES (SOLO NOMBRE Y CORREO) */}
            {topView === 'professor-emails-view' && (
              <ProfessorDirectory
                subjects={subjectsOfSelectedYear}
                selectedSubjectId={selectedSubjectId}
                onSelectSubject={setSelectedSubjectId}
                contacts={contacts}
                onUpdateContacts={setContacts}
                isAdmin={isAdmin}
              />
            )}

            {/* CALCULADORA DE PROMOCIÓN + CHECKLIST */}
            {topView === 'calculator-checklist-view' && (
              <PromoCalculatorAndChecklist
                subjects={subjectsOfSelectedYear}
                selectedSubjectId={selectedSubjectId}
              />
            )}

            {/* CALENDARIO ACADÉMICO */}
            {topView === 'calendar-view' && (
              <AcademicCalendar
                subjects={subjects}
                events={allCalendarEvents}
                onChangeCustomEvents={setCustomCalendarEvents}
                onOpenSubject={(subjId) => {
                  const subj = subjects.find((s) => s.id === subjId);
                  if (subj) {
                    setSelectedYear(subj.year);
                  }
                  handleSelectSubject(subjId);
                }}
                onBack={() => {
                  setMainNavSection('materias');
                  setTopView('apuntes-flow');
                }}
              />
            )}

            {/* COMPILADOR DE EXAMEN SEPARADO POR EL AÑO SELECCIONADO */}
            {topView === 'simulator' && (
              <ExamSimulatorLab
                exams={exams}
                subjects={subjectsOfSelectedYear}
                selectedYear={selectedYear}
                selectedSubjectId={selectedSubjectId}
                onBackToSelectYear={handleBackToSelectYear}
              />
            )}

            {/* MAPA DE CORRELATIVIDADES */}
            {topView === 'correlatives' && (
              <CorrelativesMap
                subjects={subjects}
                statusMap={statusMap}
                onToggleStatus={handleToggleSubjectStatus}
                onGoToSubjectNotes={(subjId) => {
                  const subj = subjects.find((s) => s.id === subjId);
                  if (subj) {
                    setSelectedYear(subj.year);
                  }
                  handleSelectSubject(subjId);
                }}
                onGoToSubjectExam={(subjId) => {
                  const subj = subjects.find((s) => s.id === subjId);
                  if (subj) {
                    setSelectedYear(subj.year);
                  }
                  setSelectedSubjectId(subjId);
                  setMainNavSection('herramientas');
                  setTopView('simulator');
                }}
              />
            )}

            {/* RADAR Y FLASHCARDS */}
            {topView === 'radar' && (
              <RadarAndFlashcards
                subjects={subjectsOfSelectedYear}
                flashcards={INITIAL_FLASHCARDS}
                selectedSubjectId={selectedSubjectId}
              />
            )}
          </main>

          {/* LATERAL DERECHO: VISTA PREVIA + VISTAS Y HERRAMIENTAS DE X° AÑO (SIN REDUNDANCIAS) */}
          <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-3.5 lg:sticky lg:top-24">
            {/* 0. WIDGET DE VISTA PREVIA DEL DOCUMENTO SELECCIONADO (en Apuntes) */}
            {topView === 'apuntes-flow' && (() => {
              const activePreviewNote =
                filteredNotes.find((n) => n.id === previewNoteId) ||
                unifiedNotes.find((n) => n.id === previewNoteId) ||
                filteredNotes[0] ||
                unifiedNotes[0];
              if (!activePreviewNote) return null;
              const totalPages = Math.max(
                4,
                Math.min(
                  32,
                  Math.round(
                    ((activePreviewNote.contentMarkdown || activePreviewNote.summary)
                      .length || 450) / 35
                  )
                )
              );

              return (
                <CollapsibleCard
                  title="Vista previa"
                  icon={<Eye className="w-4 h-4" />}
                  open={isPanelOpen('materias-preview')}
                  onToggle={() => togglePanel('materias-preview')}
                  collapsedHint={activePreviewNote.title}
                  bodyClassName="space-y-3"
                  action={
                    <button
                      onClick={() => setSelectedNoteModal(activePreviewNote)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-k-241f1a hover:bg-k-312a23 border border-k-3a3128 text-[10px] text-k-e5d5c0 transition"
                    >
                      <span>Abrir en visor</span>
                      <ExternalLink className="w-2.5 h-2.5 text-k-d6b892" />
                    </button>
                  }
                >
                  <div className="text-[10px] text-k-9e9285 font-mono text-right">
                    ← 1 / {totalPages} →
                  </div>

                  <div
                    onClick={() => setSelectedNoteModal(activePreviewNote)}
                    className="cursor-pointer rounded-xl bg-gradient-to-b from-k-efe5d4 to-k-dfd1bc text-k-231d17 p-3.5 shadow-inner space-y-2 border border-k-c8b89e transition hover:brightness-[1.02]"
                  >
                    <div className="flex items-center justify-between border-b border-k-b9a88e pb-1 text-[9px] font-semibold uppercase tracking-wider text-k-5b4d3e">
                      <span className="truncate">UNNE • FACENA</span>
                      <span>{activePreviewNote.category}</span>
                    </div>

                    <h4 className="font-editorial text-xs font-bold text-k-191410 leading-snug line-clamp-2">
                      {activePreviewNote.title}
                    </h4>

                    <p className="text-[10px] text-k-3a3128 leading-relaxed line-clamp-2">
                      {activePreviewNote.summary}
                    </p>

                    <div className="rounded-lg bg-k-d7c7af/70 border border-k-bda98c p-2 font-mono text-[9px] text-k-2b231c line-clamp-3 whitespace-pre-wrap leading-relaxed">
                      {(
                        activePreviewNote.contentMarkdown || activePreviewNote.summary
                      ).slice(0, 160)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDownloadNoteFile(activePreviewNote)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-k-d6b892 hover:bg-k-e2c6a1 text-k-14110e text-[11px] font-semibold transition"
                    >
                      <Download className="w-3 h-3" />
                      <span>Descargar</span>
                    </button>
                    <button
                      onClick={() => toggleSaveNote(activePreviewNote.id)}
                      className={`p-1.5 rounded-xl border transition ${
                        savedNoteIds.includes(activePreviewNote.id)
                          ? 'bg-k-2a231c border-k-d6b892/30 text-k-d6b892'
                          : 'bg-k-171411 border-k-2c251e text-k-9e9285 hover:text-k-f3ece2'
                      }`}
                      title="Guardar apunte"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </CollapsibleCard>
              );
            })()}

            {/* Control rápido para expandir o minimizar todo el lateral derecho */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-k-8e8275">
                Herramientas ({selectedYear}° Año)
              </span>
              <button
                onClick={() => {
                  const allOpen =
                    (topView !== 'apuntes-flow' || isPanelOpen('materias-preview')) &&
                    rightToolsOpen &&
                    rightCompilerOpen &&
                    rightProfsOpen &&
                    rightTipsOpen;
                  setPanelsGroup(['materias-preview'], !allOpen);
                  setRightToolsOpen(!allOpen);
                  setRightCompilerOpen(!allOpen);
                  setRightProfsOpen(!allOpen);
                  setRightTipsOpen(!allOpen);
                }}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-k-d6b892 hover:text-k-e5c9a4 transition"
              >
                {(topView !== 'apuntes-flow' || isPanelOpen('materias-preview')) &&
                rightToolsOpen &&
                rightCompilerOpen &&
                rightProfsOpen &&
                rightTipsOpen ? (
                  <>
                    <Minimize2 className="w-3 h-3" /> Minimizar todo
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3 h-3" /> Expandir todo
                  </>
                )}
              </button>
            </div>

            {/* 1. Vistas y Herramientas de X° Año (movido desde el lateral izquierdo, sin opciones redundantes) */}
            <div className="bg-k-171411 border border-k-27211c rounded-2xl overflow-hidden">
              <button
                onClick={() => setRightToolsOpen(!rightToolsOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-k-1e1a16 transition"
              >
                <div className="flex items-center gap-2 text-k-d6b892 text-xs font-semibold uppercase tracking-wider">
                  <Wrench className="w-4 h-4" />
                  <span>Vistas de {selectedYear}° Año</span>
                </div>
                {rightToolsOpen ? (
                  <ChevronUp className="w-4 h-4 text-k-9e9285" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-k-9e9285" />
                )}
              </button>

              {rightToolsOpen && (
                <div className="px-2.5 pb-2.5 pt-1.5 space-y-1 border-t border-k-241f1a">
                  {[
                    {
                      label: 'Compilador de Examen',
                      view: 'simulator' as TopToolView,
                      icon: Code2,
                    },
                    {
                      label: 'Recomendaciones Profesores',
                      view: 'professors-view' as TopToolView,
                      icon: UserCheck,
                    },
                    {
                      label: 'Tips de Alumnos',
                      view: 'student-tips-view' as TopToolView,
                      icon: Lightbulb,
                    },
                    {
                      label: 'Calculadora & Checklist',
                      view: 'calculator-checklist-view' as TopToolView,
                      icon: Calculator,
                    },
                    {
                      label: 'Mapa Correlatividades',
                      view: 'correlatives' as TopToolView,
                      icon: GitBranch,
                    },
                    {
                      label: 'Autoevaluación & Flashcards',
                      view: 'radar' as TopToolView,
                      icon: Radar,
                    },
                  ].map((tool) => {
                    const TIcon = tool.icon;
                    const active = topView === tool.view;
                    return (
                      <button
                        key={tool.view}
                        onClick={() => {
                          setMainNavSection('herramientas');
                          setTopView(tool.view);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition ${
                          active
                            ? 'bg-k-d6b892 text-k-14110e font-semibold'
                            : 'text-k-a39688 hover:bg-k-1e1915 hover:text-k-f3ece2'
                        }`}
                      >
                        <TIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{tool.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Widget Compilador de este Año (Expandible / Minimizable) */}
            {(selectedYear === 1 || selectedYear === 2) && topView !== 'simulator' && (
              <div className="bg-k-171411 border border-k-d6b892/25 rounded-2xl overflow-hidden shadow-lg">
                <button
                  onClick={() => setRightCompilerOpen(!rightCompilerOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-k-1e1a16 transition"
                >
                  <div className="flex items-center gap-2 text-k-d6b892 text-xs font-semibold uppercase tracking-wider">
                    <Code2 className="w-4 h-4" />
                    <span>Compilador ({selectedYear}° Año)</span>
                  </div>
                  {rightCompilerOpen ? (
                    <ChevronUp className="w-4 h-4 text-k-9e9285" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-k-9e9285" />
                  )}
                </button>

                {rightCompilerOpen && (
                  <div className="px-4 pb-4 pt-2 space-y-2.5 border-t border-k-241f1a">
                    <div className="text-xs font-semibold text-k-f3ece2">
                      {selectedYear === 1
                        ? 'Practicar Parciales de Algoritmos I y Algoritmos II'
                        : 'Practicar Parciales: 1° Paradigmas y 2° POO'}
                    </div>
                    <p className="text-[11px] text-k-9e9285">
                      Compará tu código con la solución de cátedra y mirá si llegás al 6.
                    </p>
                    <button
                      onClick={() => {
                        setMainNavSection('herramientas');
                        setTopView('simulator');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-k-d6b892 hover:bg-k-e3c7a3 text-k-14110e text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <span>Abrir Compilador</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3. Widget Recomendaciones de Profesores del Año Seleccionado */}
            <div className="bg-k-171411 border border-k-27211c rounded-2xl overflow-hidden">
              <button
                onClick={() => setRightProfsOpen(!rightProfsOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-k-1e1a16 transition"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-k-d6b892" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-k-c8bcb0">
                    Destacados Profesores
                  </h3>
                </div>
                {rightProfsOpen ? (
                  <ChevronUp className="w-4 h-4 text-k-9e9285" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-k-9e9285" />
                )}
              </button>

              {rightProfsOpen && (
                <div className="px-4 pb-4 pt-2 space-y-2.5 border-t border-k-241f1a">
                  <div className="space-y-2.5">
                    {INITIAL_PROFESSOR_RECOMMENDATIONS.filter((p) =>
                      subjectsOfSelectedYear.some((s) => s.id === p.subjectId)
                    )
                      .slice(0, 2)
                      .map((prof) => {
                        const subj = subjects.find(
                          (s) => s.id === prof.subjectId
                        );
                        return (
                          <div
                            key={prof.id}
                            onClick={() => {
                              setSelectedSubjectId(prof.subjectId);
                              setMainNavSection('herramientas');
                              setTopView('professors-view');
                            }}
                            className="cursor-pointer p-3 rounded-xl bg-k-120f0d border border-k-26211c hover:border-k-d6b892/30 transition space-y-1"
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-k-d6b892 font-semibold truncate">
                                {subj?.name}
                              </span>
                              <span className="inline-flex items-center gap-0.5 text-k-e5c29f font-semibold shrink-0">
                                <Star className="w-3 h-3 fill-k-d6b892 text-k-d6b892" />
                                {prof.clarityRating}/5
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-k-f3ece2 leading-snug">
                              {prof.professorName}
                            </div>
                            <p className="text-[11px] text-k-9e9285 line-clamp-2">
                              "{prof.recommendationText}"
                            </p>
                          </div>
                        );
                      })}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSubjectId('all');
                      setMainNavSection('herramientas');
                      setTopView('professors-view');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-k-241f1a hover:bg-k-332b23 text-k-d6b892 border border-k-332b23 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <span>Ver Recomendaciones</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* 4. Widget Tips de Alumnos del Año Seleccionado */}
            <div className="bg-k-171411 border border-k-27211c rounded-2xl overflow-hidden">
              <button
                onClick={() => setRightTipsOpen(!rightTipsOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-k-1e1a16 transition"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-k-d6b892" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-k-c8bcb0">
                    Tips Destacados
                  </h3>
                </div>
                {rightTipsOpen ? (
                  <ChevronUp className="w-4 h-4 text-k-9e9285" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-k-9e9285" />
                )}
              </button>

              {rightTipsOpen && (
                <div className="px-4 pb-4 pt-2 space-y-2.5 border-t border-k-241f1a">
                  <div className="space-y-2.5">
                    {INITIAL_STUDENT_TIPS.filter((t) =>
                      subjectsOfSelectedYear.some((s) => s.id === t.subjectId)
                    )
                      .slice(0, 2)
                      .map((tip) => {
                        const subj = subjects.find(
                          (s) => s.id === tip.subjectId
                        );
                        return (
                          <div
                            key={tip.id}
                            onClick={() => {
                              setSelectedSubjectId(tip.subjectId);
                              setMainNavSection('herramientas');
                              setTopView('student-tips-view');
                            }}
                            className="cursor-pointer p-3 rounded-xl bg-k-120f0d border border-k-26211c hover:border-k-d6b892/30 transition space-y-1"
                          >
                            <div className="text-xs font-semibold text-k-f3ece2 leading-snug">
                              {tip.title}
                            </div>
                            <div className="text-[10px] text-k-d6b892">
                              {subj?.name} • +{tip.votes} votos
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSubjectId('all');
                      setMainNavSection('herramientas');
                      setTopView('student-tips-view');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-k-241f1a hover:bg-k-332b23 text-k-d6b892 border border-k-332b23 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <span>Ver Tips de {selectedYear}° Año</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* MODAL UNIFICADO PARA VER APUNTE, PDF, IMAGEN O CÓDIGO */}
      {selectedNoteModal && (() => {
        const modalExt = (selectedNoteModal.fileExt || '').toLowerCase();
        const modalFileUrl = selectedNoteModal.externalFileUrl
          ? resolveUnneFileUrl(selectedNoteModal.externalFileUrl)
          : null;
        const isModalPdf = Boolean(modalFileUrl && modalExt === '.pdf');
        const isModalImage = Boolean(modalFileUrl && IMAGE_PREVIEW_EXTENSIONS.has(modalExt));
        const isModalLiveText = Boolean(
          selectedNoteModal.isArchiveBase &&
            modalFileUrl &&
            TEXT_PREVIEW_EXTENSIONS.has(modalExt)
        );
        const textToDisplay = isModalLiveText
          ? modalTextPreview ?? selectedNoteModal.contentMarkdown
          : selectedNoteModal.contentMarkdown;

        return (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedNoteModal(null)}
          >
            <div
              className="bg-k-171411 border border-k-383028 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-k-2b241d flex items-start justify-between gap-4 bg-k-13100d">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-k-d6b892">
                      {selectedNoteModal.category}
                      {selectedNoteModal.parcialInstance
                        ? ` (${selectedNoteModal.parcialInstance})`
                        : ''}{' '}
                      • Por {selectedNoteModal.author}
                    </span>
                    {selectedNoteModal.folderPath && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-k-1e1915 border border-k-332b23 text-[11px] text-k-b5a38e">
                        <FolderOpen className="w-3 h-3 text-k-d6b892" />
                        {selectedNoteModal.folderPath}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        selectedNoteModal.verifiedByStudents
                          ? 'bg-k-1e281d text-k-a9c79e border border-k-5f7852/50'
                          : 'bg-k-2b2218 text-k-e3c7a3 border border-k-886843/50'
                      }`}
                    >
                      {selectedNoteModal.verifiedByStudents
                        ? 'Verificado'
                        : 'No Verificado'}
                    </span>
                  </div>
                  <h2 className="font-editorial text-lg sm:text-xl text-k-f3ece2 mt-1 truncate">
                    {selectedNoteModal.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedNoteModal(null)}
                  className="p-2 rounded-xl bg-k-1e1915 text-k-9e9285 hover:text-k-f3ece2 transition shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 bg-k-110e0b">
                <div className="p-3.5 rounded-xl bg-k-161310 border border-k-2b241d text-xs text-k-d8cfc4">
                  <strong>Resumen:</strong> {selectedNoteModal.summary}
                </div>

                {isModalPdf && modalFileUrl ? (
                  <iframe
                    src={modalFileUrl}
                    title={selectedNoteModal.title}
                    className="w-full h-[65vh] rounded-2xl border border-k-332b23 bg-white"
                  />
                ) : isModalImage && modalFileUrl ? (
                  <div className="flex items-center justify-center p-2 rounded-2xl bg-k-14110e border border-k-2b241d">
                    <img
                      src={modalFileUrl}
                      alt={selectedNoteModal.title}
                      className="max-w-full max-h-[65vh] rounded-xl object-contain"
                    />
                  </div>
                ) : isModalLiveText && modalTextLoading ? (
                  <div className="p-8 text-center rounded-xl bg-k-14110e border border-k-2b241d text-xs text-k-a89b8c">
                    Cargando contenido completo del archivo...
                  </div>
                ) : isModalLiveText && modalTextError ? (
                  <div className="p-6 text-center rounded-xl bg-k-14110e border border-k-383028 text-xs text-k-e3c7a3 space-y-2">
                    <p>{modalTextError}</p>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-k-e5d5c0 bg-k-14110e p-5 rounded-xl border border-k-2b241d overflow-x-auto">
                    {textToDisplay}
                  </pre>
                )}
              </div>

              <div className="px-6 py-3.5 border-t border-k-2b241d bg-k-13100d flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleDownloadNoteFile(selectedNoteModal)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-k-d6b892 hover:bg-k-e3c7a3 text-k-14110e text-xs font-semibold transition shadow"
                  >
                    <Download className="w-4 h-4" />
                    Descargar ({getFormattedFileName(selectedNoteModal)})
                  </button>

                  {modalFileUrl && (
                    <a
                      href={modalFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-k-1e1915 hover:bg-k-2b241d border border-k-383028 text-xs text-k-d8cfc4 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-k-d6b892" />
                      <span>Abrir aparte</span>
                    </a>
                  )}

                  {textToDisplay && !isModalPdf && !isModalImage && (
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(textToDisplay);
                        setCopiedModalCode(true);
                        setTimeout(() => setCopiedModalCode(false), 1800);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-k-1e1915 hover:bg-k-2b241d border border-k-383028 text-xs text-k-d6b892 transition"
                    >
                      {copiedModalCode ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedModalCode ? 'Copiado' : 'Copiar texto'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleVote(selectedNoteModal.id, 'up')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-k-241f1a hover:bg-k-312a23 border border-k-383028 text-k-d6b892 text-xs font-semibold transition"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Votar ({selectedNoteModal.votes})
                  </button>

                  {/* Solo el Rol Admin puede verificar o desverificar un apunte */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        handleToggleVerifyNote(selectedNoteModal.id);
                        setSelectedNoteModal((prev) =>
                          prev
                            ? {
                                ...prev,
                                verifiedByStudents: !prev.verifiedByStudents,
                              }
                            : null
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-k-2b2218 hover:bg-k-382e24 border border-k-4a3e33 text-k-e3c7a3 text-xs font-semibold transition"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      {selectedNoteModal.verifiedByStudents
                        ? 'Admin: Mover a No Verificados'
                        : 'Admin: Aprobar y Verificar'}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setSelectedNoteModal(null)}
                  className="px-4 py-1.5 rounded-xl bg-k-241f1a hover:bg-k-332b23 text-xs font-semibold text-k-d8cfc4 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL DE PLANES DE ESTUDIO LSI (2009 / 2023) */}
      {showPlansModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPlansModal(false)}
        >
          <div
            className="bg-k-171411 border border-k-383028 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-k-2b241d bg-k-13100d flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <BookMarked className="w-5 h-5 text-k-d6b892" />
                <h3 className="font-editorial text-lg text-k-f3ece2">
                  Planes de Estudio LSI — UNNE (2009 / 2023)
                </h3>
              </div>
              <button
                onClick={() => setShowPlansModal(false)}
                className="p-2 rounded-xl bg-k-1e1915 text-k-9e9285 hover:text-k-f3ece2 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-2.5 bg-k-110e0b">
              {UNNE_PLAN_FILES.map((pf) => (
                <div
                  key={pf.id}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-k-171411 border border-k-2b241d"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-k-f3ece2 truncate">
                      {pf.name}
                    </div>
                    <div className="text-xs text-k-a89b8c mt-0.5">
                      {formatFileBytes(pf.sizeBytes)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setShowPlansModal(false);
                        setSelectedNoteModal(archiveFileToStudyNote(pf));
                      }}
                      className="px-3 py-1.5 rounded-xl bg-k-241f1a hover:bg-k-332b23 border border-k-383028 text-xs font-medium text-k-d6b892 transition"
                    >
                      Ver
                    </button>
                    <a
                      href={resolveUnneFileUrl(pf.relativePath)}
                      download={pf.name}
                      className="p-2 rounded-xl bg-k-d6b892 hover:bg-k-e3c7a3 text-k-14110e transition"
                      title="Descargar"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default App;
