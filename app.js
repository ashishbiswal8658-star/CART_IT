// CART_IT Core Logic Engine

// Global Application State
const state = {
  cart: [],
  wishlist: [],
  currentCategory: "All",
  searchQuery: "",
  priceFilter: { min: 0, max: 2000, currentMax: 2000 },
  selectedRatings: [], // Array of numbers representing selected stars
  sortBy: "featured",
  appliedPromo: null,
  activePage: "home", // "home", "tracking", "admin"
  trackingOrder: null,
  activeHeroSlide: 0,
  selectedModalProduct: null,
  selectedModalColor: null,
  selectedModalSize: null,
  activeModalTab: "specs" // "specs", "reviews"
};

// Valid Mock Coupons
const VALID_COUPONS = {
  "CARTIT20": { code: "CARTIT20", value: 20, type: "percent" },
  "WELCOME50": { code: "WELCOME50", value: 50, type: "flat" },
  "FREESHIP": { code: "FREESHIP", value: 15, type: "flat" } // Simulates standard delivery cost
};

// Document Elements cache
let els = {};

// Initializer
document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  setupEventListeners();
  initHeroSlider();
  renderCatalog();
  updateCartBadge();
  updateWishlistBadge();
  initAdminDashboard();
  initChatbot();
});

// Cache DOM Elements for fast lookup
function cacheElements() {
  els = {
    // Body & Themes
    body: document.body,
    themeToggle: document.getElementById("theme-toggle"),
    
    // View containers
    homeView: document.getElementById("home-view"),
    trackingView: document.getElementById("tracking-view"),
    adminView: document.getElementById("admin-view"),
    
    // Header
    searchInput: document.getElementById("search-input"),
    searchSuggestions: document.getElementById("search-suggestions"),
    cartTrigger: document.getElementById("cart-trigger"),
    cartBadge: document.getElementById("cart-badge"),
    wishlistTrigger: document.getElementById("wishlist-trigger"),
    wishlistBadge: document.getElementById("wishlist-badge"),
    navLogo: document.getElementById("nav-logo"),
    navHome: document.getElementById("nav-home"),
    navAdmin: document.getElementById("nav-admin"),
    
    // Category chips
    categoriesBar: document.getElementById("categories-bar"),
    
    // Product Catalog
    productsGrid: document.getElementById("products-grid"),
    resultsCount: document.getElementById("results-count"),
    sortSelect: document.getElementById("sort-select"),
    
    // Sidebar Filters
    priceMinInput: document.getElementById("price-min"),
    priceMaxInput: document.getElementById("price-max"),
    priceRangeSlider: document.getElementById("price-range-slider"),
    
    // Product Modal
    productModal: document.getElementById("product-modal"),
    modalMainImg: document.getElementById("modal-main-img"),
    modalThumbnails: document.getElementById("modal-thumbnails"),
    modalCategory: document.getElementById("modal-category"),
    modalTitle: document.getElementById("modal-title"),
    modalRatingStars: document.getElementById("modal-rating-stars"),
    modalRatingCount: document.getElementById("modal-rating-count"),
    modalPriceCurrent: document.getElementById("modal-price-current"),
    modalPriceOriginal: document.getElementById("modal-price-original"),
    modalDescription: document.getElementById("modal-description"),
    modalColors: document.getElementById("modal-colors"),
    modalSizes: document.getElementById("modal-sizes"),
    modalBtnAdd: document.getElementById("modal-btn-add"),
    modalTabSpecs: document.getElementById("tab-specs"),
    modalTabReviews: document.getElementById("tab-reviews"),
    panelSpecs: document.getElementById("panel-specs"),
    panelReviews: document.getElementById("panel-reviews"),
    reviewsSummary: document.getElementById("reviews-summary-block"),
    reviewsList: document.getElementById("reviews-list-container"),
    
    // Cart Drawer
    cartDrawer: document.getElementById("cart-drawer"),
    drawerBackdrop: document.getElementById("drawer-backdrop"),
    cartItemsList: document.getElementById("cart-items-list"),
    cartSubtotal: document.getElementById("cart-subtotal"),
    cartDiscountRow: document.getElementById("cart-discount-row"),
    cartDiscount: document.getElementById("cart-discount"),
    cartTotal: document.getElementById("cart-total"),
    promoCodeInput: document.getElementById("promo-code"),
    btnPromoApply: document.getElementById("btn-promo-apply"),
    promoStatusMsg: document.getElementById("promo-status-msg"),
    btnCheckout: document.getElementById("btn-checkout"),
    
    // Checkout Modal
    checkoutModal: document.getElementById("checkout-modal"),
    checkoutStepLines: document.getElementById("checkout-steps-line-progress"),
    btnCheckoutPrev: document.getElementById("btn-checkout-prev"),
    btnCheckoutNext: document.getElementById("btn-checkout-next"),
    
    // Credit Card Form Fields
    cardNumberInput: document.getElementById("card-number"),
    cardNameInput: document.getElementById("card-holder"),
    cardExpiryInput: document.getElementById("card-expiry"),
    cardCvvInput: document.getElementById("card-cvv"),
    
    // 3D Credit Card Visualizer elements
    creditCard: document.getElementById("credit-card"),
    cardDisplayNum: document.getElementById("card-display-num"),
    cardDisplayName: document.getElementById("card-display-name"),
    cardDisplayExpiry: document.getElementById("card-display-expiry"),
    cardDisplayCvv: document.getElementById("card-display-cvv"),
    
    // Order Simulation / Tracking View
    orderTrackingId: document.getElementById("order-tracking-id"),
    orderItemsCount: document.getElementById("order-items-count"),
    orderEstDelivery: document.getElementById("order-est-delivery"),
    trackingLineProgress: document.getElementById("tracking-line-progress"),
    btnFastForward: document.getElementById("btn-fast-forward"),
    
    // Admin Controls
    adminProductsTable: document.getElementById("admin-products-table"),
    adminForm: document.getElementById("admin-add-product-form"),
    statSales: document.getElementById("stat-sales"),
    statOrders: document.getElementById("stat-orders"),
    statInventory: document.getElementById("stat-inventory"),
    
    // Chatbot Elements
    chatbotTrigger: document.getElementById("chatbot-trigger"),
    chatbotWindow: document.getElementById("chatbot-window"),
    chatbotClose: document.getElementById("chatbot-close"),
    chatContent: document.getElementById("chat-content"),
    
    // Toasts container
    toastContainer: document.getElementById("toast-container")
  };
}

