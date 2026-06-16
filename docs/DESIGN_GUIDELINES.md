# Design Guidelines — Fidelicard Platform

> Versión: 1.7 | Actualizado: 2026-06-16

---

## Cursor glow ambiental

El `PlatformShell` monta un elemento `#ambient-glow-cursor` que sigue al cursor con un gradiente radial difuso. Este efecto es visible únicamente cuando el fondo de la vista es transparente — cualquier `background-color` sólido en el div raíz de la vista lo tapa completamente.

### Regla

El div raíz de cada vista autenticada **no debe tener color de fondo**. El fondo lo provee `fidelia-dark-canvas` del shell.

```tsx
// ✅ Correcto — el glow del cursor es visible en los espacios entre cards
<div className="min-h-screen pb-32">
  ...
</div>

// ❌ Incorrecto — el bg sólido tapa el glow
<div className="min-h-screen bg-slate-50 pb-32">
  ...
</div>
```

El fondo `bg-slate-50` / `bg-white` debe aplicarse **solo en el interior** de cards, tablas y paneles — nunca en el wrapper de página.

### Vistas con layout propio (sin PlatformShell TopBar)

Algunos módulos como Ventas tienen su propio `<header>` en `VentasPage.tsx` y no usan el TopBar del shell. En esas vistas el div raíz sigue siendo el que puede bloquear el glow — se aplica la misma regla:

```tsx
// ✅ VentasPage.tsx — sin bg en el div raíz
<div className="flex flex-col h-full overflow-hidden text-slate-900 font-sans relative">

// ❌ Con bg bloquea el glow en el área entre cards
<div className="flex flex-col h-full overflow-hidden bg-slate-50 ...">
```

### Implementado en

Todas las vistas de business (`/business/*`), admin (`/admin`, `/admin/clients`, `/admin/modules`) y ventas (`/sales/analytics`, `VentasPage`).

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

### Familias tipográficas — sistema fijo de 4

El sistema usa **exactamente 4 familias**. No agregar más sin decisión explícita. Todas cargadas desde Google Fonts.

| # | Fuente | Clase Tailwind | Rol principal |
|---|--------|----------------|---------------|
| 1 | **Inter** | `font-sans` | Cuerpo, UI general, párrafos, helpers de formulario |
| 2 | **Plus Jakarta Sans** | `font-jakarta` | Cabeceras de tabla, chips de barra secundaria, labels técnicos, footer status bars |
| 3 | **Outfit** | `font-headline` / `font-display` | Titulares de página, subtítulos de panel (`h2`, `h3` dentro de cards) |
| 4 | **Space Grotesk** | `font-mono` | **Exclusivo para strings técnicos**: hashes, llaves públicas, IDs de sesión, output de consola |

**Playfair Display** (`font-serif`) se mantiene únicamente en módulos con contenido editorial del usuario (Biografías, Promociones) — no está disponible para vistas de la plataforma.

#### Sistema tipográfico estandarizado — 3 fuentes, 5 niveles

| Nivel | Fuente | Clase | Tamaño | Peso | Rol en la UI |
|-------|--------|-------|--------|------|--------------|
| Subtítulo de panel | Outfit | `font-headline` + `.text-section-heading` | 14px | 700 | `h3` dentro de cards y formularios (`Creador de reglas`, `Registrar Cliente`) |
| Dato primario / chip | Inter | `font-sans` | 12px | 600–700 | Nombres, chip de barra secundaria, títulos de fila |
| Cabecera de tabla | Plus Jakarta Sans | `font-jakarta` | 12px | 700 uppercase | `CLIENTE`, `PUNTOS`, `MÓDULO` — diferencia header del dato |
| Dato secundario | Inter | `font-sans` | 11px | 400–500 | Email, fecha, descripción de campo, estado del sistema |
| Label técnico | Plus Jakarta Sans | `font-jakarta` | 10px | 700 uppercase | `SI OCURRE:`, `ACCIÓN:`, labels de KPI de segmento |

