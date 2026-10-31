# DayFlow — Old Money Edition v0.3

Mobile-first installable PWA for personal and professional organization.

## Run locally
Open `index.html` in a modern browser for a basic preview. For service-worker/offline testing, run through a local HTTP server or deploy to GitHub Pages.

## Publish/update on GitHub Pages
1. Extract this ZIP on your computer.
2. Copy the files inside the `DayFlow` folder into your existing local `dayflow` repository, replacing the older files.
3. Open GitHub Desktop. Review the changed files, enter a commit summary such as `Update DayFlow profile and themes`, then commit to `main`.
4. Click **Push origin** to upload the update to GitHub.
5. GitHub Pages will deploy the new version from `main` and `/(root)`.
6. Reopen the site on your phone. If the old version remains visible, close the app/browser tab completely and reopen it so the v3 service-worker cache can update.

## What's new in v0.3
- Personal profile settings: display name, role, email, short bio and profile photo.
- Profile photo is resized locally before saving to reduce storage use.
- Four color palettes: Cypress & Antique Gold, Olive & Linen, Burgundy & Champagne, Midnight Navy.
- Dedicated Clients tab removed. A client field is available when creating a task, activity/event or project; previously used client names appear as suggestions.
- Built-in sample/demo entries are removed on first v0.3 launch while user-created entries are preserved.
- Projects are now directly available in the bottom navigation.
- Export/import backup includes profile details and photo.

## Data and privacy
- Data is stored in the local browser/device using `localStorage`; there is no account system or cloud synchronization.
- Profile information and photo are not uploaded to GitHub or a server; they remain in that browser's local storage unless exported by the user.
- Each phone/browser has its own data. The user must export/import a backup to move data between devices.
- This is an installable PWA prototype, not a native App Store / Google Play app.
- Reminder selections are saved, but scheduled operating-system notifications are not implemented yet.
