(function () {
    const links = document.querySelectorAll('.lang-switch [data-lang]');
    if (!links.length) return;

    const isEn = location.pathname.startsWith('/en/');
    const currentPath = location.pathname.replace(/^\/en/, '') || '/';

    links.forEach(a => {
        const lang = a.getAttribute('data-lang');
        a.href = lang === 'en' ? '/en' + currentPath : currentPath;
        if ((lang === 'en' && isEn) || (lang === 'fr' && !isEn)) {
            a.classList.add('active');
            a.setAttribute('aria-current', 'true');
        }
        a.addEventListener('click', () => {
            try { localStorage.setItem('prefLang', lang); } catch { }
        });
    });

    // Optional: redir auto 1ère visite selon pref navigateur
    try {
        if (!sessionStorage.getItem('langChecked')) {
            sessionStorage.setItem('langChecked', '1');
            const pref = localStorage.getItem('prefLang');
            const navLang = (navigator.language || 'fr').slice(0, 2);
            const wantEn = pref ? pref === 'en' : navLang === 'en';
            if (wantEn && !isEn) location.href = '/en' + currentPath;
        }
    } catch { }
})();
