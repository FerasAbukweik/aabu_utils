# Al Albayt Utils

A set of web utilities for students at **Al al-Bayt University**, built with Angular. It pulls live course-offering data from the university's registration system and wraps it in two focused tools: an interactive schedule builder and a GPA calculator.

## Features

### 📅 Weekly Schedule Builder (`/make-schedual`)
- Browse available course sections pulled live from the university's registration system (via a serverless proxy).
- Search by course name or code, with advanced filters for teacher, start time, days, credit hours, faculty (كلية), and department (قسم).
- Infinite-scroll results list for fast browsing of large course catalogs.
- Add sections to a personal weekly schedule and remove them with one click.
- Live summary of total registered credit hours and number of on-campus attendance days.

### 🎓 GPA Calculator (`/gpa-calculator`)
- Add/remove any number of courses with name, credit hours, and letter grade.
- Enter your current cumulative GPA and completed hours to calculate a running cumulative average.
- Built-in support for **repeated courses**: mark a course's previous grade and the calculator automatically applies university rules (keeping the higher of the two attempts and adjusting cumulative hours/points accordingly).
- Instant semester GPA and cumulative GPA with a status label (ضعيف / مقبول / جيد / جيد جدا / ممتاز).
- Academic tips and a one-click "clear all" reset.

## Tech Stack

- **Angular 22** (standalone components, signals, reactive forms)
- **Tailwind CSS 4** for styling
- **Vitest** for unit testing
- **Vercel** serverless function (`api/proxy.js`) to proxy requests to the university's registration backend and avoid CORS/mixed-content issues in production
- RTL (Arabic) layout by default

## Project Structure

```
src/
├── Core/               # Constants, DTOs, HTTP interceptors, and API/client services
├── Features/
│   ├── make-schedual/   # Schedule builder feature + "choose subject" modal
│   └── gpa-calculator/  # GPA calculator feature
├── Layout/              # App shell: top navbar + main layout
└── shared/              # Reusable directives (e.g. infinite-scroll visibility detector)
```

## Getting Started

### Prerequisites
- Node.js and npm
- Angular CLI (`npm i -g @angular/cli`) — optional, `npx` works too

### Installation
```bash
npm install
```

### Development server
```bash
npm start
```
Navigate to `http://localhost:4200/`. The app reloads automatically on file changes.

> In development, API calls to the university's system are routed through `proxy.conf.json`. In production (Vercel), they're routed through the `api/proxy.js` serverless function defined in `vercel.json`.

### Build
```bash
npm run build
```
Production artifacts are output to `dist/`.

### Running unit tests
```bash
npm test
```
Runs unit tests via [Vitest](https://vitest.dev/).

## Deployment

The project is configured for zero-config deployment on **Vercel**: `vercel.json` rewrites `/api/*` to the serverless proxy and everything else to `index.html` for client-side routing.

## Additional Resources

For more on the Angular CLI, see the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli).
