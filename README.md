# Raíz · Vivero de bonsáis

Aplicación web full stack para **Raíz**, un emprendimiento colombiano de venta de bonsáis.
Incluye catálogo, formulario de contacto, panel de administración con login y un
asistente de IA que recomienda árboles del catálogo real y resuelve dudas de cuidado.

Proyecto final de la **Ruta Avanzada de Jóvenes creaTIvos**.

## Estructura

```
proyecto-raiz-bonsai/
├── frontend/   React + Vite + Tailwind  → GitHub Pages
├── backend/    Node.js + Express        → Render
└── docs/       Guía de construcción del proyecto
```

Frontend y backend están separados porque GitHub Pages solo sirve archivos
estáticos: la API (base de datos, login, IA) corre aparte en Render.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite, Tailwind CSS |
| Backend | Node.js + Express |
| Base de datos | Supabase (PostgreSQL) |
| Auth admin | JWT + bcrypt |
| IA | Google Gemini API |

## Cómo correrlo en local

Requisitos: Node.js 20 o superior.

**Backend**

```bash
cd backend
npm install
cp .env.example .env
npm run dev        # http://localhost:3000/api/health → { "ok": true }
```

**Frontend**

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```
