/* ═══════════ RIMON DEBNATH — FOLIO ENGINE 2026 ═══════════ */
(function () {
  "use strict";
  /* if the GSAP CDN is blocked or fails, the page must still be usable: drop the preloader, keep the rest working */
  var hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches || window.innerWidth < 901;
  var cursorOn = hasGsap && !isTouch;
  var each = function (sel, fn) { Array.prototype.forEach.call(typeof sel === "string" ? document.querySelectorAll(sel) : sel, fn); };
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  else {
    var pl = document.getElementById("preloader");
    if (pl && pl.parentNode) pl.parentNode.removeChild(pl);
  }

  /* ── split helpers (NOTE: spaces become \u00a0 escapes so inline-block chars keep their gaps) ──
     the pieces are aria-hidden; the parent (h1, h2, link) carries an aria-label so screen readers say real words */
  function splitChars(el) {
    var text = el.textContent;
    el.textContent = "";
    var out = [];
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement("span");
      s.className = "ch";
      s.setAttribute("aria-hidden", "true");
      s.textContent = text[i] === " " ? "\u00a0" : text[i];
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
  if (hasGsap && !reduced && typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ── mobile menu: scroll lock, inert when closed, Escape, focus stays inside while open ── */
  var nav = document.getElementById("nav");
  var menu = document.getElementById("menu");
  var burger = document.getElementById("burger");
  var mainEl = document.querySelector("main");
  var footerEl = document.querySelector(".footer");
  var burgerOpen = false;
  function setMenu(open) {
    burgerOpen = open;
    menu.classList.toggle("is-open", open);
    menu.inert = !open;
    if (mainEl) mainEl.inert = open;
    if (footerEl) footerEl.inert = open;
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    if (open) nav.classList.remove("is-hidden");
  }
  menu.inert = true;
  burger.addEventListener("click", function () { setMenu(!burgerOpen); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && burgerOpen) { setMenu(false); burger.focus(); }
  });
  /* the menu only exists below 901px; never leave the page locked after a resize */
  var deskMq = window.matchMedia("(min-width: 901px)");
  function onDesk() { if (deskMq.matches && burgerOpen) setMenu(false); }
  if (deskMq.addEventListener) deskMq.addEventListener("change", onDesk);
  else if (deskMq.addListener) deskMq.addListener(onDesk);

  each('a[href^="#"]', function (a) {
    a.addEventListener("click", function (e) {
      var href = a.getAttribute("href");
      var t = href.length > 1 ? document.getElementById(href.slice(1)) : null;
      if (!t) return;
      e.preventDefault();
      setMenu(false);
      if (lenis) lenis.scrollTo(t, { offset: 0 });
      else t.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      /* move focus into the section so the next Tab continues from there */
      if (!t.hasAttribute("tabindex")) t.setAttribute("tabindex", "-1");
      t.focus({ preventScroll: true });
      if (window.history && history.replaceState) history.replaceState(null, "", href);
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
    /* stop drawing while the hero is off-screen (saves battery and GPU on phones) */
    var onScreen = true, running = false;
    function frame() {
      if (!onScreen) { running = false; return; }
      mx += (tmx - mx) * 0.04;
      my += (tmy - my) * 0.04;
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, (performance.now() - start) / 1000);
      gl.uniform2f(uM, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(frame);
    }
    function run() { if (!running) { running = true; frame(); } }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        onScreen = en[en.length - 1].isIntersecting;
        if (onScreen) run();
      }).observe(canvas);
    }
    run();
  })();

  /* ── cursor + labels ── */
  var cursor = document.getElementById("cursor");
  var clabel = document.getElementById("cursorLabel");
  function isOff(el) { return el.getAttribute("aria-disabled") === "true"; }
  if (cursorOn) {
    document.documentElement.classList.add("has-cursor");
    var cx = innerWidth / 2, cy = innerHeight / 2, px = cx, py = cy;
    gsap.set(clabel, { xPercent: -50, yPercent: -50, x: px, y: py });
    window.addEventListener("mousemove", function (e) {
      cx = e.clientX; cy = e.clientY;
      if (!cursor.classList.contains("is-live")) { px = cx; py = cy; cursor.classList.add("is-live"); }
    });
    document.documentElement.addEventListener("mouseleave", function () { cursor.classList.remove("is-live"); });
    gsap.ticker.add(function () {
      px += (cx - px) * 0.22;
      py += (cy - py) * 0.22;
      gsap.set(cursor, { x: px, y: py });
      gsap.set(clabel, { x: px, y: py });
    });
    each("a, button, [data-hover]", function (el) {
      el.addEventListener("mouseenter", function () { if (!isOff(el)) cursor.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { cursor.classList.remove("is-hover"); });
    });
    /* accent-filled controls: hairline ring cursor + a gentle magnetic pull (no pull with reduced motion) */
    each(".work__arrow, .btn, .contact__pill, .nav__cta", function (el) {
      var r = null;
      var xTo = reduced ? null : gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
      var yTo = reduced ? null : gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
      function reset() { cursor.classList.remove("is-ring"); if (xTo) { xTo(0); yTo(0); } }
      el.addEventListener("mouseenter", function () { r = el.getBoundingClientRect(); if (!isOff(el)) cursor.classList.add("is-ring"); });
      el.addEventListener("mousemove", function (e) {
        if (isOff(el)) { reset(); cursor.classList.remove("is-hover"); return; }
        cursor.classList.add("is-ring");
        if (!xTo || !r) return;
        xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.28);
      });
      el.addEventListener("mouseleave", reset);
    });
  }

  /* ── preloader + intro ── */
  if (hasGsap) {
    var preWordChars = splitChars(document.getElementById("preWord"));
    var heroChars = [];
    each(".hero__title [data-chars]", function (el) { heroChars = heroChars.concat(splitChars(el)); });
    each(".contact__line[data-chars], .section__num[data-chars], .work__title [data-chars]", function (el) { splitChars(el); });
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
    /* fromTo (explicit end values), so a CSS transition can never leave these at opacity 0 */
    tl.fromTo(".hero__topline .mono, .hero__intro, .hero__stack, .hero__meta", { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.65, ease: "power3.out" }, "-=0.55");
    tl.fromTo(".hero__badge", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }, "-=0.4");
    tl.fromTo(".nav", { yPercent: -130 }, { yPercent: 0, duration: 0.65, ease: "power3.out", clearProps: "transform,translate,rotate,scale" }, "-=0.6");
    if (reduced) tl.progress(1); /* reduced motion: no intro sequence, the page is ready at once */
    else tl.timeScale(1.35);
  }

  /* ── nav behavior ── */
  var lastY = 0;
  var progressEl = document.getElementById("progress");
  window.addEventListener("scroll", function () {
    var y = scrollY;
    nav.classList.toggle("is-scrolled", y > 70);
    nav.classList.toggle("is-hidden", !burgerOpen && y > 500 && y > lastY);
    lastY = y;
    var d = document.documentElement;
    var p = y / Math.max(1, d.scrollHeight - innerHeight);
    progressEl.style.transform = "scaleX(" + p + ")";
  }, { passive: true });

  if (hasGsap) {
    /* ── section numbers reveal ── */
    each(".section__num", function (el) {
      var chs = el.querySelectorAll(".ch");
      if (reduced) { gsap.set(chs, { y: 0 }); return; }
      gsap.to(chs, {
        y: 0, stagger: 0.08, duration: 0.8, ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    /* ── word scrub reveals (opacity only) ── */
    each("[data-words]", function (el) {
      var words = splitWords(el);
      gsap.to(words, {
        opacity: 1, stagger: 0.03, ease: "none",
        scrollTrigger: { trigger: el, start: "top 84%", end: "top 42%", scrub: true }
      });
    });

    /* ── generic rises ──
       the stat and service grids rise as whole blocks: their 1px separators are the grid's own background,
       so fading the tiles one by one flashed a bare grey box before they appeared */
    if (!reduced) {
      gsap.utils.toArray(".exp__item, .stats, .about__services, .orb, .work__foot, .contact__row").forEach(function (el) {
        gsap.from(el, {
          opacity: 0, y: 44, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 92%" }
        });
      });
    }
  }

  /* ── selected work: horizontal card rail ── */
  (function workRail() {
    var rail = document.getElementById("workRail");
    if (!rail) return;
    var cards = Array.prototype.slice.call(rail.querySelectorAll(".wcard"));
    var prevBtn = document.getElementById("workPrev");
    var nextBtn = document.getElementById("workNext");
    var countEl = document.getElementById("workCount");
    var liveEl = document.getElementById("workLive");
    var thumb = document.getElementById("workThumb");
    var total = cards.length;
    var behavior = reduced ? "auto" : "smooth";
    var pending = null;

    function pad2(n) { return String(n).padStart(2, "0"); }
    function clampIdx(i) { return Math.max(0, Math.min(total - 1, i)); }
    function maxScroll() { return Math.max(0, rail.scrollWidth - rail.clientWidth); }
    function inset() { return parseFloat(getComputedStyle(rail).paddingLeft) || 0; }
    function posOf(i) { return Math.max(0, Math.min(maxScroll(), cards[i].offsetLeft - inset())); }
    function focusTarget(c) { return c.querySelector(".wcard__main") || c; }

    /* cards at least ~70% inside the rail viewport */
    function visibleRange() {
      var r = rail.getBoundingClientRect();
      var first = -1, last = -1;
      for (var i = 0; i < total; i++) {
        var b = cards[i].getBoundingClientRect();
        var seen = Math.min(b.right, r.right) - Math.max(b.left, r.left);
        if (b.width && seen / b.width > 0.7) { if (first < 0) first = i; last = i; }
      }
      if (first < 0) {
        var x = rail.scrollLeft, best = 0;
        for (var j = 1; j < total; j++) if (Math.abs(posOf(j) - x) < Math.abs(posOf(best) - x)) best = j;
        first = last = best;
      }
      return [first, last];
    }

    /* wait until the rail stops moving (works with or without the scrollend event) */
    function whenSettled(cb) {
      var t;
      function fin() { rail.removeEventListener("scroll", onScroll); cb(); }
      function onScroll() { clearTimeout(t); t = setTimeout(fin, 140); }
      rail.addEventListener("scroll", onScroll, { passive: true });
      t = setTimeout(fin, 180);
    }

    function announce() {
      if (!liveEl) return;
      var v = visibleRange();
      liveEl.textContent = "Showing project " + (v[0] + 1) + (v[1] > v[0] ? " to " + (v[1] + 1) : "") + " of " + total;
    }

    function go(i, speak) {
      i = clampIdx(i);
      pending = i;
      rail.scrollTo({ left: posOf(i), behavior: behavior });
      whenSettled(function () { pending = null; update(); if (speak) announce(); });
    }

    /* the custom cursor must not promise a click on a disabled arrow */
    function syncArrowCursor() {
      if (!cursorOn) return;
      var overOff = (prevBtn.matches(":hover") && isOff(prevBtn)) || (nextBtn.matches(":hover") && isOff(nextBtn));
      var overOn = (prevBtn.matches(":hover") && !isOff(prevBtn)) || (nextBtn.matches(":hover") && !isOff(nextBtn));
      if (overOff) { cursor.classList.remove("is-hover"); cursor.classList.remove("is-ring"); }
      else if (overOn) { cursor.classList.add("is-hover"); cursor.classList.add("is-ring"); }
    }

    var queued = false;
    function update() {
      queued = false;
      var max = maxScroll();
      var x = rail.scrollLeft;
      var ratio = rail.scrollWidth ? Math.min(1, rail.clientWidth / rail.scrollWidth) : 1;
      var p = max > 0 ? Math.min(1, Math.max(0, x / max)) : 0;
      thumb.style.width = (ratio * 100) + "%";
      thumb.style.transform = "translateX(" + (ratio < 1 ? (p * (1 - ratio) / ratio) * 100 : 0) + "%)";
      prevBtn.setAttribute("aria-disabled", x <= 2 ? "true" : "false");
      nextBtn.setAttribute("aria-disabled", x >= max - 2 ? "true" : "false");
      syncArrowCursor();
      var v = visibleRange();
      countEl.textContent = (v[0] === v[1] ? pad2(v[0] + 1) : pad2(v[0] + 1) + "–" + pad2(v[1] + 1)) + " / " + pad2(total);
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }
    rail.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    window.addEventListener("load", queue);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(queue);
    update();

    /* start both screenshots once the page has loaded, so a nav jump never shows them half-drawn */
    function eager() { each(rail.querySelectorAll('img[loading="lazy"]'), function (im) { im.loading = "eager"; }); }
    if (document.readyState === "complete") eager(); else window.addEventListener("load", eager);

    /* arrow buttons */
    prevBtn.addEventListener("click", function () {
      if (isOff(prevBtn)) return;
      go((pending !== null ? pending : visibleRange()[0]) - 1, true);
    });
    nextBtn.addEventListener("click", function () {
      if (isOff(nextBtn)) return;
      go((pending !== null ? pending : visibleRange()[0]) + 1, true);
    });

    /* keyboard: ← → Home End move between cards */
    rail.addEventListener("keydown", function (e) {
      var k = e.key;
      if (k !== "ArrowRight" && k !== "ArrowLeft" && k !== "Home" && k !== "End") return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return; /* leave browser and OS shortcuts (Back, page jumps) alone */
      var card = e.target.closest ? e.target.closest(".wcard") : null;
      var i = card ? cards.indexOf(card) : visibleRange()[0];
      var n = k === "ArrowRight" ? i + 1 : k === "ArrowLeft" ? i - 1 : k === "Home" ? 0 : total - 1;
      n = clampIdx(n);
      e.preventDefault();
      if (n === i) return;
      focusTarget(cards[n]).focus({ preventScroll: true });
      var v = visibleRange();
      if (n < v[0] || n > v[1]) go(n);
      /* preventScroll also blocks vertical scrolling: bring the card into view ourselves */
      var cb = cards[n].getBoundingClientRect();
      if (cb.top < 0 || cb.bottom > innerHeight) {
        var dy = cb.top < 0 ? cb.top - 90 : cb.bottom - innerHeight + 24;
        if (lenis) lenis.scrollTo(scrollY + dy); else window.scrollBy({ top: dy, behavior: behavior });
      }
    });

    /* horizontal wheel / trackpad swipes belong to the rail, not to Lenis */
    rail.addEventListener("wheel", function (e) {
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.stopPropagation();
    }, { passive: true });

    /* mouse drag-to-scroll with a little momentum, then snap to a card */
    var drag = null, suppressClick = false;
    rail.addEventListener("dragstart", function (e) { e.preventDefault(); });
    rail.addEventListener("pointerdown", function (e) {
      suppressClick = false; /* a stale flag must never eat a fresh click */
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: rail.scrollLeft, lastX: e.clientX, lastT: e.timeStamp, v: 0, moved: false };
    });
    window.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < 6) return;
        drag.moved = true;
        pending = null;
        rail.classList.add("is-dragging");
        if (window.getSelection) window.getSelection().removeAllRanges();
        setLabel("DRAG");
      }
      var dt = e.timeStamp - drag.lastT;
      if (dt > 0) drag.v = 0.75 * ((e.clientX - drag.lastX) / dt) + 0.25 * drag.v;
      drag.lastX = e.clientX;
      drag.lastT = e.timeStamp;
      rail.scrollLeft = drag.left - dx;
    });
    function endDrag(e) {
      if (!drag) return;
      var d = drag;
      drag = null;
      if (!d.moved) return;
      suppressClick = true;
      setTimeout(function () { suppressClick = false; }, 350);
      /* the drag's own click fires before the next frame and still lands on the row; after that, links are live again */
      requestAnimationFrame(function () { rail.classList.remove("is-dragging"); rail.classList.add("is-settling"); });
      if (e && e.timeStamp - d.lastT > 90) d.v = 0;
      var step = total > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : rail.clientWidth;
      var x = rail.scrollLeft;
      var at = x / step;
      var target = Math.round((x - d.v * 220) / step);
      if (d.v < -0.2) target = Math.max(target, Math.ceil(at - 0.05));
      if (d.v > 0.2) target = Math.min(target, Math.floor(at + 0.05));
      target = clampIdx(target);
      rail.scrollTo({ left: posOf(target), behavior: behavior });
      whenSettled(function () { rail.classList.remove("is-settling"); update(); });
    }
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    rail.addEventListener("click", function (e) {
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
        return;
      }
      /* a pointer tap on a card that only peeks in brings it into view instead of opening it */
      if (e.detail > 0) {
        var c = e.target.closest ? e.target.closest(".wcard") : null;
        var ci = c ? cards.indexOf(c) : -1;
        if (ci >= 0) {
          var v = visibleRange();
          if (ci < v[0] || ci > v[1]) { e.preventDefault(); e.stopPropagation(); go(ci, true); }
        }
      }
    }, true);

    /* custom cursor: DRAG over the rail, OPEN / CODE over links */
    function setLabel(text) {
      if (!cursorOn) return;
      cursor.classList.add("is-row");
      clabel.classList.add("on");
      clabel.textContent = text;
    }
    if (cursorOn) {
      rail.addEventListener("mouseover", function (e) {
        if (drag && drag.moved) return;
        var a = e.target.closest ? e.target.closest("a") : null;
        setLabel(a ? (a.classList.contains("wcard__link--alt") ? "CODE ↗" : "OPEN ↗") : "DRAG");
      });
      rail.addEventListener("mouseleave", function () {
        if (drag && drag.moved) return;
        cursor.classList.remove("is-row");
        clabel.classList.remove("on");
      });
      window.addEventListener("pointerup", function (e) {
        if (!rail.contains(document.elementFromPoint(e.clientX, e.clientY))) {
          cursor.classList.remove("is-row");
          clabel.classList.remove("on");
        }
      });
    }

    /* hover depth: the pointer position drives --mx / --my on the media (CSS does the motion) */
    if (finePointer && !reduced) {
      cards.forEach(function (card) {
        var media = card.querySelector(".wcard__media");
        if (!media) return;
        var raf = 0, mx = 0, my = 0;
        card.addEventListener("pointermove", function (e) {
          if (e.pointerType !== "mouse" || rail.classList.contains("is-dragging")) return;
          mx = e.clientX; my = e.clientY;
          if (raf) return;
          raf = requestAnimationFrame(function () {
            raf = 0;
            var r = media.getBoundingClientRect();
            media.style.setProperty("--mx", Math.min(1, Math.max(0, (mx - r.left) / r.width)).toFixed(3));
            media.style.setProperty("--my", Math.min(1, Math.max(0, (my - r.top) / r.height)).toFixed(3));
          });
        });
        card.addEventListener("pointerleave", function () {
          media.style.setProperty("--mx", "0.5");
          media.style.setProperty("--my", "0.5");
        });
      });
    }

    /* entrance: cards rise while each media wipes up and settles from 1.28 to 1 */
    if (hasGsap && !reduced) {
      gsap.from(".work__title .ch", {
        yPercent: 115, stagger: 0.03, duration: 0.9, ease: "power4.out",
        scrollTrigger: { trigger: ".work__title", start: "top 85%" }
      });
      gsap.from(".work__lede", {
        opacity: 0, y: 24, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".work__lede", start: "top 92%" }
      });
      gsap.from(".work__top", {
        opacity: 0, y: 24, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: ".work__top", start: "top 92%" }
      });
      gsap.from(cards, {
        opacity: 0, y: 64, duration: 0.95, ease: "power3.out", stagger: 0.09, clearProps: "opacity,transform",
        scrollTrigger: { trigger: rail, start: "top 90%" }
      });
      cards.forEach(function (card, i) {
        var media = card.querySelector(".wcard__media");
        var inner = media && (media.querySelector("img") || media.querySelector(".wcard__big"));
        if (!inner) return;
        /* the screenshot's CSS hover transition would re-ease every GSAP frame (a laggy double ease): off until the reveal ends */
        if (inner.tagName === "IMG") inner.style.transition = "none";
        gsap.timeline({ delay: 0.15 + i * 0.09, scrollTrigger: { trigger: rail, start: "top 85%" }, onComplete: function () { inner.style.transition = ""; } })
          .fromTo(media, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.15, ease: "expo.out", clearProps: "clipPath" })
          .fromTo(inner, { scale: 1.28, yPercent: inner.tagName === "IMG" ? 0 : 30 }, { scale: 1, yPercent: 0, duration: 1.5, ease: "expo.out", clearProps: "transform" }, 0);
      });
    }
  })();

  if (hasGsap) {
    /* ── counters (the HTML already holds the real values for no-JS, crawlers and reduced motion) ── */
    if (!reduced) {
      each("[data-count]", function (el) {
        var target = parseFloat(el.dataset.count);
        var dec = parseInt(el.dataset.decimal || "0", 10);
        var o = { v: 0 };
        el.textContent = (0).toFixed(dec);
        ScrollTrigger.create({
          trigger: el, start: "top 92%", once: true,
          onEnter: function () {
            gsap.to(o, { v: target, duration: 1.6, ease: "power2.out", onUpdate: function () { el.textContent = o.v.toFixed(dec); } });
          }
        });
      });
    }

    /* ── contact big reveal ── */
    if (reduced) gsap.set(".contact__line .ch", { y: 0 });
    else {
      gsap.to(".contact__line .ch", {
        y: 0, stagger: 0.02, duration: 0.85, ease: "power4.out",
        scrollTrigger: { trigger: ".contact__big", start: "top 86%" }
      });
    }

    /* ── hero parallax on scroll ── */
    if (!reduced) {
      /* the title and the SCROLL badge move as one block, so the badge never drifts into CREATIVE */
      gsap.to(".hero__mid", {
        yPercent: 18, opacity: 0.35, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
  }

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
