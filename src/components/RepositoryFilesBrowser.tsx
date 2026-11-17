import React, { useState, useMemo, useEffect } from 'react';
import {
  FolderOpen,
  FileText,
  FileCode2,
  Image as ImageIcon,
  FileArchive,
  Download,
  Eye,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  X,
  BookMarked,
  Copy,
  Check,
  HardDrive,
} from 'lucide-react';
import archiveData from '../data/unneArchiveCatalog.json';
import type { Subject } from '../data/mockDatabase';

export type ArchiveCategory =
  | 'Teoría y Apuntes'
  | 'Práctica y TPs'
  | 'Parcial Práctico'
  | 'Parcial Teórico'
  | 'Finales'
  | 'Exámenes Libres'
  | 'Proyectos'
  | 'Bibliografía y Libros';

export interface UnneArchiveFile {
  id: string;
  subjectId: string;
  subjectFolder: string;
  name: string;
  ext: string;
  sizeBytes: number;
  category: ArchiveCategory;
  parcialInstance?: string;
  folderPath: string;
  relativePath: string;
}

const ARCHIVE_FILES = archiveData as UnneArchiveFile[];

const ARCHIVE_CATEGORIES: ('Todos' | ArchiveCategory)[] = [
  'Todos',
  'Teoría y Apuntes',
  'Práctica y TPs',
  'Parcial Práctico',
  'Parcial Teórico',
  'Finales',
  'Exámenes Libres',
  'Proyectos',
  'Bibliografía y Libros',
];

const TEXT_EXTENSIONS = new Set([
  '.md',
  '.txt',
  '.c',
  '.cpp',
  '.h',
  '.cs',
  '.lsp',
  '.lisp',
  '.sql',
  '.s',
  '.r',
  '.json',
  '.yaml',
  '.html',
]);

const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.svg',
  '.webp',
  '.jfif',
  '.gif',
]);

