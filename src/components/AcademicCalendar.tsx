import React, { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import type { Subject } from '../data/mockDatabase';
import {
  CalendarEvent,
  CalendarEventType,
  EVENT_TYPE_META,
  MONTHS_LONG,
  daysUntil,
  formatShortDate,
  parseISODate,
  relativeLabel,
  toISODate,
  todayISO,
  upcomingEvents,
} from '../data/academicCalendar';
import { detectMaliciousPayload, sanitizeUserText } from '../utils/security';

interface AcademicCalendarProps {
  subjects: Subject[];
  /** Todos los eventos (oficiales + propios) */
  events: CalendarEvent[];
  /** Solo los eventos propios (para guardarlos) */
  onChangeCustomEvents: (next: CalendarEvent[]) => void;
  onOpenSubject?: (subjectId: string) => void;
  onBack?: () => void;
}

const WEEK_HEADERS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const TYPE_ORDER: CalendarEventType[] = ['final', 'parcial', 'recuperatorio', 'entrega', 'personal'];

export const AcademicCalendar: React.FC<AcademicCalendarProps> = ({
  subjects,
  events,
  onChangeCustomEvents,
  onOpenSubject,
  onBack,
}) => {
  const today = todayISO();
  const [cursor, setCursor] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string>(today);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today);
  const [type, setType] = useState<CalendarEventType>('parcial');
  const [subjectId, setSubjectId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const customEvents = useMemo(() => events.filter((e) => e.custom), [events]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of events) (map[e.date] ||= []).push(e);
    return map;
  }, [events]);

  // Celdas del mes (semana empieza en lunes)
  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7; // lunes = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: ({ iso: string; day: number } | null)[] = [];
    for (let i = 0; i < offset; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      out.push({ iso: toISODate(new Date(year, month, d)), day: d });
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [cursor]);

  const selectedEvents = eventsByDate[selectedDate] || [];
  const upcoming = useMemo(() => upcomingEvents(events, 8), [events]);

  const shiftMonth = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  const goToday = () => {
    const t = new Date();
    setCursor(new Date(t.getFullYear(), t.getMonth(), 1));
    setSelectedDate(today);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const clean = sanitizeUserText(title, 90);
    if (!clean) {
      setFormError('Escribí un título para el evento.');
      return;
    }
    if (detectMaliciousPayload(title).malicious) {
      setFormError('El título contiene contenido no permitido.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setFormError('Elegí una fecha válida.');
      return;
    }
    const created: CalendarEvent = {
      id: `custom-${Date.now()}`,
      title: clean,
      date,
      type,
      subjectId: subjectId || undefined,
      custom: true,
    };
    onChangeCustomEvents([...customEvents, created]);
    setTitle('');
    setSelectedDate(date);
    const d = parseISODate(date);
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const handleDelete = (id: string) =>
    onChangeCustomEvents(customEvents.filter((e) => e.id !== id));

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-6 space-y-6">
      <div className="campus-surface rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-k-241f1a border border-k-d6b892/20 text-k-d6b892 text-xs font-medium">
            <CalendarIcon className="w-3.5 h-3.5" /> Calendario académico
          </div>
          <h1 className="font-editorial text-3xl text-k-f3ece2">Fechas y entregas</h1>
          <p className="text-xs text-k-9e9285 max-w-xl">
            Las mesas de examen se cargan solas desde tus materias. Agregá tus parciales, entregas y
            recordatorios para verlos acá y en “Próximos eventos” del Inicio.
          </p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-k-1a1613 hover:bg-k-26211c border border-k-332b23 text-xs text-k-d6b892 shrink-0 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver a Herramientas
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendario mensual */}
        <section className="lg:col-span-8 campus-surface rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-editorial text-xl text-k-f3ece2">
              {MONTHS_LONG[cursor.getMonth()]} {cursor.getFullYear()}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={goToday}
                className="px-3 py-1.5 rounded-xl text-xs bg-k-241f1a hover:bg-k-2c241d text-k-d8cfc4 transition"
              >
                Hoy
              </button>
              <button
                onClick={() => shiftMonth(-1)}
                aria-label="Mes anterior"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-k-1a1613 hover:bg-k-26211c text-k-d6b892 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => shiftMonth(1)}
                aria-label="Mes siguiente"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-k-1a1613 hover:bg-k-26211c text-k-d6b892 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {WEEK_HEADERS.map((w) => (
              <div key={w} className="text-[10px] font-semibold uppercase tracking-wider text-k-8e8275 py-1">
                {w}
              </div>
            ))}
            {cells.map((cell, i) => {
              if (!cell) return <div key={`e-${i}`} className="aspect-square sm:aspect-[4/3]" />;
              const dayEvents = eventsByDate[cell.iso] || [];
              const isToday = cell.iso === today;
              const isSelected = cell.iso === selectedDate;
              return (
                <button
                  key={cell.iso}
                  onClick={() => setSelectedDate(cell.iso)}
                  className={`aspect-square sm:aspect-[4/3] rounded-xl flex flex-col items-center justify-between p-1.5 text-xs transition ${
                    isSelected
                      ? 'bg-k-2c241d border border-k-d6b892/40 text-k-f3ece2'
                      : 'bg-k-14110e hover:bg-k-1b1713 text-k-c8bcb0'
                  }`}
                >
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full font-medium ${
                      isToday ? 'bg-k-d6b892 text-k-14110e font-semibold' : ''
                    }`}
                  >
                    {cell.day}
                  </span>
                  <span className="flex items-center gap-0.5 h-2">
                    {dayEvents.slice(0, 4).map((ev) => (
                      <span
                        key={ev.id}
                        className={`w-1.5 h-1.5 rounded-full ${EVENT_TYPE_META[ev.type].dotClass}`}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
            {TYPE_ORDER.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 text-[11px] text-k-9e9285">
                <span className={`w-2 h-2 rounded-full ${EVENT_TYPE_META[t].dotClass}`} />
                {EVENT_TYPE_META[t].label}
              </span>
            ))}
          </div>
        </section>

        {/* Panel lateral: día seleccionado + próximos */}
        <aside className="lg:col-span-4 space-y-4">
          <section className="campus-surface rounded-3xl p-5 space-y-3">
            <h3 className="font-editorial text-lg text-k-f3ece2">{formatShortDate(selectedDate)}</h3>
            {selectedEvents.length === 0 ? (
              <p className="text-xs text-k-9e9285">No hay eventos este día.</p>
            ) : (
              <ul className="space-y-2">
                {selectedEvents.map((ev) => (
                  <EventRow
                    key={ev.id}
                    ev={ev}
                    onDelete={ev.custom ? () => handleDelete(ev.id) : undefined}
                    onOpenSubject={ev.subjectId && onOpenSubject ? () => onOpenSubject(ev.subjectId!) : undefined}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="campus-surface rounded-3xl p-5 space-y-3">
            <h3 className="font-editorial text-lg text-k-f3ece2">Próximos eventos</h3>
            {upcoming.length === 0 ? (
              <p className="text-xs text-k-9e9285">No hay eventos próximos.</p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((ev) => (
                  <li key={ev.id}>
                    <button
                      onClick={() => {
                        setSelectedDate(ev.date);
                        const d = parseISODate(ev.date);
                        setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-k-1b1713 text-left transition"
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${EVENT_TYPE_META[ev.type].dotClass}`} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs text-k-f3ece2 truncate">{ev.title}</span>
                        <span className="block text-[11px] text-k-9e9285">{formatShortDate(ev.date)}</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-k-241f1a text-k-d6b892 shrink-0">
                        {relativeLabel(daysUntil(ev.date))}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      {/* Agregar evento propio */}
      <form onSubmit={handleAdd} className="campus-surface rounded-3xl p-5 space-y-4">
        <h3 className="font-editorial text-lg text-k-f3ece2 flex items-center gap-2">
          <Plus className="w-4 h-4 text-k-d6b892" /> Agregar evento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <label className="md:col-span-4 space-y-1">
            <span className="text-[11px] text-k-9e9285">Título</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={90}
              placeholder="Ej: 1° Parcial de Paradigmas"
              className="w-full bg-k-120f0d border border-k-2b241d rounded-xl px-3 py-2 text-xs text-k-f3ece2 focus:outline-none focus:border-k-d6b892/30"
            />
          </label>
          <label className="md:col-span-2 space-y-1">
            <span className="text-[11px] text-k-9e9285">Fecha</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-k-120f0d border border-k-2b241d rounded-xl px-3 py-2 text-xs text-k-f3ece2 focus:outline-none focus:border-k-d6b892/30"
            />
          </label>
          <label className="md:col-span-2 space-y-1">
            <span className="text-[11px] text-k-9e9285">Tipo</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CalendarEventType)}
              className="w-full bg-k-120f0d border border-k-2b241d rounded-xl px-3 py-2 text-xs text-k-f3ece2"
            >
              {TYPE_ORDER.filter((t) => t !== 'final').map((t) => (
                <option key={t} value={t}>
                  {EVENT_TYPE_META[t].label}
                </option>
              ))}
            </select>
          </label>
          <label className="md:col-span-3 space-y-1">
            <span className="text-[11px] text-k-9e9285">Materia (opcional)</span>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full bg-k-120f0d border border-k-2b241d rounded-xl px-3 py-2 text-xs text-k-f3ece2"
            >
              <option value="">Sin materia</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.year}° · {s.name}
                </option>
              ))}
            </select>
          </label>
          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full px-3 py-2 rounded-xl bg-k-d6b892 hover:bg-k-e3c7a3 text-k-14110e text-xs font-semibold transition"
            >
              Agregar
            </button>
          </div>
        </div>
        {formError && <p className="text-xs text-rose-300">{formError}</p>}
      </form>
    </main>
  );
};

const EventRow: React.FC<{
  ev: CalendarEvent;
  onDelete?: () => void;
  onOpenSubject?: () => void;
}> = ({ ev, onDelete, onOpenSubject }) => (
  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-k-14110e">
    <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${EVENT_TYPE_META[ev.type].dotClass}`} />
    <div className="flex-1 min-w-0 space-y-1">
      <div className="text-xs text-k-f3ece2">{ev.title}</div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${EVENT_TYPE_META[ev.type].pillClass}`}>
          {EVENT_TYPE_META[ev.type].label}
        </span>
        {onOpenSubject && (
          <button onClick={onOpenSubject} className="text-[10px] text-k-d6b892 hover:underline">
            Ver apuntes
          </button>
        )}
      </div>
    </div>
    {onDelete && (
      <button
        onClick={onDelete}
        aria-label="Eliminar evento"
        className="p-1.5 rounded-lg text-k-9e9285 hover:text-rose-300 hover:bg-k-241f1a transition"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    )}
  </li>
);
