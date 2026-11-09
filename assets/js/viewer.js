/* Yonagi.fr — visualiseur GLB.
 *
 * Utilisation dans une page :
 *   <div data-viewer data-model="moule"></div>                       → une scène, un modèle
 *   <div data-viewer data-model="moule" data-picker="#picker"></div> → scène + sélecteur de modèles
 *
 * Pour ajouter un modèle : déposer le .glb dans /assets/3d/ et ajouter une entrée ci-dessous.
 * L'aperçu (poster) est optionnel : /assets/img/3d/<id>.webp
 */
const MODELS = [
    {
        id: 'moule',
        name: 'Moule d’injection',
        file: 'Moule-projet.glb',
        size: 1.4,
        stats: ['28 640 triangles', '5 pièces'],
        orbit: '-35deg 70deg 105%',
    },
    {
        id: 'cookies',
        name: 'Machine à cookies',
        file: 'Machine-a-cookies.glb',
        size: 6.8,
        stats: ['36 708 triangles', '22 pièces'],
        orbit: '-35deg 72deg 105%',
    },
    {
        id: 'injection',
        name: 'Injection',
        file: 'Injection.glb',
        size: 37.5,
        stats: ['440 367 triangles', '55 pièces', '24 textures'],
        orbit: '-35deg 72deg 105%',
    },
    {
        id: 'technivibe',
        name: 'Technivibe',
        file: 'Technivibe.glb',
        size: 47.7,
        stats: ['679 768 triangles', '442 pièces', '46 textures'],
        orbit: '-35deg 72deg 105%',
    },
];

/** Au-delà de ce poids (Mo), on demande avant de télécharger — pensé pour la 4G. */
const AUTOLOAD_MAX_MB = 10;
const MV_URL = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';

const byId = (id) => MODELS.find((m) => m.id === id) || MODELS[0];
const fmtSize = (mb) => `${String(mb).replace('.', ',')} Mo`;
const poster = (m) => `/assets/img/3d/${m.id}.webp`;

let mvReady;
const loadModelViewer = () => (mvReady ||= import(MV_URL).then(() => customElements.whenDefined('model-viewer')));

const ICONS = {
    rotate: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/></svg>',
    tone: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>',
    reset: '<svg viewBox="0 0 24 24"><path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4"/><circle cx="12" cy="12" r="2.2"/></svg>',
    full: '<svg viewBox="0 0 24 24"><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/></svg>',
};

