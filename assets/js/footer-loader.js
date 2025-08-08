(async () => {
    const mount = document.getElementById('footer');
    if (!mount) return;
    try {
        const res = await fetch('/assets/html/footer.html', { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Footer fetch failed: ${res.status}`);
        const html = await res.text();

        if (html.includes('<!DOCTYPE html') || html.match(/<title>.*404/i)) {
            console.warn('Footer looks like a full page/404, aborting inject.');
            return;
        }
        mount.innerHTML = html;
    } catch (e) {
        console.error(e);
    }
})();