`.text-section-heading` = `text-[14px] font-bold font-headline leading-[1.3]` (definido en `src/index.css`)  
`.text-tech-label` = `text-[10px] font-bold font-jakarta uppercase tracking-wider leading-none` (definido en `src/index.css`)

#### Reglas de tipografía base

- **Chip de barra secundaria** (título + descripción): `font-sans` (Inter) a **12px**. Inter a este tamaño es más neutral y no compite con las cabeceras de tabla.
- **Cabeceras de tabla**: `font-jakarta` a **12px bold uppercase + tracking-wider**. Su forma geométrica diferencia el header del dato.
- **Subtítulos de panel** (`h3` dentro de cards, encabezados de formulario): `.text-section-heading` — Outfit 14px. El único tamaño que supera 12px en la zona autenticada.
- **Labels técnicos** (`SI OCURRE:`, `ACCIÓN:`, KPIs de tarjetas de segmento): `.text-tech-label` — Jakarta 10px.
- **`font-mono`** (Space Grotesk) queda reservado **exclusivamente** para bloques de código, logs de consola y output de webhooks. No usar en labels de formulario ni cabeceras.
- Nunca mezclar más de 2 familias tipográficas en la misma vista autenticada (Inter + Jakarta, o Inter + Outfit).

---

### Tokens tipográficos

El sistema tiene tres capas: **titulares**, **cuerpo**, y **UI chrome** (la zona 10–14px donde vive toda la interfaz de barra secundaria, tablas, chips y datos).

#### Titulares

| Token | Tamaño | Peso | Uso |
|-------|--------|------|-----|
| `.text-headline-lg` | 32px | 700 | Hero sections, páginas de marketing |
| `.text-headline-md` | 24px | 600 | Título principal de sección |
| `.text-headline-sm` | 20px | 600 | Subtítulo de panel o card grande |

#### Cuerpo

| Token | Tamaño | Peso | Uso |
|-------|--------|------|-----|
| `.text-body-lg` | 18px | 400 | Párrafo destacado |
| `.text-body-md` | 16px | 400 | Cuerpo estándar de página |
| `.text-body-sm` | 14px | 400 | Descripción secundaria, ayudas |

#### UI / Datos — zona 10–12px

Esta es la escala activa en toda la interfaz autenticada. Todos los tamaños viven entre 10 y 12px. Cada token tiene un rol semántico preciso.

| Token | Tamaño | Peso | Rol | Ejemplo de uso |
|-------|--------|------|-----|----------------|
| `.text-data-primary` | 12px | 600 | Dato principal de una fila o card | Nombre del cliente |
| `.text-data-number` | 12px | 700 | Valor numérico destacado (`tabular-nums`) | Contadores, totales, puntos |
| `.text-data-secondary` | 11px | 400 | Dato secundario o metadato | Email, fecha, módulo |
| `.text-chip` | 11px | 700 | Etiqueta de chip (barra secundaria, filtros activos) | "Tarjetahabientes activos", "Todos" |
| `.text-chip-sub` | 11px | 500 | Texto revelado en hover del chip expandible | `· Descripción de la vista` |
| `.text-status` | 11px | 600 | Indicador de estado RIGHT de barra secundaria | "42 clientes", "3 módulos activos" |
| `.text-avatar` | 11px | 700 | Iniciales en avatar circular | "CM", "LG" |
| `.text-col-header` | 10px | 700 | Cabecera de columna de tabla (`uppercase tracking-wider`) | "CLIENTE", "MÓDULO", "INGRESO" |

> **Escala**: 10px → 11px → 12px. No usar tamaños intermedios ni mayores en esta zona de la UI.

#### Uso en código

```tsx
// Fila de tabla
<p className="text-data-primary text-slate-800">{client.name}</p>
<p className="text-data-secondary text-slate-400">{client.email}</p>

// Chip de barra secundaria
<span className="text-chip">Tarjetahabientes activos</span>
<span className="text-chip-sub" style={{ color: `${brand.colorHex}99` }}>
  · Descripción de la vista
</span>

// Cabecera de tabla
<span className="text-col-header text-slate-500 font-mono">Cliente</span>

// Valor numérico
<span className="text-data-number" style={{ color: brand.colorHex }}>42</span>

// Estado RIGHT
<span className="text-status text-slate-600">42 clientes</span>
```

