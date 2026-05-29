/**
 * SHAURYA BABU — PORTFOLIO SCRIPT
 * Features: Loader, Matrix Rain, Custom Cursor, Typing Effect,
 *           Navbar, Tabs, Skill Bars, Scroll Reveal, Terminal Anim,
 *           Contact Form, Mobile Menu
 * Vanilla JS — No Frameworks
 */

"use strict";

/* ─────────────────────────────────────────────
   0. UTILITIES
───────────────────────────────────────────── */

/** Shorthand query selectors */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─────────────────────────────────────────────
   1. LOADING SCREEN
───────────────────────────────────────────── */

const messages = [
  "INITIALIZING SYSTEM...",
  "LOADING ASSETS...",
  "ESTABLISHING CONNECTION...",
  "BYPASSING FIREWALL...",
  "ACCESS GRANTED ✓",
];

function runLoader() {
  const loader   = qs("#loader");
  const fill     = qs("#loader-fill");
  const msgEl    = qs("#loader-msg");
  if (!loader) return;

  let pct = 0;
  let msgIdx = 0;

  const tick = setInterval(() => {
    pct += Math.random() * 18 + 6;
    if (pct >= 100) { pct = 100; clearInterval(tick); }

    fill.style.width = pct + "%";
    msgEl.textContent = messages[Math.min(msgIdx++, messages.length - 1)];

    if (pct >= 100) {
      setTimeout(() => {
        loader.classList.add("hidden");
        document.body.style.overflow = ""; // re-enable scroll
        startReveal();
      }, 600);
    }
  }, 160);

  document.body.style.overflow = "hidden"; // freeze scroll during load
}

/* ─────────────────────────────────────────────
   2. MATRIX RAIN CANVAS
───────────────────────────────────────────── */

function initMatrix() {
  const canvas = qs("#matrixCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let cols, drops;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.floor(canvas.width / 18);
    drops = new Array(cols).fill(1);
  }

  resize();
  window.addEventListener("resize", resize);

  const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノ01ハヒフヘホマミムメモヤユヨラリルレロワヲン<>/{}[]()=+!@#$%ABCDEF";

  function draw() {
    // Semi-transparent black to create trail effect
    ctx.fillStyle = "rgba(2,12,7,0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00ff88";
    ctx.font      = "14px 'Share Tech Mono', monospace";

    for (let i = 0; i < drops.length; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = drops[i] * 18 < canvas.height * 0.1
        ? "#00e5ff"
        : "#00ff88";
      ctx.fillText(ch, i * 18, drops[i] * 18);

      if (drops[i] * 18 > canvas.height && Math.random() > 0.97) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 55);
}

/* ─────────────────────────────────────────────
   3. CUSTOM CURSOR
───────────────────────────────────────────── */

function initCursor() {
  const dot  = qs("#cursorDot");
  const ring = qs("#cursorRing");
  if (!dot || !ring) return;

  let ringX = 0, ringY = 0;
  let dotX  = 0, dotY  = 0;

  document.addEventListener("mousemove", e => {
    dotX = e.clientX;
    dotY = e.clientY;
  });

  // Smooth ring follow
  function animateRing() {
    ringX += (dotX - ringX) * 0.12;
    ringY += (dotY - ringY) * 0.12;
    dot.style.left  = dotX + "px";
    dot.style.top   = dotY + "px";
    ring.style.left = ringX + "px";
    ring.style.top  = ringY + "px";
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Expand ring on interactive elements
  const interactives = "a, button, input, textarea, .skill-tab, .project-card, .contact-item";
  document.addEventListener("mouseover", e => {
    if (e.target.closest(interactives)) ring.classList.add("hovering");
  });
  document.addEventListener("mouseout", e => {
    if (e.target.closest(interactives)) ring.classList.remove("hovering");
  });

  // Hide cursor when leaving window
  document.addEventListener("mouseleave", () => { dot.style.opacity = "0"; ring.style.opacity = "0"; });
  document.addEventListener("mouseenter", () => { dot.style.opacity = "1"; ring.style.opacity = ""; });
}

/* ─────────────────────────────────────────────
   4. NAVBAR EFFECTS
───────────────────────────────────────────── */

function initNavbar() {
  const navbar = qs("#navbar");
  if (!navbar) return;

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });

  // Highlight active section link
  const sections  = qsa("section[id]");
  const navLinks  = qsa(".nav-link");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(link => {
      link.style.color = link.getAttribute("href") === "#" + current
        ? "var(--clr-green)"
        : "";
    });
  }, { passive: true });
}

