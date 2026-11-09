# 🌐 Yonagi.fr

Mon site perso — portfolio, visualiseur 3D, NAS et FFXIV. Hébergé sur **GitHub Pages**.

## Technologies

- **HTML / CSS / JavaScript** à la main, sans framework ni étape de build
- [**model-viewer**](https://modelviewer.dev/) pour afficher les fichiers GLB (rotation, zoom, plein écran, AR)

## Structure

| Chemin | Rôle |
| --- | --- |
| `index.html`, `*/index.html` | Les pages (HTML statique) |
| `assets/css/style.css` | Toute la mise en forme |
| `assets/js/site.js` | Navigation, pied de page, ciel étoilé, animations, vidéos |
| `assets/js/viewer.js` | Visualiseur GLB + liste des modèles |
| `assets/js/gallery.js` | Galerie FFXIV et visionneuse |
| `assets/3d/` | Modèles `.glb` |
| `assets/img/3d/` | Aperçus des modèles (`<id>.webp`) |
| `assets/img/ffxiv/web/` | Versions allégées des captures (les originaux restent à côté) |

## Ajouter un modèle 3D

1. Déposer le fichier dans `assets/3d/`.
2. Ajouter une entrée dans le tableau `MODELS` en haut de `assets/js/viewer.js`.
3. (Optionnel) Ajouter un aperçu `assets/img/3d/<id>.webp`.

Les modèles de plus de 10 Mo ne sont téléchargés qu'après un clic du visiteur.

## Tester en local

```bash
python -m http.server 4173
```
