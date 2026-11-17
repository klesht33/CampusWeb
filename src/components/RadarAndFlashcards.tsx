import React, { useState } from 'react';
import {
  Radar,
  Calendar,
  TrendingUp,
  ThumbsUp,
  Sparkles,
  RotateCw,
  Network,
  Check,
  Repeat,
  Plus,
} from 'lucide-react';
import { Subject, Flashcard } from '../data/mockDatabase';

interface RadarAndFlashcardsProps {
  subjects: Subject[];
  flashcards: Flashcard[];
  selectedSubjectId: string | 'all';
}

export const RadarAndFlashcards: React.FC<RadarAndFlashcardsProps> = ({
  subjects,
  flashcards,
  selectedSubjectId,
}) => {
  const [activeSubjectId, setActiveSubjectId] = useState<string>(
    selectedSubjectId === 'all' ? 'base-de-datos-1' : selectedSubjectId
  );

  const activeSubject =
    subjects.find((s) => s.id === activeSubjectId) || subjects[0];

  // Flashcard state
  const subjectCards = flashcards.filter(
    (fc) => selectedSubjectId === 'all' || fc.subjectId === activeSubject.id
  );
  const cardsToUse = subjectCards.length > 0 ? subjectCards : flashcards;

  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);

  // Community tip input
  const [localTips, setLocalTips] = useState<
    Record<string, { author: string; text: string; votes: number }[]>
  >({});
  const [newTipText, setNewTipText] = useState('');
  const [newTipAuthor, setNewTipAuthor] = useState('');

  const currentCard = cardsToUse[cardIndex % cardsToUse.length];

  const allTipsForSubject = [
    ...(localTips[activeSubject.id] || []),
    ...activeSubject.professorTips,
  ];

  const handleAddTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTipText.trim()) return;
    const tip = {
      author: newTipAuthor.trim() ? `@${newTipAuthor.trim().replace(/^@/, '')}` : '@alumno_lsi',
      text: newTipText.trim(),
      votes: 1,
    };
    setLocalTips((prev) => ({
      ...prev,
      [activeSubject.id]: [tip, ...(prev[activeSubject.id] || [])],
    }));
    setNewTipText('');
    setNewTipAuthor('');
  };

  return (
    <div className="space-y-8">
      {/* Selector de Materia para Radar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Radar className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">
            Radar de Cátedra + Entrenador de Flashcards
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subj) => (
            <button
              key={subj.id}
              onClick={() => {
                setActiveSubjectId(subj.id);
                setCardIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeSubject.id === subj.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {subj.name}
            </button>
          ))}
        </div>
      </div>

      {/* GRID: Izquierda Radar Estadístico de Exámenes | Derecha Flashcards & Grafo de Conceptos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RADAR DE CÁTEDRA */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-indigo-400 uppercase">
                {activeSubject.code} • Estadísticas Históricas de Exámenes
              </span>
              <h3 className="text-lg font-extrabold text-white mt-0.5">
                {activeSubject.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  activeSubject.promotionAvailable
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {activeSubject.promotionAvailable
                  ? 'Promocionable'
                  : 'Solo con Examen Final'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-200">
                Dificultad: {activeSubject.difficulty} / 5
              </span>
            </div>
          </div>

          {/* Frecuencia de Temas en Parciales y Finales */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              ¿Qué temas entran casi siempre en el examen?
            </div>

            {activeSubject.topTopics.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-100">
                    {item.topic}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {item.frequency}% de las mesas
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                    style={{ width: `${item.frequency}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  🎯 <strong>Tip de corrección:</strong> {item.tip}
                </p>
              </div>
            ))}
          </div>

          {/* Próximas Mesas de Examen */}
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-200">
                Próximas Mesas / Llamados de Examen:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeSubject.nextExamDates.map((d, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-indigo-500/30 text-xs font-mono text-indigo-300"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Consejos de Alumnos que ya rindieron */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Experiencias y Consejos de Alumnos que ya Rindieron
            </div>
            <div className="space-y-2.5">
              {allTipsForSubject.map((t, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div>
                    <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                      {t.author}
                    </span>
                    <p className="text-xs text-slate-200 mt-0.5">{t.text}</p>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                    <ThumbsUp className="w-3 h-3" /> {t.votes}
                  </span>
                </div>
              ))}
            </div>

            {/* Formulario para dejar un tip de cátedra */}
            <form onSubmit={handleAddTip} className="flex flex-col sm:flex-row gap-2 pt-2">
              <input
                type="text"
                value={newTipAuthor}
                onChange={(e) => setNewTipAuthor(e.target.value)}
                placeholder="Tu usuario (ej. juan_lsi)"
                className="sm:w-40 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                value={newTipText}
                onChange={(e) => setNewTipText(e.target.value)}
                placeholder="Dejá un consejo sobre cómo evalúan en esta cátedra..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" /> Sumar Tip
              </button>
            </form>
          </div>
        </div>

        {/* DERECHA: FLASHCARDS INTERACTIVAS & GRAFO DE CONCEPTOS */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">
                  Flashcards de Repaso Activo
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                Dominadas: {masteredIds.length} / {cardsToUse.length}
              </span>
            </div>

            {/* Tarjeta Interactiva */}
            {currentCard && (
              <div className="mt-4">
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`cursor-pointer min-h-[240px] rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                    isFlipped
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-slate-950 border-indigo-500/30 hover:border-indigo-500/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-indigo-300 font-semibold">
                      {currentCard.topic}
                    </span>
                    <span className="text-slate-400 inline-flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" /> Clic para dar vuelta
                    </span>
                  </div>

                  <div className="my-4">
                    <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                      {isFlipped ? 'Respuesta de Examen:' : 'Pregunta de Coloquio / Final:'}
                    </div>
                    <p
                      className={`text-sm leading-relaxed font-medium ${
                        isFlipped ? 'text-emerald-200' : 'text-white'
                      }`}
                    >
                      {isFlipped ? currentCard.answer : currentCard.question}
                    </p>
                  </div>

                  {/* Nodos conectados estilo Obsidian */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                    <Network className="w-3.5 h-3.5 text-slate-400 mr-1" />
                    {currentCard.connectedConcepts.map((c, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        [[{c}]]
                      </span>
                    ))}
                  </div>
                </div>

                {/* Controles de Repetición Espaciada */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCardIndex((prev) => prev + 1);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    <Repeat className="w-3.5 h-3.5 text-amber-400" />
                    Repasar después
                  </button>
                  <button
                    onClick={() => {
                      if (!masteredIds.includes(currentCard.id)) {
                        setMasteredIds([...masteredIds, currentCard.id]);
                      }
                      setIsFlipped(false);
                      setCardIndex((prev) => prev + 1);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                  >
                    <Check className="w-4 h-4" />
                    ¡Ya me la sé!
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Explicación del conector futuro para archivos descargados */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-200">
              🔗 Conector de Fuente Externa Listo
            </div>
            <p>
              Cuando descargues los paquetes de apuntes y parciales desde tu otra fuente, podés importarlos directamente desde el botón superior <strong>"Subir / Importar Fuente"</strong> y se indexarán automáticamente en el buscador, las flashcards y el simulador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
