/* Yonagi.fr — galerie + visionneuse plein écran (clavier, balayage tactile). */
(() => {
    const shots = [...document.querySelectorAll('.shot[data-full]')];
    if (!shots.length) return;

    const box = document.createElement('dialog');
    box.className = 'lightbox';
    box.setAttribute('aria-label', 'Visionneuse');
    box.innerHTML = `
        <div class="lightbox__top">
            <span class="lightbox__count"></span>
            <button class="round" type="button" data-act="close" aria-label="Fermer">✕</button>
        </div>
        <div class="lightbox__img"><img alt=""></div>
        <div class="lightbox__bottom">
            <button class="round" type="button" data-act="prev" aria-label="Image précédente">←</button>
            <span class="lightbox__cap"></span>
            <button class="round" type="button" data-act="next" aria-label="Image suivante">→</button>
        </div>`;
    document.body.append(box);

    const img = box.querySelector('img');
    const cap = box.querySelector('.lightbox__cap');
    const count = box.querySelector('.lightbox__count');
    let i = 0;

    const go = (n) => {
        i = (n + shots.length) % shots.length;
        const s = shots[i];
        img.src = s.dataset.full;
        img.alt = s.dataset.title || '';
        cap.textContent = s.dataset.title || '';
        count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(shots.length).padStart(2, '0')}`;
        // Précharge la suivante pour un balayage fluide.
        new Image().src = shots[(i + 1) % shots.length].dataset.full;
    };

    shots.forEach((s, n) => s.addEventListener('click', () => { go(n); box.showModal(); }));

    box.addEventListener('click', (e) => {
        const act = e.target.closest('[data-act]')?.dataset.act;
        if (act === 'close' || e.target === box || e.target.classList.contains('lightbox__img')) box.close();
        else if (act === 'prev') go(i - 1);
        else if (act === 'next') go(i + 1);
    });
    box.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') go(i - 1);
        if (e.key === 'ArrowRight') go(i + 1);
    });
    box.addEventListener('close', () => shots[i]?.focus());

    // Balayage horizontal au doigt.
    let x0 = null, y0 = null;
    box.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; } else x0 = null;
    }, { passive: true });
    box.addEventListener('touchend', (e) => {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0;
        const dy = e.changedTouches[0].clientY - y0;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(i + (dx < 0 ? 1 : -1));
        x0 = null;
    }, { passive: true });
})();