#### Reglas

- Nunca usar tamaños arbitrarios `text-[10px]`, `text-[11px]`, `text-[12px]` directamente en componentes — usar el token semántico correspondiente.
- `text-data-number` incluye `tabular-nums` para que los dígitos no se muevan al cambiar valor.
- `text-col-header` siempre va con `font-jakarta` para reforzar el carácter de cabecera de datos.
- El color **nunca forma parte del token** — se aplica por separado con clase de color o `style`. El token define solo tamaño, peso y espaciado.

---

## Tablas de datos

### Cabeceras de columna

```tsx
<div className="grid grid-cols-N gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
  {/* Columna de identidad (nombre, cliente) — siempre a la IZQUIERDA */}
  <span className="col-span-2 text-[12px] font-bold text-slate-500 uppercase tracking-wider font-jakarta text-left">
    Cliente
  </span>
  {/* Resto de columnas — CENTRADAS */}
  <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider font-jakarta text-center">
    Correo
  </span>
</div>
```

### Reglas de alineación

| Columna | Alineación cabecera | Alineación celda | Razón |
|---------|---------------------|------------------|-------|
| Identidad (nombre + avatar) | `text-left` | `justify-start` | El ojo escanea identidades de izquierda a derecha |
| Texto secundario (email, descripción) | `text-center` | `justify-center` | Dato complementario, no de escaneo primario |
| Módulo / categoría | `text-center` | `justify-center` | Valor discreto, no de comparación |
| Numérico (tarjetas, puntos) | `text-center` | `justify-center` | Valores cortos, comparación visual entre filas |
| Fecha / estado | `text-center` | `justify-center` | Dato de referencia, no accionable |

### Proporciones de columna — sistema `grid-cols-12`

Usar `grid-cols-12` en lugar de `grid-cols-N` fijo permite asignar proporciones exactas a cada columna según el tipo de dato que contiene:

| Columna | `col-span` | Razón |
|---------|-----------|-------|
| Identidad (avatar + nombre) | `col-span-4` | Dato primario de escaneo; necesita el mayor ancho |
| Texto largo (email, descripción) | `col-span-3` | Segundo dato más ancho; truncar con `truncate` si desborda |
| Categoría/módulo (texto + ícono) | `col-span-2` | Texto corto capitalizado; `truncate` por seguridad |
| Numérico corto (tarjetas, puntos) | `col-span-1` | Solo 1–3 dígitos; centrar |
| Fecha / estado secundario | `col-span-2` | Formato `YYYY-MM-DD`; centrar con `tabular-nums` |

```tsx
{/* Cabecera */}
<div className="grid grid-cols-12 gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
  <span className="col-span-4 text-[12px] font-bold font-jakarta uppercase tracking-wider text-left">Cliente</span>
  <span className="col-span-3 text-[12px] font-bold font-jakarta uppercase tracking-wider text-left">Correo</span>
  <span className="col-span-2 text-[12px] font-bold font-jakarta uppercase tracking-wider text-left">Módulo</span>
  <span className="col-span-1 text-[12px] font-bold font-jakarta uppercase tracking-wider text-center">Cards</span>
  <span className="col-span-2 text-[12px] font-bold font-jakarta uppercase tracking-wider text-center">Ingreso</span>
</div>

{/* Fila */}
<div className="grid grid-cols-12 gap-3 px-4 py-3 ...">
  <div className="col-span-4 flex items-center gap-3">...</div>   {/* avatar + nombre */}
  <div className="col-span-3"><span className="truncate block">email</span></div>
  <div className="col-span-2 flex items-center gap-1.5">...</div> {/* ícono + texto */}
  <div className="col-span-1 flex justify-center">número</div>
  <div className="col-span-2 flex justify-center tabular-nums">fecha</div>
</div>
```

