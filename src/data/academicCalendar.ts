// Datos y utilidades del calendario académico.
// Eventos oficiales: se derivan de las fechas de mesas de examen (`nextExamDates`) de cada materia.
// Eventos propios: los crea el usuario (parciales, entregas, recuperatorios, recordatorios) y se guardan en localStorage.
import type { Subject } from './mockDatabase';

export type CalendarEventType = 'final' | 'parcial' | 'entrega' | 'recuperatorio' | 'personal';

export interface CalendarEvent {
  id: string;
  title: string;
  /** Fecha local en formato YYYY-MM-DD */
  date: string;
  type: CalendarEventType;
  subjectId?: string;
  /** true = creado por el usuario (se puede eliminar) */
  custom?: boolean;
}

export const EVENT_TYPE_META: Record<
  CalendarEventType,
  { label: string; dotClass: string; pillClass: string }
> = {
  final: {
    label: 'Mesa de examen',
    dotClass: 'bg-emerald-400',
    pillClass: 'bg-emerald-400/15 text-emerald-300',
  },
  parcial: {
    label: 'Parcial',
    dotClass: 'bg-rose-400',
    pillClass: 'bg-rose-400/15 text-rose-300',
  },
  recuperatorio: {
    label: 'Recuperatorio',
    dotClass: 'bg-orange-400',
    pillClass: 'bg-orange-400/15 text-orange-300',
  },
  entrega: {
    label: 'Entrega / TP',
    dotClass: 'bg-k-d6b892',
    pillClass: 'bg-k-d6b892/15 text-k-d6b892',
  },
  personal: {
    label: 'Recordatorio',
    dotClass: 'bg-k-9e9285',
    pillClass: 'bg-k-9e9285/15 text-k-c8bcb0',
  },
};

const STORAGE_KEY = 'campus_unne_calendar_v1';

const pad = (n: number) => String(n).padStart(2, '0');

export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseISODate = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const todayISO = () => toISODate(new Date());

/** Días desde hoy hasta la fecha (negativo = ya pasó). */
export function daysUntil(iso: string): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((parseISODate(iso).getTime() - start) / 86400000);
}

export function relativeLabel(days: number): string {
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  if (days === -1) return 'Ayer';
  if (days < 0) return `Hace ${Math.abs(days)} días`;
  return `En ${days} días`;
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
export const MONTHS_LONG = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** Ej: "Mar, 24 Nov" */
export function formatShortDate(iso: string): string {
  const d = parseISODate(iso);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function buildOfficialEvents(subjects: Subject[]): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  for (const s of subjects) {
    (s.nextExamDates || []).forEach((date, i) => {
      out.push({
        id: `exam-${s.id}-${i}`,
        title: `Mesa de examen: ${s.name}`,
        date,
        type: 'final',
        subjectId: s.id,
      });
    });
  }
  return out;
}

export function loadCustomEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e) =>
          e &&
          typeof e.id === 'string' &&
          typeof e.title === 'string' &&
          /^\d{4}-\d{2}-\d{2}$/.test(e.date) &&
          e.type in EVENT_TYPE_META
      )
      .map((e) => ({ ...e, custom: true }) as CalendarEvent);
  } catch {
    return [];
  }
}

export function saveCustomEvents(events: CalendarEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.filter((e) => e.custom)));
  } catch {
    /* sin almacenamiento disponible */
  }
}

/** Próximos eventos (desde hoy) ordenados por fecha. */
export function upcomingEvents(events: CalendarEvent[], limit?: number): CalendarEvent[] {
  const list = events
    .filter((e) => daysUntil(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  return typeof limit === 'number' ? list.slice(0, limit) : list;
}