// Bind Global Interactions
function setupEventListeners() {
  // Theme Toggle
  els.themeToggle.addEventListener("click", toggleTheme);
  
  // Navigation Logo & Views
  els.navLogo.addEventListener("click", () => showPage("home"));
  els.navHome.addEventListener("click", () => showPage("home"));
  els.navAdmin.addEventListener("click", () => showPage("admin"));
  
  // Search Autocomplete Engine
  els.searchInput.addEventListener("input", handleSearchInput);
  document.addEventListener("click", (e) => {
    if (!els.searchInput.contains(e.target) && !els.searchSuggestions.contains(e.target)) {
      els.searchSuggestions.style.display = "none";
    }
  });
  
  // Category Chips delegation
  els.categoriesBar.addEventListener("click", (e) => {
    const chip = e.target.closest(".category-chip");
    if (!chip) return;
    
    document.querySelectorAll(".category-chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    
    state.currentCategory = chip.dataset.category;
    renderCatalog();
  });
  
  // Sidebar filters
  els.priceRangeSlider.addEventListener("input", (e) => {
    const val = parseInt(e.target.value);
    els.priceMaxInput.value = val;
    state.priceFilter.currentMax = val;
    renderCatalog();
  });
  
  els.priceMinInput.addEventListener("input", (e) => {
    state.priceFilter.min = parseFloat(e.target.value) || 0;
    renderCatalog();
  });
  
  els.priceMaxInput.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value) || 2000;
    state.priceFilter.currentMax = val;
    els.priceRangeSlider.value = val;
    renderCatalog();
  });
  
  // Checkboxes for Rating Filters
  document.querySelectorAll(".filter-checkbox-label input").forEach(cb => {
    cb.addEventListener("change", () => {
      const ratingVal = parseInt(cb.value);
      if (cb.checked) {
        state.selectedRatings.push(ratingVal);
      } else {
        state.selectedRatings = state.selectedRatings.filter(r => r !== ratingVal);
      }
      renderCatalog();
    });
  });
  
  // Sort catalog selection
  els.sortSelect.addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    renderCatalog();
  });
  
  // Cart Trigger Opening Drawer
  els.cartTrigger.addEventListener("click", () => toggleCartDrawer(true));
  document.querySelectorAll(".drawer-close, #drawer-backdrop").forEach(el => {
    el.addEventListener("click", () => toggleCartDrawer(false));
  });
  
  // Close Modals
  document.querySelectorAll(".modal-close-trigger").forEach(el => {
    el.addEventListener("click", () => {
      els.productModal.classList.remove("open");
      els.checkoutModal.classList.remove("open");
    });
  });
  
  // Add to cart from Product Modal
  els.modalBtnAdd.addEventListener("click", () => {
    if (!state.selectedModalProduct) return;
    
    // Collect color variant
    const checkedColor = els.modalColors.querySelector("input:checked");
    const color = checkedColor ? checkedColor.value : "Default";
    
    // Collect size variant
    const checkedSize = els.modalSizes ? els.modalSizes.querySelector("input:checked") : null;
    const size = checkedSize ? checkedSize.value : "Standard";
    
    addToCart(state.selectedModalProduct.id, color, size, 1);
    els.productModal.classList.remove("open");
  });
  
  // Modal Details tab changes
  els.modalTabSpecs.addEventListener("click", () => switchModalTab("specs"));
  els.modalTabReviews.addEventListener("click", () => switchModalTab("reviews"));
  
  // Cart Checkout Action
  els.btnCheckout.addEventListener("click", () => {
    if (state.cart.length === 0) {
      showToast("Your cart is empty", "error");
      return;
    }
    toggleCartDrawer(false);
    openCheckoutFlow();
  });
  
  // Coupon Validation Engine
  els.btnPromoApply.addEventListener("click", applyCoupon);
  
  // Credit Card Form Sync with 3D animation visualizer
  els.cardNumberInput.addEventListener("input", (e) => {
    // Format card number with spaces every 4 digits
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 16) val = val.substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(" ") || "";
    e.target.value = formatted;
    
    els.cardDisplayNum.textContent = formatted || "•••• •••• •••• ••••";
  });
  
  els.cardNameInput.addEventListener("input", (e) => {
    let val = e.target.value;
    els.cardDisplayName.textContent = val.substring(0, 20).toUpperCase() || "CARDHOLDER NAME";
  });
  
  els.cardExpiryInput.addEventListener("input", (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length > 2) {
      val = val.substring(0, 2) + "/" + val.substring(2);
    }
    e.target.value = val;
    els.cardDisplayExpiry.textContent = val || "MM/YY";
  });
  
  els.cardCvvInput.addEventListener("focus", () => {
    els.creditCard.classList.add("flipped");
  });
  
  els.cardCvvInput.addEventListener("blur", () => {
    els.creditCard.classList.remove("flipped");
  });
  
  els.cardCvvInput.addEventListener("input", (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 3) val = val.substring(0, 3);
    e.target.value = val;
    els.cardDisplayCvv.textContent = val || "•••";
  });
  
  // Checkout flow control buttons
  els.btnCheckoutPrev.addEventListener("click", navigateCheckoutPrev);
  els.btnCheckoutNext.addEventListener("click", navigateCheckoutNext);
  
  // Order Tracking simulation fast forward
  els.btnFastForward.addEventListener("click", fastForwardOrderTracking);
  
  // Seller Admin Form Submission
  els.adminForm.addEventListener("submit", handleAdminAddProduct);
}

