# Design Guidelines — Fidelicard Platform

> Versión: 1.0 | Actualizado: 2026-06-16

---

## Principios de diseño

1. **Dark-first** — El canvas base es oscuro (`fidelia-dark-canvas`). Las superficies usan capas de glassmorphism sobre el fondo.
2. **Mobile-first** — Diseño para pantallas de 375px, escala hacia arriba con breakpoint `md:` (768px).
3. **Motion con propósito** — Animaciones solo cuando refuerzan jerarquía o confirman una acción. Duración máxima 300ms para transiciones de UI.
4. **Color por módulo** — Cada módulo tiene un color semántico primario. No mezclar colores de módulos en la misma pantalla.

---

## Sistema de color

### Tokens CSS globales (`src/index.css`)

```css
--color-primary          /* Acción principal del módulo activo */
--color-on-primary
--color-primary-container
--color-on-primary-container
--color-secondary
--color-surface          /* Superficie de cards y paneles */
--color-surface-variant
--color-background       /* Fondo de página */
--color-error
--color-outline
```

### Colores por módulo

| Módulo | Color | Hex | Uso |
|--------|-------|-----|-----|
| fidelizacion | Violet | `#7c3aed` | Fidelik — tarjetas de lealtad |
| biografias | Indigo | `#6366f1` | BioLink — páginas de bio |
| ventas | Emerald | `#10b981` | LinkSales — e-commerce |
| admin | Violet | `#7c3aed` | Panel administrativo |
| promociones | Custom (rosa/amber) | — | Definido localmente |

**Regla:** nunca usar `text-violet-500` hardcodeado en un componente de módulo. Usar `brand.colorHex` del `ModuleBrandContext` para que el color sea dinámico.

---

## Tipografía

### Fuentes

| Uso | Fuente | Variable CSS |
|-----|--------|-------------|
| Cuerpo y UI | Inter | `font-sans` |
| Titulares | Outfit | `font-headline` |
| Código / mono | Space Grotesk | `font-mono` |
| Serif / editorial | Playfair Display | `font-serif` |

### Clases de texto

```
.text-headline-xl    /* Titulares grandes: hero sections */
.text-headline-lg    /* Titulares de página */
.text-headline-md    /* Titulares de card/panel */
.text-body-lg        /* Cuerpo prominente */
.text-body-md        /* Cuerpo estándar */
.text-body-sm        /* Cuerpo secundario */
.text-label-lg       /* Labels prominentes */
.text-label-md       /* Labels estándar */
.text-label-sm       /* Labels pequeños / captions */
```

---

## Componentes de superficie

### Glass Premium

Superficie principal para cards, panels y modales.

```tsx
// Panel claro (sobre fondos oscuros)
<div className="glass-premium rounded-2xl p-6">...</div>

// Panel oscuro (sobre fondos muy oscuros)
<div className="glass-premium-dark rounded-2xl p-6">...</div>
```

Implementación:
- `backdrop-filter: blur(20–24px)`
- `background: rgba(255,255,255, 0.04–0.08)`
- `border: 1px solid rgba(255,255,255,0.08–0.12)`

### Glow interactivo

Para cards y botones con hover destacado:

```tsx
<div className="glow-card">...</div>     /* Card con glow en hover */
<button className="glow-btn">...</button> /* Botón con glow en hover */
```

El glow usa `radial-gradient` centrado en la posición del cursor (implementado con JS en `CursorGlow`).

### Canvas de fondo

```tsx
<div className="fidelia-dark-canvas">
  {/* Blue radial gradient — solo usar en el nivel más alto (PlatformShell) */}
</div>
```

---

## Bordes y radios

| Contexto | Radio |
|----------|-------|
| Cards grandes / panels | `rounded-2xl` (16px) |
| Cards compactas / chips | `rounded-xl` (12px) |
| Inputs / selects | `rounded-lg` (8px) |
| Badges / pills | `rounded-full` |
| Botones primarios | `rounded-xl` |
| Botones de icono | `rounded-full` |

---

## Espaciado

- Base unit: 4px (Tailwind default)
- Padding de cards: `p-4` (móvil) → `p-6` (desktop)
- Gap entre cards en grid: `gap-4` → `gap-6`
- Secciones de página: `mb-6` → `mb-8`
- Máximo ancho de contenido: `max-w-7xl mx-auto`

