/**
 * VAPE HOUSE - Interactive Engine & Realistic Vapor Simulation
 * Palette:
 * - Lime: #A3FF12
 * - Purple: #8B00FF
 * - Charcoal: #0B0D12
 * - White: #FFFFFF
 * - Light Gray: #F4F6F9
 */

document.addEventListener('DOMContentLoaded', () => {
  initDynamicTitle();
  initRealisticSmokeEngine();
  initParallax3D();
  initCategoryDock();
  initVerticalSlider();
  initModalsAndDrawers();
  initAudioInteractions();
  initCategoryAndTrendingSection();
  initFloatingActionControls();
});

/* ==========================================================================
   1. Dynamic Changing Title Text Effect
   ========================================================================== */
function initDynamicTitle() {
  const dynamicTextEl = document.getElementById('dynamic-title-text');
  if (!dynamicTextEl) return;

  const phrases = [
    'Vape Store',
    'Flavour Lounge',
    'Cloud Haven',
    'Pod Universe',
    'Salt Bar'
  ];

  let phraseIndex = 0;
  let charIndex = phrases[0].length;
  let isDeleting = true;
  let typingSpeed = 100;

  function typeLoop() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      charIndex--;
      dynamicTextEl.textContent = currentPhrase.substring(0, charIndex);
      typingSpeed = 45;
    } else {
      charIndex++;
      dynamicTextEl.textContent = currentPhrase.substring(0, charIndex);
      typingSpeed = 95;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      typingSpeed = 2200; // Pause at full word
      isDeleting = true;
      dynamicTextEl.classList.add('glow-lime-text');
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typingSpeed = 400; // Pause before typing new word
    }

    setTimeout(typeLoop, typingSpeed);
  }

  setTimeout(typeLoop, 2000);
}

/* ==========================================================================
   2. Realistic Animated Atmospheric Smoke Engine (Canvas Vapor Physics)
   ========================================================================== */