export function resolveUnneFileUrl(relativePath: string): string {
  const encoded = relativePath
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');

  const customBase = (import.meta as unknown as { env?: Record<string, string | boolean | undefined> }).env
    ?.VITE_UNNE_FILES_BASE_URL;

  if (typeof customBase === 'string' && customBase.trim()) {
    return `${customBase.replace(/\/+$/, '')}/${encoded}`;
  }

  const isProd = Boolean(
    (import.meta as unknown as { env?: Record<string, unknown> }).env?.PROD
  );
  if (isProd) {
    return `https://raw.githubusercontent.com/tobiager/UNNE-LSI/main/${encoded}`;
  }

  return `/unne-files/${encoded}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const CODE_EXTENSIONS = new Set([
  '.c',
  '.cpp',
  '.h',
  '.cs',
  '.lsp',
  '.lisp',
  '.sql',
  '.s',
  '.r',
  '.json',
  '.yaml',
  '.html',
]);

function getFileKindIcon(ext: string) {
  const lower = ext.toLowerCase();
  if (IMAGE_EXTENSIONS.has(lower)) return ImageIcon;
  if (TEXT_EXTENSIONS.has(lower)) return FileCode2;
  if (['.zip', '.rar', '.7z'].includes(lower)) return FileArchive;
  return FileText;
}

function getFileVisualStyle(ext: string): {
  extLabel: string;
  iconBoxClass: string;
  badgeClass: string;
} {
  const lower = ext.toLowerCase();
  const extLabel = lower.replace(/^\./, '').toUpperCase() || 'ARCHIVO';

  if (lower === '.pdf') {
    return {
      extLabel,
      iconBoxClass: 'bg-k-ea4335/15 border-k-ea4335/40 text-k-e5c29f',
      badgeClass: 'bg-k-ea4335/15 border-k-ea4335/35 text-k-e5c29f',
    };
  }
  if (CODE_EXTENSIONS.has(lower)) {
    return {
      extLabel,
      iconBoxClass: 'bg-k-1e281d border-k-5f7852/70 text-k-a9c79e',
      badgeClass: 'bg-k-1e281d border-k-5f7852/65 text-k-a9c79e',
    };
  }
  if (IMAGE_EXTENSIONS.has(lower)) {
    return {
      extLabel,
      iconBoxClass: 'bg-k-4285f4/15 border-k-4285f4/40 text-k-d8cfc4',
      badgeClass: 'bg-k-4285f4/15 border-k-4285f4/35 text-k-d8cfc4',
    };
  }
  if (['.zip', '.rar', '.7z'].includes(lower)) {
    return {
      extLabel,
      iconBoxClass: 'bg-k-241f1a border-k-5b4d3e/70 text-k-c8b89e',
      badgeClass: 'bg-k-241f1a border-k-5b4d3e/65 text-k-c8b89e',
    };
  }
  return {
    extLabel,
    iconBoxClass: 'bg-k-2b2218 border-k-886843/65 text-k-e3c7a3',
    badgeClass: 'bg-k-2b2218 border-k-886843/60 text-k-e3c7a3',
  };
}

function isPreviewable(ext: string): boolean {
  const lower = ext.toLowerCase();
  return lower === '.pdf' || IMAGE_EXTENSIONS.has(lower) || TEXT_EXTENSIONS.has(lower);
}

interface RepositoryFilesBrowserProps {
  subjects: Subject[];
  selectedSubjectId: string | 'all';
  activeSubTabCategory?: string;
  parcialInstanceFilter?: string;
  globalSearchQuery?: string;
}

export const RepositoryFilesBrowser: React.FC<RepositoryFilesBrowserProps> = ({
  subjects,
  selectedSubjectId,
  activeSubTabCategory = 'General',
  parcialInstanceFilter = 'all',
  globalSearchQuery = '',
}) => {
  const [selectedCat, setSelectedCat] = useState<'Todos' | ArchiveCategory>('Todos');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [previewFile, setPreviewFile] = useState<UnneArchiveFile | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showPlansDrawer, setShowPlansDrawer] = useState<boolean>(false);

  // Sync category filter automatically when user switches top sub-tab
  useEffect(() => {
    if (
      ARCHIVE_CATEGORIES.includes(activeSubTabCategory as ArchiveCategory) &&
      activeSubTabCategory !== 'Todos'
    ) {
      setSelectedCat(activeSubTabCategory as ArchiveCategory);
    } else if (activeSubTabCategory === 'General') {
      setSelectedCat('Todos');
    }
  }, [activeSubTabCategory]);

  const yearSubjectIds = useMemo(
    () => new Set(subjects.map((s) => s.id)),
    [subjects]
  );

  const subjectNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    subjects.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [subjects]);

  const effectiveSearch = (localSearch || globalSearchQuery).trim().toLowerCase();

  // Files belonging to the active year / subject
  const subjectScopedFiles = useMemo(() => {
    return ARCHIVE_FILES.filter((f) => {
      if (f.subjectId === 'planes-lsi') return false;
      if (selectedSubjectId !== 'all') {
        return f.subjectId === selectedSubjectId;
      }
      return yearSubjectIds.has(f.subjectId);
    });
  }, [selectedSubjectId, yearSubjectIds]);

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = { Todos: subjectScopedFiles.length };
    ARCHIVE_CATEGORIES.forEach((cat) => {
      if (cat !== 'Todos') counts[cat] = 0;
    });
    subjectScopedFiles.forEach((f) => {
      counts[f.category] = (counts[f.category] || 0) + 1;
    });
    return counts;
  }, [subjectScopedFiles]);

  const filteredFiles = useMemo(() => {
    return subjectScopedFiles.filter((f) => {
      if (selectedCat !== 'Todos' && f.category !== selectedCat) return false;
      if (
        parcialInstanceFilter !== 'all' &&
        (selectedCat === 'Parcial Práctico' || selectedCat === 'Parcial Teórico') &&
        f.parcialInstance !== parcialInstanceFilter
      ) {
        return false;
      }
      if (effectiveSearch) {
        const hay = `${f.name} ${f.folderPath} ${f.subjectFolder} ${f.category}`.toLowerCase();
        if (!hay.includes(effectiveSearch)) return false;
      }
      return true;
    });
  }, [subjectScopedFiles, selectedCat, parcialInstanceFilter, effectiveSearch]);

  // Group files by Subject + Folder
  const groupedFolders = useMemo(() => {
    const groups: Record<
      string,
      { key: string; subjectName: string; folderPath: string; items: UnneArchiveFile[] }
    > = {};

    filteredFiles.forEach((f) => {
      const subjLabel = subjectNameMap[f.subjectId] || f.subjectFolder;
      const key =
        selectedSubjectId === 'all'
          ? `${subjLabel} :: ${f.folderPath}`
          : f.folderPath;

      if (!groups[key]) {
        groups[key] = {
          key,
          subjectName: subjLabel,
          folderPath: f.folderPath,
          items: [],
        };
      }
      groups[key].items.push(f);
    });

    return Object.values(groups).sort((a, b) =>
      a.key.localeCompare(b.key, 'es')
    );
  }, [filteredFiles, selectedSubjectId, subjectNameMap]);

  // Plan documents (2009 / 2023)
  const planFiles = useMemo(
    () => ARCHIVE_FILES.filter((f) => f.subjectId === 'planes-lsi'),
    []
  );

  // Load text preview when opening a text/code file
  useEffect(() => {
    if (!previewFile) {
      setPreviewText(null);
      setPreviewError(null);
      setCopiedCode(false);
      return;
    }

    const ext = previewFile.ext.toLowerCase();
    if (!TEXT_EXTENSIONS.has(ext)) {
      setPreviewText(null);
      setPreviewLoading(false);
      setPreviewError(null);
      return;
    }

    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);
    const url = resolveUnneFileUrl(previewFile.relativePath);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((txt) => {
        if (!cancelled) {
          setPreviewText(txt);
          setPreviewLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewError(
            'No se pudo cargar la vista previa de texto en este entorno. Podés abrir o descargar el archivo directamente.'
          );
          setPreviewLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [previewFile]);

  const toggleFolder = (key: string, defaultOpen: boolean) => {
    setExpandedFolders((prev) => {
      const current = prev[key] !== undefined ? prev[key] : defaultOpen;
      return { ...prev, [key]: !current };
    });
  };

  if (subjectScopedFiles.length === 0) {
    return (
      <div className="campus-surface rounded-2xl p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-4 h-4 text-k-d6b892" />
            <h3 className="font-editorial text-base text-k-f3ece2">
              Archivo Base UNNE-LSI
            </h3>
          </div>
          <button
            onClick={() => setShowPlansDrawer(!showPlansDrawer)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-k-1e1915 hover:bg-k-26211c border border-k-332b23 text-xs text-k-d6b892 transition"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Planes de Estudio (2009 / 2023)</span>
          </button>
        </div>
        <p className="text-xs text-k-9e9285">
          Esta materia todavía no tiene archivos cargados dentro de <code className="text-k-c8ab86">UNNE-LSI-main</code>. Podés subir apuntes desde la pestaña Comunidad.
        </p>
        {showPlansDrawer && (
          <div className="pt-3 border-t border-k-241f1a grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {planFiles.map((pf) => (
              <div
                key={pf.id}
                className="flex items-center justify-between gap-2 p-3 rounded-xl bg-k-14110e border border-k-27211c"
              >
                <span className="text-xs text-k-e5d5c0 truncate">{pf.name}</span>
                <button
                  onClick={() => setPreviewFile(pf)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-k-241f1a text-k-d6b892 hover:bg-k-332b23 transition shrink-0"
                >
                  Ver
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="space-y-4 pt-2">
      <div className="campus-surface rounded-2xl p-5 space-y-4">
        {/* Cabecera del Repositorio de Archivos */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-k-d6b892" />
              <h3 className="font-editorial text-lg text-k-f3ece2">
                Archivos Organizados de Cátedra — Base UNNE-LSI ({filteredFiles.length})
              </h3>
            </div>
            <p className="text-xs text-k-9e9285">
              Material ordenado por carpeta y categoría desde{' '}
              <code className="text-k-c8ab86">UNNE-LSI-main</code> (PDFs, apuntes, código fuente, prácticos y parciales).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowPlansDrawer(!showPlansDrawer)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-k-1e1915 hover:bg-k-26211c border border-k-332b23 text-xs text-k-d6b892 transition"
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Planes 2009 / 2023 ({planFiles.length})</span>
            </button>
          </div>
        </div>

        {/* Planes de Estudio desplegables */}
        {showPlansDrawer && (
          <div className="p-3.5 rounded-xl bg-k-120f0d border border-k-27211c space-y-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-k-d6b892">
              Documentos Oficiales — Planes de Estudio LSI UNNE
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {planFiles.map((pf) => (
                <div
                  key={pf.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-k-171411 border border-k-26211c"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-k-f3ece2 truncate">
                      {pf.name}
                    </div>
                    <div className="text-[10px] text-k-8e8275">
                      {formatBytes(pf.sizeBytes)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setPreviewFile(pf)}
                      className="px-2.5 py-1 rounded-lg bg-k-241f1a hover:bg-k-332b23 text-[11px] text-k-d6b892 transition"
                    >
                      Ver
                    </button>
                    <a
                      href={resolveUnneFileUrl(pf.relativePath)}
                      download={pf.name}
                      className="px-2 py-1 rounded-lg bg-k-1e1915 hover:bg-k-26211c text-[11px] text-k-c8bcb0 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buscador y Filtros por Categoría */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1">
            {ARCHIVE_CATEGORIES.map((cat) => {
              const count = countsByCategory[cat] || 0;
              if (cat !== 'Todos' && count === 0) return null;
              const isSelected = selectedCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition ${
                    isSelected
                      ? 'bg-k-1e1915 border border-k-332b23 text-k-f3ece2 font-semibold shadow-sm'
                      : 'border border-transparent text-k-a39688 hover:text-k-f3ece2 hover:bg-k-1e1915/60 font-medium'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-[10px] font-mono text-k-8e8275">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-k-8e8275 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Filtrar archivo o carpeta..."
              className="w-full bg-k-120f0d border border-k-2b241d rounded-xl pl-8 pr-3 py-1.5 text-xs text-k-f3ece2 placeholder:text-k-7d7063 focus:outline-none focus:border-k-d6b892/50"
            />
          </div>
        </div>

        {/* Lista de Carpetas Ordenadas */}
        {groupedFolders.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-k-120f0d border border-k-241f1a space-y-2">
            <p className="text-xs text-k-9e9285">
              No hay archivos que coincidan con los filtros actuales.
            </p>
            {(selectedCat !== 'Todos' || localSearch) && (
              <button
                onClick={() => {
                  setSelectedCat('Todos');
                  setLocalSearch('');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-k-241f1a text-k-d6b892 text-xs font-semibold hover:bg-k-332b23 transition"
              >
                Mostrar todos los archivos
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {groupedFolders.map((group, idx) => {
              const defaultOpen = groupedFolders.length <= 3 || idx < 2 || Boolean(effectiveSearch);
              const isOpen =
                expandedFolders[group.key] !== undefined
                  ? expandedFolders[group.key]
                  : defaultOpen;

              return (
                <div
                  key={group.key}
                  className="campus-folder-card rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFolder(group.key, defaultOpen)}
                    className="campus-folder-header w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-k-d6b892/15 border border-k-d6b892/35 text-k-e3c7a3 flex items-center justify-center shrink-0">
                        <FolderOpen className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-k-f5efe6 truncate">
                          {selectedSubjectId === 'all'
                            ? `${group.subjectName} — ${group.folderPath}`
                            : group.folderPath}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-k-13100d border border-k-4a3e33 text-k-e3c7a3">
                        {group.items.length}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-k-b5a38e" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-k-b5a38e" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="campus-folder-files-well divide-y divide-k-2b241d max-h-[420px] overflow-y-auto custom-scrollbar">
                      {group.items.map((file) => {
                        const Icon = getFileKindIcon(file.ext);
                        const visual = getFileVisualStyle(file.ext);
                        const fileUrl = resolveUnneFileUrl(file.relativePath);
                        const canPreview = isPreviewable(file.ext);

                        return (
                          <div
                            key={file.id}
                            className="campus-file-row px-4 py-3 pl-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-l-2 border-l-transparent hover:border-l-k-d6b892 transition"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${visual.iconBoxClass}`}
                              >
                                <Icon className="w-4 h-4" />
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-[0.83rem] font-medium text-k-f3ece2 truncate">
                                    {file.name}
                                  </span>
                                  <span
                                    className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border shrink-0 ${visual.badgeClass}`}
                                  >
                                    {visual.extLabel}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-k-a89b8c mt-0.5">
                                  <span>{file.category}</span>
                                  {file.parcialInstance && (
                                    <>
                                      <span>•</span>
                                      <span className="text-k-e3c7a3 font-medium">
                                        {file.parcialInstance}
                                      </span>
                                    </>
                                  )}
                                  <span>•</span>
                                  <span>{formatBytes(file.sizeBytes)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                              {canPreview && (
                                <button
                                  onClick={() => setPreviewFile(file)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-k-2b241d hover:bg-k-383028 text-k-e3c7a3 border border-k-4a3e33 text-xs font-medium transition"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Vista previa</span>
                                </button>
                              )}
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-k-1e1915 hover:bg-k-2b241d text-k-d8cfc4 border border-k-332b23 text-xs transition"
                                title="Abrir en pestaña nueva"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={fileUrl}
                                download={file.name}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-k-1e1915 hover:bg-k-2b241d text-k-d8cfc4 border border-k-332b23 text-xs transition"
                                title="Descargar"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Vista Previa de PDF / Imagen / Código */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="bg-k-171411 border border-k-332b23 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-k-27211c bg-k-13100d flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[11px] text-k-d6b892 font-medium truncate">
                  {previewFile.subjectFolder} • {previewFile.folderPath}
                </div>
                <h4 className="font-editorial text-lg text-k-f3ece2 truncate">
                  {previewFile.name}
                </h4>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {previewText !== null && (
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(previewText);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 1800);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-k-241f1a hover:bg-k-332b23 text-xs text-k-d6b892 border border-k-332b23 transition"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
                  </button>
                )}
                <a
                  href={resolveUnneFileUrl(previewFile.relativePath)}
                  download={previewFile.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-k-d6b892 hover:bg-k-e3c7a3 text-k-14110e text-xs font-semibold transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar ({formatBytes(previewFile.sizeBytes)})</span>
                </a>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 rounded-xl bg-k-1e1915 hover:bg-k-2b241d text-k-a39688 hover:text-k-f3ece2 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 flex-1 overflow-auto custom-scrollbar bg-k-110e0b">
              {previewFile.ext.toLowerCase() === '.pdf' ? (
                <iframe
                  src={resolveUnneFileUrl(previewFile.relativePath)}
                  title={previewFile.name}
                  className="w-full h-[70vh] rounded-2xl border border-k-27211c bg-white"
                />
              ) : IMAGE_EXTENSIONS.has(previewFile.ext.toLowerCase()) ? (
                <div className="flex items-center justify-center min-h-[50vh]">
                  <img
                    src={resolveUnneFileUrl(previewFile.relativePath)}
                    alt={previewFile.name}
                    className="max-w-full max-h-[70vh] rounded-2xl border border-k-27211c object-contain"
                  />
                </div>
              ) : previewLoading ? (
                <div className="p-10 text-center text-xs text-k-9e9285">
                  Cargando contenido del archivo...
                </div>
              ) : previewError ? (
                <div className="p-8 text-center text-xs text-k-d6b892">
                  {previewError}
                </div>
              ) : (
                <pre className="p-5 rounded-2xl bg-k-14110e border border-k-27211c text-xs font-mono text-k-e5d5c0 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                  {previewText}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
