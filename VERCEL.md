# Deploying StallPulse to Vercel

This guide walks through deploying the **Next.js web app** (`web/`) to Vercel. The Python data pipeline runs locally or on a separate scheduler (not on Vercel).

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier works)
- [Vercel CLI](https://vercel.com/docs/cli) (optional): `npm i -g vercel`
- Git repository pushed to GitHub/GitLab/Bitbucket (recommended)

## Option A: Deploy via Vercel Dashboard (recommended)

1. **Push your code** to a Git remote (GitHub, etc.).

2. **Import project** at [vercel.com/new](https://vercel.com/new).

3. **Configure root directory:**
   - Set **Root Directory** to `web`
   - Framework Preset: **Next.js** (auto-detected)

4. **Build settings** (defaults are fine):
   | Setting | Value |
   |---------|-------|
   | Build Command | `npm run build` |
   | Output Directory | `.next` |
   | Install Command | `npm install` |
   | Node.js Version | 20.x |

5. **Environment variables:** None required for the MVP. The app reads pre-processed JSON from `web/public/data/location_scores.json`.

6. Click **Deploy**. Vercel builds and hosts the app at `https://<project>.vercel.app`.

## Option B: Deploy via CLI

From the repository root:

```bash
cd web
npm install
npx vercel
```

Follow prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No (first deploy)
- **Project name?** `stallpulse` (or your choice)
- **Directory?** `./` (you are already in `web/`)

For production:

```bash
npx vercel --prod
```

## Updating data on Vercel

Vercel serves static files from `web/public/`. To refresh location scores after re-running the pipeline:

```bash
# 1. Run pipeline locally
source ../.venv/bin/activate
python ../scripts/process/score_locations.py

# 2. Commit updated JSON (optional)
git add public/data/location_scores.json
git commit -m "Update location scores"

# 3. Push → Vercel auto-redeploys
git push
```

Or copy manually before deploy:

```bash
cp ../data/processed/location_scores.json public/data/location_scores.json
```

## Custom domain (optional)

1. Vercel Dashboard → Project → **Settings** → **Domains**
2. Add your domain and follow DNS instructions

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Module not found: @/...` | Ensure `tsconfig.json` has `"paths": { "@/*": ["./src/*"] }` |
| Build fails on Node version | Set Node 20.x in Project Settings → General |
| Empty dashboard | Confirm `web/public/data/location_scores.json` exists |
| API 404 | Routes are at `/api/locations`; redeploy after adding new routes |

## Production enhancements (optional)

For a production deployment beyond the course MVP:

- **Neon PostgreSQL:** Store scores in a database instead of static JSON; add `DATABASE_URL` env var
- **Cron job:** Use Vercel Cron or GitHub Actions to run `scripts/run_pipeline.py` weekly
- **Auth:** Add Vercel Auth or Clerk for paid API tiers

## Verify deployment

After deploy, check:

- Dashboard: `https://<project>.vercel.app/`
- About page: `https://<project>.vercel.app/about`
- API: `https://<project>.vercel.app/api/locations`

Example API response:

```json
{
  "count": 25,
  "data": [
    {
      "centre_name": "Tekka Centre",
      "viability_score": 83.4,
      "tier": "Excellent",
      ...
    }
  ]
}
```
