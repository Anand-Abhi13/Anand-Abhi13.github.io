/* =====================================================================
   Abhinav Anand — Portfolio interactions
   ===================================================================== */
(() => {
    "use strict";
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const $  = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];

    /* ---------- Year ---------- */
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Theme toggle ---------- */
    const root = document.documentElement;
    const themeToggle = $("#themeToggle");
    const setIcon = () => {
        const dark = root.getAttribute("data-theme") === "dark";
        themeToggle.innerHTML = dark ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    };
    try {
        const saved = localStorage.getItem("aa-theme");
        if (saved) root.setAttribute("data-theme", saved);
    } catch (e) {}
    setIcon();
    themeToggle?.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem("aa-theme", next); } catch (e) {}
        setIcon();
    });

    /* ---------- Mobile menu ---------- */
    const menuToggle = $("#menuToggle");
    const navLinks = $("#navLinks");
    menuToggle?.addEventListener("click", () => {
        const open = navLinks.classList.toggle("open");
        menuToggle.classList.toggle("open", open);
        menuToggle.setAttribute("aria-expanded", String(open));
    });
    $$(".nav-link").forEach(l => l.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
    }));

    /* ---------- Scroll progress ---------- */
    const progress = $("#scrollProgress");
    const onScroll = () => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------- Cursor glow ---------- */
    const glow = $("#cursorGlow");
    if (glow && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
        const loop = () => {
            cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
            glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
            if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) raf = requestAnimationFrame(loop);
            else raf = null;
        };
        window.addEventListener("pointermove", (e) => {
            tx = e.clientX; ty = e.clientY;
            if (!raf) raf = requestAnimationFrame(loop);
        }, { passive: true });
    }

    /* ---------- Reveal on scroll ---------- */
    const reveals = $$(".reveal");
    if (prefersReduced) {
        reveals.forEach(el => el.classList.add("in"));
    } else {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e, i) => {
                if (e.isIntersecting) {
                    const el = e.target;
                    // small stagger for siblings
                    setTimeout(() => el.classList.add("in"), (i % 4) * 70);
                    io.unobserve(el);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
        reveals.forEach(el => io.observe(el));
    }

    /* ---------- Active nav highlighting ---------- */
    const navItems = $$(".nav-link");
    const sections = navItems.map(a => $("#" + a.dataset.section)).filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const id = e.target.id;
                navItems.forEach(a => a.classList.toggle("active", a.dataset.section === id));
            }
        });
    }, { threshold: 0.2, rootMargin: "-40% 0px -50% 0px" });
    sections.forEach(s => spy.observe(s));

    /* ---------- Animated counters ---------- */
    const fmt = (n) => n >= 1000 ? n.toLocaleString("en-US") : String(n);
    const runCount = (el) => {
        const target = +el.dataset.target;
        const suffix = el.dataset.suffix || "";
        const dur = 1500, start = performance.now();
        const tick = (now) => {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = fmt(Math.round(target * eased)) + suffix;
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };
    const countIO = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                if (prefersReduced) e.target.textContent = fmt(+e.target.dataset.target) + (e.target.dataset.suffix || "");
                else runCount(e.target);
                countIO.unobserve(e.target);
            }
        });
    }, { threshold: 0.6 });
    $$(".stat-num").forEach(el => countIO.observe(el));

    /* ---------- Role typewriter ---------- */
    const roleEl = $("#roleText");
    if (roleEl) {
        const roles = [
            "Agentic AI architect",
            "RAG & LLM systems engineer",
            "Cloud-native builder on AWS",
            "MLOps & model deployment",
            "Mentor to 150+ engineers",
        ];
        if (prefersReduced) {
            roleEl.textContent = roles[0];
        } else {
            let r = 0, c = 0, deleting = false;
            const type = () => {
                const word = roles[r];
                c += deleting ? -1 : 1;
                roleEl.textContent = word.slice(0, c);
                let delay = deleting ? 38 : 70;
                if (!deleting && c === word.length) { delay = 1700; deleting = true; }
                else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 320; }
                setTimeout(type, delay);
            };
            setTimeout(type, 600);
        }
    }

    /* ---------- Constellation canvas ---------- */
    const canvas = $("#constellation");
    if (canvas && !prefersReduced) {
        const ctx = canvas.getContext("2d");
        let w, h, dpr, points = [], mouse = { x: -9999, y: -9999 };

        const themeColors = () => {
            const light = root.getAttribute("data-theme") === "light";
            return light
                ? { dot: "13,148,136", line: "37,99,235" }
                : { dot: "94,234,212", line: "86,182,247" };
        };

        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = canvas.width = innerWidth * dpr;
            h = canvas.height = innerHeight * dpr;
            canvas.style.width = innerWidth + "px";
            canvas.style.height = innerHeight + "px";
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const count = Math.min(96, Math.floor((innerWidth * innerHeight) / 16000));
            points = Array.from({ length: count }, () => ({
                x: Math.random() * innerWidth,
                y: Math.random() * innerHeight,
                vx: (Math.random() - 0.5) * 0.28,
                vy: (Math.random() - 0.5) * 0.28,
                r: Math.random() * 1.6 + 0.6,
            }));
        };

        const draw = () => {
            const { dot, line } = themeColors();
            ctx.clearRect(0, 0, innerWidth, innerHeight);
            const linkDist = 130, mouseDist = 170;

            for (const p of points) {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
                if (p.y < 0 || p.y > innerHeight) p.vy *= -1;

                // gentle attraction to cursor
                const dxm = mouse.x - p.x, dym = mouse.y - p.y;
                const dm = Math.hypot(dxm, dym);
                if (dm < mouseDist) {
                    const f = (1 - dm / mouseDist) * 0.5;
                    p.x += (dxm / dm) * f;
                    p.y += (dym / dm) * f;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${dot},0.7)`;
                ctx.fill();
            }

            for (let i = 0; i < points.length; i++) {
                for (let j = i + 1; j < points.length; j++) {
                    const a = points[i], b = points[j];
                    const d = Math.hypot(a.x - b.x, a.y - b.y);
                    if (d < linkDist) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(${line},${(1 - d / linkDist) * 0.18})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
                // link to mouse
                const a = points[i];
                const dms = Math.hypot(a.x - mouse.x, a.y - mouse.y);
                if (dms < mouseDist) {
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(${dot},${(1 - dms / mouseDist) * 0.25})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
            requestAnimationFrame(draw);
        };

        window.addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
        window.addEventListener("pointerout", () => { mouse.x = -9999; mouse.y = -9999; });
        let rt;
        window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 200); });
        resize();
        draw();
    }
})();
