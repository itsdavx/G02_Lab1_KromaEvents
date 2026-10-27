# Despliegue en Render + Neon · Paso 4 del Lab 3

Railway tenía desactivado el registro de cuentas nuevas, así que, como permite la sección 3 del enunciado («Se acepta Render + Neon con la misma colección y la URL pública en el README»), la API se despliega así:

- **Render** ejecuta la API (Web Service) a partir del repositorio de GitHub.
- **Neon** aloja la base PostgreSQL 17.

> **Costo:** los dos servicios tienen plan gratuito sin tarjeta. En Render, el servicio gratuito se **suspende tras unos 15 minutos sin tráfico** y la primera petición siguiente tarda entre 30 y 60 segundos mientras despierta. Neon también se suspende sin uso y despierta solo. Al cerrar el parcial, **borra el servicio de Render y el proyecto de Neon**.

## 1. Antes de subir

- [x] `prisma`, `@prisma/client`, `@prisma/adapter-pg` y `pg` están en **dependencies** (Render instala en modo producción y omite las devDependencies).
- [x] `prisma.config.ts` está en el repositorio: `migrate deploy` lee de ahí la `DATABASE_URL`.
- [x] `package.json` tiene `"start": "prisma migrate deploy && node src/server.js"` y `"postinstall": "prisma generate"`.
- [x] `prisma/migrations/` está en Git (Render las aplica al arrancar, no las crea).
- [x] `.env` y cualquier `.env.*` (salvo `.env.example`) están en `.gitignore`. El puerto se lee de `process.env.PORT` (Render lo asigna).
- [x] `npm ci` en modo producción y `npm start` funcionan con una base vacía (probado: aplica las 3 migraciones y levanta la API).

## 2. Base de datos en Neon

1. Entra a https://console.neon.tech y crea el proyecto:

   | Campo | Valor |
   |---|---|
   | Project name | `KromaEvents` |
   | Region | **AWS US East 1 (N. Virginia)**, la misma zona que el servicio de Render |
   | Database name | `kromaevents` |
   | Postgres version | `17` |
   | Resto de servicios (Storage, Functions, Auth…) | desactivados |

2. No uses el «quickstart prompt». En el dashboard pulsa **Connect**:
   - **Connection pooling: desactivado** (conexión directa; el host **no** debe tener `-pooler`).
   - Copia la cadena con **Copy snippet**. Tiene esta forma:

     ```
     postgresql://kromaevents_owner:<clave>@ep-xxxx.us-east-1.aws.neon.tech/kromaevents?sslmode=require&channel_binding=require
     ```

3. Guárdala en un archivo **`.env.neon`** en la raíz del proyecto (está en `.gitignore`, nunca se sube):

   ```
   DATABASE_URL="postgresql://kromaevents_owner:<clave>@ep-xxxx.us-east-1.aws.neon.tech/kromaevents?sslmode=require&channel_binding=require"
   ```

## 3. Migraciones y seed en Neon (desde tu máquina)

Crea las tablas y carga los datos de prueba (incluido el usuario ADMIN):

```bash
set -a; . ./.env.neon; set +a; npx prisma migrate deploy && npx prisma db seed   # Git Bash
```

En PowerShell:

```powershell
$env:DATABASE_URL = (Get-Content .env.neon | Select-String '^DATABASE_URL=').Line.Split('=',2)[1].Trim('"'); npx prisma migrate deploy; npx prisma db seed; Remove-Item Env:DATABASE_URL
```

`dotenv` no sobrescribe una variable que ya existe, por eso estos comandos usan Neon aunque tengas un `.env` local apuntando a Docker. Debes ver `All migrations have been successfully applied` y `Seed completado: 3 eventos, 2 clientes, 3 usuarios y 3 reservas`.

> El seed **borra** los datos de la base a la que apunta. Ejecútalo contra Neon solo para dejar los datos iniciales, no durante la calificación.

