# Documentación — Fidelicard Platform

## Índice

| Documento | Descripción |
|-----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Estructura de carpetas, módulos, routing, estado global, servicios y deuda técnica |
| [DESIGN_GUIDELINES.md](./DESIGN_GUIDELINES.md) | Sistema de color, tipografía, componentes de superficie, animaciones, layout responsive y convenciones |

---

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Variables de entorno (copiar y completar)
cp .env.example .env

# Desarrollo
npm run dev        #App en http://localhost:3001

# Type checking
npm run lint
```

Variables de entorno requeridas:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GOOGLE_MAPS_API_KEY=    # Requerida para módulo promociones
VITE_GEMINI_API_KEY=         # Requerida para features de AI
```
