# Arquitectura — Fidelicard Platform

> Versión: 1.0 | Actualizado: 2026-06-16

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework UI | React 19 + TypeScript 5.8 |
| Routing | React Router v7 |
| Estilos | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Backend-as-a-Service | Supabase (PostgreSQL + Auth + Storage) |
| Animaciones | Motion v12 (Framer Motion fork) |
| Iconos | Lucide React |
| Charts | Recharts |
| AI | Google Generative AI (`@google/genai`) |
| Mapas | `@vis.gl/react-google-maps` |
| QR | `html5-qrcode`, `qrcode.react` |
| Build | Vite 8 |

---

## Estructura de carpetas

```
src/
├── admin/                  # Dashboard cross-módulo para administradores
├── components/             # Componentes UI reutilizables globales
│   ├── auth/               # BrandLoginGate (formulario de login unificado)
│   ├── layout/             # TopBar, Sidebar, BottomNav
│   ├── profile/            # ProfileDrawer
│   ├── qr/                 # QrScanner
│   ├── receipt/            # ReceiptCapture
│   └── wallet/             # RealisticCard (tarjeta física renderizada)
├── context/                # React Context API — estado global
│   ├── AuthContext.tsx     # Sesión de usuario + rol
│   └── CartContext.tsx     # Carrito de compras (módulo ventas)
├── i18n/                   # Internacionalización (ES/EN)
│   └── locales/
├── lib/
│   └── supabaseClient.ts   # Singleton Supabase + stub de dev
├── modules/                # Módulos de negocio (ver sección Módulos)
│   ├── fidelizacion/
│   ├── biografias/
│   ├── ventas/
│   ├── promociones/
│   └── napilink/
├── pages/                  # Páginas raíz y legacy
├── platform/               # Infraestructura transversal
│   ├── auth/               # ModuleGuard, AdminGuard
│   ├── layout/             # PlatformShell
│   ├── theme/              # ModuleBrand (colores/nombres por módulo)
│   └── ui/                 # SectionRibbon y otros atoms de plataforma
├── services/               # Capa de acceso a datos (Supabase)
├── types/                  # Tipos TypeScript globales
└── utils/                  # Utilidades compartidas
```

---

## Arquitectura de módulos

Cada módulo vive en `src/modules/{MODULE_ID}/` y sigue **exactamente** esta convención:

```
modules/{MODULE_ID}/
├── pages/          # Componentes de página (ruteados directamente)
├── components/     # Componentes internos del módulo
├── types/
│   └── index.ts   # Interfaces y tipos del módulo
├── data/
│   └── seed.ts    # Datos de demo/dev (no se usan en producción)
├── services/       # Llamadas a Supabase específicas del módulo (opcional)
└── hooks/          # Hooks propios del módulo (opcional)
```

### Módulos activos

| ID | Nombre comercial | Descripción |
|----|-----------------|-------------|
| `fidelizacion` | Fidelik | Tarjetas de lealtad, CRM, registro de compras |
| `biografias` | BioLink | Páginas de bio con plantillas por categoría |
| `ventas` | LinkSales | Catálogo, campañas, leads, checkout |
| `promociones` | PromoLink | Promociones locales con mapa y reservas |
| `napilink` | Napilink | Propinas digitales (servidor Express separado, port 3002) |

---

## Routing

Todos los rutas autenticadas están envueltas por `PlatformShell`. El acceso por módulo lo controla `ModuleGuard`.

```
/                          → BrandLoginGate (público)
/platform-shell            → PlatformShell (autenticado)
  /business/*              → ModuleGuard('fidelizacion')
  /biography/*             → ModuleGuard('biografias')
  /sales/*                 → ModuleGuard('ventas')
  /admin/*                 → AdminGuard
  /wallet                  → sin guard (cross-módulo)
  /promociones/:tab?       → sin guard
  /napilink/:tab?          → sin guard (proxy → :3002)
/bio/:slug                 → PublicBio (público, sin shell)
```

- Usuarios no-admin solo pueden acceder a su módulo asignado (`user_metadata.module`).
- Admin bypasea todos los guards.

---

## Estado global (Context API)

```tsx
<I18nProvider>           // idioma (ES/EN) + cookie
  <AuthProvider>         // usuario, sesión, rol, módulo
    <CartProvider>       // carrito de ventas
      <ModuleBrandProvider>  // módulo activo + colores/nombre de marca
```

