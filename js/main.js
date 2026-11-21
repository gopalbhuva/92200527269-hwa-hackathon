document.addEventListener("DOMContentLoaded", function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach((el) => observer.observe(el));
  }

  const openPanel = (trigger) => {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (!panel) return;
    trigger.setAttribute("aria-expanded", "true");
    panel.style.maxHeight = panel.scrollHeight + "px";
  };

  const closePanel = (trigger) => {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (!panel) return;
    trigger.setAttribute("aria-expanded", "false");
    panel.style.maxHeight = "0px";
  };

  document.querySelectorAll(".acc-trigger").forEach((trigger) => {
    if (trigger.getAttribute("aria-expanded") === "true") openPanel(trigger);
    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      const group = trigger.closest("[data-accordion]");
      if (!isOpen && group && group.getAttribute("data-accordion") === "single") {
        group.querySelectorAll(".acc-trigger[aria-expanded='true']").forEach(closePanel);
      }
      if (isOpen) {
        closePanel(trigger);
      } else {
        openPanel(trigger);
      }
    });
  });

  window.addEventListener("resize", () => {
    document.querySelectorAll(".acc-trigger[aria-expanded='true']").forEach((trigger) => {
      const panel = document.getElementById(trigger.getAttribute("aria-controls"));
      if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
    });
  });

  document.querySelectorAll("[data-level-tabs]").forEach((group) => {
    const buttons = Array.from(group.querySelectorAll("[data-level]"));
    const panels = Array.from(document.querySelectorAll("[data-level-panel]"));
    const art = document.querySelector("[data-difficulty-art]");

    const activate = (level) => {
      buttons.forEach((button) => {
        const active = button.getAttribute("data-level") === level;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", String(active));
        button.setAttribute("tabindex", active ? "0" : "-1");
      });
      panels.forEach((panel) => {
        const active = panel.getAttribute("data-level-panel") === level;
        panel.classList.toggle("is-active", active);
        panel.setAttribute("aria-hidden", String(!active));
      });
      if (art) art.setAttribute("data-focus", level);
    };

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => activate(button.getAttribute("data-level")));
      button.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const next = (index + direction + buttons.length) % buttons.length;
        buttons[next].focus();
        activate(buttons[next].getAttribute("data-level"));
      });
    });
  });

  document.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const id = button.getAttribute("data-add");
      const color = button.getAttribute("data-color") || "moss";
      const qty = Number(button.getAttribute("data-qty-value") || 1);
      window.Rove.addItem(id, color, qty);
    });
  });
});