/* ─────────────────────────────────────────────
   5. MOBILE MENU TOGGLE
───────────────────────────────────────────── */

function initMobileMenu() {
  const hamburger = qs("#hamburger");
  const navLinks  = qs("#navLinks");
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });

  // Close menu on link click
  qsa(".nav-link, .nav-btn").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      navLinks.classList.remove("open");
    });
  });
}

/* ─────────────────────────────────────────────
   6. TYPING ANIMATION
───────────────────────────────────────────── */

function initTyping() {
  const el = qs("#typingText");
  if (!el) return;

  const phrases = [
    "Web Developer",
    "Full-Stack Programmer",
    "UI/UX Enthusiast",
    "Open Source Contributor",
    "Problem Solver",
    "Digital Architect",
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;
  let paused    = false;

  function type() {
    const phrase = phrases[phraseIdx];

    if (paused) return;

    if (!deleting) {
      el.textContent = phrase.slice(0, ++charIdx);
      if (charIdx === phrase.length) {
        paused = true;
        setTimeout(() => { deleting = true; paused = false; }, 2000);
      }
    } else {
      el.textContent = phrase.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting  = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }

    setTimeout(type, deleting ? 45 : 95);
  }

  type();
}

/* ─────────────────────────────────────────────
   7. TERMINAL ANIMATION
───────────────────────────────────────────── */

function initTerminal() {
  const body = qs("#terminalBody");
  if (!body) return;

  const lines = [
    { cls: "t-comment", text: "# Portfolio v2.0 — System Online" },
    { cls: "",          text: "" },
    { cls: "",          text: '<span class="t-cyan">const</span> developer = {' },
    { cls: "",          text: '  name:     <span class="t-white">"Shaurya Babu"</span>,' },
    { cls: "",          text: '  role:     <span class="t-white">"Full-Stack Dev"</span>,' },
    { cls: "",          text: '  passion:  <span class="t-white">"Building cool stuff"</span>,' },
    { cls: "",          text: '  status:   <span class="t-cyan">ONLINE</span>' },
    { cls: "",          text: "};" },
    { cls: "",          text: "" },
    { cls: "t-comment", text: "// Running diagnostics..." },
    { cls: "t-cyan",    text: "> All systems operational ✓" },
    { cls: "t-comment", text: "// Ready to collaborate!" },
  ];

  let i = 0;
  function appendLine() {
    if (i >= lines.length) return;
    const span = document.createElement("span");
    span.className = "t-line " + (lines[i].cls || "");
    span.innerHTML = lines[i].text || "&nbsp;";
    span.style.animationDelay = "0s";
    body.appendChild(span);
    i++;
    setTimeout(appendLine, 180);
  }
  appendLine();
}

/* ─────────────────────────────────────────────
   8. SCROLL REVEAL
───────────────────────────────────────────── */

function startReveal() {
  const elements = qsa(".reveal");
  if (!elements.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Animate skill bars when visible
        const fill = qs(".skill-fill", entry.target);
        if (fill) {
          const pct = fill.dataset.fill;
          setTimeout(() => { fill.style.width = pct + "%"; }, 300);
        }
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach((el, idx) => {
    el.style.transitionDelay = (idx % 6) * 0.07 + "s";
    io.observe(el);
  });
}

/* ─────────────────────────────────────────────
   9. SKILLS TABS
───────────────────────────────────────────── */

function initSkillTabs() {
  const tabs   = qsa(".skill-tab");
  const panels = qsa(".skills-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t   => t.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));
      tab.classList.add("active");

      const target = qs("#tab-" + tab.dataset.tab);
      if (target) {
        target.classList.add("active");
        // Animate skill fills in the new panel
        qsa(".skill-fill", target).forEach(fill => {
          fill.style.width = "0";
          setTimeout(() => {
            fill.style.width = fill.dataset.fill + "%";
          }, 100);
        });
      }
    });
  });

  // Animate initial active tab fills when loaded
  qsa("#tab-frontend .skill-fill").forEach(fill => {
    fill.style.width = fill.dataset.fill + "%";
  });
}