// -------------------------------------------------------------
// UI Navigation & Global Views Manager
// -------------------------------------------------------------
function showPage(pageName) {
  state.activePage = pageName;
  
  // Remove active view classes
  els.homeView.classList.remove("active");
  els.trackingView.classList.remove("active");
  els.adminView.classList.remove("active");
  
  // Clear navigation states
  els.navHome.style.fontWeight = "400";
  els.navAdmin.style.fontWeight = "400";
  
  if (pageName === "home") {
    els.homeView.classList.add("active");
    els.navHome.style.fontWeight = "700";
  } else if (pageName === "tracking") {
    els.trackingView.classList.add("active");
  } else if (pageName === "admin") {
    els.adminView.classList.add("active");
    els.navAdmin.style.fontWeight = "700";
    renderAdminProducts();
  }
  
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Premium dark/light themes logic
function toggleTheme() {
  const isDark = els.body.classList.toggle("dark-mode");
  const icon = els.themeToggle.querySelector("i");
  if (isDark) {
    icon.className = "lucide-sun";
    showToast("Dark mode enabled", "success");
  } else {
    icon.className = "lucide-moon";
    showToast("Light mode enabled", "success");
  }
}

// -------------------------------------------------------------
// Hero Slider Mechanism
// -------------------------------------------------------------
let sliderInterval;
function initHeroSlider() {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".slider-dot");
  if (slides.length === 0) return;
  
  // Function to show specific slide
  const showSlide = (idx) => {
    slides.forEach(s => s.classList.remove("active"));
    dots.forEach(d => d.classList.remove("active"));
    
    slides[idx].classList.add("active");
    dots[idx].classList.add("active");
    state.activeHeroSlide = idx;
  };
  
  // Setup click triggers on indicators
  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => {
      clearInterval(sliderInterval);
      showSlide(idx);
      startAutoPlay();
    });
  });
  
  const startAutoPlay = () => {
    sliderInterval = setInterval(() => {
      let next = (state.activeHeroSlide + 1) % slides.length;
      showSlide(next);
    }, 6000);
  };
  
  startAutoPlay();
}

// -------------------------------------------------------------
// Search Engine With Real-Time Autocomplete
// -------------------------------------------------------------
function handleSearchInput(e) {
  const query = e.target.value.toLowerCase().trim();
  state.searchQuery = query;
  
  if (query.length < 2) {
    els.searchSuggestions.style.display = "none";
    renderCatalog();
    return;
  }
  
  // Filter search matches
  const matches = products.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.category.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  ).slice(0, 5);
  
  if (matches.length > 0) {
    els.searchSuggestions.innerHTML = matches.map(p => `
      <div class="suggestion-item" data-id="${p.id}">
        <i class="lucide-search"></i>
        <div>
          <div style="font-weight:600; font-size:14px;">${p.name}</div>
          <div style="font-size:11px; color:var(--text-secondary); text-transform:uppercase;">${p.category}</div>
        </div>
      </div>
    `).join("");
    
    // Bind click events on suggestions
    els.searchSuggestions.querySelectorAll(".suggestion-item").forEach(item => {
      item.addEventListener("click", () => {
        const id = item.dataset.id;
        els.searchInput.value = getProductById(id).name;
        els.searchSuggestions.style.display = "none";
        openProductModal(id);
      });
    });
    
    els.searchSuggestions.style.display = "block";
  } else {
    els.searchSuggestions.style.display = "none";
  }
  
  renderCatalog();
}

// -------------------------------------------------------------
// Catalog Logic: Filter, Sort & Grid Renderer
// -------------------------------------------------------------
function renderCatalog() {
  let list = [...products];
  
  // 1. Filter Category
  if (state.currentCategory !== "All") {
    list = list.filter(p => p.category === state.currentCategory);
  }
  
  // 2. Filter Search Query
  if (state.searchQuery) {
    list = list.filter(p => 
      p.name.toLowerCase().includes(state.searchQuery) ||
      p.category.toLowerCase().includes(state.searchQuery)
    );
  }
  
  // 3. Filter Price Ranges
  list = list.filter(p => p.price >= state.priceFilter.min && p.price <= state.priceFilter.currentMax);
  
  // 4. Filter Rating Checkboxes
  if (state.selectedRatings.length > 0) {
    list = list.filter(p => {
      const rounded = Math.floor(p.rating);
      return state.selectedRatings.includes(rounded);
    });
  }
  
  // 5. Sort Catalog Items
  if (state.sortBy === "price-low") {
    list.sort((a, b) => a.price - b.price);
  } else if (state.sortBy === "price-high") {
    list.sort((a, b) => b.price - a.price);
  } else if (state.sortBy === "rating") {
    list.sort((a, b) => b.rating - a.rating);
  }
  
  // Update result label count
  els.resultsCount.textContent = `${list.length} premium products found`;
  
  // 6. Draw Grid Markup
  if (list.length === 0) {
    els.productsGrid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding: 48px 0; color:var(--text-tertiary);">
        <i class="lucide-inbox" style="font-size: 48px; margin-bottom:16px; display:block;"></i>
        <h3>No matching luxury items found</h3>
        <p style="font-size:14px; margin-top:8px;">Try adjusting your sidebar price or search parameters.</p>
      </div>
    `;
    return;
  }
  
  els.productsGrid.innerHTML = list.map(p => {
    // Generate star SVGs representation
    const stars = renderStarSVGs(p.rating);
    const hasDiscount = p.originalPrice > p.price;
    const discountPct = hasDiscount ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
    const isWishlisted = state.wishlist.includes(p.id) ? "active" : "";
    const lowStockText = p.stock <= 5 ? `<div class="product-card-stock"><i class="lucide-zap" style="width:12px; height:12px;"></i> Only ${p.stock} left in store!</div>` : "";
    
    return `
      <article class="product-card" data-id="${p.id}">
        <div class="product-card-img-wrapper" onclick="openProductModal('${p.id}')">
          ${hasDiscount ? `<div class="product-tag-discount">${discountPct}% OFF</div>` : ""}
          <img class="product-card-img" src="${p.images[0]}" alt="${p.name}" loading="lazy">
        </div>
        
        <button class="product-wishlist-toggle ${isWishlisted}" data-id="${p.id}" aria-label="Toggle Wishlist">
          <i class="lucide-heart"></i>
        </button>
        
        <div class="product-card-content">
          <span class="product-card-category">${p.category}</span>
          <h3 class="product-card-title" onclick="openProductModal('${p.id}')">${p.name}</h3>
          
          <div class="product-card-rating">
            <span class="stars-container">${stars}</span>
            <span>(${p.ratingCount})</span>
          </div>
          
          ${lowStockText}
          
          <div class="product-card-bottom">
            <div class="product-card-prices">
              <span class="price-current">$${p.price.toFixed(2)}</span>
              ${hasDiscount ? `<span class="price-original">$${p.originalPrice.toFixed(2)}</span>` : ""}
            </div>
            <button class="btn-card-add" data-id="${p.id}" aria-label="Quick Add to Cart">
              <i class="lucide-shopping-bag"></i>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
  
  // Bind dynamic actions on rendered cards
  els.productsGrid.querySelectorAll(".btn-card-add").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const product = getProductById(id);
      
      // Add default variant color/size options
      const colorVal = product.variants.colors ? product.variants.colors[0].name : "Default";
      const sizeVal = product.variants.sizes ? product.variants.sizes[0] : "Standard";
      
      addToCart(id, colorVal, sizeVal, 1);
    });
  });
  
  els.productsGrid.querySelectorAll(".product-wishlist-toggle").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleWishlist(btn.dataset.id);
    });
  });
}

