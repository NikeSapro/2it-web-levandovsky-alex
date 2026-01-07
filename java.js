// Dom Interactions
document.addEventListener('DOMContentLoaded', () => {

    // --- SAFETY CHECK: GSAP ---
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn("GSAP/ScrollTrigger missing.");
        const p = document.querySelector(".preloader");
        if (p) p.style.display = "none";
        return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // --- 1. AURA PRELOADER (Maintained) ---
    const counter = document.querySelector(".counter");
    const loaderLine = document.querySelector(".loader-line");
    const preloader = document.querySelector(".preloader");

    let loadCount = 0;
    let state = 'FAST';

    // Failsafe: Ensure site opens even if logic stalls
    setTimeout(() => {
        if (preloader && preloader.style.display !== "none") revealSite();
    }, 8000);

    const updateLoader = setInterval(() => {
        let increment = 0;
        switch (state) {
            case 'FAST':
                increment = Math.random() * 4 + 2;
                if (loadCount > 60) state = 'SLOW';
                break;
            case 'SLOW':
                increment = Math.random() * 2 + 1;
                if (loadCount > 85) state = 'CRAWL';
                break;
            case 'CRAWL':
                increment = 0.5;
                if (loadCount >= 99) {
                    loadCount = 99;
                    state = 'STALL';
                    handleStall();
                }
                break;
        }

        if (state !== 'STALL' && state !== 'DONE') {
            loadCount += increment;
        }

        if (state !== 'DONE' && loadCount > 99) loadCount = 99;

        if (counter) counter.textContent = Math.floor(loadCount) + "%";
        if (loaderLine) gsap.to(loaderLine, { scaleX: loadCount / 100, duration: 0.1, ease: "none" });

    }, 30);

    function handleStall() {
        setTimeout(() => finishLoad(), 500);
    }

    function finishLoad() {
        state = 'DONE';
        loadCount = 100;
        clearInterval(updateLoader);

        if (counter) counter.textContent = "100%";
        if (loaderLine) gsap.to(loaderLine, { scaleX: 1, duration: 0.1 });

        // Shake
        gsap.to(".loader-content", {
            x: () => Math.random() * 30 - 15,
            y: () => Math.random() * 30 - 15,
            duration: 0.04,
            repeat: 6,
            yoyo: true,
            onComplete: revealSite
        });
    }

    function revealSite() {
        if (!preloader) return;

        const tl = gsap.timeline({
            onComplete: () => {
                preloader.style.display = "none";
                document.body.style.overflow = "auto";

                // START THE OPIUM ENGINES
                initBloodFog();
                initCursorTrail();
            }
        });

        tl.to(".flash-white", { opacity: 1, duration: 0.05, ease: "power4.out" })
            .set(".loader-content", { opacity: 0 })
            .to(".gate-top", { yPercent: -100, duration: 1.5, ease: "power2.inOut" }, "+=0.1")
            .to(".gate-bottom", { yPercent: 100, duration: 1.5, ease: "power2.inOut" }, "<")
            .to(".flash-white", { opacity: 0, duration: 0.8, ease: "power2.inOut" }, "-=1.2")
            .from("body", { scale: 1.15, filter: "blur(10px) contrast(1.2)", duration: 1.5, ease: "power2.out", clearProps: "all" }, "-=1.5");
    }

    // --- 2. OPIUM OVERDOSE: BLOOD FOG (Canvas) ---
    function initBloodFog() {
        const canvas = document.getElementById('fogCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height;

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const particles = [];
        const particleCount = 50;

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 200 + 100;
                this.alpha = Math.random() * 0.05 + 0.01;
                this.color = `rgba(${Math.random() * 50 + 100}, 0, 0, ${this.alpha})`;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < -200) this.x = width + 200;
                if (this.x > width + 200) this.x = -200;
                if (this.y < -200) this.y = height + 200;
                if (this.y > height + 200) this.y = -200;
            }

            draw() {
                ctx.beginPath();
                const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                g.addColorStop(0, this.color);
                g.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = g;
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'screen';
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            ctx.globalCompositeOperation = 'source-over';
            requestAnimationFrame(animate);
        }
        animate();
    }

    // --- 3. GHOST CURSOR (GSAP Premium) ---
    function initCursorTrail() {
        const dot = document.querySelector(".cursor-dot");
        const follower = document.querySelector(".cursor-follower");

        // Safety check to prevent crash if new HTML isn't loaded yet
        if (!dot || !follower) return;

        document.body.style.cursor = 'none';
        const interactive = document.querySelectorAll("a, button, .album-item, .hero-img");

        gsap.set(dot, { xPercent: -50, yPercent: -50 });
        gsap.set(follower, { xPercent: -50, yPercent: -50 });

        let mouseX = 0;
        let mouseY = 0;

        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            gsap.to(dot, { x: mouseX, y: mouseY, duration: 0 });
            gsap.to(follower, { x: mouseX, y: mouseY, duration: 0.15 });
        });

        interactive.forEach(el => {
            el.addEventListener("mouseenter", () => {
                follower.classList.add("active");
                gsap.to(dot, { scale: 0, duration: 0.2 });
            });
            el.addEventListener("mouseleave", () => {
                follower.classList.remove("active");
                gsap.to(dot, { scale: 1, duration: 0.2 });
            });
        });
    }

    // --- 5. STANDARD SCROLL PHYSICS (Restored) ---
    const body = document.body;
    let setSkew = gsap.quickTo ? gsap.quickTo(body, "skewY", { duration: 0.5, ease: "power3.out" }) : null;

    ScrollTrigger.create({
        onUpdate: (self) => {
            const velocity = self.getVelocity();
            const targetSkew = Math.max(Math.min(velocity / 300, 7), -7);
            if (setSkew) {
                setSkew(targetSkew);
            } else {
                gsap.to(body, { skewY: targetSkew, duration: 0.5, ease: "power3.out", overwrite: true });
            }
        }
    });

    // --- PARALLAX ---
    gsap.to(".hero-img", {
        scrollTrigger: { scrub: true },
        y: -150,
        rotation: 3
    });

    document.querySelectorAll("[data-speed]").forEach(el => {
        const speed = el.getAttribute('data-speed');
        gsap.to(el, {
            scrollTrigger: { scrub: true },
            y: (i, target) => ScrollTrigger.maxScroll(window) * speed * 0.1,
            ease: "none"
        });
    });

    // --- 3D TILT ---
    const albumItems = document.querySelectorAll(".album-item");
    document.addEventListener("mousemove", (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        albumItems.forEach(item => {
            gsap.to(item, {
                rotationY: x * 20,
                rotationX: -y * 20,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    });

    // --- MAGNETIC BUTTONS ---
    const btns = document.querySelectorAll("button, .album-item");
    btns.forEach(btn => {
        btn.addEventListener("mousemove", (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(btn, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: "power2.out" });
        });
        btn.addEventListener("mouseleave", () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        });
    });

    // --- MARQUEE ---
    gsap.to(".marquee-strip", {
        xPercent: -20,
        repeat: -1,
        duration: 15,
        ease: "linear",
        yoyo: true
    });

    // --- ENERGY BURST ---
    document.addEventListener("click", (e) => {
        if (e.target.tagName !== "A" && e.target.tagName !== "BUTTON") {
            const burst = document.createElement("div");
            burst.classList.add("energy-burst");
            document.body.appendChild(burst);
            setTimeout(() => burst.remove(), 500);
        }
    });
});