### AuthContext (`useAuth`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `user` | `User \| null` | Objeto Supabase Auth |
| `session` | `Session \| null` | Sesión activa |
| `isAdmin` | `boolean` | Derivado de `user_metadata.role === 'admin'` |
| `userModule` | `string \| null` | Módulo asignado al usuario |
| `signIn` | `(email, pass) => Promise` | |
| `signUp` | `(email, pass, name, role, module?) => Promise` | |
| `signOut` | `() => Promise` | |

### ModuleBrandContext (`useModuleBrand`)

| Módulo | Nombre | Color hex |
|--------|--------|-----------|
| fidelizacion | Fidelik | `#7c3aed` (violet) |
| biografias | BioLink | `#6366f1` (indigo) |
| ventas | LinkSales | `#10b981` (emerald) |
| admin | Ailink | `#7c3aed` (violet) |

---

## Capa de servicios

Todos los servicios en `src/services/` devuelven un `ServiceResult<T>`:

```ts
interface ServiceResult<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
}
```

| Servicio | Responsabilidad |
|----------|----------------|
| `loyaltyService` | Tarjetas de lealtad, config de negocio, clientes |
| `profileService` | Perfil de usuario (CRUD + avatar upload) |
| `qrLinkService` | QR codes, slugs, resolución de URLs |
| `statsService` | KPIs de negocio, purchases by day, actividad reciente |
| `publicService` | Datos públicos (sin auth) |
| `receiptService` | Generación de recibos de compra |
| `whatsappService` | Integración WhatsApp |
| `telegramService` | Integración Telegram bot |

**Convención de naming en base de datos:** snake_case. Los servicios convierten a camelCase al retornar datos.

---

## Layout

```
PlatformShell
├── TopBar (sticky, h-14, z-40)
│   ├── [izq] Botón menú + nombre de marca
│   └── [der] Email, QR, Carrito (ventas), Bell, Avatar
├── <main> (flex-grow, contenido de la ruta activa)
├── Sidebar (overlay, w-80, z-50)
│   ├── Secciones por módulo activo
│   └── Sign out
└── CartPanel (overlay, z-50, solo en módulo ventas)
```

**BottomNav** aparece solo en rutas de cliente (`/wallet`, `/client/*`). En módulos de negocio lo reemplaza el Sidebar.

---

## Autenticación

1. `BrandLoginGate` presenta formulario de registro/login por rol (Empresas / Clientes).
2. Supabase Auth guarda `role` y `module` en `user_metadata`.
3. `AuthProvider` escucha `onAuthStateChange` y sincroniza estado.
4. `ModuleGuard` verifica que `userModule === requestedModule` o `isAdmin === true`.
5. Signup con query param `?module=fidelizacion` preselecciona módulo.

---

## Patrones de data fetching

El proyecto usa **Supabase SDK directo** sin capa de caché. Patrón estándar en páginas:

```tsx
useEffect(() => {
  let cancelled = false;
  setLoading(true);
  someService.getData(id).then(({ data, error }) => {
    if (cancelled) return;
    if (error) setError(error.message);
    else setData(data);
    setLoading(false);
  });
  return () => { cancelled = true; };
}, [id]);
```

> Mejora pendiente: adoptar **react-query** (`@tanstack/react-query`) para caché, deduplicación y revalidación automática.

---

## Deuda técnica identificada

| Prioridad | Problema | Solución recomendada |
|-----------|---------|---------------------|
| Alta | Data fetching sin caché | Adoptar react-query |
| Alta | Test credentials hardcodeados en BrandLoginGate | Variables de entorno o flag dev |
| Media | `index.css` monolítico (364 líneas) | Dividir en `theme.css`, `utilities.css`, `animations.css` |
| Media | Sin Error Boundaries | Agregar `<ErrorBoundary>` en rutas y módulos |
| Media | Snake→camelCase inconsistente entre servicios | Utilidad centralizada `toCamel(obj)` |
| Media | `any` types en algunos módulos | Strict null checks + tipos explícitos |
| Baja | Páginas legacy sin usar en `/pages/` | Auditar y eliminar las que no están ruteadas |
| Baja | Sin skeleton loaders | Componente `<Skeleton>` reutilizable |
