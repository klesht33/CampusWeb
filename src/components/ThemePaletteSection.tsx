import React, { useMemo, useState } from 'react';
import { Palette, Check, RotateCcw, Sun, Moon, SlidersHorizontal } from 'lucide-react';
import {
  PALETTE_PRESETS,
  DEFAULT_THEME,
  StoredTheme,
  ThemeParams,
  applyTheme,
  getParams,
  loadTheme,
  saveTheme,
  toCss,
  transformHex,
} from '../theme/palettes';

// Colores base que se muestran en las muestras de cada paleta: fondo, superficie, borde, acento y texto.
const SWATCH_HEXES = ['0e0c0a', '171411', '2b241d', 'd6b892', 'f3ece2'];

const swatchesFor = (p: ThemeParams) => SWATCH_HEXES.map((h) => toCss(transformHex(h, p)));

export const ThemePaletteSection: React.FC = () => {
  const [theme, setTheme] = useState<StoredTheme>(() => loadTheme());

  const commit = (next: StoredTheme) => {
    setTheme(next);
    applyTheme(next);
    saveTheme(next);
  };

  const selectPreset = (id: string) => {
    const preset = PALETTE_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    // Al elegir un preset, el modo personalizado arranca desde sus valores.
    commit({ presetId: id, custom: { hue: preset.hue, sat: preset.sat, mode: preset.mode } });
  };

  const updateCustom = (patch: Partial<ThemeParams>) => {
    commit({ presetId: 'custom', custom: { ...getParams(theme), ...patch } });
  };

  const params = getParams(theme);
  const customSwatches = useMemo(() => swatchesFor(params), [params.hue, params.sat, params.mode]);

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-5 sm:px-8 py-6 space-y-6">
      <div className="campus-surface rounded-3xl p-6 sm:p-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-k-241f1a border border-k-d6b892/20 text-k-d6b892 text-xs font-medium">
          <Palette className="w-3.5 h-3.5" /> Apariencia
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl text-k-f3ece2 tracking-tight">
          Paleta de colores
        </h1>
        <p className="text-xs sm:text-sm text-k-9e9285 max-w-2xl">
          Elegí una paleta predefinida o armá la tuya. El cambio se aplica al instante en toda la
          plataforma y se guarda en este navegador.
        </p>
      </div>

      {/* Paletas predefinidas */}
      <div className="space-y-3">
        <h2 className="font-editorial text-xl text-k-f3ece2">Paletas predefinidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {PALETTE_PRESETS.map((preset) => {
            const active = theme.presetId === preset.id;
            const sw = swatchesFor(preset);
            return (
              <button
                key={preset.id}
                onClick={() => selectPreset(preset.id)}
                aria-pressed={active}
                className={`text-left rounded-2xl p-4 border transition space-y-3 ${
                  active
                    ? 'bg-k-2c241d border-k-d6b892'
                    : 'campus-surface hover:border-k-d6b892/25'
                }`}
              >
                {/* Mini vista previa con los colores reales de la paleta */}
                <div
                  className="rounded-xl p-3 flex items-center justify-between gap-3 border"
                  style={{ background: sw[0], borderColor: sw[2] }}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="h-2 w-16 rounded-full" style={{ background: sw[4] }} />
                    <div className="h-2 w-24 rounded-full opacity-60" style={{ background: sw[4] }} />
                    <div
                      className="h-5 w-14 rounded-full mt-2"
                      style={{ background: sw[3] }}
                    />
                  </div>
                  <div
                    className="w-16 h-12 rounded-lg border"
                    style={{ background: sw[1], borderColor: sw[2] }}
                  />
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-k-f3ece2">{preset.name}</div>
                    <div className="text-[11px] text-k-9e9285 leading-snug">
                      {preset.description}
                    </div>
                  </div>
                  {active && (
                    <span className="w-5 h-5 rounded-full bg-k-d6b892 text-k-14110e flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {sw.map((color, i) => (
                    <span
                      key={i}
                      className="w-5 h-5 rounded-full border border-white/10"
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Paleta personalizada */}
      <div
        className={`campus-surface rounded-3xl p-6 space-y-5 border ${
          theme.presetId === 'custom' ? 'border-k-d6b892/35' : 'border-transparent'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-k-d6b892" />
            <h2 className="font-editorial text-xl text-k-f3ece2">Paleta personalizada</h2>
            {theme.presetId === 'custom' && (
              <span className="px-2.5 py-0.5 rounded-full bg-k-d6b892 text-k-14110e text-[10px] font-semibold">
                En uso
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {customSwatches.map((color, i) => (
              <span
                key={i}
                className="w-6 h-6 rounded-full border border-white/10"
                style={{ background: color }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="space-y-2 block">
            <div className="flex items-center justify-between text-xs text-k-c8bcb0">
              <span>Matiz (tono base)</span>
              <span className="font-mono text-k-d6b892">
                {params.hue > 0 ? `+${Math.round(params.hue)}` : Math.round(params.hue)}°
              </span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={params.hue}
              onChange={(e) => updateCustom({ hue: Number(e.target.value) })}
              className="w-full accent-k-d6b892"
              aria-label="Matiz"
            />
            <div
              className="h-2 rounded-full"
              style={{
                background:
                  'linear-gradient(90deg,#b34a4a,#b3a24a,#5ab34a,#4ab3b0,#4a5fb3,#a24ab3,#b34a4a)',
              }}
            />
          </label>

          <label className="space-y-2 block">
            <div className="flex items-center justify-between text-xs text-k-c8bcb0">
              <span>Intensidad del color</span>
              <span className="font-mono text-k-d6b892">{Math.round(params.sat * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1.8}
              step={0.02}
              value={params.sat}
              onChange={(e) => updateCustom({ sat: Number(e.target.value) })}
              className="w-full accent-k-d6b892"
              aria-label="Intensidad del color"
            />
            <div className="flex justify-between text-[10px] text-k-9e9285">
              <span>Grises</span>
              <span>Vivo</span>
            </div>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs text-k-c8bcb0 mr-1">Modo:</span>
          <button
            onClick={() => updateCustom({ mode: 'dark' })}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition ${
              params.mode === 'dark'
                ? 'bg-k-2c241d border-k-d6b892 text-k-f3ece2'
                : 'bg-k-14110e border-k-2b241d text-k-9e9285 hover:text-k-f3ece2'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-k-d6b892" /> Oscuro
          </button>
          <button
            onClick={() => updateCustom({ mode: 'light' })}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition ${
              params.mode === 'light'
                ? 'bg-k-2c241d border-k-d6b892 text-k-f3ece2'
                : 'bg-k-14110e border-k-2b241d text-k-9e9285 hover:text-k-f3ece2'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-k-d6b892" /> Claro
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => commit(DEFAULT_THEME)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-k-1b1713 hover:bg-k-26211c border border-k-332b23 text-xs text-k-d8cfc4 transition"
        >
          <RotateCcw className="w-3.5 h-3.5 text-k-d6b892" /> Restaurar paleta original
        </button>
      </div>
    </main>
  );
};
