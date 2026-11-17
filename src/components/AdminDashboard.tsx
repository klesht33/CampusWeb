import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  Trash2,
  Edit3,
  Plus,
  BookOpen,
  FileText,
  Code2,
  Mail,
  Users,
  Save,
  X,
  RotateCcw,
  Eye,
  Activity,
  TrendingUp,
  LayoutList,
  Download,
  Radio,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import {
  Subject,
  StudyNote,
  ExamChallenge,
  ProfessorContact,
  NOTE_CATEGORIES,
  PARCIAL_INSTANCES,
  NoteCategory,
  ParcialInstance,
} from '../data/mockDatabase';
import { AppUser } from './AuthLoginScreen';
import {
  SecurityAuditEvent,
  getSecurityLogs,
  logSecurityEvent,
  clearSecurityLogs,
  resetLoginLockout,
} from '../utils/security';

export type NoteDisplayMode = 'grid' | 'detailed' | 'file-preview';

interface AdminDashboardProps {
  notes: StudyNote[];
  onUpdateNotes: (updated: StudyNote[]) => void;
  subjects: Subject[];
  onUpdateSubjects: (updated: Subject[]) => void;
  exams: ExamChallenge[];
  onUpdateExams: (updated: ExamChallenge[]) => void;
  contacts: ProfessorContact[];
  onUpdateContacts: (updated: ProfessorContact[]) => void;
  users: AppUser[];
  onUpdateUsers: (updated: AppUser[]) => void;
  noteDisplayMode: NoteDisplayMode;
  onChangeNoteDisplayMode: (mode: NoteDisplayMode) => void;
  onSwitchToNormalView: () => void;
  onResetAllData: () => void;
}

type AdminSection =
  | 'realtime'
  | 'security'
  | 'notes'
  | 'subjects'
  | 'exams'
  | 'emails'
  | 'users';

interface HourlyPeakPoint {
  time: string;
  connected: number;
  label: string;
}

