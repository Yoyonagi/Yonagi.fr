fetch("/components/footer.html")
    .then(res => res.text())
    .then(data => {
        const footer = document.getElementById("footer");
        footer.innerHTML = data;
        footer.style.display = "block";
    });
window.addEventListener("load", () => {
    document.body.classList.add("ready");
    document.body.style.visibility = "visible";
});
