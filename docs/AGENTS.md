## Arquitectura: FideLink Hub — Plataforma Multi-Módulo Co-Branded

### Visión
Plataforma modular donde cada **módulo de negocio** (fidelización, biografías digitales, etc.) opera como una marca semi-independiente (Fidelik, BioLink, etc.) pero comparte una misma base de usuarios, autenticación y panel de administración. Los usuarios se registran a un módulo específico (vía subdominio o query param) y el admin global puede ver y gestionar todos los módulos.

### Capas

```
src/
├── platform/          ← CAPA BASE: compuesta por todas las marcas
│   ├── auth/          ← Guards (ModuleGuard, AdminGuard)
│   ├── theme/         ← ModuleBrand (nombre, logo, color por módulo)
│   └── layout/        ← PlatformShell (TopBar + Sidebar unificado)
│
├── modules/           ← CAPA DE NEGOCIO: cada módulo es autocontenido
│   ├── fidelizacion/  ← Módulo 1: tarjetas de fidelidad, CRM, puntos
│   │   ├── pages/     ← Páginas del módulo
│   │   └── components/ ← Componentes del módulo
│   └── biografias/    ← Módulo 2: biografías digitales, templates
│       ├── types/     ← Types específicos del módulo
│       ├── data/      ← Mock data + localStorage
│       ├── components/ ← 19 componentes de template
│       └── pages/     ← BiographyDashboard
│
├── admin/             ← PANEL GLOBAL: métricas, clientes, módulos
├── components/        ← Componentes compartidos (Sidebar, TopBar, etc.)
├── context/           ← AuthContext (multi-módulo + admin role)
└── pages/             ← Páginas generales (Wallet, Editor, Welcome)
```

### Branding por Módulo

| Módulo    | Marca              | Color   | Ruta principal |
|-----------|--------------------|---------|----------------|
| Fidelización | Fidelik         | violeta | `/business/*` |
| Biografías   | BioLink         | índigo  | `/biography` |
| Admin        | Fidelicard Admin| slate   | `/admin/*` |

### Flujo de Guards

1. `PlatformShell` envuelve TODAS las rutas autenticadas → renderiza TopBar + Sidebar
2. `ModuleGuard` verifica que el usuario tenga acceso al módulo (admin siempre pasa) y setea el brand activo
3. `AdminGuard` verifica rol admin y setea brand admin
4. `ModuleBrand` (contexto) → TopBar y Sidebar leen de ahí para mostrar nombre/color correctos

### Cómo acceder como Admin

1. Registra un usuario normal desde `/?module=fidelizacion` o `/?module=biografias`
2. Ve a **Supabase Dashboard** → Authentication → Users → selecciona tu usuario
3. En **User Metadata**, cambia: `{ "role": "admin", "module": "fidelizacion", "name": "Tu Nombre" }`
4. Guarda, cierra sesión y vuelve a iniciar sesión
5. Ahora ves el panel admin en `/admin` + todos los módulos en el sidebar

Alternativa vía SQL en Supabase SQL Editor:
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'::jsonb
WHERE email = 'tu@email.com';
```

### Comandos

```bash
npm run dev          # Dev server
npm run build        # Build producción
npx tsc --noEmit     # Type check
```

### Convenciones

- Cada módulo dentro de `src/modules/<nombre>/` con pages/, components/, types/, data/
- Imports con path alias `@/` (mapeado a `src/`)
- Tailwind v4 para estilos
- React Router v7 con guards por módulo
- El sidebar muestra secciones según `activeModule` + acceso admin
