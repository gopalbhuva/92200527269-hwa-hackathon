document.addEventListener("DOMContentLoaded", function () {
  if (!window.Rove) return;

  const listEl = document.querySelector("[data-cart-list]");
  const layoutEl = document.querySelector("[data-cart-layout]");
  const emptyEl = document.querySelector("[data-cart-empty]");
  const subtotalEl = document.querySelector("[data-subtotal]");
  const shippingEl = document.querySelector("[data-shipping]");
  const taxEl = document.querySelector("[data-tax]");
  const totalEl = document.querySelector("[data-total]");
  const progressEl = document.querySelector("[data-ship-progress]");
  const messageEl = document.querySelector("[data-ship-message]");
  const checkoutBtn = document.querySelector("[data-checkout-btn]");

  function render() {
    const items = window.Rove.getCart();
    const totals = window.Rove.totals(items);

    if (!items.length) {
      if (layoutEl) layoutEl.hidden = true;
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (layoutEl) layoutEl.hidden = false;
    if (emptyEl) emptyEl.hidden = true;

    listEl.innerHTML = items
      .map((item) => {
        const product = window.Rove.CATALOG[item.id];
        const color = window.Rove.COLORS[item.color];
        const key = window.Rove.keyFor(item.id, item.color);
        return (
          '<article class="cart-item" data-key="' +
          key +
          '">' +
          '<span class="cart-thumb" style="--thumb:' +
          (product.accent || color.hex) +
          '" aria-hidden="true"></span>' +
          '<div class="cart-item-info">' +
          "<h3>" +
          product.name +
          "</h3>" +
          '<p class="cart-item-sub">' +
          product.includes +
          " · " +
          color.name +
          "</p>" +
          '<div class="cart-item-controls">' +
          '<div class="qty">' +
          '<button type="button" data-dec aria-label="Decrease quantity" ' +
          (item.qty <= 1 ? "disabled" : "") +
          ">−</button>" +
          "<span>" +
          item.qty +
          "</span>" +
          '<button type="button" data-inc aria-label="Increase quantity" ' +
          (item.qty >= window.Rove.MAX_QTY ? "disabled" : "") +
          ">+</button>" +
          "</div>" +
          '<button type="button" class="link-btn" data-remove>Remove</button>' +
          "</div>" +
          "</div>" +
          '<span class="cart-line-price">' +
          window.Rove.money(product.price * item.qty) +
          "</span>" +
          "</article>"
        );
      })
      .join("");

    if (subtotalEl) subtotalEl.textContent = window.Rove.money(totals.subtotal);
    if (shippingEl) {
      shippingEl.textContent =
        totals.shipping === 0 ? "Free" : window.Rove.money(totals.shipping);
    }
    if (taxEl) taxEl.textContent = window.Rove.money(totals.tax);
    if (totalEl) totalEl.textContent = window.Rove.money(totals.total);
    if (checkoutBtn) {
      checkoutBtn.textContent =
        "Continue to checkout — " + window.Rove.money(totals.total);
    }

    if (progressEl) {
      const pct = Math.min(
        100,
        (totals.subtotal / window.Rove.FREE_SHIPPING_AT) * 100
      );
      progressEl.style.width = pct + "%";
    }

    if (messageEl) {
      messageEl.textContent =
        totals.subtotal >= window.Rove.FREE_SHIPPING_AT
          ? "Free shipping unlocked."
          : "Add " +
            window.Rove.money(window.Rove.FREE_SHIPPING_AT - totals.subtotal) +
            " more for free shipping.";
    }
  }

  if (listEl) {
    listEl.addEventListener("click", (event) => {
      const itemEl = event.target.closest("[data-key]");
      if (!itemEl) return;
      const key = itemEl.getAttribute("data-key");
      const item = window.Rove.getCart().find(
        (entry) => window.Rove.keyFor(entry.id, entry.color) === key
      );
      if (!item) return;

      if (event.target.closest("[data-inc]")) {
        window.Rove.updateQty(key, item.qty + 1);
      } else if (event.target.closest("[data-dec]")) {
        window.Rove.updateQty(key, item.qty - 1);
      } else if (event.target.closest("[data-remove]")) {
        window.Rove.removeItem(key);
      } else {
        return;
      }
      render();
    });
  }

  window.addEventListener("storage", (event) => {
    if (event.key === "rove_cart_v1") render();
  });

  render();
});
