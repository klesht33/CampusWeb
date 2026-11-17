import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Lightbulb,
  ThumbsUp,
  Star,
  Flame,
  Plus,
  Search,
  CheckCircle2,
  BookOpen,
  Layers,
} from 'lucide-react';
import {
  Subject,
  ProfessorRecommendation,
  StudentTipItem,
  INITIAL_PROFESSOR_RECOMMENDATIONS,
  INITIAL_STUDENT_TIPS,
} from '../data/mockDatabase';

function mergeWithSeed<T extends { id: string }>(
  storageKey: string,
  seed: T[]
): T[] {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return seed;
    const parsed = JSON.parse(saved) as T[];
    if (!Array.isArray(parsed)) return seed;
    const existingIds = new Set(parsed.map((item) => item.id));
    return [...parsed, ...seed.filter((item) => !existingIds.has(item.id))];
  } catch {
    return seed;
  }
}

interface StudentTipsAndProfessorsProps {
  mode: 'professors' | 'tips';
  subjects: Subject[];
  selectedSubjectId: string | 'all';
  onSelectSubject: (subjectId: string | 'all') => void;
  onSwitchMode: (mode: 'professors' | 'tips') => void;
}

export const StudentTipsAndProfessors: React.FC<StudentTipsAndProfessorsProps> = ({
  mode,
  subjects,
  selectedSubjectId,
  onSelectSubject,
  onSwitchMode,
}) => {
  // Persisted Professor Recommendations (preserving user entries + newly seeded items)
  const [profRecs, setProfRecs] = useState<ProfessorRecommendation[]>(() =>
    mergeWithSeed('campuslab_prof_recs_v1', INITIAL_PROFESSOR_RECOMMENDATIONS)
  );

  // Persisted Student Tips (preserving user entries + newly seeded items)
  const [studentTips, setStudentTips] = useState<StudentTipItem[]>(() =>
    mergeWithSeed('campuslab_student_tips_v1', INITIAL_STUDENT_TIPS)
  );

  const [filterTipCategory, setFilterTipCategory] = useState<string>('Todos');
  const [profSearch, setProfSearch] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const defaultSubjectId =
    selectedSubjectId !== 'all' ? selectedSubjectId : subjects[0]?.id || '';

  // Form states for Professor Recommendation
  const [profName, setProfName] = useState('');
  const [profRole, setProfRole] = useState('');
  const [profSubjectId, setProfSubjectId] = useState(defaultSubjectId);
  const [profExamFocus, setProfExamFocus] = useState('');
  const [profRecText, setProfRecText] = useState('');
  const [profClarity, setProfClarity] = useState(5);
  const [profStrictness, setProfStrictness] = useState(4);
  const [profAuthor, setProfAuthor] = useState('');

  // Form states for Student Tip
  const [tipTitle, setTipTitle] = useState('');
  const [tipContent, setTipContent] = useState('');
  const [tipSubjectId, setTipSubjectId] = useState(defaultSubjectId);
  const [tipCategory, setTipCategory] =
    useState<StudentTipItem['tipCategory']>('Parciales');
  const [tipAuthor, setTipAuthor] = useState('');

  useEffect(() => {
    const nextDefault =
      selectedSubjectId !== 'all' &&
      subjects.some((s) => s.id === selectedSubjectId)
        ? selectedSubjectId
        : subjects[0]?.id || '';
    setProfSubjectId(nextDefault);
    setTipSubjectId(nextDefault);
  }, [selectedSubjectId, subjects]);

  useEffect(() => {
    localStorage.setItem('campuslab_prof_recs_v1', JSON.stringify(profRecs));
  }, [profRecs]);

  useEffect(() => {
    localStorage.setItem(
      'campuslab_student_tips_v1',
      JSON.stringify(studentTips)
    );
  }, [studentTips]);

  const handleVoteProf = (id: string) => {
    setProfRecs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, votes: p.votes + 1 } : p))
    );
  };

  const handleVoteTip = (id: string) => {
    setStudentTips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, votes: t.votes + 1 } : t))
    );
  };

  const handleAddProfessorRec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName.trim() || !profRecText.trim()) return;

    const created: ProfessorRecommendation = {
      id: `prof-${Date.now()}`,
      professorName: profName.trim(),
      roleOrCommission: profRole.trim() || 'Comisión General / Práctica y Teoría',
      subjectId: profSubjectId,
      examFocus:
        profExamFocus.trim() ||
        'Evalúa comprensión práctica y prolijidad en la entrega.',
      recommendationText: profRecText.trim(),
      clarityRating: profClarity,
      strictnessRating: profStrictness,
      author: profAuthor.trim()
        ? `@${profAuthor.trim().replace(/^@/, '')}`
        : '@alumno_comunidad',
      createdAt: 'Recién publicado',
      votes: 1,
    };

    setProfRecs([created, ...profRecs]);
    setProfName('');
    setProfRole('');
    setProfExamFocus('');
    setProfRecText('');
    setShowAddForm(false);
  };

  const handleAddStudentTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipTitle.trim() || !tipContent.trim()) return;

    const created: StudentTipItem = {
      id: `tip-${Date.now()}`,
      subjectId: tipSubjectId,
      tipCategory,
      title: tipTitle.trim(),
      content: tipContent.trim(),
      author: tipAuthor.trim()
        ? `@${tipAuthor.trim().replace(/^@/, '')}`
        : '@alumno_comunidad',
      createdAt: 'Recién publicado',
      votes: 1,
    };

    setStudentTips([created, ...studentTips]);
    setTipTitle('');
    setTipContent('');
    setShowAddForm(false);
  };

  const yearSubjectIds = new Set(subjects.map((s) => s.id));
  const activeSubjectInYear =
    selectedSubjectId !== 'all' && yearSubjectIds.has(selectedSubjectId)
      ? selectedSubjectId
      : 'all';

  const scopedProfs = profRecs.filter((p) =>
    activeSubjectInYear === 'all'
      ? yearSubjectIds.has(p.subjectId)
      : p.subjectId === activeSubjectInYear
  );

  const scopedTips = studentTips.filter((t) =>
    activeSubjectInYear === 'all'
      ? yearSubjectIds.has(t.subjectId)
      : t.subjectId === activeSubjectInYear
  );

  const filteredProfs = scopedProfs
    .filter((p) => {
      if (profSearch.trim()) {
        const q = profSearch.toLowerCase();
        return (
          p.professorName.toLowerCase().includes(q) ||
          p.roleOrCommission.toLowerCase().includes(q) ||
          p.recommendationText.toLowerCase().includes(q) ||
          p.examFocus.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => b.votes - a.votes);

  const filteredTips = scopedTips
    .filter((t) => {
      if (filterTipCategory !== 'Todos' && t.tipCategory !== filterTipCategory) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.votes - a.votes);

  return (
    <div className="space-y-6">
      {/* Selector superior de Materias del Año (todas visibles, sin scroll horizontal) */}
      <div className="campus-surface rounded-2xl p-1.5 flex flex-wrap items-center gap-1">
        {subjects.map((subj) => {
          const isSelected = activeSubjectInYear === subj.id;
          return (
            <button
              key={subj.id}
              onClick={() => onSelectSubject(subj.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition ${
                isSelected
                  ? 'bg-k-1e1915 border border-k-332b23 text-k-f3ece2 font-semibold shadow-sm'
                  : 'border border-transparent text-k-a39688 hover:text-k-f3ece2 hover:bg-k-1e1915/60 font-medium'
              }`}
            >
              <BookOpen
                className={`w-3.5 h-3.5 shrink-0 ${
                  isSelected ? 'text-k-d6b892' : 'opacity-70'
                }`}
              />
              <span>{subj.name}</span>
            </button>
          );
        })}
        <button
          onClick={() => onSelectSubject('all')}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition ${
            activeSubjectInYear === 'all'
              ? 'bg-k-1e1915 border border-k-332b23 text-k-f3ece2 font-semibold shadow-sm'
              : 'border border-transparent text-k-a39688 hover:text-k-f3ece2 hover:bg-k-1e1915/60 font-medium'
          }`}
        >
          <Layers
            className={`w-3.5 h-3.5 shrink-0 ${
              activeSubjectInYear === 'all' ? 'text-k-d6b892' : 'opacity-70'
            }`}
          />
          <span>Todas las materias</span>
        </button>
      </div>

      {/* Encabezado con Selector entre "Recomendaciones para Profesores" y "Tips de Alumnos" */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                onSwitchMode('professors');
                setShowAddForm(false);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                mode === 'professors'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Recomendaciones por Profesor / Comisión ({scopedProfs.length})
            </button>

            <button
              onClick={() => {
                onSwitchMode('tips');
                setShowAddForm(false);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                mode === 'tips'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              Tips y Consejos de Alumnos ({scopedTips.length})
            </button>
          </div>

          <p className="text-xs text-slate-400 pt-1">
            {mode === 'professors'
              ? 'Descubrí qué evalúa cada profesor o comisión al corregir parciales, defender TPs o tomar finales orales.'
              : 'Consejos prácticos dejados por alumnos que ya aprobaron para no cometer errores típicos en los exámenes.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          {mode === 'professors'
            ? 'Dejar Recomendación de Profesor'
            : 'Publicar Nuevo Tip de Alumno'}
        </button>
      </div>

      {/* Barra de búsqueda o filtro por tipo de consejo */}
      <div className="campus-surface rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <span className="text-xs text-k-9e9285">
          {activeSubjectInYear === 'all'
            ? 'Mostrando aportes de todas las materias del año'
            : `Filtrado por: ${
                subjects.find((s) => s.id === activeSubjectInYear)?.name || ''
              }`}
        </span>

        {mode === 'professors' ? (
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={profSearch}
              onChange={(e) => setProfSearch(e.target.value)}
              placeholder="Buscar profesor o comisión..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {['Todos', 'Parciales', 'Final Oral', 'Cursada y TPs', 'Examen Libre'].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterTipCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    filterTipCategory === cat
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* FORMULARIO DESPLEGABLE PARA AGREGAR RECOMENDACIÓN DE PROFESOR O TIP */}
      {showAddForm && mode === 'professors' && (
        <form
          onSubmit={handleAddProfessorRec}
          className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-5 space-y-4 shadow-xl"
        >
          <h3 className="text-sm font-extrabold text-white">
            Nueva Recomendación para un Profesor / Comisión en Específico
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Profesor o Comisión
              </label>
              <input
                type="text"
                required
                value={profName}
                onChange={(e) => setProfName(e.target.value)}
                placeholder="Ej: Prof. Gómez (Comisión 2 Práctica)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Materia
              </label>
              <select
                value={profSubjectId}
                onChange={(e) => setProfSubjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Instancia / Rol que dicta
              </label>
              <input
                type="text"
                value={profRole}
                onChange={(e) => setProfRole(e.target.value)}
                placeholder="Ej: 1° Parcial Práctico y Final Oral"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ¿En qué se fija más al corregir?
              </label>
              <input
                type="text"
                value={profExamFocus}
                onChange={(e) => setProfExamFocus(e.target.value)}
                placeholder="Ej: Nombres de constraints y diagramas UML"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Claridad al explicar (1 a 5)
              </label>
              <select
                value={profClarity}
                onChange={(e) => setProfClarity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} / 5 Estrellas
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Exigencia en examen (1 a 5)
              </label>
              <select
                value={profStrictness}
                onChange={(e) => setProfStrictness(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} / 5 Exigencia
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tu Recomendación para aprobar con este Profesor
            </label>
            <textarea
              rows={3}
              required
              value={profRecText}
              onChange={(e) => setProfRecText(e.target.value)}
              placeholder="Contale a otros alumnos qué conviene estudiar o cómo encarar su parcial/final..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              value={profAuthor}
              onChange={(e) => setProfAuthor(e.target.value)}
              placeholder="Tu apodo (opcional)"
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white"
              >
                Publicar Recomendación
              </button>
            </div>
          </div>
        </form>
      )}

      {showAddForm && mode === 'tips' && (
        <form
          onSubmit={handleAddStudentTip}
          className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 space-y-4 shadow-xl"
        >
          <h3 className="text-sm font-extrabold text-white">
            Publicar Nuevo Tip o Consejo de Estudio
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Título del Tip
              </label>
              <input
                type="text"
                required
                value={tipTitle}
                onChange={(e) => setTipTitle(e.target.value)}
                placeholder="Ej: Cómo no confundirse en Normalización 3FN"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Materia
              </label>
              <select
                value={tipSubjectId}
                onChange={(e) => setTipSubjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Momento de la materia
              </label>
              <select
                value={tipCategory}
                onChange={(e) =>
                  setTipCategory(
                    e.target.value as StudentTipItem['tipCategory']
                  )
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Parciales">Parciales</option>
                <option value="Final Oral">Final Oral</option>
                <option value="Cursada y TPs">Cursada y TPs</option>
                <option value="Examen Libre">Examen Libre</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Desarrollo del Tip
            </label>
            <textarea
              rows={3}
              required
              value={tipContent}
              onChange={(e) => setTipContent(e.target.value)}
              placeholder="Escribí el consejo paso a paso..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              value={tipAuthor}
              onChange={(e) => setTipAuthor(e.target.value)}
              placeholder="Tu apodo (opcional)"
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
              >
                Publicar Tip
              </button>
            </div>
          </div>
        </form>
      )}

      {/* LISTADO PRINCIPAL SEGÚN MODO */}
      {mode === 'professors' ? (
        filteredProfs.length === 0 ? (
          <div className="campus-surface rounded-2xl p-8 text-center space-y-3">
            <UserCheck className="w-8 h-8 text-k-d6b892 mx-auto opacity-80" />
            <h3 className="text-sm font-bold text-k-f3ece2">
              No se encontraron recomendaciones para este filtro
            </h3>
            <p className="text-xs text-k-9e9285 max-w-md mx-auto">
              Probá viendo todas las materias del año o publicá la primera recomendación para esta comisión.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {(activeSubjectInYear !== 'all' || profSearch.trim() !== '') && (
                <button
                  onClick={() => {
                    onSelectSubject('all');
                    setProfSearch('');
                  }}
                  className="px-4 py-2 rounded-xl bg-k-241f1a hover:bg-k-332b23 text-k-d6b892 border border-k-332b23 text-xs font-semibold transition"
                >
                  Ver todas las materias
                </button>
              )}
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-xl bg-k-d6b892 hover:bg-k-e3c7a3 text-k-14110e text-xs font-semibold transition"
              >
                + Dejar Recomendación
              </button>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProfs.map((prof) => {
            const subj = subjects.find((s) => s.id === prof.subjectId);
            return (
              <div
                key={prof.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 text-[11px] font-bold">
                        {subj?.name || prof.subjectId}
                      </span>
                      <h3 className="text-base font-extrabold text-white mt-1.5">
                        {prof.professorName}
                      </h3>
                      <p className="text-xs text-emerald-400 font-medium">
                        {prof.roleOrCommission}
                      </p>
                    </div>

                    <button
                      onClick={() => handleVoteProf(prof.id)}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-emerald-500/20 text-emerald-400 border border-slate-800 text-xs font-extrabold transition"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {prof.votes}
                    </button>
                  </div>

                  {/* Métricas de claridad y exigencia */}
                  <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-950/90 border border-slate-800/80 rounded-xl px-3.5 py-2">
                    <span className="inline-flex items-center gap-1 text-amber-300 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      Claridad: {prof.clarityRating}/5
                    </span>
                    <span className="text-slate-700">|</span>
                    <span className="inline-flex items-center gap-1 text-rose-300 font-semibold">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      Exigencia: {prof.strictnessRating}/5
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/25 text-xs text-indigo-200">
                    <strong className="text-indigo-300">
                      🎯 ¿Qué mira al corregir / evaluar?:
                    </strong>{' '}
                    {prof.examFocus}
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">
                    "{prof.recommendationText}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Recomendado por <strong>{prof.author}</strong> •{' '}
                    {prof.createdAt}
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Reseña verificada
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        )
      ) : filteredTips.length === 0 ? (
        <div className="campus-surface rounded-2xl p-8 text-center space-y-3">
          <Lightbulb className="w-8 h-8 text-k-d6b892 mx-auto opacity-80" />
          <h3 className="text-sm font-bold text-k-f3ece2">
            Todavía no hay tips cargados para este filtro
          </h3>
          <p className="text-xs text-k-9e9285 max-w-md mx-auto">
            Podés ver los tips de todas las materias del año o compartir el primer consejo para ayudar a otros estudiantes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {(activeSubjectInYear !== 'all' || filterTipCategory !== 'Todos') && (
              <button
                onClick={() => {
                  onSelectSubject('all');
                  setFilterTipCategory('Todos');
                }}
                className="px-4 py-2 rounded-xl bg-k-241f1a hover:bg-k-332b23 text-k-d6b892 border border-k-332b23 text-xs font-semibold transition"
              >
                Ver todas las materias
              </button>
            )}
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 rounded-xl bg-k-d6b892 hover:bg-k-e3c7a3 text-k-14110e text-xs font-semibold transition"
            >
              + Publicar Tip
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTips.map((tip) => {
            const subj = subjects.find((s) => s.id === tip.subjectId);
            return (
              <div
                key={tip.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 text-[11px] font-bold">
                        {subj?.name}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                        {tip.tipCategory}
                      </span>
                    </div>

                    <button
                      onClick={() => handleVoteTip(tip.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 hover:bg-emerald-500/20 text-emerald-400 border border-slate-800 text-xs font-extrabold transition"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {tip.votes}
                    </button>
                  </div>

                  <h3 className="text-base font-extrabold text-white">
                    {tip.title}
                  </h3>

                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    {tip.content}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>
                    Por <strong>{tip.author}</strong> • {tip.createdAt}
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    💡 Tip de Supervivencia
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
