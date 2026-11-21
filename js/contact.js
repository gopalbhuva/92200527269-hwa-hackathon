document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const errorEl = document.querySelector("[data-contact-error]");
  const successEl = document.querySelector("[data-contact-success]");
  const submitButton = form.querySelector("[data-contact-submit]");
  const submitMarkup = submitButton ? submitButton.innerHTML : "";

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.classList.add("is-visible");
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
      ? '<span class="spinner" aria-hidden="true"></span> Sending…'
      : submitMarkup;
  }

  form.addEventListener("input", (event) => {
    if (event.target.matches("input, select, textarea")) {
      event.target.removeAttribute("aria-invalid");
      hideError();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = form.elements.name;
    const email = form.elements.email;
    const topic = form.elements.topic;
    const message = form.elements.message;
    const orderNumber = form.elements.orderNumber;
    const problems = [];

    [name, email, topic, message].forEach((input) => {
      const invalid = !String(input.value).trim();
      if (invalid) input.setAttribute("aria-invalid", "true");
      if (invalid) problems.push(input.name);
    });

    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
      email.setAttribute("aria-invalid", "true");
      if (!problems.includes("email")) problems.push("email");
    }

    if (message.value.trim() && message.value.trim().length < 10) {
      message.setAttribute("aria-invalid", "true");
      if (!problems.includes("message")) problems.push("message");
    }

    if (problems.length) {
      showError("Please add your name, a valid email, a topic and a message of at least 10 characters.");
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    hideError();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.value.trim(),
          email: email.value.trim(),
          topic: topic.value,
          orderNumber: orderNumber.value.trim(),
          message: message.value.trim()
        })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error || "We couldn't send your message. Please try again."
        );
      }

      form.hidden = true;
      if (successEl) {
        successEl.classList.add("is-visible");
        const nameEl = successEl.querySelector("[data-contact-name]");
        const ticketEl = successEl.querySelector("[data-contact-ticket]");
        if (nameEl) nameEl.textContent = name.value.trim().split(" ")[0];
        if (ticketEl) ticketEl.textContent = data.ticketId || "ROVE-C-000000";
      }
    } catch (error) {
      setLoading(false);
      showError(
        error.message ||
          "We couldn't send your message. Please check your connection and try again."
      );
    }
  });
});