### Reglas de estilo

- Cabeceras: `font-jakarta` 12px bold uppercase + `tracking-wider`. **Nunca** `font-mono` en tablas de datos de usuario.
- La columna de identidad ocupa `col-span-4` (avatar 32px + gap + nombre) — suficiente para nombres de 2 palabras sin truncar en desktop.
- Email y textos largos: `truncate block` para que el overflow no rompa el grid.
- Columnas numéricas cortas: `col-span-1` + `tabular-nums` + `text-center`.
- El hover de fila (variante B) aplica `borderLeft` de acento sobre toda la fila, el énfasis visual queda sobre la columna de identidad por estar primera.

### Responsive

En mobile la tabla puede colapsar mostrando solo la columna de identidad y 1–2 columnas clave. Usar `hidden sm:block` en columnas secundarias (correo, módulo) cuando el espacio no alcance. El contador de filas en la barra secundaria debe tener `whitespace-nowrap` para que `5 clientes` nunca se parta en dos líneas.

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
- Padding de cards: `p-5` (estándar) → `p-6` (cards grandes / formularios)
- Gap entre cards en grid horizontal: `gap-4` (grids densos) → `gap-6` (grids de contenido) → `gap-8` (editor a dos columnas)
- Separación vertical entre secciones (`space-y-`): `space-y-4` (listas compactas) → `space-y-6` (secciones de módulo estándar)
- Padding interior del `<main>` de cada vista: `px-4 md:px-6 pt-4 pb-6` (estándar) → `px-4 md:px-8 pt-4 pb-8` (editor de tarjeta, layout a dos columnas)
- Máximo ancho de contenido: sin `max-w` — el layout usa el ancho completo del contenedor del shell

### Alturas estándar de las barras

Toda vista autenticada tiene exactamente dos barras apiladas con altura fija:

| Barra | Componente | Altura | Clase |
|-------|-----------|--------|-------|
| TopBar global | `TopBar.tsx` | 56px | `h-14` |
| Barra secundaria | cada vista | 40px | `h-10` |

La barra secundaria **siempre** usa `h-10` — nunca `py-2` ni `py-3` libres. La altura fija garantiza que el espaciado superior del contenido sea idéntico en todas las vistas.

### Layout de página — estructura obligatoria

```tsx
// ✅ Correcto
<div className="h-full flex flex-col overflow-hidden">

  <div className="bg-[#f8fafc] border-b border-slate-200 px-4 sm:px-6 h-10
                  flex flex-row items-center justify-between gap-2
                  select-none overflow-hidden flex-shrink-0">
    {/* chip izquierdo + acciones derecha */}
  </div>

  <main className="flex-1 overflow-y-auto px-4 md:px-6 pt-3 pb-6 space-y-4">
    {/* cards, tablas, formularios */}
  </main>

</div>

// ❌ Incorrecto
<div className="min-h-screen pb-32">
  <div className="bg-[#f8fafc] ... py-2">barra</div>   {/* altura variable */}
  <main className="w-full px-4 pt-4 ...">              {/* pt-4 excesivo */}
```

**Reglas fijas — no variar:**
- Div raíz: `h-full flex flex-col overflow-hidden` — nunca `min-h-screen`
- Barra secundaria: `h-10 flex-shrink-0` — nunca `py-2` libre
- `<main>`: `flex-1 overflow-y-auto` + `pt-3` (no `pt-4`) — el `pt-3` junto con `h-10` da el mismo espacio visual que `/admin`
- Separación entre secciones: `space-y-4` en el `<main>` — nunca `space-y-6` entre bloques de primer nivel

### Espaciado entre cards

La referencia de espaciado correcto es `/admin` (`AdminDashboard`). El espaciado incorrecto (excesivo) era `/sales/analytics` antes de la corrección en v1.5.

**Regla general: el espaciado entre cards dentro de una vista autenticada es compacto, nunca generoso.**

