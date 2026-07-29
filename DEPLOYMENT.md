# Peloton Chronicle v0.4 deployment checklist

## Local verification

```bash
npm install
npm test
npm run build
npm run preview
```

Open the preview URL and verify:

1. Create a new universe.
2. Select **WorldTour** and **Grand Tours** on Results; only Giro, Tour and Vuelta should remain.
3. Simulate several weeks and use **Go to race details & history**.
4. Open a rider from Le Grand Braquet, then use **Open full rider page**.
5. Simulate to the end of the year. Confirm the date is December 31, the season-review panel appears, and the year does not advance.
6. Review the Giro, Tour, Vuelta, rider and team results, then select **Move to next year** and confirm the new year begins with fresh results.
7. Close the browser and reopen the same save drawer.

## GitHub Pages

```bash
git init
git add .
git commit -m "Peloton Chronicle v0.4"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

Then select **GitHub Actions** under **Repository Settings → Pages**. The included workflow handles subsequent deployments.

## Netlify

1. Import the GitHub repository.
2. Set build command to `npm run build`.
3. Set publish directory to `dist`.
4. Deploy.

## Cloudflare Pages

1. Connect the repository.
2. Select the Vite framework preset.
3. Use `npm run build` and output directory `dist`.
4. Set Node.js to version 22 if it is not detected automatically.

## Manual deployment

```bash
npm run build
```

Upload everything inside `dist/` to the website root. Do not upload only `index.html`; the generated assets and bundled flags are required.

## Data note

No SQL or Neon setup is needed for v0.4. IndexedDB is created automatically on first use. Use **Save & Settings → Export JSON** before clearing browser data, changing domains or moving to another computer.
