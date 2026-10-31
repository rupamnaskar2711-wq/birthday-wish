# BirthdayVerse

A multi-user birthday room website served by an Express server.

## Run locally

```bash
npm install
npm start
```

Then open `http://localhost:3000`. The server uses `PORT` when provided and
defaults to port `3000`.

Do not commit local `.env` files or dependencies (`node_modules`).

## Deploy on Render

The `render.yaml` Blueprint config creates a free Node web service from the
`rupamnaskar2711-wq-birthday-verse-preview` branch. In Render, create a new
Blueprint and connect this repository; Render will build with `npm ci` and
start the app with `npm start`.