| Contexto | Clase | Referencia visual |
|----------|-------|-------------------|
| Grid de cards KPI / stat (mismo nivel) | `gap-3` | `/admin` — 3 stat cards en fila |
| Grid de charts / panels en fila | `gap-3` | `/sales/analytics` — funnel + pie chart |
| Secciones entre bloques distintos (KPIs → charts → tabla) | `space-y-4` | `/admin`, `/sales/analytics` |
| Items de lista dentro de un card (reglas, filas) | `space-y-3` | `/business/automatizaciones` |
| Grid de editor complejo a dos columnas | `gap-6` | `/business/card-editor` |

```tsx
// ✅ Correcto — espaciado compacto, referencia AdminDashboard
<div className="space-y-4">                          {/* entre bloques de sección */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">  {/* entre cards KPI */}
    <StatCard />
    <StatCard />
    <StatCard />
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">  {/* entre charts */}
    <FunnelChart />   {/* lg:col-span-2 */}
    <PieChart />
  </div>
  <TableCard />
</div>

// ❌ Incorrecto — gap-6 / space-y-6 entre cards del mismo nivel
<div className="space-y-6">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
```

### Padding interno de cards (`p-`)

| Card | Padding |
|------|---------|
| Card KPI / stat compacta | `p-4` |
| Card de sección / panel estándar | `p-5` |
| Card de formulario / editor | `p-6` |

### Implementado en

`/business/card-editor`, `/business/crm`, `/business/clients`, `/business/payment`, `/business/automatizaciones`, `/business/audiencia-crm`, `/sales/analytics`, `/sales/campaigns`, `/sales/crm`, `/sales/products`

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

## Barra secundaria de módulo

Cada vista autenticada tiene dos niveles de cabecera:

1. **TopBar** (global, siempre presente)
2. **Barra secundaria** (por vista, inmediatamente debajo del TopBar)

### Estructura

```tsx
<div className="bg-[#f8fafc] border-b border-slate-200 px-4 sm:px-6 py-2
                flex flex-col sm:flex-row sm:items-center sm:justify-between
                gap-2 select-none">

  {/* IZQUIERDA — contexto/título de la vista */}
  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                  border border-slate-200/60 bg-white"
       style={{ color: brand.colorHex }}>
    <IconoDeLaVista className="w-3.5 h-3.5" />
    <span className="text-[11px] font-bold">Nombre de la vista</span>
  </div>

  {/* DERECHA — estado del sistema + acciones */}
  <div className="flex items-center gap-2">
    {/* Indicador de estado */}
    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60
                    px-3 py-1.5 rounded-full">
      <div className="w-2 h-2 rounded-full animate-pulse"
           style={{ backgroundColor: brand.colorHex }} />
      <span className="text-[11px] font-semibold text-slate-600">X elementos</span>
    </div>
    {/* Acciones opcionales: búsqueda, filtros, modos de pantalla */}
    <div className="relative w-full sm:w-56">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5
                         text-slate-400 pointer-events-none" />
      <input className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200
                        rounded-lg text-[12px] focus:outline-none focus:border-slate-400
                        text-slate-800 placeholder:text-slate-400" />
    </div>
  </div>
</div>
```

### Regla de posicionamiento

| Zona | Contenido | Estilo |
|------|-----------|--------|
| **Izquierda** | Chip con icono + nombre de la vista. Siempre primero. | `bg-white border border-slate-200/60 rounded-full`, texto en `brand.colorHex` |
| **Derecha** | Estado del sistema (punto animado + contador) seguido de acciones (búsqueda, filtros, botones de modo) | Indicador en `bg-slate-50`, acciones en `bg-white` |

### Reglas de uso