// Star rating SVG template generator
function renderStarSVGs(rating) {
  let starsHtml = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      starsHtml += '<i class="lucide-star fill-star" style="width:14px; height:14px; fill:#f59e0b;"></i>';
    } else if (i - 0.5 <= rating) {
      starsHtml += '<i class="lucide-star-half" style="width:14px; height:14px; fill:#f59e0b; color:#f59e0b;"></i>';
    } else {
      starsHtml += '<i class="lucide-star" style="width:14px; height:14px; color:#cbd5e1;"></i>';
    }
  }
  return starsHtml;
}

// -------------------------------------------------------------
// Immersive Product Details Modal Manager
// -------------------------------------------------------------
function openProductModal(productId) {
  const p = getProductById(productId);
  if (!p) return;
  
  state.selectedModalProduct = p;
  
  // Reset tabs
  switchModalTab("specs");
  
  // 1. Text & Pricing Info
  els.modalCategory.textContent = p.category;
  els.modalTitle.textContent = p.name;
  els.modalRatingStars.innerHTML = renderStarSVGs(p.rating);
  els.modalRatingCount.textContent = `(${p.ratingCount} detailed reviews)`;
  els.modalPriceCurrent.textContent = `$${p.price.toFixed(2)}`;
  
  if (p.originalPrice > p.price) {
    els.modalPriceOriginal.textContent = `$${p.originalPrice.toFixed(2)}`;
    els.modalPriceOriginal.style.display = "inline";
  } else {
    els.modalPriceOriginal.style.display = "none";
  }
  
  els.modalDescription.textContent = p.description;
  
  // 2. High-res Images & Carousel
  els.modalMainImg.src = p.images[0];
  els.modalThumbnails.innerHTML = p.images.map((img, idx) => `
    <img class="thumb-img ${idx === 0 ? "active" : ""}" src="${img}" alt="Thumbnail" data-index="${idx}">
  `).join("");
  
  // Bind thumbnail swapping clicks
  els.modalThumbnails.querySelectorAll(".thumb-img").forEach(thumb => {
    thumb.addEventListener("click", () => {
      els.modalThumbnails.querySelectorAll(".thumb-img").forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
      els.modalMainImg.src = p.images[parseInt(thumb.dataset.index)];
    });
  });
  
  // 3. Variant colors buttons
  if (p.variants && p.variants.colors) {
    els.modalColors.innerHTML = p.variants.colors.map((c, idx) => `
      <div class="color-dot-wrapper">
        <input type="radio" name="modal-color" value="${c.name}" ${idx === 0 ? "checked" : ""}>
        <span class="color-dot-visual" style="background-color: ${c.value};"></span>
      </div>
    `).join("");
  } else {
    els.modalColors.innerHTML = `<span style="font-size:13px; color:var(--text-secondary);">No dynamic colors available</span>`;
  }
  
  // 4. Variant sizes buttons
  if (p.variants && p.variants.sizes && p.variants.sizes.length > 0) {
    els.modalSizes.innerHTML = p.variants.sizes.map((s, idx) => `
      <div class="size-btn-wrapper">
        <input type="radio" name="modal-size" value="${s}" ${idx === 0 ? "checked" : ""}>
        <span class="size-btn-visual">${s}</span>
      </div>
    `).join("");
  } else {
    els.modalSizes.innerHTML = `<span style="font-size:13px; color:var(--text-secondary);">One size fits all</span>`;
  }
  
  // 5. Specs Table building
  const specsRows = Object.entries(p.specs).map(([key, val]) => `
    <tr>
      <td class="spec-key">${key}</td>
      <td>${val}</td>
    </tr>
  `).join("");
  
  els.panelSpecs.innerHTML = `<table class="specs-table">${specsRows}</table>`;
  
  // 6. User Reviews layout
  els.reviewsSummary.innerHTML = `
    <div style="text-align:center;">
      <div class="summary-score-large">${p.rating.toFixed(1)}</div>
      <div class="stars-container" style="justify-content:center; margin: 4px 0 8px 0;">${renderStarSVGs(p.rating)}</div>
      <div style="font-size:12px; color:var(--text-secondary); font-weight:500;">Store Rating Score</div>
    </div>
    <div style="display:flex; flex-direction:column; gap:6px;">
      ${renderReviewBars(p.rating)}
    </div>
  `;
  
  els.reviewsList.innerHTML = p.reviews.map(r => `
    <div class="review-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="stars-container">${renderStarSVGs(r.rating)}</span>
        ${r.verified ? `<span class="review-verified-badge"><i class="lucide-badge-check" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:3px;"></i>Verified Purchase</span>` : ""}
      </div>
      <p class="review-text">"${r.comment}"</p>
      <div class="review-author-row">
        <span>By ${r.author}</span>
        <span>Published ${r.date}</span>
      </div>
    </div>
  `).join("");
  
  // Enable opening overlay
  els.productModal.classList.add("open");
}

function switchModalTab(tabName) {
  state.activeModalTab = tabName;
  
  els.modalTabSpecs.classList.remove("active");
  els.modalTabReviews.classList.remove("active");
  els.panelSpecs.classList.remove("active");
  els.panelReviews.classList.remove("active");
  
  if (tabName === "specs") {
    els.modalTabSpecs.classList.add("active");
    els.panelSpecs.classList.add("active");
  } else {
    els.modalTabReviews.classList.add("active");
    els.panelReviews.classList.add("active");
  }
}

// Generate stylized reviews percentage bar distributions
function renderReviewBars(rating) {
  // Mock ratios representing rating levels
  const ratios = [
    { stars: 5, pct: rating >= 4.8 ? 85 : 72 },
    { stars: 4, pct: rating >= 4.8 ? 12 : 20 },
    { stars: 3, pct: 6 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 1 }
  ];
  
  return ratios.map(r => `
    <div style="display:flex; align-items:center; gap:8px; font-size:12px;">
      <span style="width:10px; font-weight:600;">${r.stars}</span>
      <i class="lucide-star fill-star" style="width:10px; height:10px; fill:#f59e0b; color:#f59e0b;"></i>
      <div style="flex:1; height:6px; background-color:var(--border-color); border-radius:3px; overflow:hidden;">
        <div style="width:${r.pct}%; height:100%; background-color:#f59e0b; border-radius:3px;"></div>
      </div>
      <span style="width:28px; text-align:right; color:var(--text-secondary); font-weight:500;">${r.pct}%</span>
    </div>
  `).join("");
}

// -------------------------------------------------------------
// Cart Drawer state operations
// -------------------------------------------------------------
function toggleCartDrawer(open) {
  if (open) {
    renderCart();
    els.cartDrawer.classList.add("open");
    els.drawerBackdrop.classList.add("active");
  } else {
    els.cartDrawer.classList.remove("open");
    els.drawerBackdrop.classList.remove("active");
  }
}

function addToCart(productId, color, size, qty) {
  const p = getProductById(productId);
  if (!p) return;
  
  // Check mock store inventory
  if (p.stock <= 0) {
    showToast("This exclusive piece is currently out of stock!", "error");
    return;
  }
  
  // Subtract mock inventory limits
  p.stock -= qty;
  
  // Check if color/size combination already exists
  const existingIdx = state.cart.findIndex(item => 
    item.product.id === productId && 
    item.color === color && 
    item.size === size
  );
  
  if (existingIdx > -1) {
    state.cart[existingIdx].quantity += qty;
  } else {
    state.cart.push({ product: p, color, size, quantity: qty });
  }
  
  updateCartBadge();
  renderCatalog(); // Refreshes left inventory badge
  
  showToast(`Added ${p.name} to Cart`, "success");
  
  // Automatically expand sliding cart view drawer
  setTimeout(() => toggleCartDrawer(true), 300);
}

function updateCartQuantity(idx, diff) {
  const item = state.cart[idx];
  if (!item) return;
  
  const p = getProductById(item.product.id);
  
  if (diff > 0) {
    // Adding quantity
    if (p.stock <= 0) {
      showToast("Cannot add more: Max available stock reached!", "error");
      return;
    }
    p.stock -= 1;
    item.quantity += 1;
  } else {
    // Subtracting quantity
    p.stock += 1;
    item.quantity -= 1;
    if (item.quantity <= 0) {
      state.cart.splice(idx, 1);
      showToast(`Removed ${p.name} from Cart`, "success");
    }
  }
  
  updateCartBadge();
  renderCatalog();
  renderCart();
}

function removeItemFromCart(idx) {
  const item = state.cart[idx];
  if (!item) return;
  
  const p = getProductById(item.product.id);
  p.stock += item.quantity; // Restore inventory limits
  
  state.cart.splice(idx, 1);
  updateCartBadge();
  renderCatalog();
  renderCart();
  
  showToast("Item removed from your cart", "success");
}

function renderCart() {
  if (state.cart.length === 0) {
    els.cartItemsList.innerHTML = `
      <div class="cart-empty">
        <i class="lucide-shopping-cart"></i>
        <h3>Your shopping cart is empty</h3>
        <p style="font-size:14px; margin-top:4px;">Add premium items to make this cart look happy!</p>
      </div>
    `;
    
    els.cartSubtotal.textContent = "$0.00";
    els.cartDiscountRow.style.display = "none";
    els.cartTotal.textContent = "$0.00";
    return;
  }
  
  els.cartItemsList.innerHTML = state.cart.map((item, idx) => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.product.images[0]}" alt="${item.product.name}">
      <div class="cart-item-info">
        <h4 class="cart-item-title">${item.product.name}</h4>
        <div class="cart-item-variant">Variant: ${item.color} | Size: ${item.size}</div>
        <div class="cart-item-bottom">
          <div class="qty-counter">
            <button class="qty-btn dec" onclick="updateCartQuantity(${idx}, -1)">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn inc" onclick="updateCartQuantity(${idx}, 1)">+</button>
          </div>
          <span class="cart-item-price">$${(item.product.price * item.quantity).toFixed(2)}</span>
          <button class="cart-item-remove" onclick="removeItemFromCart(${idx})" aria-label="Remove item">
            <i class="lucide-trash-2" style="width:16px; height:16px;"></i>
          </button>
        </div>
      </div>
    </div>
  `).join("");
  
  calculateOrderTotals();
}