function initRealisticSmokeEngine() {
  const canvas = document.getElementById('smoke-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = canvas.parentElement.offsetWidth);
  let height = (canvas.height = canvas.parentElement.offsetHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  });

  // Pre-render multi-octave soft organic smoke puffs to offscreen canvases
  const spriteTypes = ['white', 'lime', 'purple', 'ambient'];
  const smokeSprites = {};

  spriteTypes.forEach((type) => {
    const offCanvas = document.createElement('canvas');
    const size = 256;
    offCanvas.width = size;
    offCanvas.height = size;
    const offCtx = offCanvas.getContext('2d');

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2;

    const grad = offCtx.createRadialGradient(cx, cy, 0, cx, cy, r);

    if (type === 'white') {
      grad.addColorStop(0, 'rgba(235, 242, 255, 0.45)');
      grad.addColorStop(0.3, 'rgba(215, 225, 240, 0.32)');
      grad.addColorStop(0.65, 'rgba(180, 195, 215, 0.12)');
      grad.addColorStop(1, 'rgba(180, 195, 215, 0)');
    } else if (type === 'lime') {
      grad.addColorStop(0, 'rgba(163, 255, 18, 0.5)');
      grad.addColorStop(0.35, 'rgba(163, 255, 18, 0.28)');
      grad.addColorStop(0.7, 'rgba(163, 255, 18, 0.08)');
      grad.addColorStop(1, 'rgba(163, 255, 18, 0)');
    } else if (type === 'purple') {
      grad.addColorStop(0, 'rgba(139, 0, 255, 0.45)');
      grad.addColorStop(0.35, 'rgba(139, 0, 255, 0.22)');
      grad.addColorStop(0.7, 'rgba(139, 0, 255, 0.06)');
      grad.addColorStop(1, 'rgba(139, 0, 255, 0)');
    } else {
      grad.addColorStop(0, 'rgba(200, 215, 230, 0.25)');
      grad.addColorStop(0.5, 'rgba(160, 180, 205, 0.12)');
      grad.addColorStop(1, 'rgba(160, 180, 205, 0)');
    }

    offCtx.fillStyle = grad;
    offCtx.beginPath();
    offCtx.arc(cx, cy, r, 0, Math.PI * 2);
    offCtx.fill();

    // Add organic soft puff nodules
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.random() * 0.5;
      const dist = r * 0.28;
      const nodX = cx + Math.cos(angle) * dist;
      const nodY = cy + Math.sin(angle) * dist;
      const nodR = r * 0.45;

      const nodGrad = offCtx.createRadialGradient(nodX, nodY, 0, nodX, nodY, nodR);
      nodGrad.addColorStop(0, type === 'lime' ? 'rgba(163,255,18,0.2)' : 'rgba(220,230,245,0.18)');
      nodGrad.addColorStop(1, 'rgba(0,0,0,0)');

      offCtx.fillStyle = nodGrad;
      offCtx.beginPath();
      offCtx.arc(nodX, nodY, nodR, 0, Math.PI * 2);
      offCtx.fill();
    }

    smokeSprites[type] = offCanvas;
  });

  // Mouse interaction state
  let mouse = {
    x: width * 0.65,
    y: height * 0.6,
    prevX: width * 0.65,
    prevY: height * 0.6,
    vx: 0,
    vy: 0,
    isHovering: false
  };

  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const currX = e.clientX - rect.left;
    const currY = e.clientY - rect.top;

    mouse.vx = (currX - mouse.prevX) * 0.4;
    mouse.vy = (currY - mouse.prevY) * 0.4;
    mouse.x = currX;
    mouse.y = currY;
    mouse.prevX = currX;
    mouse.prevY = currY;
    mouse.isHovering = true;
  });

  canvas.parentElement.addEventListener('mouseleave', () => {
    mouse.isHovering = false;
  });

  // Smoke particle class
  class RealisticSmokeParticle {
    constructor(initialRandom = false) {
      this.reset(initialRandom);
    }

    reset(initialRandom = false) {
      // Choose emitter location:
      // 1: Center-Right Pedestal (behind ELFBAR & NASTY)
      // 2: Left Pedestal (behind iGET)
      // 3: Ambient background drift
      const emitterType = Math.random();

      if (emitterType < 0.45) {
        // Pedestal base & devices area
        this.x = width * 0.58 + (Math.random() - 0.5) * (width * 0.35);
        this.y = height * 0.72 + (Math.random() - 0.5) * 80;
      } else if (emitterType < 0.75) {
        // Left side wisps
        this.x = width * 0.42 + (Math.random() - 0.5) * (width * 0.25);
        this.y = height * 0.68 + (Math.random() - 0.5) * 100;
      } else {
        // Ambient background
        this.x = Math.random() * width;
        this.y = initialRandom ? Math.random() * height : height * 0.85;
      }

      // If initial random, disperse vertically
      if (initialRandom) {
        this.y = Math.random() * height;
      }

      this.size = Math.random() * 90 + 70;
      this.maxSize = this.size * (Math.random() * 2.2 + 2.0);
      this.growthRate = Math.random() * 0.45 + 0.25;

      // Drift velocities
      this.vx = (Math.random() - 0.5) * 0.55;
      this.vy = -(Math.random() * 0.85 + 0.45); // Steady upward wafting

      this.angle = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.007;

      // Curl turbulence parameters
      this.phase = Math.random() * Math.PI * 2;
      this.freq = Math.random() * 0.003 + 0.0015;
      this.curlAmp = Math.random() * 0.85 + 0.35;

      this.life = 0;
      this.maxLife = Math.random() * 320 + 260;
      this.maxAlpha = Math.random() * 0.42 + 0.18;

      // Select sprite: white vapor, lime, purple or ambient
      const randColor = Math.random();
      if (randColor < 0.55) {
        this.spriteType = 'white';
      } else if (randColor < 0.85) {
        this.spriteType = 'lime';
      } else {
        this.spriteType = 'purple';
      }
    }

    update() {
      this.life++;

      // Natural curl motion (sinusoidal wind eddy)
      this.x += this.vx + Math.sin(this.life * this.freq + this.phase) * this.curlAmp;
      this.y += this.vy;

      this.size += this.growthRate;
      this.angle += this.rotSpeed;

      // Mouse turbulence disturbance
      if (mouse.isHovering) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 1) {
          const force = (180 - dist) / 180;
          this.x += (dx / dist) * force * 3.5 + mouse.vx * 0.35;
          this.y += (dy / dist) * force * 3.5 + mouse.vy * 0.35;
        }
      }

      // Smooth alpha envelope: fade in, linger, smooth dissipation
      const progress = this.life / this.maxLife;
      if (progress < 0.2) {
        this.alpha = (progress / 0.2) * this.maxAlpha;
      } else if (progress < 0.65) {
        this.alpha = this.maxAlpha;
      } else {
        this.alpha = (1 - (progress - 0.65) / 0.35) * this.maxAlpha;
      }

      // Reset when particle life ends or drifts off-screen
      if (this.life >= this.maxLife || this.y < -120 || this.x < -120 || this.x > width + 120) {
        this.reset(false);
      }
    }

    draw() {
      if (this.alpha <= 0) return;

      const sprite = smokeSprites[this.spriteType];
      if (!sprite) return;

      ctx.save();
      ctx.globalAlpha = Math.min(1, Math.max(0, this.alpha));
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.drawImage(
        sprite,
        -this.size / 2,
        -this.size / 2,
        this.size,
        this.size
      );
      ctx.restore();
    }
  }

  // Bottle Mouthpiece Smoke Emitter Tracking for Individual 3D Bottles
  let activeBottleEmitter = null;
  const heroBottles = document.querySelectorAll('.hero-bottle-card, .vape-bottle-item');

  heroBottles.forEach((bottle) => {
    bottle.addEventListener('mouseenter', () => {
      const rect = bottle.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      activeBottleEmitter = {
        x: rect.left + rect.width / 2 - canvasRect.left,
        y: rect.top + 15 - canvasRect.top,
        type: bottle.getAttribute('data-bottle') || 'maxpro'
      };
    });

    bottle.addEventListener('mousemove', () => {
      if (activeBottleEmitter) {
        const rect = bottle.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        activeBottleEmitter.x = rect.left + rect.width / 2 - canvasRect.left;
        activeBottleEmitter.y = rect.top + 15 - canvasRect.top;
      }
    });

    bottle.addEventListener('mouseleave', () => {
      activeBottleEmitter = null;
    });

    bottle.addEventListener('click', () => {
      const bType = bottle.getAttribute('data-bottle');
      if (bType === 'raya') {
        showFloatingToast('🍇 ELFBAR RAYA D1 Watermelon Ice (6,000 Puffs)');
      } else if (bType === 'maxpro') {
        showFloatingToast('👑 ELFBAR MAX PRO 40,000 Puffs Flagship Selected');
      } else if (bType === 'bc4000') {
        showFloatingToast('⚡ ELFBAR BC4000 Smart Display • Mix Berries');
      }
    });
  });

  // Populate particles
  const particles = [];
  const totalParticles = 48; // Rich volumetric smoke cloud density

  for (let i = 0; i < totalParticles; i++) {
    particles.push(new RealisticSmokeParticle(true));
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // If bottle is hovered, inject active mouth smoke stream
    if (activeBottleEmitter && Math.random() < 0.75) {
      const p = new RealisticSmokeParticle(false);
      p.x = activeBottleEmitter.x + (Math.random() - 0.5) * 14;
      p.y = activeBottleEmitter.y + (Math.random() - 0.5) * 6;
      p.size = 35;
      p.maxSize = 150;
      p.growthRate = 0.55;
      p.vy = -(Math.random() * 1.6 + 0.9); // Energetic plume rising
      p.vx = (Math.random() - 0.5) * 0.45;
      p.maxAlpha = 0.55;
      p.maxLife = 180;
      if (activeBottleEmitter.type === 'gold') p.spriteType = 'lime';
      else if (activeBottleEmitter.type === 'raya' || activeBottleEmitter.type === 'dualmesh') p.spriteType = 'purple';
      else p.spriteType = 'white';

      particles.push(p);
      if (particles.length > 75) particles.shift();
    }

    // Use screen blend mode for glowing vapor layers
    ctx.globalCompositeOperation = 'screen';

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   3. 3D Tilt Parallax on Showcase
   ========================================================================== */
function initParallax3D() {
  const container = document.getElementById('hero-showcase-container');
  const target = document.getElementById('hero-showcase-tilt');
  if (!container || !target) return;

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = -(y / (rect.height / 2)) * 6.5;
    const rotY = (x / (rect.width / 2)) * 8.5;

    target.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  });

  container.addEventListener('mouseleave', () => {
    target.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    target.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => {
      target.style.transition = '';
    }, 600);
  });
}

