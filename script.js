const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());

const panels = [...document.querySelectorAll(".panel[id]")];
const navLinks = [...document.querySelectorAll("[data-nav]")];
const landingPanel = document.querySelector(".hero");

const setActiveSection = (id) => {
  navLinks.forEach((link) => {
    if (link.dataset.nav === id) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
};

let navTicking = false;
const updateActiveSection = () => {
  const marker = window.innerHeight * 0.34;
  const active = panels.find((panel) => {
    const rect = panel.getBoundingClientRect();
    return rect.top <= marker && rect.bottom > marker;
  });
  if (active) setActiveSection(active.id);
  if (landingPanel) {
    const ribbonRevealLine = window.innerWidth <= 720 ? 68 : 84;
    document.body.classList.toggle("is-past-hero", landingPanel.getBoundingClientRect().bottom <= ribbonRevealLine);
  }
  navTicking = false;
};

window.addEventListener("scroll", () => {
  if (navTicking) return;
  navTicking = true;
  requestAnimationFrame(updateActiveSection);
}, { passive: true });

window.addEventListener("resize", updateActiveSection, { passive: true });

navLinks.forEach((link) => {
  link.addEventListener("click", () => setActiveSection(link.dataset.nav));
});
updateActiveSection();

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

const carousel = document.querySelector("[data-carousel]");
if (carousel) {
  const gallery = Array.isArray(window.PHOTOGRAPHY_GALLERY) ? window.PHOTOGRAPHY_GALLERY : [];
  const track = carousel.querySelector("[data-photo-track]");
  const dotGroup = carousel.querySelector("[data-photo-dots]");
  const total = carousel.querySelector("[data-total]");

  gallery.forEach((photo, photoIndex) => {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    const caption = document.createElement("figcaption");
    const dot = document.createElement("button");

    figure.className = `photo-slide${photoIndex === 0 ? " is-active" : ""}`;
    figure.dataset.slide = "";
    figure.setAttribute("aria-hidden", String(photoIndex !== 0));

    image.src = photo.src;
    image.alt = photo.alt;
    image.width = photo.width;
    image.height = photo.height;
    if (photoIndex !== 0) image.loading = "lazy";
    image.decoding = "async";

    caption.textContent = photo.caption;
    figure.append(image, caption);
    track?.append(figure);

    dot.type = "button";
    dot.dataset.dot = String(photoIndex);
    dot.className = photoIndex === 0 ? "is-active" : "";
    dot.setAttribute("aria-label", `Show photograph ${photoIndex + 1}: ${photo.caption}`);
    dot.setAttribute("aria-pressed", String(photoIndex === 0));
    dotGroup?.append(dot);
  });

  const slides = [...carousel.querySelectorAll("[data-slide]")];
  const dots = [...carousel.querySelectorAll("[data-dot]")];
  const current = carousel.querySelector("[data-current]");
  let index = 0;
  let touchStart = 0;

  if (total) total.textContent = String(slides.length).padStart(2, "0");

  const show = (next) => {
    if (!slides.length) return;
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === index;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-pressed", String(active));
    });
    if (current) current.textContent = String(index + 1).padStart(2, "0");
    if (track) track.style.setProperty("--active-photo", `url("${gallery[index].src}")`);
  };

  carousel.querySelector("[data-previous]")?.addEventListener("click", () => show(index - 1));
  carousel.querySelector("[data-next]")?.addEventListener("click", () => show(index + 1));
  dots.forEach((dot) => dot.addEventListener("click", () => show(Number(dot.dataset.dot))));
  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(index - 1);
    if (event.key === "ArrowRight") show(index + 1);
  });
  carousel.addEventListener("touchstart", (event) => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
  carousel.addEventListener("touchend", (event) => {
    const distance = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(distance) > 45) show(index + (distance < 0 ? 1 : -1));
  }, { passive: true });

  show(0);
}