function calculateOrderTotals() {
  let subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  let discount = 0;
  
  if (state.appliedPromo) {
    const promo = state.appliedPromo;
    if (promo.type === "percent") {
      discount = subtotal * (promo.value / 100);
    } else if (promo.type === "flat") {
      discount = promo.value;
    }
  }
  
  // Clamp discount limits
  if (discount > subtotal) discount = subtotal;
  
  let total = subtotal - discount;
  
  els.cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  
  if (discount > 0) {
    els.cartDiscount.textContent = `-$${discount.toFixed(2)}`;
    els.cartDiscountRow.style.display = "flex";
  } else {
    els.cartDiscountRow.style.display = "none";
  }
  
  els.cartTotal.textContent = `$${total.toFixed(2)}`;
}

function updateCartBadge() {
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  els.cartBadge.textContent = count > 0 ? count : "";
}

// -------------------------------------------------------------
// Coupon Codes Engine Validation
// -------------------------------------------------------------
function applyCoupon() {
  const code = els.promoCodeInput.value.toUpperCase().trim();
  
  if (!code) {
    showPromoStatus("Please enter a valid coupon code", "error");
    return;
  }
  
  if (VALID_COUPONS[code]) {
    state.appliedPromo = VALID_COUPONS[code];
    calculateOrderTotals();
    showPromoStatus(`Promo code "${code}" applied successfully!`, "success");
    showToast("Premium discount applied!", "success");
  } else {
    showPromoStatus("Invalid or expired code. Try 'CARTIT20' or 'WELCOME50'!", "error");
  }
}