/* ==========================================================================
   4. Bottom Category Dock Interaction (White Dock)
   ========================================================================== */
function initCategoryDock() {
  const tabs = document.querySelectorAll('.category-tab-white');
  const subtitleEl = document.querySelector('.hero-subtitle');

  const categoryDescriptions = {
    'disposable': 'Disposable Vapes, Reusable Kits, Nicotine Salts & Pods — All in One Place.',
    'reusable': 'High-performance refillable pod systems, box mods, and sub-ohm starter kits.',
    'salts': 'Ultra-smooth premium nicotine salts (20mg – 50mg) in 40+ exotic fruity & ice flavors.',
    'pods': 'Pre-filled and empty replacement magnetic pods compatible with top vape brands.'
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.getAttribute('data-category');
      if (subtitleEl && categoryDescriptions[cat]) {
        subtitleEl.style.opacity = '0';
        subtitleEl.style.transform = 'translateY(6px)';
        setTimeout(() => {
          subtitleEl.textContent = categoryDescriptions[cat];
          subtitleEl.style.opacity = '1';
          subtitleEl.style.transform = 'translateY(0)';
          subtitleEl.style.transition = 'all 0.3s ease';
        }, 150);
      }

      tab.classList.add('scale-95');
      setTimeout(() => tab.classList.remove('scale-95'), 150);
    });
  });
}

