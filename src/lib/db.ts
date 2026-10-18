import { Pool, type QueryResultRow } from "pg";
import bcrypt from "bcryptjs";

const g = globalThis as unknown as {
  __pgPool?: Pool;
  __schemaReady?: Promise<void>;
};

function pool(): Pool {
  if (!g.__pgPool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("Falta la variable de entorno DATABASE_URL");
    }
    g.__pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
    });
  }
  return g.__pgPool;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS agencias (
  id      SERIAL PRIMARY KEY,
  nombre  TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        TEXT NOT NULL,
  usuario       TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol           TEXT NOT NULL CHECK (rol IN ('dueno','administrador','agente')),
  agencia_id    INTEGER REFERENCES agencias(id),
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (rol = 'dueno' OR agencia_id IS NOT NULL)
);

CREATE SEQUENCE IF NOT EXISTS clientes_codigo_seq;
CREATE TABLE IF NOT EXISTS clientes (
  id             SERIAL PRIMARY KEY,
  codigo         TEXT NOT NULL UNIQUE
                 DEFAULT ('CLI-' || lpad(nextval('clientes_codigo_seq')::text, 4, '0')),
  tipo           TEXT NOT NULL CHECK (tipo IN ('persona','empresa')),
  nombres        TEXT,
  apellidos      TEXT,
  dni            TEXT UNIQUE,
  razon_social   TEXT,
  ruc            TEXT UNIQUE,
  rep_nombres    TEXT,
  rep_apellidos  TEXT,
  rep_dni        TEXT,
  telefono       TEXT NOT NULL,
  correo         TEXT NOT NULL,
  direccion      TEXT NOT NULL,
  agencia_id     INTEGER NOT NULL REFERENCES agencias(id),
  creado_por     INTEGER NOT NULL REFERENCES usuarios(id),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (tipo = 'persona' AND nombres IS NOT NULL AND apellidos IS NOT NULL AND dni IS NOT NULL)
    OR
    (tipo = 'empresa' AND razon_social IS NOT NULL AND ruc IS NOT NULL
       AND rep_nombres IS NOT NULL AND rep_apellidos IS NOT NULL AND rep_dni IS NOT NULL)
  )
);

