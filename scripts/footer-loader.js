fetch("/components/footer.html")
    .then(res => res.text())
    .then(data => {
        const footer = document.getElementById("footer");
        footer.innerHTML = data;
        footer.style.display = "block";
    });