function showPromoStatus(msg, type) {
  els.promoStatusMsg.textContent = msg;
  els.promoStatusMsg.className = `promo-status-msg ${type}`;
}

// -------------------------------------------------------------
// Wishlist State Management
// -------------------------------------------------------------
function toggleWishlist(productId) {
  const idx = state.wishlist.indexOf(productId);
  const p = getProductById(productId);
  if (!p) return;
  
  if (idx > -1) {
    state.wishlist.splice(idx, 1);
    showToast(`Removed ${p.name} from Wishlist`, "success");
  } else {
    state.wishlist.push(productId);
    showToast(`Saved ${p.name} to Wishlist`, "success");
  }
  
  updateWishlistBadge();
  renderCatalog();
}

function updateWishlistBadge() {
  const count = state.wishlist.length;
  els.wishlistBadge.textContent = count > 0 ? count : "";
}

// -------------------------------------------------------------
// Checkout Modal & Multi-Step Logic
// -------------------------------------------------------------
let checkoutStep = 1;
const totalCheckoutSteps = 3;

function openCheckoutFlow() {
  checkoutStep = 1;
  updateCheckoutStepUI();
  
  // Pre-fill fields if mock data requested, keep clean by default
  els.cardNumberInput.value = "";
  els.cardNameInput.value = "";
  els.cardExpiryInput.value = "";
  els.cardCvvInput.value = "";
  
  els.cardDisplayNum.textContent = "•••• •••• •••• ••••";
  els.cardDisplayName.textContent = "CARDHOLDER NAME";
  els.cardDisplayExpiry.textContent = "MM/YY";
  els.cardDisplayCvv.textContent = "•••";
  
  els.checkoutModal.classList.add("open");
}

function updateCheckoutStepUI() {
  // Update timeline width lines
  const pct = ((checkoutStep - 1) / (totalCheckoutSteps - 1)) * 100;
  els.checkoutStepLines.style.width = `${pct}%`;
  
  // Toggle step indicators
  document.querySelectorAll(".checkout-step-indicator").forEach((ind, idx) => {
    const stepNum = idx + 1;
    ind.classList.remove("active", "completed");
    
    if (stepNum === checkoutStep) {
      ind.classList.add("active");
    } else if (stepNum < checkoutStep) {
      ind.classList.add("completed");
    }
  });
  
  // Toggle step panels
  document.querySelectorAll(".checkout-step-pane").forEach((pane, idx) => {
    pane.classList.toggle("active", (idx + 1) === checkoutStep);
  });
  
  // Toggle flow control buttons
  els.btnCheckoutPrev.style.display = checkoutStep === 1 ? "none" : "flex";
  
  if (checkoutStep === totalCheckoutSteps) {
    els.btnCheckoutNext.innerHTML = 'Complete Order <i class="lucide-check" style="width:16px; height:16px;"></i>';
    els.btnCheckoutNext.style.backgroundColor = "#10b981";
  } else {
    els.btnCheckoutNext.innerHTML = 'Continue <i class="lucide-chevron-right" style="width:16px; height:16px;"></i>';
    els.btnCheckoutNext.style.backgroundColor = "var(--accent-indigo)";
  }
}

function navigateCheckoutPrev() {
  if (checkoutStep > 1) {
    checkoutStep -= 1;
    updateCheckoutStepUI();
  }
}

function navigateCheckoutNext() {
  if (checkoutStep === 1) {
    // Form shipping validation check
    const name = document.getElementById("ship-name").value.trim();
    const address = document.getElementById("ship-address").value.trim();
    const city = document.getElementById("ship-city").value.trim();
    const zip = document.getElementById("ship-zip").value.trim();
    
    if (!name || !address || !city || !zip) {
      showToast("Please fill all required shipping address fields", "error");
      return;
    }
    
    checkoutStep = 2;
    updateCheckoutStepUI();
  } else if (checkoutStep === 2) {
    // Payment credentials validation check
    const cardNum = els.cardNumberInput.value.replace(/\s/g, "");
    const cardName = els.cardNameInput.value.trim();
    const cardExp = els.cardExpiryInput.value.trim();
    const cardCvv = els.cardCvvInput.value.trim();
    
    if (cardNum.length < 16 || !cardName || cardExp.length < 5 || cardCvv.length < 3) {
      showToast("Please enter complete and valid credit card credentials", "error");
      return;
    }
    
    checkoutStep = 3;
    updateCheckoutStepUI();
    simulateOrderSuccess();
  } else if (checkoutStep === 3) {
    // Final Submit & Place Order success view redirection
    els.checkoutModal.classList.remove("open");
    showPage("tracking");
    startOrderTrackingSimulation();
  }
}