CREATE SEQUENCE IF NOT EXISTS solicitudes_codigo_seq;
CREATE TABLE IF NOT EXISTS solicitudes (
  id           SERIAL PRIMARY KEY,
  codigo       TEXT NOT NULL UNIQUE
               DEFAULT ('SOL-' || lpad(nextval('solicitudes_codigo_seq')::text, 4, '0')),
  cliente_id   INTEGER NOT NULL REFERENCES clientes(id),
  agencia_id   INTEGER NOT NULL REFERENCES agencias(id),
  monto        NUMERIC(12,2) NOT NULL CHECK (monto > 0 AND monto <= 10000),
  plazo_meses  INTEGER NOT NULL CHECK (plazo_meses BETWEEN 1 AND 60),
  estado       TEXT NOT NULL DEFAULT 'Pendiente'
               CHECK (estado IN ('Pendiente','Aprobada','Rechazada')),
  telefono     TEXT NOT NULL,
  correo       TEXT NOT NULL,
  creado_por   INTEGER REFERENCES usuarios(id),
  creada_en    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_estado_agencia
  ON solicitudes (estado, agencia_id, creada_en);
`;

const AGENCIAS = ["Trujillo", "Chiclayo", "Piura", "Tumbes"];

async function seed(p: Pool) {
  for (const nombre of AGENCIAS) {
    await p.query(
      "INSERT INTO agencias (nombre) VALUES ($1) ON CONFLICT (nombre) DO NOTHING",
      [nombre],
    );
  }

  const { rows } = await p.query("SELECT 1 FROM usuarios LIMIT 1");
  if (rows.length === 0) {
    const pass = process.env.SEED_PASSWORD || "Parcial2026!";
    const hash = await bcrypt.hash(pass, 10);
    await p.query(
      `INSERT INTO usuarios (nombre, usuario, password_hash, rol, agencia_id)
       VALUES ('Dueño del negocio', 'dueno', $1, 'dueno', NULL)`,
      [hash],
    );
    for (const nombre of AGENCIAS) {
      const slug = nombre.toLowerCase();
      await p.query(
        `INSERT INTO usuarios (nombre, usuario, password_hash, rol, agencia_id)
         SELECT $1, $2, $3, 'administrador', id FROM agencias WHERE nombre = $4`,
        [`Administrador ${nombre}`, `admin.${slug}`, hash, nombre],
      );
      await p.query(
        `INSERT INTO usuarios (nombre, usuario, password_hash, rol, agencia_id)
         SELECT $1, $2, $3, 'agente', id FROM agencias WHERE nombre = $4`,
        [`Agente ${nombre}`, `agente.${slug}`, hash, nombre],
      );
    }
  }

  // Datos de demostración (solo si SEED_DEMO=true y no hay clientes aún).
  if (process.env.SEED_DEMO === "true") {
    const c = await p.query("SELECT 1 FROM clientes LIMIT 1");
    if (c.rows.length === 0) await seedDemo(p);
  }
}

async function seedDemo(p: Pool) {
  const ag = async (n: string) =>
    (await p.query("SELECT id FROM agencias WHERE nombre=$1", [n])).rows[0].id as number;
  const us = async (u: string) =>
    (await p.query("SELECT id FROM usuarios WHERE usuario=$1", [u])).rows[0].id as number;

  const trujillo = await ag("Trujillo");
  const piura = await ag("Piura");
  const chiclayo = await ag("Chiclayo");
  const uTru = await us("agente.trujillo");
  const uPiu = await us("agente.piura");
  const uChi = await us("agente.chiclayo");

  const personas: [string, string, string, string, string, string, number, number][] = [
    ["CARLOS ALBERTO", "QUISPE MAMANI", "45871236", "987654321", "carlos.quispe@correo.com", "Av. España 1020, Trujillo", trujillo, uTru],
    ["MARÍA ELENA", "ROJAS VILLANUEVA", "40125879", "976543210", "maria.rojas@correo.com", "Jr. Lima 345, Piura", piura, uPiu],
    ["JOSÉ LUIS", "ACUÑA TORRES", "32658741", "965432109", "jose.acuna@correo.com", "Calle Los Pinos 78, Chiclayo", chiclayo, uChi],
  ];
  const ids: number[] = [];
  for (const [n, a, dni, tel, mail, dir, agId, uId] of personas) {
    const r = await p.query(
      `INSERT INTO clientes (tipo,nombres,apellidos,dni,telefono,correo,direccion,agencia_id,creado_por)
       VALUES ('persona',$1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [n, a, dni, tel, mail, dir, agId, uId],
    );
    ids.push(r.rows[0].id);
  }
  const e = await p.query(
    `INSERT INTO clientes (tipo,razon_social,ruc,rep_nombres,rep_apellidos,rep_dni,telefono,correo,direccion,agencia_id,creado_por)
     VALUES ('empresa','COMERCIAL EL NORTE S.A.C.','20100070970','LUIS FERNANDO','PAREDES CRUZ','18123456','944556677','contacto@elnorte.pe','Av. Larco 500, Trujillo',$1,$2) RETURNING id`,
    [trujillo, uTru],
  );
  ids.push(e.rows[0].id);

  const sol: [number, number, number, number, string, string, number][] = [
    [ids[0], trujillo, 3000, 12, "987654321", "carlos.quispe@correo.com", uTru],
    [ids[3], trujillo, 8000, 24, "944556677", "contacto@elnorte.pe", uTru],
    [ids[1], piura, 1500, 6, "976543210", "maria.rojas@correo.com", uPiu],
    [ids[2], chiclayo, 5000, 18, "965432109", "jose.acuna@correo.com", uChi],
    [ids[0], trujillo, 1000, 3, "987000111", "quispe.nuevo@correo.com", uTru],
  ];
  let i = 0;
  for (const [cid, agId, monto, plazo, tel, mail, uId] of sol) {
    await p.query(
      `INSERT INTO solicitudes (cliente_id,agencia_id,monto,plazo_meses,telefono,correo,creado_por,creada_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7, now() - ($8 || ' hours')::interval)`,
      [cid, agId, monto, plazo, tel, mail, uId, String((sol.length - i) * 5)],
    );
    i++;
  }
}

async function initSchema() {
  const p = pool();
  const client = await p.connect();
  try {
    await client.query("SELECT pg_advisory_lock(727001)");
    await client.query(SCHEMA);
    await seed(p);
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock(727001)");
    } finally {
      client.release();
    }
  }
}

export function ensureSchema(): Promise<void> {
  if (!g.__schemaReady) {
    g.__schemaReady = initSchema().catch((err) => {
      g.__schemaReady = undefined;
      throw err;
    });
  }
  return g.__schemaReady;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  await ensureSchema();
  const r = await pool().query<T>(text, params);
  return r.rows;
}
