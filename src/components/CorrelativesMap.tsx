import React from 'react';
import {
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  ArrowRight,
  BookOpen,
  Code2,
} from 'lucide-react';
import { Subject } from '../data/mockDatabase';

export type SubjectStatus = 'pending' | 'regular' | 'approved';

interface CorrelativesMapProps {
  subjects: Subject[];
  statusMap: Record<string, SubjectStatus>;
  onToggleStatus: (subjectId: string) => void;
  onGoToSubjectNotes: (subjectId: string) => void;
  onGoToSubjectExam: (subjectId: string) => void;
}

export const CorrelativesMap: React.FC<CorrelativesMapProps> = ({
  subjects,
  statusMap,
  onToggleStatus,
  onGoToSubjectNotes,
  onGoToSubjectExam,
}) => {
  const canTakeSubject = (subj: Subject): { unlocked: boolean; missing: string[] } => {
    const missing: string[] = [];

    subj.correlativesForRegular.forEach((reqId) => {
      const st = statusMap[reqId] || 'pending';
      if (st !== 'regular' && st !== 'approved') {
        const reqSubj = subjects.find((s) => s.id === reqId);
        missing.push(`Regularizar ${reqSubj?.name || reqId}`);
      }
    });

    subj.correlativesForApproved.forEach((reqId) => {
      const st = statusMap[reqId] || 'pending';
      if (st !== 'approved') {
        const reqSubj = subjects.find((s) => s.id === reqId);
        missing.push(`Final aprobado de ${reqSubj?.name || reqId}`);
      }
    });

    return { unlocked: missing.length === 0, missing };
  };

  const years = [1, 2, 3, 4, 5];

  const approvedCount = Object.values(statusMap).filter((s) => s === 'approved').length;
  const regularCount = Object.values(statusMap).filter((s) => s === 'regular').length;
  const progressPercent = Math.round((approvedCount / subjects.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header de Progreso de Carrera */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">
            Mapa Interactivo de Correlatividades y Simulador de Avance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Hacé clic en el estado de cada materia (<strong>Pendiente → Regular → Aprobada</strong>) para simular qué materias se te desbloquean para cursar o rendir.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl">
          <div className="text-center">
            <div className="text-xs text-slate-400">Aprobadas</div>
            <div className="text-lg font-extrabold text-emerald-400">
              {approvedCount}/{subjects.length}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-center">
            <div className="text-xs text-slate-400">Regulares</div>
            <div className="text-lg font-extrabold text-amber-400">
              {regularCount}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-center">
            <div className="text-xs text-slate-400">Avance</div>
            <div className="text-lg font-extrabold text-indigo-400">
              {progressPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Columnas por Año */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {years.map((yr) => {
          const yearSubjects = subjects.filter((s) => s.year === yr);
          return (
            <div
              key={yr}
              className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-sm font-extrabold uppercase tracking-wider text-indigo-300">
                  {yr}° Año de Cursada
                </span>
                <span className="text-xs text-slate-400">
                  {yearSubjects.length} materias
                </span>
              </div>

              <div className="space-y-3.5">
                {yearSubjects.map((subj) => {
                  const status = statusMap[subj.id] || 'pending';
                  const { unlocked, missing } = canTakeSubject(subj);

                  let cardStyle = 'border-slate-800 bg-slate-950/70';
                  if (status === 'approved') {
                    cardStyle = 'border-emerald-500/50 bg-emerald-950/20';
                  } else if (status === 'regular') {
                    cardStyle = 'border-amber-500/50 bg-amber-950/20';
                  } else if (unlocked) {
                    cardStyle = 'border-indigo-500/40 bg-indigo-950/15';
                  } else {
                    cardStyle = 'border-slate-800/70 bg-slate-950/40 opacity-75';
                  }

                  return (
                    <div
                      key={subj.id}
                      className={`rounded-xl border p-4 transition-all ${cardStyle}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                            {subj.code} • {subj.semester}° Cuatrimestre
                          </span>
                          <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                            {subj.name}
                          </h3>
                        </div>

                        {/* Botón interactivo para cambiar estado */}
                        <button
                          onClick={() => onToggleStatus(subj.id)}
                          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            status === 'approved'
                              ? 'bg-emerald-500 text-slate-950'
                              : status === 'regular'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          {status === 'approved' && (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Aprobada
                            </>
                          )}
                          {status === 'regular' && (
                            <>
                              <Clock className="w-3.5 h-3.5" /> Regular
                            </>
                          )}
                          {status === 'pending' && 'Pendiente'}
                        </button>
                      </div>

                      {/* Estado de desbloqueo por correlativas */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs">
                        {status === 'approved' ? (
                          <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Materia completada
                          </span>
                        ) : unlocked ? (
                          <span className="text-indigo-300 font-medium inline-flex items-center gap-1">
                            <Unlock className="w-3.5 h-3.5 text-indigo-400" /> Habilitada para cursar / rendir ahora
                          </span>
                        ) : (
                          <div className="text-rose-300/90 space-y-1">
                            <div className="inline-flex items-center gap-1 font-semibold">
                              <Lock className="w-3.5 h-3.5 text-rose-400" /> Traba por correlativa:
                            </div>
                            <ul className="pl-4 list-disc text-[11px] text-slate-400">
                              {missing.map((m, idx) => (
                                <li key={idx}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Accesos directos a Apuntes y Simulador de esa materia */}
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => onGoToSubjectNotes(subj.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-[11px] font-medium border border-slate-800 transition"
                        >
                          <BookOpen className="w-3 h-3 text-sky-400" />
                          Ver Apuntes
                        </button>
                        <button
                          onClick={() => onGoToSubjectExam(subj.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-[11px] font-medium border border-slate-800 transition"
                        >
                          <Code2 className="w-3 h-3 text-emerald-400" />
                          Practicar Parcial
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
