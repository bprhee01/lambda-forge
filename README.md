# λforge

Quest-based web app for learning **functional programming in Scala**. Original lessons cover all 15 chapter-worlds in the arc of *Functional Programming in Scala* (the Red Book).

## Live

**https://lambda-forge-production.up.railway.app**

## Run locally

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm start
```

Serves `dist/` on `PORT` (default `4173`). Progress is stored in Railway
Postgres (`/api/progress/:playerId`) and cached in `localStorage`. Deployed on
Railway (`railway.toml`). Push to `main` to redeploy.

## Note

Original teaching material — not a copy of the Manning book. Support the authors with a [legal copy](https://www.manning.com/books/functional-programming-in-scala-second-edition).