const contactForm = document.querySelector("[data-contact-form]");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const subject = String(data.get("subject") || "Hello Stephen").trim();
    const message = String(data.get("message") || "").trim();
    const body = [`From: ${name}`, `Email: ${email}`, "", message].join("\n");
    window.location.href = `mailto:bushi.stephen@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

const heroArt = document.querySelector("[data-hero-art]");
if (heroArt) {
  const hero = heroArt.closest(".hero");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pointerStart = null;
  let boostTimer = 0;

  const updateParallax = (event) => {
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * -12;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
    heroArt.style.setProperty("--art-x", `${x.toFixed(2)}px`);
    heroArt.style.setProperty("--art-y", `${y.toFixed(2)}px`);
  };

  const boost = (distance = 0) => {
    if (!hero || reduceMotion) return;
    window.clearTimeout(boostTimer);
    hero.style.setProperty("--boost-duration", distance > 36 ? "480ms" : "760ms");
    hero.classList.remove("is-boosted");
    heroArt.dataset.motion = "boosted";
    requestAnimationFrame(() => {
      hero.classList.add("is-boosted");
    });
    hero.dispatchEvent(new CustomEvent("hero-motion-boost", { detail: { distance } }));
    boostTimer = window.setTimeout(() => {
      hero.classList.remove("is-boosted");
      heroArt.dataset.motion = "idle";
    }, 800);
  };

  heroArt.dataset.motion = "idle";
  if (hero && !reduceMotion) {
    hero.addEventListener("pointermove", updateParallax, { passive: true });
    hero.addEventListener("pointerdown", (event) => {
      updateParallax(event);
      pointerStart = { x: event.clientX, y: event.clientY };
    }, { passive: true });
    hero.addEventListener("pointerup", (event) => {
      updateParallax(event);
      if (!pointerStart) return;
      const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
      boost(distance);
      pointerStart = null;
    }, { passive: true });
    hero.addEventListener("pointercancel", () => { pointerStart = null; }, { passive: true });
    hero.addEventListener("pointerleave", () => {
      if (!pointerStart) {
        heroArt.style.setProperty("--art-x", "0px");
        heroArt.style.setProperty("--art-y", "0px");
      }
    }, { passive: true });
  }
}

const heroMotion = document.querySelector("[data-hero-motion]");
if (heroMotion) {
  const hero = heroMotion.closest(".hero");
  const heroName = hero?.querySelector(".hero-name");
  const context = heroMotion.getContext("2d", { alpha: true });
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const warmLine = [246, 222, 178];
  let width = 0;
  let height = 0;
  let clearZone = null;
  let animationFrame = 0;
  let visible = true;
  let lastTime = performance.now();
  let lastPaint = 0;
  let motionClock = 0;
  let speed = 1;
  let targetSpeed = 1;
  let boostTimer = 0;

  let seed = 1847;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const stars = Array.from({ length: 30 }, () => ({
    x: 0.035 + random() * 0.93,
    y: 0.03 + random() * 0.235,
    size: 0.8 + random() * 1.45,
    phase: random() * Math.PI * 2,
    rhythm: 0.55 + random() * 1.1,
  }));

  const bits = Array.from({ length: 27 }, (_, bitIndex) => ({
    lane: bitIndex % 6,
    offset: random(),
    pace: 0.7 + random() * 0.7,
    phase: random() * Math.PI * 2,
    length: 3 + random() * 8,
  }));

  const notes = Array.from({ length: 11 }, (_, noteIndex) => ({
    lane: noteIndex % 4,
    offset: random(),
    pace: 0.62 + random() * 0.62,
    phase: random() * Math.PI * 2,
    scale: 0.72 + random() * 0.5,
  }));

  const rgba = (alpha) => `rgba(${warmLine[0]}, ${warmLine[1]}, ${warmLine[2]}, ${alpha})`;
  const insideClearZone = (x, y, padding = 0) => clearZone
    && x >= clearZone.x - padding
    && x <= clearZone.x + clearZone.width + padding
    && y >= clearZone.y - padding
    && y <= clearZone.y + clearZone.height + padding;

  const resizeMotion = () => {
    if (!hero || !context) return;
    const heroBounds = hero.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, heroBounds.width);
    height = Math.max(1, heroBounds.height);
    heroMotion.width = Math.round(width * pixelRatio);
    heroMotion.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    if (heroName) {
      const nameBounds = heroName.getBoundingClientRect();
      clearZone = {
        x: nameBounds.left - heroBounds.left,
        y: nameBounds.top - heroBounds.top,
        width: nameBounds.width,
        height: nameBounds.height,
      };
    }
  };

  const drawStars = (time) => {
    stars.forEach((star) => {
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.0022 * star.rhythm + star.phase);
      const alpha = 0.12 + Math.pow(pulse, 3) * 0.68;
      const x = star.x * width;
      const y = star.y * height;
      const radius = star.size * (0.72 + pulse * 0.55);
      context.strokeStyle = rgba(alpha);
      context.lineWidth = 0.75;
      context.beginPath();
      context.moveTo(x - radius * 2.2, y);
      context.lineTo(x + radius * 2.2, y);
      context.moveTo(x, y - radius * 2.2);
      context.lineTo(x, y + radius * 2.2);
      context.stroke();
    });
  };

  const drawBits = (time) => {
    bits.forEach((bit) => {
      const progress = (bit.offset + time * 0.000026 * bit.pace) % 1;
      const x = progress * (width + 60) - 30;
      const y = height * (0.338 + bit.lane * 0.034 + Math.sin(time * 0.0012 + bit.phase) * 0.0045);
      if (insideClearZone(x, y, 14)) return;
      const alpha = 0.2 + (0.5 + 0.5 * Math.sin(time * 0.0017 + bit.phase)) * 0.28;
      context.strokeStyle = rgba(alpha);
      context.fillStyle = rgba(Math.min(0.7, alpha + 0.17));
      context.lineWidth = 0.8;
      context.beginPath();
      context.moveTo(x - bit.length, y);
      context.lineTo(x, y);
      context.stroke();
      context.fillRect(x + 2, y - 1.35, 2.7, 2.7);
    });
  };

  const drawMusic = (time) => {
    notes.forEach((note) => {
      const progress = (note.offset + time * 0.000018 * note.pace) % 1;
      const x = progress * (width + 80) - 40;
      const y = height * (0.625 + note.lane * 0.033) + Math.sin(time * 0.001 + note.phase) * 5;
      if (insideClearZone(x, y, 18)) return;
      const size = 2.6 * note.scale;
      const alpha = 0.22 + (0.5 + 0.5 * Math.sin(time * 0.0014 + note.phase)) * 0.28;
      context.strokeStyle = rgba(alpha);
      context.lineWidth = 0.9;
      context.beginPath();
      context.ellipse(x, y, size * 1.35, size, -0.28, 0, Math.PI * 2);
      context.moveTo(x + size * 1.2, y - size * 0.25);
      context.lineTo(x + size * 1.2, y - size * 4.5);
      context.quadraticCurveTo(x + size * 3.2, y - size * 3.4, x + size * 4.1, y - size * 4.2);
      context.stroke();
    });
  };

  const drawWaves = (time) => {
    [0.845, 0.895, 0.947].forEach((base, waveIndex) => {
      context.strokeStyle = rgba(0.18 + waveIndex * 0.055);
      context.lineWidth = 0.9 + waveIndex * 0.15;
      context.beginPath();
      for (let x = -12; x <= width + 12; x += 10) {
        const phase = time * (0.00042 + waveIndex * 0.00007);
        const y = height * base
          + Math.sin(x * (0.018 + waveIndex * 0.003) - phase) * (4.5 + waveIndex * 1.8)
          + Math.sin(x * 0.007 + phase * 0.62) * 2.2;
        if (x === -12) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    });
  };

  const paintMotion = (time) => {
    context.clearRect(0, 0, width, height);
    drawStars(time);
    drawBits(time);
    drawMusic(time);
    drawWaves(time);
  };

  const animateMotion = (now) => {
    const elapsed = Math.min(50, now - lastTime);
    lastTime = now;
    speed += (targetSpeed - speed) * 0.055;
    motionClock += elapsed * speed;
    if (now - lastPaint >= 32) {
      paintMotion(motionClock);
      lastPaint = now;
    }
    animationFrame = requestAnimationFrame(animateMotion);
  };

  const startMotion = () => {
    if (reduceMotion || !visible || document.hidden || animationFrame) return;
    lastTime = performance.now();
    animationFrame = requestAnimationFrame(animateMotion);
  };

  const stopMotion = () => {
    if (!animationFrame) return;
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  resizeMotion();
  if (!reduceMotion && hero && context) {
    const resizeObserver = new ResizeObserver(resizeMotion);
    resizeObserver.observe(hero);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) startMotion();
      else stopMotion();
    }, { threshold: 0.02 });
    visibilityObserver.observe(hero);

    hero.addEventListener("hero-motion-boost", (event) => {
      window.clearTimeout(boostTimer);
      targetSpeed = event.detail?.distance > 36 ? 2.65 : 2.1;
      boostTimer = window.setTimeout(() => { targetSpeed = 1; }, 720);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopMotion();
      else startMotion();
    });
    startMotion();
  }
}