/* ==========================================================================
   5. Vertical Slider Controls
   ========================================================================== */
function initVerticalSlider() {
  const dots = document.querySelectorAll('.slider-dot');
  const btnUp = document.getElementById('slider-btn-up');
  const btnDown = document.getElementById('slider-btn-down');
  const topBadge = document.querySelector('.top-brands-card');

  let currentSlide = 0;
  const totalSlides = dots.length;

  const slidesData = [
    { title: 'Top Vape Brands', count: '40,000+ Puffs' },
    { title: 'ELFBAR Ultra 40K', count: 'Smart LED Display' },
    { title: 'iGET Pro Duo', count: 'Dual Mesh Coil' }
  ];

  const slide1 = document.getElementById('slide-trio-1');
  const slide2 = document.getElementById('slide-trio-2');

  function setSlide(idx) {
    currentSlide = (idx + totalSlides) % totalSlides;
    dots.forEach((dot, i) => {
      if (i === currentSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    const masterWrapper = document.querySelector('.master-vapes-wrapper');
    if (masterWrapper) {
      if (currentSlide === 0) {
        masterWrapper.style.transform = '';
      } else {
        masterWrapper.style.transform = 'scale(1.07) translateY(-12px)';
      }
    }

    if (topBadge && slidesData[currentSlide]) {
      const titleSpan = topBadge.querySelector('.brand-badge-title');
      if (titleSpan) {
        titleSpan.textContent = slidesData[currentSlide].title;
      }
    }
  }

  if (btnUp) {
    btnUp.addEventListener('click', () => setSlide(currentSlide - 1));
  }

  if (btnDown) {
    btnDown.addEventListener('click', () => setSlide(currentSlide + 1));
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index') || '0', 10);
      setSlide(idx);
    });
  });
}

/* ==========================================================================
   6. Modals, Search & Mini Cart Drawer
   ========================================================================== */
