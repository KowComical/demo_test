(() => {
  const MANIFEST_URL = "data/demo_manifest.json";
  const STORAGE_KEY = "dcc_pilot_demo_v0_session";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const els = {
    intro: $("#intro"),
    trialView: $("#trialView"),
    doneView: $("#doneView"),
    assetStatus: $("#assetStatus"),
    startForm: $("#startForm"),
    startButton: $("#startButton"),
    trialMeta: $("#trialMeta"),
    progressFill: $("#progressFill"),
    progressText: $("#progressText"),
    transcriptText: $("#transcriptText"),
    cardA: $("#cardA"),
    cardB: $("#cardB"),
    videoA: $("#videoA"),
    videoB: $("#videoB"),
    confidenceRow: $("#confidenceRow"),
    mismatchSelect: $("#mismatchSelect"),
    noteText: $("#noteText"),
    notSureButton: $("#notSureButton"),
    nextButton: $("#nextButton"),
    summaryGrid: $("#summaryGrid"),
    downloadJson: $("#downloadJson"),
    downloadCsv: $("#downloadCsv"),
    restartButton: $("#restartButton"),
  };

  let manifest = null;
  let session = null;
  let draft = null;
  let trialStartedAt = 0;

  function nowIso() {
    return new Date().toISOString();
  }

  function makeId(prefix) {
    const random =
      window.crypto && window.crypto.getRandomValues
        ? Array.from(window.crypto.getRandomValues(new Uint32Array(2)))
            .map((value) => value.toString(16).padStart(8, "0"))
            .join("")
        : Math.random().toString(16).slice(2);
    return `${prefix}_${Date.now().toString(36)}_${random}`;
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function groupByBase(trialPools) {
    return trialPools.reduce((groups, pool) => {
      if (!groups[pool.base_id]) groups[pool.base_id] = [];
      groups[pool.base_id].push(pool);
      return groups;
    }, {});
  }

  function sampleById(id) {
    const sample = manifest.samples[id];
    if (!sample) throw new Error(`Missing sample: ${id}`);
    return sample;
  }

  function titleCase(value) {
    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function setVisible(viewName) {
    els.intro.classList.toggle("hidden", viewName !== "intro");
    els.trialView.classList.toggle("hidden", viewName !== "trial");
    els.doneView.classList.toggle("hidden", viewName !== "done");
  }

  function setAssetStatus(label, statusClass) {
    els.assetStatus.textContent = label;
    els.assetStatus.classList.remove("ready", "error");
    if (statusClass) els.assetStatus.classList.add(statusClass);
  }

  function updateStartState() {
    els.startButton.disabled = !(manifest && els.startForm.checkValidity());
  }

  function populateMismatchOptions() {
    const options = manifest.ui?.mismatch_locations || [];
    els.mismatchSelect.replaceChildren();
    const first = document.createElement("option");
    first.value = "";
    first.textContent = "Select one";
    els.mismatchSelect.append(first);
    options.forEach((label) => {
      const option = document.createElement("option");
      option.value = label.toLowerCase().replaceAll(" / ", "_").replaceAll(" ", "_");
      option.textContent = label;
      els.mismatchSelect.append(option);
    });
  }

  async function loadManifest() {
    try {
      if (window.DEMO_MANIFEST) {
        manifest = window.DEMO_MANIFEST;
      } else {
        const response = await fetch(MANIFEST_URL, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        manifest = await response.json();
      }
      populateMismatchOptions();
      updateStartState();
      setAssetStatus("Ready", "ready");
    } catch (error) {
      setAssetStatus("Missing data", "error");
    els.startButton.disabled = true;
      console.error(error);
    }
  }

  function selectTrialPools(mode) {
    if (mode === "review") {
      return shuffle(manifest.trial_pools);
    }

    const groups = groupByBase(manifest.trial_pools);
    const onePerBase = Object.values(groups).map((group) => {
      return group[Math.floor(Math.random() * group.length)];
    });
    const count = manifest.ui?.participant_trial_count || onePerBase.length;
    return shuffle(onePerBase).slice(0, count);
  }

  function makeTrial(pool, index) {
    const positive = sampleById(pool.positive_sample_id);
    const negative = sampleById(pool.negative_sample_id);
    const positiveSide = Math.random() < 0.5 ? "A" : "B";
    const videoA = positiveSide === "A" ? positive : negative;
    const videoB = positiveSide === "A" ? negative : positive;

    return {
      trial_index: index + 1,
      trial_pool_id: pool.trial_pool_id,
      base_id: pool.base_id,
      speaker: pool.speaker,
      language: pool.language,
      transcript: pool.transcript,
      negative_type: pool.negative_type,
      positive_sample_id: positive.sample_id,
      negative_sample_id: negative.sample_id,
      positive_side: positiveSide,
      video_a_sample_id: videoA.sample_id,
      video_b_sample_id: videoB.sample_id,
      video_a_path: videoA.render_path,
      video_b_path: videoB.render_path,
    };
  }

  function startSession(form) {
    const data = new FormData(form);
    const mode = data.get("mode") || "participant";
    const pools = selectTrialPools(mode);

    session = {
      session_id: makeId("session"),
      manifest_version: manifest.version,
      manifest_built_at: manifest.built_at,
      started_at: nowIso(),
      completed_at: "",
      mode,
      participant: {
        english_level: data.get("english_level"),
        motion_background: data.get("motion_background"),
      },
      trial_count: pools.length,
      trials: pools.map(makeTrial),
      current_index: 0,
      responses: [],
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    showTrial();
  }

  function resetDraft() {
    draft = {
      choice_side: "",
      confidence: "",
      mismatch_location: "",
      note: "",
      started_at: nowIso(),
    };
    trialStartedAt = performance.now();
  }

  function currentTrial() {
    return session.trials[session.current_index];
  }

  function setChoice(choice) {
    draft.choice_side = choice;
    els.cardA.classList.toggle("selected", choice === "A");
    els.cardB.classList.toggle("selected", choice === "B");
    $$("[data-choice]").forEach((button) => {
      const selected = button.dataset.choice === choice;
      button.classList.toggle("selected", selected);
      button.textContent = selected ? `Selected ${button.dataset.choice}` : `Choose ${button.dataset.choice}`;
    });
    updateNextState();
  }

  function setConfidence(value) {
    draft.confidence = value;
    $$("[data-confidence]").forEach((button) => {
      button.classList.toggle("selected", button.dataset.confidence === value);
    });
    updateNextState();
  }

  function clearVideo(video) {
    video.pause();
    video.removeAttribute("src");
    video.load();
  }

  function showTrial() {
    if (session.current_index >= session.trial_count) {
      showDone();
      return;
    }

    resetDraft();
    const trial = currentTrial();
    const completed = session.current_index;
    const total = session.trial_count;
    const conditionLabel =
      session.mode === "review" ? ` · ${titleCase(trial.negative_type)}` : "";

    setVisible("trial");
    els.trialMeta.textContent = `Trial ${completed + 1} of ${total}${conditionLabel}`;
    els.progressText.textContent = `${completed} / ${total} answered`;
    els.progressFill.style.width = `${(completed / total) * 100}%`;
    els.transcriptText.textContent = trial.transcript;

    clearVideo(els.videoA);
    clearVideo(els.videoB);
    els.videoA.src = trial.video_a_path;
    els.videoB.src = trial.video_b_path;
    els.videoA.load();
    els.videoB.load();

    els.cardA.classList.remove("selected");
    els.cardB.classList.remove("selected");
    $$("[data-choice]").forEach((button) => {
      button.classList.remove("selected");
      button.textContent = `Choose ${button.dataset.choice}`;
    });
    $$("[data-confidence]").forEach((button) => button.classList.remove("selected"));
    els.mismatchSelect.value = "";
    els.noteText.value = "";
    updateNextState();
  }

  function updateNextState() {
    els.nextButton.disabled = !(draft?.choice_side && draft?.confidence);
  }

  function submitTrial() {
    if (!draft.choice_side || !draft.confidence) return;

    const trial = currentTrial();
    const responseTimeMs = Math.round(performance.now() - trialStartedAt);
    const chosenSampleId =
      draft.choice_side === "A"
        ? trial.video_a_sample_id
        : draft.choice_side === "B"
          ? trial.video_b_sample_id
          : "";
    const correct =
      draft.choice_side === "not_sure" ? null : draft.choice_side === trial.positive_side;

    session.responses.push({
      session_id: session.session_id,
      trial_index: trial.trial_index,
      trial_pool_id: trial.trial_pool_id,
      base_id: trial.base_id,
      speaker: trial.speaker,
      language: trial.language,
      negative_type: trial.negative_type,
      positive_sample_id: trial.positive_sample_id,
      negative_sample_id: trial.negative_sample_id,
      video_a_sample_id: trial.video_a_sample_id,
      video_b_sample_id: trial.video_b_sample_id,
      positive_side: trial.positive_side,
      choice_side: draft.choice_side,
      chosen_sample_id: chosenSampleId,
      correct,
      confidence: Number(draft.confidence),
      mismatch_location: els.mismatchSelect.value,
      note: els.noteText.value.trim(),
      response_time_ms: responseTimeMs,
      shown_at: draft.started_at,
      answered_at: nowIso(),
    });

    session.current_index += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    showTrial();
  }

  function showDone() {
    session.completed_at = session.completed_at || nowIso();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    clearVideo(els.videoA);
    clearVideo(els.videoB);
    setVisible("done");
    renderSummary();
  }

  function renderSummary() {
    const answered = session.responses.length;
    const scored = session.responses.filter((row) => row.correct !== null);
    const correct = scored.filter((row) => row.correct).length;
    const accuracy = scored.length ? `${Math.round((correct / scored.length) * 100)}%` : "n/a";
    const avgConfidence = answered
      ? (
          session.responses.reduce((sum, row) => sum + Number(row.confidence || 0), 0) /
          answered
        ).toFixed(1)
      : "n/a";
    const items = [
      ["Mode", titleCase(session.mode)],
      ["Answered", `${answered} / ${session.trial_count}`],
      ["Accuracy", accuracy],
      ["Avg confidence", avgConfidence],
    ];

    els.summaryGrid.replaceChildren();
    items.forEach(([label, value]) => {
      const item = document.createElement("div");
      item.className = "summary-item";
      const span = document.createElement("span");
      span.textContent = label;
      const strong = document.createElement("strong");
      strong.textContent = value;
      item.append(span, strong);
      els.summaryGrid.append(item);
    });
  }

  function exportObject() {
    return {
      exported_at: nowIso(),
      manifest: {
        version: manifest.version,
        built_at: manifest.built_at,
        sample_count: Object.keys(manifest.samples).length,
        trial_pool_count: manifest.trial_pools.length,
      },
      session,
    };
  }

  function csvEscape(value) {
    if (value === null || value === undefined) return "";
    const stringValue = String(value);
    if (/[",\n]/.test(stringValue)) {
      return `"${stringValue.replaceAll('"', '""')}"`;
    }
    return stringValue;
  }

  function responsesCsv() {
    const fields = [
      "session_id",
      "manifest_version",
      "mode",
      "english_level",
      "motion_background",
      "trial_index",
      "trial_pool_id",
      "base_id",
      "speaker",
      "language",
      "negative_type",
      "positive_sample_id",
      "negative_sample_id",
      "video_a_sample_id",
      "video_b_sample_id",
      "positive_side",
      "choice_side",
      "chosen_sample_id",
      "correct",
      "confidence",
      "mismatch_location",
      "note",
      "response_time_ms",
      "shown_at",
      "answered_at",
    ];
    const rows = session.responses.map((row) => ({
      ...row,
      manifest_version: session.manifest_version,
      mode: session.mode,
      english_level: session.participant.english_level,
      motion_background: session.participant.motion_background,
    }));
    return [
      fields.join(","),
      ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(",")),
    ].join("\n");
  }

  function download(filename, mimeType, content) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function restart() {
    localStorage.removeItem(STORAGE_KEY);
    session = null;
    draft = null;
    setVisible("intro");
    els.startForm.reset();
    const participantMode = els.startForm.querySelector('input[name="mode"][value="participant"]');
    if (participantMode) participantMode.checked = true;
    updateStartState();
  }

  ["change", "input"].forEach((eventName) => {
    els.startForm.addEventListener(eventName, updateStartState);
  });

  els.startForm.addEventListener("submit", (event) => {
    event.preventDefault();
    startSession(event.currentTarget);
  });

  $$("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => setChoice(button.dataset.choice));
  });

  $$("[data-confidence]").forEach((button) => {
    button.addEventListener("click", () => setConfidence(button.dataset.confidence));
  });

  els.notSureButton.addEventListener("click", () => {
    setChoice("not_sure");
    if (!draft.confidence) setConfidence("1");
  });

  els.nextButton.addEventListener("click", submitTrial);

  [els.videoA, els.videoB].forEach((video) => {
    video.addEventListener("play", () => {
      [els.videoA, els.videoB].forEach((other) => {
        if (other !== video) other.pause();
      });
    });
  });

  els.downloadJson.addEventListener("click", () => {
    download(
      `${session.session_id}_responses.json`,
      "application/json",
      `${JSON.stringify(exportObject(), null, 2)}\n`,
    );
  });

  els.downloadCsv.addEventListener("click", () => {
    download(`${session.session_id}_responses.csv`, "text/csv", `${responsesCsv()}\n`);
  });

  els.restartButton.addEventListener("click", restart);

  const params = new URLSearchParams(window.location.search);
  if (params.get("review") === "all") {
    const reviewMode = els.startForm.querySelector('input[name="mode"][value="review"]');
    if (reviewMode) reviewMode.checked = true;
  }

  loadManifest();
})();
