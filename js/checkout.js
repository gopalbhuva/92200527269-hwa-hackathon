document.addEventListener("DOMContentLoaded", function () {
  if (!window.Rove) return;

  const form = document.getElementById("checkout-form");
  if (!form) return;

  const layoutEl = document.querySelector("[data-checkout-layout]");
  const emptyEl = document.querySelector("[data-checkout-empty]");
  const itemsEl = document.querySelector("[data-checkout-items]");
  const subtotalEl = document.querySelector("[data-checkout-subtotal]");
  const shippingEl = document.querySelector("[data-checkout-shipping]");
  const taxEl = document.querySelector("[data-checkout-tax]");
  const totalEl = document.querySelector("[data-checkout-total]");
  const errorEl = document.querySelector("[data-checkout-error]");
  const cardFields = document.querySelector("[data-card-fields]");
  const cardInputs = cardFields ? Array.from(cardFields.querySelectorAll("input")) : [];
  const submitButton = form.querySelector("[data-place-order]");
  const submitMarkup = submitButton ? submitButton.innerHTML : "";
  const cardNumber = document.getElementById("cardNumber");
  const cardExpiry = document.getElementById("cardExpiry");
  const cardCvc = document.getElementById("cardCvc");

  const digits = (value) => String(value || "").replace(/\D/g, "");

  function getPayment() {
    const checked = form.querySelector('input[name="payment"]:checked');
    return checked ? checked.value : "card";
  }

  function renderSummary() {
    const cart = window.Rove.getCart();
    const totals = window.Rove.totals(cart);

    if (!cart.length) {
      if (layoutEl) layoutEl.hidden = true;
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (layoutEl) layoutEl.hidden = false;
    if (emptyEl) emptyEl.hidden = true;

    if (itemsEl) {
      itemsEl.innerHTML = cart
        .map((item) => {
          const product = window.Rove.CATALOG[item.id];
          const color = window.Rove.COLORS[item.color];
          return (
            '<div class="mini-item">' +
            '<span class="mini-thumb" style="--thumb:' +
            (product.accent || color.hex) +
            '" aria-hidden="true"></span>' +
            "<div>" +
            '<div class="mini-item-name">' +
            product.name +
            "</div>" +
            '<div class="mini-item-sub">' +
            color.name +
            " · Qty " +
            item.qty +
            "</div>" +
            "</div>" +
            '<span class="mini-item-price">' +
            window.Rove.money(product.price * item.qty) +
            "</span>" +
            "</div>"
          );
        })
        .join("");
    }

    if (subtotalEl) subtotalEl.textContent = window.Rove.money(totals.subtotal);
    if (shippingEl) {
      shippingEl.textContent =
        totals.shipping === 0 ? "Free" : window.Rove.money(totals.shipping);
    }
    if (taxEl) taxEl.textContent = window.Rove.money(totals.tax);
    if (totalEl) totalEl.textContent = window.Rove.money(totals.total);
    const orderTotalEl = document.querySelector("[data-order-total]");
    if (orderTotalEl) orderTotalEl.textContent = window.Rove.money(totals.total);
  }

  function syncPayment() {
    if (!cardFields) return;
    const isCard = getPayment() === "card";
    cardFields.hidden = !isCard;
    cardInputs.forEach((input) => {
      input.disabled = !isCard;
      if (!isCard) input.removeAttribute("aria-invalid");
    });
  }

  form.querySelectorAll('input[name="payment"]').forEach((radio) => {
    radio.addEventListener("change", syncPayment);
  });

  if (cardNumber) {
    cardNumber.addEventListener("input", () => {
      const value = digits(cardNumber.value).slice(0, 19);
      cardNumber.value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    });
  }

  if (cardExpiry) {
    cardExpiry.addEventListener("input", () => {
      const value = digits(cardExpiry.value).slice(0, 4);
      cardExpiry.value =
        value.length > 2 ? value.slice(0, 2) + " / " + value.slice(2) : value;
    });
  }

  if (cardCvc) {
    cardCvc.addEventListener("input", () => {
      cardCvc.value = digits(cardCvc.value).slice(0, 4);
    });
  }

  const testCardButton = document.querySelector("[data-test-card]");
  if (testCardButton) {
    testCardButton.addEventListener("click", () => {
      const nameInput = document.getElementById("cardName");
      if (nameInput && !nameInput.value.trim()) nameInput.value = "Alex Morgan";
      if (cardNumber) cardNumber.value = "4242 4242 4242 4242";
      if (cardExpiry) cardExpiry.value = "12 / 34";
      if (cardCvc) cardCvc.value = "123";
      cardInputs.forEach((input) => input.removeAttribute("aria-invalid"));
      window.Rove.toast("Test card filled — ready to place your order");
    });
  }

  function labelFor(input) {
    const field = input.closest(".field");
    const label = field ? field.querySelector("label") : null;
    return label
      ? label.textContent.replace("(optional)", "").trim()
      : input.name;
  }

  function mark(input, invalid) {
    if (!input) return;
    if (invalid) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
  }

  function emailValid(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function luhnValid(value) {
    const valueDigits = digits(value);
    if (valueDigits.length < 13 || valueDigits.length > 19) return false;
    let sum = 0;
    let double = false;
    for (let i = valueDigits.length - 1; i >= 0; i -= 1) {
      let number = Number(valueDigits[i]);
      if (double) {
        number *= 2;
        if (number > 9) number -= 9;
      }
      sum += number;
      double = !double;
    }
    return sum % 10 === 0;
  }

  function expiryValid(value) {
    const match = String(value)
      .replace(/\s/g, "")
      .match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    const month = Number(match[1]);
    if (month < 1 || month > 12) return false;
    const year = 2000 + Number(match[2]);
    const expiry = new Date(year, month, 1);
    return expiry > new Date();
  }

  function validate() {
    const problems = [];
    const requiredNames = [
      "firstName",
      "lastName",
      "address1",
      "city",
      "region",
      "postal",
      "country"
    ];

    requiredNames.forEach((name) => {
      const input = form.elements[name];
      if (!input) return;
      const invalid = !String(input.value).trim();
      mark(input, invalid);
      if (invalid) problems.push(labelFor(input));
    });

    const email = form.elements.email;
    if (email) {
      const value = String(email.value).trim();
      if (!value) {
        mark(email, true);
        problems.push("Email address");
      } else if (!emailValid(value)) {
        mark(email, true);
        problems.push("a valid email address");
      } else {
        mark(email, false);
      }
    }

    if (getPayment() === "card") {
      const name = form.elements.cardName;
      if (name && !String(name.value).trim()) {
        mark(name, true);
        problems.push("Name on card");
      } else if (name) {
        mark(name, false);
      }

      if (cardNumber && !luhnValid(cardNumber.value)) {
        mark(cardNumber, true);
        problems.push("a valid card number");
      } else if (cardNumber) {
        mark(cardNumber, false);
      }

      if (cardExpiry && !expiryValid(cardExpiry.value)) {
        mark(cardExpiry, true);
        problems.push("a valid expiry date");
      } else if (cardExpiry) {
        mark(cardExpiry, false);
      }

      const cvc = digits(cardCvc ? cardCvc.value : "");
      if (cvc.length < 3 || cvc.length > 4) {
        mark(cardCvc, true);
        problems.push("a valid CVC");
      } else {
        mark(cardCvc, false);
      }
    }

    return problems;
  }

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.classList.add("is-visible");
    errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function hideError() {
    if (!errorEl) return;
    errorEl.textContent = "";
    errorEl.classList.remove("is-visible");
  }

  function setLoading(loading) {
    if (!submitButton) return;
    submitButton.disabled = loading;
    submitButton.classList.toggle("is-loading", loading);
    submitButton.innerHTML = loading
      ? '<span class="spinner" aria-hidden="true"></span> Placing order…'
      : submitMarkup;
    if (!loading) {
      const orderTotalEl = submitButton.querySelector("[data-order-total]");
      if (orderTotalEl) {
        orderTotalEl.textContent = window.Rove.money(
          window.Rove.totals().total
        );
      }
    }
  }

  form.addEventListener("input", (event) => {
    if (event.target.matches("input, select, textarea")) {
      event.target.removeAttribute("aria-invalid");
      hideError();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const cart = window.Rove.getCart();
    if (!cart.length) {
      renderSummary();
      return;
    }

    const problems = validate();
    if (problems.length) {
      showError("Please check: " + problems.join(", ") + ".");
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    hideError();
    const method = getPayment();
    const value = (name) => {
      const input = form.elements[name];
      return input ? String(input.value).trim() : "";
    };

    const payload = {
      items: cart.map((item) => ({
        id: item.id,
        color: item.color,
        qty: item.qty
      })),
      customer: {
        firstName: value("firstName"),
        lastName: value("lastName"),
        email: value("email"),
        phone: value("phone"),
        address1: value("address1"),
        address2: value("address2"),
        city: value("city"),
        region: value("region"),
        postal: value("postal"),
        country: value("country")
      },
      payment:
        method === "card"
          ? {
              method: "card",
              last4: digits(cardNumber ? cardNumber.value : "").slice(-4)
            }
          : { method: "cod" }
    };

    setLoading(true);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ||
            "We couldn't place your order. Please check your details and try again."
        );
      }

      window.Rove.saveOrder(data.order);
      window.Rove.clearCart();
      window.location.href = "/confirmation.html";
    } catch (error) {
      setLoading(false);
      showError(
        error.message ||
          "We couldn't place your order. Please check your connection and try again."
      );
    }
  });

  syncPayment();
  renderSummary();
});