function simulateOrderSuccess() {
  // Pre-generate dynamic tracking object
  const trackingId = "CRIT-" + Math.floor(10000000 + Math.random() * 90000000);
  const itemsCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  
  state.trackingOrder = {
    id: trackingId,
    itemsCount,
    statusStep: 0, // Timeline step: 0=Ordered, 1=Packed, 2=Shipped, 3=Out for Delivery, 4=Delivered
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  };
  
  // Populate success fields
  els.orderTrackingId.textContent = trackingId;
  els.orderItemsCount.textContent = `${itemsCount} exclusive pieces`;
  
  // Calculate delivery date (3 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  els.orderEstDelivery.textContent = deliveryDate.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' });
  
  // Clean cart state details
  state.cart = [];
  state.appliedPromo = null;
  els.promoCodeInput.value = "";
  els.promoStatusMsg.textContent = "";
  updateCartBadge();
  
  // Fire beautiful modern CSS Confetti elements
  triggerConfettiExplosion();
}

function triggerConfettiExplosion() {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "100vw";
  container.style.height = "100vh";
  container.style.pointerEvents = "none";
  container.style.zIndex = "2100";
  document.body.appendChild(container);
  
  const colors = ["#4f46e5", "#d97706", "#f43f5e", "#10b981", "#3b82f6"];
  
  for (let i = 0; i < 100; i++) {
    const c = document.createElement("div");
    c.style.position = "absolute";
    c.style.width = `${Math.random() * 8 + 6}px`;
    c.style.height = `${Math.random() * 12 + 6}px`;
    c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    c.style.left = `${Math.random() * 100}vw`;
    c.style.top = `-20px`;
    c.style.borderRadius = "2px";
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    // Animate falling down dynamically
    c.style.transition = `transform ${Math.random() * 2 + 2}s linear, top ${Math.random() * 2 + 2}s linear`;
    container.appendChild(c);
    
    setTimeout(() => {
      c.style.top = "105vh";
      c.style.transform = `rotate(${Math.random() * 720}deg) translateX(${Math.random() * 100 - 50}px)`;
    }, 50);
  }
  
  setTimeout(() => container.remove(), 4000);
}

// -------------------------------------------------------------
// Live Order Tracking Simulated progress bar timeline
// -------------------------------------------------------------
let trackingTimer = null;

function startOrderTrackingSimulation() {
  if (!state.trackingOrder) return;
  
  if (trackingTimer) clearInterval(trackingTimer);
  
  state.trackingOrder.statusStep = 0;
  updateTrackingTimelineUI();
  
  // Set automatic cron timeline updates every 15 seconds to simulate a live shipment progress
  trackingTimer = setInterval(() => {
    if (state.trackingOrder.statusStep < 4) {
      state.trackingOrder.statusStep += 1;
      updateTrackingTimelineUI();
      
      const statusNames = ["Order Received", "Packed & Quality Checked", "Dispatched From Facility", "Out for Delivery", "Delivered Successfully!"];
      showToast(`Shipment Status: ${statusNames[state.trackingOrder.statusStep]}`, "success");
    } else {
      clearInterval(trackingTimer);
    }
  }, 12000);
}

function updateTrackingTimelineUI() {
  const step = state.trackingOrder.statusStep;
  
  // Update progress line width
  const pct = (step / 4) * 100;
  els.trackingLineProgress.style.width = `${pct}%`;
  
  // Toggle timeline nodes
  document.querySelectorAll(".timeline-step-indicator").forEach((node, idx) => {
    node.classList.remove("active", "completed");
    
    if (idx === step) {
      node.classList.add("active");
    } else if (idx < step) {
      node.classList.add("completed");
    }
  });
  
  // Toggle simulating fast-forward button status
  if (step >= 4) {
    els.btnFastForward.innerHTML = 'Order Fully Delivered <i class="lucide-smile" style="width:16px; height:16px;"></i>';
    els.btnFastForward.style.opacity = "0.7";
    els.btnFastForward.style.pointerEvents = "none";
  } else {
    els.btnFastForward.innerHTML = 'Fast Forward Delivery <i class="lucide-zap" style="width:16px; height:16px;"></i>';
    els.btnFastForward.style.opacity = "1";
    els.btnFastForward.style.pointerEvents = "auto";
  }
}

function fastForwardOrderTracking() {
  if (!state.trackingOrder || state.trackingOrder.statusStep >= 4) return;
  
  state.trackingOrder.statusStep += 1;
  updateTrackingTimelineUI();
  
  const statusNames = ["Order Received", "Packed & Quality Checked", "Dispatched From Facility", "Out for Delivery", "Delivered Successfully!"];
  showToast(`Fast Forward: ${statusNames[state.trackingOrder.statusStep]}`, "success");
  
  if (state.trackingOrder.statusStep === 4) {
    clearInterval(trackingTimer);
  }
}

// -------------------------------------------------------------
// Interactive Support Chatbot Logic
// -------------------------------------------------------------
const BOT_ANSWERS = {
  "track": "To track your current delivery, click the 'Track Order' option at the top page or use the Shipment Tracking simulator after checkout.",
  "return": "We offer a fully complimentary 30-day premium return policy. All returns must be returned in their original luxurious packaging.",
  "discount": "We love welcoming newcomers! Try applying the premium coupon code <b>CARTIT20</b> inside your cart to get a 20% discount on your order.",
  "contact": "Our dedicated, premium customer concierge service is available 24/7. You can reach out directly via email at support@cartit.luxury or call our VIP desk.",
  "other": "I am our dedicated AI assistant chatbot. Feel free to click any of our quick concern options below to see how I can support you!"
};

function initChatbot() {
  // Toggle chatbot drawer open
  els.chatbotTrigger.addEventListener("click", () => {
    els.chatbotWindow.classList.toggle("open");
  });
  
  els.chatbotClose.addEventListener("click", () => {
    els.chatbotWindow.classList.remove("open");
  });
  
  // Default introductory greeting
  appendBotMessage("Welcome to the <b>CART_IT</b> concierge desk. How may I elevate your luxury shopping experience today?");
  
  // Bind FAQ quick buttons
  document.querySelectorAll(".quick-option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const topic = btn.dataset.topic;
      const label = btn.textContent;
      
      // Add user speech bubble
      appendUserMessage(label);
      
      // Simulate typing dot bubbles delay
      appendTypingIndicator();
      
      setTimeout(() => {
        removeTypingIndicator();
        appendBotMessage(BOT_ANSWERS[topic] || BOT_ANSWERS["other"]);
      }, 1000);
    });
  });
}

