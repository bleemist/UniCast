# UniCast ("Your Campus Pulse") — Render Deployment Guide

UniCast is **100% ready for deployment on [Render](https://render.com)** with **Neon Serverless PostgreSQL**.

---

## Architecture: Neon Connection Pooling + Prisma

UniCast integrates two connection strings for optimal performance and reliable migrations:

1. **`DATABASE_URL` (Connection Pooling with PgBouncer)**:
   - Used by the Next.js runtime application and Prisma Client.
   - Handles thousands of concurrent student listeners without exhausting PostgreSQL connections.
   ```
   postgresql://neondb_owner:npg_WonT2IB4DtOx@ep-mute-band-b4jk8eze-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

2. **`DIRECT_URL` (Direct Connection without Pooler)**:
   - Used by Prisma CLI for schema management (`prisma db push`, `prisma migrate`).
   - Bypasses the connection pooler to support full DDL transactions and prepared statements.
   ```
   postgresql://neondb_owner:npg_WonT2IB4DtOx@ep-mute-band-b4jk8eze.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

---

## Option 1: 1-Click Blueprint (Recommended)

Render natively reads the included [`render.yaml`](./render.yaml) file, automatically spinning up the web app with the Neon PostgreSQL connection variables pre-configured.

### Steps:
1. Push your repository to **GitHub** or **GitLab**.
2. Go to your **[Render Dashboard](https://dashboard.render.com)**.
3. Click **New +** → **Blueprint**.
4. Select your UniCast repository.
5. Render will detect `render.yaml` and configure:
   - **Web Service**: `unicast` (Node.js runtime, build command, start command, environment variables)
   - Pre-configured `DATABASE_URL` and `DIRECT_URL`.
6. Click **Apply**.
7. Render will automatically:
   - Install dependencies.
   - Push database schema to Neon via `DIRECT_URL`.
   - Seed 15 universities, radio programmes, podcasts, and admin credentials via `DATABASE_URL`.
   - Build the Next.js production bundle.
   - Deploy live with free automatic SSL.

---

## Option 2: Manual Web Service Deployment

If you prefer to configure the Web Service manually in the Render UI:

### Step 1: Create the Web Service
1. In Render, click **New +** → **Web Service**.
2. Connect your UniCast repository.
3. Settings:
   - **Name**: `unicast`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run render:build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Plan**: Free or Starter

### Step 2: Add Environment Variables in Render
Add these under the **Environment** tab:

| Variable | Value |
| :--- | :--- |
| `NODE_VERSION` | `20.17.0` |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_WonT2IB4DtOx@ep-mute-band-b4jk8eze-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `DIRECT_URL` | `postgresql://neondb_owner:npg_WonT2IB4DtOx@ep-mute-band-b4jk8eze.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `JWT_SECRET` | *(Click "Generate" or use a 48+ char secret)* |
| `NEXT_PUBLIC_RADIO_STREAM_URL` | `https://stream.zeno.fm/f3wvbbqmdg8uv` *(or your Icecast mount)* |
| `NEXT_PUBLIC_STREAM_URL` | `https://stream.zeno.fm/f3wvbbqmdg8uv` |
| `NEXT_PUBLIC_STATION_NAME` | `UniCast` |
| `NEXT_PUBLIC_STATION_TAGLINE` | `Your Campus Pulse` |
| `TZ` | `Africa/Kampala` |

Click **Create Web Service**. Render will build and deploy UniCast!

---

## Post-Deployment Verification
Once deployed:
1. Open your live application URL.
2. Confirm the university prompt appears (select Kyambogo, Makerere, or Skip).
3. Click **Listen Live** and confirm the audio stream plays.
4. Navigate to `/schedule`, `/programmes`, `/news`, `/requests`.
5. Log into the studio desk at `/admin/login` using:
   - Email: `admin@unicast.radio`
   - Password: `Admin@Kyambogo107`
6. View real-time active listener metrics, request queue, and audit logs.