- El chip izquierdo **siempre va primero** — es la identidad de la vista.
- El estado del sistema (punto animado) va a la **derecha**, seguido de las acciones.
- Las acciones (búsqueda, filtros, modos) se agrupan en el lado derecho, **nunca a la izquierda**.
- El layout de la barra es **siempre `flex-row`** — nunca `flex-col` ni `sm:flex-row`. En mobile el chip colapsa a su tamaño mínimo (`flex: 0 0 auto`) y el lado derecho tiene `flex-shrink-0` para no comprimirse.
- El contador de estado (`5 clientes`) debe tener `whitespace-nowrap` y `flex-shrink-0` para que el número nunca se parta de su etiqueta.
- El input de búsqueda usa `w-44` en mobile y `sm:w-56` en desktop — nunca `w-full` en la barra secundaria (rompe el layout horizontal).
- El punto animado usa `animate-pulse` con `brand.colorHex` como color — nunca hardcodeado.
- Todas las vistas de módulo deben tener esta barra; el contenido varía pero la estructura es fija.

### Vistas con la barra secundaria integrada en su propio layout

Algunas vistas como `VentasPage` tienen su propio `<header>` de módulo en lugar del `PlatformShell` TopBar. En esas vistas, la barra secundaria debe vivir en la **página hija** (el `<Outlet>` que se renderiza), no en el layout padre.

```tsx
// ✅ VentasAnalyticsPage.tsx — la barra secundaria va dentro de la página hija
export default function VentasAnalyticsPage() {
  const [chipHovered, setChipHovered] = useState(false);
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Barra secundaria */}
      <div className="bg-[#f8fafc] border-b border-slate-200 px-4 sm:px-6 py-2
                      flex flex-row items-center justify-between
                      gap-2 select-none overflow-hidden flex-shrink-0">
        {/* chip izquierdo + contador derecho */}
      </div>
      {/* Contenido scrollable */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <AnalyticsTab ... />
      </main>
    </div>
  );
}
```

El título del chip es el nombre descriptivo de la vista (`"Inteligencia de Ventas"`), y la descripción revelada al hover explica su contenido (`"· ROI, embudos, canales y transacciones en tiempo real"`).

### Implementado en

`/business/card-editor`, `/business/crm`, `/business/clients`, `/business/automatizaciones`, `/business/audiencia-crm`, `/business/payment`, `/admin`, `/sales/analytics`

---

## Chip de título expandible (hover reveal)

Variante del chip izquierdo de la barra secundaria. Al hacer hover el chip se expande horizontalmente y revela la descripción de la vista con una animación suave.

### Cuándo usarlo

Cuando la vista tiene una descripción corta (≤ 80 caracteres) que aporta contexto al usuario pero no merece un card permanente. Reemplaza por completo al `SectionRibbon` en esas vistas.

### Estructura

```tsx
const [chipHovered, setChipHovered] = useState(false);

<div
  className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white cursor-default transition-all duration-500 ease-in-out min-w-0"
  style={{
    color: brand.colorHex,
    borderColor: chipHovered ? `${brand.colorHex}55` : 'rgb(226 232 240 / 0.6)',
    boxShadow: chipHovered
      ? `0 0 0 3px ${brand.colorHex}18, 0 2px 12px ${brand.colorHex}22`
      : '0 0 0 0px transparent',
    flex: chipHovered ? '1 1 0%' : '0 0 auto',   // ocupa el espacio disponible en hover
  }}
  onMouseEnter={() => setChipHovered(true)}
  onMouseLeave={() => setChipHovered(false)}
>
  {/* Glow sweep de fondo */}
  <div
    className="absolute inset-0 pointer-events-none rounded-full transition-opacity duration-500"
    style={{
      opacity: chipHovered ? 1 : 0,
      background: `linear-gradient(90deg, ${brand.colorHex}06 0%, ${brand.colorHex}14 50%, ${brand.colorHex}06 100%)`,
    }}
  />

  <IconoDeLaVista
    className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300"
    style={{ transform: chipHovered ? 'rotate(-15deg) scale(1.2)' : 'none' }}
  />
  <span className="text-[11px] font-bold whitespace-nowrap flex-shrink-0">Nombre de la vista</span>

  {/* Descripción revelada */}
  <span
    className="text-[11px] whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out"
    style={{
      maxWidth: chipHovered ? '600px' : '0px',
      opacity: chipHovered ? 1 : 0,
      paddingLeft: chipHovered ? '6px' : '0px',
      color: `${brand.colorHex}99`,
      fontWeight: 500,
    }}
  >
    · Descripción breve de la vista
  </span>
</div>
```

