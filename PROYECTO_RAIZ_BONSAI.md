# Proyecto Final — "Raíz" · Vivero de bonsáis

> Guía de construcción para trabajar con Claude Code sesión por sesión.
> Cada fase es una sesión. Al final de cada fase hay commits sugeridos.

---

## 0. Contexto del proyecto

Aplicación web full stack para un emprendimiento de venta de bonsáis, con asistente de IA que recomienda árboles del catálogo real y resuelve dudas de cuidado.

Es el proyecto final de la **Ruta Avanzada de Jóvenes creaTIvos**.

### Entregables obligatorios (rúbrica)

| # | Entregable | Descripción |
|---|---|---|
| 1 | App publicada | URL funcional en internet |
| 2 | Repositorio GitHub | Código organizado, **mínimo 15 commits** |
| 3 | Marca + home | Identidad visual y página de inicio |
| 4 | Catálogo | Productos del emprendimiento |
| 5 | Contacto real | Formulario funcional que guarda datos |
| 6 | Admin con login | Panel privado para gestionar información |
| 7 | IA personalizada | Chatbot/recomendador que conoce el negocio |

### Criterios de calidad que evalúan

- **Código limpio:** frontend y backend separados, carpetas claras, comentarios que expliquen decisiones técnicas, que otro dev pueda entenderlo.
- **UX cuidada:** responsive real, animaciones básicas, estados de carga, errores claros.
- **IA personalizada:** conoce los productos, usa el tono de la marca, responde como el negocio.

---

## 1. Stack tecnológico

Elegido por ser **lo más simple que cumple todos los requisitos**.

| Capa | Tecnología | Por qué |
|---|---|---|
| Frontend | **React + Vite** | Es lo que pide la ruta del curso. Vite arranca en segundos |
| Estilos | **Tailwind CSS** | Responsive sin pelear con CSS. Alternativa: CSS plano si se siente más cómodo |
| Animaciones | **Framer Motion** | Las reglas permiten librerías de animación. Con 3-4 animaciones basta |
| Backend | **Node.js + Express** | El más simple de los backends JS |
| Base de datos | **Supabase (PostgreSQL)** | Gratis, no se borra, solo necesita un connection string |
| Auth admin | **JWT + bcrypt** | ~40 líneas de código propio. Suficiente y demostrable |
| IA | **Google Gemini API** | Tiene capa gratuita generosa. Alternativas: Groq (gratis), OpenAI o Anthropic (de pago) |
| Imágenes | **URLs externas** | NO implementar subida de archivos. Usar URLs de Cloudinary/Unsplash o imágenes en `/public` |
| Deploy frontend | **GitHub Pages** | Lo exige la rúbrica |
| Deploy backend | **Render** (plan gratis) | GitHub Pages no corre backend (ver §2) |

### Lo que NO hay que hacer (para no complicarse)

- ❌ Subida de imágenes con multer/S3 → usar URLs
- ❌ Carrito de compras ni pasarela de pago → no lo piden
- ❌ Registro de usuarios públicos → solo existe el admin, creado a mano
- ❌ TypeScript → si no lo domina, JavaScript plano está bien
- ❌ Redux u otro manejo de estado global → `useState` y `useEffect` alcanzan

---

## 2. Advertencia importante sobre el despliegue

La presentación dice *"desplegar en GitHub Pages"*, pero **GitHub Pages solo sirve archivos estáticos**: no corre Node, ni base de datos, ni login.

**Solución:** repositorio con dos carpetas.

```
proyecto-raiz/
├── frontend/     → se despliega en GitHub Pages
└── backend/      → se despliega en Render (gratis)
```

El frontend consume el backend por su URL pública. Se cumple la regla y todo funciona.

> **Confirmar con el mentor** antes de empezar. Es justo el tipo de duda que se resuelve por WhatsApp según la diapositiva de mentoría.

### Dos gotchas de GitHub Pages

1. **Rutas:** React Router falla en GitHub Pages con `BrowserRouter`. Usar **`HashRouter`** (las URLs quedan `/#/catalogo`) o configurar `basename`.
2. **Base path:** en `vite.config.js` hay que poner `base: '/nombre-del-repo/'`.

### Render plan gratis

El servicio se "duerme" tras ~15 min sin uso y la primera petición tarda ~30 segundos en responder. **Importante para la defensa:** abrir la app 2 minutos antes de presentar para que ya esté despierta.

---

## 3. Modelo de datos

Tres tablas. Nada más.

