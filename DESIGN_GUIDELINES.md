# FideLink Hub — Guía de Diseño y Arquitectura

## Arquitectura por Capas

```
src/
├── platform/         ← Capa base compartida (auth, layout, theme)
│   ├── auth/         ← Guards (ModuleGuard, AdminGuard)
│   ├── layout/       ← PlatformShell (TopBar + Sidebar)
│   ├── theme/        ← ModuleBrand (nombres, logos, colores)
│   └── ui/           ← Componentes UI reutilizables
├── modules/          ← Capa de negocio (uno por módulo)
│   ├── fidelizacion/ ← Fidelik (violeta)
│   ├── biografias/   ← BioLink (índigo)
│   └── ventas/       ← LinkSales (esmeralda)
├── admin/            ← Panel global Ailink
├── components/       ← Componentes compartidos entre capas
├── context/          ← AuthContext multi-módulo
└── pages/            ← Páginas generales
```

## Marcas y Colores

| Módulo | App | Color | Hex | Uso |
|--------|-----|-------|-----|-----|
| Admin global | Ailink | Violeta | `#7c3aed` | Sidebar admin, badges admin |
| Fidelización | Fidelik | Violeta | `#7c3aed` | Sidebar, acentos, ribbons |
| Biografías | BioLink | Índigo | `#6366f1` | Sidebar, acentos, ribbons |
| Ventas | LinkSales | Esmeralda | `#10b981` | Sidebar, acentos, ribbons |

**Regla de color**: Los acentos de módulo se usan en:
- Títulos de `SectionRibbon`
- Estado activo del `Sidebar` (fondo 15% opacidad + texto color completo)
- Icono de menú hamburguesa en `TopBar`
- Borde/anillo del avatar
- Inputs en estado `:focus` (fondo y borde del color del módulo)

**Base de plataforma**: Fondo blanco/azul muy claro (`#f8fafc`), texto slate. Los acentos modales **nunca** deben saturar la interfaz.

## SectionRibbon (Subheader / Cinta de Sección)

Componente: `src/platform/ui/SectionRibbon.tsx`

Subheader compacto con padding interno estrecho (`py-2`) para minimizar altura.

```
┌──────────────────────────────────────────────────┐
│ [Icon] Título de Sección             [badge]     │
│         Descripción corta                        │
│   (bg-white/40 backdrop-blur border)             │
└──────────────────────────────────────────────────┘
```

Uso en cada página:
```tsx
import SectionRibbon from '@/platform/ui/SectionRibbon';
import { Activity } from 'lucide-react';

<SectionRibbon
  icon={Activity}
  title="Monitor de Analítica"
  description="Toma decisiones con lo que está pasando con tu programa"
  badge="LIVE"
/>
```

**Props**:
- `icon?: LucideIcon` — Icono de lucide-react
- `title: string` — Título de la sección (usa `brand.colorHex`)
- `description?: string` — Subtítulo informativo
- `badge?: string` — Badge opcional (ej: "MOTOR COMPARTIDO GLOBAL")

## Tipografía

Todas las clases están definidas en `src/index.css` como utilities de Tailwind v4.

| Clase | Uso | Tamaño | Peso | Color |
|-------|-----|--------|------|-------|
| `text-hero` | KPIs numéricos | `xl` | `bold font-mono` | `text-slate-700` |
| `text-hero-label` | Label de KPI | `[10px]` | `font-mono font-bold uppercase` | `text-slate-400` |
| `text-page-title` | Título de página | `xl` | `font-headline font-bold` | `text-slate-800` |
| `text-section-title` | Título de card/sección | `xs` | `font-mono font-bold uppercase tracking-wider` | `text-slate-800` |
| `text-body` | Cuerpo general | `sm` | `normal` | `text-slate-600` |
| `text-caption` | Subtítulos/ayuda | `[11px]` | `normal` | `text-slate-500` |
| `text-label` | Label de input | `[10.5px]` | `font-bold` | `text-slate-500` |
| `text-btn` | Botones | `xs` | `font-bold` | — |

**KPIs**: Usar `text-hero` + `text-hero-label`. NO usar `text-2xl`/`text-3xl` directamente.
**Títulos de card**: Usar `text-section-title`.

## Layout y Espaciado Estándar

Todas las páginas deben seguir este patrón:

```tsx
<div className="min-h-screen bg-slate-50 pb-32">
  <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
    <SectionRibbon ... />
    {/* contenido */}
  </main>
</div>
```

**Grid entre cards**: `gap-4` (mobile) o `gap-6` (desktop).

**Cards estándar**:
```html
<div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
```

**Botones estándar**:
- Primario: `bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700`
- Secundario: `bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-200`

## Sidebar

Un **único sidebar** (`Sidebar.tsx`) para todos los módulos y roles. El admin global usa el mismo sidebar, que muestra secciones adicionales (Admin Global, Acceso a Módulos) cuando el usuario es admin.

El estado activo usa el color dinámico del módulo:
```tsx
style={isActive ? { backgroundColor: `${brand.colorHex}15`, color: brand.colorHex } : undefined}
```

## Inputs

Focus ring y borde usan el color del módulo activo:
```tsx
<input className="focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]" />
```

## Moneda

**Todas las monedas en COP**. Formato:
```
$ {valor.toLocaleString('es-CO')} COP
```

## Cómo Agregar un Nuevo Módulo

1. **Crear carpeta** `src/modules/<nombre>/` con `pages/`, `components/`, `types/`, `data/`
2. **Agregar brand** en `src/platform/theme/ModuleBrand.tsx`:
   ```ts
   <nombre>: { name: '<AppName>', logo: '<L>', color: '<color>', colorHex: '<hex>' }
   ```
3. **Agregar tipo** al union `ModuleId` en el mismo archivo
4. **Agregar ruta** en `src/App.tsx` envuelta en `ModuleGuard module="<nombre>"`
5. **Agregar sección** en `src/components/layout/Sidebar.tsx`
6. **Agregar al admin** en `src/admin/AdminDashboard.tsx` y sección "Acceso a Módulos" del `Sidebar.tsx`
7. **Crear páginas** siguiendo el layout estándar con `SectionRibbon`

## Prohibiciones

- **No usar emojis** en ningún componente, página o documento del proyecto. Todo el contenido textual debe ser texto plano, iconos de Lucide o etiquetas semánticas.
- **No usar estilos inline** (`style={{}}`) para valores que puedan definirse con clases Tailwind. La excepción son colores dinámicos del módulo activo (`brand.colorHex`).

## Glass Effects (mantener)

Los efectos actuales que **no deben romperse**:
- `.ambient-glow-cursor` — Luz que sigue al mouse (en PlatformShell)
- `.glow-card` — Borde brillante en hover
- `.glow-btn` — Resplandor radial en botones
- `.glass-premium` — Fondo blur para paneles
- `.shine-sweep` — Barrido diagonal en hover
