fetch("/components/sidebar.html")
    .then(res => res.text())
    .then(data => {
        const sidebar = document.getElementById("sidebar");
        sidebar.innerHTML = data;
        sidebar.style.display = "block";
        sidebar.classList.add("visible");

        const preloader = document.getElementById("preloader");
        if (preloader) {
            preloader.classList.add("fade-out");
            setTimeout(() => {
                preloader.remove();
            }, 500);
        }
    });

// Après que sidebar.innerHTML = data;
const currentPath = window.location.pathname;

document.querySelectorAll('.nav-links a').forEach(link => {
    if (currentPath === new URL(link.href).pathname) {
        link.setAttribute('aria-current', 'page');
    }
});
