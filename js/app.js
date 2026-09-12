/* ═════════ RIMON DEBNATH — PORTFOLIO ENGINE ═════════ */
(function () {
  "use strict";
  gsap.registerPlugin(ScrollTrigger);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches || window.innerWidth < 900;

  /* ── helpers ── */
  function splitChars(el) {
    const text = el.textContent;
    el.textContent = "";
    [...text].forEach((c) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = c === " " ? " " : c;
      el.appendChild(s);
    });
    return el.querySelectorAll(".ch");
  }
  function splitWords(el) {
    const words = el.textContent.split(" ");
    el.textContent = "";
    words.forEach((w, i) => {
      const s = document.createElement("span");
      s.className = "wd";
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return el.querySelectorAll(".wd");
  }
  function splitTitle(el) {
    const words = el.textContent.split(" ");
    el.textContent = "";
    words.forEach((w, i) => {
      const wrap = document.createElement("span");
      wrap.className = "w";
      const inner = document.createElement("span");
      inner.textContent = w;
      wrap.appendChild(inner);
      el.appendChild(wrap);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return el.querySelectorAll(".w > span");
  }

  /* ── smooth scroll ── */
  let lenis = null;
  if (!reduced && typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      menu.classList.remove("is-open");
      burgerOpen = false;
      if (lenis) lenis.scrollTo(target, { offset: 0 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ── cursor ── */
  const cursor = document.getElementById("cursor");
  const ring = document.getElementById("cursorRing");
  if (!isTouch && cursor) {
    let rx = innerWidth / 2, ry = innerHeight / 2;
    window.addEventListener("mousemove", (e) => {
      gsap.set(cursor, { x: e.clientX, y: e.clientY });
      rx = e.clientX; ry = e.clientY;
    });
    gsap.ticker.add(() => {
      const x = gsap.getProperty(ring, "x"), y = gsap.getProperty(ring, "y");
      gsap.set(ring, { x: x + (rx - x) * 0.14, y: y + (ry - y) * 0.14 });
    });
    document.querySelectorAll("[data-cursor='hover'], a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
    });
    document.querySelectorAll("[data-cursor='view']").forEach((el) => {
      el.addEventListener("mouseenter", () => { ring.classList.add("is-view"); ring.classList.remove("is-hover"); });
      el.addEventListener("mouseleave", () => ring.classList.remove("is-view"));
    });
  }

  /* ── magnetic ── */
  if (!isTouch) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.4 });
      });
      el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" }));
    });
  }

  /* ── three.js particle field ── */
  const canvas = document.getElementById("webgl");
  if (canvas && typeof THREE !== "undefined" && !reduced) {
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
    cam.position.z = 7;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);

    const N = isTouch ? 1600 : 3200;
    const pos = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      seed[i] = Math.random() * Math.PI * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size: 0.022, color: 0xc8ff3d, transparent: true, opacity: 0.55, depthWrite: false });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    const mat2 = new THREE.PointsMaterial({ size: 0.04, color: 0x7c5cff, transparent: true, opacity: 0.35, depthWrite: false });
    const points2 = new THREE.Points(geo.clone(), mat2);
    points2.rotation.z = 0.5;
    scene.add(points2);

    let mx = 0, my = 0;
    window.addEventListener("mousemove", (e) => {
      mx = (e.clientX / innerWidth - 0.5) * 2;
      my = (e.clientY / innerHeight - 0.5) * 2;
    });
    const clock = new THREE.Clock();
    (function tick() {
      const t = clock.getElapsedTime();
      const p = points.geometry.attributes.position.array;
      for (let i = 0; i < N; i++) {
        p[i * 3 + 1] += Math.sin(t * 0.7 + seed[i]) * 0.0016;
      }
      points.geometry.attributes.position.needsUpdate = true;
      points.rotation.y = t * 0.02 + mx * 0.08;
      points.rotation.x = my * 0.05;
      points2.rotation.y = -t * 0.015 + mx * 0.05;
      renderer.render(scene, cam);
      requestAnimationFrame(tick);
    })();
    window.addEventListener("resize", () => {
      cam.aspect = innerWidth / innerHeight;
      cam.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });
  }

  /* ── preloader ── */
  const pre = document.getElementById("preloader");
  const count = document.getElementById("preCount");
  const bar = document.getElementById("preBar");
  const heroChars = [];
  document.querySelectorAll(".hero__word[data-split]").forEach((el) => heroChars.push(...splitChars(el)));
  document.querySelectorAll(".contact__big-line[data-split]").forEach((el) => splitChars(el));

  const tl = gsap.timeline();
  tl.to(".preloader__name span", { opacity: 1, y: 0, stagger: 0.05, duration: 0.7, ease: "power3.out" });
  const progress = { v: 0 };
  tl.to(progress, {
    v: 100, duration: reduced ? 0.1 : 1.7, ease: "power2.inOut",
    onUpdate() { count.textContent = Math.round(progress.v); bar.style.width = progress.v + "%"; },
  }, "-=0.3");
  tl.to(".preloader__inner", { opacity: 0, y: -40, duration: 0.5, ease: "power2.in" });
  tl.to(".preloader__curtain", { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, "-=0.1");
  tl.to(".preloader__curtain--2", { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, "-=0.65");
  tl.set(pre, { display: "none" });
  tl.to(heroChars, { y: 0, stagger: 0.028, duration: 1, ease: "power4.out" }, "-=0.75");
  tl.from(".hero__tag, .hero__desc, .hero__roles, .hero__bottom", { opacity: 0, y: 26, stagger: 0.09, duration: 0.7, ease: "power3.out" }, "-=0.6");
  tl.from(".nav", { yPercent: -120, duration: 0.7, ease: "power3.out" }, "-=0.7");

  /* ── roles ticker ── */
  const track = document.getElementById("rolesTrack");
  if (track) {
    const items = track.children.length;
    const cycle = gsap.timeline({ repeat: -1, delay: 3 });
    for (let i = 1; i <= items; i++) {
      cycle.to(track, { yPercent: -(100 / items) * (i % items), duration: 0.6, ease: "power3.inOut", delay: 1.6 });
    }
  }

  /* ── nav hide/show ── */
  const nav = document.getElementById("nav");
  let lastY = 0;
  window.addEventListener("scroll", () => {
    const y = scrollY;
    nav.classList.toggle("is-scrolled", y > 60);
    nav.classList.toggle("is-hidden", y > 400 && y > lastY);
    lastY = y;
  }, { passive: true });

  /* ── burger ── */
  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu");
  let burgerOpen = false;
  burger.addEventListener("click", () => {
    burgerOpen = !burgerOpen;
    menu.classList.toggle("is-open", burgerOpen);
  });

  /* ── section titles ── */
  document.querySelectorAll("[data-split-words]").forEach((el) => {
    if (el.classList.contains("section__title")) {
      const spans = splitTitle(el);
      gsap.to(spans, {
        y: 0, stagger: 0.06, duration: 0.9, ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    } else {
      const words = splitWords(el);
      gsap.to(words, {
        opacity: 1, stagger: 0.02, duration: 0.4, ease: "none",
        scrollTrigger: { trigger: el, start: "top 82%", end: "top 40%", scrub: true },
      });
    }
  });
  gsap.set(".section__title .w > span", { y: "110%" });

  /* ── generic reveals ── */
  gsap.utils.toArray(".skills__row, .exp__item, .service, .stat").forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 46, duration: 0.85, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
    });
  });
  gsap.utils.toArray(".project").forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 80, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });
  gsap.from(".about__img-mask", {
    clipPath: "inset(100% 0 0 0)", duration: 1.2, ease: "power4.inOut",
    scrollTrigger: { trigger: ".about__img-wrap", start: "top 80%" },
  });

  /* ── counters ── */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimal || "0", 10);
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 90%", once: true,
      onEnter: () => gsap.to(obj, {
        v: target, duration: 1.6, ease: "power2.out",
        onUpdate: () => { el.textContent = obj.v.toFixed(dec); },
      }),
    });
  });

  /* ── contact big reveal ── */
  gsap.to(".contact__big-line .ch", {
    y: 0, stagger: 0.02, duration: 0.9, ease: "power4.out",
    scrollTrigger: { trigger: ".contact__big", start: "top 85%" },
  });

  /* ── service card glow follows mouse ── */
  document.querySelectorAll(".service").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* ── clock & year ── */
  function dhaka() {
    try {
      const t = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit" }).format(new Date());
      const el = document.getElementById("dhakaTime");
      if (el) el.textContent = t;
    } catch (e) {}
  }
  dhaka(); setInterval(dhaka, 30000);
  document.getElementById("year").textContent = new Date().getFullYear();
})();
