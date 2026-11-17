import React, { useState, useEffect } from 'react';
import {
  Calculator,
  CheckSquare,
  CheckCircle2,
  AlertTriangle,
  Award,
  Plus,
  RotateCcw,
} from 'lucide-react';
import {
  Subject,
  INITIAL_SUBJECT_CHECKLISTS,
} from '../data/mockDatabase';

interface PromoCalculatorAndChecklistProps {
  subjects: Subject[];
  selectedSubjectId: string | 'all';
}

export const PromoCalculatorAndChecklist: React.FC<
  PromoCalculatorAndChecklistProps
> = ({ subjects, selectedSubjectId }) => {
  const [activeSubjectId, setActiveSubjectId] = useState<string>(
    selectedSubjectId !== 'all' ? selectedSubjectId : subjects[0]?.id || 'algoritmos-1'
  );

  useEffect(() => {
    if (selectedSubjectId !== 'all') {
      setActiveSubjectId(selectedSubjectId);
    } else if (subjects.length > 0 && !subjects.some((s) => s.id === activeSubjectId)) {
      setActiveSubjectId(subjects[0].id);
    }
  }, [selectedSubjectId, subjects]);

  const activeSubject =
    subjects.find((s) => s.id === activeSubjectId) || subjects[0];

  const subjectChecklistConfig =
    INITIAL_SUBJECT_CHECKLISTS.find((c) => c.subjectId === activeSubject.id) ||
    INITIAL_SUBJECT_CHECKLISTS[0];

  // Grades input for calculator
  const [grade1, setGrade1] = useState<string>('7');
  const [grade2, setGrade2] = useState<string>('');
  const [minAveragePromo, setMinAveragePromo] = useState<number>(
    subjectChecklistConfig.minAveragePromo
  );
  const [minGradeRegular, setMinGradeRegular] = useState<number>(
    subjectChecklistConfig.minGradeRegular
  );

  // Checklist checked state persisted in localStorage
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('campuslab_checklist_checked_v1');
    return saved ? JSON.parse(saved) : ['chk-bd-1'];
  });

  const [customChecklistItems, setCustomChecklistItems] = useState<
    Record<
      string,
      {
        id: string;
        instance: '1° Parcial' | '2° Parcial' | 'Final';
        label: string;
        critical: boolean;
      }[]
    >
  >(() => {
    const saved = localStorage.getItem('campuslab_custom_chk_v1');
    return saved ? JSON.parse(saved) : {};
  });

  const [filterInstance, setFilterInstance] = useState<
    'Todos' | '1° Parcial' | '2° Parcial' | 'Final'
  >('Todos');
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [newTaskInstance, setNewTaskInstance] = useState<
    '1° Parcial' | '2° Parcial' | 'Final'
  >('1° Parcial');

  useEffect(() => {
    const cfg = INITIAL_SUBJECT_CHECKLISTS.find(
      (c) => c.subjectId === activeSubjectId
    );
    if (cfg) {
      setMinAveragePromo(cfg.minAveragePromo);
      setMinGradeRegular(cfg.minGradeRegular);
    }
  }, [activeSubjectId]);

  useEffect(() => {
    localStorage.setItem(
      'campuslab_checklist_checked_v1',
      JSON.stringify(checkedIds)
    );
  }, [checkedIds]);

  useEffect(() => {
    localStorage.setItem(
      'campuslab_custom_chk_v1',
      JSON.stringify(customChecklistItems)
    );
  }, [customChecklistItems]);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskLabel.trim()) return;
    const item = {
      id: `custom-chk-${Date.now()}`,
      instance: newTaskInstance,
      label: newTaskLabel.trim(),
      critical: false,
    };
    setCustomChecklistItems((prev) => ({
      ...prev,
      [activeSubject.id]: [...(prev[activeSubject.id] || []), item],
    }));
    setNewTaskLabel('');
  };

  // Calculation logic
  const g1 = parseFloat(grade1);
  const g2 = parseFloat(grade2);
  const hasG1 = !isNaN(g1) && g1 >= 0 && g1 <= 10;
  const hasG2 = !isNaN(g2) && g2 >= 0 && g2 <= 10;

  // Needed in 2nd parcial to reach minAveragePromo: (g1 + needed) / 2 >= minAveragePromo => needed = 2*minAveragePromo - g1
  const neededForPromo = hasG1
    ? Math.max(minGradeRegular, +(2 * minAveragePromo - g1).toFixed(1))
    : minAveragePromo;

  const currentAverage =
    hasG1 && hasG2 ? +((g1 + g2) / 2).toFixed(2) : null;

  // All checklist items for current subject
  const allSubjectItems = [
    ...subjectChecklistConfig.items,
    ...(customChecklistItems[activeSubject.id] || []),
  ].filter(
    (item) => filterInstance === 'Todos' || item.instance === filterInstance
  );

  const completedCount = allSubjectItems.filter((item) =>
    checkedIds.includes(item.id)
  ).length;
  const readinessPercent =
    allSubjectItems.length > 0
      ? Math.round((completedCount / allSubjectItems.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Cabecera minimalista (la materia se selecciona en el lateral izquierdo) */}
      <div className="campus-surface rounded-3xl p-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Calculator className="w-5 h-5 text-k-d6b892" />
          <h2 className="font-editorial text-2xl text-k-f3ece2">
            Calculadora de Promoción y Checklist — {activeSubject.name}
          </h2>
        </div>
        <span className="text-xs text-k-9e9285">
          Seleccioná la materia desde la barra lateral izquierda
        </span>
      </div>

      {/* GRID PRINCIPAL: Izquierda Calculadora | Derecha Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* IZQUIERDA: CALCULADORA DE PROMOCIÓN Y REGULARIDAD */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Simulador de Notas • {activeSubject.name}
              </span>
              <h3 className="text-lg font-extrabold text-white mt-0.5">
                ¿Cuánto necesito sacar en el 2° Parcial?
              </h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                activeSubject.promotionAvailable
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {activeSubject.promotionAvailable
                ? 'Materia Promocionable'
                : 'Solo Regularizable (Con Final)'}
            </span>
          </div>

          {/* Parámetros de cátedra */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Nota mínima para Regularizar
              </label>
              <input
                type="number"
                min={4}
                max={10}
                step={0.5}
                value={minGradeRegular}
                onChange={(e) => setMinGradeRegular(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono font-bold text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Promedio mínimo para Promocionar
              </label>
              <input
                type="number"
                min={6}
                max={10}
                step={0.5}
                value={minAveragePromo}
                onChange={(e) => setMinAveragePromo(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono font-bold text-emerald-400"
              />
            </div>
          </div>

          {/* Ingreso de Notas de tus Parciales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-1.5">
              <label className="block text-xs font-bold text-indigo-300">
                Tu Nota en el 1° Parcial (0 a 10)
              </label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.5}
                value={grade1}
                onChange={(e) => setGrade1(e.target.value)}
                placeholder="Ej: 6.5"
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-lg font-mono font-black text-white focus:outline-none"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Tu Nota en el 2° Parcial (Opcional)
              </label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.5}
                value={grade2}
                onChange={(e) => setGrade2(e.target.value)}
                placeholder="Dejá vacío para calcular cuánto necesitás"
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-lg font-mono font-black text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Tarjeta de Diagnóstico Automático */}
          {hasG1 && !hasG2 && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/50 to-slate-950 border border-indigo-500/40 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Resultado del Cálculo para el 2° Parcial:
              </div>

              {g1 < minGradeRegular ? (
                <div className="flex items-start gap-3 text-rose-300">
                  <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <div className="text-sm font-extrabold text-white">
                      Debés recuperar el 1° Parcial ({g1} &lt; {minGradeRegular})
                    </div>
                    <p>
                      Para quedar Regular necesitás sacar al menos{' '}
                      <strong>{minGradeRegular}.0</strong> en el 2° Parcial y aprobar el{' '}
                      <strong>Recuperatorio del 1° Parcial</strong> con nota ≥{' '}
                      {minGradeRegular}.0.
                    </p>
                  </div>
                </div>
              ) : !activeSubject.promotionAvailable ? (
                <div className="text-xs text-slate-200 space-y-1">
                  <div className="text-sm font-extrabold text-emerald-400">
                    ¡1° Parcial Aprobado! Esta materia va directo a Examen Final.
                  </div>
                  <p>
                    Necesitás sacar al menos{' '}
                    <strong className="text-white text-sm">
                      {minGradeRegular}.0
                    </strong>{' '}
                    en el 2° Parcial para quedar <strong>Regular</strong> y habilitar la mesa de final.
                  </p>
                </div>
              ) : neededForPromo <= 10 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">
                      Nota necesaria en el 2° Parcial para{' '}
                      <strong className="text-emerald-400">PROMOCIONAR</strong>:
                    </span>
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      {neededForPromo} / 10
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-400">
                      Nota necesaria en el 2° Parcial solo para{' '}
                      <strong className="text-amber-300">REGULARIZAR</strong>:
                    </span>
                    <span className="text-base font-bold font-mono text-amber-300">
                      {minGradeRegular}.0 / 10
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-amber-200 space-y-1">
                  <div className="text-sm font-extrabold text-amber-400">
                    No llegás al promedio {minAveragePromo} directo ({neededForPromo} &gt; 10)
                  </div>
                  <p>
                    Sacando <strong>{minGradeRegular}.0 o más</strong> en el 2° Parcial asegurás la <strong>Regularidad</strong>, o consultá en tu cátedra si existe instancia de coloquio/recuperatorio por promoción.
                  </p>
                </div>
              )}
            </div>
          )}

          {hasG1 && hasG2 && currentAverage !== null && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase text-slate-400">
                  Estado Final de Cursada (Promedio: {currentAverage})
                </span>
                <div className="text-base font-extrabold text-white">
                  {g1 >= minGradeRegular &&
                  g2 >= minGradeRegular &&
                  activeSubject.promotionAvailable &&
                  currentAverage >= minAveragePromo
                    ? '🎉 ¡PROMOCIÓN DIRECTA ALCANZADA!'
                    : g1 >= minGradeRegular && g2 >= minGradeRegular
                    ? '✅ MATERIA REGULARIZADA (Habilitado para Final)'
                    : '⚠️ REQUIERE RECUPERATORIO'}
                </div>
              </div>
              <Award className="w-10 h-10 text-emerald-400 shrink-0" />
            </div>
          )}
        </div>

        {/* DERECHA: CHECKLIST DE TEMAS PRE-EXAMEN */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">
                  Checklist de Temas Antes de Rendir
                </h3>
              </div>

              <button
                onClick={() => setCheckedIds([])}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reiniciar progreso
              </button>
            </div>

            {/* Barra de preparación del 0% al 100% */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">
                  Tu nivel de preparación en {activeSubject.name}:
                </span>
                <span className="font-mono font-extrabold text-emerald-400">
                  {readinessPercent}% ({completedCount}/{allSubjectItems.length} temas)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>
            </div>

            {/* Filtro por Instancia */}
            <div className="flex flex-wrap gap-1.5">
              {(['Todos', '1° Parcial', '2° Parcial', 'Final'] as const).map(
                (inst) => (
                  <button
                    key={inst}
                    onClick={() => setFilterInstance(inst)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      filterInstance === inst
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {inst}
                  </button>
                )
              )}
            </div>

            {/* Lista de ítems para tildar */}
            <div className="space-y-2 max-h-[290px] overflow-y-auto custom-scrollbar pr-1">
              {allSubjectItems.map((item) => {
                const isChecked = checkedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={`cursor-pointer p-3 rounded-xl border flex items-start gap-3 transition ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                        isChecked
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300">
                          {item.instance}
                        </span>
                        {item.critical && (
                          <span className="text-[10px] font-bold text-amber-400">
                            ★ Tema Eliminatorio
                          </span>
                        )}
                      </div>
                      <span className={isChecked ? 'line-through opacity-75' : ''}>
                        {item.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formulario para agregar tu propio tema al checklist */}
          <form
            onSubmit={handleAddCustomTask}
            className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-2"
          >
            <select
              value={newTaskInstance}
              onChange={(e) =>
                setNewTaskInstance(
                  e.target.value as '1° Parcial' | '2° Parcial' | 'Final'
                )
              }
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white"
            >
              <option value="1° Parcial">1° Parcial</option>
              <option value="2° Parcial">2° Parcial</option>
              <option value="Final">Final</option>
            </select>
            <input
              type="text"
              value={newTaskLabel}
              onChange={(e) => setNewTaskLabel(e.target.value)}
              placeholder="Agregar otro tema a repasar..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" /> Sumar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
