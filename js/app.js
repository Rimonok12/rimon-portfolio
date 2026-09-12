/* ═══════════ RIMON DEBNATH — FOLIO ENGINE 2026 ═══════════ */
(function () {
  "use strict";
  gsap.registerPlugin(ScrollTrigger);
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches || window.innerWidth < 901;

  /* ── split helpers (NOTE: real U+0020 spaces via createTextNode /   escapes only) ── */
  function splitChars(el) {
    var text = el.textContent;
    el.textContent = "";
    var out = [];
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement("span");
      s.className = "ch";
      s.textContent = text[i] === " " ? " " : text[i];
      el.appendChild(s);
      out.push(s);
    }
    return out;
  }
  function splitWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    var out = [];
    for (var i = 0; i < words.length; i++) {
      var s = document.createElement("span");
      s.className = "wd";
      s.textContent = words[i];
      el.appendChild(s);
      out.push(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    }
    return out;
  }

  /* ── smooth scroll ── */
  var lenis = null;
  if (!reduced && typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  var menu = document.getElementById("menu");
  var burger = document.getElementById("burger");
  var burgerOpen = false;
  burger.addEventListener("click", function () {
    burgerOpen = !burgerOpen;
    menu.classList.toggle("is-open", burgerOpen);
  });
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (a) {
    a.addEventListener("click", function (e) {
      var t = document.querySelector(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      burgerOpen = false;
      menu.classList.remove("is-open");
      if (lenis) lenis.scrollTo(t, { offset: 0 });
      else t.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ── SILK SHADER HERO (raw WebGL) ── */
  (function silk() {
    var canvas = document.getElementById("silk");
    if (!canvas || reduced) return;
    var gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;
    var vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    var fs = [
      "precision highp float;",
      "uniform vec2 r;uniform float t;uniform vec2 m;",
      "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}",
      "float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);",
      " return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}",
      "float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.04;a*=.52;}return v;}",
      "void main(){",
      " vec2 uv=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);",
      " float T=t*.055;",
      " vec2 q=vec2(fbm(uv+T),fbm(uv+vec2(3.2,1.7)-T*.7));",
      " vec2 w=vec2(fbm(uv+2.6*q+vec2(1.7,9.2)+T*.6),fbm(uv+2.2*q+vec2(8.3,2.8)-T*.4));",
      " float f=fbm(uv+2.4*w+m*.25);",
      " vec3 base=vec3(.043,.039,.035);",
      " vec3 ember=vec3(1.0,.30,.14);",
      " vec3 gold=vec3(.84,.72,.55);",
      " vec3 violet=vec3(.30,.16,.55);",
      " vec3 col=base;",
      " col=mix(col,violet,smoothstep(.35,.95,q.y)*.35);",
      " col=mix(col,ember,pow(smoothstep(.42,1.,f),2.6)*.85);",
      " col=mix(col,gold,pow(smoothstep(.55,1.,w.x),3.5)*.4);",
      " float vig=smoothstep(1.45,.35,length(uv*vec2(1.,1.25)));",
      " col*=mix(.55,1.,vig);",
      " gl_FragColor=vec4(col,1.);}"
    ].join("\n");
    function sh(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uR = gl.getUniformLocation(prog, "r");
    var uT = gl.getUniformLocation(prog, "t");
    var uM = gl.getUniformLocation(prog, "m");
    var mx = 0, my = 0, tmx = 0, tmy = 0;
    window.addEventListener("mousemove", function (e) {
      tmx = (e.clientX / innerWidth - 0.5) * 2;
      tmy = (0.5 - e.clientY / innerHeight) * 2;
    });
    function size() {
      var d = Math.min(devicePixelRatio || 1, 1.6);
      canvas.width = canvas.clientWidth * d;
      canvas.height = canvas.clientHeight * d;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    size();
    window.addEventListener("resize", size);
    var start = performance.now();
    (function frame() {
      mx += (tmx - mx) * 0.04;
      my += (tmy - my) * 0.04;
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, (performance.now() - start) / 1000);
      gl.uniform2f(uM, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(frame);
    })();
  })();

  /* ── cursor + labels + tag pill ── */
  var cursor = document.getElementById("cursor");
  var clabel = document.getElementById("cursorLabel");
  var pill = document.createElement("div");
  pill.className = "tagpill";
  document.body.appendChild(pill);
  if (!isTouch) {
    var cx = innerWidth / 2, cy = innerHeight / 2, px = cx, py = cy;
    window.addEventListener("mousemove", function (e) { cx = e.clientX; cy = e.clientY; });
    gsap.ticker.add(function () {
      px += (cx - px) * 0.22;
      py += (cy - py) * 0.22;
      gsap.set(cursor, { x: px, y: py });
      gsap.set(clabel, { x: px, y: py });
      gsap.set(pill, { x: cx, y: cy });
    });
    Array.prototype.forEach.call(document.querySelectorAll("a, button, [data-hover]"), function (el) {
      el.addEventListener("mouseenter", function () { cursor.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { cursor.classList.remove("is-hover"); });
    });
    Array.prototype.forEach.call(document.querySelectorAll(".prow"), function (row) {
      row.addEventListener("mouseenter", function () {
        cursor.classList.add("is-row");
        clabel.classList.add("on");
        clabel.textContent = row.getAttribute("href") === "#" ? "NDA" : "OPEN ↗";
        pill.textContent = row.dataset.tags || "";
        pill.classList.add("on");
      });
      row.addEventListener("mouseleave", function () {
        cursor.classList.remove("is-row");
        clabel.classList.remove("on");
        pill.classList.remove("on");
      });
    });
  }

  /* ── preloader ── */
  var preWordChars = splitChars(document.getElementById("preWord"));
  var heroChars = [];
  Array.prototype.forEach.call(document.querySelectorAll(".hero__title [data-chars]"), function (el) {
    heroChars = heroChars.concat(splitChars(el));
  });
  Array.prototype.forEach.call(document.querySelectorAll(".contact__line[data-chars], .section__num[data-chars]"), function (el) {
    splitChars(el);
  });
  var count = document.getElementById("preCount");
  var tl = gsap.timeline();
  tl.to(preWordChars, { y: 0, stagger: 0.03, duration: 0.85, ease: "power4.out" }, 0.15);
  var prog = { v: 0 };
  tl.to(prog, {
    v: 100, duration: reduced ? 0.1 : 1.6, ease: "power2.inOut",
    onUpdate: function () { count.textContent = String(Math.round(prog.v)).padStart(3, "0"); }
  }, 0.2);
  tl.to(preWordChars, { y: "-120%", stagger: 0.016, duration: 0.6, ease: "power3.in" });
  tl.to(".preloader__brand, .preloader__foot", { opacity: 0, duration: 0.3 }, "<");
  tl.to(".preloader__panel", { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, "-=0.15");
  tl.to(".preloader__panel--2", { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, "-=0.7");
  tl.set("#preloader", { display: "none" });
  tl.to(heroChars, { y: 0, stagger: 0.022, duration: 0.95, ease: "power4.out" }, "-=0.62");
  tl.from(".hero__topline .mono, .hero__intro, .hero__stack, .hero__meta", { opacity: 0, y: 24, stagger: 0.08, duration: 0.65, ease: "power3.out" }, "-=0.55");
  tl.from(".hero__badge", { opacity: 0, scale: 0.6, duration: 0.6, ease: "back.out(1.7)" }, "-=0.4");
  tl.from(".nav", { yPercent: -130, duration: 0.65, ease: "power3.out" }, "-=0.6");

  /* ── nav behavior ── */
  var nav = document.getElementById("nav");
  var lastY = 0;
  window.addEventListener("scroll", function () {
    var y = scrollY;
    nav.classList.toggle("is-scrolled", y > 70);
    nav.classList.toggle("is-hidden", y > 500 && y > lastY);
    lastY = y;
    var d = document.documentElement;
    var p = y / (d.scrollHeight - innerHeight);
    document.getElementById("progress").style.transform = "scaleX(" + p + ")";
  }, { passive: true });

  /* ── section numbers reveal ── */
  Array.prototype.forEach.call(document.querySelectorAll(".section__num"), function (el) {
    gsap.to(el.querySelectorAll(".ch"), {
      y: 0, stagger: 0.08, duration: 0.8, ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });

  /* ── word scrub reveals ── */
  Array.prototype.forEach.call(document.querySelectorAll("[data-words]"), function (el) {
    var words = splitWords(el);
    gsap.to(words, {
      opacity: 1, stagger: 0.03, ease: "none",
      scrollTrigger: { trigger: el, start: "top 84%", end: "top 42%", scrub: true }
    });
  });

  /* ── generic rises ── */
  gsap.utils.toArray(".exp__item, .svc, .stat, .orb, .work__foot, .contact__row").forEach(function (el) {
    gsap.from(el, {
      opacity: 0, y: 44, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 92%" }
    });
  });

  /* ── project rows: stagger in ── */
  gsap.utils.toArray(".plist li").forEach(function (li, i) {
    gsap.from(li, {
      opacity: 0, y: 36, duration: 0.65, ease: "power3.out", delay: (i % 4) * 0.05,
      scrollTrigger: { trigger: li, start: "top 94%" }
    });
  });

  /* ── counters ── */
  Array.prototype.forEach.call(document.querySelectorAll("[data-count]"), function (el) {
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.decimal || "0", 10);
    var o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 92%", once: true,
      onEnter: function () {
        gsap.to(o, { v: target, duration: 1.6, ease: "power2.out", onUpdate: function () { el.textContent = o.v.toFixed(dec); } });
      }
    });
  });

  /* ── contact big reveal ── */
  gsap.to(".contact__line .ch", {
    y: 0, stagger: 0.02, duration: 0.85, ease: "power4.out",
    scrollTrigger: { trigger: ".contact__big", start: "top 86%" }
  });

  /* ── hero parallax on scroll ── */
  gsap.to(".hero__title", {
    yPercent: 18, opacity: 0.35, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  /* ── clock + year ── */
  function clock() {
    try {
      var t = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date());
      var el = document.getElementById("dhakaTime");
      if (el) el.textContent = t;
    } catch (e) {}
  }
  clock();
  setInterval(clock, 1000);
  document.getElementById("year").textContent = new Date().getFullYear();
})();
