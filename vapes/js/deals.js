/**
 * VAPE HOUSE - Offers & Deals Interactive Engine
 * Handles Real-Time Countdown Timer, Flash Deals & More Offers Grids,
 * Discount Tab Filtering, Bundle Cart Actions, Wishlist & Cart Sync.
 */

document.addEventListener('DOMContentLoaded', () => {
  initDealsPage();
});

function initDealsPage() {
  // 1. Deals Catalog Definitions (Referencing existing PRODUCTS_DATA and exact reference items)
  const DEALS_ITEMS = [
    {
      id: 'elfbar-raya-d3',
      name: 'ElfBar Raya D3',
      slug: 'elfbar-raya-d3',
      price: 2400,
      originalPrice: 3000,
      discount: '20% OFF',
      discountNumber: 20,
      rating: 4.8,
      reviewsCount: '2.5k reviews',
      image: '/assets/collections/card_img_1.png',
      badge: '20% OFF'
    },
    {
      id: 'elfbar-raya-q7',
      name: 'ElfBar Raya Q7',
      slug: 'elfbar-raya-q7',
      price: 2500,
      originalPrice: 3000,
      discount: '17% OFF',
      discountNumber: 17,
      rating: 4.7,
      reviewsCount: '1.1k reviews',
      image: '/assets/collections/card_img_2.png',
      badge: '17% OFF'
    },
    {
      id: 'caliburn-g3-lite',
      name: 'Caliburn G3 Lite',
      slug: 'caliburn-g3-lite',
      price: 4500,
      originalPrice: 5000,
      discount: '10% OFF',
      discountNumber: 10,
      rating: 4.8,
      reviewsCount: '1.2k reviews',
      image: '/assets/collections/card_img_3.png',
      badge: '10% OFF'
    },
    {
      id: 'caliburn-g4-pro',
      name: 'Caliburn G4 Pro',
      slug: 'caliburn-g4-pro',
      price: 5000,
      originalPrice: 5500,
      discount: '9% OFF',
      discountNumber: 9,
      rating: 4.9,
      reviewsCount: '1k reviews',
      image: '/assets/collections/card_img_4.png',
      badge: '9% OFF'
    }
  ];

  // 2. Initialize Countdown Timer (Exact starting match 06h 24m 15s)
  initCountdownTimer();

  // 3. Render Flash Deals Grid (Cards with round lime cart button)
  renderFlashDeals(DEALS_ITEMS);

  // 4. Render "More Offers For You" Grid with Discount Tab Filtering
  initMoreOffersFilter(DEALS_ITEMS);

  // 5. Initialize Bundle Deals Buttons
  initBundleActions();

  // 6. Initialize Newsletter Submission
  initNewsletter();

  // 7. Sync Cart Count from LocalStorage
  updateCartBadge();
}

/**
 * Dynamic Countdown Timer
 */
