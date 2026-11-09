# 🌐 Yonagi.fr

My personal website — 3D model viewer and projects. Hosted on **GitHub Pages**.

## Tech

- Hand-written **HTML / CSS / JavaScript**, no framework and no build step
- [**model-viewer**](https://modelviewer.dev/) to display GLB files (rotate, zoom, fullscreen, AR)

## Structure

| Path | Role |
| --- | --- |
| `index.html`, `*/index.html` | The pages (static HTML) |
| `assets/css/style.css` | All the styling |
| `assets/js/site.js` | Navigation, footer, starry sky, animations, videos |
| `assets/js/viewer.js` | GLB viewer + list of models |
| `assets/3d/` | `.glb` models |
| `assets/img/3d/` | Model previews (`<id>.webp`) |

## Adding a 3D model

1. Drop the file into `assets/3d/`.
2. Add an entry to the `MODELS` array at the top of `assets/js/viewer.js`.
3. (Optional) Add a preview at `assets/img/3d/<id>.webp`.

Models over 10 MB are only downloaded after the visitor clicks.

## Testing locally

```bash
python -m http.server 4173
```
