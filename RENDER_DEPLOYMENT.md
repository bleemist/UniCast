# UniCast ("Your Campus Pulse") — Render Deployment Guide

UniCast is **100% ready for deployment on [Render](https://render.com)**.

You have two fast, production-ready deployment options on Render:

---

## Option 1: 1-Click Blueprint (Recommended: Web Service + Render PostgreSQL)

Render natively reads the included [`render.yaml`](./render.yaml) file, automatically spinning up the web app and managed database with zero manual configuration.

### Steps:
1. Push your repository to **GitHub** or **GitLab**.
2. Go to your **[Render Dashboard](https://dashboard.render.com)**.
3. Click **New +** → **Blueprint**.
4. Select your UniCast repository.
5. Render will detect `render.yaml` and show:
   - **Web Service**: `unicast` (Node.js runtime, build command, start command, environment variables)
   - **PostgreSQL Database**: `unicast-db` (auto-linked via `DATABASE_URL`)
6. Click **Apply**.
7. Render will automatically:
   - Provision your PostgreSQL database.
   - Install dependencies.
   - Push database schema and seed 15 universities, shows, and admin users.
   - Build Next.js production bundle.
   - Deploy live with free automatic SSL (`https://unicast-radio.onrender.com`).

---

## Option 2: Manual Web Service Deployment

If you prefer to configure the Web Service manually in the Render UI:

### Step 1: Create a PostgreSQL Database on Render
1. In Render, click **New +** → **PostgreSQL**.
2. Name: `unicast-db`
3. Database: `unicast`
4. User: `unicast_admin`
5. Region: **Frankfurt** (low latency to Uganda/East Africa)
6. Plan: **Free** or **Starter**.
7. Click **Create Database** and copy the **Internal Database URL**.

### Step 2: Create the Web Service
1. Click **New +** → **Web Service**.
2. Connect your UniCast repository.
3. Settings:
   - **Name**: `unicast`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && node scripts/switch-db.mjs postgresql && npx prisma db push && node scripts/seed.mjs && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Plan**: Free or Starter

### Step 3: Add Environment Variables in Render
Add these under the **Environment** tab:

| Variable | Value |
| :--- | :--- |
| `NODE_VERSION` | `20.17.0` |
| `DATABASE_URL` | *(Paste Internal Database URL from Step 1)* |
| `JWT_SECRET` | *(Click "Generate" or use a 48+ char secret)* |
| `NEXT_PUBLIC_RADIO_STREAM_URL` | `https://stream.zeno.fm/f3wvbbqmdg8uv` *(or your Icecast mount)* |
| `NEXT_PUBLIC_STREAM_URL` | `https://stream.zeno.fm/f3wvbbqmdg8uv` |
| `NEXT_PUBLIC_STATION_NAME` | `UniCast` |
| `NEXT_PUBLIC_STATION_TAGLINE` | `Your Campus Pulse` |
| `TZ` | `Africa/Kampala` |

Click **Create Web Service**. Render will build and deploy UniCast!

---

## Option 3: Low-Cost SQLite with a Persistent Disk

If you prefer zero external databases and want to use SQLite with Render:
1. Create a Web Service with:
   - **Build Command**: `npm install && npx prisma db push && node scripts/seed.mjs && npm run build`
   - **Start Command**: `npm start`
2. Under **Disks**, click **Add Disk**:
   - **Name**: `unicast-storage`
   - **Mount Path**: `/var/data`
   - **Size**: 1 GB
3. In Environment Variables, set:
   - `DATABASE_URL`: `file:/var/data/unicast.db`

---

## Post-Deployment Verification
Once deployed:
1. Open your Render URL (e.g. `https://unicast.onrender.com`).
2. Confirm the university prompt appears (select Kyambogo, Makerere, or Skip).
3. Click **Listen Live** and confirm the audio stream plays.
4. Navigate to `/schedule`, `/programmes`, `/news`, `/requests`.
5. Log into the studio desk at `/admin/login` using:
   - Email: `admin@unicast.radio`
   - Password: `Admin@Kyambogo107`
6. View real-time active listener metrics, request queue, and audit logs.
