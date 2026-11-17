// Motor de paletas de CampusLab.
// Todos los colores de la UI son variables CSS `--k-<hex>` (ver tailwind.config.js `colors.k` e index.css `:root`).
// Cada paleta transforma los colores base (Arena Dorada) en HSL: rota el matiz, escala la saturacion e
// invierte la luminosidad para los temas claros. Asi un solo set de parametros re-tiñe toda la web.
import { BASE_HEXES } from './baseColors';

export type ThemeMode = 'dark' | 'light';

export interface ThemeParams {
  /** Rotacion de matiz en grados respecto de la paleta base (-180..180). */
  hue: number;
  /** Multiplicador de saturacion (0 = grises, 1 = base, 1.6 = muy vivo). */
  sat: number;
  /** 'dark' conserva la luminosidad base; 'light' la invierte (fondo claro, texto oscuro). */
  mode: ThemeMode;
}

export interface PalettePreset extends ThemeParams {
  id: string;
  name: string;
  description: string;
}

export const PALETTE_PRESETS: PalettePreset[] = [
  { id: 'arena', name: 'Arena Dorada', description: 'Espresso cálido con acento arena (predeterminada).', hue: 0, sat: 1, mode: 'dark' },
  { id: 'medianoche', name: 'Océano Medianoche', description: 'Azul profundo con acento celeste.', hue: 185, sat: 0.95, mode: 'dark' },
  { id: 'bosque', name: 'Bosque Esmeralda', description: 'Verde musgo con acento salvia.', hue: 100, sat: 0.85, mode: 'dark' },
  { id: 'amatista', name: 'Amatista Nocturna', description: 'Violeta oscuro con acento lila.', hue: 245, sat: 0.9, mode: 'dark' },
  { id: 'borgona', name: 'Borgoña', description: 'Vino tinto con acento rosado.', hue: -28, sat: 1.1, mode: 'dark' },
  { id: 'coral', name: 'Atardecer Coral', description: 'Terracota vivo con acento coral.', hue: -14, sat: 1.3, mode: 'dark' },
  { id: 'grafito', name: 'Grafito', description: 'Escala de grises neutra, sin color.', hue: 0, sat: 0.06, mode: 'dark' },
  { id: 'papel', name: 'Papel Claro', description: 'Modo claro cálido, color papel.', hue: 0, sat: 0.9, mode: 'light' },
  { id: 'papel-azul', name: 'Papel Azulado', description: 'Modo claro con tonos fríos.', hue: 185, sat: 0.8, mode: 'light' },
];

export interface StoredTheme {
  presetId: string; // id de preset o 'custom'
  custom: ThemeParams;
}

export const DEFAULT_THEME: StoredTheme = {
  presetId: 'arena',
  custom: { hue: 0, sat: 1, mode: 'dark' },
};

const STORAGE_KEY = 'campus_unne_theme_v1';

// ---------------------------------------------------------------------------
// Conversion de color
// ---------------------------------------------------------------------------
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function hexToRgb(hex: string): [number, number, number] {
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0,
    g = 0,
    b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return [r, g, b].map((v) => Math.round(clamp(v + m, 0, 1) * 255)) as [number, number, number];
}

/** Transforma un color base (hex sin #) segun los parametros del tema. */
export function transformHex(hex: string, p: ThemeParams): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const newH = h + p.hue;
  const newS = clamp(s * p.sat, 0, 1);
  // Modo claro: invierte la luminosidad y la comprime a [0.05, 0.96] para conservar contraste legible.
  const newL = p.mode === 'light' ? clamp(0.04 + (1 - l) * 0.93, 0.04, 0.97) : l;
  return hslToRgb(newH, newS, newL);
}

export const toCss = (rgb: [number, number, number]) => `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

export function getParams(theme: StoredTheme): ThemeParams {
  if (theme.presetId === 'custom') return theme.custom;
  const preset = PALETTE_PRESETS.find((p) => p.id === theme.presetId);
  return preset ? { hue: preset.hue, sat: preset.sat, mode: preset.mode } : DEFAULT_THEME.custom;
}

// ---------------------------------------------------------------------------
// Aplicacion y persistencia
// ---------------------------------------------------------------------------
export function applyTheme(theme: StoredTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const p = getParams(theme);
  const isDefault = p.hue === 0 && p.sat === 1 && p.mode === 'dark';

  for (const hex of BASE_HEXES) {
    const prop = `--k-${hex}`;
    if (isDefault) {
      root.style.removeProperty(prop);
    } else {
      const [r, g, b] = transformHex(hex, p);
      root.style.setProperty(prop, `${r} ${g} ${b}`);
    }
  }
  root.style.colorScheme = p.mode;
  root.dataset.theme = theme.presetId;
  root.dataset.themeMode = p.mode;
}

export function loadTheme(): StoredTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_THEME;
    const parsed = JSON.parse(raw) as Partial<StoredTheme>;
    const c = parsed.custom;
    const custom: ThemeParams = {
      hue: clamp(Number(c?.hue ?? 0), -180, 180),
      sat: clamp(Number(c?.sat ?? 1), 0, 1.8),
      mode: c?.mode === 'light' ? 'light' : 'dark',
    };
    const known = parsed.presetId === 'custom' || PALETTE_PRESETS.some((x) => x.id === parsed.presetId);
    return { presetId: known ? String(parsed.presetId) : 'arena', custom };
  } catch {
    return DEFAULT_THEME;
  }
}

export function saveTheme(theme: StoredTheme): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch {
    /* almacenamiento no disponible: el tema solo dura la sesion */
  }
}
