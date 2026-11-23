/**
 * VAPE HOUSE - Product Details Page Engine
 * Handles Dynamic Product Loading, Image Zoom, Thumbnail Carousel,
 * Variant Selection, Quantity Controls, Tab Navigation, Related & Recently Viewed Products.
 */

document.addEventListener('DOMContentLoaded', () => {
  initProductDetailPage();
});

function initProductDetailPage() {
  if (typeof PRODUCTS_DATA === 'undefined') {
    console.error('PRODUCTS_DATA not loaded!');
    return;
  }

  // 1. Identify Product from URL (Path or Query)
  const product = resolveCurrentProduct();
  if (!product) {
    console.warn('Product not found, using default ElfBar Raya D3');
    return;
  }

  // State
  let currentImageIndex = 0;
  let selectedColor = product.colours ? product.colours[0].name : '';
  let quantity = 1;

  // Add to Recently Viewed
  recordRecentlyViewed(product.id);

  // Sync Cart Badge
  updateCartBadge();

  // Populate Product Elements
  populateProductData(product);

  // Initialize Gallery & Zoom
  initImageGallery(product);

  // Initialize Color Selector
  initColorSelector(product);

  // Initialize Quantity Controls
  initQuantityControls(product);

  // Initialize Tabs
  initTabs(product);

  // Populate Related & Recently Viewed
  populateRelatedProducts(product);
  populateRecentlyViewed(product);

  // Wishlist Button Listener
  const btnWishlist = document.getElementById('btn-detail-wishlist');
  const btnWishlistPill = document.getElementById('btn-wishlist-pill');
  if (btnWishlist) {
    btnWishlist.addEventListener('click', () => toggleWishlist(product.id));
  }
  if (btnWishlistPill) {
    btnWishlistPill.addEventListener('click', () => toggleWishlist(product.id));
  }
  updateWishlistUI(product.id);

  // Newsletter Form
  const newsletterForm = document.getElementById('product-newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      const email = input ? input.value.trim() : '';
      if (email) {
        showToast(`Subscribed successfully with ${email}! ✉️`);
        if (input) input.value = '';
      }
    });
  }

  // Write Review Action
  const btnWriteReview = document.getElementById('btn-write-review');
  if (btnWriteReview) {
    btnWriteReview.addEventListener('click', () => {
      showToast('Review submission opened! Thank you for sharing your experience.');
    });
  }

  // Helper: Resolve Product
  function resolveCurrentProduct() {
    let slug = '';
    const path = window.location.pathname;
    
    // Check path like /products/elfbar-raya-d3
    const match = path.match(/\/(?:products|product)\/([a-zA-Z0-9\-_]+)/);
    if (match && match[1]) {
      slug = match[1];
    }

    // Check query param ?id= or ?slug=
    if (!slug) {
      const urlParams = new URLSearchParams(window.location.search);
      slug = urlParams.get('id') || urlParams.get('slug');
    }

    // Lookup in PRODUCTS_DATA
    if (slug) {
      const found = PRODUCTS_DATA.find(p => p.slug === slug || p.id === slug);
      if (found) return found;
    }

    // Default to ElfBar Raya D3
    return PRODUCTS_DATA[0];
  }

  // Populate Master Product Details
  function populateProductData(item) {
    // Title & Meta
    document.title = `${item.name} | VAPE HOUSE Bangalore`;
    const breadcrumbName = document.getElementById('breadcrumb-product-name');
    if (breadcrumbName) breadcrumbName.textContent = item.name;

    const heroTitle = document.getElementById('hero-product-title');
    if (heroTitle) heroTitle.textContent = item.name;

    const heroSubtitle = document.getElementById('hero-product-subtitle');
    if (heroSubtitle) heroSubtitle.textContent = item.tagline || item.shortDescription;

    const detailTitle = document.getElementById('detail-title');
    if (detailTitle) detailTitle.textContent = item.name;

    const detailBadge = document.getElementById('detail-badge');
    if (detailBadge) {
      if (item.badge) {
        detailBadge.textContent = item.badge;
        detailBadge.style.display = 'inline-block';
      } else {
        detailBadge.style.display = 'none';
      }
    }

    const ratingNumber = document.getElementById('detail-rating-number');
    if (ratingNumber) ratingNumber.textContent = item.rating;

    const reviewsCount = document.getElementById('detail-reviews-count');
    if (reviewsCount) reviewsCount.textContent = `(${item.reviewsCount})`;

    const positiveBadge = document.getElementById('detail-positive-badge');
    if (positiveBadge) positiveBadge.textContent = item.positiveReviews || '98% Positive Reviews';

    const shortDesc = document.getElementById('detail-short-desc');
    if (shortDesc) shortDesc.textContent = item.shortDescription;

    const priceEl = document.getElementById('detail-price');
    if (priceEl) priceEl.textContent = `₹${item.price.toLocaleString('en-IN')}`;

    const origPriceEl = document.getElementById('detail-orig-price');
    if (origPriceEl) origPriceEl.textContent = `₹${item.originalPrice.toLocaleString('en-IN')}`;

    const discountTag = document.getElementById('detail-discount-tag');
    if (discountTag) discountTag.textContent = item.discount;
  }

  // Gallery and Zoom Engine
  function initImageGallery(item) {
    const mainImg = document.getElementById('main-product-img');
    const zoomContainer = document.getElementById('main-image-container');
    const thumbsContainer = document.getElementById('thumbnails-container');
    const prevBtn = document.getElementById('gallery-prev-btn');
    const nextBtn = document.getElementById('gallery-next-btn');

    // Build images array
    const images = item.thumbnails && item.thumbnails.length > 0 
      ? item.thumbnails 
      : [item.image, item.fullImage || item.image];

    // Set initial main image
    if (mainImg) {
      mainImg.src = item.fullImage || images[0];
      mainImg.alt = item.name;
    }

    // Populate thumbnails
    if (thumbsContainer) {
      thumbsContainer.innerHTML = '';
      images.forEach((imgUrl, idx) => {
        const isPlus2 = (idx === 4);
        const thumbBox = document.createElement('div');
        thumbBox.className = `w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 cursor-pointer transition-all p-1 flex items-center justify-center bg-white relative flex-shrink-0 ${
          idx === 0 ? 'border-[#8B00FF] shadow-sm' : 'border-gray-200 hover:border-gray-400'
        }`;
        
        thumbBox.innerHTML = `
          <img src="${imgUrl}" alt="${item.name} angle ${idx+1}" class="max-h-full max-w-full object-contain">
          ${isPlus2 ? '<div class="absolute inset-0 bg-[#0B0D12]/75 rounded-xl flex items-center justify-center text-white font-bold text-xs">+2</div>' : ''}
        `;

        thumbBox.addEventListener('click', () => {
          currentImageIndex = idx;
          updateActiveImage(images);
        });

        thumbsContainer.appendChild(thumbBox);
      });
    }

    function updateActiveImage(imgs) {
      if (!mainImg) return;
      mainImg.style.opacity = '0.3';
      setTimeout(() => {
        mainImg.src = imgs[currentImageIndex];
        mainImg.style.opacity = '1';
      }, 120);

      // Update active thumbnail border
      if (thumbsContainer) {
        const boxes = thumbsContainer.children;
        for (let i = 0; i < boxes.length; i++) {
          if (i === currentImageIndex) {
            boxes[i].classList.add('border-[#8B00FF]', 'shadow-sm');
            boxes[i].classList.remove('border-gray-200');
          } else {
            boxes[i].classList.remove('border-[#8B00FF]', 'shadow-sm');
            boxes[i].classList.add('border-gray-200');
          }
        }
      }
    }

    // Prev / Next Image Navigation
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateActiveImage(images);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updateActiveImage(images);
      });
    }

    // Interactive Zoom on Hover
    if (zoomContainer && mainImg) {
      zoomContainer.addEventListener('mousemove', (e) => {
        const rect = zoomContainer.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        mainImg.style.transformOrigin = `${x}% ${y}%`;
        mainImg.style.transform = 'scale(1.4)';
      });

      zoomContainer.addEventListener('mouseleave', () => {
        mainImg.style.transformOrigin = 'center center';
        mainImg.style.transform = 'scale(1)';
      });
    }
  }

  // Color Swatches
  function initColorSelector(item) {
    const swatchesContainer = document.getElementById('color-swatches-container');
    const colorLabel = document.getElementById('selected-color-label');
    if (!swatchesContainer) return;

    const colors = item.colours || [
      { name: 'Royal Purple', hex: '#8B00FF' },
      { name: 'Neon Cyan', hex: '#06B6D4' },
      { name: 'Rose Pink', hex: '#EC4899' },
      { name: 'Matte Charcoal', hex: '#1F2937' }
    ];

    swatchesContainer.innerHTML = '';
    selectedColor = colors[0].name;
    if (colorLabel) colorLabel.textContent = selectedColor;

    colors.forEach((col, idx) => {
      const btn = document.createElement('button');
      btn.className = `color-swatch w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-md transition-all ${
        idx === 0 ? 'active scale-110' : 'hover:scale-105'
      }`;
      btn.style.backgroundColor = col.hex;
      btn.title = col.name;

      btn.addEventListener('click', () => {
        selectedColor = col.name;
        if (colorLabel) colorLabel.textContent = selectedColor;

        // Update active class
        swatchesContainer.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active', 'scale-110'));
        btn.classList.add('active', 'scale-110');

        showToast(`Selected colour: ${col.name}`);
      });

      swatchesContainer.appendChild(btn);
    });
  }

  // Quantity Stepper & Add to Cart
  function initQuantityControls(item) {
    const qtyDisplay = document.getElementById('qty-display');
    const minusBtn = document.getElementById('qty-minus-btn');
    const plusBtn = document.getElementById('qty-plus-btn');
    const addToCartBtn = document.getElementById('btn-add-to-cart-main');

    if (minusBtn && qtyDisplay) {
      minusBtn.addEventListener('click', () => {
        if (quantity > 1) {
          quantity--;
          qtyDisplay.textContent = quantity;
        }
      });
    }

    if (plusBtn && qtyDisplay) {
      plusBtn.addEventListener('click', () => {
        if (quantity < 20) {
          quantity++;
          qtyDisplay.textContent = quantity;
        }
      });
    }

    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        addToCart(item, quantity, selectedColor);
      });
    }
  }

  // Tabs Management
  function initTabs(item) {
    const tabButtons = document.querySelectorAll('.product-tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Populate Tab 1: Description
    const descText = document.getElementById('tab-desc-text');
    if (descText && item.longDescription) {
      descText.textContent = item.longDescription;
    }

    const bulletsList = document.getElementById('tab-desc-bullets');
    if (bulletsList && item.bulletFeatures) {
      bulletsList.innerHTML = item.bulletFeatures.map(b => `
        <li class="flex items-center gap-2.5">
          <span class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</span>
          <span>${b}</span>
        </li>
      `).join('');
    }

    // Populate Tab 2: Features
    const featuresGrid = document.getElementById('tab-features-grid');
    if (featuresGrid) {
      const feats = item.features || [
        { label: 'Long Battery Life', icon: 'battery' },
        { label: 'Premium Flavour', icon: 'flavour' },
        { label: 'Leak Proof Design', icon: 'shield' }
      ];
      featuresGrid.innerHTML = feats.map(f => `
        <div class="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-[#A3FF12]/20 border border-[#A3FF12]/40 text-[#4D7C0F] flex items-center justify-center flex-shrink-0 font-bold">
            ★
          </div>
          <div>
            <h4 class="font-bold text-sm text-[#0B0D12]">${f.label}</h4>
            <p class="text-xs text-gray-500 mt-0.5">Optimized for consistent vapor output and longevity.</p>
          </div>
        </div>
      `).join('');
    }

    // Populate Tab 3: Specs Table
    const specsTbody = document.getElementById('tab-specs-table-body');
    if (specsTbody && item.specs) {
      specsTbody.innerHTML = Object.entries(item.specs).map(([key, val]) => `
        <tr class="hover:bg-gray-50/50">
          <th class="py-3 px-4 font-bold text-gray-700 w-1/3 bg-gray-50/80">${key}</th>
          <td class="py-3 px-4 text-gray-600 font-medium">${val}</td>
        </tr>
      `).join('');
    }

    // Populate Tab 4: Reviews
    const reviewsContainer = document.getElementById('tab-reviews-container');
    if (reviewsContainer && item.reviews) {
      reviewsContainer.innerHTML = item.reviews.map(rev => `
        <div class="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-black text-sm text-[#0B0D12]">${rev.author}</span>
              ${rev.verified ? '<span class="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">✓ Verified Buyer</span>' : ''}
            </div>
            <span class="text-xs text-gray-400">${rev.date}</span>
          </div>
          <div class="flex items-center gap-1 text-amber-400">
            ${'★'.repeat(rev.rating)}
          </div>
          <h5 class="font-bold text-xs text-[#0B0D12]">${rev.title}</h5>
          <p class="text-xs text-gray-600 leading-relaxed">${rev.text}</p>
        </div>
      `).join('');
    }

    // Populate Tab 5: Additional Info
    const additionalContainer = document.getElementById('tab-additional-content');
    if (additionalContainer && item.additionalInfo) {
      additionalContainer.innerHTML = Object.entries(item.additionalInfo).map(([title, desc]) => `
        <div class="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
          <h4 class="font-black text-sm text-[#0B0D12]">${title}</h4>
          <p class="text-xs text-gray-600 leading-relaxed">${desc}</p>
        </div>
      `).join('');
    }

    // Tab Click Listeners
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabKey = btn.dataset.tab;

        // Button styles
        tabButtons.forEach(b => {
          b.classList.remove('active', 'bg-[#A3FF12]', 'text-[#0B0D12]');
          b.classList.add('text-gray-600', 'hover:bg-gray-100');
        });
        btn.classList.add('active', 'bg-[#A3FF12]', 'text-[#0B0D12]');
        btn.classList.remove('text-gray-600', 'hover:bg-gray-100');

        // Pane visibility
        tabPanes.forEach(p => p.classList.add('hidden'));
        const activePane = document.getElementById(`tab-pane-${tabKey}`);
        if (activePane) activePane.classList.remove('hidden');
      });
    });
  }

  // Related Products Section
  function populateRelatedProducts(current) {
    const container = document.getElementById('related-products-grid');
    if (!container) return;

    // Pick 4 related products (excluding current)
    const related = PRODUCTS_DATA
      .filter(p => p.id !== current.id && (p.category === current.category || p.brand === current.brand))
      .slice(0, 4);

    // Fallback if not enough
    if (related.length < 4) {
      const others = PRODUCTS_DATA.filter(p => p.id !== current.id && !related.includes(p));
      while (related.length < 4 && others.length > 0) {
        related.push(others.shift());
      }
    }

    container.innerHTML = related.map(item => `
      <div class="product-card-hover group bg-white rounded-2xl border border-gray-200/80 p-5 flex flex-col justify-between shadow-sm relative">
        <div class="flex items-center justify-between mb-2">
          <span class="bg-[#E9FCD4] text-[#2F6803] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#A3FF12]/40">${item.discount}</span>
          <button class="p-1.5 text-gray-400 hover:text-red-500 transition-colors" onclick="toggleWishlist('${item.id}', this)" title="Add to Wishlist">
            <svg class="w-4 h-4 fill-none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          </button>
        </div>

        <a href="/products/${item.slug}" class="block my-2 py-2 flex items-center justify-center">
          <img src="${item.image}" alt="${item.name}" class="h-32 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform">
        </a>

        <div class="space-y-2 pt-2">
          <a href="/products/${item.slug}">
            <h4 class="font-display font-black text-sm text-[#0B0D12] group-hover:text-[#8B00FF] transition-colors leading-snug line-clamp-1">${item.name}</h4>
          </a>
          <div class="flex items-center gap-1 text-xs text-gray-500">
            <span class="text-amber-400">★</span>
            <span class="font-bold text-[#0B0D12]">${item.rating}</span>
            <span class="text-gray-400">(${item.reviewsCount})</span>
          </div>
          <div class="flex items-center gap-2 pt-1">
            <span class="font-display font-black text-base text-[#0B0D12]">₹${item.price.toLocaleString('en-IN')}</span>
            <span class="text-xs text-gray-400 line-through">₹${item.originalPrice.toLocaleString('en-IN')}</span>
          </div>
          <button onclick="quickAddToCart('${item.id}')" class="w-full bg-[#0B0D12] hover:bg-[#1e2330] text-white py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all mt-2">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  // Recently Viewed Products Section
  function populateRecentlyViewed(current) {
    const track = document.getElementById('recently-viewed-track');
    if (!track) return;

    let recentIds = [];
    try {
      recentIds = JSON.parse(localStorage.getItem('vapehouse_recently_viewed') || '[]');
    } catch(err) { recentIds = []; }

    // Filter out current and map to products
    const recentProducts = recentIds
      .filter(id => id !== current.id)
      .map(id => PRODUCTS_DATA.find(p => p.id === id))
      .filter(Boolean);

    // If empty, supply top 5 products
    if (recentProducts.length === 0) {
      PRODUCTS_DATA.slice(0, 5).forEach(p => {
        if (p.id !== current.id) recentProducts.push(p);
      });
    }

    track.innerHTML = recentProducts.slice(0, 6).map(item => `
      <a href="/products/${item.slug}" class="bg-white rounded-2xl border border-gray-200/80 p-3 flex items-center gap-3 min-w-[200px] hover:border-[#8B00FF]/40 shadow-sm transition-all group flex-shrink-0">
        <div class="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center p-1 flex-shrink-0">
          <img src="${item.image}" alt="${item.name}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform">
        </div>
        <div>
          <h5 class="font-bold text-xs text-[#0B0D12] group-hover:text-[#8B00FF] transition-colors line-clamp-1">${item.name}</h5>
          <span class="font-black text-xs text-[#0B0D12]">₹${item.price.toLocaleString('en-IN')}</span>
        </div>
      </a>
    `).join('');
  }

  function recordRecentlyViewed(id) {
    let recent = [];
    try {
      recent = JSON.parse(localStorage.getItem('vapehouse_recently_viewed') || '[]');
    } catch(err) { recent = []; }

    // Prepend and deduplicate
    recent = [id, ...recent.filter(item => item !== id)].slice(0, 8);
    localStorage.setItem('vapehouse_recently_viewed', JSON.stringify(recent));
  }

  // Cart Management
  function addToCart(product, qty, color) {
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem('vapehouse_cart') || '[]');
    } catch(err) { cart = []; }

    const existingIndex = cart.findIndex(c => c.id === product.id && c.color === color);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color: color,
        quantity: qty
      });
    }

    localStorage.setItem('vapehouse_cart', JSON.stringify(cart));
    updateCartBadge();
    showToast(`Added ${qty}x ${product.name} (${color}) to Cart! 🛒`);
  }

  function updateCartBadge() {
    const badge = document.getElementById('cart-badge-count');
    if (!badge) return;
    try {
      const cart = JSON.parse(localStorage.getItem('vapehouse_cart') || '[]');
      const total = cart.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
      badge.textContent = total > 0 ? total : '1';
    } catch(err) {
      badge.textContent = '1';
    }
  }

  // Wishlist Handling
  function toggleWishlist(id) {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('vapehouse_wishlist') || '[]');
    } catch(err) { list = []; }

    const index = list.indexOf(id);
    if (index > -1) {
      list.splice(index, 1);
      showToast('Removed from Wishlist');
    } else {
      list.push(id);
      showToast('Added to Wishlist ❤️');
    }
    localStorage.setItem('vapehouse_wishlist', JSON.stringify(list));
    updateWishlistUI(id);
  }

  function updateWishlistUI(id) {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('vapehouse_wishlist') || '[]');
    } catch(err) { list = []; }

    const isFav = list.includes(id);
    const icon = document.getElementById('wishlist-icon');
    if (icon) {
      if (isFav) {
        icon.classList.add('text-red-500', 'fill-red-500');
        icon.classList.remove('fill-none');
      } else {
        icon.classList.remove('text-red-500', 'fill-red-500');
        icon.classList.add('fill-none');
      }
    }
  }

  // Floating Toast Utility
  function showToast(message) {
    let toast = document.getElementById('vape-house-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'vape-house-toast';
      toast.setAttribute('role', 'alert');
      toast.className = 'toast-notification fixed bottom-6 left-6 z-50 bg-[#121620]/95 backdrop-blur-md border border-[#A3FF12]/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 font-bold text-sm pointer-events-auto';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <span class="w-3 h-3 rounded-full bg-[#A3FF12] shadow-[0_0_10px_#A3FF12] flex-shrink-0 animate-pulse"></span>
      <span class="text-white">${message}</span>
    `;

    toast.style.display = 'flex';
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      setTimeout(() => {
        if (toast.style.opacity === '0') {
          toast.style.display = 'none';
        }
      }, 300);
    }, 2800);
  }

  // Global helper for related items quick add
  window.quickAddToCart = function(id) {
    const item = PRODUCTS_DATA.find(p => p.id === id);
    if (item) {
      addToCart(item, 1, item.colours ? item.colours[0].name : '');
    }
  };

  window.toggleWishlist = toggleWishlist;
}
