# Deploying StallPulse to Vercel

The Next.js app lives in the **`web/`** folder. Vercel must use `web` as the Root Directory.

## Fresh deploy (start over)

If you got **404 NOT_FOUND** or a blank **Application Preset**, follow these steps exactly:

### 1. Delete the old Vercel project

1. [Vercel Dashboard](https://vercel.com/dashboard) → open the broken project
2. **Settings** → **General** → scroll to **Delete Project**

### 2. Pull the latest code

The repo must **not** have a `vercel.json` at the repository root (that file breaks framework detection). It should only have `web/vercel.json`.

```bash
git pull origin main
```

### 3. Import again

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import **`yerenmao/Bitcoin-FinalProject`**
3. **Before clicking Deploy**, set Root Directory:
   - Click **Edit** next to Root Directory
   - Type `web` and confirm
   - Wait 2–3 seconds — **Framework Preset** should change to **Next.js**
4. Leave Build Command / Output Directory as defaults
5. Click **Deploy**

### Why Application Preset was blank

Vercel couldn't detect Next.js because:

1. **Root Directory was wrong initially** — the repo root has Python scripts, not a Next.js app
2. **A legacy root `vercel.json` existed** — the old `"version": 2, "builds": [...]` config overrides auto-detection and locks Framework Preset to blank / Other

With Root Directory = `web` and no root `vercel.json`, Vercel reads `web/package.json` (which includes `next`) and selects **Next.js** automatically.

> **If Framework Preset stays blank:** deploy anyway — as long as Root Directory is `web`, the build still works. You can also set it manually later under **Settings → General → Framework Preset → Next.js**.

## Settings reference

| Setting | Value |
|---------|-------|
| Root Directory | `web` |
| Framework Preset | Next.js |
| Build Command | `npm run build` (default) |
| Output Directory | *(leave empty — Vercel sets this for Next.js)* |
| Install Command | `npm install` (default) |
| Node.js Version | 20.x |

No environment variables are required. The app reads `public/data/location_scores.json`.

## Deploy via CLI (alternative)

```bash
cd web
npm install
npx vercel --prod
```

Run commands from inside `web/`, not the repo root.

## Updating location data

After re-running the pipeline locally:

```bash
python scripts/process/score_locations.py   # from repo root
git add web/public/data/location_scores.json
git commit -m "Update location scores"
git push
```

Vercel redeploys automatically on push.

## Verify

- Dashboard: `https://<project>.vercel.app/`
- About: `https://<project>.vercel.app/about`
- API: `https://<project>.vercel.app/api/locations`

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 404 NOT_FOUND (plain Vercel page) | Root Directory must be `web`, not `.` |
| Blank Application Preset | Remove root `vercel.json`; set Root Directory to `web` first |
| Build fails | Set Node.js to 20.x in Project Settings |
| Empty dashboard | Ensure `web/public/data/location_scores.json` exists in the repo |