### `bonsais`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | serial PK | |
| `nombre` | text | Ej. "Ficus Retusa" |
| `especie` | text | Nombre científico |
| `descripcion` | text | 2-3 líneas |
| `precio` | integer | En pesos, sin decimales |
| `edad_anios` | integer | Edad aproximada |
| `dificultad` | text | `facil` / `media` / `dificil` |
| `luz` | text | `baja` / `media` / `sol_directo` |
| `frecuencia_riego` | text | Ej. "cada 3 días" |
| `imagen_url` | text | URL externa |
| `disponible` | boolean | Default `true` |
| `creado_en` | timestamp | Default `now()` |

> **Los campos `dificultad`, `luz` y `frecuencia_riego` son el corazón del proyecto.** No son decorativos: son los que se le pasan a la IA para que recomiende con criterio real. Si el admin agrega un bonsái nuevo, la IA lo empieza a recomendar sin tocar código.

### `mensajes`

| Campo | Tipo |
|---|---|
| `id` | serial PK |
| `nombre` | text |
| `email` | text |
| `telefono` | text |
| `bonsai_interes` | text (nullable) |
| `mensaje` | text |
| `leido` | boolean (default false) |
| `creado_en` | timestamp |

### `usuarios`

| Campo | Tipo |
|---|---|
| `id` | serial PK |
| `email` | text unique |
| `password_hash` | text |

> Solo habrá **un** usuario admin, insertado manualmente con un script. No hay registro público.

---

## 4. Endpoints del backend

### Públicos

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/bonsais` | Lista bonsáis disponibles |
| `GET` | `/api/bonsais/:id` | Detalle de uno |
| `POST` | `/api/mensajes` | Guarda el formulario de contacto |
| `POST` | `/api/asistente` | Consulta a la IA |

### Privados (requieren token JWT)

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/api/auth/login` | Devuelve el token |
| `POST` | `/api/bonsais` | Crear bonsái |
| `PUT` | `/api/bonsais/:id` | Editar bonsái |
| `DELETE` | `/api/bonsais/:id` | Eliminar bonsái |
| `GET` | `/api/mensajes` | Listar mensajes recibidos |
| `PATCH` | `/api/mensajes/:id` | Marcar como leído |

---

## 5. La funcionalidad de IA

### Cómo funciona

```
Usuario escribe su pregunta en el frontend
        ↓
POST /api/asistente  { mensaje: "..." }
        ↓
El backend consulta la tabla bonsais (los disponibles)
        ↓
Arma un prompt con el catálogo real + la pregunta
        ↓
Llama a la API de Gemini
        ↓
Devuelve la respuesta al frontend
```

### Prompt base (ajustar el tono a gusto)

```
Eres el asesor virtual de "Raíz", un vivero colombiano especializado
en bonsáis. Tu tono es cercano, paciente y sin tecnicismos innecesarios.
Hablas como alguien que ama las plantas, no como un vendedor.

CATÁLOGO DISPONIBLE HOY:
{aquí el backend inyecta los bonsáis de la base de datos,
 con nombre, precio, dificultad, luz y riego}

REGLAS:
- Solo recomienda bonsáis que estén en el catálogo de arriba.
- Si ninguno encaja con lo que pide, dilo con honestidad y sugiere
  lo más cercano explicando la diferencia.
- Si pregunta por cuidados, responde con consejos concretos y breves.
- Máximo 4 frases por respuesta.
- Nunca inventes precios ni especies que no estén en el catálogo.

PREGUNTA DEL CLIENTE: {mensaje del usuario}
```

### Seguridad — punto clave para la defensa

> **La API key de la IA va SOLO en el backend, nunca en el frontend.**
> Si se pone en React, queda expuesta en el navegador y cualquiera puede usarla y gastar la cuota.
> Esta es una decisión técnica que vale la pena comentar en el código y mencionar en la defensa.

Guardarla en el `.env` del backend y **nunca** subir el `.env` a GitHub (agregarlo al `.gitignore` desde el primer commit).

---

## 6. Fases de construcción

Cada fase es una sesión de trabajo con Claude Code. El prompt sugerido es el punto de partida; ajustarlo según vaya saliendo.

---

### Fase 1 · Preparación y repositorio

**Objetivo:** tener el esqueleto y Git funcionando.

Tareas:
- Crear repo en GitHub: `proyecto-raiz-bonsai`
- Estructura de dos carpetas: `frontend/` y `backend/`
- `frontend/` con Vite + React + Tailwind
- `backend/` con Express básico y un endpoint `GET /api/health`
- `.gitignore` con `node_modules`, `.env`, `dist`
- `README.md` con el nombre del proyecto y qué hace