function initCountdownTimer() {
  const elHours = document.getElementById('countdown-hours');
  const elMins = document.getElementById('countdown-minutes');
  const elSecs = document.getElementById('countdown-seconds');

  if (!elHours || !elMins || !elSecs) return;

  // Key stored in session or calculated relative to 6h 24m 15s
  const STORAGE_KEY = 'vapehouse_deal_end_time';
  let endTime = localStorage.getItem(STORAGE_KEY);

  if (!endTime || parseInt(endTime, 10) < Date.now()) {
    // 6 hours 24 minutes 15 seconds in ms
    const initialDurationMs = (6 * 3600 + 24 * 60 + 15) * 1000;
    endTime = Date.now() + initialDurationMs;
    localStorage.setItem(STORAGE_KEY, endTime);
  } else {
    endTime = parseInt(endTime, 10);
  }

  function updateClock() {
    const now = Date.now();
    let diff = Math.max(0, Math.floor((endTime - now) / 1000));

    if (diff <= 0) {
      // Reset for next flash cycle
      endTime = Date.now() + (6 * 3600 + 24 * 60 + 15) * 1000;
      localStorage.setItem(STORAGE_KEY, endTime);
      diff = Math.floor((endTime - now) / 1000);
    }

    const hours = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const secs = diff % 60;

    elHours.textContent = String(hours).padStart(2, '0');
    elMins.textContent = String(mins).padStart(2, '0');
    elSecs.textContent = String(secs).padStart(2, '0');
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/**
 * Render Flash Deals Grid
 */
function renderFlashDeals(items) {
  const container = document.getElementById('flash-deals-grid');
  if (!container) return;

  container.innerHTML = items.map(item => {
    const isWishlisted = checkIfWishlisted(item.id);
    const detailUrl = `/products/${item.slug}`;

    return `
      <div class="bg-white rounded-2xl p-4 sm:p-5 text-[#0B0D12] flex flex-col justify-between relative shadow-sm hover:shadow-lg transition-all group border border-gray-100">
        
        <!-- Top Row: Badge & Wishlist -->
        <div class="flex items-center justify-between mb-2">
          <span class="bg-[#E9FCD4] text-[#2F6803] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-[#A3FF12]/40 tracking-wider">
            ${item.badge}
          </span>
          <button class="btn-card-wishlist p-1 text-gray-400 hover:text-red-500 transition-colors" data-id="${item.id}" title="Add to Wishlist">
            <svg class="w-4 h-4 ${isWishlisted ? 'text-red-500 fill-red-500' : 'fill-none'}" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <!-- Product Image -->
        <a href="${detailUrl}" class="block my-2 py-3 flex items-center justify-center overflow-hidden cursor-pointer group-hover:scale-105 transition-transform duration-300">
          <img src="${item.image}" alt="${item.name}" class="h-32 sm:h-36 w-auto object-contain drop-shadow-md" loading="lazy" />
        </a>

        <!-- Title & Price -->
        <div class="pt-2">
          <a href="${detailUrl}" class="block">
            <h3 class="font-display font-black text-sm text-[#0B0D12] group-hover:text-[#8B00FF] transition-colors leading-snug">
              ${item.name}
            </h3>
          </a>

          <!-- Price & Round Lime Cart Button -->
          <div class="flex items-center justify-between pt-2">
            <div class="flex items-center gap-1.5">
              <span class="font-display font-black text-base text-[#0B0D12]">₹${item.price.toLocaleString('en-IN')}</span>
              <span class="text-xs text-gray-400 line-through">₹${item.originalPrice.toLocaleString('en-IN')}</span>
            </div>

            <!-- Round Lime Cart Button -->
            <button class="btn-add-flash-cart w-8 h-8 rounded-full bg-[#A3FF12] hover:bg-[#b3ff3b] text-[#0B0D12] flex items-center justify-center shadow-md shadow-[#A3FF12]/20 hover:scale-110 active:scale-95 transition-transform" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" title="Add to Cart">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    `;
  }).join('');

  attachDealEvents();
}

/**
 * More Offers with Discount Tabs
 */
function initMoreOffersFilter(items) {
  const container = document.getElementById('more-offers-grid');
  const filterButtons = document.querySelectorAll('.deal-filter-btn');

  function renderMoreOffers(filtered) {
    if (!container) return;

    container.innerHTML = filtered.map(item => {
      const isWishlisted = checkIfWishlisted(item.id);
      const detailUrl = `/products/${item.slug}`;

      return `
        <div class="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between relative" data-discount="${item.discountNumber}">
          
          <!-- Top Row: Badge & Wishlist -->
          <div class="flex items-center justify-between mb-2">
            <span class="bg-[#E9FCD4] text-[#2F6803] text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-[#A3FF12]/40 tracking-wider">
              ${item.badge}
            </span>
            <button class="btn-card-wishlist p-1 text-gray-400 hover:text-red-500 transition-colors" data-id="${item.id}" title="Add to Wishlist">
              <svg class="w-4 h-4 ${isWishlisted ? 'text-red-500 fill-red-500' : 'fill-none'}" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <!-- Product Image -->
          <a href="${detailUrl}" class="block my-2 py-4 flex items-center justify-center overflow-hidden cursor-pointer group-hover:scale-105 transition-transform duration-300">
            <img src="${item.image}" alt="${item.name}" class="h-36 sm:h-40 w-auto object-contain drop-shadow-md" loading="lazy" />
          </a>

          <!-- Info & Rating -->
          <div class="space-y-1.5 pt-2">
            <a href="${detailUrl}" class="block">
              <h3 class="font-display font-black text-base text-[#0B0D12] group-hover:text-[#8B00FF] transition-colors leading-snug">
                ${item.name}
              </h3>
            </a>

            <!-- Rating Row with Gold Star -->
            <div class="flex items-center gap-1.5 text-xs">
              <svg class="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="font-bold text-[#0B0D12]">${item.rating}</span>
              <span class="text-gray-400">(${item.reviewsCount})</span>
            </div>

            <!-- Price Row -->
            <div class="flex items-center gap-2 pt-1 pb-2">
              <span class="font-display font-black text-lg text-[#0B0D12]">₹${item.price.toLocaleString('en-IN')}</span>
              <span class="text-xs text-gray-400 line-through">₹${item.originalPrice.toLocaleString('en-IN')}</span>
            </div>

            <!-- Full-Width Dark Add to Cart Button -->
            <button class="btn-add-more-cart w-full bg-[#18181B] hover:bg-[#27272a] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Add to Cart</span>
            </button>
          </div>

        </div>
      `;
    }).join('');

    attachDealEvents();
  }

  // Filter Tab Click Handlers
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('active', 'bg-[#18181B]', 'text-white');
        b.classList.add('bg-white', 'text-gray-700');
      });
      btn.classList.add('active', 'bg-[#18181B]', 'text-white');
      btn.classList.remove('bg-white', 'text-gray-700');

      const filterType = btn.dataset.filter;
      let filtered = items;

      if (filterType === 'up-to-10') {
        filtered = items.filter(it => it.discountNumber <= 10);
      } else if (filterType === '10-20') {
        filtered = items.filter(it => it.discountNumber > 10 && it.discountNumber <= 20);
      } else if (filterType === 'above-20') {
        filtered = items.filter(it => it.discountNumber >= 20);
      }

      renderMoreOffers(filtered);
    });
  });

  // Initial render with all deals
  renderMoreOffers(items);
}

