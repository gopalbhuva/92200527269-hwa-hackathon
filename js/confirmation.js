document.addEventListener("DOMContentLoaded", function () {
  if (!window.Rove) return;

  const content = document.querySelector("[data-confirm-content]");
  const missing = document.querySelector("[data-order-missing]");
  const order = window.Rove.getOrder();

  if (!order || !order.id) {
    if (content) content.hidden = true;
    if (missing) missing.hidden = false;
    return;
  }

  if (content) content.hidden = false;
  if (missing) missing.hidden = true;
  document.title = "Order " + order.id + " — ROVE";

  const escapeHtml = (value) =>
    String(value == null ? "" : value).replace(/[&<>"']/g, (character) => {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };
      return map[character];
    });

  const formatDate = (iso) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  };

  setText("[data-order-id]", order.id);
  setText(
    "[data-order-first-name]",
    (order.customer && order.customer.firstName) || "friend"
  );
  setText(
    "[data-order-email]",
    (order.customer && order.customer.email) || "—"
  );
  setText("[data-order-delivery]", formatDate(order.estimatedDelivery));
  setText("[data-order-placed]", formatDate(order.createdAt));
  setText(
    "[data-order-status]",
    order.status === "confirmed" ? "Confirmed" : order.status || "Confirmed"
  );

  const itemsEl = document.querySelector("[data-order-items]");
  if (itemsEl) {
    itemsEl.innerHTML = (order.items || [])
      .map((item) => {
        const color = window.Rove.COLORS[item.color] || {
          name: item.colorName || item.color || "",
          hex: "#5f7a5b"
        };
        const lineTotal =
          typeof item.lineTotal === "number"
            ? item.lineTotal
            : (Number(item.unitPrice) || 0) * (Number(item.qty) || 1);
        return (
          '<div class="order-item">' +
          '<span class="mini-thumb" style="--thumb:' +
          (item.accent || color.hex) +
          '" aria-hidden="true"></span>' +
          "<div>" +
          '<div class="mini-item-name">' +
          escapeHtml(item.name) +
          "</div>" +
          '<div class="mini-item-sub">' +
          escapeHtml(color.name) +
          " · Qty " +
          (Number(item.qty) || 1) +
          "</div>" +
          "</div>" +
          '<span class="mini-item-price">' +
          window.Rove.money(lineTotal) +
          "</span>" +
          "</div>"
        );
      })
      .join("");
  }

  setText("[data-order-subtotal]", window.Rove.money(order.subtotal));
  setText(
    "[data-order-shipping]",
    order.shipping === 0 ? "Free" : window.Rove.money(order.shipping)
  );
  setText("[data-order-tax]", window.Rove.money(order.tax));
  setText("[data-order-total]", window.Rove.money(order.total));

  const customer = order.customer || {};
  const addressEl = document.querySelector("[data-order-address]");
  if (addressEl) {
    const lines = [
      [customer.firstName, customer.lastName].filter(Boolean).join(" "),
      customer.address1,
      customer.address2,
      [customer.city, customer.region].filter(Boolean).join(", ") +
        (customer.postal ? " " + customer.postal : ""),
      customer.country
    ].filter((line) => line && String(line).trim());
    addressEl.innerHTML = lines.map(escapeHtml).join("<br>");
  }

  const payment = order.payment || {};
  setText(
    "[data-order-payment]",
    payment.method === "cod"
      ? "Pay on delivery"
      : "Card ending in " + (payment.last4 || "••••")
  );

  const printButton = document.querySelector("[data-print]");
  if (printButton) {
    printButton.addEventListener("click", () => window.print());
  }
});
