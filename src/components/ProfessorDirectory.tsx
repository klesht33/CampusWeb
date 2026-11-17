import React, { useState, useEffect } from 'react';
import {
  Mail,
  Copy,
  Check,
  Search,
  Plus,
  ExternalLink,
  BookOpen,
  Trash2,
} from 'lucide-react';
import {
  Subject,
  ProfessorContact,
} from '../data/mockDatabase';

interface ProfessorDirectoryProps {
  subjects: Subject[];
  selectedSubjectId: string | 'all';
  onSelectSubject: (subjectId: string | 'all') => void;
  contacts: ProfessorContact[];
  onUpdateContacts: (updated: ProfessorContact[]) => void;
  isAdmin?: boolean;
}

export const ProfessorDirectory: React.FC<ProfessorDirectoryProps> = ({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  contacts,
  onUpdateContacts,
  isAdmin = false,
}) => {
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Años disponibles según las materias recibidas
  const availableYears = Array.from(new Set(subjects.map((s) => s.year))).sort(
    (a, b) => a - b
  );

  // Estado del formulario (únicamente Nombre, Correo y Materia)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subjectId, setSubjectId] = useState(
    selectedSubjectId !== 'all' ? selectedSubjectId : subjects[0]?.id || ''
  );

  useEffect(() => {
    if (selectedSubjectId !== 'all') {
      setSubjectId(selectedSubjectId);
    } else if (subjects.length > 0 && !subjects.some((s) => s.id === subjectId)) {
      setSubjectId(subjects[0].id);
    }
  }, [selectedSubjectId, subjects, subjectId]);

  const handleCopyEmail = (id: string, emailStr: string) => {
    navigator.clipboard.writeText(emailStr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const created: ProfessorContact = {
      id: `contact-${Date.now()}`,
      name: name.trim(),
      subjectId: subjectId || subjects[0]?.id || 'algoritmos-1',
      email: email.trim(),
    };

    onUpdateContacts([created, ...contacts]);
    setName('');
    setEmail('');
    setShowAddModal(false);
  };

  const handleDeleteContact = (id: string) => {
    onUpdateContacts(contacts.filter((c) => c.id !== id));
  };

  // Filtrado por las materias del año seleccionado y por búsqueda
  const filteredContacts = contacts.filter((c) => {
    const subj = subjects.find((s) => s.id === c.subjectId);
    if (!subj) {
      return false;
    }
    if (yearFilter !== 'all' && subj.year !== yearFilter) {
      return false;
    }
    if (selectedSubjectId !== 'all' && c.subjectId !== selectedSubjectId) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        subj.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Encabezado minimalista */}
      <div className="campus-surface rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-k-241f1a border border-k-d6b892/20 text-k-d6b892 text-[11px] font-medium uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5" /> Correos de Profesores
          </div>
          <h2 className="font-editorial text-2xl text-k-f3ece2">
            Directorio de Profesores
          </h2>
          <p className="text-xs text-k-9e9285">
            Filtrá por año o materia y copiá el correo oficial de cátedra con un clic.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-k-9e9285 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar profesor, materia o correo..."
              className="w-full bg-k-120f0d border border-k-2b241d rounded-full pl-9 pr-3.5 py-2 text-xs text-k-f3ece2 focus:outline-none focus:border-k-d6b892/30"
            />
          </div>
          <button
            onClick={() => setShowAddModal(!showAddModal)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-k-d6b892 hover:bg-k-e3c7a3 text-k-14110e text-xs font-semibold transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            Agregar Correo
          </button>
        </div>
      </div>

      {/* Filtro rápido por Año y Materia */}
      <div className="campus-surface rounded-2xl p-3 space-y-2.5">
        {availableYears.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-k-9e9285 px-2">Año:</span>
            <button
              onClick={() => {
                setYearFilter('all');
                onSelectSubject('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                yearFilter === 'all'
                  ? 'bg-k-d6b892 text-k-14110e font-semibold'
                  : 'text-k-a39688 hover:text-k-f3ece2 hover:bg-k-1c1814'
              }`}
            >
              Todos ({contacts.length})
            </button>
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => {
                  setYearFilter(yr);
                  onSelectSubject('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  yearFilter === yr
                    ? 'bg-k-d6b892 text-k-14110e font-semibold'
                    : 'text-k-a39688 hover:text-k-f3ece2 hover:bg-k-1c1814'
                }`}
              >
                {yr}° Año
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-k-241f1a">
          <span className="text-[11px] text-k-9e9285 px-2">Materia:</span>
          <button
            onClick={() => onSelectSubject('all')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition ${
              selectedSubjectId === 'all'
                ? 'bg-k-2b241d text-k-d6b892 border border-k-d6b892/30 font-semibold'
                : 'text-k-a39688 hover:text-k-f3ece2 hover:bg-k-1c1814'
            }`}
          >
            Todas
          </button>
          {subjects
            .filter((s) => yearFilter === 'all' || s.year === yearFilter)
            .map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSubject(s.id)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition ${
                  selectedSubjectId === s.id
                    ? 'bg-k-2b241d text-k-d6b892 border border-k-d6b892/30 font-semibold'
                    : 'text-k-a39688 hover:text-k-f3ece2 hover:bg-k-1c1814'
                }`}
              >
                {s.name}
              </button>
            ))}
        </div>
      </div>

      {/* Formulario simplificado: únicamente Nombre, Correo y Materia */}
      {showAddModal && (
        <form
          onSubmit={handleAddContact}
          className="campus-surface rounded-2xl p-5 space-y-4 shadow-xl"
        >
          <h3 className="font-editorial text-base text-k-f3ece2">
            Agregar Profesor y su Correo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-k-c8bcb0 mb-1">
                Nombre del Profesor
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Prof. Gómez"
                className="w-full bg-k-120f0d border border-k-2b241d rounded-xl px-3 py-2 text-xs text-k-f3ece2 focus:outline-none focus:border-k-d6b892"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-k-c8bcb0 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="profesor@exa.unne.edu.ar"
                className="w-full bg-k-120f0d border border-k-2b241d rounded-xl px-3 py-2 text-xs text-k-f3ece2 font-mono focus:outline-none focus:border-k-d6b892"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-k-c8bcb0 mb-1">
                Materia
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-k-120f0d border border-k-2b241d rounded-xl px-3 py-2 text-xs text-k-f3ece2 focus:outline-none focus:border-k-d6b892"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.year}° Año — {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl bg-k-1e1915 hover:bg-k-28221c text-xs font-semibold text-k-c8bcb0 border border-k-2c251e"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-k-d6b892 hover:bg-k-e3c7a3 text-xs font-semibold text-k-14110e"
            >
              Guardar Correo
            </button>
          </div>
        </form>
      )}

      {/* Listado limpio: Nombre del Profesor, Materia y su Correo */}
      {filteredContacts.length === 0 ? (
        <div className="campus-surface rounded-2xl p-6 text-center text-xs text-k-9e9285">
          No se encontraron correos de profesores para este filtro.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredContacts.map((contact) => {
            const isCopied = copiedId === contact.id;
            const subj = subjects.find((s) => s.id === contact.subjectId);

            return (
              <div
                key={contact.id}
                className="campus-surface rounded-2xl p-4 flex flex-col justify-between gap-3 transition hover:border-k-d6b892/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    {subj && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-k-231e19 border border-k-332b23 text-k-d6b892">
                        <BookOpen className="w-2.5 h-2.5" />
                        <span>
                          {subj.year}° Año · {subj.name}
                        </span>
                      </span>
                    )}
                    <div className="font-editorial text-base text-k-f3ece2 truncate">
                      {contact.name}
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      title="Eliminar correo (Solo Admin)"
                      className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-k-120f0d border border-k-26211c flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-4 h-4 text-k-d6b892 shrink-0" />
                    <span className="font-mono text-xs text-k-e5d5c0 truncate">
                      {contact.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopyEmail(contact.id, contact.email)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isCopied
                          ? 'bg-k-d6b892 text-k-14110e'
                          : 'bg-k-211c17 hover:bg-k-2c251e text-k-e5d5c0 border border-k-332b23'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> ¡Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copiar
                        </>
                      )}
                    </button>

                    <a
                      href={`mailto:${contact.email}`}
                      title="Enviar correo"
                      className="p-1.5 rounded-lg bg-k-241f1a hover:bg-k-d6b892 text-k-d6b892 hover:text-k-14110e border border-k-332b23 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
