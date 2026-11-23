/**
 * VAPE HOUSE - Collections Page Interactive Engine
 * Handles Category Navigation, Multi-Criteria Filtering, Sorting, Grid/List Views,
 * Dynamic Pagination, WhatsApp Direct Ordering, Cart & Wishlist Sync.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCollections();
});

function initCollections() {
  if (typeof PRODUCTS_DATA === 'undefined') {
    console.error('PRODUCTS_DATA not loaded!');
    return;
  }

  // State Management
  const state = {
    selectedCategory: 'all',
    selectedBrands: [],
    selectedPriceRange: 'all',
    selectedFlavours: [],
    sortBy: 'popular',
    viewMode: 'grid', // 'grid' | 'list'
    currentPage: 1,
    itemsPerPage: 12
  };

  // DOM Elements
  const gridContainer = document.getElementById('products-grid-container');
  const showingRangeText = document.getElementById('showing-range-text');
  const totalCountText = document.getElementById('total-count-text');
  const sortSelector = document.getElementById('sort-selector');
  const viewGridBtn = document.getElementById('view-grid-btn');
  const viewListBtn = document.getElementById('view-list-btn');
  const paginationPages = document.getElementById('pagination-pages');
  const pagePrevBtn = document.getElementById('page-prev-btn');
  const pageNextBtn = document.getElementById('page-next-btn');
  const btnClearFilters = document.getElementById('btn-clear-filters');
  const btnApplyFilters = document.getElementById('btn-apply-filters');
  const catPills = document.querySelectorAll('.cat-pill');
  const categoryRadios = document.querySelectorAll('input[name="filter-cat"]');
  const brandCheckboxes = document.querySelectorAll('.filter-brand');
  const priceRadios = document.querySelectorAll('input[name="filter-price"]');
  const flavourCheckboxes = document.querySelectorAll('.filter-flavour');
  const cartBadgeCount = document.getElementById('cart-badge-count');
  
  // Mobile drawer elements
  const btnMobileFilters = document.getElementById('btn-mobile-filters');
  const mobileDrawer = document.getElementById('mobile-filter-drawer');
  const btnCloseMobileFilters = document.getElementById('btn-close-mobile-filters');
  const mobilePlaceholder = document.getElementById('mobile-filters-placeholder');
  const btnMobileClearAll = document.getElementById('btn-mobile-clear-all');
  const btnMobileApplyNow = document.getElementById('btn-mobile-apply-now');

  // 1. Check URL parameters for initial category or search
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category');
  if (initialCategory) {
    state.selectedCategory = initialCategory;
    // Sync category pill
    catPills.forEach(pill => {
      if (pill.dataset.category === initialCategory) {
        setCatPillActive(pill);
      }
    });
    // Sync radio
    categoryRadios.forEach(radio => {
      if (radio.value === initialCategory) radio.checked = true;
    });
  }

  // 2. Initial Cart Count Sync
  updateCartBadge();

  // 3. Category Pills Interaction
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      setCatPillActive(pill);
      state.selectedCategory = pill.dataset.category;
      state.currentPage = 1;

      // Sync with sidebar radio
      categoryRadios.forEach(radio => {
        if (radio.value === state.selectedCategory) radio.checked = true;
      });

      render();
    });
  });

  function setCatPillActive(activePill) {
    catPills.forEach(p => {
      p.classList.remove('bg-[#A3FF12]', 'text-[#0B0D12]', 'active');
      p.classList.add('text-gray-700', 'hover:bg-gray-100');
    });
    activePill.classList.remove('text-gray-700', 'hover:bg-gray-100');
    activePill.classList.add('bg-[#A3FF12]', 'text-[#0B0D12]', 'active');
  }

  // 4. Sidebar Filter Listeners
  categoryRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      state.selectedCategory = radio.value;
      state.currentPage = 1;
      // Sync floating cat pill
      catPills.forEach(pill => {
        if (pill.dataset.category === radio.value) {
          setCatPillActive(pill);
        }
      });
      render();
    });
  });

  brandCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      updateBrandFilter();
      state.currentPage = 1;
      render();
    });
  });

  function updateBrandFilter() {
    state.selectedBrands = Array.from(brandCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
  }

  priceRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      state.selectedPriceRange = radio.value;
      state.currentPage = 1;
      render();
    });
  });

  flavourCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      updateFlavourFilter();
      state.currentPage = 1;
      render();
    });
  });

  function updateFlavourFilter() {
    state.selectedFlavours = Array.from(flavourCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
  }

  // Clear All Filters
  if (btnClearFilters) {
    btnClearFilters.addEventListener('click', resetAllFilters);
  }
  if (btnMobileClearAll) {
    btnMobileClearAll.addEventListener('click', () => {
      resetAllFilters();
      closeMobileDrawer();
    });
  }

  function resetAllFilters() {
    state.selectedCategory = 'all';
    state.selectedBrands = [];
    state.selectedPriceRange = 'all';
    state.selectedFlavours = [];
    state.currentPage = 1;

    // Reset controls
    categoryRadios.forEach(r => r.checked = (r.value === 'all'));
    priceRadios.forEach(r => r.checked = (r.value === 'all'));
    brandCheckboxes.forEach(cb => cb.checked = false);
    flavourCheckboxes.forEach(cb => cb.checked = false);

    // Reset floating pill
    if (catPills.length > 0) {
      setCatPillActive(catPills[0]);
    }

    render();
    showToast('Filters cleared! Showing all products.');
  }

  if (btnApplyFilters) {
    btnApplyFilters.addEventListener('click', () => {
      render();
      showToast('Filters applied successfully!');
      // Scroll to top of grid
      const target = document.getElementById('products-section');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // 5. Sort Selector
  if (sortSelector) {
    sortSelector.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      state.currentPage = 1;
      render();
    });
  }

  // 6. View Mode Toggles
  if (viewGridBtn && viewListBtn) {
    viewGridBtn.addEventListener('click', () => {
      state.viewMode = 'grid';
      viewGridBtn.classList.add('bg-[#A3FF12]', 'text-[#0B0D12]');
      viewGridBtn.classList.remove('text-gray-500');
      viewListBtn.classList.remove('bg-[#A3FF12]', 'text-[#0B0D12]');
      viewListBtn.classList.add('text-gray-500');
      render();
    });

    viewListBtn.addEventListener('click', () => {
      state.viewMode = 'list';
      viewListBtn.classList.add('bg-[#A3FF12]', 'text-[#0B0D12]');
      viewListBtn.classList.remove('text-gray-500');
      viewGridBtn.classList.remove('bg-[#A3FF12]', 'text-[#0B0D12]');
      viewGridBtn.classList.add('text-gray-500');
      render();
    });
  }

  // 7. Pagination Buttons
  if (pagePrevBtn) {
    pagePrevBtn.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        render();
        scrollToProducts();
      }
    });
  }

  if (pageNextBtn) {
    pageNextBtn.addEventListener('click', () => {
      const filtered = getFilteredProducts();
      const totalPages = Math.ceil(filtered.length / state.itemsPerPage);
      if (state.currentPage < totalPages) {
        state.currentPage++;
        render();
        scrollToProducts();
      }
    });
  }

  function scrollToProducts() {
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  // 8. Mobile Drawer
  if (btnMobileFilters && mobileDrawer) {
    btnMobileFilters.addEventListener('click', () => {
      openMobileDrawer();
    });
  }

  if (btnCloseMobileFilters && mobileDrawer) {
    btnCloseMobileFilters.addEventListener('click', () => {
      closeMobileDrawer();
    });
  }

  if (btnMobileApplyNow) {
    btnMobileApplyNow.addEventListener('click', () => {
      closeMobileDrawer();
      render();
    });
  }

  function openMobileDrawer() {
    if (!mobilePlaceholder.hasChildNodes()) {
      const sidebarContent = document.getElementById('filter-sidebar');
      if (sidebarContent) {
        const clone = sidebarContent.cloneNode(true);
        clone.id = 'mobile-sidebar-clone';
        clone.classList.remove('hidden', 'lg:block', 'sticky', 'top-24', 'bg-white', 'p-6', 'rounded-2xl', 'border');
        mobilePlaceholder.appendChild(clone);

        // Bind events on clone
        clone.querySelectorAll('input').forEach(input => {
          input.addEventListener('change', () => {
            // Mirror change back to desktop
            const selector = `input[name="${input.name}"][value="${input.value}"]`;
            const desktopEl = document.querySelector(selector);
            if (desktopEl) desktopEl.checked = input.checked;
            
            if (input.name === 'filter-cat') state.selectedCategory = input.value;
            if (input.name === 'filter-price') state.selectedPriceRange = input.value;
            if (input.classList.contains('filter-brand')) updateBrandFilter();
            if (input.classList.contains('filter-flavour')) updateFlavourFilter();
          });
        });
      }
    }
    mobileDrawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // 9. Filter Logic
  function getFilteredProducts() {
    let list = PRODUCTS_DATA.slice();

    // A. Category Filter
    if (state.selectedCategory !== 'all') {
      list = list.filter(item => item.category === state.selectedCategory);
    }

    // B. Brand Filter
    if (state.selectedBrands.length > 0) {
      list = list.filter(item => state.selectedBrands.includes(item.brand));
    }

    // C. Price Range Filter
    if (state.selectedPriceRange !== 'all') {
      if (state.selectedPriceRange === 'under-1500') {
        list = list.filter(item => item.price < 1500);
      } else if (state.selectedPriceRange === '1500-2500') {
        list = list.filter(item => item.price >= 1500 && item.price <= 2500);
      } else if (state.selectedPriceRange === '2500-3500') {
        list = list.filter(item => item.price > 2500 && item.price <= 3500);
      } else if (state.selectedPriceRange === 'above-3500') {
        list = list.filter(item => item.price > 3500);
      }
    }

    // D. Flavour Filter
    if (state.selectedFlavours.length > 0) {
      list = list.filter(item => {
        if (!item.flavours || item.flavours.length === 0) return false;
        return state.selectedFlavours.some(f => item.flavours.includes(f));
      });
    }

    // E. Sorting
    if (state.sortBy === 'popular') {
      // Default order preserved
    } else if (state.sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (state.sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (state.sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (state.sortBy === 'newest') {
      list.sort((a, b) => (b.badge === 'New Arrival' ? 1 : 0) - (a.badge === 'New Arrival' ? 1 : 0));
    }

    return list;
  }

  // 10. Render Master Function
  function render() {
    const filtered = getFilteredProducts();
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / state.itemsPerPage));

    if (state.currentPage > totalPages) state.currentPage = totalPages;

    const startIdx = (state.currentPage - 1) * state.itemsPerPage;
    const endIdx = Math.min(startIdx + state.itemsPerPage, total);
    const paginatedItems = filtered.slice(startIdx, endIdx);

    // Update Counts
    if (showingRangeText) {
      showingRangeText.textContent = total === 0 ? '0' : `${startIdx + 1}-${endIdx}`;
    }
    if (totalCountText) {
      totalCountText.textContent = total;
    }
    const mobileCount = document.getElementById('mobile-products-count');
    if (mobileCount) {
      mobileCount.textContent = `Showing ${total} Products`;
    }

    // Render Grid / List Container
    if (gridContainer) {
      if (state.viewMode === 'grid') {
        gridContainer.className = 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6';
      } else {
        gridContainer.className = 'flex flex-col gap-4';
      }

      if (paginatedItems.length === 0) {
        gridContainer.innerHTML = `
          <div class="col-span-full py-16 text-center bg-white rounded-2xl border border-gray-200">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="font-display font-bold text-lg text-gray-800">No products match your filters</h3>
            <p class="text-sm text-gray-500 mt-1">Try resetting your filters or selecting a different category.</p>
            <button onclick="document.getElementById('btn-clear-filters').click()" class="mt-4 px-5 py-2.5 bg-[#8B00FF] text-white rounded-full text-xs font-bold shadow-md hover:bg-[#7a00e0] transition-all">
              Reset Filters
            </button>
          </div>
        `;
      } else {
        gridContainer.innerHTML = paginatedItems.map(item => renderProductCard(item, state.viewMode)).join('');
      }

      // Attach Card Event Listeners
      attachCardEvents();
    }

    // Render Pagination Controls
    renderPagination(totalPages);
  }

  // 11. Render Single Product Card (Exact match to Reference 1)
  function renderProductCard(item, mode) {
    const isWishlisted = checkIfWishlisted(item.id);
    const detailUrl = `/products/${item.slug}`;

    // Badge styling
    let badgeHtml = '';
    if (item.badge) {
      if (item.badge === 'Best Seller' || item.badge === 'Trending') {
        badgeHtml = `<span class="bg-[#E9FCD4] text-[#2F6803] text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-[#A3FF12]/40 tracking-wider">${item.badge}</span>`;
      } else if (item.badge === 'New Arrival') {
        badgeHtml = `<span class="bg-[#EFF6FF] text-[#1D4ED8] text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-blue-200 tracking-wider">${item.badge}</span>`;
      } else {
        badgeHtml = `<span class="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">${item.badge}</span>`;
      }
    }

    // Ambient glow colors based on item
    const glowClass = item.glowColor === 'purple' 
      ? 'from-purple-100/60 to-transparent' 
      : (item.glowColor === 'cyan' ? 'from-cyan-100/60 to-transparent' : 'from-lime-100/60 to-transparent');

    if (mode === 'grid') {
      return `
        <div class="product-card-hover group bg-white rounded-2xl border border-gray-200/80 p-5 flex flex-col justify-between relative shadow-sm hover:border-[#8B00FF]/30 transition-all" data-id="${item.id}">
          
          <!-- Top Row: Badge & Wishlist Heart -->
          <div class="flex items-center justify-between mb-2">
            <div>${badgeHtml}</div>
            <button class="btn-card-wishlist p-1.5 text-gray-400 hover:text-red-500 transition-colors" data-id="${item.id}" title="Add to Wishlist">
              <svg class="w-5 h-5 ${isWishlisted ? 'text-red-500 fill-red-500' : 'fill-none'}" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <!-- Product Image Showcase with Glow -->
          <a href="${detailUrl}" class="block my-2 relative py-4 flex items-center justify-center overflow-hidden cursor-pointer">
            <div class="absolute inset-0 bg-radial-gradient ${glowClass} rounded-full blur-xl opacity-60 group-hover:scale-110 transition-transform"></div>
            <img src="${item.image}" alt="${item.name}" class="relative z-10 h-44 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300" loading="lazy">
          </a>

          <!-- Details & Pricing -->
          <div class="space-y-2 pt-2">
            <a href="${detailUrl}" class="block">
              <h3 class="font-display font-black text-base text-[#0B0D12] group-hover:text-[#8B00FF] transition-colors leading-snug">
                ${item.name}
              </h3>
            </a>

            <!-- Rating Row -->
            <div class="flex items-center gap-1.5 text-xs text-gray-500">
              <svg class="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="font-bold text-[#0B0D12]">${item.rating}</span>
              <span class="text-gray-400">(${item.reviewsCount})</span>
            </div>

            <!-- Price Row -->
            <div class="flex items-center gap-2 pt-1">
              <span class="font-display font-black text-lg text-[#0B0D12]">₹${item.price.toLocaleString('en-IN')}</span>
              <span class="text-xs text-gray-400 line-through">₹${item.originalPrice.toLocaleString('en-IN')}</span>
              <span class="bg-[#E9FCD4] text-[#2F6803] text-[10px] font-black px-2 py-0.5 rounded-full">${item.discount}</span>
            </div>

            <!-- Two Action Buttons (Exact Match to Reference 1) -->
            <div class="space-y-2 pt-2">
              <!-- Add to Cart (Dark Button) -->
              <button class="btn-card-add-cart w-full bg-[#0B0D12] hover:bg-[#1e2330] text-white py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95" data-id="${item.id}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Add to Cart</span>
              </button>

              <!-- Order on WhatsApp (Neon Lime Button) -->
              <a href="https://wa.me/919876543210?text=Hi%20VapeHouse,%20I%20would%20like%20to%20order:%20${encodeURIComponent(item.name)}%20(₹${item.price})" target="_blank" rel="noopener noreferrer" class="w-full bg-[#A3FF12] hover:bg-[#b3ff3b] text-[#0B0D12] py-2.5 px-4 rounded-full text-xs font-black flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.997.545 2.012.83 2.801.83h.005c3.18 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.767-5.778-5.767zm0 10.428c-.808 0-1.6-.217-2.291-.627l-.164-.097-1.701.446.454-1.658-.107-.17c-.451-.718-.689-1.554-.688-2.41 0-2.43 1.977-4.407 4.412-4.407 2.434 0 4.412 1.977 4.412 4.407 0 2.43-1.978 4.409-4.412 4.409z"/>
                </svg>
                <span>Order on WhatsApp</span>
              </a>
            </div>

          </div>

        </div>
      `;
    } else {
      // List Mode
      return `
        <div class="product-card-hover group bg-white rounded-2xl border border-gray-200/80 p-5 flex flex-col md:flex-row items-center justify-between gap-6 relative shadow-sm" data-id="${item.id}">
          <div class="flex items-center gap-6">
            <a href="${detailUrl}" class="w-28 h-28 relative flex items-center justify-center flex-shrink-0 bg-gray-50 rounded-xl p-2">
              <img src="${item.image}" alt="${item.name}" class="h-24 w-auto object-contain">
            </a>
            <div class="space-y-1">
              <div class="flex items-center gap-2">${badgeHtml}</div>
              <a href="${detailUrl}">
                <h3 class="font-display font-black text-lg text-[#0B0D12] group-hover:text-[#8B00FF] transition-colors">${item.name}</h3>
              </a>
              <p class="text-xs text-gray-500 max-w-md">${item.shortDescription}</p>
              <div class="flex items-center gap-2 pt-1">
                <span class="font-display font-black text-lg text-[#0B0D12]">₹${item.price.toLocaleString('en-IN')}</span>
                <span class="text-xs text-gray-400 line-through">₹${item.originalPrice.toLocaleString('en-IN')}</span>
                <span class="bg-[#E9FCD4] text-[#2F6803] text-[10px] font-bold px-2 py-0.5 rounded-full">${item.discount}</span>
              </div>
            </div>
          </div>

          <div class="flex md:flex-col items-center gap-2 w-full md:w-48 flex-shrink-0">
            <button class="btn-card-add-cart w-full bg-[#0B0D12] hover:bg-[#1e2330] text-white py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2" data-id="${item.id}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              <span>Add to Cart</span>
            </button>
            <a href="https://wa.me/919876543210?text=Hi%20VapeHouse,%20I%20would%20like%20to%20order:%20${encodeURIComponent(item.name)}%20(₹${item.price})" target="_blank" class="w-full bg-[#A3FF12] text-[#0B0D12] py-2.5 px-4 rounded-full text-xs font-black flex items-center justify-center gap-2">
              <span>Order on WhatsApp</span>
            </a>
          </div>
        </div>
      `;
    }
  }

  // 12. Pagination Renderer
  function renderPagination(totalPages) {
    if (!paginationPages) return;
    
    paginationPages.innerHTML = '';

    // Disable/Enable Prev & Next
    if (pagePrevBtn) pagePrevBtn.disabled = (state.currentPage <= 1);
    if (pageNextBtn) pageNextBtn.disabled = (state.currentPage >= totalPages);

    for (let p = 1; p <= totalPages; p++) {
      // Show page 1, current page +- 1, and last page
      if (p === 1 || p === totalPages || (p >= state.currentPage - 1 && p <= state.currentPage + 1)) {
        const btn = document.createElement('button');
        btn.textContent = p;
        if (p === state.currentPage) {
          btn.className = 'w-9 h-9 rounded-lg bg-[#A3FF12] text-[#0B0D12] font-black shadow-sm';
        } else {
          btn.className = 'w-9 h-9 rounded-lg border border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-50';
        }
        btn.addEventListener('click', () => {
          state.currentPage = p;
          render();
          scrollToProducts();
        });
        paginationPages.appendChild(btn);
      } else if (p === 2 && state.currentPage > 3) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        dots.className = 'px-1 text-gray-400 select-none';
        paginationPages.appendChild(dots);
      } else if (p === totalPages - 1 && state.currentPage < totalPages - 2) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        dots.className = 'px-1 text-gray-400 select-none';
        paginationPages.appendChild(dots);
      }
    }
  }

  // 13. Attach Card Actions (Add to Cart & Wishlist)
  function attachCardEvents() {
    // Add to Cart Buttons
    document.querySelectorAll('.btn-card-add-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const prodId = btn.dataset.id;
        const item = PRODUCTS_DATA.find(p => p.id === prodId);
        if (item) {
          addToCart(item);
        }
      });
    });

    // Wishlist Buttons
    document.querySelectorAll('.btn-card-wishlist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const prodId = btn.dataset.id;
        toggleWishlist(prodId, btn);
      });
    });
  }

  // Cart Management
  function addToCart(product, quantity = 1, selectedColor = null) {
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem('vapehouse_cart') || '[]');
    } catch(err) { cart = []; }

    const existingIndex = cart.findIndex(c => c.id === product.id && c.color === selectedColor);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color: selectedColor || (product.colours ? product.colours[0].name : ''),
        quantity: quantity
      });
    }

    localStorage.setItem('vapehouse_cart', JSON.stringify(cart));
    updateCartBadge();
    showToast(`Added ${product.name} to cart! 🛒`);
  }

  function updateCartBadge() {
    if (!cartBadgeCount) return;
    try {
      const cart = JSON.parse(localStorage.getItem('vapehouse_cart') || '[]');
      const totalCount = cart.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
      cartBadgeCount.textContent = totalCount > 0 ? totalCount : '1';
    } catch(err) {
      cartBadgeCount.textContent = '1';
    }
  }

  // Wishlist Management
  function checkIfWishlisted(id) {
    try {
      const list = JSON.parse(localStorage.getItem('vapehouse_wishlist') || '[]');
      return list.includes(id);
    } catch(err) { return false; }
  }

  function toggleWishlist(id, btnElement) {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('vapehouse_wishlist') || '[]');
    } catch(err) { list = []; }

    const index = list.indexOf(id);
    const svg = btnElement.querySelector('svg');
    if (index > -1) {
      list.splice(index, 1);
      if (svg) {
        svg.classList.remove('text-red-500', 'fill-red-500');
        svg.classList.add('fill-none');
      }
      showToast('Removed from wishlist');
    } else {
      list.push(id);
      if (svg) {
        svg.classList.add('text-red-500', 'fill-red-500');
        svg.classList.remove('fill-none');
      }
      showToast('Added to wishlist ❤️');
    }
    localStorage.setItem('vapehouse_wishlist', JSON.stringify(list));
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

  // Initial Render
  render();
}