function initModalsAndDrawers() {
  // Search Modal
  const btnSearch = document.getElementById('btn-search-trigger');
  const searchModal = document.getElementById('search-modal');
  const closeSearch = document.getElementById('close-search-modal');
  const searchInput = document.getElementById('search-input');

  if (btnSearch && searchModal) {
    btnSearch.addEventListener('click', () => {
      searchModal.classList.remove('hidden');
      setTimeout(() => {
        searchModal.classList.remove('opacity-0');
        if (searchInput) searchInput.focus();
      }, 10);
    });
  }

  if (closeSearch && searchModal) {
    closeSearch.addEventListener('click', () => {
      searchModal.classList.add('opacity-0');
      setTimeout(() => searchModal.classList.add('hidden'), 250);
    });
  }

  // Cart Drawer
  const btnCart = document.getElementById('btn-cart-trigger');
  const cartDrawer = document.getElementById('cart-drawer');
  const closeCart = document.getElementById('close-cart-drawer');
  const cartOverlay = document.getElementById('cart-drawer-overlay');
  const cartBadge = document.getElementById('cart-badge');

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('hidden');
    setTimeout(() => {
      cartDrawer.classList.remove('translate-x-full');
      if (cartOverlay) cartOverlay.classList.remove('opacity-0');
    }, 10);
  }

  function closeCartDrawer() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('translate-x-full');
    if (cartOverlay) cartOverlay.classList.add('opacity-0');
    setTimeout(() => cartDrawer.classList.add('hidden'), 350);
  }

  if (btnCart) btnCart.addEventListener('click', openCart);
  if (closeCart) closeCart.addEventListener('click', closeCartDrawer);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

  // Shop Now Quick Action
  const btnShopNow = document.getElementById('btn-shop-now');
  if (btnShopNow) {
    btnShopNow.addEventListener('click', () => {
      if (cartBadge) {
        let count = parseInt(cartBadge.textContent || '0', 10) + 1;
        cartBadge.textContent = count;
        cartBadge.classList.add('scale-125');
        setTimeout(() => cartBadge.classList.remove('scale-125'), 300);
      }
      openCart();
    });
  }

  // Explore Collection Modal
  const btnExplore = document.getElementById('btn-explore-collection');
  const exploreModal = document.getElementById('explore-modal');
  const closeExplore = document.getElementById('close-explore-modal');

  if (btnExplore && exploreModal) {
    btnExplore.addEventListener('click', () => {
      exploreModal.classList.remove('hidden');
      setTimeout(() => exploreModal.classList.remove('opacity-0'), 10);
    });
  }

  if (closeExplore && exploreModal) {
    closeExplore.addEventListener('click', () => {
      exploreModal.classList.add('opacity-0');
      setTimeout(() => exploreModal.classList.add('hidden'), 250);
    });
  }

  // City Selector Dropdown
  const cityTrigger = document.getElementById('city-selector-trigger');
  const cityMenu = document.getElementById('city-selector-menu');
  const cityCurrent = document.getElementById('city-current-name');

  if (cityTrigger && cityMenu) {
    cityTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      cityMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      cityMenu.classList.add('hidden');
    });

    cityMenu.querySelectorAll('[data-city]').forEach((item) => {
      item.addEventListener('click', () => {
        const city = item.getAttribute('data-city');
        if (cityCurrent) cityCurrent.textContent = city;
        cityMenu.classList.add('hidden');
      });
    });
  }
}

/* ==========================================================================
   7. Micro Audio Feedback
   ========================================================================== */
function initAudioInteractions() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    let ctx = null;

    function playTick(freq = 600, duration = 0.04) {
      if (!ctx) ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    }

    document.querySelectorAll('.category-tab-white, .slider-arrow-btn, .btn-lime, .trend-tab, .carousel-btn, .card-cart-btn, .cat-arrow-btn, .view-all-cat-btn, .brand-pill-btn, .trust-feature-card, .promo-banner-card, .footer-social-btn, .footer-link').forEach((el) => {
      el.addEventListener('mouseenter', () => playTick(800, 0.03));
      el.addEventListener('click', () => playTick(1100, 0.05));
    });
  } catch (e) {
    // Fail silently
  }
}

/* ==========================================================================
   8. Shop by Category & Trending Products Interactive Engine
   ========================================================================== */
