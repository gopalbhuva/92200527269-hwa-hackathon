document.addEventListener("DOMContentLoaded", function () {
  if (!window.Rove) return;

  const root = document.querySelector("[data-quiz]");
  const body = document.querySelector("[data-quiz-body]");
  const progress = document.querySelector("[data-quiz-progress]");
  if (!root || !body) return;

  const QUESTIONS = [
    {
      id: "size",
      title: "How big is your dog?",
      help: "Roughly — this changes the size and strength of what fits.",
      options: [
        { label: "Small", note: "Under 10 kg", scores: { "lick-mat": 2, "treat-pouch": 1, "snuffle-mat": 1 } },
        { label: "Medium", note: "10–25 kg", scores: { orbit: 2, "snuffle-mat": 1, "slow-bowl": 1 } },
        { label: "Large", note: "Over 25 kg", scores: { "trail-harness": 2, "dental-chew": 1, "cool-mat": 1 } }
      ]
    },
    {
      id: "age",
      title: "How old are they?",
      help: "Age changes how much challenge and how much rest they need.",
      options: [
        { label: "Puppy", note: "Under 1 year", scores: { "dental-chew": 2, "lick-mat": 1, "treat-pouch": 1 } },
        { label: "Adult", note: "1–7 years", scores: { orbit: 2, "trail-harness": 1, "snuffle-mat": 1 } },
        { label: "Senior", note: "8 years and up", scores: { "cool-mat": 2, "slow-bowl": 1, "lick-mat": 1 } }
      ]
    },
    {
      id: "challenge",
      title: "What's the biggest challenge right now?",
      help: "Pick the one that costs you the most peace.",
      options: [
        { label: "Boredom & destruction", scores: { orbit: 3, "snuffle-mat": 2 } },
        { label: "Fast eating", scores: { "slow-bowl": 3, "lick-mat": 1 } },
        { label: "Pulling on walks", scores: { "trail-harness": 3, "treat-pouch": 2 } },
        { label: "Chewing everything", scores: { "dental-chew": 3, orbit: 1 } },
        { label: "Heat & restlessness", scores: { "cool-mat": 3, "lick-mat": 1 } }
      ]
    },
    {
      id: "love",
      title: "What does your dog love most?",
      help: "The reward that makes their whole body wag.",
      options: [
        { label: "Food", scores: { "snuffle-mat": 2, "slow-bowl": 1 } },
        { label: "Sniffing", scores: { "snuffle-mat": 3, orbit: 1 } },
        { label: "Chewing", scores: { "dental-chew": 3, orbit: 1 } },
        { label: "Being with you", scores: { pawmatch: 3, "treat-pouch": 1 } }
      ]
    }
  ];

  const state = { step: 0, answers: {} };

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

  function setProgress(value) {
    if (progress) progress.style.width = value + "%";
  }

  function renderQuestion() {
    const question = QUESTIONS[state.step];
    if (!question) return;
    setProgress((state.step / QUESTIONS.length) * 100);

    body.innerHTML =
      '<div class="quiz-step">' +
      '<span class="quiz-step-label">Question ' +
      (state.step + 1) +
      " of " +
      QUESTIONS.length +
      "</span>" +
      "<h3>" +
      escapeHtml(question.title) +
      "</h3>" +
      (question.help
        ? '<p class="quiz-help">' + escapeHtml(question.help) + "</p>"
        : "") +
      '<div class="quiz-options">' +
      question.options
        .map(
          (option, index) =>
            '<button class="quiz-option" type="button" data-option="' +
            index +
            '">' +
            '<span class="quiz-option-label">' +
            escapeHtml(option.label) +
            "</span>" +
            (option.note
              ? '<span class="quiz-option-note">' + escapeHtml(option.note) + "</span>"
              : "") +
            "</button>"
        )
        .join("") +
      "</div>" +
      (state.step > 0
        ? '<div class="quiz-nav"><button class="link-btn" type="button" data-back>Back</button></div>'
        : "") +
      "</div>";
  }

  function computeResults() {
    const scores = {};
    QUESTIONS.forEach((question) => {
      const index = state.answers[question.id];
      const option = question.options[index];
      if (!option) return;
      Object.keys(option.scores).forEach((id) => {
        scores[id] = (scores[id] || 0) + option.scores[id];
      });
    });

    const ranked = Object.keys(scores)
      .filter((id) => window.Rove.CATALOG[id])
      .sort((a, b) => scores[b] - scores[a] || a.localeCompare(b));

    const top = ranked.slice(0, 3);
    if (!top.includes("pawmatch")) top.push("pawmatch");
    return top;
  }

  function renderResults() {
    setProgress(100);
    const ids = computeResults();
    const productCards = ids
      .filter((id) => id !== "pawmatch")
      .map((id, index) => {
        const product = window.Rove.CATALOG[id];
        return (
          '<article class="quiz-result' +
          (index === 0 ? " is-best" : "") +
          '">' +
          (index === 0 ? '<span class="quiz-result-kicker">Best fit</span>' : '<span class="quiz-result-kicker">Also great</span>') +
          "<h3>" +
          escapeHtml(product.name) +
          "</h3>" +
          '<span class="quiz-result-price">' +
          window.Rove.money(product.price) +
          "</span>" +
          "<p>" +
          escapeHtml(product.desc || product.includes) +
          "</p>" +
          '<button class="btn btn-ghost btn-block" type="button" data-add="' +
          id +
          '" data-color="natural">Add to cart</button>' +
          "</article>"
        );
      })
      .join("");

    body.innerHTML =
      '<div class="quiz-results">' +
      '<span class="quiz-step-label">Your match</span>' +
      "<h3>Here's what fits your dog.</h3>" +
      '<p class="quiz-help">Based on your answers — add anything that looks right, or start again.</p>' +
      '<div class="quiz-result-grid">' +
      productCards +
      "</div>" +
      '<div class="quiz-pm-callout">' +
      '<div><span class="quiz-result-kicker">Made to match</span><h4>PawMatch — $39</h4><p>A handmade matching set for you and your dog. One of one, made to order.</p></div>' +
      '<button class="btn btn-primary" type="button" data-add="pawmatch" data-color="natural">Add PawMatch</button>' +
      "</div>" +
      '<div class="quiz-nav quiz-nav-end">' +
      '<button class="link-btn" type="button" data-restart>Start over</button>' +
      '<a class="link-arrow" href="/shop.html">Shop all <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>' +
      "</div>" +
      "</div>";
  }

  body.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add]");
    if (addButton) {
      event.preventDefault();
      window.Rove.addItem(
        addButton.getAttribute("data-add"),
        addButton.getAttribute("data-color") || "natural",
        1
      );
      return;
    }

    const optionButton = event.target.closest("[data-option]");
    if (optionButton) {
      const question = QUESTIONS[state.step];
      const index = Number(optionButton.getAttribute("data-option"));
      if (!question || !question.options[index]) return;
      state.answers[question.id] = index;
      if (state.step < QUESTIONS.length - 1) {
        state.step += 1;
        renderQuestion();
      } else {
        renderResults();
      }
      return;
    }

    if (event.target.closest("[data-back]")) {
      if (state.step > 0) {
        state.step -= 1;
        renderQuestion();
      }
      return;
    }

    if (event.target.closest("[data-restart]")) {
      state.step = 0;
      state.answers = {};
      renderQuestion();
      const quiz = document.getElementById("quiz");
      if (quiz) quiz.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  renderQuestion();
});
