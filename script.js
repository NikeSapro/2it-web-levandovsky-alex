/* Reveal animations */
const revealEls = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("active");
        }
    });
}, { threshold: 0.2 });

revealEls.forEach(el => observer.observe(el));

/* Scroll progress bar */
window.addEventListener("scroll", () => {
    const scrollTop = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    document.getElementById("progress").style.width = (scrollTop / height) * 100 + "%";
});
