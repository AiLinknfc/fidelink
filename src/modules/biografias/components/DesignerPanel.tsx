import React, { useState, useEffect } from 'react';
import { Biography, FontStyle, CardStyle } from '../types/biography';
import { Palette, Type, Layout, Image as ImageIcon, Check, Paintbrush, Rocket, Code } from 'lucide-react';

interface DesignerPanelProps {
  currentBio: Biography;
  onUpdateBio: (updated: Biography) => void;
  onPublish?: () => void;
  onJsonImport?: (bio: Biography) => void;
  buttonLabel?: string;
}

const THEME_COLORS = [
  { id: 'emerald', label: 'Esmeralda',      bg: 'bg-emerald-500', ring: 'ring-emerald-400', hex: '#10b981' },
  { id: 'rose',    label: 'Rosa',           bg: 'bg-rose-500',    ring: 'ring-rose-400',    hex: '#f43f5e' },
  { id: 'indigo',  label: 'Índigo',         bg: 'bg-indigo-500',  ring: 'ring-indigo-400',  hex: '#6366f1' },
  { id: 'violet',  label: 'Violeta',        bg: 'bg-violet-500',  ring: 'ring-violet-400',  hex: '#8b5cf6' },
  { id: 'amber',   label: 'Ámbar',          bg: 'bg-amber-500',   ring: 'ring-amber-400',   hex: '#f59e0b' },
  { id: 'slate',   label: 'Grafito',        bg: 'bg-slate-500',   ring: 'ring-slate-400',   hex: '#64748b' },
  { id: 'fuchsia', label: 'Fucsia',         bg: 'bg-fuchsia-500', ring: 'ring-fuchsia-400', hex: '#d946ef' },
  { id: 'blue',    label: 'Azul',           bg: 'bg-blue-500',    ring: 'ring-blue-400',    hex: '#3b82f6' },
  { id: 'orange',  label: 'Naranja',        bg: 'bg-orange-500',  ring: 'ring-orange-400',  hex: '#f97316' },
];

function getThemeHex(themeColor: string): string {
  if (themeColor.startsWith('#')) return themeColor;
  return THEME_COLORS.find(c => c.id === themeColor)?.hex || '#6366f1';
}

const FONTS_LIST: { id: FontStyle; label: string; preview: string; class: string }[] = [
  { id: 'sans',     label: 'Inter',     preview: 'La sencillez de la elegancia', class: 'font-sans' },
  { id: 'display',  label: 'Outfit',    preview: 'Innovación minimalista',       class: 'font-display font-medium' },
  { id: 'serif',    label: 'Playfair',  preview: 'Historia y alta costura',      class: 'font-serif italic' },
  { id: 'mono',     label: 'Space',     preview: 'Modular y geométrica',         class: 'font-mono font-medium' },
  { id: 'jakarta',  label: 'Jakarta',   preview: 'Sofisticación moderna',        class: 'font-jakarta font-medium' },
];

const CARD_STYLES: { id: CardStyle; label: string; swatches: string[] }[] = [
  { id: 'glass',     label: 'Glass',     swatches: ['#e2e8f0cc', '#ffffff88', '#94a3b888'] },
  { id: 'flat',      label: 'Flat',      swatches: ['#ffffff', '#f1f5f9', '#e2e8f0'] },
  { id: 'warm',      label: 'Cálido',    swatches: ['#fef3c7', '#fde68a', '#f59e0b'] },
  { id: 'neo',       label: 'Neo',       swatches: ['#1e293b', '#fbbf24', '#ffffff'] },
  { id: 'cyberpunk', label: 'Neon',      swatches: ['#1e293b', '#06b6d4', '#d946ef'] },
  { id: 'clinico',   label: 'Clínico',   swatches: ['#ffffff', '#e0f2fe', '#0ea5e9'] },
  { id: 'deportes',  label: 'Deportes',  swatches: ['#475569', '#22d3ee', '#eab308'] },
  { id: 'industrial',label: 'Industrial',swatches: ['#334155', '#f97316', '#f8fafc'] },
  { id: 'lujo',      label: 'Lujo',      swatches: ['#1c1917', '#d97706', '#faf5eb'] },
  { id: 'natural',   label: 'Natural',   swatches: ['#f0fdf4', '#86efac', '#166534'] },
];

