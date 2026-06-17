# StallPulse Web App

Next.js dashboard and API for hawker centre location viability scores.

## Live deployment

**https://bitcoin-final-project.vercel.app/**

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API

- `GET /api/locations` — list all scored locations
- `GET /api/locations?area=Rochor&min_score=70` — filter by area and score

Full deployment guide: [../VERCEL.md](../VERCEL.md)
