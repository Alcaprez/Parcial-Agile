# ALGARROBO — Parcial Agile

Sistema web de gestión de préstamos multi agencia (Next.js + PostgreSQL).

## Alcance de esta entrega
- Login por usuario y contraseña (sesión JWT en cookie httpOnly, 8 h).
- HU01 Registrar cliente (persona natural y empresa).
- HU03 Listar clientes.
- HU06 Listar solicitudes pendientes y revisar su información.

## Variables de entorno
Ver `.env.example`. Obligatorias: `DATABASE_URL`, `JWT_SECRET`.
Opcionales: `SEED_PASSWORD` (contraseña inicial de los usuarios semilla) y `SEED_DEMO=true` (carga datos de ejemplo).

## Base de datos
Las tablas y los usuarios iniciales se crean solos en la primera petición (idempotente).
Contraseña inicial de todos los usuarios: `SEED_PASSWORD`, por defecto `Parcial2026!` (cambiarla en producción).

| Usuario | Rol | Agencia |
|---|---|---|
| `dueno` | Dueño | Todas |
| `admin.trujillo`, `admin.chiclayo`, `admin.piura`, `admin.tumbes` | Administrador | La suya |
| `agente.trujillo`, `agente.chiclayo`, `agente.piura`, `agente.tumbes` | Agente | La suya |

Con `SEED_DEMO=true` se cargan 4 clientes y 5 solicitudes pendientes de ejemplo (solo si no hay clientes).

## Desarrollo
```
npm install
cp .env.example .env.local
npm run dev
```