/**
 * Attach Card Events (Cart & Wishlist)
 */
function attachDealEvents() {
  // Flash Cart buttons
  document.querySelectorAll('.btn-add-flash-cart').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const name = btn.dataset.name;
      incrementCart();
      showToast(`Added ${name} to your cart! 🛍️`);
    };
  });

  // More Offers Cart buttons
  document.querySelectorAll('.btn-add-more-cart').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const name = btn.dataset.name;
      incrementCart();
      showToast(`Added ${name} to your cart! 🛍️`);
    };
  });

  // Wishlist buttons
  document.querySelectorAll('.btn-card-wishlist').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const id = btn.dataset.id;
      const nowActive = toggleWishlist(id);
      const svg = btn.querySelector('svg');
      if (svg) {
        if (nowActive) {
          svg.classList.add('text-red-500', 'fill-red-500');
          svg.classList.remove('fill-none');
          showToast('Added to your Wishlist! ❤️');
        } else {
          svg.classList.remove('text-red-500', 'fill-red-500');
          svg.classList.add('fill-none');
          showToast('Removed from your Wishlist.');
        }
      }
    };
  });
}

/**
 * Bundle Deal Actions
 */
function initBundleActions() {
  document.querySelectorAll('.btn-add-bundle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = btn.dataset.name;
      incrementCart();
      showToast(`Bundle "${name}" added to cart! 🎁`);
    });
  });
}

/**
 * Newsletter Subscription
 */
function initNewsletter() {
  const form = document.getElementById('deals-newsletter-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const email = input ? input.value.trim() : '';
      if (email) {
        showToast(`Subscribed successfully with ${email}! ✉️`);
        if (input) input.value = '';
      }
    });
  }
}

/**
 * Shared Helpers: Cart, Wishlist, Toast
 */
function getCartCount() {
  return parseInt(localStorage.getItem('vapehouse_cart_count') || '0', 10);
}

function incrementCart() {
  const current = getCartCount();
  const next = current + 1;
  localStorage.setItem('vapehouse_cart_count', next);
  updateCartBadge();
}

function updateCartBadge() {
  const count = getCartCount();
  const badge = document.getElementById('cart-badge-count');
  if (badge) {
    badge.textContent = count;
    badge.classList.add('scale-125');
    setTimeout(() => badge.classList.remove('scale-125'), 200);
  }
}

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem('vapehouse_wishlist') || '[]');
  } catch (e) {
    return [];
  }
}

function checkIfWishlisted(id) {
  const list = getWishlist();
  return list.includes(id);
}

function toggleWishlist(id) {
  let list = getWishlist();
  let added = false;
  if (list.includes(id)) {
    list = list.filter(item => item !== id);
    added = false;
  } else {
    list.push(id);
    added = true;
  }
  localStorage.setItem('vapehouse_wishlist', JSON.stringify(list));
  return added;
}

function showToast(message) {
  let toast = document.getElementById('vape-deal-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'vape-deal-toast';
    toast.className = 'fixed bottom-6 right-6 z-50 bg-[#0B0D12] text-white border border-[#A3FF12]/50 shadow-2xl px-5 py-3 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all duration-300 transform translate-y-16 opacity-0';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full bg-[#A3FF12] animate-ping"></span>
    <span>${message}</span>
  `;

  toast.classList.remove('translate-y-16', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-16', 'opacity-0');
  }, 3000);
}