function mount(stage) {
    const pickerEl = stage.dataset.picker ? document.querySelector(stage.dataset.picker) : null;
    const loaded = new Set();
    let current = null;
    let mv = null;

    stage.classList.add('stage');
    stage.dataset.tone = 'dark';
    stage.innerHTML = `
        <img class="stage__poster" alt="" decoding="async">
        <div class="stage__hud">
            <span class="stage__name"></span>
            <span class="stage__stats"></span>
        </div>
        <div class="stage__gate" hidden>
            <button class="btn btn--primary" type="button"></button>
            <p>Modèle lourd : chargé seulement à ta demande.</p>
        </div>
        <div class="stage__progress" role="status" aria-live="polite"><i></i><span>0 %</span></div>
        <div class="stage__bar">
            <span class="stage__hint">Glisser pour tourner · molette ou pincement pour zoomer</span>
            <div class="stage__tools" role="toolbar" aria-label="Commandes du visualiseur">
                <button class="tool" type="button" data-act="rotate" aria-pressed="true" title="Rotation automatique" aria-label="Rotation automatique">${ICONS.rotate}</button>
                <button class="tool" type="button" data-act="tone" aria-pressed="false" title="Fond clair / sombre" aria-label="Fond clair">${ICONS.tone}</button>
                <button class="tool" type="button" data-act="reset" title="Recentrer la vue" aria-label="Recentrer la vue">${ICONS.reset}</button>
                <button class="tool" type="button" data-act="full" aria-pressed="false" title="Plein écran" aria-label="Plein écran">${ICONS.full}</button>
            </div>
        </div>`;

    const $ = (s) => stage.querySelector(s);
    const posterEl = $('.stage__poster');
    const gate = $('.stage__gate');
    const gateBtn = gate.querySelector('button');
    const progress = $('.stage__progress');
    posterEl.addEventListener('error', () => { posterEl.style.visibility = 'hidden'; });
    posterEl.addEventListener('load', () => { posterEl.style.visibility = ''; });

    async function ensureViewer() {
        if (mv) return mv;
        await loadModelViewer();
        mv = document.createElement('model-viewer');
        mv.setAttribute('camera-controls', '');
        mv.setAttribute('auto-rotate', '');
        mv.setAttribute('auto-rotate-delay', '600');
        mv.setAttribute('rotation-per-second', '18deg');
        mv.setAttribute('touch-action', 'pan-y');
        mv.setAttribute('interaction-prompt', 'none');
        mv.setAttribute('shadow-intensity', '1.1');
        mv.setAttribute('shadow-softness', '1');
        mv.setAttribute('environment-image', 'neutral');
        mv.setAttribute('exposure', '1.05');
        mv.setAttribute('ar', '');
        mv.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
        mv.innerHTML = `<div slot="progress-bar"></div>
            <button slot="ar-button" class="btn stage__ar" type="button">Voir chez moi en AR ↗</button>`;
        mv.addEventListener('progress', (e) => {
            const p = e.detail.totalProgress;
            progress.style.setProperty('--p', p);
            progress.lastElementChild.textContent = `${Math.round(p * 100)} %`;
        });
        mv.addEventListener('load', () => {
            loaded.add(current.id);
            stage.classList.remove('is-loading');
            stage.classList.add('is-ready');
        });
        mv.addEventListener('error', () => {
            stage.classList.remove('is-loading');
            const err = document.createElement('p');
            err.className = 'stage__error';
            err.textContent = 'Impossible de charger ce modèle. Vérifie ta connexion puis réessaie.';
            stage.append(err);
            setTimeout(() => err.remove(), 6000);
            gate.hidden = false;
        });
        posterEl.after(mv);
        return mv;
    }

    async function load() {
        gate.hidden = true;
        stage.classList.add('is-loading');
        stage.classList.remove('is-ready');
        progress.style.setProperty('--p', 0);
        progress.lastElementChild.textContent = '0 %';
        const target = current;
        const viewer = await ensureViewer();
        if (target !== current) return; // l'utilisateur a changé de modèle entre-temps
        viewer.setAttribute('alt', `Modèle 3D : ${target.name}`);
        viewer.setAttribute('camera-orbit', target.orbit);
        viewer.setAttribute('src', `/assets/3d/${target.file}`);
    }

    function show(id, { force = false, updateHash = false } = {}) {
        const model = byId(id);
        if (model === current) return;
        current = model;
        stage.classList.remove('is-ready', 'is-loading');
        $('.stage__name').textContent = model.name;
        $('.stage__stats').innerHTML = [fmtSize(model.size), ...model.stats].map((s) => `<span>${s}</span>`).join('<br>');
        posterEl.src = poster(model);
        gateBtn.textContent = `Charger le modèle · ${fmtSize(model.size)}`;
        if (mv) mv.removeAttribute('src');

        pickerEl?.querySelectorAll('.pick').forEach((b) => {
            const on = b.dataset.id === model.id;
            b.setAttribute('aria-pressed', String(on));
            if (on && pickerEl.scrollWidth > pickerEl.clientWidth) {
                pickerEl.scrollTo({ left: b.offsetLeft - (pickerEl.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
            }
        });
        if (updateHash) history.replaceState(null, '', `#${model.id}`);

        const saveData = navigator.connection?.saveData;
        const auto = force || loaded.has(model.id) || (model.size <= AUTOLOAD_MAX_MB && !saveData);
        if (auto) whenVisible(load);
        else gate.hidden = false;
    }

    // Ne télécharge rien tant que la scène n'approche pas de l'écran.
    let pending = null;
    const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting) && pending) { const fn = pending; pending = null; fn(); }
    }, { rootMargin: '300px' });
    io.observe(stage);
    function whenVisible(fn) {
        const r = stage.getBoundingClientRect();
        if (r.top < innerHeight + 300 && r.bottom > -300) fn();
        else pending = fn;
    }

    gateBtn.addEventListener('click', load);

    /* ----- Barre d'outils ----- */
    const setExpanded = (on) => {
        stage.classList.toggle('is-expanded', on);
        document.documentElement.style.overflow = on ? 'hidden' : '';
        $('[data-act="full"]').setAttribute('aria-pressed', String(on));
    };
    stage.addEventListener('click', (e) => {
        const btn = e.target.closest('.tool');
        if (!btn) return;
        const act = btn.dataset.act;
        if (act === 'tone') {
            const light = stage.dataset.tone !== 'light';
            stage.dataset.tone = light ? 'light' : 'dark';
            btn.setAttribute('aria-pressed', String(light));
        } else if (act === 'full') {
            if (document.fullscreenElement === stage) document.exitFullscreen();
            else if (stage.classList.contains('is-expanded')) setExpanded(false);
            else if (stage.requestFullscreen) stage.requestFullscreen().catch(() => setExpanded(true));
            else setExpanded(true); // iPhone : pas d'API plein écran, on agrandit en CSS
        } else if (mv && act === 'rotate') {
            mv.autoRotate = !mv.autoRotate;
            btn.setAttribute('aria-pressed', String(mv.autoRotate));
        } else if (mv && act === 'reset') {
            // model-viewer ignore une valeur identique : on alterne entre deux orbites quasi égales.
            const base = current.orbit;
            const alt = base.replace(/^(-?[\d.]+)deg/, (_, n) => `${Number(n) + 0.01}deg`);
            mv.cameraOrbit = mv.cameraOrbit === base ? alt : base;
            mv.cameraTarget = 'auto auto auto';
            mv.fieldOfView = 'auto';
            mv.resetTurntableRotation?.();
        }
    });
    stage.addEventListener('fullscreenchange', () => {
        $('[data-act="full"]').setAttribute('aria-pressed', String(document.fullscreenElement === stage));
    });
    addEventListener('keydown', (e) => e.key === 'Escape' && stage.classList.contains('is-expanded') && setExpanded(false));

    /* ----- Sélecteur ----- */
    if (pickerEl) {
        pickerEl.innerHTML = MODELS.map((m) => `
            <button class="pick" type="button" data-id="${m.id}" aria-pressed="false">
                <img src="${poster(m)}" alt="" loading="lazy" decoding="async" width="76" height="76">
                <span><b>${m.name}</b><small>${fmtSize(m.size)} · ${m.stats[1]}</small></span>
            </button>`).join('');
        pickerEl.addEventListener('click', (e) => {
            const b = e.target.closest('.pick');
            if (b) show(b.dataset.id, { updateHash: true });
        });
        addEventListener('hashchange', () => show(location.hash.slice(1)));
    }

    const fromHash = pickerEl && MODELS.some((m) => m.id === location.hash.slice(1)) ? location.hash.slice(1) : null;
    show(fromHash || stage.dataset.model);

    stage.viewer = { show, load, get element() { return mv; }, models: MODELS };
}

document.querySelectorAll('[data-viewer]').forEach(mount);
