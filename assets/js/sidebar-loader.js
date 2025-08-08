(async () => {
    const mount = document.getElementById('sidebar');
    if (!mount) return;
    try {
        const res = await fetch('/assets/html/sidebar.html', { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Sidebar fetch failed: ${res.status}`);
        const html = await res.text();

        // Garde-fou: n'injecte pas une page complète/404
        if (html.includes('<!DOCTYPE html') || html.match(/<title>.*404/i)) {
            console.warn('Sidebar looks like a full page/404, aborting inject.');
            return;
        }
        mount.innerHTML = html;
    } catch (e) {
        console.error(e);
    }
})();
