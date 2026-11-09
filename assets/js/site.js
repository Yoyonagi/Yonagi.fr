/* Yonagi.fr — éléments communs : navigation, pied de page, ciel étoilé, animations. */
(() => {
    const LINKS = [
        ['/', 'Accueil'],
        ['/portfolio/', 'Portfolio'],
        ['/model-viewer/', 'Visualiseur 3D'],
        ['/moule/', 'Moule'],
        ['/nas/', 'NAS'],
        ['/ffxiv/', 'FFXIV'],
        ['/about/', 'À propos'],
    ];
    const SOCIALS = [
        ['https://github.com/Yoyonagi', 'GitHub'],
        ['https://x.com/_Yonagi', 'X'],
        ['https://www.youtube.com/@KC-Yonagi', 'YouTube'],
        ['https://www.twitch.tv/yoyonagii', 'Twitch'],
    ];

    const path = location.pathname.replace(/index\.html$/, '');
    const isCurrent = (href) => (href === '/' ? path === '/' : path.startsWith(href));
    const linkHtml = ([href, label]) =>
        `<a href="${href}"${isCurrent(href) ? ' aria-current="page"' : ''}>${label}</a>`;
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Navigation ---------- */
    const nav = document.createElement('header');
    nav.className = 'nav';
    nav.innerHTML = `
        <a class="nav__brand" href="/" aria-label="Yonagi — accueil">
            <img src="/assets/img/logo/avatar-256.webp" alt="" width="38" height="38">
            <span>Yonagi<i aria-hidden="true">夜凪</i></span>
        </a>
        <nav class="nav__links" aria-label="Navigation principale">${LINKS.map(linkHtml).join('')}</nav>
        <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="menu">
            <span aria-hidden="true"></span><b>Menu</b>
        </button>`;

    const menu = document.createElement('div');
    menu.className = 'menu';
    menu.id = 'menu';
    menu.setAttribute('aria-hidden', 'true');
    menu.inert = true;
    menu.innerHTML = `
        <nav aria-label="Menu"><ol>${LINKS.map((l, i) => `<li style="--i:${i}">${linkHtml(l)}</li>`).join('')}</ol></nav>
        <div class="menu__foot">${SOCIALS.map(([h, l]) => `<a href="${h}" target="_blank" rel="noopener">${l} ↗</a>`).join('')}</div>`;

    document.body.prepend(nav, menu);

    const toggle = nav.querySelector('.nav__toggle');
    const setMenu = (open) => {
        menu.classList.toggle('is-open', open);
        menu.inert = !open;
        menu.setAttribute('aria-hidden', String(!open));
        toggle.setAttribute('aria-expanded', String(open));
        toggle.querySelector('b').textContent = open ? 'Fermer' : 'Menu';
        document.documentElement.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
    addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));
    matchMedia('(min-width: 1040px)').addEventListener('change', () => setMenu(false));

    const onScroll = () => nav.classList.toggle('is-stuck', scrollY > 12);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Pied de page ---------- */
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
        <div class="wrap">
            <div class="footer__grid">
                <div>
                    <p class="eyebrow">Un mot à me dire ?</p>
                    <a class="footer__big" href="mailto:contact@yonagi.fr">contact<em class="grad">@yonagi.fr</em></a>
                </div>
                <nav aria-label="Réseaux">
                    ${SOCIALS.map(([h, l]) => `<a href="${h}" target="_blank" rel="noopener">${l} ↗</a>`).join('')}
                    <a href="https://www.reddit.com/user/Yonagi-Kei/" target="_blank" rel="noopener">Reddit ↗</a>
                    <a href="https://github.com/Yoyonagi/Yonagi.fr" target="_blank" rel="noopener">Code source ↗</a>
                </nav>
            </div>
            <div class="footer__note">
                <span>© ${new Date().getFullYear()} Yonagi — Tous droits réservés</span>
                <span>Fait avec ❤️ et un peu de ☕ — propulsé par GitHub Pages 🏳️‍⚧️</span>
            </div>
        </div>
        <div class="footer__kanji" aria-hidden="true">夜凪</div>`;
    document.body.append(footer);

    /* ---------- Apparitions au défilement ---------- */
    const revealEls = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window && !reduceMotion) {
        const io = new IntersectionObserver((entries) => {
            for (const e of entries) {
                if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
            }
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
        revealEls.forEach((el) => io.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('in'));
    }

    /* ---------- Halo qui suit le pointeur sur les cartes ---------- */
    if (matchMedia('(hover: hover)').matches) {
        document.addEventListener('pointermove', (e) => {
            const card = e.target.closest?.('.card');
            if (!card) return;
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
        }, { passive: true });
    }

    /* ---------- Vidéos YouTube : chargées seulement au clic ---------- */
    document.querySelectorAll('.yt[data-yt]').forEach((btn) => {
        const id = btn.dataset.yt;
        const title = btn.dataset.title || 'Vidéo YouTube';
        btn.innerHTML = `<img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy" decoding="async"><span>▶ ${title}</span>`;
        btn.setAttribute('aria-label', `Lire la vidéo : ${title}`);
        btn.addEventListener('click', () => {
            const frame = document.createElement('div');
            frame.className = 'yt is-playing';
            frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="${title}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
            btn.replaceWith(frame);
        }, { once: true });
    });

    /* ---------- Ciel étoilé ---------- */
    const sky = document.createElement('canvas');
    sky.id = 'sky';
    sky.setAttribute('aria-hidden', 'true');
    document.body.prepend(sky);
    const ctx = sky.getContext('2d');
    let stars = [], W = 0, H = 0, raf = 0, shooting = null, lastW = 0;

    const seed = () => {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        W = innerWidth; H = innerHeight;
        sky.width = W * dpr; sky.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.round(Math.min(170, (W * H) / 9000));
        const tints = ['255,255,255', '143,216,255', '255,170,220', '200,185,255'];
        stars = Array.from({ length: count }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() ** 3 * 1.5 + 0.3,
            a: Math.random() * 0.6 + 0.2,
            s: Math.random() * 0.9 + 0.2,
            p: Math.random() * Math.PI * 2,
            c: tints[(Math.random() * tints.length) | 0],
        }));
    };

    const draw = (t) => {
        ctx.clearRect(0, 0, W, H);
        const drift = scrollY * 0.04;
        for (const s of stars) {
            const tw = reduceMotion ? 1 : 0.6 + 0.4 * Math.sin(t * 0.001 * s.s + s.p);
            const y = (((s.y - drift * s.r) % H) + H) % H;
            ctx.fillStyle = `rgba(${s.c},${s.a * tw})`;
            ctx.beginPath();
            ctx.arc(s.x, y, s.r, 0, 6.2832);
            ctx.fill();
        }
        if (shooting) {
            const k = (t - shooting.t0) / 900;
            if (k >= 1) shooting = null;
            else {
                const x = shooting.x + shooting.dx * k, y = shooting.y + shooting.dy * k;
                const g = ctx.createLinearGradient(x, y, x - shooting.dx * 0.22, y - shooting.dy * 0.22);
                g.addColorStop(0, `rgba(255,255,255,${0.9 * (1 - k)})`);
                g.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.strokeStyle = g; ctx.lineWidth = 1.4;
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - shooting.dx * 0.22, y - shooting.dy * 0.22); ctx.stroke();
            }
        } else if (!reduceMotion && Math.random() < 0.0018) {
            shooting = { t0: t, x: Math.random() * W * 0.8, y: Math.random() * H * 0.35, dx: 320 + Math.random() * 260, dy: 130 + Math.random() * 120 };
        }
        if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    const start = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
    seed(); lastW = innerWidth; start();
    addEventListener('resize', () => {
        // Sur mobile, la barre d'adresse change la hauteur en permanence : on ne régénère que si la largeur change.
        if (innerWidth !== lastW || innerHeight > H) { lastW = innerWidth; seed(); if (reduceMotion) start(); }
    });
    document.addEventListener('visibilitychange', () => (document.hidden ? cancelAnimationFrame(raf) : start()));
})();
