(function () {
  const THEME_KEY = "rove_theme";
  const themeRoot = document.documentElement;

  const applyTheme = (theme) => {
    themeRoot.setAttribute("data-theme", theme);
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      const dark = theme === "dark";
      button.setAttribute(
        "aria-label",
        dark ? "Switch to light mode" : "Switch to dark mode"
      );
      button.setAttribute("aria-pressed", String(dark));
    });
  };

  const initTheme = () => {
    let saved = null;
    try {
      saved = window.localStorage.getItem(THEME_KEY);
    } catch (error) {}
    if (saved !== "dark" && saved !== "light") {
      saved =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    }
    applyTheme(saved);
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const next =
          themeRoot.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
        try {
          window.localStorage.setItem(THEME_KEY, next);
        } catch (error) {}
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    initTheme();
  }
})();

(function () {
  const CART_KEY = "rove_cart_v1";
  const ORDER_KEY = "rove_last_order";
  const TAX_RATE = 0.08;
  const FREE_SHIPPING_AT = 75;
  const SHIPPING_FLAT = 8;
  const MAX_QTY = 10;

  const CATALOG = {
    orbit: {
      id: "orbit",
      name: "The Orbit",
      tagline: "Single Orbit",
      price: 89,
      includes: "1 Orbit · standard ring set",
      accent: "#5f7a5b",
      desc: "The three-ring treat-hunting puzzle that started it all. Adjustable difficulty, no batteries."
    },
    "orbit-plus": {
      id: "orbit-plus",
      name: "The Orbit Plus",
      tagline: "Orbit + expansion pack",
      price: 109,
      includes: "1 Orbit · 2 ring sets · travel pouch",
      accent: "#5f7a5b",
      desc: "The Orbit with a second ring set and a travel pouch for hunts away from home."
    },
    "full-den": {
      id: "full-den",
      name: "The Full Den",
      tagline: "Complete enrichment kit",
      price: 139,
      includes: "1 Orbit · 3 ring sets · travel sling · scoop",
      accent: "#5f7a5b",
      desc: "Three ring sets, a travel sling and a scoop — every configuration in one box."
    },
    "snuffle-mat": {
      id: "snuffle-mat",
      name: "The Snuffle Mat",
      tagline: "Scent-work feeding mat",
      price: 34,
      includes: "Machine-washable snuffle mat",
      accent: "#7c8f6b",
      desc: "Hide kibble in the fleece strands and let their nose do the work. Slows meals, calms busy brains."
    },
    "lick-mat": {
      id: "lick-mat",
      name: "The Lick Mat",
      tagline: "Silicone enrichment mat",
      price: 19,
      includes: "Silicone lick mat · suction base",
      accent: "#c07a52",
      desc: "Spread peanut butter or yoghurt and freeze. A five-minute calm-down that lasts far longer."
    },
    "slow-bowl": {
      id: "slow-bowl",
      name: "The Slow Bowl",
      tagline: "Anti-gulp slow feeder",
      price: 28,
      includes: "Maze slow-feeder bowl",
      accent: "#8a6a45",
      desc: "A maze of ridges turns dinner into a fifteen-minute puzzle instead of a ten-second inhale."
    },
    "trail-harness": {
      id: "trail-harness",
      name: "The Trail Harness",
      tagline: "No-pull walking harness",
      price: 54,
      includes: "Padded no-pull harness",
      accent: "#3f5d4a",
      desc: "Front-clip, padded and escape-proof. Walks stop being a tug-of-war and start being a stroll."
    },
    "cool-mat": {
      id: "cool-mat",
      name: "The Cool Mat",
      tagline: "Self-cooling rest mat",
      price: 64,
      includes: "Pressure-activated cooling mat",
      accent: "#5b7f8a",
      desc: "No water, no power — gel layers pull heat away on contact. The summer spot they won't leave."
    },
    "treat-pouch": {
      id: "treat-pouch",
      name: "The Treat Pouch",
      tagline: "Training treat bag",
      price: 32,
      includes: "Hands-free treat pouch",
      accent: "#a85a37",
      desc: "Magnetic close, belt clip and a wipe-clean lining. Rewards within reach, crumbs where they belong."
    },
    "dental-chew": {
      id: "dental-chew",
      name: "The Dental Chew",
      tagline: "Chew + teeth cleaning toy",
      price: 16,
      includes: "Textured dental chew toy",
      accent: "#b98a5a",
      desc: "Flexible ridges scrub teeth and massage gums while the chew urge gets a safe outlet."
    }
  };

  const COLORS = {
    moss: { name: "Moss", hex: "#5f7a5b" },
    clay: { name: "Clay", hex: "#c07a52" },
    bone: { name: "Bone", hex: "#cdbfa5" },
    natural: { name: "Natural", hex: "#8a7a5c" }
  };

  const money = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(Number(value) || 0);

  const keyFor = (id, color) => id + "|" + color;

  function readCart() {
    try {
      const raw = window.localStorage.getItem(CART_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(
          (item) =>
            item &&
            CATALOG[item.id] &&
            COLORS[item.color] &&
            Number.isFinite(Number(item.qty))
        )
        .map((item) => ({
          id: item.id,
          color: item.color,
          qty: Math.min(MAX_QTY, Math.max(1, Math.round(Number(item.qty))))
        }));
    } catch (error) {
      return [];
    }
  }

  function writeCart(items) {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (error) {
      return;
    }
    updateBadge();
  }

  function addItem(id, color, qty) {
    if (!CATALOG[id] || !COLORS[color]) return;
    const amount = Math.min(MAX_QTY, Math.max(1, Math.round(Number(qty) || 1)));
    const items = readCart();
    const existing = items.find((item) => item.id === id && item.color === color);
    if (existing) {
      existing.qty = Math.min(MAX_QTY, existing.qty + amount);
    } else {
      items.push({ id: id, color: color, qty: amount });
    }
    writeCart(items);
    toast(CATALOG[id].name + " added to your cart", {
      href: "/cart.html",
      label: "View cart"
    });
  }

  function updateQty(key, qty) {
    const next = Math.min(MAX_QTY, Math.max(1, Math.round(Number(qty) || 1)));
    const items = readCart().map((item) =>
      keyFor(item.id, item.color) === key ? { ...item, qty: next } : item
    );
    writeCart(items);
    return items;
  }

  function removeItem(key) {
    const items = readCart().filter(
      (item) => keyFor(item.id, item.color) !== key
    );
    writeCart(items);
    return items;
  }

  function clearCart() {
    writeCart([]);
  }

  function totals(items) {
    const list = Array.isArray(items) ? items : readCart();
    const subtotal = list.reduce((sum, item) => {
      const product = CATALOG[item.id];
      return product ? sum + product.price * item.qty : sum;
    }, 0);
    const shipping =
      subtotal === 0 || subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING_FLAT;
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;
    const count = list.reduce((sum, item) => sum + item.qty, 0);
    return { subtotal: subtotal, shipping: shipping, tax: tax, total: total, count: count };
  }

  function updateBadge() {
    const count = readCart().reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll("[data-cart-count]").forEach((badge) => {
      badge.textContent = String(count);
      badge.hidden = count === 0;
      badge.classList.remove("is-bumping");
      if (count > 0) {
        void badge.offsetWidth;
        badge.classList.add("is-bumping");
      }
    });
  }

  const CHECK_ICON =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 12.5l4.5 4.5 10.5-11" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function toast(message, options) {
    const opts = options || {};
    let stack = document.querySelector(".toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      stack.setAttribute("aria-live", "polite");
      document.body.appendChild(stack);
    }
    const el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML =
      '<span class="toast-icon">' +
      CHECK_ICON +
      "</span><span>" +
      message +
      "</span>" +
      (opts.href
        ? '<a href="' + opts.href + '">' + (opts.label || "View") + "</a>"
        : "");
    stack.appendChild(el);
    window.setTimeout(() => {
      el.classList.add("is-leaving");
      window.setTimeout(() => el.remove(), 320);
    }, 3800);
  }

  function saveOrder(order) {
    try {
      window.sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
    } catch (error) {}
    try {
      window.localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    } catch (error) {}
  }

  function getOrder() {
    try {
      const fromSession = window.sessionStorage.getItem(ORDER_KEY);
      if (fromSession) return JSON.parse(fromSession);
    } catch (error) {}
    try {
      const fromLocal = window.localStorage.getItem(ORDER_KEY);
      if (fromLocal) return JSON.parse(fromLocal);
    } catch (error) {}
    return null;
  }

  function initHeader() {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.getElementById("mobile-menu");

    const closeMenu = () => {
      if (!toggle || !menu) return;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      menu.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
    };

    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!isOpen));
        toggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
        menu.classList.toggle("is-open", !isOpen);
        document.body.classList.toggle("no-scroll", !isOpen);
      });
      menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
      });
      window.addEventListener("resize", () => {
        if (window.innerWidth > 940) closeMenu();
      });
    }

    if (header) {
      const onScroll = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    window.addEventListener("storage", (event) => {
      if (event.key === CART_KEY) updateBadge();
    });

    updateBadge();
  }

  window.Rove = {
    CATALOG: CATALOG,
    COLORS: COLORS,
    TAX_RATE: TAX_RATE,
    FREE_SHIPPING_AT: FREE_SHIPPING_AT,
    MAX_QTY: MAX_QTY,
    money: money,
    keyFor: keyFor,
    getCart: readCart,
    addItem: addItem,
    updateQty: updateQty,
    removeItem: removeItem,
    clearCart: clearCart,
    totals: totals,
    updateBadge: updateBadge,
    toast: toast,
    saveOrder: saveOrder,
    getOrder: getOrder
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeader);
  } else {
    initHeader();
  }
})();