### Anatomía del efecto

| Propiedad | Reposo | Hover |
|-----------|--------|-------|
| `flex` | `0 0 auto` (tamaño mínimo) | `1 1 0%` (ocupa espacio disponible) |
| `borderColor` | `slate-200/60` | `brand.colorHex` al 33% |
| `boxShadow` | ninguno | ring + sombra difusa en color de módulo |
| Icono | estático | `rotate(-15deg) scale(1.2)` |
| Descripción `maxWidth` | `0px` | `600px` |
| Descripción `opacity` | `0` | `1` |
| Glow sweep | `opacity: 0` | `opacity: 1` |

### Reglas

- La transición usa siempre `duration-500 ease-in-out` para que la expansión se sienta orgánica.
- `maxWidth: '600px'` en hover garantiza que descripciones de hasta ~80 chars entren sin corte; aumentar si el texto es más largo.
- El separador es `·` (punto mediano), no guion — visualmente más limpio en tamaño 11px.
- El chip derecho (estado del sistema) **no crece** — el espacio lo absorbe el chip izquierdo.
- En mobile no hay hover; el chip permanece en su estado colapsado (comportamiento correcto por defecto).

### Implementado en

Todas las vistas de business: `/business/automatizaciones`, `/business/card-editor`, `/business/crm`, `/business/clients`, `/business/audiencia-crm`, `/business/payment`

---

## Hover de ítem con glow (item hover glow)

Efecto aplicado sobre cards, filas de tabla y botones de selección que forman listas o grids. Al hacer hover el ítem revela su pertenencia al módulo activo mediante borde, ring y glow de fondo en `brand.colorHex`.

### Variantes

#### A — Card / grid item

Para grids de tarjetas (`motion.div`, `div` con `rounded-xl` / `rounded-2xl`):

```tsx
const [hoveredCard, setHoveredCard] = useState<string | null>(null);

// En el ítem:
const isHovered = hoveredCard === item.id;

<div
  className="relative ... rounded-2xl border transition-all duration-300 ease-in-out overflow-hidden"
  style={{
    backgroundColor: isHovered ? `${brand.colorHex}05` : 'transparent',
    borderColor:     isHovered ? `${brand.colorHex}44` : 'transparent',
    boxShadow: isHovered
      ? `0 0 0 3px ${brand.colorHex}12, 0 6px 20px ${brand.colorHex}16`
      : '0 0 0 0px transparent',
  }}
  onMouseEnter={() => setHoveredCard(item.id)}
  onMouseLeave={() => setHoveredCard(null)}
>
  {/* Glow sweep de fondo */}
  <div
    className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-500"
    style={{
      opacity: isHovered ? 1 : 0,
      background: `linear-gradient(135deg, ${brand.colorHex}04 0%, ${brand.colorHex}10 50%, ${brand.colorHex}04 100%)`,
    }}
  />
  {/* Contenido relativo al glow */}
  <div className="relative ...">...</div>
</div>
```

#### B — Fila de tabla (div row)

Usar `div` con `grid` en lugar de `<table><tr>` para mantener compatibilidad con `borderLeft` inline:

```tsx
const [hoveredRow, setHoveredRow] = useState<string | null>(null);

<div
  className="grid grid-cols-12 gap-3 px-3 py-3 items-center cursor-default"
  style={{
    backgroundColor: isHovered ? `${brand.colorHex}06` : 'transparent',
    borderLeft: isHovered ? `3px solid ${brand.colorHex}` : '3px solid transparent',
    transition: 'background-color 0.25s ease, border-left-color 0.25s ease',
  }}
  onMouseEnter={() => setHoveredRow(row.id)}
  onMouseLeave={() => setHoveredRow(null)}
>
```

