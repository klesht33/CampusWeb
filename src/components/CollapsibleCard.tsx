import React from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleCardProps {
  title: string;
  icon?: React.ReactNode;
  /** Acción secundaria del encabezado (por ejemplo "Ver todo"). Solo se muestra con el panel expandido. */
  action?: React.ReactNode;
  /** Texto corto visible solo cuando el panel está minimizado (resumen). */
  collapsedHint?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

/**
 * Tarjeta lateral que se puede minimizar o expandir con una transición suave.
 * Controlada: el estado (open) vive en el padre para poder minimizar/expandir varias a la vez y persistirlo.
 */
export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  icon,
  action,
  collapsedHint,
  open,
  onToggle,
  className = '',
  bodyClassName = 'space-y-4',
  children,
}) => {
  return (
    <section className={`campus-surface rounded-3xl overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-2 px-5 py-3.5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          title={open ? 'Minimizar' : 'Expandir'}
          className="flex flex-1 min-w-0 items-center gap-2.5 text-left group"
        >
          {icon && <span className="text-k-d6b892 shrink-0">{icon}</span>}
          <h3 className="font-editorial text-lg text-k-f3ece2 truncate group-hover:text-k-d6b892 transition">
            {title}
          </h3>
          {!open && collapsedHint && (
            <span className="ml-1 text-[11px] text-k-9e9285 truncate">{collapsedHint}</span>
          )}
        </button>

        <div className="flex items-center gap-2 shrink-0">
          {open && action}
          <button
            type="button"
            onClick={onToggle}
            aria-label={open ? `Minimizar ${title}` : `Expandir ${title}`}
            className="w-7 h-7 rounded-full flex items-center justify-center text-k-9e9285 hover:text-k-d6b892 hover:bg-k-241f1a transition"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Transición de altura con grid-rows (0fr ↔ 1fr), sin medir alturas con JS */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <div className={`px-5 pb-5 ${bodyClassName}`}>{children}</div>
        </div>
      </div>
    </section>
  );
};
