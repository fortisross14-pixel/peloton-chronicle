import { access, cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(resolve(root, 'src'), resolve(dist, 'src'), { recursive: true });
try {
  await access(resolve(root, 'public'));
  await cp(resolve(root, 'public'), dist, { recursive: true });
} catch {
  // Public assets are optional.
}
const fallbackHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#702c2c" />
  <meta name="description" content="A living chronicle of professional road cycling." />
  <title>Peloton Chronicle</title>
  <link rel="stylesheet" href="./src/styles.css" />
</head>
<body>
  <div id="imperative-app"><div class="loading">Opening the cycling archive…</div></div>
  <script type="module" src="./src/app.js"></script>
</body>
</html>`;
await writeFile(resolve(dist, 'index.html'), fallbackHtml);
await writeFile(resolve(dist, '.nojekyll'), '');
console.log('Static fallback build created in dist/.');
