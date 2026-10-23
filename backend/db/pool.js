import pg from 'pg'

// Un Pool reutiliza conexiones entre peticiones en vez de abrir una por cada una,
// lo que importa con el límite de conexiones del plan gratis de Supabase.
const { Pool } = pg

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL en el .env (ver .env.example)')
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase exige SSL. rejectUnauthorized: false evita tener que instalar
  // su certificado raíz; la conexión sigue cifrada.
  ssl: { rejectUnauthorized: false },
})
