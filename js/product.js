document.addEventListener("DOMContentLoaded", function () {
  if (!window.Rove) return;

  const state = { bundle: "orbit", color: "moss", qty: 1 };
  const priceEl = document.querySelector("[data-product-price]");
  const noteEl = document.querySelector("[data-product-note]");
  const colorNameEl = document.querySelector("[data-color-name]");
  const art = document.querySelector("[data-product-art]");
  const addButton = document.querySelector("[data-product-add]");
  const buyButton = document.querySelector("[data-buy-now]");
  const qtyWidget = document.querySelector("[data-product-qty]");
  const qtyDisplay = document.querySelector("[data-qty-display]");
  const minus = qtyWidget ? qtyWidget.querySelector('[data-step="-1"]') : null;
  const plus = qtyWidget ? qtyWidget.querySelector('[data-step="1"]') : null;

  function render() {
    const product = window.Rove.CATALOG[state.bundle];
    if (!product) return;
    if (priceEl) priceEl.textContent = window.Rove.money(product.price);
    if (noteEl) noteEl.textContent = product.includes + " · free shipping";
    if (addButton) addButton.textContent = "Add to cart — " + window.Rove.money(product.price);
    if (qtyDisplay) qtyDisplay.textContent = String(state.qty);
    if (minus) minus.disabled = state.qty <= 1;
    if (plus) plus.disabled = state.qty >= window.Rove.MAX_QTY;
    if (art) art.setAttribute("data-color", state.color);
    if (colorNameEl) colorNameEl.textContent = window.Rove.COLORS[state.color].name;
    document.querySelectorAll("[data-swatch]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.getAttribute("data-swatch") === state.color)
      );
    });
  }

  document.querySelectorAll('input[name="bundle"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.bundle = input.value;
        render();
      }
    });
  });

  document.querySelectorAll("[data-swatch]").forEach((button) => {
    button.addEventListener("click", () => {
      state.color = button.getAttribute("data-swatch");
      render();
    });
  });

  if (qtyWidget) {
    qtyWidget.addEventListener("click", (event) => {
      const button = event.target.closest("[data-step]");
      if (!button) return;
      const step = Number(button.getAttribute("data-step"));
      state.qty = Math.min(
        window.Rove.MAX_QTY,
        Math.max(1, state.qty + step)
      );
      render();
    });
  }

  if (addButton) {
    addButton.addEventListener("click", () => {
      window.Rove.addItem(state.bundle, state.color, state.qty);
    });
  }

  if (buyButton) {
    buyButton.addEventListener("click", () => {
      window.Rove.addItem(state.bundle, state.color, state.qty);
      window.location.href = "/checkout.html";
    });
  }

  render();
});