const INITIAL_PEAK_SERIES: HourlyPeakPoint[] = [
  { time: '08:00', connected: 24, label: 'Mañana — Consultas de Teoría' },
  { time: '10:00', connected: 58, label: 'Cursada Mañana (1° y 2° Año)' },
  { time: '12:00', connected: 41, label: 'Mediodía' },
  { time: '14:00', connected: 67, label: 'Inicio Comisiones Tarde' },
  { time: '16:00', connected: 95, label: 'Prácticas en Laboratorio' },
  { time: '18:00', connected: 118, label: 'Salida de Cursada / Subida de Apuntes' },
  { time: '20:00', connected: 146, label: 'PICO MÁXIMO: Práctica en Compilador' },
  { time: '22:00', connected: 132, label: 'Estudio Nocturno Pre-Parcial' },
  { time: 'Ahora', connected: 89, label: 'Conectados en este instante' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  notes,
  onUpdateNotes,
  subjects,
  onUpdateSubjects,
  exams,
  onUpdateExams,
  contacts,
  onUpdateContacts,
  users,
  onUpdateUsers,
  noteDisplayMode,
  onChangeNoteDisplayMode,
  onSwitchToNormalView,
  onResetAllData,
}) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('realtime');
  const [filterYear, setFilterYear] = useState<number | 'all'>('all');
  const [auditLogs, setAuditLogs] = useState<SecurityAuditEvent[]>(() =>
    getSecurityLogs()
  );

  useEffect(() => {
    setAuditLogs(getSecurityLogs());
  }, [activeSection]);

  // --- MÉTRICAS EN TIEMPO REAL SIMULADAS CON ACTUALIZACIÓN EN VIVO ---
  const [activeUsersNow, setActiveUsersNow] = useState<number>(89);
  const [peakToday, setPeakToday] = useState<{ count: number; time: string }>({
    count: 146,
    time: '20:15 hs',
  });
  const [liveSeries, setLiveSeries] =
    useState<HourlyPeakPoint[]>(INITIAL_PEAK_SERIES);
  const [activeByArea, setActiveByArea] = useState({
    year1: 38,
    year2: 31,
    compiler: 14,
    otherYears: 6,
  });

  // Actualización en tiempo real cada 3.5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsersNow((prev) => {
        const delta = Math.floor(Math.random() * 9) - 4; // entre -4 y +4
        const next = Math.max(42, prev + delta);

        // Actualizamos el desglose por área proporcionalmente
        const y1 = Math.max(15, Math.round(next * 0.43));
        const y2 = Math.max(12, Math.round(next * 0.35));
        const comp = Math.max(5, Math.round(next * 0.16));
        const others = Math.max(2, next - y1 - y2 - comp);
        setActiveByArea({
          year1: y1,
          year2: y2,
          compiler: comp,
          otherYears: others,
        });

        // Si supera el pico del día, actualizamos el récord en vivo
        setPeakToday((currPeak) => {
          if (next > currPeak.count) {
            const nowStr = new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            return { count: next, time: `${nowStr} hs (En vivo)` };
          }
          return currPeak;
        });

        // Actualizamos el último punto ("Ahora") de la curva en tiempo real
        setLiveSeries((prevSeries) => {
          const copy = [...prevSeries];
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            connected: next,
          };
          return copy;
        });

        return next;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // --- ESTADO PARA CREAR / EDITAR APUNTE ---
  const [editingNote, setEditingNote] = useState<StudyNote | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  // --- ESTADO PARA CREAR / EDITAR MATERIA ---
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjYear, setNewSubjYear] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [newSubjHasCompiler, setNewSubjHasCompiler] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // --- ESTADO PARA EDITAR / CREAR EXAMEN DEL COMPILADOR ---
  const [editingExam, setEditingExam] = useState<ExamChallenge | null>(null);

  // --- ESTADO PARA CREAR / EDITAR CORREO DE PROFESOR ---
  const [profName, setProfName] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profSubjectId, setProfSubjectId] = useState(
    subjects[0]?.id || 'algoritmos-1'
  );
  const [editingContact, setEditingContact] = useState<ProfessorContact | null>(
    null
  );

  // =========================================================================
  // 1. FUNCIONES DE APUNTES
  // =========================================================================
  const handleToggleVerify = (noteId: string) => {
    onUpdateNotes(
      notes.map((n) =>
        n.id === noteId ? { ...n, verifiedByStudents: !n.verifiedByStudents } : n
      )
    );
  };

  const handleDeleteNote = (noteId: string) => {
    onUpdateNotes(notes.filter((n) => n.id !== noteId));
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    if (isCreatingNote) {
      onUpdateNotes([editingNote, ...notes]);
    } else {
      onUpdateNotes(
        notes.map((n) => (n.id === editingNote.id ? editingNote : n))
      );
    }
    setEditingNote(null);
    setIsCreatingNote(false);
  };

  const startNewNote = () => {
    setIsCreatingNote(true);
    setEditingNote({
      id: `note-admin-${Date.now()}`,
      title: '',
      subjectId: subjects[0]?.id || 'algoritmos-1',
      category: 'Parcial Práctico',
      parcialInstance: '1° Parcial',
      author: 'Administrador Oficial',
      createdAt: 'Subido por Admin',
      votes: 10,
      verifiedByStudents: true,
      tags: ['Oficial', 'Verificado'],
      summary: '',
      contentMarkdown: '',
    });
  };

  // =========================================================================
  // 2. FUNCIONES DE MATERIAS
  // =========================================================================
  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;

    const idSlug =
      newSubjName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString().slice(-3);

    const created: Subject = {
      id: idSlug,
      code: newSubjCode.trim() || `LSI-${newSubjYear}0X`,
      name: newSubjName.trim(),
      year: newSubjYear,
      semester: 1,
      hasCompiler: newSubjHasCompiler,
      correlativesForRegular: [],
      correlativesForApproved: [],
      difficulty: 3,
      promotionAvailable: true,
      nextExamDates: ['A confirmar'],
      topTopics: [],
      professorTips: [],
    };

    onUpdateSubjects([...subjects, created]);
    setNewSubjName('');
    setNewSubjCode('');
    setNewSubjHasCompiler(false);
  };

  const handleSaveEditedSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    onUpdateSubjects(
      subjects.map((s) => (s.id === editingSubject.id ? editingSubject : s))
    );
    setEditingSubject(null);
  };

  const handleDeleteSubject = (subjId: string) => {
    onUpdateSubjects(subjects.filter((s) => s.id !== subjId));
  };

  // =========================================================================
  // 3. FUNCIONES DE COMPILADOR DE EXÁMENES
  // =========================================================================
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;

    const exists = exams.some((ex) => ex.id === editingExam.id);
    if (exists) {
      onUpdateExams(
        exams.map((ex) => (ex.id === editingExam.id ? editingExam : ex))
      );
    } else {
      onUpdateExams([...exams, editingExam]);
    }
    setEditingExam(null);
  };

  const handleDeleteExam = (examId: string) => {
    onUpdateExams(exams.filter((ex) => ex.id !== examId));
  };

  // =========================================================================
  // 4. FUNCIONES DE CORREOS DE PROFESORES
  // =========================================================================
  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName.trim() || !profEmail.trim()) return;

    const created: ProfessorContact = {
      id: `contact-admin-${Date.now()}`,
      name: profName.trim(),
      email: profEmail.trim(),
      subjectId: profSubjectId,
    };

    onUpdateContacts([created, ...contacts]);
    setProfName('');
    setProfEmail('');
  };

  const handleSaveEditedContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;
    onUpdateContacts(
      contacts.map((c) => (c.id === editingContact.id ? editingContact : c))
    );
    setEditingContact(null);
  };

  const handleDeleteContact = (id: string) => {
    onUpdateContacts(contacts.filter((c) => c.id !== id));
  };

  // =========================================================================
  // 5. FUNCIONES DE USUARIOS Y ROLES
  // =========================================================================
  const handleToggleUserRole = (userId: string) => {
    onUpdateUsers(
      users.map((u) =>
        u.id === userId
          ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' }
          : u
      )
    );
  };

  const handleDeleteUser = (userId: string) => {
    onUpdateUsers(users.filter((u) => u.id !== userId));
  };

  const filteredNotes = notes.filter((n) => {
    if (filterYear === 'all') return true;
    const subj = subjects.find((s) => s.id === n.subjectId);
    return subj?.year === filterYear;
  });

  // Total histórico + cuentas creadas localmente
  const totalRegisteredCount = 340 + users.length;
  const maxChartValue = Math.max(
    ...liveSeries.map((p) => p.connected),
    peakToday.count,
    160
  );

  return (
    <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Encabezado Superior del Panel Admin */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" /> Panel de Control — Rol Administrador
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Monitoreo en Tiempo Real y Administración Total
          </h1>
          <p className="text-xs text-slate-300">
            Supervisá usuarios activos en vivo, picos de conexión, modo de vista de las publicaciones (detallada vs solo archivo + vista previa + descarga) y editá todo el contenido.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onSwitchToNormalView}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition shadow-lg"
          >
            <Eye className="w-4 h-4" />
            Ver Página Normal (Modo Vista)
          </button>

          <button
            onClick={onResetAllData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-rose-950/60 text-slate-300 hover:text-rose-200 border border-slate-800 hover:border-rose-500/40 text-xs font-bold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Datos
          </button>
        </div>
      </div>

      {/* =====================================================================
          SELECTOR GLOBAL DE FORMATO DE PUBLICACIONES (DETALLADA VS ARCHIVO + DESCARGA)
         ===================================================================== */}
      <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-400">
            <LayoutList className="w-4 h-4" /> Configuración de Vista de Publicaciones (Apuntes y Exámenes)
          </div>
          <h2 className="text-sm sm:text-base font-extrabold text-white">
            ¿Cómo querés que se muestren las publicaciones en la plataforma?
          </h2>
          <p className="text-xs text-slate-400">
            Elegí entre mostrar la tarjeta detallada completa o mostrar únicamente el título del archivo, un botón de vista previa y el botón de descarga directa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full lg:w-auto shrink-0">
          <button
            onClick={() => onChangeNoteDisplayMode('grid')}
            className={`px-4 py-3 rounded-xl border text-left transition flex items-center gap-3 ${
              noteDisplayMode === 'grid'
                ? 'bg-k-d6b892 text-k-14110e border-k-d6b892 shadow-lg'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <BookOpen className="w-5 h-5 shrink-0" />
            <div>
              <div className="text-xs font-extrabold">1. Filas con Columnas</div>
              <div className="text-[10px] opacity-80">
                Grilla de miniaturas de documento
              </div>
            </div>
          </button>

          <button
            onClick={() => onChangeNoteDisplayMode('detailed')}
            className={`px-4 py-3 rounded-xl border text-left transition flex items-center gap-3 ${
              noteDisplayMode === 'detailed'
                ? 'bg-k-d6b892 text-k-14110e border-k-d6b892 shadow-lg'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <LayoutList className="w-5 h-5 shrink-0" />
            <div>
              <div className="text-xs font-extrabold">2. Solo Columnas</div>
              <div className="text-[10px] opacity-80">
                Tarjetas horizontales con portada UNNE
              </div>
            </div>
          </button>

          <button
            onClick={() => onChangeNoteDisplayMode('file-preview')}
            className={`px-4 py-3 rounded-xl border text-left transition flex items-center gap-3 ${
              noteDisplayMode === 'file-preview'
                ? 'bg-k-d6b892 text-k-14110e border-k-d6b892 shadow-lg'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Download className="w-5 h-5 shrink-0" />
            <div>
              <div className="text-xs font-extrabold">
                3. Vista Reducida (1 Línea)
              </div>
              <div className="text-[10px] opacity-80">
                Solo línea del nombre, vista previa y descarga
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Pestañas de Secciones del Admin */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveSection('realtime')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
            activeSection === 'realtime'
              ? 'bg-emerald-500 text-slate-950 shadow'
              : 'text-emerald-300 hover:bg-slate-950'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Tiempo Real & Picos ({activeUsersNow} activos)</span>
        </button>

        <button
          onClick={() => {
            setAuditLogs(getSecurityLogs());
            setActiveSection('security');
          }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
            activeSection === 'security'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-indigo-300 hover:bg-slate-950'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Seguridad & Auditoría ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('notes')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
            activeSection === 'notes'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-300 hover:bg-slate-950 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Apuntes y Verificación ({notes.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('subjects')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
            activeSection === 'subjects'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-300 hover:bg-slate-950 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Materias por Año ({subjects.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('exams')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
            activeSection === 'exams'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-300 hover:bg-slate-950 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Compilador ({exams.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('emails')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
            activeSection === 'emails'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-300 hover:bg-slate-950 hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Correos ({contacts.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('users')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
            activeSection === 'users'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-300 hover:bg-slate-950 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios Registrados ({totalRegisteredCount})</span>
        </button>
      </div>

      {/* =====================================================================
          SECCIÓN 0: MONITOREO EN TIEMPO REAL (USUARIOS ACTIVOS, REGISTRADOS Y PICOS)
         ===================================================================== */}
      {activeSection === 'realtime' && (
        <div className="space-y-6">
          {/* 3 Tarjetas Principales de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tarjeta 1: Usuarios Activos en Tiempo Real */}
            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold uppercase">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                  En Vivo Ahora
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Actualización cada 3s
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-white font-mono">
                  {activeUsersNow}
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  usuarios activos conectados
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">En 1° Año:</span>
                  <strong className="text-white font-mono">
                    {activeByArea.year1} alumnos
                  </strong>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">En 2° Año:</span>
                  <strong className="text-white font-mono">
                    {activeByArea.year2} alumnos
                  </strong>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">En Compilador:</span>
                  <strong className="text-emerald-300 font-mono">
                    {activeByArea.compiler} practicando
                  </strong>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">3° a 5° Año:</span>
                  <strong className="text-white font-mono">
                    {activeByArea.otherYears} alumnos
                  </strong>
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Total de Usuarios Registrados */}
            <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-extrabold uppercase">
                  <Users className="w-3.5 h-3.5" />
                  Comunidad Registrada
                </span>
                <span className="text-[11px] font-bold text-emerald-400">
                  +18 esta semana
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-white font-mono">
                  {totalRegisteredCount}
                </span>
                <span className="text-xs font-bold text-indigo-300">
                  usuarios registrados
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">
                    Solo `@usuario` (Sin correo):
                  </span>
                  <strong className="font-mono text-white">
                    {215 +
                      users.filter((u) => u.authProvider === 'username').length}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cuentas con Google:</span>
                  <strong className="font-mono text-white">
                    {94 +
                      users.filter((u) => u.authProvider === 'google').length}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cuentas con Apple ID:</span>
                  <strong className="font-mono text-white">
                    {31 +
                      users.filter((u) => u.authProvider === 'apple').length}
                  </strong>
                </div>
              </div>
            </div>

            {/* Tarjeta 3: Pico Máximo de Conexión en Tiempo Real */}
            <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-extrabold uppercase">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Pico de Conexión Hoy
                </span>
                <button
                  onClick={() => {
                    const boosted = Math.max(activeUsersNow + 25, peakToday.count + 8);
                    setActiveUsersNow(boosted);
                    const nowStr = new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    setPeakToday({
                      count: boosted,
                      time: `${nowStr} hs (Pico en vivo)`,
                    });
                    setLiveSeries((prev) => {
                      const copy = [...prev];
                      copy[copy.length - 1] = {
                        ...copy[copy.length - 1],
                        connected: boosted,
                      };
                      return copy;
                    });
                  }}
                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 transition"
                >
                  Simular Pico Pre-Parcial
                </button>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-amber-400 font-mono">
                  {peakToday.count}
                </span>
                <span className="text-xs font-bold text-slate-200">
                  conectados en simultáneo
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Hora del pico máximo:</span>
                  <strong className="text-amber-300 font-mono">
                    {peakToday.time}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Sección más visitada:</span>
                  <strong className="text-emerald-300">
                    1° Parcial Práctico (Algoritmos y POO)
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Carga del servidor:</span>
                  <strong className="text-indigo-300 font-mono">
                    {Math.min(98, Math.round((activeUsersNow / 180) * 100))}% capacidad
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de Barras de Picos de Conexión por Franja Horaria y Tiempo Real */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Curva de Picos de Usuarios Conectados en Tiempo Real
                </h3>
                <p className="text-xs text-slate-400">
                  Distribución de alumnos conectados por hora y estado actual en vivo.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  Franja Pico
                </span>
                <span className="inline-flex items-center gap-1.5 text-emerald-300 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  Conectados Ahora ({activeUsersNow})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-9 gap-2 sm:gap-4 items-end h-52 pt-6 px-2">
              {liveSeries.map((point, idx) => {
                const isLiveNow = idx === liveSeries.length - 1;
                const isHighestPeak = point.connected === peakToday.count || point.time === '20:00';
                const heightPercent = Math.max(
                  14,
                  Math.round((point.connected / maxChartValue) * 100)
                );

                return (
                  <div
                    key={point.time}
                    className="flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip con detalle al pasar el mouse */}
                    <div className="opacity-0 group-hover:opacity-100 transition pointer-events-none absolute -top-10 z-10 bg-slate-950 border border-slate-700 px-2.5 py-1 rounded-lg text-[10px] text-white whitespace-nowrap shadow-xl">
                      <strong>{point.connected} usuarios</strong> — {point.label}
                    </div>

                    <span
                      className={`text-[11px] font-mono font-extrabold mb-1.5 ${
                        isLiveNow
                          ? 'text-emerald-400'
                          : isHighestPeak
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {point.connected}
                    </span>

                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[42px] rounded-t-xl transition-all duration-500 ${
                        isLiveNow
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/30 border border-emerald-300'
                          : isHighestPeak
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-lg shadow-amber-500/20'
                          : 'bg-gradient-to-t from-indigo-900/70 to-indigo-500/70 hover:from-indigo-600 hover:to-indigo-400'
                      }`}
                    />

                    <span
                      className={`text-[10px] font-mono mt-2 ${
                        isLiveNow
                          ? 'font-extrabold text-emerald-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {point.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECCIÓN 1: GESTIÓN DE APUNTES (VERIFICAR, EDITAR, CREAR, ELIMINAR)
         ===================================================================== */}
      {activeSection === 'notes' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 mr-1">
                Filtrar por Año:
              </span>
              <button
                onClick={() => setFilterYear('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  filterYear === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                Todos
              </button>
              {[1, 2, 3, 4, 5].map((y) => (
                <button
                  key={y}
                  onClick={() => setFilterYear(y)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    filterYear === y
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  {y}° Año
                </button>
              ))}
            </div>

            <button
              onClick={startNewNote}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition"
            >
              <Plus className="w-4 h-4" />
              Nuevo Apunte Oficial
            </button>
          </div>

          <div className="space-y-2.5">
            {filteredNotes.map((note) => {
              const subj = subjects.find((s) => s.id === note.subjectId);
              return (
                <div
                  key={note.id}
                  className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {note.verifiedByStudents ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold uppercase">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verificado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase">
                          <Clock className="w-3.5 h-3.5" /> No Verificado
                        </span>
                      )}
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300">
                        [{subj?.year}° Año] {subj?.name || note.subjectId}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {note.category}
                        {note.parcialInstance ? ` • ${note.parcialInstance}` : ''}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-white">
                      {note.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      Autor: {note.author} • {note.votes} votos — {note.summary}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleVerify(note.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition inline-flex items-center gap-1.5 ${
                        note.verifiedByStudents
                          ? 'bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {note.verifiedByStudents
                        ? 'Pasar a No Verificado'
                        : 'Aprobar y Verificar'}
                    </button>

                    <button
                      onClick={() => {
                        setIsCreatingNote(false);
                        setEditingNote({ ...note });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold transition inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Editar
                    </button>

                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          SECCIÓN 2: GESTIÓN DE MATERIAS POR AÑO
         ===================================================================== */}
      {activeSection === 'subjects' && (
        <div className="space-y-6">
          <form
            onSubmit={handleCreateSubject}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"
          >
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Agregar Nueva Materia a un Año
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre de la Materia
                </label>
                <input
                  type="text"
                  required
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  placeholder="Ej: Análisis Matemático I"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={newSubjCode}
                  onChange={(e) => setNewSubjCode(e.target.value)}
                  placeholder="Ej: LSI-105"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Año de Cursada
                </label>
                <select
                  value={newSubjYear}
                  onChange={(e) =>
                    setNewSubjYear(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {[1, 2, 3, 4, 5].map((y) => (
                    <option key={y} value={y}>
                      {y}° Año
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newSubjHasCompiler}
                  onChange={(e) => setNewSubjHasCompiler(e.target.checked)}
                  className="rounded border-slate-700"
                />
                <span>Habilitar ícono de Compilador de Examen en esta materia</span>
              </label>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition"
              >
                Crear Materia
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subj) => (
              <div
                key={subj.id}
                className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold">
                      {subj.year}° Año
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {subj.code}
                    </span>
                    {subj.hasCompiler && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">
                        Con Compilador
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-extrabold text-white mt-1">
                    {subj.name}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setEditingSubject({ ...subj })}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition"
                    title="Editar Materia"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(subj.id)}
                    className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white transition"
                    title="Eliminar Materia"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          SECCIÓN 3: GESTIÓN DEL COMPILADOR DE EXÁMENES
         ===================================================================== */}
      {activeSection === 'exams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Exámenes Interactivos del Compilador (Por Año)
              </h3>
              <p className="text-xs text-slate-400">
                Modificá las consignas, el código inicial o la solución de cátedra de Algoritmos 1 y 2 (1° Año) o Paradigmas y POO (2° Año), o sumá nuevos exámenes.
              </p>
            </div>
            <button
              onClick={() =>
                setEditingExam({
                  id: `exam-admin-${Date.now()}`,
                  subjectId: subjects[0]?.id || 'algoritmos-1',
                  year: 1,
                  title: 'Nuevo Examen de Compilador',
                  examType: '1er Parcial',
                  yearLabel: '2026',
                  language: 'c',
                  durationMinutes: 90,
                  passingScore: 60,
                  examSheetVisual: {
                    headerInstitution: 'UNNE - FACENA',
                    headerSubject: 'Examen de Cátedra',
                    instructions: 'Escribí aquí la consigna del examen...',
                    diagramTitle: 'Estructura solicitada',
                    entitiesOrBoxes: [],
                    tasks: ['Resolver el problema planteado en la consigna.'],
                  },
                  starterCode: '// Código inicial para el alumno\n',
                  referenceSolution: '// Solución oficial de cátedra\n',
                  rubric: [
                    {
                      id: `rub-${Date.now()}`,
                      label: 'Estructura principal correcta',
                      description: 'Implementa la función o clase solicitada.',
                      points: 100,
                      requiredPatterns: ['return'],
                      hintIfMissing: 'Asegurate de retornar el resultado esperado.',
                    },
                  ],
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shrink-0"
            >
              <Plus className="w-4 h-4" /> Agregar Examen al Compilador
            </button>
          </div>

          <div className="space-y-3">
            {exams.map((ex) => {
              const subj = subjects.find((s) => s.id === ex.subjectId);
              return (
                <div
                  key={ex.id}
                  className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase">
                        {ex.year}° Año
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                        {subj?.name || ex.subjectId}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono uppercase">
                        Lenguaje: {ex.language}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-white">
                      {ex.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditingExam({ ...ex })}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Editar Examen
                    </button>
                    <button
                      onClick={() => handleDeleteExam(ex.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          SECCIÓN 4: GESTIÓN DE CORREOS DE PROFESORES (SOLO NOMBRE Y CORREO)
         ===================================================================== */}
      {activeSection === 'emails' && (
        <div className="space-y-5">
          <form
            onSubmit={handleCreateContact}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"
          >
            <h3 className="text-sm font-extrabold text-white">
              Agregar Profesor y su Correo Electrónico
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={profName}
                onChange={(e) => setProfName(e.target.value)}
                placeholder="Nombre del Profesor"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
              <input
                type="email"
                required
                value={profEmail}
                onChange={(e) => setProfEmail(e.target.value)}
                placeholder="correo@exa.unne.edu.ar"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
              <div className="flex gap-2">
                <select
                  value={profSubjectId}
                  onChange={(e) => setProfSubjectId(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.year}° Año] {s.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shrink-0"
                >
                  Agregar
                </button>
              </div>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {contacts.map((c) => {
              const subj = subjects.find((s) => s.id === c.subjectId);
              return (
                <div
                  key={c.id}
                  className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-indigo-400">
                      [{subj?.year || '?'}° Año] {subj?.name || c.subjectId}
                    </span>
                    <div className="text-sm font-extrabold text-white truncate">
                      {c.name}
                    </div>
                    <div className="text-xs font-mono text-emerald-300 truncate">
                      {c.email}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setEditingContact({ ...c })}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(c.id)}
                      className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          SECCIÓN 5: GESTIÓN DE USUARIOS Y ROLES (USER vs ADMIN)
         ===================================================================== */}
      {activeSection === 'users' && (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white">
                    {u.displayName}
                  </span>
                  <span className="text-xs font-mono text-indigo-300">
                    @{u.username}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      u.role === 'admin'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {u.role === 'admin' ? 'ROL: ADMIN' : 'ROL: USUARIO NORMAL'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Método de acceso: {u.authProvider.toUpperCase()} • {u.createdAt}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleUserRole(u.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950 text-xs font-extrabold transition"
                >
                  {u.role === 'admin'
                    ? 'Cambiar a Usuario Normal'
                    : 'Dar Rol de Admin'}
                </button>
                {u.username !== 'admin' && (
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =====================================================================
          SECCIÓN 6: CENTRO DE SEGURIDAD Y AUDITORÍA EN TIEMPO REAL
         ===================================================================== */}
      {activeSection === 'security' && (
        <div className="space-y-6">
          {/* Estado de las 6 Capas de Blindaje Activas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold uppercase">
                <CheckCircle2 className="w-4 h-4" /> 1. Hash Criptográfico SHA-256
              </div>
              <p className="text-xs text-slate-300">
                Ninguna contraseña se guarda en texto plano. Todas las cuentas usan Web Crypto API (<code>SHA-256 + Salt aleatorio</code>).
              </p>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold uppercase">
                <CheckCircle2 className="w-4 h-4" /> 2. Firma Anti-Tampering (F12)
              </div>
              <p className="text-xs text-slate-300">
                Cada sesión lleva una firma de integridad. Si alguien edita <code>localStorage</code> para cambiarse a <code>admin</code>, la sesión se revoca automáticamente.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold uppercase">
                <CheckCircle2 className="w-4 h-4" /> 3. Anti-Fuerza Bruta & Rate Limit
              </div>
              <p className="text-xs text-slate-300">
                Bloqueo automático de 60 segundos tras 5 intentos fallidos de login y enfriamiento anti-spam al subir archivos.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-extrabold uppercase">
                <CheckCircle2 className="w-4 h-4" /> 4. Filtro Anti-XSS e Inyección
              </div>
              <p className="text-xs text-slate-300">
                Inspección y neutralización de etiquetas <code>&lt;script&gt;</code>, <code>javascript:</code>, <code>onerror=</code> e <code>&lt;iframe&gt;</code> en todos los formularios.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-extrabold uppercase">
                <CheckCircle2 className="w-4 h-4" /> 5. Escáner de Archivos Subidos
              </div>
              <p className="text-xs text-slate-300">
                Bloquea ejecutables (<code>.exe</code>, <code>.bat</code>, <code>.ps1</code>, <code>.js</code>, <code>.html</code>), doble extensión engañosa y limita el peso a 512 KB.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-extrabold uppercase">
                <CheckCircle2 className="w-4 h-4" /> 6. Cabeceras CSP & Anti-Clickjacking
              </div>
              <p className="text-xs text-slate-300">
                Políticas <code>Content-Security-Policy</code>, <code>X-Frame-Options: DENY</code>, <code>nosniff</code> y <code>Permissions-Policy</code> activas.
              </p>
            </div>
          </div>

          {/* Registro de Auditoría de Eventos de Seguridad */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Registro de Auditoría de Seguridad (Security Audit Logs)
                </h3>
                <p className="text-xs text-slate-400">
                  Historial en tiempo real de accesos, bloqueos de fuerza bruta, intentos de XSS y acciones administrativas.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    resetLoginLockout();
                    logSecurityEvent(
                      'INFO',
                      'ADMIN_PRIVILEGE_ACTION',
                      'admin',
                      'El Administrador desbloqueó manualmente el contador de intentos fallidos de Login.'
                    );
                    setAuditLogs(getSecurityLogs());
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold transition"
                >
                  Reiniciar Bloqueos de Login
                </button>

                <button
                  onClick={() => {
                    const cleared = clearSecurityLogs('admin');
                    setAuditLogs(cleared);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-xs font-bold transition"
                >
                  Limpiar Registro
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
              {auditLogs.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-start sm:items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-extrabold uppercase shrink-0 ${
                        ev.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : ev.severity === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {ev.severity}
                    </span>
                    <span className="font-mono text-[11px] text-indigo-300 font-bold shrink-0">
                      [{ev.eventType}]
                    </span>
                    <span className="text-slate-200">{ev.details}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0 font-mono">
                    <span>Usuario: @{ev.actor}</span>
                    <span>{ev.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: EDITAR / CREAR APUNTE
         ===================================================================== */}
      {editingNote && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveNote}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white">
                {isCreatingNote ? 'Crear Nuevo Apunte' : 'Editar Apunte'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={editingNote.title}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, title: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Materia
                  </label>
                  <select
                    value={editingNote.subjectId}
                    onChange={(e) =>
                      setEditingNote({
                        ...editingNote,
                        subjectId: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        [{s.year}° Año] {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Apartado
                  </label>
                  <select
                    value={editingNote.category}
                    onChange={(e) =>
                      setEditingNote({
                        ...editingNote,
                        category: e.target.value as NoteCategory,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {NOTE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Instancia de Parcial
                  </label>
                  <select
                    value={editingNote.parcialInstance || ''}
                    onChange={(e) =>
                      setEditingNote({
                        ...editingNote,
                        parcialInstance: e.target.value
                          ? (e.target.value as ParcialInstance)
                          : undefined,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="">No aplica</option>
                    {PARCIAL_INSTANCES.map((inst) => (
                      <option key={inst} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingNote.verifiedByStudents}
                    onChange={(e) =>
                      setEditingNote({
                        ...editingNote,
                        verifiedByStudents: e.target.checked,
                      })
                    }
                  />
                  <span>Incluir en la Sección de Apuntes Verificados</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Resumen
                </label>
                <input
                  type="text"
                  value={editingNote.summary}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, summary: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contenido Completo
                </label>
                <textarea
                  rows={7}
                  value={editingNote.contentMarkdown}
                  onChange={(e) =>
                    setEditingNote({
                      ...editingNote,
                      contentMarkdown: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold"
              >
                <Save className="w-4 h-4" /> Guardar Apunte
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          MODAL: EDITAR MATERIA
         ===================================================================== */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEditedSubject}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <h3 className="text-base font-extrabold text-white">
              Editar Materia
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre de la Materia
              </label>
              <input
                type="text"
                required
                value={editingSubject.name}
                onChange={(e) =>
                  setEditingSubject({ ...editingSubject, name: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={editingSubject.code}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      code: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Año
                </label>
                <select
                  value={editingSubject.year}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      year: Number(e.target.value) as 1 | 2 | 3 | 4 | 5,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {[1, 2, 3, 4, 5].map((y) => (
                    <option key={y} value={y}>
                      {y}° Año
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(editingSubject.hasCompiler)}
                onChange={(e) =>
                  setEditingSubject({
                    ...editingSubject,
                    hasCompiler: e.target.checked,
                  })
                }
              />
              <span>Tiene Compilador de Examen</span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingSubject(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          MODAL: EDITAR EXAMEN DEL COMPILADOR
         ===================================================================== */}
      {editingExam && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveExam}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-base font-extrabold text-white">
              Configurar Examen del Compilador
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título del Examen
                </label>
                <input
                  type="text"
                  required
                  value={editingExam.title}
                  onChange={(e) =>
                    setEditingExam({ ...editingExam, title: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lenguaje
                </label>
                <select
                  value={editingExam.language}
                  onChange={(e) =>
                    setEditingExam({
                      ...editingExam,
                      language: e.target.value as 'c' | 'funcional' | 'java',
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="c">C (Algoritmos 1 y 2)</option>
                  <option value="funcional">Funcional (Paradigmas)</option>
                  <option value="java">Java (POO)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Año
                </label>
                <select
                  value={editingExam.year}
                  onChange={(e) =>
                    setEditingExam({
                      ...editingExam,
                      year: Number(e.target.value) as 1 | 2 | 3 | 4 | 5,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {[1, 2, 3, 4, 5].map((y) => (
                    <option key={y} value={y}>
                      {y}° Año
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Materia
                </label>
                <select
                  value={editingExam.subjectId}
                  onChange={(e) =>
                    setEditingExam({
                      ...editingExam,
                      subjectId: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.year}° Año] {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Consigna del Examen
              </label>
              <textarea
                rows={4}
                value={editingExam.examSheetVisual.instructions}
                onChange={(e) =>
                  setEditingExam({
                    ...editingExam,
                    examSheetVisual: {
                      ...editingExam.examSheetVisual,
                      instructions: e.target.value,
                    },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Código Inicial (Starter Code)
              </label>
              <textarea
                rows={4}
                value={editingExam.starterCode}
                onChange={(e) =>
                  setEditingExam({
                    ...editingExam,
                    starterCode: e.target.value,
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Solución de Cátedra
              </label>
              <textarea
                rows={5}
                value={editingExam.referenceSolution}
                onChange={(e) =>
                  setEditingExam({
                    ...editingExam,
                    referenceSolution: e.target.value,
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingExam(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold"
              >
                Guardar Examen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          MODAL: EDITAR CORREO DE PROFESOR
         ===================================================================== */}
      {editingContact && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEditedContact}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <h3 className="text-base font-extrabold text-white">
              Editar Profesor y Correo
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del Profesor
              </label>
              <input
                type="text"
                required
                value={editingContact.name}
                onChange={(e) =>
                  setEditingContact({ ...editingContact, name: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={editingContact.email}
                onChange={(e) =>
                  setEditingContact({
                    ...editingContact,
                    email: e.target.value,
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingContact(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