## 4. Web Service en Render

1. Entra a https://dashboard.render.com con tu cuenta de GitHub.
2. **New → Web Service → Git Provider → GitHub** y elige el repositorio del grupo (si no aparece, *Configure GitHub* y dale acceso).
3. Completa el formulario:

   | Campo | Valor |
   |---|---|
   | Name | `kromaevents-api` (la URL será `https://kromaevents-api.onrender.com` si el nombre está libre) |
   | Project | opcional |
   | Language | `Node` |
   | Branch | la rama que tiene el Paso 4 (por ejemplo `main`) |
   | Region | **Virginia (US East)** |
   | Root Directory | vacío (el `package.json` está en la raíz del repositorio) |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | **Free** |

4. En **Environment Variables** agrega:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | la cadena **directa** de Neon (la misma de `.env.neon`, sin comillas) |
   | `JWT_SECRET` | una frase larga y aleatoria, **distinta** a la de tu `.env` |
   | `JWT_EXPIRES_IN` | `4h` |
   | `NODE_ENV` | `production` |

   No definas `PORT`: Render la asigna. Para generar un `JWT_SECRET` nuevo:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```

5. En **Advanced → Health Check Path** escribe `/`.
6. Pulsa **Deploy Web Service**. En **Logs** debes ver, en este orden:
   - `added … packages` y `Generated Prisma Client` (build)
   - `All migrations have been successfully applied` o `No pending migrations to apply` (start)
   - `Servidor ejecutándose en http://localhost:10000 · PostgreSQL conectado` (el texto dice `localhost` porque así está el mensaje; Render lo publica en su URL)
   - `Your service is live`

Cada `push` a la rama elegida vuelve a desplegar automáticamente y, al arrancar, `npm start` aplica las migraciones nuevas.

## 5. Probar en la nube

1. Abre `https://kromaevents-api.onrender.com/` en el navegador y espera a que responda `{"api":"Lab 3 · KromaEvents API","estado":"ok"}` (despierta el servicio).
2. En Postman importa la colección `postman/G02_Lab3.postman_collection.json` y los entornos `postman/G02_Lab3_Local.postman_environment.json` y `postman/G02_Lab3_Render.postman_environment.json`. Si Render te asignó otra URL, corrige `baseUrl` en el entorno **G02_Lab3 · Render**.
3. Con el entorno **G02_Lab3 · Local** y la API local levantada (`npm run dev`), ejecuta **Run collection**. Captura: `evidencias/postman-local.png`.
4. Con el entorno **G02_Lab3 · Render**, ejecuta **Run collection**. Captura: `evidencias/render-run.png`.

La colección se puede ejecutar varias veces seguidas: cada corrida registra un usuario y un evento nuevos. Solo necesita que el seed se haya cargado una vez (usa el ADMIN).

## Problemas frecuentes

| Síntoma en los logs | Causa y solución |
|---|---|
| `prisma: not found` | Prisma quedó en devDependencies: debe estar en dependencies. |
| `P1001: Can't reach database server` | `DATABASE_URL` mal copiada, con comillas o con espacios. Vuelve a copiarla desde Neon (*Connect*, pooling desactivado). |
| `P1012 … DATABASE_URL` | Falta la variable `DATABASE_URL` en Render. |
| `Falta la variable JWT_SECRET` | Agrega `JWT_SECRET` en Environment Variables. |
| `P3009 migrate found failed migrations` | Una migración falló a medias en Neon. Revisa el error, corrígelo y ejecuta `npx prisma migrate resolve --rolled-back <migración>` contra Neon. |
| El login del ADMIN responde 401 | No se cargó el seed en Neon (sección 3). |
| La primera petición tarda casi un minuto | El plan gratuito suspendió el servicio; es normal. Abre la URL antes de ejecutar la colección. |
| `Port scan timeout` | La API no escucha en `process.env.PORT`; revisa que no se haya definido `PORT` a mano en Render. |