> **Nota:** `box-shadow inset` con `transparent` en la transición es inestable en Chromium — el valor inicial debe ser `inset 3px 0 0 transparent` explícito o, mejor, usar `borderLeft` con `transition` explícita sobre las propiedades cambiadas. La variante B usa siempre `borderLeft`.

#### C — Botón de selección activa (sin hover — estado)

Para selectores de modo / canal donde el ítem tiene estado activo permanente (no hover):

```tsx
<button
  style={{
    borderColor:     isActive ? brand.colorHex       : 'rgb(226 232 240)',
    backgroundColor: isActive ? `${brand.colorHex}10` : '#ffffff',
    boxShadow: isActive
      ? `0 0 0 3px ${brand.colorHex}18, 0 2px 8px ${brand.colorHex}20`
      : 'none',
    color: isActive ? brand.colorHex : '#64748b',
  }}
>
  {/* Glow sweep interno */}
  <div style={{
    opacity: isActive ? 1 : 0,
    background: `linear-gradient(135deg, ${brand.colorHex}04 0%, ${brand.colorHex}14 50%, ${brand.colorHex}04 100%)`,
  }} />
```

### Cómo colorear el contenido interno en hover

Los textos y elementos hijos relevantes adoptan `brand.colorHex` en hover con `transition-colors duration-300`:

```tsx
// Título / nombre principal
<p style={{ color: isHovered ? brand.colorHex : '#1e293b' }} className="transition-colors duration-300">

// Contador / valor numérico destacado
<span style={{ color: isHovered ? brand.colorHex : '#2563eb' }} className="transition-colors duration-300">

// Badge de estado (ej. COMPLETA)
<span style={isHovered ? {
  backgroundColor: `${brand.colorHex}14`,
  color: brand.colorHex,
  borderColor: `${brand.colorHex}44`,
} : { /* colores neutros originales */ }} className="transition-colors duration-300">

// Avatar / icono de inicial
<div style={isHovered ? {
  backgroundColor: `${brand.colorHex}18`,
  color: brand.colorHex,
} : { backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
```

### Tabla de opacidades del glow sweep

| Capa | Hex alpha | Uso |
|------|-----------|-----|
| `brand.colorHex` + `04` | ~1.6% | Extremos del gradiente de fondo |
| `brand.colorHex` + `06` | ~2.4% | `backgroundColor` de fila en hover |
| `brand.colorHex` + `10` | ~6.3% | `backgroundColor` de botón activo |
| `brand.colorHex` + `12` | ~7.1% | Ring exterior (primer shadow) |
| `brand.colorHex` + `14` | ~7.8% | Background de badge en hover |
| `brand.colorHex` + `18` | ~9.4% | Ring exterior chip / ring de botón |
| `brand.colorHex` + `44` | ~26.7% | `borderColor` en hover |
| `brand.colorHex` + `55` | ~33.3% | `borderColor` en hover fuerte (chip de barra) |

### Reglas

- `duration-300 ease-in-out` para ítems, `duration-500` para el glow sweep (`opacity` más lenta se siente más suave).
- El glow sweep siempre es `position: absolute inset-0 pointer-events-none` para no bloquear clics.
- Nunca hardcodear el color del hover — siempre `brand.colorHex`. El módulo puede cambiar.
- Ítems inactivos (reglas pausadas, etc.) reciben `opacity: 0.55` y **no** tienen efecto hover.
- El `backgroundColor` base en reposo es `transparent` en cards/grids (no `#ffffff`) para que el fondo del contenedor sea visible; usar `#ffffff` solo dentro del contenido.

### Implementado en

`/business/crm` (cards), `/business/clients` (cards), `/business/audiencia-crm` (filas tabla), `/business/automatizaciones` (items de regla), `/business/payment` (botones de canal), `/admin/clients` (filas tabla), `/sales/analytics` (cards KPI, filas tabla transacciones)

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
