/**
 * VAPE HOUSE - Offers & Deals Interactive Engine
 * Handles Flash Deals Live Countdown, Filter Tab Switching, Cart Updates,
 * Wishlist Sync, Bundle Actions, and Toast Notifications.
 */

document.addEventListener('DOMContentLoaded', () => {
  initDealsPage();
});

function initDealsPage() {
  // 1. Live Flash Deals Countdown Timer (6h 24m 15s initial target)
  initFlashCountdown();

  // 2. Sync Cart Badge
  updateCartBadge();

  // 3. Discount Filter Tabs in "More Offers for You"
  initDiscountFilters();

  // 4. Cart Add Event Listeners (Flash Deals, Bundles, and Offer Cards)
  initCartListeners();

  // 5. Wishlist Heart Event Listeners
  initWishlistListeners();

  // 6. Newsletter Subscription Form
  initNewsletter();
}

/**
 * Live Countdown Timer
 */
function initFlashCountdown() {
  const elHours = document.getElementById('flash-hours');
  const elMinutes = document.getElementById('flash-minutes');
  const elSeconds = document.getElementById('flash-seconds');

  if (!elHours || !elMinutes || !elSeconds) return;

  // Set target to ~6 hours 24 minutes 15 seconds from now or persist in session
  let targetTime = sessionStorage.getItem('vapehouse_deal_timer');
  if (!targetTime) {
    targetTime = Date.now() + (6 * 3600 + 24 * 60 + 15) * 1000;
    sessionStorage.setItem('vapehouse_deal_timer', targetTime);
  } else {
    targetTime = parseInt(targetTime, 10);
  }

  function tick() {
    let diff = Math.max(0, targetTime - Date.now());
    if (diff <= 0) {
      // Loop or reset to 8 hours
      targetTime = Date.now() + 8 * 3600 * 1000;
      sessionStorage.setItem('vapehouse_deal_timer', targetTime);
      diff = targetTime - Date.now();
    }

    const totalSeconds = Math.floor(diff / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    elHours.textContent = String(hrs).padStart(2, '0');
    elMinutes.textContent = String(mins).padStart(2, '0');
    elSeconds.textContent = String(secs).padStart(2, '0');
  }

  tick();
  setInterval(tick, 1000);
}

/**
 * Filter Pills in "More Offers for You"
 */
function initDiscountFilters() {
  const filterButtons = document.querySelectorAll('.filter-tab-pill');
  const offerCards = document.querySelectorAll('.offer-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active classes
      filterButtons.forEach(b => {
        b.classList.remove('active', 'bg-[#0B0D12]', 'text-white', 'border-[#0B0D12]');
        b.classList.add('border-gray-300', 'text-gray-700');
      });
      btn.classList.add('active', 'bg-[#0B0D12]', 'text-white', 'border-[#0B0D12]');
      btn.classList.remove('border-gray-300', 'text-gray-700');

      const filter = btn.dataset.filter;

      offerCards.forEach(card => {
        const discountVal = parseInt(card.dataset.discount, 10) || 0;
        let isMatch = true;

        if (filter === 'all') {
          isMatch = true;
        } else if (filter === 'up-to-10') {
          isMatch = discountVal <= 10;
        } else if (filter === '10-20') {
          isMatch = discountVal >= 10 && discountVal <= 20;
        } else if (filter === 'above-20') {
          isMatch = discountVal >= 20;
        }

        if (isMatch) {
          card.style.display = 'flex';
          card.classList.remove('opacity-0', 'scale-95');
          card.classList.add('opacity-100', 'scale-100');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/**
 * Cart Listeners for Flash Deals, Bundles & Offer Cards
 */
function initCartListeners() {
  // Flash Deals quick add round button
  document.querySelectorAll('.btn-quick-add').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.dataset.id;
      addToCart(id, 1);
      animateButton(btn);
    });
  });

  // Bundle Add to Cart buttons
  document.querySelectorAll('.btn-bundle-add').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = btn.dataset.name || 'Bundle Pack';
      addBundleToCart(name);
      animateButton(btn);
    });
  });

  // Offer Cards Add to Cart full-width dark buttons
  document.querySelectorAll('.btn-card-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.dataset.id;
      addToCart(id, 1);
      animateButton(btn);
    });
  });
}

