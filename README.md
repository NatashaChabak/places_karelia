# Places App

React frontend for browsing and managing places on an interactive map. Built for the Karelia AMK Distributed Systems / web course (DM_2026 day 3).

## Features

- Show places in a **list** and on a **Leaflet map**
- Clicking a list item highlights the marker (and opens its popup); clicking a marker selects the list item
- **Register / login** against the Places API; JWT stored in `localStorage`
- **Add**, **edit**, and **delete** places (requires a valid token; only own places)
- Map click fills coordinates when adding a place
- List and markers limited to places that **fit the current map view**
- Responsive layout with **Bootstrap / react-bootstrap**

## Tech stack

- React + TypeScript + Vite
- react-leaflet / Leaflet
- Bootstrap + react-bootstrap

## Requirements

- Node.js
- Places API backend running (e.g. `C:\KareliaAMK\DM_2026\final` on port 3000)
- MySQL/MariaDB with the `placesapp` database (for the backend)

## Setup

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_SERVER_URL=http://localhost:3000
```

## Run

Start the backend first, then:

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start Vite dev server    |
| `npm run build`| Typecheck + production build |
| `npm run lint` | Run ESLint               |
| `npm run preview` | Preview production build |

## API used

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/places` | No | List places |
| POST | `/api/places` | JWT | Create place |
| PUT | `/api/places/:id` | JWT | Update own place |
| DELETE | `/api/places/:id` | JWT | Delete own place |
| POST | `/api/users` | No | Register |
| POST | `/api/login` | No | Login (returns `Token`) |