---

## Animaciones

### Clases CSS disponibles

```
.animate-fade-in         /* Aparece: opacity 0→1, translateY 8px→0, 0.25s */
.animate-slide-in-left   /* Entra desde izquierda */
.animate-slide-in-right  /* Entra desde derecha */
.animate-shimmer         /* Efecto loading/skeleton (infinite) */
.animate-radar-pulse     /* Pulso tipo radar (infinite, para mapas/notifs) */
```

### Motion (Framer Motion v12)

Para animaciones complejas y orquestadas:

```tsx
import { motion } from 'motion/react';

// Entrada estándar de items en lista
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2, delay: index * 0.05 }}
>
```

**Reglas:**
- Duración máxima para UI feedback: `0.15s–0.25s`
- Duración para transiciones de página: `0.25s–0.3s`
- `delay` en listas: `index * 0.04s` máximo (evitar stagger largo)
- No animar propiedades que activen layout (evitar `width`, `height` en favor de `scale`, `opacity`, `transform`)

---

## Iconos

Usar exclusivamente **Lucide React**:

```tsx
import { CreditCard, Users, ShoppingCart } from 'lucide-react';

// Tamaños estándar
<Icon size={16} />   // Inline en texto / labels
<Icon size={20} />   // Botones y nav items (default)
<Icon size={24} />   // Titulares y acciones primarias
```

No usar emojis como iconos funcionales.

---

## Layout responsive

### Breakpoints

| Prefijo | Ancho mínimo | Uso típico |
|---------|-------------|-----------|
| (base) | 0px | Móvil (diseño primario) |
| `sm:` | 640px | Ajustes menores (ej: mostrar email en TopBar) |
| `md:` | 768px | Grid de 2 columnas, sidebar visible |
| `lg:` | 1024px | Grid de 3 columnas, contenido expandido |

### Grids de contenido

```tsx
// Cards de estadísticas
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

// Cards de contenido
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Layout de formulario
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

---

## Formularios e inputs

```tsx
// Input estándar
<input className="
  w-full px-4 py-2.5
  bg-surface-variant/50
  border border-outline/20
  rounded-lg
  text-body-md text-on-surface
  placeholder:text-on-surface/40
  focus:outline-none focus:border-primary/60
  transition-colors
" />

// Label
<label className="text-label-md text-on-surface/70 mb-1.5 block">
```

---

## Sidebar — estructura de navegación

Cada ítem de Sidebar usa `SidebarItem`:

```tsx
<SidebarItem
  icon={CreditCard}
  label="Tarjeta"
  path="/business/card-editor"
  badge={undefined}
/>
```

Estado activo: fondo `${brand.colorHex}15`, texto `brand.colorHex`.

---

## Convenciones de nomenclatura de componentes

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Páginas | `{Feature}Page` | `ClientListPage.tsx` |
| Dashboards | `{Feature}Dashboard` | `BiographyDashboard.tsx` |
| Componentes UI | `{Noun}{Descriptor?}` | `RealisticCard.tsx`, `SectionRibbon.tsx` |
| Contextos | `{Name}Context.tsx` + hook `use{Name}` | `AuthContext.tsx` / `useAuth()` |
| Servicios | `{domain}Service.ts` | `loyaltyService.ts` |
| Tipos de módulo | `modules/{id}/types/index.ts` | |

---

## Do / Don't

### Hacer

- Usar `useModuleBrand()` para obtener el color activo del módulo.
- Usar `ServiceResult<T>` como tipo de retorno en todos los servicios.
- Usar `clsx` + `tailwind-merge` (`cn()`) para classNames condicionales.
- Definir tipos en `modules/{id}/types/index.ts`, no inline en los componentes.
- Usar la flag `cancelled` en `useEffect` para evitar actualizaciones de estado en componentes desmontados.

### No hacer

- No hardcodear colores de módulo (`text-violet-500`). Usar `brand.colorHex`.
- No escribir lógica de negocio dentro de componentes de página. Moverla a servicios o hooks.
- No usar `any` en tipos TypeScript. Preferir `unknown` y hacer narrowing.
- No importar componentes de un módulo desde otro módulo. Los módulos son fronteras de dominio.
- No almacenar datos de usuario (tokens, sesiones) en `localStorage` directamente. Supabase maneja esto.
