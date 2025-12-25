document.addEventListener("DOMContentLoaded", () => {
  // Leafletが読み込まれていない場合は処理を止める
  const mapElement = document.getElementById("map");
  if (!mapElement || typeof L === "undefined") {
    return;
  }

  // カフェデータの取得
  const cafeData = window.CAFE_DATA;
  if (!cafeData) {
    return;
  }
  const cafes = cafeData.cafes;
  const stats = cafeData.getStats();

  const totalCafesEl = document.getElementById("total-cafes");
  const totalAreasEl = document.getElementById("total-areas");
  const latestVisitEl = document.getElementById("latest-visit");
  if (totalCafesEl) {
    totalCafesEl.dataset.target = String(stats.totalCafes);
    totalCafesEl.textContent = "0";
  }
  if (totalAreasEl) {
    totalAreasEl.dataset.target = String(stats.areas);
    totalAreasEl.textContent = "0";
  }
  if (latestVisitEl && stats.latestVisit) {
    const match = stats.latestVisit.match(/(\d{4})年(\d{1,2})月/);
    if (match) {
      latestVisitEl.dataset.target = match[1];
      latestVisitEl.dataset.suffix = `年${match[2]}月`;
      latestVisitEl.textContent = "0";
    } else {
      latestVisitEl.textContent = stats.latestVisit;
    }
  }

  // 岡山駅周辺を初期表示の中心に設定
  const stationCenter = [34.6617, 133.9183];

  // 地図の初期化
  function initMap() {
    const mapInstance = L.map("map", { scrollWheelZoom: false }).setView(stationCenter, 14);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(mapInstance);

    return mapInstance;
  }

  const map = initMap();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  console.log("モバイルデバイス:", isMobile);

  // ズームコントロールの配置調整
  map.zoomControl.remove();
  L.control.zoom({ position: "bottomleft" }).addTo(map);

  // マーカー管理用レイヤー
  const markerLayer = L.layerGroup().addTo(map);

  const markerById = new Map();

  // カスタムマーカー
  const customIcon = L.divIcon({
    html: '<i class="fas fa-map-marker-alt"></i>',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42],
    className: "custom-cafe-marker",
  });

  const popupOptions = {
    closeOnClick: false,
    closeButton: true,
    autoClose: false,
    closeOnEscapeKey: true,
    maxWidth: 300,
    minWidth: 250,
    keepInView: true,
    autoPan: true,
    autoPanPadding: [10, 10],
    className: "cafe-popup-persistent",
  };

  const formatPrice = (price) => "￥".repeat(price);

  // 星評価をHTMLに変換
  const getRatingStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    const stars = [];
    for (let i = 0; i < full; i += 1) {
      stars.push('<i class="fa-solid fa-star"></i>');
    }
    if (half) {
      stars.push('<i class="fa-solid fa-star-half-stroke"></i>');
    }
    for (let i = 0; i < empty; i += 1) {
      stars.push('<i class="fa-regular fa-star"></i>');
    }
    return stars.join("");
  };

  // ポップアップのテンプレート生成
  const buildPopup = (cafe) => {
    const badges = cafe.features
      .map(
        (feature) =>
          `<span style="background:#F7F2EC;color:#3E2A1E;border-radius:999px;padding:2px 8px;font-size:11px;font-weight:600;">${feature}</span>`
      )
      .join(" ");
    return `
      <div class="cafe-popup-container" style="background:#fff;position:relative;">
        <button type="button" data-popup-image data-image="${cafe.image}" data-alt="${cafe.name}" style="display:block;width:100%;border:none;padding:0;cursor:pointer;background:none;">
          <img src="${cafe.image}" alt="${cafe.name}" class="popup-image" style="width:100%;" />
        </button>
        <div class="cafe-popup-content" style="padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <h3 style="font-size:16px;font-weight:700;color:#3E2A1E;">${cafe.name}</h3>
            <button type="button" class="favorite-icon-btn" data-action="favorite" data-cafe-id="${cafe.id}" aria-label="お気に入り">
              <i class="fa-regular fa-heart"></i>
            </button>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:6px;color:#B98A62;font-size:12px;">
            <span>${getRatingStars(cafe.rating)}</span>
            <span style="color:#6D5B4C;">${cafe.rating.toFixed(1)}/5</span>
          </div>
          <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;">
            <span style="background:#E3C5A4;color:#3E2A1E;border-radius:999px;padding:2px 8px;font-size:11px;font-weight:600;">${cafe.area}</span>
            ${badges}
          </div>
          <div style="margin-top:10px;font-size:12px;color:#6D5B4C;display:flex;align-items:center;gap:6px;">
            <i class="fa-solid fa-yen-sign" style="color:#3E2A1E;"></i>
            ${formatPrice(cafe.price)}
          </div>
          <div style="margin-top:8px;font-size:12px;color:#6D5B4C;display:flex;align-items:flex-start;gap:6px;">
            <span>📍</span>
            <span>${cafe.address}</span>
          </div>
          <p style="margin-top:8px;font-size:12px;color:#231B17;line-height:1.5;">${cafe.comment}</p>
          <p style="margin-top:6px;font-size:11px;color:#6D5B4C;">訪問日: ${cafe.visitDate}</p>
          <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:6px;">
            <a class="button" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              cafe.address
            )}" target="_blank" rel="noreferrer" style="background:#3E2A1E;color:#fff;padding:6px 10px;border-radius:999px;font-size:11px;font-weight:600;">Googleマップで開く</a>
            <button type="button" data-action="details" data-cafe-id="${cafe.id}" style="background:#F7F2EC;color:#3E2A1E;padding:6px 10px;border-radius:999px;font-size:11px;font-weight:600;border:1px solid #E3C5A4;">詳細を見る</button>
            <a class="button" href="${cafe.instagram}" target="_blank" rel="noreferrer" style="background:#B98A62;color:#fff;padding:6px 10px;border-radius:999px;font-size:11px;font-weight:600;">Instagramで見る</a>
          </div>
          <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px;">
            <button type="button" data-action="route" data-cafe-id="${cafe.id}" style="background:#231B17;color:#fff;padding:6px 10px;border-radius:999px;font-size:11px;font-weight:600;">現在地からのルート</button>
            <button type="button" data-action="share" data-cafe-id="${cafe.id}" style="background:#fff;color:#3E2A1E;padding:6px 10px;border-radius:999px;font-size:11px;font-weight:600;border:1px solid #E3C5A4;">このカフェを共有</button>
          </div>
        </div>
      </div>
    `;
  };

  // マーカーとポップアップを生成
  cafes.forEach((cafe) => {
    const marker = L.marker(cafe.coordinates, { icon: customIcon });
    const popup = L.popup(popupOptions).setContent(buildPopup(cafe));
    marker.bindPopup(popup);
    marker.on("click touchstart", (event) => {
      if (event.originalEvent) {
        event.originalEvent.stopPropagation();
        event.originalEvent.preventDefault();
      }
      L.DomEvent.stop(event);
      map.eachLayer((layer) => {
        if (layer instanceof L.Popup) {
          map.closePopup(layer);
        }
      });
      marker.openPopup();
    });
    marker.cafeId = cafe.id;
    markerById.set(cafe.id, marker);
    markerLayer.addLayer(marker);
  });

  // お気に入り管理（LocalStorage）
  const favoritesKey = "cafeFavorites";
  const favorites = new Set(JSON.parse(localStorage.getItem(favoritesKey) || "[]"));

  let popupOpenTime = 0;

  // ポップアップのイベント制御
  map.on("popupopen", (event) => {
    popupOpenTime = Date.now();
    console.log("ポップアップ開いた");
    const popupEl = event.popup.getElement();
    if (!popupEl) {
      return;
    }
    L.DomEvent.on(popupEl, "click mousedown touchstart", (popupEvent) => {
      L.DomEvent.stopPropagation(popupEvent);
    });
    popupEl.querySelectorAll("a, button, input, select, textarea").forEach((element) => {
      L.DomEvent.on(element, "click touchstart", (popupEvent) => {
        L.DomEvent.stopPropagation(popupEvent);
      });
    });
    popupEl.querySelectorAll(".scrollable, .cafe-popup-content").forEach((element) => {
      L.DomEvent.on(element, "touchstart touchmove touchend", (popupEvent) => {
        L.DomEvent.stopPropagation(popupEvent);
      });
    });
    const favButton = popupEl.querySelector('[data-action="favorite"]');
    if (favButton) {
      const id = Number(favButton.dataset.cafeId);
      if (favorites.has(id)) {
        favButton.classList.add("is-active");
        const icon = favButton.querySelector("i");
        if (icon) {
          icon.className = "fa-solid fa-heart";
        }
      }
    }
  });

  map.on("popupclose", () => {
    const duration = Date.now() - popupOpenTime;
    console.log(`ポップアップが閉じた（表示時間: ${duration}ms）`);
    if (duration < 500) {
      console.warn("警告: ポップアップがすぐに閉じました");
    }
  });

  let lastTapTime = 0;

  // 背景タップでポップアップを閉じる
  map.on("click", (event) => {
    const target = event.originalEvent?.target;
    const isProtected =
      target?.closest?.(".leaflet-popup") ||
      target?.closest?.(".custom-cafe-marker") ||
      target?.closest?.(".svg-cafe-marker") ||
      target?.closest?.(".leaflet-marker-icon");
    if (!isProtected) {
      map.closePopup();
    }
  });

  map.on("touchstart", (event) => {
    const currentTime = new Date().getTime();
    const tapInterval = currentTime - lastTapTime;

    if (tapInterval < 300 && tapInterval > 0) {
      event.originalEvent?.preventDefault();
      return;
    }

    lastTapTime = currentTime;

    const target = event.originalEvent?.target;
    const isProtected =
      target?.closest?.(".leaflet-popup") ||
      target?.closest?.(".custom-cafe-marker") ||
      target?.closest?.(".svg-cafe-marker") ||
      target?.closest?.(".leaflet-marker-icon");
    if (!isProtected) {
      setTimeout(() => {
        map.closePopup();
      }, 100);
    }
  });

  // フィルター状態
  const state = {
    search: "",
    area: "all",
    price: "all",
    features: new Set(),
    sort: "recommended",
    favoritesOnly: false,
  };
  let currentView = "map";
  const cafeCountEl = document.getElementById("cafe-count");
  const cafeCountLabel = document.querySelector(".count-label");
  let hasAnimatedCafeCount = false;
  let currentFiltered = cafes;

  let autoScrollInterval = null;
  let isAutoScrolling = false;
  let currentCarouselIndex = 0;
  let carouselItemCount = 0;
  const AUTO_SCROLL_SPEED = 3000;
  const AUTO_SCROLL_AMOUNT = 300;

  const animateCafeCount = () => {
    if (!cafeCountEl) {
      return;
    }
    const totalCafes = cafes.length;
    const duration = 3000;
    const startTime = performance.now();
    hasAnimatedCafeCount = true;
    cafeCountEl.textContent = "0";

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(totalCafes * easedProgress);
      cafeCountEl.textContent = String(currentCount);
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        cafeCountEl.textContent = String(totalCafes);
      }
    };

    requestAnimationFrame(updateCount);
  };

  const setupCafeCountAnimation = () => {
    if (!cafeCountEl) {
      return;
    }
    if (!("IntersectionObserver" in window)) {
      animateCafeCount();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedCafeCount) {
            animateCafeCount();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(cafeCountEl);
  };

  const searchInput = document.getElementById("cafe-search");
  const clearButton = document.getElementById("clear-search");
  const suggestionsList = document.getElementById("search-suggestions");
  const locationButton = document.getElementById("current-location");
  const sortSelect = document.getElementById("sort-select");
  const listElement = document.getElementById("cafe-list");
  const resultCount = document.getElementById("result-count");
  const listCount = document.getElementById("list-count");
  const favoritesToggle = document.getElementById("favorite-filter");
  const clearFilters = document.getElementById("reset-filters");
  const shareStatus = document.getElementById("share-status");
  const mapSection = document.getElementById("map-section");
  const expandBtn = document.getElementById("expand-map-btn");
  const collapseBtn = document.getElementById("collapse-map-btn");
  const fullscreenSidebar = document.getElementById("fullscreen-sidebar");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebarCafeList = document.getElementById("sidebar-cafe-list");
  const sidebarSortSelect = document.getElementById("sidebar-sort");
  const bottomList = document.getElementById("fullscreen-bottom-list");
  const autoScrollToggle = document.getElementById("auto-scroll-toggle");
  const mobileAutoScrollToggle = document.getElementById("mobile-auto-scroll-toggle");
  const bottomCarousel = document.getElementById("bottom-cafe-carousel");
  const carouselTrack = document.getElementById("carousel-track");
  const carouselIndicators = document.getElementById("carousel-indicators");
  let isMapFullscreen = false;
  let isSidebarOpen = true;

  // 正規表現用エスケープ
  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // ボタンのアクティブ状態を切り替え
  const setActiveButton = (buttons, activeButton) => {
    buttons.forEach((button) => button.classList.toggle("active", button === activeButton));
  };

  // 検索候補を表示
  const showSuggestions = (query) => {
    if (!suggestionsList) {
      return;
    }
    const trimmed = query.toLowerCase().trim();
    if (!trimmed) {
      hideSuggestions();
      return;
    }

    const matches = cafes
      .filter(
        (cafe) =>
          cafe.name.toLowerCase().includes(trimmed) || cafe.area.toLowerCase().includes(trimmed)
      )
      .slice(0, 5);

    if (!matches.length) {
      suggestionsList.innerHTML = '<li class="no-results">該当するカフェが見つかりませんでした</li>';
      suggestionsList.classList.add("active");
      return;
    }

    suggestionsList.innerHTML = "";
    const highlightPattern = new RegExp(escapeRegExp(trimmed), "gi");
    matches.forEach((cafe) => {
      const item = document.createElement("li");
      item.className = "suggestion-item";
      const highlighted = cafe.name.replace(highlightPattern, (value) => `<strong>${value}</strong>`);
      item.innerHTML = `
        <span class="suggestion-icon">☕</span>
        <span class="suggestion-text">${highlighted}</span>
        <span class="suggestion-type">${cafe.area}</span>
      `;
      item.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        selectCafe(cafe);
      });
      suggestionsList.appendChild(item);
    });
    suggestionsList.classList.add("active");
  };

  const hideSuggestions = () => {
    if (!suggestionsList) {
      return;
    }
    suggestionsList.innerHTML = "";
    suggestionsList.classList.remove("active");
  };

  const updateFavoritesStorage = () => {
    localStorage.setItem(favoritesKey, JSON.stringify([...favorites]));
  };

  const syncSidebarSort = () => {
    if (sidebarSortSelect) {
      sidebarSortSelect.value = state.sort;
    }
  };

  const stopAutoScroll = () => {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  };

  const resetAutoScrollState = () => {
    stopAutoScroll();
    isAutoScrolling = false;
    if (autoScrollToggle) {
      autoScrollToggle.classList.remove("active");
      const playIcon = autoScrollToggle.querySelector(".play-icon");
      const pauseIcon = autoScrollToggle.querySelector(".pause-icon");
      if (playIcon && pauseIcon) {
        playIcon.style.display = "inline";
        pauseIcon.style.display = "none";
      }
    }
    if (mobileAutoScrollToggle) {
      mobileAutoScrollToggle.classList.remove("active");
      const playIcon = mobileAutoScrollToggle.querySelector(".play-icon");
      const pauseIcon = mobileAutoScrollToggle.querySelector(".pause-icon");
      if (playIcon && pauseIcon) {
        playIcon.style.display = "inline";
        pauseIcon.style.display = "none";
      }
    }
  };

  const startAutoScrollPC = (list) => {
    if (!list) {
      return;
    }
    autoScrollInterval = setInterval(() => {
      const maxScroll = list.scrollHeight - list.clientHeight;
      const currentScroll = list.scrollTop;
      if (currentScroll >= maxScroll) {
        list.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        list.scrollBy({ top: AUTO_SCROLL_AMOUNT, behavior: "smooth" });
      }
    }, AUTO_SCROLL_SPEED);
  };

  const startAutoScrollMobile = () => {
    if (!carouselTrack || !bottomCarousel || !carouselItemCount) {
      return;
    }
    autoScrollInterval = setInterval(() => {
      currentCarouselIndex = (currentCarouselIndex + 1) % carouselItemCount;
      scrollToCarouselIndex(currentCarouselIndex);
    }, AUTO_SCROLL_SPEED);
  };

  const toggleAutoScroll = (platform) => {
    if (platform === "pc") {
      if (!autoScrollToggle || !sidebarCafeList) {
        return;
      }
      isAutoScrolling = !isAutoScrolling;
      if (isAutoScrolling) {
        autoScrollToggle.classList.add("active");
        const playIcon = autoScrollToggle.querySelector(".play-icon");
        const pauseIcon = autoScrollToggle.querySelector(".pause-icon");
        if (playIcon && pauseIcon) {
          playIcon.style.display = "none";
          pauseIcon.style.display = "inline";
        }
        startAutoScrollPC(sidebarCafeList);
      } else {
        autoScrollToggle.classList.remove("active");
        const playIcon = autoScrollToggle.querySelector(".play-icon");
        const pauseIcon = autoScrollToggle.querySelector(".pause-icon");
        if (playIcon && pauseIcon) {
          playIcon.style.display = "inline";
          pauseIcon.style.display = "none";
        }
        stopAutoScroll();
      }
      return;
    }

    if (!mobileAutoScrollToggle) {
      return;
    }
    if (!carouselItemCount) {
      return;
    }
    isAutoScrolling = !isAutoScrolling;
    if (isAutoScrolling) {
      mobileAutoScrollToggle.classList.add("active");
      const playIcon = mobileAutoScrollToggle.querySelector(".play-icon");
      const pauseIcon = mobileAutoScrollToggle.querySelector(".pause-icon");
      if (playIcon && pauseIcon) {
        playIcon.style.display = "none";
        pauseIcon.style.display = "inline";
      }
      startAutoScrollMobile();
    } else {
      mobileAutoScrollToggle.classList.remove("active");
      const playIcon = mobileAutoScrollToggle.querySelector(".play-icon");
      const pauseIcon = mobileAutoScrollToggle.querySelector(".pause-icon");
      if (playIcon && pauseIcon) {
        playIcon.style.display = "inline";
        pauseIcon.style.display = "none";
      }
      stopAutoScroll();
    }
  };

  const updateCarouselIndicators = (activeIndex) => {
    if (!carouselIndicators || !carouselItemCount) {
      return;
    }
    const normalizedIndex =
      ((activeIndex % carouselItemCount) + carouselItemCount) % carouselItemCount;
    carouselIndicators.querySelectorAll(".carousel-indicator").forEach((indicator, index) => {
      indicator.classList.toggle("active", index === normalizedIndex);
    });
  };

  const scrollToCarouselIndex = (index) => {
    if (!bottomCarousel || !carouselTrack) {
      return;
    }
    const card = carouselTrack.querySelector(".cafe-card");
    if (!card) {
      return;
    }
    const trackStyle = getComputedStyle(carouselTrack);
    const gapValue =
      parseFloat(trackStyle.gap || trackStyle.columnGap || trackStyle.rowGap || "12") || 12;
    const cardWidth = card.getBoundingClientRect().width;
    const normalizedIndex =
      carouselItemCount && carouselItemCount > 0
        ? ((index % carouselItemCount) + carouselItemCount) % carouselItemCount
        : index;
    const scrollPosition = (cardWidth + gapValue) * normalizedIndex;
    bottomCarousel.scrollTo({ left: scrollPosition, behavior: "smooth" });
    updateCarouselIndicators(normalizedIndex);
  };

  const createCarouselIndicators = (count) => {
    if (!carouselIndicators) {
      return;
    }
    carouselIndicators.innerHTML = "";
    carouselItemCount = count;
    for (let i = 0; i < count; i += 1) {
      const dot = document.createElement("div");
      dot.className = "carousel-indicator";
      if (i === 0) {
        dot.classList.add("active");
      }
      carouselIndicators.appendChild(dot);
    }
  };

  const createPhotoEmphasizedCard = (cafe) => {
    const card = document.createElement("article");
    card.className = "cafe-card";
    card.dataset.cafeId = String(cafe.id);
    card.innerHTML = `
      <img src="${cafe.image}" alt="${cafe.name}" class="cafe-card-image" />
      <div class="cafe-card-content">
        <h3 class="cafe-name">${cafe.name}</h3>
        <div class="cafe-rating">
          <span class="stars">${getRatingStars(cafe.rating)}</span>
          <span class="rating-number">${cafe.rating.toFixed(1)}/5</span>
        </div>
        <p class="cafe-area">📍 ${cafe.area}</p>
        <p class="cafe-comment">${cafe.comment}</p>
      </div>
    `;
    return card;
  };

  const createCarouselCard = (cafe) => {
    const card = document.createElement("article");
    card.className = "cafe-card";
    card.dataset.cafeId = String(cafe.id);
    card.innerHTML = `
      <img src="${cafe.image}" alt="${cafe.name}" class="cafe-card-image" />
      <div class="cafe-card-content">
        <h3 class="cafe-name">${cafe.name}</h3>
        <div class="cafe-rating">
          <span class="stars">${getRatingStars(cafe.rating)}</span>
          <span class="rating-number">${cafe.rating.toFixed(1)}</span>
        </div>
        <p class="cafe-area">📍 ${cafe.area}</p>
      </div>
    `;
    return card;
  };

  const renderSidebarList = (list) => {
    if (!sidebarCafeList) {
      return;
    }
    sidebarCafeList.classList.add("photo-emphasized");
    sidebarCafeList.innerHTML = "";
    list.forEach((cafe) => {
      sidebarCafeList.appendChild(createPhotoEmphasizedCard(cafe));
    });
  };

  const renderCarousel = (list) => {
    if (!carouselTrack) {
      return;
    }
    carouselTrack.innerHTML = "";
    list.forEach((cafe) => {
      carouselTrack.appendChild(createCarouselCard(cafe));
    });
    currentCarouselIndex = 0;
    createCarouselIndicators(list.length);
    if (bottomCarousel) {
      bottomCarousel.scrollTo({ left: 0 });
    }
  };

  const updateFullscreenLists = (list) => {
    if (!isMapFullscreen) {
      return;
    }
    if (window.innerWidth > 768) {
      renderSidebarList(list);
      syncSidebarSort();
    } else {
      renderCarousel(list);
    }
  };

  const updateFavoritesUI = () => {
    document.querySelectorAll('[data-action="favorite"]').forEach((button) => {
      const id = Number(button.dataset.cafeId);
      const isActive = favorites.has(id);
      button.classList.toggle("is-active", isActive);
      const icon = button.querySelector("i");
      if (icon) {
        icon.className = isActive ? "fa-solid fa-heart" : "fa-regular fa-heart";
      }
    });
  };

  const toggleFavorite = (id) => {
    if (favorites.has(id)) {
      favorites.delete(id);
    } else {
      favorites.add(id);
    }
    updateFavoritesStorage();
    updateFavoritesUI();
  };

  const parseVisitDate = (value) => {
    const match = value.match(/(\d{4})年(\d{1,2})月/);
    if (!match) {
      return 0;
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    return new Date(year, month - 1, 1).getTime();
  };

  const getDistance = (coords) => {
    const [lat1, lon1] = stationCenter.map((v) => (v * Math.PI) / 180);
    const [lat2, lon2] = coords.map((v) => (v * Math.PI) / 180);
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;
    const a =
      Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const radius = 6371;
    return radius * c;
  };

  const getFilteredCafes = () => {
    const keyword = state.search.trim().toLowerCase();
    let filtered = cafes.filter((cafe) => {
      if (state.favoritesOnly && !favorites.has(cafe.id)) {
        return false;
      }
      if (state.area !== "all" && cafe.area !== state.area) {
        return false;
      }
      if (state.price !== "all" && cafe.price !== Number(state.price)) {
        return false;
      }
      if (state.features.size) {
        const matchesFeature = [...state.features].some((feature) => cafe.features.includes(feature));
        if (!matchesFeature) {
          return false;
        }
      }
      if (keyword) {
        const content = [
          cafe.name,
          cafe.area,
          cafe.address,
          cafe.comment,
          cafe.features.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return content.includes(keyword);
      }
      return true;
    });

    switch (state.sort) {
      case "newest":
        filtered = filtered.sort((a, b) => parseVisitDate(b.visitDate) - parseVisitDate(a.visitDate));
        break;
      case "rating":
        filtered = filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "distance":
        filtered = filtered.sort((a, b) => getDistance(a.coordinates) - getDistance(b.coordinates));
        break;
      default:
        filtered = filtered.sort((a, b) => {
          if (b.rating === a.rating) {
            return parseVisitDate(b.visitDate) - parseVisitDate(a.visitDate);
          }
          return b.rating - a.rating;
        });
        break;
    }

    return filtered;
  };

  const isDefaultFilters = () =>
    state.search === "" &&
    state.area === "all" &&
    state.price === "all" &&
    state.features.size === 0 &&
    state.sort === "recommended" &&
    !state.favoritesOnly;

  const updateCafeCount = (filteredCount) => {
    if (!cafeCountEl || !cafeCountLabel) {
      return;
    }
    cafeCountEl.textContent = String(filteredCount);
    cafeCountLabel.textContent =
      filteredCount === cafes.length ? "軒のカフェを掲載" : "軒のカフェが見つかりました";
    if (!isDefaultFilters()) {
      hasAnimatedCafeCount = true;
    }
  };

  const renderMarkers = (list) => {
    markerLayer.clearLayers();
    list.forEach((cafe) => {
      const marker = markerById.get(cafe.id);
      if (marker) {
        markerLayer.addLayer(marker);
      }
    });
  };

  const renderList = (list) => {
    if (!list.length) {
      listElement.innerHTML =
        '<div class="rounded-2xl bg-background px-4 py-6 text-center text-sm text-muted">条件に合うカフェが見つかりませんでした。</div>';
      return;
    }
    listElement.innerHTML = list
      .map((cafe) => {
        return `
        <article class="cafe-card hover-lift rounded-2xl border border-primary/10 bg-white p-4" data-cafe-id="${cafe.id}">
          <div class="flex gap-3">
            <img src="${cafe.image}" alt="${cafe.name}" class="h-20 w-24 rounded-xl object-cover" />
            <div class="flex-1">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h3 class="text-sm font-semibold text-primary">${cafe.name}</h3>
                  <div class="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                    <span class="rounded-full px-2 py-0.5 text-primary" style="background:#E3C5A4">${
          cafe.area
        }</span>
                    <span class="text-secondary">${getRatingStars(cafe.rating)}</span>
                    <span>${cafe.rating.toFixed(1)}/5</span>
                  </div>
                </div>
                <button type="button" class="favorite-icon-btn text-secondary" data-action="favorite" data-cafe-id="${
          cafe.id
        }" aria-label="お気に入り">
                  <i class="fa-regular fa-heart"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="cafe-card-details">
            <p class="mt-2 line-clamp-2 text-xs text-muted">${cafe.comment}</p>
            <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span class="text-muted">${formatPrice(cafe.price)} / ${cafe.visitDate}</span>
              <div class="flex gap-2">
                <button type="button" class="rounded-full bg-secondary px-3 py-1 font-semibold text-primary" data-action="focus" data-cafe-id="${
          cafe.id
        }">マップで見る</button>
                <button type="button" class="rounded-full border border-primary/20 px-3 py-1 font-semibold text-primary" data-action="share" data-cafe-id="${
          cafe.id
        }">共有</button>
              </div>
            </div>
          </div>
        </article>
      `;
      })
      .join("");
  };

  const updateCounts = (count) => {
    if (resultCount) {
      resultCount.textContent = `${count}件のカフェが見つかりました。`;
    }
    if (listCount) {
      listCount.textContent = `${count}件`;
    }
  };

  const render = () => {
    const filtered = getFilteredCafes();
    currentFiltered = filtered;
    renderMarkers(filtered);
    renderList(filtered);
    updateCounts(filtered.length);
    if (hasAnimatedCafeCount || !isDefaultFilters()) {
      updateCafeCount(filtered.length);
    }
    updateFavoritesUI();
    updateFullscreenLists(filtered);
  };

  const expandCafeDetails = (id) => {
    if (!listPanel) {
      return;
    }
    const card = listPanel.querySelector(`[data-cafe-id="${id}"]`);
    if (!card) {
      return;
    }
    listPanel.querySelectorAll(".cafe-card.expanded").forEach((item) => {
      if (item !== card) {
        item.classList.remove("expanded");
      }
    });
    card.classList.toggle("expanded");
  };

  const areaButtons = document.querySelectorAll('.filter-btn[data-type="area"]');
  const priceButtons = document.querySelectorAll('.price-btn[data-type="price"]');
  const featureButtons = document.querySelectorAll(".feature-btn");

  areaButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.value || "all";
      state.area = value === "その他" ? "その他のエリア" : value;
      setActiveButton(areaButtons, button);
      render();
    });
  });

  priceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.price = button.dataset.value || "all";
      setActiveButton(priceButtons, button);
      render();
    });
  });

  featureButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const feature = button.dataset.feature;
      if (!feature) {
        return;
      }
      if (state.features.has(feature)) {
        state.features.delete(feature);
        button.classList.remove("active");
      } else {
        state.features.add(feature);
        button.classList.add("active");
      }
      render();
    });
  });

  const selectCafe = (cafe) => {
    if (searchInput) {
      searchInput.value = cafe.name;
    }
    if (clearButton) {
      clearButton.style.display = "flex";
    }
    state.search = cafe.name;
    hideSuggestions();
    render();
    if (window.innerWidth <= 768 && currentView === "list") {
      expandCafeDetails(cafe.id);
      return;
    }
    focusCafe(cafe.id);
  };

  const performSearch = (query) => {
    state.search = query;
    if (query) {
      showSuggestions(query);
    } else {
      hideSuggestions();
    }
    render();
  };

  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      const value = event.target.value.trim();
      if (clearButton) {
        clearButton.style.display = value.length > 0 ? "flex" : "none";
      }
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(value);
      }, 300);
    });

    searchInput.addEventListener("focus", () => {
      const value = searchInput.value.trim();
      if (value) {
        showSuggestions(value);
      }
    });
  }

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
      }
      clearButton.style.display = "none";
      hideSuggestions();
      performSearch("");
    });
  }

  if (searchInput && clearButton && searchInput.value.trim()) {
    clearButton.style.display = "flex";
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (event) => {
      state.sort = event.target.value;
      render();
    });
  }

  if (favoritesToggle) {
    favoritesToggle.addEventListener("click", () => {
      state.favoritesOnly = !state.favoritesOnly;
      favoritesToggle.classList.toggle("active", state.favoritesOnly);
      favoritesToggle.setAttribute("aria-pressed", String(state.favoritesOnly));
      const icon = favoritesToggle.querySelector(".heart-icon");
      if (icon) {
        icon.textContent = state.favoritesOnly ? "♥" : "♡";
      }
      render();
    });
  }

  if (clearFilters) {
    clearFilters.addEventListener("click", () => {
      state.search = "";
      state.area = "all";
      state.price = "all";
      state.features.clear();
      state.sort = "recommended";
      state.favoritesOnly = false;
      if (searchInput) {
        searchInput.value = "";
      }
      hideSuggestions();
      if (clearButton) {
        clearButton.style.display = "none";
      }
      if (sortSelect) {
        sortSelect.value = "recommended";
      }
      areaButtons.forEach((button) => button.classList.remove("active"));
      priceButtons.forEach((button) => button.classList.remove("active"));
      featureButtons.forEach((button) => button.classList.remove("active"));

      const defaultArea = document.querySelector('.filter-btn[data-type="area"][data-value="all"]');
      if (defaultArea) {
        defaultArea.classList.add("active");
      }
      const defaultPrice = document.querySelector('.price-btn[data-type="price"][data-value="all"]');
      if (defaultPrice) {
        defaultPrice.classList.add("active");
      }
      if (favoritesToggle) {
        favoritesToggle.classList.remove("active");
        favoritesToggle.setAttribute("aria-pressed", "false");
        const icon = favoritesToggle.querySelector(".heart-icon");
        if (icon) {
          icon.textContent = "♡";
        }
      }
      hasAnimatedCafeCount = false;
      render();
      if (cafeCountLabel) {
        cafeCountLabel.textContent = "軒のカフェを掲載";
      }
      animateCafeCount();
    });
  }

  const focusCafe = (id) => {
    const cafe = cafes.find((item) => item.id === id);
    const marker = markerById.get(id);
    if (!cafe || !marker) {
      return;
    }
    map.closePopup();
    map.setView(cafe.coordinates, 16, { animate: true });
    marker.openPopup();
  };

  const enterFullscreenMode = () => {
    if (!mapSection || !expandBtn || !collapseBtn) {
      return;
    }
    isMapFullscreen = true;
    isSidebarOpen = true;
    resetAutoScrollState();
    document.body.classList.add("map-fullscreen-mode");
    mapSection.classList.add("fullscreen");
    expandBtn.style.display = "none";
    collapseBtn.style.display = "flex";
    setView("map");

    if (window.innerWidth > 768 && fullscreenSidebar) {
      fullscreenSidebar.style.display = "flex";
      fullscreenSidebar.classList.remove("collapsed");
      mapSection.classList.add("sidebar-open");
      renderSidebarList(currentFiltered);
      syncSidebarSort();
    } else if (bottomList) {
      bottomList.style.display = "block";
      mapSection.classList.add("mobile-list-visible");
      renderCarousel(currentFiltered);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  };

  const exitFullscreenMode = () => {
    if (!mapSection || !expandBtn || !collapseBtn) {
      return;
    }
    isMapFullscreen = false;
    resetAutoScrollState();
    document.body.classList.remove("map-fullscreen-mode");
    mapSection.classList.remove("fullscreen", "sidebar-open", "mobile-list-visible");
    expandBtn.style.display = "flex";
    collapseBtn.style.display = "none";
    if (fullscreenSidebar) {
      fullscreenSidebar.style.display = "none";
    }
    if (bottomList) {
      bottomList.style.display = "none";
    }
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  };

  const toggleSidebar = () => {
    if (!fullscreenSidebar || !mapSection) {
      return;
    }
    isSidebarOpen = !isSidebarOpen;
    fullscreenSidebar.classList.toggle("collapsed", !isSidebarOpen);
    mapSection.classList.toggle("sidebar-open", isSidebarOpen);
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  };

  if (expandBtn) {
    expandBtn.addEventListener("click", enterFullscreenMode);
  }

  if (collapseBtn) {
    collapseBtn.addEventListener("click", exitFullscreenMode);
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
  }

  if (autoScrollToggle) {
    autoScrollToggle.addEventListener("click", () => {
      toggleAutoScroll("pc");
    });
  }

  if (sidebarSortSelect && sortSelect) {
    sidebarSortSelect.addEventListener("change", (event) => {
      sortSelect.value = event.target.value;
      sortSelect.dispatchEvent(new Event("change"));
    });
  }

  if (sidebarCafeList) {
    sidebarCafeList.addEventListener("click", (event) => {
      const card = event.target.closest("[data-cafe-id]");
      if (!card) {
        return;
      }
      const id = Number(card.dataset.cafeId);
      focusCafe(id);
    });
  }

  if (mobileAutoScrollToggle) {
    mobileAutoScrollToggle.addEventListener("click", () => {
      toggleAutoScroll("mobile");
    });
  }

  if (bottomCarousel) {
    let scrollTimeout;
    bottomCarousel.addEventListener("scroll", (event) => {
      if (isAutoScrolling) {
        resetAutoScrollState();
      }
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!carouselTrack) {
          return;
        }
        const card = carouselTrack.querySelector(".cafe-card");
        if (!card) {
          return;
        }
        const trackStyle = getComputedStyle(carouselTrack);
        const gapValue =
          parseFloat(trackStyle.gap || trackStyle.columnGap || trackStyle.rowGap || "12") || 12;
        const cardWidth = card.getBoundingClientRect().width;
        const index = Math.round(bottomCarousel.scrollLeft / (cardWidth + gapValue));
        currentCarouselIndex = index;
        updateCarouselIndicators(index);
      }, 100);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isMapFullscreen) {
      exitFullscreenMode();
    }
  });

  window.addEventListener("resize", () => {
    if (!isMapFullscreen || !mapSection) {
      return;
    }
    resetAutoScrollState();
    const isDesktop = window.innerWidth > 768;
    if (isDesktop && fullscreenSidebar) {
      fullscreenSidebar.style.display = "flex";
      mapSection.classList.add("sidebar-open");
      mapSection.classList.remove("mobile-list-visible");
      fullscreenSidebar.classList.toggle("collapsed", !isSidebarOpen);
      if (bottomList) {
        bottomList.style.display = "none";
      }
      renderSidebarList(currentFiltered);
      syncSidebarSort();
    } else {
      if (fullscreenSidebar) {
        fullscreenSidebar.style.display = "none";
      }
      mapSection.classList.remove("sidebar-open");
      mapSection.classList.add("mobile-list-visible");
      if (bottomList) {
        bottomList.style.display = "block";
      }
      renderCarousel(currentFiltered);
    }
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  });

  let userLocationMarker = null;
  let userLocationCircle = null;
  const showCurrentLocation = () => {
    if (!navigator.geolocation) {
      window.alert("このブラウザでは現在地を取得できません。");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        const accuracy = position.coords.accuracy || 200;
        if (!userLocationMarker) {
          userLocationMarker = L.circleMarker(coords, {
            radius: 6,
            color: "#3B82F6",
            fillColor: "#3B82F6",
            fillOpacity: 0.9,
          }).addTo(map);
          userLocationCircle = L.circle(coords, {
            radius: accuracy,
            color: "#3B82F6",
            weight: 1,
            fillColor: "#3B82F6",
            fillOpacity: 0.15,
          }).addTo(map);
        } else {
          userLocationMarker.setLatLng(coords);
          userLocationCircle.setLatLng(coords);
          userLocationCircle.setRadius(accuracy);
        }
        map.setView(coords, 16, { animate: true, duration: 0.5 });
      },
      () => {
        window.alert("現在地を取得できませんでした。");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  if (locationButton) {
    locationButton.addEventListener("click", showCurrentLocation);
  }

  const handleShare = async (id) => {
    const cafe = cafes.find((item) => item.id === id);
    if (!cafe) {
      return;
    }
    const baseUrl = window.location.href.split("#")[0];
    const url = `${baseUrl}#cafe-${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: cafe.name, text: cafe.comment, url });
        return;
      } catch (error) {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      if (shareStatus) {
        shareStatus.textContent = "リンクをコピーしました。";
      }
    } catch (error) {
      window.prompt("このリンクをコピーしてください", url);
    }
  };

  const handleRoute = (id) => {
    const cafe = cafes.find((item) => item.id === id);
    if (!cafe) {
      return;
    }
    const destination = cafe.coordinates.join(",");
    if (!navigator.geolocation) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, "_blank");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = `${position.coords.latitude},${position.coords.longitude}`;
        window.open(
          `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`,
          "_blank"
        );
      },
      () => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, "_blank");
      }
    );
  };

  const listPanel = document.getElementById("cafe-list");
  if (listPanel) {
    listPanel.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-action]");
      const card = event.target.closest("[data-cafe-id]");
      if (!card) {
        return;
      }
      const id = Number(card.dataset.cafeId);
      if (actionButton) {
        event.stopPropagation();
        const action = actionButton.dataset.action;
        if (action === "favorite") {
          toggleFavorite(id);
        }
        if (action === "focus" || action === "details") {
          if (window.innerWidth <= 768 && currentView === "list") {
            expandCafeDetails(id);
            return;
          }
          focusCafe(id);
        }
        if (action === "share") {
          handleShare(id);
        }
        return;
      }
      if (window.innerWidth <= 768 && currentView === "list") {
        expandCafeDetails(id);
        return;
      }
      focusCafe(id);
    });
  }

  if (isMobile && map.tap && map.tap.enable) {
    map.tap.enable();
  }

  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      const id = Number(actionButton.dataset.cafeId);
      if (actionButton.dataset.action === "favorite") {
        toggleFavorite(id);
        return;
      }
      if (actionButton.dataset.action === "details") {
        focusCafe(id);
        return;
      }
      if (actionButton.dataset.action === "share") {
        handleShare(id);
        return;
      }
      if (actionButton.dataset.action === "route") {
        handleRoute(id);
        return;
      }
    }

    const imageButton = event.target.closest("[data-popup-image]");
    if (imageButton) {
      const lightbox = document.getElementById("cafe-lightbox");
      const lightboxImage = document.getElementById("cafe-lightbox-image");
      if (lightbox && lightboxImage) {
        lightboxImage.src = imageButton.dataset.image || "";
        lightboxImage.alt = imageButton.dataset.alt || "";
        lightbox.classList.remove("hidden");
        lightbox.setAttribute("aria-hidden", "false");
      }
    }

    if (suggestionsList && searchInput) {
      const clickedInSearch = event.target.closest(".map-search-overlay");
      if (!clickedInSearch) {
        hideSuggestions();
      }
    }
  });

  const lightbox = document.getElementById("cafe-lightbox");
  const lightboxClose = document.getElementById("cafe-lightbox-close");
  if (lightbox && lightboxClose) {
    const closeLightbox = () => {
      const lightboxImage = document.getElementById("cafe-lightbox-image");
      if (lightboxImage) {
        lightboxImage.src = "";
      }
      lightbox.classList.add("hidden");
      lightbox.setAttribute("aria-hidden", "true");
    };
    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }

  const mapPanel = document.getElementById("map-section");
  const mapTab = document.getElementById("map-tab");
  const listTab = document.getElementById("list-tab");
  const pageContainer = document.querySelector(".cafe-map-page");

  const updateTabStyles = () => {
    if (mapTab && listTab) {
      mapTab.classList.toggle("active", currentView === "map");
      mapTab.setAttribute("aria-pressed", String(currentView === "map"));
      listTab.classList.toggle("active", currentView === "list");
      listTab.setAttribute("aria-pressed", String(currentView === "list"));
    }
  };

  const setView = (view) => {
    if (!mapPanel || !listPanel) {
      return;
    }
    currentView = view;
    if (pageContainer) {
      pageContainer.classList.toggle("view-list", view === "list");
    }
    if (view === "map" || window.innerWidth > 768) {
      map.invalidateSize();
    }
    updateTabStyles();
  };

  if (mapTab && listTab) {
    mapTab.addEventListener("click", () => setView("map"));
    listTab.addEventListener("click", () => setView("list"));
  }

  window.addEventListener("resize", () => setView(currentView));

  setupCafeCountAnimation();
  setView("map");
  render();

  const hashMatch = window.location.hash.match(/cafe-(\d+)/);
  if (hashMatch) {
    const cafeId = Number(hashMatch[1]);
    setTimeout(() => focusCafe(cafeId), 500);
  }
});
