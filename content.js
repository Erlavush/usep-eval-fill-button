(() => {
  if (window.__usepEvalFillButtonInstalled) {
    return;
  }

  window.__usepEvalFillButtonInstalled = true;

  const LEGACY_ROOT_ID = "usep-eval-fill-button-root";
  const ROOT_ID = "usep-eval-fill-panel-root";
  const STORAGE_KEY = "usepEvalFillSettings";
  const DEFAULT_SETTINGS = {
    percentages: {
      stronglyAgree: 70,
      agree: 30,
      neutral: 0,
    },
    numericAnswers: ["12", "3", "92"],
    commentAnswers: [
      "Everything is beneficial. I love the course! < 3",
      "nothing much < 3",
      "nothing much < 3",
    ],
    facultyPercentages: {
      always: 80,
      often: 20,
      sometimes: 0,
      seldom: 0,
      never: 0,
    },
    facultyComment: "Very good instructor! Keeps the class active.",
  };

  const RADIO_OPTIONS = {
    stronglyAgree: {
      index: 1,
      label: "Strongly Agree",
    },
    agree: {
      index: 2,
      label: "Agree",
    },
    neutral: {
      index: 3,
      label: "Neutral",
    },
  };

  const FACULTY_RADIO_OPTIONS = {
    always: {
      index: 30,
      label: "Always Manifested",
    },
    often: {
      index: 29,
      label: "Often Manifested",
    },
    sometimes: {
      index: 28,
      label: "Sometimes Manifested",
    },
    seldom: {
      index: 27,
      label: "Seldom Manifested",
    },
    never: {
      index: 26,
      label: "Never/Rarely Manifested",
    },
  };

  function getEvaluationType() {
    if (location.hostname !== "portal.usep.edu.ph") {
      return null;
    }
    if (location.pathname.includes("/university-services-evaluation/subject")) {
      return "subject";
    }
    if (location.pathname.includes("/university-services-evaluation/faculty")) {
      return "faculty";
    }
    return null;
  }

  function isEvaluationPage() {
    return getEvaluationType() !== null;
  }

  function hideLegacyRoot() {
    const legacyRoot = document.getElementById(LEGACY_ROOT_ID);
    if (!legacyRoot) {
      return;
    }

    legacyRoot.style.display = "none";
    legacyRoot.setAttribute("aria-hidden", "true");
  }

  function cloneDefaultSettings() {
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }

  function loadSettings() {
    const defaults = cloneDefaultSettings();

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        percentages: {
          stronglyAgree: Number.isFinite(Number(saved.percentages?.stronglyAgree))
            ? Number(saved.percentages.stronglyAgree)
            : defaults.percentages.stronglyAgree,
          agree: Number.isFinite(Number(saved.percentages?.agree))
            ? Number(saved.percentages.agree)
            : defaults.percentages.agree,
          neutral: Number.isFinite(Number(saved.percentages?.neutral))
            ? Number(saved.percentages.neutral)
            : defaults.percentages.neutral,
        },
        numericAnswers: [0, 1, 2].map((index) => {
          return String(saved.numericAnswers?.[index] ?? defaults.numericAnswers[index]);
        }),
        commentAnswers: [0, 1, 2].map((index) => {
          return String(saved.commentAnswers?.[index] ?? defaults.commentAnswers[index]);
        }),
        facultyPercentages: {
          always: Number.isFinite(Number(saved.facultyPercentages?.always))
            ? Number(saved.facultyPercentages.always)
            : defaults.facultyPercentages.always,
          often: Number.isFinite(Number(saved.facultyPercentages?.often))
            ? Number(saved.facultyPercentages.often)
            : defaults.facultyPercentages.often,
          sometimes: Number.isFinite(Number(saved.facultyPercentages?.sometimes))
            ? Number(saved.facultyPercentages.sometimes)
            : defaults.facultyPercentages.sometimes,
          seldom: Number.isFinite(Number(saved.facultyPercentages?.seldom))
            ? Number(saved.facultyPercentages.seldom)
            : defaults.facultyPercentages.seldom,
          never: Number.isFinite(Number(saved.facultyPercentages?.never))
            ? Number(saved.facultyPercentages.never)
            : defaults.facultyPercentages.never,
        },
        facultyComment: saved.facultyComment !== undefined
          ? String(saved.facultyComment)
          : defaults.facultyComment,
      };
    } catch {
      return defaults;
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function naturalRadioSort(a, b) {
    const aIndex = Number((a.id || "").split("-").pop());
    const bIndex = Number((b.id || "").split("-").pop());
    if (Number.isFinite(aIndex) && Number.isFinite(bIndex)) {
      return aIndex - bIndex;
    }
    return 0;
  }

  function setElementValue(element, value) {
    const descriptor = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(element),
      "value"
    );

    if (descriptor && typeof descriptor.set === "function") {
      descriptor.set.call(element, value);
    } else {
      element.value = value;
    }

    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  function shuffle(values) {
    const copy = [...values];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function getText(node) {
    return (node?.innerText || "").trim().replace(/\s+/g, " ");
  }

  function getQuestionText(textarea) {
    let node = textarea.parentElement;

    for (let depth = 0; node && depth < 6; depth += 1, node = node.parentElement) {
      const text = getText(node);
      if (text) {
        return text;
      }
    }

    return "";
  }

  function cleanQuestionText(question) {
    return question.replace(/\bREQUIRED\b/gi, "").trim().replace(/\s+/g, " ");
  }

  function getTextareas(evalType) {
    if (evalType === "subject") {
      return [
        ...document.querySelectorAll(
          'textarea[id^="course-evaluation-paramQuestion-"]'
        ),
      ].sort((a, b) => {
        const aNumber = Number((a.id || "").split("-").pop());
        const bNumber = Number((b.id || "").split("-").pop());
        return aNumber - bNumber;
      });
    } else {
      return [
        ...document.querySelectorAll(
          'textarea[id^="faculty-evaluation=comments-"]'
        ),
      ];
    }
  }

  function getQuestionLabels() {
    const textareas = getTextareas("subject");
    const numericQuestions = textareas.slice(0, 3).map(getQuestionText);
    const commentQuestions = textareas.slice(3, 6).map(getQuestionText);

    return {
      numericQuestions,
      commentQuestions,
    };
  }

  function getRadioGroups() {
    return [
      ...document.querySelectorAll('input[type="radio"][name^="radio-"]'),
    ].reduce((groups, radio) => {
      if (!radio.disabled) {
        if (!groups.has(radio.name)) {
          groups.set(radio.name, []);
        }
        groups.get(radio.name).push(radio);
      }
      return groups;
    }, new Map());
  }

  function getSortedGroupNames(radioGroups) {
    return [...radioGroups.keys()].sort((a, b) => {
      const aNumber = Number(a.replace(/^radio-/, ""));
      const bNumber = Number(b.replace(/^radio-/, ""));
      return aNumber - bNumber;
    });
  }

  function validatePercentages(percentages, type) {
    const keys = type === "subject"
      ? ["stronglyAgree", "agree", "neutral"]
      : ["always", "often", "sometimes", "seldom", "never"];

    const values = keys.map((key) => percentages[key]);

    if (values.some((value) => !Number.isFinite(value) || value < 0 || value > 100)) {
      throw new Error("Percentages must be numbers from 0 to 100.");
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    if (Math.abs(total - 100) > 0.001) {
      throw new Error(`Percentages must equal 100%. Current total is ${total}%.`);
    }
  }

  function buildChoices(groupCount, percentages, type) {
    validatePercentages(percentages, type);

    const optionKeys = type === "subject"
      ? ["stronglyAgree", "agree", "neutral"]
      : ["always", "often", "sometimes", "seldom", "never"];

    const rawCounts = optionKeys.map((key) => {
      const exact = (groupCount * percentages[key]) / 100;
      return {
        key,
        floor: Math.floor(exact),
        remainder: exact - Math.floor(exact),
      };
    });

    let remaining = groupCount - rawCounts.reduce((sum, item) => sum + item.floor, 0);
    rawCounts
      .sort((a, b) => b.remainder - a.remainder)
      .forEach((item) => {
        if (remaining > 0) {
          item.floor += 1;
          remaining -= 1;
        }
      });

    return shuffle(
      rawCounts.flatMap((item) => {
        return Array(item.floor).fill(item.key);
      })
    );
  }

  function readPanelSettings(shadowRoot) {
    const evalType = getEvaluationType();
    const currentSettings = loadSettings();

    const percentage = (key) => {
      const el = shadowRoot.querySelector(`[data-percent="${key}"]`);
      return el ? Number(el.value) : 0;
    };
    const value = (selector) => {
      const el = shadowRoot.querySelector(selector);
      return el ? el.value : "";
    };

    if (evalType === "subject") {
      return {
        ...currentSettings,
        percentages: {
          stronglyAgree: percentage("stronglyAgree"),
          agree: percentage("agree"),
          neutral: percentage("neutral"),
        },
        numericAnswers: [0, 1, 2].map((index) => value(`[data-numeric="${index}"]`)),
        commentAnswers: [0, 1, 2].map((index) => value(`[data-comment="${index}"]`)),
      };
    } else {
      return {
        ...currentSettings,
        facultyPercentages: {
          always: percentage("always"),
          often: percentage("often"),
          sometimes: percentage("sometimes"),
          seldom: percentage("seldom"),
          never: percentage("never"),
        },
        facultyComment: value(`[data-faculty-comment]`),
      };
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/"/g, "&quot;");
  }

  function fillEvaluationForm(settings) {
    const evalType = getEvaluationType();
    const percentages = evalType === "subject" ? settings.percentages : settings.facultyPercentages;
    const radioOptions = evalType === "subject" ? RADIO_OPTIONS : FACULTY_RADIO_OPTIONS;

    validatePercentages(percentages, evalType);

    const radioGroups = getRadioGroups();
    const groupNames = getSortedGroupNames(radioGroups);
    const textareas = getTextareas(evalType);

    if (groupNames.length === 0 && textareas.length === 0) {
      throw new Error("No evaluation inputs found on this page.");
    }

    const choices = buildChoices(groupNames.length, percentages, evalType);
    const selected = groupNames.map((groupName, index) => {
      const radios = radioGroups.get(groupName).sort(naturalRadioSort);
      const choice = choices[index];
      const radio = radios.find((item) => {
        return Number((item.id || "").split("-").pop()) === radioOptions[choice].index;
      });

      if (!radio) {
        return {
          groupName,
          choice,
          selected: false,
        };
      }

      radio.click();
      radio.dispatchEvent(new Event("input", { bubbles: true }));
      radio.dispatchEvent(new Event("change", { bubbles: true }));

      return {
        groupName,
        choice,
        selected: radio.checked,
      };
    });

    const filledTextareas = textareas.map((textarea, index) => {
      const value = evalType === "subject"
        ? (index < settings.numericAnswers.length
            ? settings.numericAnswers[index]
            : settings.commentAnswers[index - settings.numericAnswers.length] || "")
        : settings.facultyComment || "";

      setElementValue(textarea, value);
      return {
        id: textarea.id || "",
        value,
        actualValue: textarea.value,
      };
    });

    const uncheckedGroups = selected.filter((item) => !item.selected);
    if (uncheckedGroups.length > 0) {
      throw new Error(
        `Some radio groups were not checked: ${uncheckedGroups
          .map((item) => item.groupName)
          .join(", ")}`
      );
    }

    const counts = evalType === "subject"
      ? { stronglyAgree: 0, agree: 0, neutral: 0 }
      : { always: 0, often: 0, sometimes: 0, seldom: 0, never: 0 };

    selected.forEach((item) => {
      counts[item.choice] += 1;
    });

    return {
      counts,
      textareaCount: filledTextareas.length,
    };
  }

  function setStatus(shadowRoot, text, state) {
    const evalType = getEvaluationType();
    const status = shadowRoot.querySelector("[data-usep-status]");
    const fillButton = shadowRoot.querySelector("[data-usep-fill]");
    const settings = readPanelSettings(shadowRoot);

    let total = 0;
    if (evalType === "subject") {
      total =
        settings.percentages.stronglyAgree +
        settings.percentages.agree +
        settings.percentages.neutral;
    } else {
      total =
        settings.facultyPercentages.always +
        settings.facultyPercentages.often +
        settings.facultyPercentages.sometimes +
        settings.facultyPercentages.seldom +
        settings.facultyPercentages.never;
    }

    status.textContent = text || `Total: ${total}%`;
    status.dataset.state = state || (Math.abs(total - 100) <= 0.001 ? "ok" : "error");
    fillButton.disabled = state === "busy" || Math.abs(total - 100) > 0.001;
  }

  function renderLabels(shadowRoot) {
    const evalType = getEvaluationType();
    if (evalType !== "subject") {
      return;
    }

    const { numericQuestions, commentQuestions } = getQuestionLabels();

    numericQuestions.forEach((question, index) => {
      const label = shadowRoot.querySelector(`[data-numeric-label="${index}"]`);
      if (label && question) {
        const cleanedQuestion = cleanQuestionText(question);
        label.textContent = cleanedQuestion;
        label.title = cleanedQuestion;
      }
    });

    commentQuestions.forEach((question, index) => {
      const label = shadowRoot.querySelector(`[data-comment-label="${index}"]`);
      if (label && question) {
        const cleanedQuestion = cleanQuestionText(question);
        label.textContent = cleanedQuestion;
        label.title = cleanedQuestion;
      }
    });
  }

  function installButton() {
    hideLegacyRoot();

    const existingRoot = document.getElementById(ROOT_ID);

    if (!isEvaluationPage()) {
      existingRoot?.remove();
      return;
    }

    if (existingRoot || !document.body) {
      return;
    }

    const settings = loadSettings();
    const evalType = getEvaluationType();
    const host = document.createElement("div");
    host.id = ROOT_ID;
    host.style.position = "fixed";
    host.style.right = "18px";
    host.style.bottom = "18px";
    host.style.zIndex = "2147483647";

    const shadowRoot = host.attachShadow({ mode: "closed" });

    let bodyHtml = "";
    if (evalType === "subject") {
      bodyHtml = `
          <div class="section">
            <div class="section-title">Ratings</div>
            <div class="row">
              <label for="usep-strongly-agree">Strongly Agree %</label>
              <input class="percent-input" id="usep-strongly-agree" data-percent="stronglyAgree" type="number" min="0" max="100" step="1" value="${escapeAttribute(settings.percentages.stronglyAgree)}">
            </div>
            <div class="row">
              <label for="usep-agree">Agree %</label>
              <input class="percent-input" id="usep-agree" data-percent="agree" type="number" min="0" max="100" step="1" value="${escapeAttribute(settings.percentages.agree)}">
            </div>
            <div class="row">
              <label for="usep-neutral">Neutral %</label>
              <input class="percent-input" id="usep-neutral" data-percent="neutral" type="number" min="0" max="100" step="1" value="${escapeAttribute(settings.percentages.neutral)}">
            </div>
          </div>

          <div class="section">
            <div class="section-title">Answer to numerical questions</div>
            <div class="row">
              <label data-numeric-label="0" for="usep-numeric-0">Question 1</label>
              <input id="usep-numeric-0" data-numeric="0" type="text" value="${escapeAttribute(settings.numericAnswers[0])}">
            </div>
            <div class="row">
              <label data-numeric-label="1" for="usep-numeric-1">Question 2</label>
              <input id="usep-numeric-1" data-numeric="1" type="text" value="${escapeAttribute(settings.numericAnswers[1])}">
            </div>
            <div class="row">
              <label data-numeric-label="2" for="usep-numeric-2">Question 3</label>
              <input id="usep-numeric-2" data-numeric="2" type="text" value="${escapeAttribute(settings.numericAnswers[2])}">
            </div>
          </div>

          <div class="section">
            <div class="section-title">Answer to forms</div>
            <label data-comment-label="0" for="usep-comment-0">Q1</label>
            <textarea id="usep-comment-0" data-comment="0">${escapeHtml(settings.commentAnswers[0])}</textarea>
            <label data-comment-label="1" for="usep-comment-1">Q2</label>
            <textarea id="usep-comment-1" data-comment="1">${escapeHtml(settings.commentAnswers[1])}</textarea>
            <label data-comment-label="2" for="usep-comment-2">Q3</label>
            <textarea id="usep-comment-2" data-comment="2">${escapeHtml(settings.commentAnswers[2])}</textarea>
          </div>
      `;
    } else {
      bodyHtml = `
          <div class="section">
            <div class="section-title">Ratings</div>
            <div class="row">
              <label for="usep-always">Always Manifested %</label>
              <input class="percent-input" id="usep-always" data-percent="always" type="number" min="0" max="100" step="1" value="${escapeAttribute(settings.facultyPercentages.always)}">
            </div>
            <div class="row">
              <label for="usep-often">Often Manifested %</label>
              <input class="percent-input" id="usep-often" data-percent="often" type="number" min="0" max="100" step="1" value="${escapeAttribute(settings.facultyPercentages.often)}">
            </div>
            <div class="row">
              <label for="usep-sometimes">Sometimes Manifested %</label>
              <input class="percent-input" id="usep-sometimes" data-percent="sometimes" type="number" min="0" max="100" step="1" value="${escapeAttribute(settings.facultyPercentages.sometimes)}">
            </div>
            <div class="row">
              <label for="usep-seldom">Seldom Manifested %</label>
              <input class="percent-input" id="usep-seldom" data-percent="seldom" type="number" min="0" max="100" step="1" value="${escapeAttribute(settings.facultyPercentages.seldom)}">
            </div>
            <div class="row">
              <label for="usep-never">Never/Rarely %</label>
              <input class="percent-input" id="usep-never" data-percent="never" type="number" min="0" max="100" step="1" value="${escapeAttribute(settings.facultyPercentages.never)}">
            </div>
          </div>

          <div class="section">
            <div class="section-title">Comments / Suggestions</div>
            <label for="usep-faculty-comment">Other Comments and Suggestions</label>
            <textarea id="usep-faculty-comment" data-faculty-comment>${escapeHtml(settings.facultyComment)}</textarea>
          </div>
      `;
    }

    const titleText = evalType === "subject" ? "Fill evaluation form" : "Fill faculty form";

    shadowRoot.innerHTML = `
      <style>
        :host {
          all: initial;
          color-scheme: light;
          font-family: Quicksand, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          --usep-maroon: #9b1f31;
          --usep-maroon-dark: #731725;
          --usep-yellow: #ffd54a;
        }

        * {
          box-sizing: border-box;
        }

        .panel {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.24);
          color: #111827;
          display: grid;
          gap: 10px;
          max-height: calc(100vh - 36px);
          max-height: calc(100dvh - 36px);
          overflow-x: hidden;
          overflow-y: auto;
          padding: 12px;
          scrollbar-gutter: stable;
          width: min(340px, calc(100vw - 36px));
        }

        .header {
          align-items: center;
          display: flex;
          gap: 8px;
          justify-content: space-between;
        }

        .title {
          color: var(--usep-maroon);
          font: 700 14px/1.2 Quicksand, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .collapse {
          background: var(--usep-maroon);
          border: 1px solid var(--usep-maroon-dark);
          border-radius: 6px;
          color: var(--usep-yellow);
          cursor: pointer;
          font: 700 12px/1 Quicksand, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          height: 28px;
          padding: 0 8px;
        }

        .collapse:hover {
          background: var(--usep-maroon-dark);
        }

        .body {
          display: grid;
          gap: 10px;
        }

        .section {
          border-top: 1px solid #e5e7eb;
          display: grid;
          gap: 8px;
          padding-top: 10px;
        }

        .section:first-child {
          border-top: 0;
          padding-top: 0;
        }

        .section-title {
          color: #334155;
          font: 700 12px/1.2 Quicksand, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .row {
          align-items: start;
          display: grid;
          gap: 8px;
          grid-template-columns: 1fr 78px;
        }

        label {
          color: #111827;
          font: 12px/1.35 Quicksand, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          min-width: 0;
          padding-top: 7px;
          white-space: normal;
        }

        input,
        textarea {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          color: #111827;
          font: 12px/1.35 Quicksand, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          min-width: 0;
          outline: none;
          padding: 7px 8px;
          width: 100%;
        }

        input:focus,
        textarea:focus {
          border-color: var(--usep-maroon);
          box-shadow: 0 0 0 2px rgba(155, 31, 49, 0.15);
        }

        textarea {
          min-height: 52px;
          resize: vertical;
        }

        .percent-input {
          text-align: right;
        }

        .actions {
          background: #ffffff;
          display: grid;
          gap: 8px;
          grid-template-columns: 1fr 1fr;
          padding-top: 8px;
          position: sticky;
          bottom: -12px;
        }

        .primary,
        .secondary,
        .fab {
          appearance: none;
          border-radius: 8px;
          cursor: pointer;
          font: 700 13px/1 Quicksand, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding: 10px 12px;
        }

        .primary,
        .fab {
          background: var(--usep-maroon);
          border: 1px solid var(--usep-maroon-dark);
          color: var(--usep-yellow);
        }

        .primary:hover,
        .fab:hover {
          background: var(--usep-maroon-dark);
        }

        .primary:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .secondary {
          background: var(--usep-maroon);
          border: 1px solid var(--usep-maroon-dark);
          color: var(--usep-yellow);
        }

        .secondary:hover {
          background: var(--usep-maroon-dark);
        }

        [data-usep-status] {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          color: #334155;
          font: 12px/1.35 Quicksand, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding: 8px 10px;
        }

        [data-state="error"] {
          background: #fff7f7;
          border-color: #fecaca;
          color: #991b1b;
        }

        [data-state="done"] {
          background: #f0fdf4;
          border-color: #bbf7d0;
          color: #166534;
        }

        [data-state="busy"] {
          background: #fff8db;
          border-color: #fde68a;
          color: var(--usep-maroon);
        }

        .fab {
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.28);
          display: none;
          min-width: 112px;
        }

        :host([data-collapsed="true"]) .panel {
          display: none;
        }

        :host([data-collapsed="true"]) .fab {
          display: block;
        }
      </style>
      <button class="fab" type="button" data-expand>Maximize</button>
      <div class="panel">
        <div class="header">
          <div class="title">${titleText}</div>
          <button class="collapse" type="button" data-collapse>Minimize</button>
        </div>

        <div class="body">
          ${bodyHtml}
          <div data-usep-status>Total: 100%</div>
          <div class="actions">
            <button class="secondary" type="button" data-reset>Reset</button>
            <button class="primary" type="button" data-usep-fill>Fill</button>
          </div>
        </div>
      </div>
    `;

    function handleSettingsChange() {
      try {
        const nextSettings = readPanelSettings(shadowRoot);
        saveSettings(nextSettings);
        setStatus(shadowRoot);
      } catch (error) {
        setStatus(shadowRoot, error.message || "Invalid settings.", "error");
      }
    }

    shadowRoot.querySelectorAll("input, textarea").forEach((input) => {
      input.addEventListener("input", handleSettingsChange);
      input.addEventListener("change", handleSettingsChange);
    });

    shadowRoot.querySelector("[data-collapse]").addEventListener("click", () => {
      host.dataset.collapsed = "true";
    });

    shadowRoot.querySelector("[data-expand]").addEventListener("click", () => {
      host.dataset.collapsed = "false";
    });

    shadowRoot.querySelector("[data-reset]").addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      host.remove();
      window.__usepEvalFillButtonInstalled = false;
      installButton();
    });

    shadowRoot.querySelector("[data-usep-fill]").addEventListener("click", () => {
      try {
        const nextSettings = readPanelSettings(shadowRoot);
        const currentPercentages = evalType === "subject"
          ? nextSettings.percentages
          : nextSettings.facultyPercentages;

        validatePercentages(currentPercentages, evalType);
        saveSettings(nextSettings);
        setStatus(shadowRoot, "Filling...", "busy");
        const summary = fillEvaluationForm(nextSettings);

        const doneText = evalType === "subject"
          ? `Done: ${summary.counts.stronglyAgree} Strongly Agree, ${summary.counts.agree} Agree, ${summary.counts.neutral} Neutral.`
          : `Done: ${summary.counts.always} Always, ${summary.counts.often} Often, ${summary.counts.sometimes} Sometimes, ${summary.counts.seldom} Seldom, ${summary.counts.never} Never.`;

        setStatus(
          shadowRoot,
          `${doneText} Submit was not clicked.`,
          "done"
        );
      } catch (error) {
        setStatus(shadowRoot, error.message || "Fill failed.", "error");
      }
    });

    document.body.appendChild(host);
    renderLabels(shadowRoot);
    setStatus(shadowRoot);
  }

  installButton();
  setInterval(installButton, 1000);
})();
