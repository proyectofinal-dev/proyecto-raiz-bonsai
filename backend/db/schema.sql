-- Esquema de Raíz. Ejecutar una vez en Supabase → SQL Editor.
-- Los CHECK limitan dificultad y luz a valores fijos: la IA y los filtros del
-- frontend dependen de que esos campos sean consistentes, no texto libre.

create table if not exists bonsais (
  id               serial primary key,
  nombre           text    not null,
  especie          text    not null,
  descripcion      text    not null,
  precio           integer not null check (precio >= 0),   -- pesos colombianos, sin decimales
  edad_anios       integer check (edad_anios >= 0),
  dificultad       text    not null check (dificultad in ('facil', 'media', 'dificil')),
  luz              text    not null check (luz in ('baja', 'media', 'sol_directo')),
  frecuencia_riego text    not null,
  imagen_url       text,
  disponible       boolean not null default true,
  creado_en        timestamptz not null default now()
);

create table if not exists mensajes (
  id             serial primary key,
  nombre         text not null,
  email          text not null,
  telefono       text,
  bonsai_interes text,                    -- nullable: el contacto no siempre viene desde un bonsái
  mensaje        text not null,
  leido          boolean not null default false,
  creado_en      timestamptz not null default now()
);

-- Solo existe el admin, creado con scripts/crear-admin.js. No hay registro público.
create table if not exists usuarios (
  id            serial primary key,
  email         text not null unique,
  password_hash text not null
);

-- Seguridad de Supabase: al activar RLS sin políticas, nadie puede leer estas
-- tablas con la API pública (anon key) de Supabase. Nuestro backend se conecta
-- con el usuario dueño de la base (connection string) y no se ve afectado.
alter table bonsais  enable row level security;
alter table mensajes enable row level security;
alter table usuarios enable row level security;