/* ─────────────────────────────────────────────
   10. CONTACT FORM (client-side only)
───────────────────────────────────────────── */

function initContactForm() {
  const btn  = qs("#sendBtn");
  const note = qs("#formNote");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const name    = qs("#name")?.value.trim()    || "";
    const email   = qs("#email")?.value.trim()   || "";
    const message = qs("#message")?.value.trim() || "";

    if (!name || !email || !message) {
      if (note) { note.style.color = "var(--clr-red)"; note.textContent = "> Error: All fields required."; }
      return;
    }

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email)) {
      if (note) { note.style.color = "var(--clr-red)"; note.textContent = "> Error: Invalid email format."; }
      return;
    }

    // Simulate send (replace with fetch to backend when ready)
    btn.disabled = true;
    btn.querySelector("span").textContent = "Sending...";

    setTimeout(() => {
      if (note) {
        note.style.color = "var(--clr-green)";
        note.textContent = "> Message transmitted successfully ✓";
      }
      btn.querySelector("span").textContent = "Send Message";
      btn.disabled = false;
      qs("#name").value    = "";
      qs("#email").value   = "";
      qs("#message").value = "";
    }, 1400);
  });

  // Real-time input glow
  qsa(".form-group input, .form-group textarea").forEach(input => {
    input.addEventListener("focus",  () => input.parentElement.classList.add("focused"));
    input.addEventListener("blur",   () => input.parentElement.classList.remove("focused"));
  });
}

/* ─────────────────────────────────────────────
   11. SMOOTH SCROLL for anchor links
───────────────────────────────────────────── */

function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      const target = qs(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* ─────────────────────────────────────────────
   12. FOOTER YEAR
───────────────────────────────────────────── */

function initFooterYear() {
  const el = qs("#footerYear");
  if (el) el.textContent = new Date().getFullYear();
}

/* ─────────────────────────────────────────────
   13. GLITCH EFFECT on hero name (subtle)
───────────────────────────────────────────── */

function initGlitch() {
  const name = qs(".hero-name");
  if (!name) return;

  setInterval(() => {
    if (Math.random() > 0.92) {
      name.style.textShadow = "2px 0 var(--clr-cyan), -2px 0 var(--clr-red)";
      setTimeout(() => { name.style.textShadow = ""; }, 80);
    }
  }, 2000);
}

/* ─────────────────────────────────────────────
   14. TILT EFFECT on project cards (subtle)
───────────────────────────────────────────── */

function initCardTilt() {
  qsa(".project-card").forEach(card => {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-5px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

/* ─────────────────────────────────────────────
   15. DYNAMIC SCANLINE EFFECT (CSS-only helper)
───────────────────────────────────────────── */

function addScanlines() {
  const scanline = document.createElement("div");
  scanline.style.cssText = `
    position:fixed;inset:0;pointer-events:none;z-index:9990;
    background:repeating-linear-gradient(
      to bottom,
      rgba(0,255,136,0.012) 0px,
      rgba(0,255,136,0.012) 1px,
      transparent 1px,
      transparent 4px
    );
  `;
  document.body.appendChild(scanline);
}

/* ─────────────────────────────────────────────
   INIT — Run everything on DOMContentLoaded
───────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  initMatrix();
  initCursor();
  initNavbar();
  initMobileMenu();
  initTyping();
  initTerminal();
  initSkillTabs();
  initContactForm();
  initSmoothScroll();
  initFooterYear();
  initGlitch();
  initCardTilt();
  addScanlines();
  runLoader(); // loader calls startReveal() when done
});