const BACKGROUND_WALLPAPERS = [
  { id: 'gradient-emerald', label: 'Aura Esmeralda',      css: 'linear-gradient(135deg, #e0f2fe 0%, #d1fae5 50%, #fef3c7 100%)' },
  { id: 'gradient-rose',    label: 'Ocaso Rosa',          css: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 50%, #ffe4e6 100%)' },
  { id: 'gradient-stone', label: 'Gris Práctico',   css: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)' },
  { id: 'gradient-ocean',   label: 'Océano Profundo',     css: 'linear-gradient(135deg, #cffafe 0%, #a5f3fc 50%, #bae6fd 100%)' },
  { id: 'solid-slate',      label: 'Gris Cemento',        css: '#f1f5f9' },
  { id: 'solid-white',      label: 'Blanco Puro',         css: '#ffffff' },
];

function extractFirstHex(css: string): string {
  const m = css.match(/#([0-9a-fA-F]{6})/);
  return m ? `#${m[1]}` : '#6366f1';
}

export function DesignerPanel({ currentBio, onUpdateBio, onPublish, onJsonImport, buttonLabel = 'Guardar Bio' }: DesignerPanelProps) {
  const currentStyle = currentBio.style;
  const [accentHex, setAccentHex] = useState<string>(() => getThemeHex(currentStyle.themeColor));
  const [customColor, setCustomColor] = useState<string>(() => extractFirstHex(currentStyle.customWallpaper || '#f8fafc'));
  const [customGradientA, setCustomGradientA] = useState<string>('#6366f1');
  const [customGradientB, setCustomGradientB] = useState<string>('#ec4899');

  useEffect(() => {
    setAccentHex(getThemeHex(currentStyle.themeColor));
  }, [currentStyle.themeColor]);

  const updateStyleField = (field: keyof typeof currentStyle, value: any) => {
    onUpdateBio({
      ...currentBio,
      style: {
        ...currentStyle,
        [field]: value,
      }
    });
  };

  const setWallpaper = (css: string, isDark = false) => {
    onUpdateBio({
      ...currentBio,
      style: {
        ...currentStyle,
        customWallpaper: css,
        backgroundColor: isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50/50',
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <Palette className="w-5 h-5 text-indigo-600" />
        <h2 className="text-base font-semibold text-slate-800">Estilo y Personalización</h2>
      </div>

      {/* JSON Upload — inline at top of panel */}
      <div className="p-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-1.5">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Code className="w-3 h-3" />
          <span className="text-[7px] font-extrabold uppercase tracking-widest">Importar Plantilla JSON</span>
        </div>
        <p className="text-[9px] text-slate-400 leading-tight">
          Sube un archivo .json con la estructura de una biografía para importarla como nueva plantilla.
        </p>
        <label className="block">
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  const parsed = JSON.parse(ev.target?.result as string) as Biography;
                  if (!parsed.id || !parsed.slug || !parsed.templateType) {
                    alert('El JSON no tiene una estructura de biografía válida.');
                    return;
                  }
                  onJsonImport?.(parsed);
                } catch {
                  alert('Error al parsear el archivo JSON. Verifica el formato.');
                }
              };
              reader.readAsText(file);
            }}
          />
          <div className="py-1.5 px-3 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-center cursor-pointer transition-colors">
            <span className="text-[9px] font-bold text-indigo-600">Seleccionar archivo JSON</span>
          </div>
        </label>
      </div>

      {/* Theme Accent Color */}
      <div>
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5" /> Color de Acento
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={accentHex}
            onChange={(e) => {
              const hex = e.target.value;
              setAccentHex(hex);
              const preset = THEME_COLORS.find(c => c.hex === hex);
              if (preset) {
                updateStyleField('themeColor', preset.id);
              } else {
                updateStyleField('themeColor', hex);
              }
            }}
            className="w-11 h-11 rounded-full border-2 border-slate-200 cursor-pointer p-0.5 bg-white shrink-0"
            title="Personalizar color de acento"
          />
          <div className="flex gap-1.5 flex-wrap">
            {THEME_COLORS.map((col) => (
              <button
                key={col.id}
                onClick={() => {
                  setAccentHex(col.hex);
                  updateStyleField('themeColor', col.id);
                }}
                className={`w-5 h-5 rounded-full ${col.bg} transition-all hover:scale-125 active:scale-95 ${
                  (currentStyle.themeColor === col.id || accentHex === col.hex) ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : ''
                }`}
                title={col.label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Typography Picker */}
      <div>
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5" /> Tipografía Principal
        </label>
        <div className="flex flex-wrap gap-1">
          {FONTS_LIST.map((font) => (
            <button
              key={font.id}
              onClick={() => updateStyleField('fontStyle', font.id)}
              className={`px-2 py-1.5 rounded-lg border text-[10px] transition-all ${
                currentStyle.fontStyle === font.id
                  ? 'border-indigo-500 bg-indigo-50/80 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              } ${font.class}`}
              title={font.preview}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card Styles */}
      <div>
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Layout className="w-3.5 h-3.5" /> Estilos de Bloque / Tarjetas
        </label>
        <div className="grid grid-cols-5 gap-1">
          {CARD_STYLES.map((style) => {
            const selected = currentStyle.cardStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => updateStyleField('cardStyle', style.id)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${
                  selected
                    ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                title={style.label}
              >
                <div className="w-full h-6 rounded flex items-center justify-center gap-0.5 px-1" style={{ background: style.swatches[0] }}>
                  {style.swatches.slice(1).map((s, i) => (
                    <div key={i} className="w-2 h-2 rounded-sm" style={{ background: s }} />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[8px] font-bold text-slate-600 truncate">{style.label}</span>
                  {selected && <Check className="w-2 h-2 text-indigo-600 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Background */}
      <div>
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" /> Color / Tapiz de Fondo
        </label>
        <div className="space-y-3">
          {/* Presets grid */}
          <div className="grid grid-cols-2 gap-2">
            {BACKGROUND_WALLPAPERS.map((wall) => {
              const isSelected = currentStyle.customWallpaper === wall.css;
              const isDarkPreset = wall.id === 'gradient-dusk';
              return (
                <button
                  key={wall.id}
                  onClick={() => setWallpaper(wall.css, isDarkPreset)}
                  className={`text-left p-2 rounded-xl border text-[11px] font-medium transition-all flex items-center justify-between gap-1.5 ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <div
                      className="w-5 h-5 rounded-md border border-slate-200 flex-shrink-0"
                      style={{ background: wall.css }}
                    />
                    <span className="truncate text-slate-700 font-medium">{wall.label}</span>
                  </div>
                  {isSelected && <Check className="w-3 h-3 text-indigo-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Custom solid color picker */}
          <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <Paintbrush className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[10px] font-bold text-slate-700">Color sólido personalizado</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomColor(val);
                  setWallpaper(val, false);
                }}
                className="w-10 h-10 rounded-md border border-slate-200 cursor-pointer p-0.5 bg-white"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomColor(val);
                  if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                    setWallpaper(val, false);
                  }
                }}
                className="flex-1 text-xs font-mono p-2 border border-slate-200 rounded-md text-slate-700 bg-white"
              />
            </div>
          </div>

          {/* Custom gradient picker */}
          <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <Paintbrush className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[10px] font-bold text-slate-700">Gradiente personalizado</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customGradientA}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomGradientA(val);
                  setWallpaper(`linear-gradient(135deg, ${val} 0%, ${customGradientB} 100%)`, false);
                }}
                className="w-10 h-10 rounded-md border border-slate-200 cursor-pointer p-0.5 bg-white"
                title="Color inicial"
              />
              <div
                className="flex-1 h-10 rounded-md border border-slate-200"
                style={{ background: `linear-gradient(135deg, ${customGradientA} 0%, ${customGradientB} 100%)` }}
              />
              <input
                type="color"
                value={customGradientB}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomGradientB(val);
                  setWallpaper(`linear-gradient(135deg, ${customGradientA} 0%, ${val} 100%)`, false);
                }}
                className="w-10 h-10 rounded-md border border-slate-200 cursor-pointer p-0.5 bg-white"
                title="Color final"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="bg-grid-check"
              checked={currentStyle.bgGradient}
              onChange={(e) => updateStyleField('bgGradient', e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="bg-grid-check" className="text-xs text-slate-500 cursor-pointer">
              Efecto translúcido y gradiente degradado activo
            </label>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
        Como propietario, puedes alternar estos estilos en tiempo real. Todos los visitantes verán el diseño actualizado de inmediato.
      </div>

      {onPublish && (
        <button
          onClick={onPublish}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
        >
          <Rocket className="w-4 h-4" />
          {buttonLabel}
        </button>
      )}
    </div>
  );
}
