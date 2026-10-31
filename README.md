# DayFlow — Old Money Edition v2

Mobile-first PWA prototype inspired by the approved DayFlow visual concept.

## Run locally
Open `index.html` in a modern browser for a basic preview. For service-worker/offline testing, run through a local HTTP server or deploy to GitHub Pages.

## Publish free on GitHub Pages
1. Create a GitHub repository, e.g. `dayflow`.
2. Upload all files in this folder to the repository root.
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**, branch `main`, folder `/ (root)`, then Save.
5. Wait for deployment and open the provided HTTPS address on your phone.
6. Use the browser's **Add to Home Screen / Install** option.

## Current prototype
- Responsive mobile-first design in warm ivory, deep forest green, olive and antique gold.
- Home dashboard, calendar month/day/week agenda, tasks, clients, projects and settings.
- Add tasks, events, clients and projects.
- Local persistence with `localStorage`; export/import JSON backup.
- Basic service worker cache for offline app shell.

## Important limitations
- This is a working prototype, not a finished native iOS/Android app.
- Data is stored separately in each browser/device. There is no cloud sync or shared account.
- Reminder selection is stored with tasks, but system notifications are not yet scheduled.
- Test the installed PWA on the actual target phones before relying on it.
