import archiveData from '../data/unneArchiveCatalog.json';
import type { NoteCategory, ParcialInstance, StudyNote } from '../data/mockDatabase';

export interface UnneArchiveFile {
  id: string;
  subjectId: string;
  subjectFolder: string;
  name: string;
  ext: string;
  sizeBytes: number;
  category: NoteCategory;
  parcialInstance?: ParcialInstance;
  folderPath: string;
  relativePath: string;
}

export interface ArchiveNoteOverride {
  votesDelta?: number;
  verified?: boolean;
  deleted?: boolean;
}

export const UNNE_ARCHIVE_FILES = archiveData as UnneArchiveFile[];

export const UNNE_PLAN_FILES = UNNE_ARCHIVE_FILES.filter(
  (f) => f.subjectId === 'planes-lsi'
);

export const TEXT_PREVIEW_EXTENSIONS = new Set([
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
  '.excalidraw',
]);

export const IMAGE_PREVIEW_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.svg',
  '.webp',
  '.jfif',
  '.gif',
]);

export const CODE_EXTENSIONS = new Set([
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

export function resolveUnneFileUrl(relativePath: string): string {
  const encoded = relativePath
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');

  const customBase = (
    import.meta as unknown as { env?: Record<string, string | boolean | undefined> }
  ).env?.VITE_UNNE_FILES_BASE_URL;

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

export function formatFileBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getArchiveVisualMeta(ext?: string): {
  extLabel: string;
  isCode: boolean;
  isPdf: boolean;
  isImage: boolean;
  isText: boolean;
  badgeClass: string;
} {
  const lower = (ext || '').toLowerCase();
  const extLabel = lower.replace(/^\./, '').toUpperCase() || 'DOC';
  const isPdf = lower === '.pdf';
  const isImage = IMAGE_PREVIEW_EXTENSIONS.has(lower);
  const isCode = CODE_EXTENSIONS.has(lower);
  const isText = TEXT_PREVIEW_EXTENSIONS.has(lower);

  if (isPdf) {
    return {
      extLabel,
      isCode,
      isPdf,
      isImage,
      isText,
      badgeClass: 'bg-k-ea4335/15 border-k-ea4335/40 text-k-e5c29f',
    };
  }
  if (isCode) {
    return {
      extLabel,
      isCode,
      isPdf,
      isImage,
      isText,
      badgeClass: 'bg-k-1e281d border-k-5f7852/70 text-k-a9c79e',
    };
  }
  if (isImage) {
    return {
      extLabel,
      isCode,
      isPdf,
      isImage,
      isText,
      badgeClass: 'bg-k-4285f4/15 border-k-4285f4/40 text-k-d8cfc4',
    };
  }
  if (['.zip', '.rar', '.7z'].includes(lower)) {
    return {
      extLabel,
      isCode,
      isPdf,
      isImage,
      isText,
      badgeClass: 'bg-k-241f1a border-k-5b4d3e/70 text-k-c8b89e',
    };
  }
  return {
    extLabel,
    isCode,
    isPdf,
    isImage,
    isText,
    badgeClass: 'bg-k-2b2218 border-k-886843/65 text-k-e3c7a3',
  };
}

export function archiveFileToStudyNote(
  file: UnneArchiveFile,
  override?: ArchiveNoteOverride
): StudyNote {
  const baseVotes =
    file.category === 'Parcial Práctico' ||
    file.category === 'Parcial Teórico' ||
    file.category === 'Finales'
      ? 48
      : file.category === 'Proyectos' || file.category === 'Bibliografía y Libros'
      ? 42
      : 34;

  const cleanTags = [
    'UNNE-LSI',
    file.folderPath.split(' / ')[0] || 'Material',
    file.ext ? file.ext.replace('.', '').toUpperCase() : 'ARCHIVO',
  ].filter(Boolean);

  return {
    id: file.id,
    title: file.name,
    subjectId: file.subjectId,
    category: file.category,
    parcialInstance: file.parcialInstance,
    author: 'Base UNNE-LSI (@tobiager)',
    createdAt: file.folderPath,
    votes: Math.max(0, baseVotes + (override?.votesDelta || 0)),
    verifiedByStudents: override?.verified !== undefined ? override.verified : true,
    tags: cleanTags,
    summary: `Archivo ubicado en "${file.folderPath}" dentro de ${file.subjectFolder} (${formatFileBytes(
      file.sizeBytes
    )}).`,
    contentMarkdown: `# ${file.name}\n\n- **Materia:** ${file.subjectFolder}\n- **Sección:** ${file.category}${
      file.parcialInstance ? ` (${file.parcialInstance})` : ''
    }\n- **Carpeta:** ${file.folderPath}\n- **Tamaño:** ${formatFileBytes(file.sizeBytes)}\n\nPodés visualizar o descargar el archivo original directamente desde este visor.`,
    externalFileUrl: file.relativePath,
    folderPath: file.folderPath,
    fileExt: file.ext,
    fileSizeBytes: file.sizeBytes,
    isArchiveBase: true,
  };
}
