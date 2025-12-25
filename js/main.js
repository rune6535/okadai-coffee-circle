document.addEventListener("DOMContentLoaded", () => {
  // フェードイン対象とトップへ戻るボタンを取得
  const fadeSections = document.querySelectorAll(".fade-section");
  const backToTop = document.getElementById("back-to-top");

  // 画像の読み込み失敗時に差し替える「Coming Soon」
  const comingSoonImage = "images/coming-soon.svg";
  const applyImageFallback = (img) => {
    if (!img || img.dataset.fallbackApplied === "true") {
      return;
    }
    img.dataset.fallbackApplied = "true";
    img.src = comingSoonImage;
    img.alt = img.alt ? `${img.alt}（Coming Soon）` : "Coming Soon";
    img.classList.add("is-placeholder");

    const lightboxTrigger = img.closest("[data-lightbox]");
    if (lightboxTrigger) {
      lightboxTrigger.dataset.lightbox = comingSoonImage;
    }
  };

  // 動的に追加される画像も含めてエラー時に差し替え
  document.addEventListener(
    "error",
    (event) => {
      const target = event.target;
      if (target && target.tagName === "IMG") {
        applyImageFallback(target);
      }
    },
    true
  );

  // 背景画像の未設定チェック（必要な場所のみ）
  const bgSlots = document.querySelectorAll("[data-bg-image]");
  bgSlots.forEach((slot) => {
    const src = slot.dataset.bgImage;
    if (!src) {
      return;
    }
    const probe = new Image();
    probe.onload = () => {};
    probe.onerror = () => {
      const badge = slot.querySelector("[data-bg-badge]");
      if (badge) {
        badge.classList.remove("hidden");
      }
    };
    probe.src = src;
  });

  // カフェマップの掲載数をカフェデータに合わせる
  const cafeCount = document.getElementById("cafe-count");
  if (cafeCount && window.CAFE_DATA && Array.isArray(window.CAFE_DATA.cafes)) {
    const totalCafes = window.CAFE_DATA.cafes.length;
    if (cafeCount.classList.contains("count-number")) {
      cafeCount.textContent = String(totalCafes);
    } else {
      cafeCount.textContent = `${totalCafes}店舗`;
    }
  }

  // 画面内に入ったらフェードイン
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  fadeSections.forEach((section, index) => {
    // 既に遅延が指定されている場合は尊重する
    if (!section.style.transitionDelay) {
      section.style.transitionDelay = `${(index * 0.1).toFixed(1)}s`;
    }
    observer.observe(section);
  });

  // グループ内の要素を段階表示
  const staggerGroups = document.querySelectorAll("[data-stagger]");
  staggerGroups.forEach((group) => {
    const items = group.querySelectorAll(".stagger-item");
    items.forEach((item, index) => {
      item.style.transitionDelay = `${(index * 0.1).toFixed(1)}s`;
    });
  });

  // トップへ戻るボタンの表示制御
  const toggleBackToTop = () => {
    if (!backToTop) {
      return;
    }
    if (window.scrollY > 400) {
      backToTop.classList.remove("opacity-0", "pointer-events-none");
      backToTop.classList.add("opacity-100");
    } else {
      backToTop.classList.add("opacity-0", "pointer-events-none");
      backToTop.classList.remove("opacity-100");
    }
  };

  window.addEventListener("scroll", toggleBackToTop);
  window.addEventListener("load", toggleBackToTop);

  if (backToTop) {
    // クリックでスムーズスクロール
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ボタン経由のスムーススクロール
  const scrollButtons = document.querySelectorAll("[data-scroll-target]");
  if (scrollButtons.length) {
    const smoothScrollTo = (target) => {
      const nav = document.getElementById("site-nav");
      const offset = nav ? nav.getBoundingClientRect().height + 16 : 80;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo(0, targetTop);
      target.classList.add("section-highlight");
      setTimeout(() => target.classList.remove("section-highlight"), 300);
    };

    const handleScroll = (event) => {
      const targetSelector = event.currentTarget.dataset.scrollTarget;
      const target = document.querySelector(targetSelector);
      if (!target) {
        return;
      }
      smoothScrollTo(target);
    };

    scrollButtons.forEach((button) => {
      // クリックとキーボード操作の両方に対応
      button.addEventListener("click", handleScroll);
      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleScroll(event);
        }
      });
    });
  }

  // 数値カウントアップ
  const countTargets = document.querySelectorAll("[data-countup]");
  if (countTargets.length) {
    const animateCount = (target) => {
      if (target.dataset.countupDone === "true") {
        return;
      }
      const endValue = Number(target.dataset.target || 0);
      const startValue = 1;
      const suffix = target.dataset.suffix || "";
      const duration = 3000;
      const startTime = performance.now();

      const easeOut = (t) => 1 - Math.pow(1 - t, 3);

      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = easeOut(progress);
        const value = Math.round(startValue + (endValue - startValue) * eased);
        target.textContent = `${value}${suffix}`;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          target.textContent = `${endValue}${suffix}`;
          target.dataset.countupDone = "true";
        }
      };

      requestAnimationFrame(step);
    };

    const groups = document.querySelectorAll("[data-countup-group]");
    if (groups.length) {
      const groupObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }
            const targets = entry.target.querySelectorAll("[data-countup]");
            targets.forEach((target) => animateCount(target));
            groupObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.4 }
      );

      groups.forEach((group) => groupObserver.observe(group));
    } else {
      const countObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }
            animateCount(entry.target);
          });
        },
        { threshold: 0.4 }
      );

      countTargets.forEach((target) => countObserver.observe(target));
    }
  }

  // ギャラリー用ライトボックス
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxClose = document.getElementById("lightbox-close");

  if (lightbox && lightboxImage && lightboxClose) {
    const openLightbox = (src, alt) => {
      lightboxImage.src = src;
      lightboxImage.alt = alt || "拡大画像";
      lightbox.classList.remove("hidden");
      lightbox.setAttribute("aria-hidden", "false");
    };

    const closeLightbox = () => {
      lightbox.classList.add("hidden");
      lightbox.setAttribute("aria-hidden", "true");
      lightboxImage.src = "";
    };

    document.querySelectorAll("[data-lightbox]").forEach((button) => {
      button.addEventListener("click", () => {
        const src = button.dataset.lightbox;
        const image = button.querySelector("img");
        openLightbox(src, image ? image.alt : "");
      });
    });

    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }

  const desktopMedia = window.matchMedia("(min-width: 768px)");

  const sliders = document.querySelectorAll("[data-slider]:not([data-slider='flow'])");

  sliders.forEach((slider) => {
    if (slider.classList.contains("flow-slider-desktop") && desktopMedia.matches) {
      return;
    }
    // スライダーの要素を取得
    const track = slider.querySelector("[data-slider-track]");
    const prevButton = slider.querySelector("[data-slider-prev]");
    const nextButton = slider.querySelector("[data-slider-next]");
    const dotsWrapper = slider.querySelector("[data-slider-dots]");

    if (!track || !prevButton || !nextButton || !dotsWrapper) {
      return;
    }

    const slides = Array.from(track.querySelectorAll("img"));
    let currentIndex = 0;

    // ページネーションドットを生成
    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className =
        "h-2.5 w-2.5 rounded-full bg-accent/40 transition duration-300 hover:bg-secondary/60";
      dot.setAttribute("aria-label", `スライド${index + 1}`);
      dot.dataset.index = index.toString();
      dotsWrapper.appendChild(dot);
    });

    const dots = Array.from(dotsWrapper.querySelectorAll("button"));

    let slideStep = 0;

    // スライド幅に合わせて移動量を計算
    const updateSlideStep = () => {
      if (!slides.length) {
        slideStep = 0;
        return;
      }
      const slideWidth = slides[0].getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).gap || "0");
      slideStep = slideWidth + gap;
    };

    // 表示位置とドット状態を更新
    const updateSlider = () => {
      if (slideStep) {
        track.style.transform = `translateX(-${currentIndex * slideStep}px)`;
      } else {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
      }
      dots.forEach((dot, index) => {
        if (index === currentIndex) {
          dot.classList.add("bg-secondary", "scale-110");
          dot.classList.remove("bg-accent/40");
          dot.setAttribute("aria-current", "true");
        } else {
          dot.classList.remove("bg-secondary", "scale-110");
          dot.classList.add("bg-accent/40");
          dot.removeAttribute("aria-current");
        }
      });
    };

    // インデックスをループさせて移動
    const goTo = (index) => {
      currentIndex = (index + slides.length) % slides.length;
      updateSlider();
    };

    updateSlideStep();

    window.addEventListener("resize", () => {
      updateSlideStep();
      updateSlider();
    });

    // 左右ボタン操作
    prevButton.addEventListener("click", () => goTo(currentIndex - 1));
    nextButton.addEventListener("click", () => goTo(currentIndex + 1));

    // ドットで任意スライドへ
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const index = Number(dot.dataset.index || 0);
        goTo(index);
      });
    });

    let startX = 0;
    let endX = 0;

    // タッチスワイプ操作
    track.addEventListener("touchstart", (event) => {
      startX = event.touches[0].clientX;
      endX = startX;
    });

    track.addEventListener("touchmove", (event) => {
      endX = event.touches[0].clientX;
    });

    track.addEventListener("touchend", () => {
      const delta = endX - startX;
      if (Math.abs(delta) > 40) {
        if (delta < 0) {
          goTo(currentIndex + 1);
        } else {
          goTo(currentIndex - 1);
        }
      }
    });

    updateSlider();
  });

  const initializeAllSliders = () => {
    const sliders = document.querySelectorAll(".slider-track");

    sliders.forEach((slider) => {
      if (slider.closest(".flow-slider")) {
        return;
      }
      const activityId = slider.getAttribute("data-activity");
      if (!activityId) {
        return;
      }
      initializeSlider(activityId);
    });
  };

  const initializeSlider = (activityId) => {
    const track = document.querySelector(`.slider-track[data-activity="${activityId}"]`);
    const prevBtn = document.querySelector(`.slider-nav.prev[data-activity="${activityId}"]`);
    const nextBtn = document.querySelector(`.slider-nav.next[data-activity="${activityId}"]`);
    const indicatorsContainer = document.querySelector(
      `.slider-indicators[data-activity="${activityId}"]`
    );

    if (track && track.closest(".flow-slider")) {
      return;
    }

    if (!track || !prevBtn || !nextBtn || !indicatorsContainer) {
      return;
    }

    const originalSlides = Array.from(track.querySelectorAll(".slide"));
    const totalSlides = originalSlides.length;

    if (!totalSlides) {
      return;
    }

    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone = originalSlides[totalSlides - 1].cloneNode(true);

    track.appendChild(firstClone);
    track.insertBefore(lastClone, track.firstChild);

    const indicators = Array.from(indicatorsContainer.querySelectorAll(".indicator"));
    const sliderWrapper = track.closest(".slider-wrapper");

    let currentIndex = 1;
    let isTransitioning = false;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let hasMoved = false;
    let pressTimer = null;
    let allowDrag = false;
    let startTransform = -currentIndex * 100;

    const allSlides = Array.from(track.querySelectorAll(".slide"));

    allSlides.forEach((slide) => {
      const image = slide.querySelector("img");
      if (image) {
        image.setAttribute("draggable", "false");
      }
    });

    const updateIndicators = () => {
      if (!indicators.length) {
        return;
      }
      let realIndex = currentIndex - 1;
      if (realIndex < 0) {
        realIndex = totalSlides - 1;
      }
      if (realIndex >= totalSlides) {
        realIndex = 0;
      }
      indicators.forEach((indicator, i) => {
        indicator.classList.toggle("active", i === realIndex);
      });
    };

    const setTransition = (enabled) => {
      track.style.transition = enabled
        ? "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
        : "none";
    };

    const goToSlide = (index, animate = true) => {
      if (isTransitioning) {
        return;
      }
      currentIndex = index;
      if (animate) {
        setTransition(true);
        isTransitioning = true;
      } else {
        setTransition(false);
      }
      track.style.transform = `translateX(${-currentIndex * 100}%)`;
      if (!animate) {
        updateIndicators();
      }
    };

    const handleTransitionEnd = () => {
      if (!isTransitioning) {
        return;
      }
      if (currentIndex === 0) {
        setTransition(false);
        currentIndex = totalSlides;
        track.style.transform = `translateX(${-currentIndex * 100}%)`;
      } else if (currentIndex === totalSlides + 1) {
        setTransition(false);
        currentIndex = 1;
        track.style.transform = `translateX(${-currentIndex * 100}%)`;
      }
      updateIndicators();
      isTransitioning = false;
    };

    track.addEventListener("transitionend", handleTransitionEnd);

    prevBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      goToSlide(currentIndex - 1);
    });

    nextBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      goToSlide(currentIndex + 1);
    });

    indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        goToSlide(index + 1);
      });
    });

    const handleStart = (event) => {
      if (isTransitioning) {
        return;
      }
      const isMouse = event.type.includes("mouse");

      hasMoved = false;
      startX = isMouse ? event.pageX : event.touches[0].pageX;
      currentX = startX;
      startTransform = -currentIndex * 100;
      setTransition(false);

      if (isMouse) {
        allowDrag = false;
        if (pressTimer) {
          clearTimeout(pressTimer);
        }
        pressTimer = window.setTimeout(() => {
          allowDrag = true;
          isDragging = true;
        }, 200);
        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleEnd);
      } else {
        allowDrag = true;
        isDragging = true;
      }
    };

    const handleMove = (event) => {
      if (!isDragging || !allowDrag) {
        return;
      }

      event.preventDefault();
      hasMoved = true;

      currentX = event.type.includes("mouse") ? event.pageX : event.touches[0].pageX;
      const diff = currentX - startX;
      const wrapperWidth = sliderWrapper ? sliderWrapper.offsetWidth : track.offsetWidth;
      const dragPercent = (diff / wrapperWidth) * 100;

      track.style.transform = `translateX(${startTransform + dragPercent}%)`;
    };

    const handleEnd = (event) => {
      if (!isDragging && !pressTimer) {
        return;
      }

      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }

      isDragging = false;
      allowDrag = false;

      if (event.type.includes("mouse")) {
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleEnd);
      }

      if (!hasMoved) {
        goToSlide(currentIndex, false);
        return;
      }

      const diff = currentX - startX;
      const wrapperWidth = sliderWrapper ? sliderWrapper.offsetWidth : track.offsetWidth;
      const threshold = wrapperWidth * 0.15;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          goToSlide(currentIndex - 1);
        } else {
          goToSlide(currentIndex + 1);
        }
      } else {
        goToSlide(currentIndex);
      }

      startX = 0;
      currentX = 0;
      hasMoved = false;
    };

    track.addEventListener("mousedown", handleStart);

    track.addEventListener("touchstart", handleStart, { passive: true });
    track.addEventListener("touchmove", handleMove, { passive: false });
    track.addEventListener("touchend", handleEnd, { passive: true });
    track.addEventListener("touchcancel", handleEnd, { passive: true });

    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" && !isTransitioning) {
        goToSlide(currentIndex - 1);
      } else if (event.key === "ArrowRight" && !isTransitioning) {
        goToSlide(currentIndex + 1);
      }
    });

    goToSlide(currentIndex, false);
  };

  initializeAllSliders();
});
