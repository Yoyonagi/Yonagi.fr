// Chargement de la sidebar
fetch("/components/sidebar.html")
    .then(res => res.text())
    .then(data => {
        const sidebar = document.getElementById("sidebar");
        sidebar.innerHTML = data;
        sidebar.style.display = "block";
        sidebar.classList.add("visible");

        // Détection du lien actif intelligent (supporte /index.html ou /)
        const currentPath = window.location.pathname.replace(/index\.html$/, "");

        document.querySelectorAll(".nav-links a").forEach(link => {
            const linkPath = new URL(link.href).pathname.replace(/index\.html$/, "");

            if (currentPath === linkPath) {
                link.setAttribute("aria-current", "page");
            }
        });

        // Suppression du loader une fois la sidebar prête
        const preloader = document.getElementById("preloader");
        if (preloader) {
            preloader.classList.add("fade-out");
            setTimeout(() => {
                preloader.remove();
            }, 500);
        }
        // Ajout dynamique de la classe si hover
        sidebar.addEventListener("mouseenter", () => {
            document.body.classList.add("sidebar-expanded");
        });
        sidebar.addEventListener("mouseleave", () => {
            document.body.classList.remove("sidebar-expanded");
        });
    });