**Prompt sugerido:**
```
Crea la estructura base de un proyecto full stack:
- carpeta frontend/ con React + Vite + Tailwind configurado
- carpeta backend/ con Node + Express, un endpoint GET /api/health
  que devuelva { ok: true }, y cors habilitado
- .gitignore en la raíz que ignore node_modules, .env y dist
- README.md explicando que es un vivero de bonsáis llamado "Raíz"
No uses TypeScript. JavaScript plano.
```

**Commits:** 1-2

---

### Fase 2 · Base de datos

**Objetivo:** las tres tablas creadas y el backend conectado.

Tareas:
- Crear proyecto en [supabase.com](https://supabase.com) (gratis)
- Crear las tablas `bonsais`, `mensajes`, `usuarios` (§3)
- Insertar 6-8 bonsáis de ejemplo con datos realistas
- Conectar el backend usando el connection string en `.env`
- Script para crear el usuario admin con contraseña hasheada

**Prompt sugerido:**
```
Conecta el backend Express a Supabase (PostgreSQL).
Dame:
1. El SQL para crear las tablas bonsais, mensajes y usuarios
   [pegar aquí la estructura de la sección 3 del md]
2. El SQL con 6 bonsáis de ejemplo realistas (especies reales que
   se consigan en Colombia, precios en pesos colombianos)
3. La conexión en backend usando la librería pg y variables de entorno
4. Un script crear-admin.js que reciba email y password por consola,
   hashee con bcrypt e inserte el usuario
```

**Commits:** 2-3

---

### Fase 3 · API del catálogo

**Objetivo:** endpoints públicos funcionando.

Tareas:
- `GET /api/bonsais` y `GET /api/bonsais/:id`
- `POST /api/mensajes` con validación de campos
- Manejo de errores con códigos HTTP correctos (400, 404, 500)
- Probar todo con Thunder Client, Postman o `curl`

**Prompt sugerido:**
```
Implementa en el backend los endpoints públicos:
- GET /api/bonsais (solo los disponibles)
- GET /api/bonsais/:id (404 si no existe)
- POST /api/mensajes (validar que nombre, email y mensaje
  no vengan vacíos; 400 si falla)
Organiza el código en carpetas: routes/, controllers/, db/.
Agrega comentarios que expliquen las decisiones, no lo obvio.
```

**Commits:** 2

---

### Fase 4 · Home y catálogo en el frontend

**Objetivo:** la parte que se ve.

Tareas:
- Home: hero con imagen grande, lema de la marca, 3 bloques de valor
- Página de catálogo: grid de tarjetas con foto, nombre, precio y dificultad
- Página de detalle de cada bonsái
- Navbar responsive (menú hamburguesa en móvil)
- Footer
- **Estados de carga** (skeleton o spinner) y **mensaje de error** si la API falla
- 2-3 animaciones con Framer Motion (fade al entrar, hover en tarjetas)

**Prompt sugerido:**
```
Construye el frontend en React:
- Home con hero, lema y 3 bloques de valor
- /catalogo con grid responsive de tarjetas (foto, nombre, precio,
  badge de dificultad con color según facil/media/dificil)
- /bonsai/:id con el detalle completo
- Navbar responsive con menú hamburguesa y Footer
- Estados de carga y de error en todas las vistas que llamen la API
- Animaciones sutiles con Framer Motion
Paleta: verde profundo, tonos tierra, mucho blanco. Estética de galería.
Usa HashRouter (va a GitHub Pages).
```

**Commits:** 3-4

---

### Fase 5 · Formulario de contacto

**Objetivo:** que un mensaje real llegue a la base de datos.

Tareas:
- Página `/contacto` con el formulario
- Validación en el frontend antes de enviar
- Estado de "enviando..." mientras responde
- Mensaje de éxito y de error claros
- Si se entra desde un bonsái, que precargue cuál interesa

**Commits:** 1-2

---

### Fase 6 · Login y panel admin

**Objetivo:** la parte privada.

Tareas:
- `POST /api/auth/login` que valide con bcrypt y devuelva JWT
- Middleware que proteja las rutas privadas
- Endpoints CRUD de bonsáis y listado de mensajes
- `/admin/login` en el frontend
- `/admin` con dos secciones: gestionar bonsáis y ver mensajes
- Guardar el token en `localStorage` y redirigir si no hay sesión

**Prompt sugerido:**
```
Implementa autenticación:
Backend:
- POST /api/auth/login (email + password, valida con bcrypt,
  devuelve JWT con expiración de 8 horas)
- Middleware verificarToken para rutas privadas
- CRUD completo de bonsais (POST, PUT, DELETE) protegido
- GET /api/mensajes y PATCH /api/mensajes/:id protegidos
Frontend:
- /admin/login con formulario
- /admin protegido: si no hay token, redirige al login
- Sección de bonsáis: tabla con editar/eliminar + formulario de crear
- Sección de mensajes: lista con marcar como leído
Guarda el token en localStorage.
```

**Commits:** 3-4

---

### Fase 7 · El asistente de IA

**Objetivo:** la funcionalidad diferenciadora.

Tareas:
- Conseguir API key de Gemini en [aistudio.google.com](https://aistudio.google.com) (gratis)
- `POST /api/asistente` que consulte el catálogo y llame a la IA
- Widget de chat en el frontend (botón flotante o sección en el home)
- Estado "pensando..." mientras responde
- Manejo de error si la API falla

**Prompt sugerido:**
```
Implementa el asistente de IA:
Backend:
- POST /api/asistente que reciba { mensaje }
- Antes de llamar a la IA, consulta los bonsais disponibles en la BD
  y los inyecta en el prompt del sistema
- Usa la API de Google Gemini (la key va en .env, NUNCA en el frontend)
- El prompt es [pegar el de la sección 5 del md]
- Si la IA falla, devuelve un mensaje amable, no un error técnico
Frontend:
- Widget de chat con botón flotante en la esquina
- Historial de la conversación en pantalla
- Indicador de "pensando..." mientras espera
Comenta en el código por qué la key está en el backend.
```

**Commits:** 2-3

---

### Fase 8 · Despliegue

**Objetivo:** que tenga URL pública.

Tareas:
- Backend a Render: conectar el repo, raíz en `backend/`, variables de entorno
- Verificar que `/api/health` responda en la URL de Render
- En el frontend, apuntar la URL del backend por variable de entorno
- `vite.config.js` con `base: '/nombre-del-repo/'`
- Build y deploy a GitHub Pages (`gh-pages` o GitHub Actions)
- Probar el flujo completo desde el celular

**Commits:** 2

---

### Fase 9 · Pulido y defensa

**Objetivo:** que se vea terminado.

Tareas:
- Revisar responsive en celular de verdad, no solo en el inspector
- Favicon y título de la pestaña
- README completo: qué es, stack, cómo correrlo local, link a la app
- Revisar que no queden `console.log` ni código comentado sin usar
- Revisar que los comentarios expliquen *decisiones*, no lo evidente
- Preparar respuestas a las preguntas probables (§7)

**Commits:** 1-2

---

## 7. Preguntas probables en la defensa

| Pregunta | Respuesta corta |
|---|---|
| ¿Cómo sabe la IA qué vendes? | El backend consulta la BD y le inyecta el catálogo en el prompt. Si agrego un bonsái nuevo, la IA lo recomienda sin tocar código |
| ¿Por qué la API key está en el backend? | Si estuviera en React quedaría visible en el navegador y cualquiera podría gastarse la cuota |
| ¿Por qué separaste frontend y backend? | Se despliegan por separado, se pueden escalar aparte, y el backend podría servir también una app móvil después |
| ¿Cómo proteges el panel admin? | JWT firmado con expiración; un middleware verifica el token en cada ruta privada; las contraseñas van hasheadas con bcrypt |
| ¿Qué pasa si la IA se cae? | El endpoint lo captura y devuelve un mensaje amable; el resto de la app sigue funcionando |

---

## 8. Checklist final

```
[ ] App publicada con URL funcional
[ ] Repo en GitHub con 15+ commits
[ ] Home con identidad visual propia
[ ] Catálogo funcionando (lista + detalle)
[ ] Formulario de contacto que guarda en BD
[ ] Login admin + panel con CRUD
[ ] Asistente de IA conectado al catálogo real
[ ] Responsive probado en celular real
[ ] Estados de carga en todas las vistas
[ ] Mensajes de error claros
[ ] 2-3 animaciones
[ ] Frontend y backend en carpetas separadas
[ ] Comentarios que expliquen decisiones técnicas
[ ] .env NO está en el repositorio
[ ] README completo
```

---

## 9. Recordatorios

- **Commitea seguido.** 15 commits hechos el último día se notan en el historial. Uno por tarea terminada.
- **Mensajes de commit claros:** `feat: catálogo con filtro por dificultad` en vez de `cambios`.
- **Probar en celular real**, no solo redimensionando el navegador.
- **Despertar Render** 2 minutos antes de la defensa.
- **Pedir ayuda a tiempo.** La diapositiva de mentoría lo dice: preguntas por WhatsApp etiquetando al mentor. Trabarse tres días en algo que se resuelve en diez minutos es la forma más común de no terminar.
