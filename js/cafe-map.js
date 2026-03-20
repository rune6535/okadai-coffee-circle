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
  const cafes = cafeData.getCafesWithDistances ? cafeData.getCafesWithDistances() : cafeData.cafes;
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
  const okayamaUniversity = [34.6859, 133.9178];
  const referencePoints = cafeData.referencePoints || {
    station: { coordinates: [34.66655797257619, 133.91773349699008] },
    university: { coordinates: [34.68724223530956, 133.9222190258267] },
  };
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // 地図の初期化
  function initMap() {
    const mapInstance = L.map("map", {
      scrollWheelZoom: true,
      zoomControl: false,
      doubleClickZoom: true,
      touchZoom: true,
      dragging: true,
      minZoom: 10,
      maxZoom: 18,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 80,
      zoomAnimation: true,
      fadeAnimation: true,
    }).setView(stationCenter, 13.5);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(mapInstance);

    return mapInstance;
  }

  const map = initMap();
  console.log("モバイルデバイス:", isMobile);

  // マーカー管理用レイヤー
  const markerLayer = L.layerGroup().addTo(map);

  const markerById = new Map();

  // 地名ラベルの追加
  const LOCATIONS = {
    station: {
      name: "岡山駅",
      coordinates: [34.66655797257619, 133.91773349699008],
    },
    university: {
      name: "岡山大学",
      coordinates: [34.68724223530956, 133.9222190258267],
    },
    stadium: {
      name: "JFE晴れの国スタジアム",
      coordinates: [34.68082470904376, 133.91873154534647],
    },
    castle: {
      name: "岡山城",
      coordinates: [34.66557719985855, 133.93614223521337],
    },
    shikataCampus: {
      name: "鹿田キャンパス",
      coordinates: [34.65151604773539, 133.91976351141483],
    },
  };

  // 地名ラベル用のカスタムアイコン
  const createLocationLabel = (name) =>
    L.divIcon({
      html: `<div class="location-label">${name}</div>`,
      iconSize: [150, 30],
      iconAnchor: [75, 15],
      className: "location-label-marker",
    });

  // カスタムマーカーアイコン（カフェ名付き）
  const createCafeMarker = (cafe) =>
    L.divIcon({
      html: `
        <div class="marker-container">
          <div class="marker-label">${cafe.name}</div>
          <i class="fas fa-map-marker-alt"></i>
        </div>
      `,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -42],
      className: "custom-cafe-marker",
    });

  const formatPrice = (price) => "￥".repeat(price);
  const getPrimaryImage = (cafe) => cafe.images?.[0] || cafe.image || "images/coming-soon.svg";

  const getCafeFeatures = (cafe) => {
    const cafeFeatures = [...(cafe.features || [])];
    if (cafe.hasFood) {
      cafeFeatures.push("ご飯あり");
    }
    if (cafe.nightOpen) {
      cafeFeatures.push("夜営業あり");
    }
    if (cafe.reservable) {
      cafeFeatures.push("予約可能");
    }
    return cafeFeatures;
  };

  // ===== スマホ版UI: ドラッグ/スワイプ対応 =====
  let currentDetailCafe = null;
  let currentUISize = 0;
  let isDraggingUI = false;
  let isSwipingImage = false;
  let dragStartY = 0;
  let dragStartX = 0;
  let currentDragY = 0;
  let currentDragX = 0;
  let dragStartScrollTop = 0;
  let dragStartHeight = 0;
  const UI_SWIPE_STEP_THRESHOLD = 18;
  const UI_SWIPE_STEP_MAX = 140;

  const UI_SIZES = {
    0: 0,
    1: window.innerHeight * 0.125,
    2: window.innerHeight * 0.4,
    3: window.innerHeight * 0.8,
  };

  const mobileDetailPanel = document.getElementById("mobile-cafe-detail");
  const mobileDetailContent = document.getElementById("mobile-detail-content");
  const detailCloseBtnMobile = document.getElementById("detail-close-btn-mobile");
  const mapDetailOverlay = document.getElementById("map-detail-overlay");

  const createDetailHTML = (cafe, platform) => {
    const isMobileDetail = platform === "mobile";
    const images = cafe.images?.length ? cafe.images : [getPrimaryImage(cafe)];
    const instagramHandle = cafe.instagram
      ? cafe.instagram.replace(/\/+$/, "").split("/").pop().split("?")[0]
      : "";
    const googleMaps =
      cafe.googleMaps ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafe.address || "")}`;
    const phoneLink =
      cafe.phone && cafe.phone !== "未登録" ? `<a href="tel:${cafe.phone}">${cafe.phone}</a>` : "未登録";
    const infoValue = (value) => (value && value !== "未登録" ? value : "未登録");
    const accessValue = infoValue(cafe.access);
    const accessHTML = isMobileDetail && accessValue !== "未登録" ? accessValue.split("\n").join("<br>") : accessValue;
    const mobilePhoneRow =
      cafe.phone && cafe.phone !== "未登録"
        ? `
        <div class="detail-info-row">
          <span class="detail-info-label">電話番号☎️：</span>
          <span class="detail-info-value"><a href="tel:${cafe.phone}">${cafe.phone}</a></span>
        </div>
      `
        : "";

    const hasMenuHighlight =
      isMobileDetail && cafe.menuHighlight && images.length > cafe.menuHighlight.imageIndex;
    const imagesHTML = isMobileDetail
      ? `
        <div class="detail-images">
          <div class="detail-images-slider" id="image-slider-${cafe.id}">
            ${images
              .map(
                (img, index) => `
              <div class="detail-image-item" data-index="${index}">
                <img src="${img}" alt="${cafe.name}">
                ${
                  hasMenuHighlight && index === cafe.menuHighlight.imageIndex
                    ? `
                <div class="menu-popup" id="menu-popup-${cafe.id}" style="opacity: 0;">
                  <div class="menu-popup-content">
                    <div class="menu-item-name">${cafe.menuHighlight.itemName}</div>
                    <div class="menu-price">${cafe.menuHighlight.price}</div>
                    <a href="${cafe.menuHighlight.menuUrl}" target="_blank" rel="noreferrer" class="menu-button">
                      ほかの商品メニューも確認する
                    </a>
                  </div>
                  <div class="menu-popup-arrow"></div>
                </div>
                `
                    : ""
                }
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `
      : `
        <div class="detail-images">
          <div class="detail-main-image" data-action="open-gallery">
            <img src="${images[0]}" alt="${cafe.name}">
          </div>
          ${
            images.length > 1
              ? `
            <button class="view-all-photos-btn" type="button" data-action="open-gallery">
              📷 写真をすべて見る (${images.length}枚)
            </button>
          `
              : ""
          }
        </div>
      `;

    const instagramActionHTML = cafe.instagram
      ? `
        <a href="${cafe.instagram}" target="_blank" rel="noreferrer" class="detail-action-btn instagram">
          📷 Instagram
        </a>
      `
      : "";

    return `
      ${imagesHTML}
      <h2 class="detail-cafe-name">${cafe.name}</h2>
      <p class="detail-cafe-area">📍 ${cafe.area}</p>
      <p class="detail-cafe-comment">${cafe.comment || ""}</p>
      <div class="detail-info-section">
        <h3 class="detail-info-title">《店舗情報》</h3>
        <div class="detail-info-row">
          <span class="detail-info-label">場　　所📍：</span>
          <span class="detail-info-value">${infoValue(cafe.address)}</span>
        </div>
        <div class="detail-info-row">
          <span class="detail-info-label">営業時間🕐：</span>
          <span class="detail-info-value">${infoValue(cafe.openingHours)}</span>
        </div>
        <div class="detail-info-row">
          <span class="detail-info-label">定 休 日🗓️：</span>
          <span class="detail-info-value">${infoValue(cafe.closedDays)}</span>
        </div>
        <div class="detail-info-row">
          <span class="detail-info-label">アクセス🚶：</span>
          <span class="detail-info-value">${accessHTML}</span>
        </div>
        ${isMobileDetail ? mobilePhoneRow : `
        <div class="detail-info-row">
          <span class="detail-info-label">電話番号☎️：</span>
          <span class="detail-info-value">${phoneLink}</span>
        </div>
        `}
        <div class="detail-info-row">
          <span class="detail-info-label">駐 車 場🅿️：</span>
          <span class="detail-info-value">${infoValue(cafe.parking)}</span>
        </div>
        <div class="detail-info-row">
          <span class="detail-info-label">インスタ🔎：</span>
          <span class="detail-info-value">${
            cafe.instagram
              ? `<a href="${cafe.instagram}" target="_blank" rel="noreferrer">@${instagramHandle}</a>`
              : "未登録"
          }</span>
        </div>
      </div>
      <div class="detail-actions">
        <a href="${googleMaps}" target="_blank" rel="noreferrer" class="detail-action-btn maps">
          🗺️ Googleマップ
        </a>
        ${instagramActionHTML}
      </div>
    `;
  };

  // マーカーを強調表示
  const highlightMarker = (cafeId) => {
    const marker = markerById.get(cafeId);
    if (!marker) {
      return;
    }
    const markerElement = marker.getElement();
    if (markerElement) {
      markerElement.classList.add("highlight");
      setTimeout(() => {
        markerElement.classList.remove("highlight");
      }, 600);
    }
  };

  const closeMobileCafeDetail = () => {
    if (!mobileDetailPanel) {
      return;
    }
    mobileDetailPanel.classList.remove("active");
    mobileDetailPanel.setAttribute("data-size", "0");
    mobileDetailPanel.style.height = "0";
    if (mapDetailOverlay) {
      mapDetailOverlay.classList.remove("active");
    }
    document.body.classList.remove("ui-size-1", "ui-size-2", "ui-size-3", "cafe-detail-open");
    const mapSection = document.getElementById("map-section");
    if (mapSection) {
      mapSection.style.overflow = "hidden";
    }
    currentUISize = 0;
    currentDetailCafe = null;
  };

  const closeDesktopCafeDetail = () => {
    const panel = document.getElementById("desktop-cafe-detail");
    if (panel) {
      panel.classList.remove("active");
    }
  };

  const desktopDetailPanel = document.getElementById("desktop-cafe-detail");
  const desktopDetailContent = document.getElementById("desktop-detail-content");


  const setupMobileUIInteraction = () => {
    if (!mobileDetailPanel) {
      return;
    }
    mobileDetailPanel.removeEventListener("touchstart", handlePanelTouchStart);
    mobileDetailPanel.addEventListener("touchstart", handlePanelTouchStart, { passive: false });
  };

  const handlePanelTouchStart = (event) => {
    if (
      event.target.closest(".detail-close-btn-mobile") ||
      event.target.closest("a") ||
      event.target.closest("button:not(.detail-close-btn-mobile)")
    ) {
      return;
    }

    const touch = event.touches[0];
    dragStartY = touch.clientY;
    dragStartX = touch.clientX;
    currentDragY = dragStartY;
    currentDragX = dragStartX;
    dragStartScrollTop = mobileDetailContent ? mobileDetailContent.scrollTop : 0;
    dragStartHeight = parseInt(mobileDetailPanel.style.height, 10) || UI_SIZES[currentUISize];

    const isInImageSlider = event.target.closest(".detail-images-slider");

    if (isInImageSlider) {
      isSwipingImage = null;
      isDraggingUI = null;
    } else {
      isDraggingUI = true;
    }

    document.addEventListener("touchmove", handlePanelTouchMove, { passive: false });
    document.addEventListener("touchend", handlePanelTouchEnd, { passive: true });
  };

  const handlePanelTouchMove = (event) => {
    if (!mobileDetailPanel || !mobileDetailContent) {
      return;
    }
    const touch = event.touches[0];
    currentDragY = touch.clientY;
    currentDragX = touch.clientX;

    const diffY = currentDragY - dragStartY;
    const diffX = currentDragX - dragStartX;

    if (isSwipingImage === null && isDraggingUI === null) {
      const absX = Math.abs(diffX);
      const absY = Math.abs(diffY);

      if (absX > 10 || absY > 10) {
        if (absX > absY * 1.5) {
          isSwipingImage = true;
          isDraggingUI = false;
        } else {
          isSwipingImage = false;
          isDraggingUI = true;
        }
      }
    }

    if (isSwipingImage) {
      return;
    }

    if (isDraggingUI) {
      handleUIScroll(diffY, event);
    }
  };

  const handleUIScroll = (diffY, event) => {
    if (!mobileDetailContent || !mobileDetailPanel) {
      return;
    }
    const currentScrollTop = mobileDetailContent.scrollTop;
    const isAtTop = currentScrollTop <= 0;
    const isAtBottom =
      currentScrollTop + mobileDetailContent.clientHeight >= mobileDetailContent.scrollHeight - 1;

    if (currentUISize === 3) {
      if (diffY < 0) {
        if (isAtBottom) {
          event.preventDefault();
        } else {
          return;
        }
      } else if (diffY > 0) {
        if (isAtTop) {
          event.preventDefault();
          let newHeight = dragStartHeight - diffY;
          newHeight = Math.max(UI_SIZES[1], Math.min(UI_SIZES[3], newHeight));
          mobileDetailPanel.style.transition = "none";
          mobileDetailPanel.style.height = `${newHeight}px`;
        } else {
          return;
        }
      }
    } else if (currentUISize === 1 || currentUISize === 2) {
      if (diffY < 0) {
        event.preventDefault();
        let newHeight = dragStartHeight - diffY;
        newHeight = Math.max(UI_SIZES[1], Math.min(UI_SIZES[3], newHeight));
        mobileDetailPanel.style.transition = "none";
        mobileDetailPanel.style.height = `${newHeight}px`;
      } else if (diffY > 0) {
        event.preventDefault();
        let newHeight = dragStartHeight - diffY;
        newHeight = Math.max(UI_SIZES[1], Math.min(UI_SIZES[3], newHeight));
        mobileDetailPanel.style.transition = "none";
        mobileDetailPanel.style.height = `${newHeight}px`;
      }
    }
  };

  const handlePanelTouchEnd = () => {
    document.removeEventListener("touchmove", handlePanelTouchMove);
    document.removeEventListener("touchend", handlePanelTouchEnd);

    if (isDraggingUI) {
      const gestureDeltaY = currentDragY - dragStartY;
      snapToNearestSize(gestureDeltaY);
    }

    isDraggingUI = false;
    isSwipingImage = false;
    dragStartY = 0;
    dragStartX = 0;
    currentDragY = 0;
    currentDragX = 0;
    dragStartScrollTop = 0;
    dragStartHeight = 0;
  };

  const snapToNearestSize = (gestureDeltaY = 0) => {
    if (!mobileDetailPanel) {
      return;
    }
    const currentHeight = parseInt(mobileDetailPanel.style.height, 10) || UI_SIZES[currentUISize];
    let nearestSize = 1;
    let minDiff = Math.abs(currentHeight - UI_SIZES[1]);

    for (let size = 2; size <= 3; size += 1) {
      const diff = Math.abs(currentHeight - UI_SIZES[size]);
      if (diff < minDiff) {
        minDiff = diff;
        nearestSize = size;
      }
    }

    const absDeltaY = Math.abs(gestureDeltaY);
    if (absDeltaY >= UI_SWIPE_STEP_THRESHOLD && absDeltaY <= UI_SWIPE_STEP_MAX) {
      if (gestureDeltaY < 0) {
        nearestSize = Math.min(3, currentUISize + 1);
      } else if (gestureDeltaY > 0) {
        nearestSize = Math.max(1, currentUISize - 1);
      }
    }

    setUISize(nearestSize, true);
  };

  const setUISize = (size, animate = true, options = {}) => {
    if (!mobileDetailPanel || !mobileDetailContent) {
      return;
    }
    if (size < 0 || size > 3) {
      return;
    }
    currentUISize = size;

    if (size === 0) {
      closeMobileCafeDetail();
    } else {
      updateUIState(size, animate, options);
    }
  };

  const updateUIState = (size, animate = true, options = {}) => {
    if (!mobileDetailPanel) {
      return;
    }
    const { resetScroll = false } = options;
    document.body.classList.remove("ui-size-1", "ui-size-2", "ui-size-3");
    document.body.classList.add(`ui-size-${size}`);
    if (size > 0) {
      document.body.classList.add("cafe-detail-open");
    }
    mobileDetailPanel.setAttribute("data-size", String(size));

    if (animate) {
      mobileDetailPanel.style.transition = "height 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
    } else {
      mobileDetailPanel.style.transition = "none";
    }

    mobileDetailPanel.style.height = `${UI_SIZES[size]}px`;

    if (mobileDetailContent && resetScroll) {
      mobileDetailContent.scrollTop = 0;
    }

    setTimeout(() => {
      if (mobileDetailPanel) {
        mobileDetailPanel.style.transition = "";
      }
    }, 400);

    if (mapDetailOverlay) {
      mapDetailOverlay.classList.toggle("active", size > 1);
    }

    const mapSection = document.getElementById("map-section");
    if (mapSection) {
      mapSection.style.overflow = "hidden";
    }
  };

  const imageZoomModal = document.getElementById("image-zoom-modal");
  const zoomCloseBtn = document.getElementById("zoom-close-btn");
  const zoomedImage = document.getElementById("zoomed-image");
  let zoomStartY = 0;

  const showImageZoom = (src) => {
    if (!imageZoomModal || !zoomedImage) {
      return;
    }
    zoomedImage.src = src;
    imageZoomModal.classList.add("active");
  };

  const closeImageZoom = () => {
    if (!imageZoomModal) {
      return;
    }
    imageZoomModal.classList.remove("active");
    if (currentUISize < 3) {
      setUISize(3);
    }
  };

  if (zoomCloseBtn) {
    zoomCloseBtn.addEventListener("click", closeImageZoom);
  }

  if (imageZoomModal) {
    imageZoomModal.addEventListener("touchstart", (event) => {
      zoomStartY = event.touches[0].clientY;
    }, { passive: true });

    imageZoomModal.addEventListener("touchmove", (event) => {
      const currentY = event.touches[0].clientY;
      const diff = currentY - zoomStartY;
      if (diff > 100) {
        closeImageZoom();
      }
    }, { passive: true });
  }

  const setupImageSlider = () => {
    if (!mobileDetailContent) {
      return;
    }
    const slider = mobileDetailContent.querySelector(".detail-images-slider");
    if (!slider) {
      return;
    }
    slider.style.scrollSnapType = "x mandatory";
    slider.style.overflowX = "auto";
    slider.style.scrollBehavior = "smooth";

    const images = slider.querySelectorAll(".detail-image-item");
    images.forEach((img) => {
      img.style.scrollSnapAlign = "center";
    });
  };

  if (mobileDetailContent) {
    mobileDetailContent.addEventListener("click", (event) => {
      if (event.target.closest("button") || event.target.closest("a")) {
        return;
      }
      const imageItem = event.target.closest(".detail-image-item");
      if (!imageItem) {
        return;
      }
      const img = imageItem.querySelector("img");
      if (img) {
        showImageZoom(img.src);
      }
    });
  }

  const showMobileCafeDetail = (cafe, size = 2) => {
    if (!mobileDetailPanel || !mobileDetailContent) {
      return;
    }
    mobileDetailContent.innerHTML = createDetailHTML(cafe, "mobile");
    UI_SIZES[1] = window.innerHeight * 0.125;
    UI_SIZES[2] = window.innerHeight * 0.4;
    UI_SIZES[3] = window.innerHeight * 0.8;
    currentUISize = size;
    mobileDetailPanel.classList.add("active");
    if (mapDetailOverlay) {
      mapDetailOverlay.classList.add("active");
    }
    document.body.classList.add("cafe-detail-open");
    updateUIState(size, true, { resetScroll: true });
    setupMobileUIInteraction();
    setupImageSlider();
    setupImageSliderPopup(cafe);

    if (isMapFullscreen && !isCarouselMinimized) {
      setTimeout(() => {
        minimizeCarousel();
      }, 300);
    }
  };

  if (detailCloseBtnMobile) {
    detailCloseBtnMobile.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeMobileCafeDetail();
    });
  }

  if (mapDetailOverlay) {
    mapDetailOverlay.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    mapDetailOverlay.style.pointerEvents = "none";
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth <= 768 && currentUISize > 0) {
      UI_SIZES[1] = window.innerHeight * 0.125;
      UI_SIZES[2] = window.innerHeight * 0.4;
      UI_SIZES[3] = window.innerHeight * 0.8;
      updateUIState(currentUISize, false);
    } else if (window.innerWidth > 768 && currentUISize > 0) {
      closeMobileCafeDetail();
    }
  });

  const setupImageSliderPopup = (cafe) => {
    if (!cafe.menuHighlight) {
      return;
    }
    const slider = document.getElementById(`image-slider-${cafe.id}`);
    const popup = document.getElementById(`menu-popup-${cafe.id}`);
    if (!slider || !popup) {
      return;
    }
    let scrollTimeout;
    let currentImageIndex = -1;
    let popupShownOnce = false;
    slider.addEventListener("scroll", () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const item = slider.querySelector(".detail-image-item");
        if (!item) {
          return;
        }
        const trackStyle = getComputedStyle(slider);
        const gapValue =
          parseFloat(trackStyle.gap || trackStyle.columnGap || trackStyle.rowGap || "8") || 8;
        const itemWidth = item.getBoundingClientRect().width + gapValue;
        const newIndex = Math.round(slider.scrollLeft / itemWidth);

        if (newIndex !== currentImageIndex) {
          popup.style.opacity = "0";
          popupShownOnce = false;
        }

        currentImageIndex = newIndex;

        if (currentImageIndex === cafe.menuHighlight.imageIndex && !popupShownOnce) {
          setTimeout(() => {
            popup.style.opacity = "1";
            popupShownOnce = true;
          }, 100);
        }
      }, 100);
    });
  };

  const openPhotoGallery = (cafe = currentDetailCafe || window.currentPhotoCafe) => {
    const modal = document.getElementById("photo-gallery-modal");
    const galleryImages = document.getElementById("gallery-images");
    if (!modal || !galleryImages || !cafe) {
      return;
    }
    const images = cafe.images?.length ? cafe.images : [getPrimaryImage(cafe)];
    galleryImages.innerHTML = images
      .map((img) => `<img src="${img}" alt="${cafe.name}">`)
      .join("");
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closePhotoGallery = () => {
    const modal = document.getElementById("photo-gallery-modal");
    if (!modal) {
      return;
    }
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const showDesktopCafeDetail = (cafe) => {
    const panel = document.getElementById("desktop-cafe-detail");
    const content = document.getElementById("desktop-detail-content");
    if (!panel || !content) {
      return;
    }
    window.currentPhotoCafe = cafe;
    content.innerHTML = createDetailHTML(cafe, "desktop");
    panel.classList.add("active");
    content.querySelectorAll('[data-action="open-gallery"]').forEach((element) => {
      element.addEventListener("click", () => openPhotoGallery(cafe));
    });
  };

  const PC_MAP_OFFSET = 200;

  const onMarkerClick = (cafe, skipAnimation = false) => {
    const scrollY = window.scrollY || window.pageYOffset;
    currentDetailCafe = cafe;
    const isUIOpen = mobileDetailPanel && mobileDetailPanel.classList.contains("active");
    const mapCenter = map.getCenter();
    const cafeLatLng = L.latLng(cafe.coordinates);
    const distance = mapCenter.distanceTo(cafeLatLng);
    const isNearCenter = distance < 50;
    if (skipAnimation || isNearCenter) {
      highlightMarker(cafe.id);
      if (window.innerWidth <= 768) {
        closeDesktopCafeDetail();
        showMobileCafeDetail(cafe, 2);
        setTimeout(() => {
          window.scrollTo(0, scrollY);
        }, 0);
      } else {
        closeMobileCafeDetail();
        showDesktopCafeDetail(cafe);
      }
      return;
    }
    if (window.innerWidth <= 768 && isUIOpen && currentUISize >= 2) {
      highlightMarker(cafe.id);
      showMobileCafeDetail(cafe, 2);
      map.flyTo(cafe.coordinates, 17, {
        animate: true,
        duration: 0.5,
        easeLinearity: 0.25,
      });
      setTimeout(() => {
        window.scrollTo(0, scrollY);
      }, 0);
      return;
    }
    let targetCoordinates = cafe.coordinates;
    if (window.innerWidth > 768) {
      const offset = map.project(cafe.coordinates, 17);
      offset.x -= PC_MAP_OFFSET;
      targetCoordinates = map.unproject(offset, 17);
    }
    map.flyTo(targetCoordinates, 17, {
      animate: true,
      duration: 1,
      easeLinearity: 0.25,
    });
    setTimeout(() => {
      highlightMarker(cafe.id);
      setTimeout(() => {
        if (window.innerWidth <= 768) {
          closeDesktopCafeDetail();
          showMobileCafeDetail(cafe, 2);
          setTimeout(() => {
            window.scrollTo(0, scrollY);
          }, 0);
        } else {
          closeMobileCafeDetail();
          showDesktopCafeDetail(cafe);
        }
      }, 300);
    }, 1000);
  };

  const closeButton = document.getElementById("detail-close-btn");
  if (closeButton) {
    closeButton.addEventListener("click", closeDesktopCafeDetail);
  }
  if (desktopDetailPanel) {
    desktopDetailPanel.addEventListener("mouseenter", () => {
      if (map && map.scrollWheelZoom) {
        map.scrollWheelZoom.disable();
      }
    });
    desktopDetailPanel.addEventListener("mouseleave", () => {
      if (map && map.scrollWheelZoom) {
        map.scrollWheelZoom.enable();
      }
    });
    desktopDetailPanel.addEventListener(
      "wheel",
      (event) => {
        if (!desktopDetailPanel.classList.contains("active") || !desktopDetailContent) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        desktopDetailContent.scrollTop += event.deltaY * 0.7;
      },
      { passive: false }
    );
  }

  const modalCloseButton = document.getElementById("modal-close-btn");
  const modalOverlay = document.getElementById("modal-overlay");
  if (modalCloseButton) {
    modalCloseButton.addEventListener("click", closePhotoGallery);
  }
  if (modalOverlay) {
    modalOverlay.addEventListener("click", closePhotoGallery);
  }

  // マーカーを生成
  cafes.forEach((cafe) => {
    const marker = L.marker(cafe.coordinates, { icon: createCafeMarker(cafe) });
    marker.on("click", (event) => {
      L.DomEvent.preventDefault(event);
      L.DomEvent.stopPropagation(event);
      onMarkerClick(cafe);
    });
    marker.cafeId = cafe.id;
    markerById.set(cafe.id, marker);
    markerLayer.addLayer(marker);
  });

  // 地名ラベルをマップに追加
  const locationMarkers = {};
  Object.keys(LOCATIONS).forEach((key) => {
    const location = LOCATIONS[key];
    const marker = L.marker(location.coordinates, {
      icon: createLocationLabel(location.name),
      interactive: false,
    }).addTo(map);
    locationMarkers[key] = marker;
  });

  // ズームレベルに応じてラベルの表示/非表示を制御
  const CAFE_LABEL_MIN_ZOOM = 15;
  const LOCATION_LABEL_MIN_ZOOM = 13;

  const updateLabelVisibility = () => {
    const zoom = map.getZoom();
    document.querySelectorAll(".marker-label").forEach((label) => {
      if (zoom < CAFE_LABEL_MIN_ZOOM) {
        label.style.opacity = "0";
        label.style.display = "none";
      } else {
        label.style.opacity = "1";
        label.style.display = "block";
      }
    });
    document.querySelectorAll(".location-label").forEach((label) => {
      if (zoom < LOCATION_LABEL_MIN_ZOOM) {
        label.style.opacity = "0";
        label.style.display = "none";
      } else {
        label.style.opacity = "1";
        label.style.display = "block";
      }
    });
  };

  map.on("zoomend", updateLabelVisibility);
  updateLabelVisibility();
  map.whenReady(() => {
    updateLabelVisibility();
  });

  // お気に入り管理（LocalStorage）
  const favoritesKey = "cafeFavorites";
  const favorites = new Set(JSON.parse(localStorage.getItem(favoritesKey) || "[]"));

  // フィルター状態
  const state = {
    search: "",
    area: "all",
    features: new Set(),
    timeSlots: new Set(),
    sort: "newest",
    favoritesOnly: false,
  };
  let currentView = "map";
  const cafeCountEl = document.getElementById("cafe-count");
  const cafeCountLabel = document.querySelector(".count-label");
  let hasAnimatedCafeCount = false;
  let currentFiltered = cafes;

  let autoScrollInterval = null;
  let autoScrollResumeTimer = null;
  let currentCarouselIndex = 0;
  let isCarouselMinimized = false;
  let ignoreCarouselScrollUntil = 0;
  let isAdjustingInfiniteCarousel = false;
  const AUTO_SCROLL_SPEED = 2000;
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
  const bottomCarousel = document.getElementById("bottom-cafe-carousel");
  const carouselTrack = document.getElementById("carousel-track");
  const minimizeCarouselBtn = document.getElementById("minimize-carousel-btn");
  const minimizedCarouselBtn = document.getElementById("carousel-minimized-btn");
  let isMapFullscreen = false;
  let isSidebarOpen = true;

  // 正規表現用エスケープ
  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const toHiragana = (text) =>
    text.replace(/[\u30a1-\u30f6]/g, (match) => String.fromCharCode(match.charCodeAt(0) - 0x60));

  const fuzzyMatch = (text, searchTerm) => {
    const textLower = text.toLowerCase();
    const termLower = searchTerm.toLowerCase();
    if (textLower.includes(termLower)) {
      return true;
    }
    const textHiragana = toHiragana(textLower);
    const termHiragana = toHiragana(termLower);
    return textHiragana.includes(termHiragana);
  };

  const matchesSearchTerm = (cafe, term) => {
    const tokens = [
      cafe.name,
      cafe.nameKana,
      cafe.nameRomaji,
      cafe.area,
      cafe.address,
      cafe.comment,
      getCafeFeatures(cafe).join(" "),
      ...(cafe.nameVariants || []),
      ...(cafe.areaVariants || []),
    ].filter(Boolean);
    return tokens.some((token) => fuzzyMatch(String(token), term));
  };

  // ボタンのアクティブ状態を切り替え
  const setActiveButton = (buttons, activeButton) => {
    buttons.forEach((button) => button.classList.toggle("active", button === activeButton));
  };

  // 検索候補を表示
  const showSuggestions = (query) => {
    if (!suggestionsList) {
      return;
    }
    const trimmed = query.trim();
    if (!trimmed) {
      hideSuggestions();
      return;
    }

    const matches = cafes
      .filter((cafe) => {
        return matchesSearchTerm(cafe, trimmed);
      })
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
    if (autoScrollResumeTimer) {
      clearTimeout(autoScrollResumeTimer);
      autoScrollResumeTimer = null;
    }
  };

  const updateCollapseButtonPosition = (minimized) => {
    if (minimized) {
      document.body.classList.add("carousel-minimized");
    } else {
      document.body.classList.remove("carousel-minimized");
    }
  };

  const minimizeCarousel = () => {
    if (!bottomList || !minimizedCarouselBtn) {
      return;
    }
    isCarouselMinimized = true;
    bottomList.classList.add("minimized");
    minimizedCarouselBtn.style.display = "flex";
    if (mapSection) {
      mapSection.classList.add("list-minimized");
    }
    stopAutoScroll();
    updateCollapseButtonPosition(true);
  };

  const expandCarousel = () => {
    if (!bottomList || !minimizedCarouselBtn) {
      return;
    }
    isCarouselMinimized = false;
    bottomList.classList.remove("minimized");
    minimizedCarouselBtn.style.display = "none";
    if (window.innerWidth <= 768 && currentUISize > 1) {
      setUISize(1, true);
    }
    if (mapSection) {
      mapSection.classList.remove("list-minimized");
    }
    updateCollapseButtonPosition(false);
    if (isMapFullscreen && window.innerWidth <= 768) {
      startAutoScrollMobile();
    }
  };

  const scheduleAutoScrollResume = (platform, delay = 3000) => {
    if (autoScrollResumeTimer) {
      clearTimeout(autoScrollResumeTimer);
    }
    autoScrollResumeTimer = setTimeout(() => {
      if (!isMapFullscreen) {
        return;
      }
      if (platform === "pc" && window.innerWidth > 768) {
        startAutoScrollPC(sidebarCafeList);
      }
      if (platform === "mobile" && window.innerWidth <= 768 && !isCarouselMinimized) {
        startAutoScrollMobile();
      }
    }, delay);
  };

  const startAutoScrollPC = (list) => {
    if (!list || autoScrollInterval) {
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
    if (!bottomCarousel || !carouselTrack || autoScrollInterval || isCarouselMinimized) {
      return;
    }
    const totalCards = carouselTrack.querySelectorAll(".cafe-card:not(.clone)").length;
    if (!totalCards) {
      return;
    }
    const cardWidth = 148;
    const gap = 12;
    const itemWidth = cardWidth + gap;
    autoScrollInterval = setInterval(() => {
      const currentScroll = bottomCarousel.scrollLeft;
      // 自動スクロール由来のscrollイベントをユーザー操作として扱わない
      ignoreCarouselScrollUntil = Date.now() + 700;
      bottomCarousel.scrollTo({
        left: currentScroll + itemWidth,
        behavior: "smooth",
      });
    }, AUTO_SCROLL_SPEED);
  };

  const createPhotoEmphasizedCard = (cafe, sortType) => {
    const distanceInfo = getDistanceLabel(sortType, cafe);
    const distanceHTML = distanceInfo
      ? `<div class="sidebar-distance">${distanceInfo.label} ${distanceInfo.value}</div>`
      : "";
    const imageSrc = getPrimaryImage(cafe);
    const imageClass = imageSrc.includes("coming-soon")
      ? "cafe-card-image is-coming-soon"
      : "cafe-card-image";
    const card = document.createElement("article");
    card.className = "cafe-card";
    card.dataset.cafeId = String(cafe.id);
    card.innerHTML = `
      <img src="${imageSrc}" alt="${cafe.name}" class="${imageClass}" />
      <div class="cafe-card-content">
        <h3 class="cafe-name">${cafe.name}</h3>
        ${distanceHTML}
        <p class="cafe-area">📍 ${cafe.area}</p>
        <p class="cafe-comment">${cafe.comment}</p>
      </div>
    `;
    return card;
  };

  const createCarouselCafeCard = (cafe) => {
    const imageSrc = getPrimaryImage(cafe);
    const imageClass = imageSrc.includes("coming-soon")
      ? "cafe-card-image is-coming-soon"
      : "cafe-card-image";
    const card = document.createElement("article");
    card.className = "cafe-card";
    card.dataset.cafeId = String(cafe.id);
    card.innerHTML = `
      <img src="${imageSrc}" alt="${cafe.name}" class="${imageClass}" />
      <div class="cafe-card-content">
        <h3 class="cafe-name">${cafe.name}</h3>
        <p class="cafe-area">📍 ${cafe.area}</p>
      </div>
    `;
    return card;
  };

  const zoomToCafeFromCarousel = (cafe) => {
    openCafeFromFullscreenList(cafe.id);
  };

  const handleInfiniteScroll = () => {
    if (!bottomCarousel || !carouselTrack || isAdjustingInfiniteCarousel) {
      return;
    }
    const cardWidth = 148;
    const gap = 12;
    const itemWidth = cardWidth + gap;
    const totalCards = carouselTrack.querySelectorAll(".cafe-card:not(.clone)").length;
    if (!totalCards) {
      return;
    }
    const blockWidth = itemWidth * totalCards;
    const scrollLeft = bottomCarousel.scrollLeft;
    if (scrollLeft < blockWidth) {
      isAdjustingInfiniteCarousel = true;
      bottomCarousel.scrollLeft = scrollLeft + blockWidth;
      requestAnimationFrame(() => {
        isAdjustingInfiniteCarousel = false;
      });
    } else if (scrollLeft >= blockWidth * 2) {
      isAdjustingInfiniteCarousel = true;
      bottomCarousel.scrollLeft = scrollLeft - blockWidth;
      requestAnimationFrame(() => {
        isAdjustingInfiniteCarousel = false;
      });
    }
  };

  const initInfiniteCarousel = (list) => {
    if (!carouselTrack || !bottomCarousel) {
      return;
    }
    carouselTrack.innerHTML = "";
    if (!list.length) {
      return;
    }
    // 前後に全件複製して3ブロック化し、左右どちらでもシームレスに循環させる
    list.forEach((cafe) => {
      const clonedCard = createCarouselCafeCard(cafe);
      clonedCard.classList.add("clone");
      carouselTrack.appendChild(clonedCard);
    });
    list.forEach((cafe) => {
      carouselTrack.appendChild(createCarouselCafeCard(cafe));
    });
    list.forEach((cafe) => {
      const clonedCard = createCarouselCafeCard(cafe);
      clonedCard.classList.add("clone");
      carouselTrack.appendChild(clonedCard);
    });
    const cardWidth = 148;
    const gap = 12;
    bottomCarousel.scrollLeft = (cardWidth + gap) * list.length;
    bottomCarousel.removeEventListener("scroll", handleInfiniteScroll);
    bottomCarousel.addEventListener("scroll", handleInfiniteScroll);
  };

  const renderSidebarList = (list) => {
    if (!sidebarCafeList) {
      return;
    }
    sidebarCafeList.classList.add("photo-emphasized");
    sidebarCafeList.innerHTML = "";
    list.forEach((cafe) => {
      sidebarCafeList.appendChild(createPhotoEmphasizedCard(cafe, state.sort));
    });
  };

  const renderCarousel = (list) => {
    if (!carouselTrack) {
      return;
    }
    currentCarouselIndex = 0;
    initInfiniteCarousel(list);
  };

  const updateFullscreenLists = (list) => {
    if (!isMapFullscreen) {
      return;
    }
    if (window.innerWidth > 768) {
      renderSidebarList(list);
      syncSidebarSort();
      stopAutoScroll();
      startAutoScrollPC(sidebarCafeList);
    } else {
      renderCarousel(list);
      stopAutoScroll();
      if (!isCarouselMinimized) {
        startAutoScrollMobile();
      }
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

  const getDistance = (coord1, coord2) => {
    const [lat1, lon1] = coord1.map((v) => (v * Math.PI) / 180);
    const [lat2, lon2] = coord2.map((v) => (v * Math.PI) / 180);
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;
    const a =
      Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const radius = 6371;
    return radius * c;
  };

  const getCafeDistance = (cafe, type) => {
    if (type === "station") {
      return cafe.distanceFromStation ?? getDistance(referencePoints.station.coordinates, cafe.coordinates);
    }
    return cafe.distanceFromUniversity ?? getDistance(referencePoints.university.coordinates, cafe.coordinates);
  };

  const formatDistance = (distance) => `${distance.toFixed(2)}km`;

  const getDistanceLabel = (sortType, cafe) => {
    if (sortType === "distance-station") {
      return {
        icon: "📍",
        label: "岡山駅から",
        value: formatDistance(getCafeDistance(cafe, "station")),
      };
    }
    if (sortType === "distance-university") {
      return {
        icon: "🎓",
        label: "岡山大学から",
        value: formatDistance(getCafeDistance(cafe, "university")),
      };
    }
    return null;
  };

  const getFilteredCafes = () => {
    const keyword = state.search.trim();
    let filtered = cafes.filter((cafe) => {
      if (state.favoritesOnly && !favorites.has(cafe.id)) {
        return false;
      }
      if (state.area !== "all" && cafe.area !== state.area) {
        return false;
      }
      if (state.features.size) {
        const cafeFeatures = getCafeFeatures(cafe);
        const matchesFeature = [...state.features].every((feature) => cafeFeatures.includes(feature));
        if (!matchesFeature) {
          return false;
        }
      }
      if (state.timeSlots.size) {
        const cafeTimeSlots = cafe.timeSlots || [];
        const matchesTimeSlot = [...state.timeSlots].every((slot) =>
          cafeTimeSlots.includes(slot)
        );
        if (!matchesTimeSlot) {
          return false;
        }
      }
      if (keyword) {
        return matchesSearchTerm(cafe, keyword);
      }
      return true;
    });

    switch (state.sort) {
      case "newest":
        filtered = filtered.sort((a, b) => parseVisitDate(b.visitDate) - parseVisitDate(a.visitDate));
        break;
      case "rating":
        filtered = filtered.sort((a, b) => (b.comment || "").length - (a.comment || "").length);
        break;
      case "distance-station":
        filtered = filtered.sort((a, b) => getCafeDistance(a, "station") - getCafeDistance(b, "station"));
        break;
      case "distance-university":
        filtered = filtered.sort(
          (a, b) => getCafeDistance(a, "university") - getCafeDistance(b, "university")
        );
        break;
      default:
        filtered = filtered.sort((a, b) => {
          const dateDiff = parseVisitDate(b.visitDate) - parseVisitDate(a.visitDate);
          if (dateDiff !== 0) {
            return dateDiff;
          }
          return a.name.localeCompare(b.name, "ja");
        });
        break;
    }

    return filtered;
  };

  const isDefaultFilters = () =>
    state.search === "" &&
    state.area === "all" &&
    state.features.size === 0 &&
    state.timeSlots.size === 0 &&
    state.sort === "newest" &&
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
        const distanceInfo = getDistanceLabel(state.sort, cafe);
        const featureTags = getCafeFeatures(cafe)
          .map(
            (feature) =>
              `<span class="rounded-full bg-secondary/20 px-2 py-0.5 text-primary">${feature}</span>`
          )
          .join("");
        const timeSlotTags = (cafe.timeSlots || [])
          .map(
            (slot) =>
              `<span class="rounded-full bg-primary/10 px-2 py-0.5 text-primary">${slot}</span>`
          )
          .join("");
        const distanceHTML = distanceInfo
          ? `
                <div class="cafe-distance">
                  <span class="distance-icon">${distanceInfo.icon}</span>
                  <span class="distance-value">${distanceInfo.value}</span>
                  <span class="distance-label">${distanceInfo.label}</span>
                </div>
              `
          : "";
        return `
        <article class="cafe-card hover-lift rounded-2xl border border-primary/10 bg-white p-4" data-cafe-id="${cafe.id}">
          <div class="flex gap-3">
            <img src="${getPrimaryImage(cafe)}" alt="${cafe.name}" class="h-20 w-24 rounded-xl object-cover" />
            <div class="flex-1">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1">
                  <div class="cafe-card-header">
                    <h3 class="cafe-name text-sm font-semibold text-primary">${cafe.name}</h3>
                    ${distanceHTML}
                  </div>
                  <div class="mt-1 space-y-1 text-[11px] text-muted">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="rounded-full px-2 py-0.5 text-primary" style="background:#E3C5A4">${
          cafe.area
        }</span>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      ${featureTags}
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      ${timeSlotTags}
                    </div>
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
            <button type="button" class="view-on-map-btn mobile-only" data-action="view-map" data-cafe-id="${
              cafe.id
            }">
              🗺️ マップで見る
            </button>
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

  const areaButtons = document.querySelectorAll(".area-btn");
  const featureButtons = document.querySelectorAll(".feature-btn");
  const timeSlotButtons = document.querySelectorAll(".timeslot-btn");

  areaButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.area || "all";
      state.area = value;
      setActiveButton(areaButtons, button);
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

  timeSlotButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const slot = button.dataset.timeslot;
      if (!slot) {
        return;
      }
      if (state.timeSlots.has(slot)) {
        state.timeSlots.delete(slot);
        button.classList.remove("active");
      } else {
        state.timeSlots.add(slot);
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
    if (window.innerWidth <= 768 && mobileDetailPanel && mobileDetailPanel.classList.contains("active") && currentUISize >= 2) {
      highlightMarker(cafe.id);
      showMobileCafeDetail(cafe, 2);
      map.flyTo(cafe.coordinates, 17, {
        animate: true,
        duration: 0.5,
        easeLinearity: 0.25,
      });
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
      state.features.clear();
      state.timeSlots.clear();
      state.sort = "newest";
      state.favoritesOnly = false;
      if (searchInput) {
        searchInput.value = "";
      }
      hideSuggestions();
      if (clearButton) {
        clearButton.style.display = "none";
      }
      if (sortSelect) {
        sortSelect.value = "newest";
      }
      areaButtons.forEach((button) => button.classList.remove("active"));
      featureButtons.forEach((button) => button.classList.remove("active"));
      timeSlotButtons.forEach((button) => button.classList.remove("active"));

      const defaultArea = document.querySelector('.area-btn[data-area="all"]');
      if (defaultArea) {
        defaultArea.classList.add("active");
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

  const zoomToCafe = (cafe, duration = 1000) => {
    let targetCoordinates = cafe.coordinates;
    if (window.innerWidth > 768) {
      const offset = map.project(cafe.coordinates, 17);
      offset.x -= PC_MAP_OFFSET;
      targetCoordinates = map.unproject(offset, 17);
    }
    map.flyTo(targetCoordinates, 17, {
      animate: true,
      duration: duration / 1000,
      easeLinearity: 0.25,
    });
    setTimeout(() => {
      highlightMarker(cafe.id);
      setTimeout(() => {
        onMarkerClick(cafe, true);
      }, 300);
    }, duration);
  };

  const focusCafe = (id) => {
    const cafe = cafes.find((item) => item.id === id);
    if (!cafe) {
      return;
    }
    zoomToCafe(cafe, 1000);
  };

  const openCafeFromFullscreenList = (id) => {
    const cafe = cafes.find((item) => item.id === id);
    if (!cafe) {
      return;
    }
    stopAutoScroll();

    let handled = false;
    const finalizeAfterMove = () => {
      if (handled) {
        return;
      }
      handled = true;
      highlightMarker(cafe.id);
      if (isMapFullscreen) {
        if (window.innerWidth <= 768) {
          isCarouselMinimized = true;
          if (bottomList) {
            bottomList.classList.add("minimized");
          }
          if (minimizedCarouselBtn) {
            minimizedCarouselBtn.style.display = "flex";
          }
          if (mapSection) {
            mapSection.classList.add("list-minimized");
          }
          updateCollapseButtonPosition(true);
        } else if (fullscreenSidebar && mapSection) {
          isSidebarOpen = false;
          fullscreenSidebar.classList.add("collapsed");
          mapSection.classList.remove("sidebar-open");
        }
      }
      if (window.innerWidth <= 768) {
        closeDesktopCafeDetail();
        showMobileCafeDetail(cafe, 2);
      } else {
        closeMobileCafeDetail();
        showDesktopCafeDetail(cafe);
      }
    };

    map.once("moveend", finalizeAfterMove);
    map.flyTo(cafe.coordinates, 17, {
      animate: true,
      duration: 1,
      easeLinearity: 0.25,
    });
    setTimeout(finalizeAfterMove, 1400);
  };

  const viewCafeOnMap = (cafe) => {
    if (!cafe) {
      return;
    }
    if (window.innerWidth > 768) {
      focusCafe(cafe.id);
      return;
    }
    setView("map");
    zoomToCafe(cafe, 1000);
  };

  const enterFullscreenMode = () => {
    if (!mapSection || !expandBtn || !collapseBtn) {
      return;
    }
    isMapFullscreen = true;
    isSidebarOpen = true;
    isCarouselMinimized = false;
    stopAutoScroll();
    document.body.classList.add("map-fullscreen-mode");
    updateCollapseButtonPosition(false);
    mapSection.classList.add("fullscreen");
    expandBtn.style.display = "none";
    collapseBtn.style.display = "flex";
    setView("map");

    if (window.innerWidth > 768 && fullscreenSidebar) {
      fullscreenSidebar.style.display = "flex";
      fullscreenSidebar.classList.remove("collapsed");
      mapSection.classList.add("sidebar-open");
      mapSection.classList.remove("list-minimized");
      renderSidebarList(currentFiltered);
      syncSidebarSort();
      startAutoScrollPC(sidebarCafeList);
    } else if (bottomList) {
      bottomList.style.display = "block";
      bottomList.classList.remove("minimized");
      if (minimizedCarouselBtn) {
        minimizedCarouselBtn.style.display = "none";
      }
      mapSection.classList.add("mobile-list-visible");
      mapSection.classList.remove("list-minimized");
      renderCarousel(currentFiltered);
      startAutoScrollMobile();
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
    isCarouselMinimized = false;
    stopAutoScroll();
    document.body.classList.remove("map-fullscreen-mode");
    updateCollapseButtonPosition(false);
    mapSection.classList.remove("fullscreen", "sidebar-open", "mobile-list-visible", "list-minimized");
    expandBtn.style.display = "flex";
    collapseBtn.style.display = "none";
    if (fullscreenSidebar) {
      fullscreenSidebar.style.display = "none";
    }
    if (bottomList) {
      bottomList.style.display = "none";
      bottomList.classList.remove("minimized");
    }
    if (minimizedCarouselBtn) {
      minimizedCarouselBtn.style.display = "none";
    }
    const currentScrollY = window.scrollY || window.pageYOffset;
    setTimeout(() => {
      map.invalidateSize();
      window.scrollTo({
        top: Math.max(0, currentScrollY - 100),
        behavior: "smooth",
      });
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

  if (minimizeCarouselBtn) {
    minimizeCarouselBtn.addEventListener("click", minimizeCarousel);
  }

  if (minimizedCarouselBtn) {
    minimizedCarouselBtn.addEventListener("click", expandCarousel);
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
      openCafeFromFullscreenList(id);
    });
    sidebarCafeList.addEventListener("scroll", (event) => {
      if (!event.isTrusted) {
        return;
      }
      if (isMapFullscreen && window.innerWidth > 768) {
        stopAutoScroll();
        scheduleAutoScrollResume("pc", 3000);
      }
    });
  }

  if (bottomCarousel) {
    bottomCarousel.addEventListener("click", (event) => {
      const card = event.target.closest(".cafe-card[data-cafe-id]");
      if (!card) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const id = Number(card.dataset.cafeId);
      openCafeFromFullscreenList(id);
    });

    let scrollTimeout;
    bottomCarousel.addEventListener("scroll", (event) => {
      if (Date.now() < ignoreCarouselScrollUntil || isAdjustingInfiniteCarousel) {
        return;
      }
      if (!event.isTrusted) {
        return;
      }
      if (isMapFullscreen && window.innerWidth <= 768) {
        stopAutoScroll();
        scheduleAutoScrollResume("mobile", 3000);
      }
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!carouselTrack) {
          return;
        }
        const cardWidth = 148;
        const gapValue = 12;
        const itemWidth = cardWidth + gapValue;
        const totalCards = carouselTrack.querySelectorAll(".cafe-card:not(.clone)").length;
        if (!totalCards) {
          return;
        }
        const rawIndex = Math.round(bottomCarousel.scrollLeft / itemWidth) - totalCards;
        currentCarouselIndex = ((rawIndex % totalCards) + totalCards) % totalCards;
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
    stopAutoScroll();
    const isDesktop = window.innerWidth > 768;
    if (isDesktop && fullscreenSidebar) {
      fullscreenSidebar.style.display = "flex";
      mapSection.classList.add("sidebar-open");
      mapSection.classList.remove("mobile-list-visible", "list-minimized");
      fullscreenSidebar.classList.toggle("collapsed", !isSidebarOpen);
      if (bottomList) {
        bottomList.style.display = "none";
        bottomList.classList.remove("minimized");
      }
      isCarouselMinimized = false;
      updateCollapseButtonPosition(false);
      if (minimizedCarouselBtn) {
        minimizedCarouselBtn.style.display = "none";
      }
      renderSidebarList(currentFiltered);
      syncSidebarSort();
      startAutoScrollPC(sidebarCafeList);
    } else {
      if (fullscreenSidebar) {
        fullscreenSidebar.style.display = "none";
      }
      mapSection.classList.remove("sidebar-open");
      mapSection.classList.add("mobile-list-visible");
      if (bottomList) {
        bottomList.style.display = "block";
        bottomList.classList.toggle("minimized", isCarouselMinimized);
      }
      mapSection.classList.toggle("list-minimized", isCarouselMinimized);
      if (minimizedCarouselBtn) {
        minimizedCarouselBtn.style.display = isCarouselMinimized ? "flex" : "none";
      }
      renderCarousel(currentFiltered);
      if (!isCarouselMinimized) {
        startAutoScrollMobile();
      }
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
        if (action === "view-map") {
          const cafe = cafes.find((item) => item.id === id);
          viewCafeOnMap(cafe);
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
    if (view === "list" && window.innerWidth <= 768 && currentUISize > 0) {
      closeMobileCafeDetail();
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
