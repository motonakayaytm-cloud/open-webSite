(() => {
  const body = document.body;
  const header = document.querySelector(".site-header");

  // ページ表示時のフェードイン（bfcache 復帰時も含む）
  const showPage = () => {
    body.classList.remove("is-leaving");
    body.classList.add("is-loaded");
  };
  window.addEventListener("pageshow", showPage);
  requestAnimationFrame(showPage);

  // サイト内リンクはフェードアウトしてから遷移
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || link.target === "_blank") return;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || /^https?:/.test(href)) return;
    e.preventDefault();
    body.classList.add("is-leaving");
    setTimeout(() => { window.location.href = href; }, 280);
  });

  // ヘッダー & トップへ戻る
  const toTop = document.querySelector(".to-top");
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 40);
    toTop?.classList.toggle("is-show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // ハンバーガーメニュー
  const toggle = document.querySelector(".nav-toggle");
  toggle?.addEventListener("click", () => {
    const open = body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    body.style.overflow = open ? "hidden" : "";
  });

  // スクロールで要素をふわっと表示
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  // 数字のカウントアップ
  const counters = document.querySelectorAll("[data-count]");
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("ja-JP");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        co.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => co.observe(el));
  }

  // お問い合わせフォーム（デモ：送信はしません）
  const form = document.querySelector("#contact-form");
  if (form) {
    const wrap = form.closest(".form-wrap");
    const validators = {
      name: (v) => v.trim() !== "",
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      category: (v) => v !== "",
      message: (v) => v.trim().length >= 10,
      agree: (_, el) => el.checked,
    };
    const check = (el) => {
      const fn = validators[el.name];
      if (!fn) return true;
      const ok = fn(el.value, el);
      el.closest(".field")?.classList.toggle("is-error", !ok);
      return ok;
    };
    form.addEventListener("input", (e) => {
      if (e.target.closest(".field.is-error")) check(e.target);
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fields = Array.from(form.elements).filter((el) => validators[el.name]);
      const results = fields.map(check);
      if (results.every(Boolean)) {
        wrap.classList.add("is-sent");
        wrap.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        form.querySelector(".is-error input, .is-error select, .is-error textarea")?.focus();
      }
    });
  }

  // フッターの年
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