function initCategoryAndTrendingSection() {
  // A. Scroll Entrance Reveal Observer
  const revealElements = document.querySelectorAll('.anim-reveal');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  // B. Trending Products Carousel Navigation
  const track = document.getElementById('trend-carousel-track');
  const prevBtn = document.getElementById('trend-prev-btn');
  const nextBtn = document.getElementById('trend-next-btn');

  if (track && prevBtn && nextBtn) {
    const scrollStep = 280;

    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -scrollStep, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: scrollStep, behavior: 'smooth' });
    });

    // Touch / Drag to scroll support
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    track.addEventListener('mousedown', (e) => {
      isDown = true;
      track.classList.add('cursor-grabbing');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      isDown = false;
      if (track) track.classList.remove('cursor-grabbing');
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });
  }

  // C. Interactive Category Filtering Tabs in Trending Section
  const filterTabs = document.querySelectorAll('.trend-tab');
  const productCards = document.querySelectorAll('.trend-card-item');

  function filterTrendingProducts(category) {
    filterTabs.forEach((t) => {
      if (t.getAttribute('data-filter') === category) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    productCards.forEach((card) => {
      const cardCat = card.getAttribute('data-cat');
      if (category === 'all' || cardCat === category) {
        card.style.display = 'flex';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95) translateY(10px)';
        setTimeout(() => {
          card.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
          card.style.opacity = '1';
          card.style.transform = 'scale(1) translateY(0)';
        }, 30);
      } else {
        card.style.display = 'none';
      }
    });

    if (track) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const cat = tab.getAttribute('data-filter');
      filterTrendingProducts(cat);
    });
  });

  // D. Category Cards at the top can also activate category filter and scroll smoothly
  const categoryCards = document.querySelectorAll('.category-glass-card');
  categoryCards.forEach((card) => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-cat');
      if (cat) {
        filterTrendingProducts(cat);
        const trendingSection = document.getElementById('trend-carousel-track');
        if (trendingSection) {
          trendingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  });

  // Navigate to individual product details page when clicking a card
  const slugList = [
    'elfbar-raya-d3',
    'caliburn-g3-lite',
    'nasty-cush-man-mango-salt',
    'caliburn-g4-pro',
    'oxva-xlim-pro-2',
    'caliburn-a2',
    'g5-lite-koko'
  ];
  productCards.forEach((card, idx) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-cart-btn') || e.target.closest('.wishlist-heart-btn')) {
        return;
      }
      const targetSlug = slugList[idx % slugList.length];
      window.location.href = `/products/${targetSlug}`;
    });
  });

  // E. Wishlist Heart Button Toggle
  const wishlistButtons = document.querySelectorAll('.wishlist-heart-btn');
  wishlistButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.classList.toggle('active');
      const isActive = btn.classList.contains('active');
      
      const svg = btn.querySelector('svg');
      if (isActive) {
        svg.setAttribute('fill', '#EF4444');
        svg.setAttribute('stroke', '#EF4444');
        showFloatingToast('Added to your Wishlist ❤️');
      } else {
        svg.removeAttribute('fill');
        svg.setAttribute('stroke', 'currentColor');
        showFloatingToast('Removed from Wishlist');
      }
    });
  });

  // F. Product Add to Cart Action
  const cartButtons = document.querySelectorAll('.card-cart-btn');
  const cartBadge = document.getElementById('cart-badge');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-drawer-overlay');

  cartButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const title = btn.getAttribute('data-title') || 'Vape Product';
      const price = btn.getAttribute('data-price') || '2499';

      // Increment Badge Count
      if (cartBadge) {
        let count = parseInt(cartBadge.textContent.trim() || '0', 10);
        count++;
        cartBadge.textContent = count;
        cartBadge.classList.add('scale-125');
        setTimeout(() => cartBadge.classList.remove('scale-125'), 300);
      }

      // Add item into the drawer list if present
      const cartList = document.querySelector('#cart-drawer .space-y-4');
      if (cartList) {
        const newItem = document.createElement('div');
        newItem.className = 'bg-white/5 border border-white/10 rounded-xl p-3.5 flex gap-3 items-center anim-fade-in';
        newItem.innerHTML = `
          <div class="w-14 h-14 bg-[#0B0D12] rounded-lg border border-[#A3FF12]/30 flex items-center justify-center text-[#A3FF12] font-black text-xs">
            VAPE
          </div>
          <div class="flex-grow">
            <div class="font-bold text-sm text-white">${title}</div>
            <div class="text-xs text-gray-400">Authentic & Verified Batch</div>
            <div class="text-sm font-extrabold text-[#A3FF12] mt-1">₹ ${price}</div>
          </div>
          <div class="flex items-center gap-1.5 text-xs bg-white/10 px-2 py-1 rounded-md">
            <span>Qty: 1</span>
          </div>
        `;
        cartList.prepend(newItem);
      }

      showFloatingToast(`Added "${title}" to Cart! 🛒`);
    });
  });

  // G. Brand Pills Interactive Selection
  const brandPills = document.querySelectorAll('.brand-pill-btn');
  brandPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const brand = pill.getAttribute('data-brand') || 'Vape Brand';
      showFloatingToast(`Showing collection for ${brand} ✦`);
      
      // If brand has matching category, activate filter
      if (brand.toUpperCase() === 'ELFBAR') {
        filterTrendingProducts('disposable');
      } else if (brand.toUpperCase() === 'NASTY') {
        filterTrendingProducts('salts');
      } else if (brand.toUpperCase() === 'VOOPOO' || brand.toUpperCase() === 'OXVA') {
        filterTrendingProducts('reusable');
      } else {
        filterTrendingProducts('all');
      }

      const trendingSection = document.getElementById('trending-products') || document.getElementById('trend-carousel-track');
      if (trendingSection) {
        trendingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // H. Promo Banners Quick Filter Actions
  const btnExploreDisposable = document.querySelector('a[href*="trending-products"], .promo-banner-purple a');
  if (btnExploreDisposable) {
    btnExploreDisposable.addEventListener('click', (e) => {
      e.preventDefault();
      filterTrendingProducts('disposable');
      const target = document.getElementById('trending-products') || document.getElementById('trend-carousel-track');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const btnShopKits = document.querySelector('.promo-banner-green a');
  if (btnShopKits) {
    btnShopKits.addEventListener('click', (e) => {
      e.preventDefault();
      filterTrendingProducts('reusable');
      const target = document.getElementById('trending-products') || document.getElementById('trend-carousel-track');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // I. Trust Feature Cards Feedback
  const trustCards = document.querySelectorAll('.trust-feature-card');
  trustCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      const messages = [
        '⚡ Hyperlocal Express: 25-minute instant delivery active in Bangalore!',
        '🛡️ 100% Authentic: Every device includes a verifiable QR authenticity seal.',
        '📦 Discreet Packaging: Shipped in plain, tamper-proof, odorless boxes.',
        '🎧 24/7 Support: Live chat & WhatsApp assistance available round the clock.'
      ];
      showFloatingToast(messages[index] || 'Verified Vape House Guarantee!');
    });
  });

  // J. Footer Newsletter Form Submit
  const newsletterForm = document.getElementById('footer-newsletter-form');
  const newsletterInput = document.getElementById('footer-email-input');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterInput ? newsletterInput.value.trim() : '';
      if (email) {
        showFloatingToast(`Thank you for subscribing (${email})! ✉️`);
        if (newsletterInput) newsletterInput.value = '';
      }
    });
  }

  // Floating Micro-Toast Notification Utility (Positioned at Bottom-Left to prevent overlapping floating action buttons)
  function showFloatingToast(message) {
    let toast = document.getElementById('vape-house-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'vape-house-toast';
      toast.className = 'fixed bottom-6 left-6 z-50 bg-[#121620]/95 backdrop-blur-md border border-[#A3FF12]/40 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-12 opacity-0 font-medium text-sm pointer-events-none';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <span class="w-2.5 h-2.5 rounded-full bg-[#A3FF12] shadow-[0_0_8px_#A3FF12]"></span>
      <span>${message}</span>
    `;

    toast.classList.remove('translate-y-12', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.add('translate-y-12', 'opacity-0');
      toast.classList.remove('translate-y-0', 'opacity-100');
    }, 2800);
  }
}

/* ==========================================================================
   8. Floating Action Controls (Back to Top & WhatsApp)
   ========================================================================== */
function initFloatingActionControls() {
  const btnBackToTop = document.getElementById('btn-back-to-top');
  const btnWhatsApp = document.getElementById('btn-whatsapp');

  if (btnBackToTop) {
    // Show/hide based on scroll offset (threshold: 350px)
    const handleScroll = () => {
      if (window.scrollY > 350) {
        btnBackToTop.classList.add('is-visible');
      } else {
        btnBackToTop.classList.remove('is-visible');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on init
    handleScroll();

    // Smooth scroll back to top on click
    btnBackToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      // Soft audio tick
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (err) {}
    });
  }

  if (btnWhatsApp) {
    btnWhatsApp.addEventListener('click', () => {
      // Soft audio feedback
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(650, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } catch (err) {}
    });
  }
}