function animateButton(btn) {
  btn.classList.add('scale-90');
  setTimeout(() => {
    btn.classList.remove('scale-90');
  }, 150);
}

function addToCart(productId, qty = 1) {
  try {
    const raw = localStorage.getItem('vapehouse_cart');
    let cart = raw ? JSON.parse(raw) : [];

    const existing = cart.find(i => i.id === productId);
    if (existing) {
      existing.quantity += qty;
    } else {
      let productTitle = productId;
      if (typeof PRODUCTS_DATA !== 'undefined') {
        const p = PRODUCTS_DATA.find(x => x.id === productId || x.slug === productId);
        if (p) productTitle = p.name;
      }
      cart.push({ id: productId, name: productTitle, quantity: qty });
    }

    localStorage.setItem('vapehouse_cart', JSON.stringify(cart));
    updateCartBadge();
    showToast(`Added to Cart! 🛍️`);
  } catch (e) {
    console.error('Error updating cart', e);
  }
}

function addBundleToCart(bundleName) {
  try {
    const raw = localStorage.getItem('vapehouse_cart');
    let cart = raw ? JSON.parse(raw) : [];

    const existing = cart.find(i => i.name === bundleName);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: `bundle-${Date.now()}`, name: bundleName, quantity: 1 });
    }

    localStorage.setItem('vapehouse_cart', JSON.stringify(cart));
    updateCartBadge();
    showToast(`Added ${bundleName} to Cart! 📦`);
  } catch (e) {
    console.error('Error updating cart', e);
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge-count');
  if (!badge) return;

  try {
    const raw = localStorage.getItem('vapehouse_cart');
    const cart = raw ? JSON.parse(raw) : [];
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    badge.textContent = count;
    badge.style.transform = 'scale(1.2)';
    setTimeout(() => {
      badge.style.transform = 'scale(1)';
    }, 200);
  } catch (e) {
    badge.textContent = '0';
  }
}

/**
 * Wishlist Listeners
 */
function initWishlistListeners() {
  document.querySelectorAll('.btn-deal-wishlist').forEach(btn => {
    const id = btn.dataset.id;
    updateSingleWishlistUI(btn, id);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleWishlist(id, btn);
    });
  });
}

function toggleWishlist(productId, btn) {
  try {
    const raw = localStorage.getItem('vapehouse_wishlist');
    let list = raw ? JSON.parse(raw) : [];

    const idx = list.indexOf(productId);
    if (idx > -1) {
      list.splice(idx, 1);
      showToast('Removed from Wishlist');
    } else {
      list.push(productId);
      showToast('Added to Wishlist! ❤️');
    }

    localStorage.setItem('vapehouse_wishlist', JSON.stringify(list));
    updateSingleWishlistUI(btn, productId);
  } catch (e) {
    console.error('Error toggling wishlist', e);
  }
}

function updateSingleWishlistUI(btn, productId) {
  try {
    const raw = localStorage.getItem('vapehouse_wishlist');
    const list = raw ? JSON.parse(raw) : [];
    const svg = btn.querySelector('svg');
    if (!svg) return;

    if (list.includes(productId)) {
      svg.classList.add('text-red-500', 'fill-red-500');
      svg.classList.remove('fill-none');
    } else {
      svg.classList.remove('text-red-500', 'fill-red-500');
      svg.classList.add('fill-none');
    }
  } catch (e) {
    // Ignore
  }
}

/**
 * Newsletter Form
 */
function initNewsletter() {
  const form = document.getElementById('deals-newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    const val = input ? input.value.trim() : '';
    if (val) {
      showToast(`Subscribed! You'll receive VIP discounts. 🎉`);
      if (input) input.value = '';
    }
  });
}

/**
 * Sleek Floating Toast Notification
 */
function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'fixed bottom-6 right-6 z-50 bg-[#0B0D12] text-white border border-[#A3FF12]/60 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 transition-all duration-300 transform translate-y-12 opacity-0 pointer-events-none';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full bg-[#A3FF12] inline-block shadow-[0_0_8px_#A3FF12]"></span>
    <span>${message}</span>
  `;

  toast.classList.remove('translate-y-12', 'opacity-0', 'pointer-events-none');
  toast.classList.add('translate-y-0', 'opacity-100');

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.add('translate-y-12', 'opacity-0', 'pointer-events-none');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 2500);
}