function appendUserMessage(text) {
  const m = document.createElement("div");
  m.className = "chat-bubble user";
  m.textContent = text;
  els.chatContent.appendChild(m);
  scrollChatToBottom();
}

function appendBotMessage(htmlContent) {
  const m = document.createElement("div");
  m.className = "chat-bubble bot";
  m.innerHTML = htmlContent;
  els.chatContent.appendChild(m);
  scrollChatToBottom();
}

function appendTypingIndicator() {
  const m = document.createElement("div");
  m.className = "chat-bubble bot typing-indicator";
  m.id = "chat-typing";
  m.innerHTML = '<span style="display:inline-block; width:6px; height:6px; background-color:var(--text-secondary); border-radius:50%; margin-right:3px; animation: bounce 0.6s infinite alternate;"></span><span style="display:inline-block; width:6px; height:6px; background-color:var(--text-secondary); border-radius:50%; margin-right:3px; animation: bounce 0.6s infinite 0.2s alternate;"></span><span style="display:inline-block; width:6px; height:6px; background-color:var(--text-secondary); border-radius:50%; animation: bounce 0.6s infinite 0.4s alternate;"></span>';
  els.chatContent.appendChild(m);
  scrollChatToBottom();
  
  // Inject keyframes if missing
  if (!document.getElementById("chatbot-bounce-style")) {
    const s = document.createElement("style");
    s.id = "chatbot-bounce-style";
    s.innerHTML = "@keyframes bounce { to { transform: translateY(-4px); } }";
    document.head.appendChild(s);
  }
}

function removeTypingIndicator() {
  const ind = document.getElementById("chat-typing");
  if (ind) ind.remove();
}

function scrollChatToBottom() {
  els.chatContent.scrollTop = els.chatContent.scrollHeight;
}

// -------------------------------------------------------------
// Interactive Seller Admin Dashboard Logic
// -------------------------------------------------------------
function initAdminDashboard() {
  // Update Analytics numbers initially
  updateAdminStats();
}

function renderAdminProducts() {
  els.adminProductsTable.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.images[0]}" alt="${p.name}"></td>
      <td style="font-weight:600;">${p.name}</td>
      <td style="text-transform:uppercase; font-size:11px; color:var(--text-secondary);">${p.category}</td>
      <td style="font-weight:700;">$${p.price.toFixed(2)}</td>
      <td style="font-weight:600; color:${p.stock <= 5 ? "var(--accent-rose)" : "inherit"}">${p.stock} units</td>
      <td>
        <button onclick="deleteAdminProduct('${p.id}')" style="color:var(--accent-rose);" aria-label="Delete product">
          <i class="lucide-trash-2" style="width:16px; height:16px;"></i>
        </button>
      </td>
    </tr>
  `).join("");
}

function updateAdminStats() {
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  els.statInventory.textContent = `${totalStock} units`;
  
  // Static mock variables representing historic mock seller data
  els.statSales.textContent = "$14,842.50";
  els.statOrders.textContent = "182 orders";
}

function handleAdminAddProduct(e) {
  e.preventDefault();
  
  const name = document.getElementById("prod-name").value.trim();
  const category = document.getElementById("prod-category").value;
  const price = parseFloat(document.getElementById("prod-price").value) || 0;
  const originalPrice = parseFloat(document.getElementById("prod-original-price").value) || price;
  const stock = parseInt(document.getElementById("prod-stock").value) || 10;
  const desc = document.getElementById("prod-desc").value.trim();
  const image = document.getElementById("prod-image").value.trim() || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
  
  if (!name || !price || !desc) {
    showToast("Please fill in core name, price, and description fields", "error");
    return;
  }
  
  // Build new luxury item object structure
  const newProduct = {
    id: "p" + (products.length + 1) + "-" + Math.floor(Math.random() * 1000),
    name,
    category,
    price,
    originalPrice,
    rating: 5.0,
    ratingCount: 1,
    stock,
    images: [image],
    description: desc,
    specs: {
      "Brand": "Custom Vendor",
      "Model": "Standard Series",
      "Availability": "Added via Dashboard Admin"
    },
    features: [
      "Custom Handcrafted Quality Product",
      "Added directly through Admin control board"
    ],
    variants: {
      colors: [{ name: "Standard Color", value: "#4f46e5" }],
      sizes: ["Standard"]
    },
    reviews: [
      {
        author: "System Administrator",
        rating: 5,
        date: new Date().toISOString().split("T")[0],
        comment: "Item added directly through the seller management panel. Verified standard inventory item.",
        verified: false
      }
    ]
  };
  
  products.unshift(newProduct);
  
  // Reset admin form inputs
  els.adminForm.reset();
  
  // Re-render interfaces
  renderCatalog();
  renderAdminProducts();
  updateAdminStats();
  
  showToast(`Successfully added "${name}" to store catalog!`, "success");
}

function deleteAdminProduct(productId) {
  const idx = products.findIndex(p => p.id === productId);
  if (idx > -1) {
    const name = products[idx].name;
    products.splice(idx, 1);
    
    renderCatalog();
    renderAdminProducts();
    updateAdminStats();
    
    showToast(`Deleted "${name}" from store catalog`, "success");
  }
}

// -------------------------------------------------------------
// Interactive Dynamic Toast System
// -------------------------------------------------------------
function showToast(msg, type = "success") {
  const t = document.createElement("div");
  t.className = "toast";
  
  const icon = type === "success" ? "lucide-check-circle" : "lucide-alert-circle";
  const color = type === "success" ? "#10b981" : "var(--accent-rose)";
  
  t.innerHTML = `
    <i class="${icon}" style="color:${color}; width:18px; height:18px;"></i>
    <span style="font-weight:500;">${msg}</span>
  `;
  
  els.toastContainer.appendChild(t);
  
  // Auto-garbage collect toast node
  setTimeout(() => {
    t.remove();
  }, 3000);
}

// Global exposes for inlined HTML event triggers
window.updateCartQuantity = updateCartQuantity;
window.removeItemFromCart = removeItemFromCart;
window.deleteAdminProduct = deleteAdminProduct;
window.openProductModal = openProductModal;
