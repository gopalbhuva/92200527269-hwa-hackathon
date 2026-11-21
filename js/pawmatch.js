document.addEventListener("DOMContentLoaded", function () {
  /* ---------- Tabs ---------- */
  const tabButtons = Array.from(document.querySelectorAll("[data-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));
  const activateTab = (id) => {
    tabButtons.forEach((button) => {
      const active = button.getAttribute("data-tab") === id;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    panels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.getAttribute("data-panel") === id);
    });
  };
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => activateTab(button.getAttribute("data-tab")));
  });

  /* ---------- Dogs ---------- */
  const DOGS = [
    {
      id: "biscuit",
      name: "Biscuit",
      breed: "Beagle mix",
      age: "3 years",
      size: "Medium",
      energy: "medium",
      homes: ["house", "apartment"],
      kids: true,
      pets: true,
      experience: "some",
      days: 74,
      shelter: "Meadow Lane",
      accent: "#c07a52",
      traits: ["Sociable", "Food-motivated"],
      blurb: "Always first to the gate. Biscuit would love daily walks and a few treats hidden around the house."
    },
    {
      id: "nova",
      name: "Nova",
      breed: "Border collie",
      age: "2 years",
      size: "Medium",
      energy: "high",
      homes: ["house", "rural"],
      kids: false,
      pets: false,
      experience: "experienced",
      days: 38,
      shelter: "Northfield",
      accent: "#5b7f8a",
      traits: ["Clever", "Driven"],
      blurb: "A working brain who needs a job. Nova thrives with training, long walks and a confident handler."
    },
    {
      id: "miso",
      name: "Miso",
      breed: "Shih Tzu",
      age: "6 years",
      size: "Small",
      energy: "low",
      homes: ["apartment", "house"],
      kids: true,
      pets: true,
      experience: "first",
      days: 92,
      shelter: "Little Paws",
      accent: "#b98a5a",
      traits: ["Gentle", "Lap dog"],
      blurb: "A quiet companion who loves a warm lap and a slow sniff around the block. Perfect for a first dog."
    },
    {
      id: "rocky",
      name: "Rocky",
      breed: "Staffy",
      age: "4 years",
      size: "Medium",
      energy: "medium",
      homes: ["house", "apartment"],
      kids: true,
      pets: false,
      experience: "some",
      days: 120,
      shelter: "Meadow Lane",
      accent: "#3f5d4a",
      traits: ["Loyal", "Bouncy"],
      blurb: "A people-dog to the core. Rocky wants to be where you are and will trade any toy for a scratch."
    },
    {
      id: "juniper",
      name: "Juniper",
      breed: "Greyhound",
      age: "5 years",
      size: "Large",
      energy: "low",
      homes: ["apartment", "house"],
      kids: true,
      pets: false,
      experience: "some",
      days: 65,
      shelter: "Hound Haven",
      accent: "#8a6a45",
      traits: ["Calm", "Gentle"],
      blurb: "A forty-mile-an-hour couch potato. Two short walks and a soft bed is Juniper's idea of a perfect day."
    },
    {
      id: "peanut",
      name: "Peanut",
      breed: "Chihuahua mix",
      age: "8 years",
      size: "Small",
      energy: "low",
      homes: ["apartment"],
      kids: false,
      pets: false,
      experience: "first",
      days: 150,
      shelter: "Little Paws",
      accent: "#9b6b8f",
      traits: ["Shy", "Loyal"],
      blurb: "Slow to trust, quick to love. Peanut needs a quiet adult home and someone patient with small-dog nerves."
    },
    {
      id: "atlas",
      name: "Atlas",
      breed: "German Shepherd",
      age: "3 years",
      size: "Large",
      energy: "high",
      homes: ["house", "rural"],
      kids: false,
      pets: false,
      experience: "experienced",
      days: 45,
      shelter: "Northfield",
      accent: "#22352a",
      traits: ["Clever", "Protective"],
      blurb: "Big, bright and ready to work. Atlas needs structure, space and a handler who enjoys training."
    },
    {
      id: "clover",
      name: "Clover",
      breed: "Labrador mix",
      age: "1 year",
      size: "Large",
      energy: "high",
      homes: ["house", "rural"],
      kids: true,
      pets: true,
      experience: "first",
      days: 20,
      shelter: "Meadow Lane",
      accent: "#7c8f6b",
      traits: ["Playful", "Goofy"],
      blurb: "All paws and enthusiasm. Clover is a young dog who needs room to run and a family who likes a project."
    }
  ];

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

  const dogById = (id) => DOGS.find((dog) => dog.id === id);

  /* ---------- Matching ---------- */
  const QUESTIONS = [
    {
      id: "home",
      title: "Where do you live?",
      help: "Be honest — the right dog for a flat is different from the right dog for a farm.",
      options: [
        { label: "An apartment", note: "No private garden", value: "apartment" },
        { label: "A house with a yard", note: "Some outdoor space", value: "house" },
        { label: "Rural or a farm", note: "Lots of open space", value: "rural" }
      ]
    },
    {
      id: "energy",
      title: "How active is your household?",
      help: "Think about a normal week, not your best intentions.",
      options: [
        { label: "Couch and strolls", note: "One or two gentle walks", value: "low" },
        { label: "Daily walks", note: "An hour or so a day", value: "medium" },
        { label: "Runs and hikes", note: "Very active, most days", value: "high" }
      ]
    },
    {
      id: "experience",
      title: "How much dog experience do you have?",
      help: "There's a dog for every level — this helps us avoid mismatches.",
      options: [
        { label: "This is my first dog", note: "Learning as we go", value: "first" },
        { label: "I've had a dog before", note: "Comfortable with the basics", value: "some" },
        { label: "Very experienced", note: "Training and big breeds", value: "experienced" }
      ]
    },
    {
      id: "household",
      title: "Who lives at home?",
      help: "Some dogs need an adults-only home; others love a busy family.",
      options: [
        { label: "Adults only", note: "A quiet household", value: "adults" },
        { label: "Children at home", note: "Young people around", value: "kids" },
        { label: "Other pets", note: "Dogs or cats already", value: "pets" }
      ]
    }
  ];

  const ENERGY_ORDER = { low: 0, medium: 1, high: 2 };
  const EXPERIENCE_ORDER = { first: 0, some: 1, experienced: 2 };

  function scoreDog(dog, answers) {
    let score = 0;
    if (dog.homes.includes(answers.home)) score += 3;
    else score += 0.5;

    const energyGap = Math.abs(
      ENERGY_ORDER[dog.energy] - ENERGY_ORDER[answers.energy]
    );
    score += energyGap === 0 ? 3 : energyGap === 1 ? 1.5 : 0;

    const experienceGap =
      EXPERIENCE_ORDER[dog.experience] - EXPERIENCE_ORDER[answers.experience];
    score += experienceGap <= 0 ? 3 : experienceGap === 1 ? 1.5 : 0;

    if (answers.household === "kids") score += dog.kids ? 3 : 0;
    else if (answers.household === "pets") score += dog.pets ? 3 : 0;
    else score += 2.5;

    if (dog.days >= 60) score += 0.75;

    return Math.min(100, Math.round((score / 12) * 100));
  }

  function rankDogs(answers) {
    return DOGS.map((dog) => ({ dog: dog, match: scoreDog(dog, answers) })).sort(
      (a, b) => b.match - a.match || b.dog.days - a.dog.days
    );
  }

  const quizBody = document.querySelector("[data-quiz-body]");
  const quizProgress = document.querySelector("[data-quiz-progress]");
  const quizState = { step: 0, answers: {} };
  let lastRanking = null;

  function setQuizProgress(value) {
    if (quizProgress) quizProgress.style.width = value + "%";
  }

  function renderQuizQuestion() {
    if (!quizBody) return;
    const question = QUESTIONS[quizState.step];
    if (!question) return;
    setQuizProgress((quizState.step / QUESTIONS.length) * 100);
    quizBody.innerHTML =
      '<div class="quiz-step">' +
      '<span class="quiz-step-label">Question ' +
      (quizState.step + 1) +
      " of " +
      QUESTIONS.length +
      "</span>" +
      "<h3>" +
      escapeHtml(question.title) +
      "</h3>" +
      '<p class="quiz-help">' +
      escapeHtml(question.help) +
      "</p>" +
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
            '<span class="quiz-option-note">' +
            escapeHtml(option.note) +
            "</span>" +
            "</button>"
        )
        .join("") +
      "</div>" +
      (quizState.step > 0
        ? '<div class="quiz-nav"><button class="link-btn" type="button" data-back>Back</button></div>'
        : "") +
      "</div>";
  }

  function dogCard(dog, match, options) {
    const opts = options || {};
    const matchBadge =
      typeof match === "number"
        ? '<span class="dog-match">' + match + "% match</span>"
        : "";
    return (
      '<article class="dog-card' +
      (opts.best ? " is-best" : "") +
      '">' +
      '<div class="dog-avatar" style="--dog:' +
      dog.accent +
      '" aria-hidden="true"><span>' +
      escapeHtml(dog.name.charAt(0)) +
      "</span></div>" +
      '<div class="dog-info">' +
      '<div class="dog-top"><h3>' +
      escapeHtml(dog.name) +
      "</h3>" +
      matchBadge +
      "</div>" +
      '<p class="dog-meta">' +
      escapeHtml(dog.breed) +
      " · " +
      escapeHtml(dog.age) +
      " · " +
      escapeHtml(dog.size) +
      " · " +
      escapeHtml(dog.shelter) +
      "</p>" +
      '<p class="dog-blurb">' +
      escapeHtml(dog.blurb) +
      "</p>" +
      '<div class="dog-tags">' +
      dog.traits
        .map((trait) => '<span class="dog-tag">' + escapeHtml(trait) + "</span>")
        .join("") +
      "</div>" +
      '<div class="dog-foot"><span class="dog-days">' +
      dog.days +
      " days waiting</span>" +
      '<button class="btn btn-ghost btn-sm" type="button" data-adopt-dog="' +
      dog.id +
      '">Ask about ' +
      escapeHtml(dog.name) +
      "</button></div>" +
      "</div>" +
      "</article>"
    );
  }

  function renderDogGrid(ranking) {
    const grid = document.querySelector("[data-dog-grid]");
    if (!grid) return;
    const scores = new Map();
    if (ranking) ranking.forEach((entry) => scores.set(entry.dog.id, entry.match));
    grid.innerHTML = DOGS.map((dog) => dogCard(dog, scores.get(dog.id))).join("");
  }

  function renderQuizResults() {
    if (!quizBody) return;
    setQuizProgress(100);
    lastRanking = rankDogs(quizState.answers);
    const top = lastRanking.slice(0, 3);
    quizBody.innerHTML =
      '<div class="quiz-results">' +
      '<span class="quiz-step-label">Your shortlist</span>' +
      "<h3>Three dogs that fit your life.</h3>" +
      '<p class="quiz-help">Ranked by home, energy, experience and household — with a small nudge for dogs who have waited longest.</p>' +
      '<div class="dog-result-grid">' +
      top.map((entry, index) => dogCard(entry.dog, entry.match, { best: index === 0 })).join("") +
      "</div>" +
      '<div class="quiz-nav quiz-nav-end">' +
      '<button class="link-btn" type="button" data-restart>Start over</button>' +
      '<a class="link-arrow" href="#all-dogs">See all dogs <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>' +
      "</div>" +
      "</div>";
    renderDogGrid(lastRanking);
  }

  if (quizBody) {
    quizBody.addEventListener("click", (event) => {
      const option = event.target.closest("[data-option]");
      if (option) {
        const question = QUESTIONS[quizState.step];
        const index = Number(option.getAttribute("data-option"));
        if (!question || !question.options[index]) return;
        quizState.answers[question.id] = question.options[index].value;
        if (quizState.step < QUESTIONS.length - 1) {
          quizState.step += 1;
          renderQuizQuestion();
        } else {
          renderQuizResults();
        }
        return;
      }
      if (event.target.closest("[data-back]")) {
        if (quizState.step > 0) {
          quizState.step -= 1;
          renderQuizQuestion();
        }
        return;
      }
      if (event.target.closest("[data-restart]")) {
        quizState.step = 0;
        quizState.answers = {};
        lastRanking = null;
        renderQuizQuestion();
        renderDogGrid(null);
      }
    });
    renderQuizQuestion();
  }

  /* ---------- Adoption form ---------- */
  const adoptForm = document.querySelector("[data-adopt-form]");
  const adoptSelect = document.querySelector("[data-dog-select]");
  const adoptStatus = document.querySelector("[data-adopt-status]");

  if (adoptSelect) {
    adoptSelect.innerHTML =
      '<option value="">Choose a dog</option>' +
      DOGS.map(
        (dog) =>
          '<option value="' + dog.id + '">' + escapeHtml(dog.name) + " — " + escapeHtml(dog.breed) + "</option>"
      ).join("");
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-adopt-dog]");
    if (!button) return;
    event.preventDefault();
    const id = button.getAttribute("data-adopt-dog");
    const dog = dogById(id);
    if (!dog) return;
    if (adoptSelect) adoptSelect.value = id;
    const adopt = document.getElementById("adopt");
    if (adopt) adopt.scrollIntoView({ behavior: "smooth", block: "start" });
    const nameInput = document.getElementById("adoptName");
    if (nameInput) window.setTimeout(() => nameInput.focus({ preventScroll: true }), 500);
    if (window.Rove && window.Rove.toast) {
      window.Rove.toast(dog.name + " selected — add your details to send a request");
    }
  });

  const setAdoptStatus = (message, type) => {
    if (!adoptStatus) return;
    adoptStatus.textContent = message;
    adoptStatus.className = "adopt-status" + (type ? " is-" + type : "");
  };

  if (adoptForm) {
    adoptForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(adoptForm).entries());
      const name = String(data.name || "").trim();
      const email = String(data.email || "").trim();
      const message = String(data.message || "").trim();
      const dog = dogById(data.dog);

      if (!dog) return setAdoptStatus("Choose a dog first.", "error");
      if (!name) return setAdoptStatus("Please add your name.", "error");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
        return setAdoptStatus("Please add a valid email address.", "error");
      if (message.length < 10)
        return setAdoptStatus("Tell us a little more — at least 10 characters.", "error");

      const button = adoptForm.querySelector("[data-adopt-submit]");
      const label = button ? button.textContent : "";
      if (button) {
        button.disabled = true;
        button.textContent = "Sending…";
      }
      setAdoptStatus("", "");

      try {
        const response = await fetch("/api/adoption", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dog: dog.id,
            dogName: dog.name,
            name: name,
            email: email,
            phone: String(data.phone || "").trim(),
            message: message
          })
        });
        const json = await response.json().catch(() => ({}));
        if (!response.ok || !json.ok) throw new Error(json.error || "Request failed.");
        setAdoptStatus(
          "Request sent for " + dog.name + ". Your reference is " + json.reference + ".",
          "success"
        );
        adoptForm.reset();
      } catch (error) {
        const ref =
          "PAW-" + Math.random().toString(36).slice(2, 6).toUpperCase() + Date.now().toString(36).slice(-3).toUpperCase();
        setAdoptStatus(
          "Demo mode: request saved for " + dog.name + ". Reference " + ref + ".",
          "success"
        );
        adoptForm.reset();
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = label;
        }
      }
    });
  }

  renderDogGrid(null);

  /* ---------- 30-day checklist ---------- */
  const CHECKLIST = [
    {
      title: "Week 1 · Settle in",
      items: [
        "Set up a quiet safe space with a bed and water",
        "Keep meals on the same schedule as the shelter",
        "Book a vet check-up in the first 72 hours",
        "Take short, calm walks on a long lead",
        "Start a simple routine: food, toilet, rest, repeat"
      ]
    },
    {
      title: "Week 2 · Build trust",
      items: [
        "Introduce one new room at a time",
        "Begin short training sessions: name, sit, come",
        "Try a food puzzle for quiet enrichment",
        "Invite one calm friend over",
        "Note what triggers stress and avoid it for now"
      ]
    },
    {
      title: "Week 3 · Grow confidence",
      items: [
        "Start loose-lead practice in a quiet area",
        "Attend any vet follow-ups",
        "Introduce grooming: brush, paws, teeth",
        "Try a new, quiet walking route",
        "Begin leaving for 10 minutes at a time"
      ]
    },
    {
      title: "Week 4 · Find your rhythm",
      items: [
        "Build alone-time up to 30–60 minutes",
        "Try a café or quiet street at an off-peak hour",
        "Review the first month and adjust the routine",
        "Book a training class if you need support",
        "Celebrate with a new toy or a long sniff walk"
      ]
    }
  ];
  const CHECK_KEY = "pawmatch_checklist";
  const checklistEl = document.querySelector("[data-checklist]");
  const checkCountEl = document.querySelector("[data-check-count]");
  const checkProgressEl = document.querySelector("[data-check-progress]");

  function readChecks() {
    try {
      const raw = window.localStorage.getItem(CHECK_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeChecks(list) {
    try {
      window.localStorage.setItem(CHECK_KEY, JSON.stringify(list));
    } catch (error) {}
  }

  function updateCheckProgress() {
    if (!checklistEl) return;
    const boxes = Array.from(checklistEl.querySelectorAll("input[type=checkbox]"));
    const done = boxes.filter((box) => box.checked).length;
    if (checkCountEl) checkCountEl.textContent = done + " of " + boxes.length + " done";
    if (checkProgressEl)
      checkProgressEl.style.width = boxes.length ? (done / boxes.length) * 100 + "%" : "0%";
  }

  if (checklistEl) {
    const checked = new Set(readChecks());
    checklistEl.innerHTML = CHECKLIST.map((week, weekIndex) => {
      return (
        '<div class="check-week">' +
        "<h3>" +
        escapeHtml(week.title) +
        "</h3>" +
        week.items
          .map((item, itemIndex) => {
            const id = "w" + weekIndex + "-" + itemIndex;
            return (
              '<label class="check-item"><input type="checkbox" data-check="' +
              id +
              '"' +
              (checked.has(id) ? " checked" : "") +
              "><span>" +
              escapeHtml(item) +
              "</span></label>"
            );
          })
          .join("") +
        "</div>"
      );
    }).join("");

    checklistEl.addEventListener("change", (event) => {
      const box = event.target.closest("input[type=checkbox]");
      if (!box) return;
      const id = box.getAttribute("data-check");
      const current = new Set(readChecks());
      if (box.checked) current.add(id);
      else current.delete(id);
      writeChecks(Array.from(current));
      updateCheckProgress();
    });

    const reset = document.querySelector("[data-check-reset]");
    if (reset) {
      reset.addEventListener("click", () => {
        checklistEl.querySelectorAll("input[type=checkbox]").forEach((box) => {
          box.checked = false;
        });
        writeChecks([]);
        updateCheckProgress();
      });
    }

    updateCheckProgress();
  }

  /* ---------- Shelter bio writer ---------- */
  const bioForm = document.querySelector("[data-bio-form]");
  const bioOutput = document.querySelector("[data-bio-output]");
  const bioCopy = document.querySelector("[data-bio-copy]");
  let lastBio = "";

  function buildBio() {
    if (!bioForm) return;
    const data = Object.fromEntries(new FormData(bioForm).entries());
    const name = String(data.name || "").trim() || "This dog";
    const breed = String(data.breed || "").trim() || "mixed-breed";
    const age = String(data.age || "").trim() || "young";
    const home = String(data.home || "").trim() || "a loving home";
    const quirk = String(data.quirk || "").trim();
    const traits = Array.from(
      bioForm.querySelectorAll("[data-bio-traits] input:checked")
    ).map((input) => input.value);

    const traitText = traits.length
      ? traits.slice(0, 3).join(", ")
      : "curious, gentle and full of potential";
    const quirkText = quirk
      ? " The kind of dog who " + quirk + "."
      : " The kind of dog who makes ordinary days better.";
    const bio =
      "Meet " +
      name +
      ", a " +
      age +
      "-old " +
      breed +
      " looking for " +
      home +
      ". " +
      name +
      " is " +
      traitText +
      " — the sort of companion who settles in beautifully with a steady routine and a little patience." +
      quirkText +
      " If you're looking for a " +
      (traits[0] || "loyal") +
      " friend, " +
      name +
      " could be your match. Come and meet them.";

    lastBio = bio;
    if (bioOutput) {
      bioOutput.innerHTML = "<p>" + escapeHtml(bio) + "</p>";
      bioOutput.classList.add("has-bio");
    }
    if (bioCopy) bioCopy.hidden = false;
  }

  if (bioForm) {
    bioForm.addEventListener("submit", (event) => {
      event.preventDefault();
      buildBio();
    });
  }

  if (bioCopy) {
    bioCopy.addEventListener("click", async () => {
      if (!lastBio) return;
      try {
        await navigator.clipboard.writeText(lastBio);
      } catch (error) {
        const area = document.createElement("textarea");
        area.value = lastBio;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      if (window.Rove && window.Rove.toast) window.Rove.toast("Bio copied");
    });
  }

  /* ---------- Overlooked dogs chart ---------- */
  const overlookedEl = document.querySelector("[data-overlooked]");
  if (overlookedEl) {
    const sorted = DOGS.slice().sort((a, b) => b.days - a.days);
    const max = sorted[0].days;
    const longWait = sorted.filter((dog) => dog.days >= 60).length;
    overlookedEl.innerHTML =
      '<p class="chart-summary"><strong>' +
      longWait +
      " of " +
      DOGS.length +
      "</strong> dogs have waited more than 60 days.</p>" +
      sorted
        .map((dog) => {
          const pct = Math.round((dog.days / max) * 100);
          const long = dog.days >= 60;
          return (
            '<div class="bar-row">' +
            '<span class="bar-name">' +
            escapeHtml(dog.name) +
            "</span>" +
            '<div class="bar-track"><span class="' +
            (long ? "bar-long" : "bar-short") +
            '" style="width:' +
            pct +
            '%"></span></div>' +
            '<span class="bar-days">' +
            dog.days +
            "d</span>" +
            (long ? '<span class="bar-tag">Overlooked</span>' : '<span class="bar-tag bar-tag-empty"></span>') +
            "</div>"
          );
        })
        .join("");
  }

  /* ---------- Mood reader ---------- */
  const MOODS = {
    relaxed: {
      title: "Relaxed and content",
      text: "Soft body, loose tail and relaxed ears. This is a dog at ease.",
      tip: "A good moment for gentle handling, a brush, or a quiet treat."
    },
    happy: {
      title: "Happy and engaged",
      text: "A loose, wagging tail and a wiggly body usually mean a dog who is enjoying the moment.",
      tip: "Great time for play, training or a sniff walk."
    },
    playful: {
      title: "Playful and ready for fun",
      text: "The play bow and high tail are an invitation. Your dog wants a game.",
      tip: "Offer a toy or a short game — keep it light and let them win."
    },
    anxious: {
      title: "Anxious or unsure",
      text: "A tucked tail, pinned ears or a shrinking posture can signal worry.",
      tip: "Lower your voice, give space and remove the trigger. Never force interaction."
    },
    fearful: {
      title: "Fearful",
      text: "A tucked tail with ears back and a cowering body is a dog asking for distance.",
      tip: "Give them a safe hiding spot and let them come to you in their own time."
    },
    alert: {
      title: "Alert and watchful",
      text: "Forward ears, a stiff tail and a tall posture mean your dog is tracking something.",
      tip: "Check what has their attention before you approach or add a cue."
    }
  };

  const MOOD_SCORES = {
    tail: {
      loose: { relaxed: 2, happy: 2 },
      fast: { playful: 2, happy: 1 },
      tucked: { fearful: 2, anxious: 2 },
      stiff: { alert: 2, anxious: 1 }
    },
    ears: {
      relaxed: { relaxed: 2 },
      forward: { alert: 2, playful: 1 },
      back: { fearful: 2, anxious: 1 }
    },
    posture: {
      loose: { happy: 2, relaxed: 1 },
      bow: { playful: 3 },
      cower: { fearful: 2, anxious: 2 },
      stiff: { alert: 2, anxious: 1 }
    }
  };

  const moodForm = document.querySelector("[data-mood-form]");
  const moodResult = document.querySelector("[data-mood-result]");
  if (moodForm && moodResult) {
    moodForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(moodForm).entries());
      const scores = {};
      ["tail", "ears", "posture"].forEach((part) => {
        const bucket = MOOD_SCORES[part][data[part]] || {};
        Object.keys(bucket).forEach((mood) => {
          scores[mood] = (scores[mood] || 0) + bucket[mood];
        });
      });
      const top = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0] || "relaxed";
      const mood = MOODS[top];
      moodResult.innerHTML =
        '<span class="quiz-step-label">Read</span>' +
        "<h3>" +
        escapeHtml(mood.title) +
        "</h3>" +
        "<p>" +
        escapeHtml(mood.text) +
        "</p>" +
        '<p class="mood-tip"><strong>Try this:</strong> ' +
        escapeHtml(mood.tip) +
        "</p>";
      moodResult.classList.add("has-result");
    });
  }
});
