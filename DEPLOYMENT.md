# Deployment checklist

## Local verification

```bash
npm install
npm test
npm run build
npm run preview
```

Open the preview URL and verify that a new universe can be created, four weeks can be simulated, U23 filtering works, and the browser can reopen the same save.

## GitHub Pages

```bash
git init
git add .
git commit -m "Peloton Chronicle v0.2"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

Then select **GitHub Actions** in **Repository Settings → Pages**. The included workflow handles subsequent deployments.

## Netlify

1. Import the GitHub repository.
2. Set build command to `npm run build`.
3. Set publish directory to `dist`.
4. Deploy.

## Cloudflare Pages

1. Connect the repository.
2. Select the Vite framework preset.
3. Use `npm run build` and output directory `dist`.
4. Set Node.js to version 22 if the platform does not detect it automatically.

## Data note

No SQL setup is needed for v0.2. IndexedDB is created automatically on first use. Clearing browser site data deletes local universes, so use **Save & Settings → Export JSON** for external backups.
