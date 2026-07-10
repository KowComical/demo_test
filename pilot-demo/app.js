(() => {
  const MANIFEST_URL = "data/demo_manifest.json";
  const STORAGE_KEY = "dcc_pilot_demo_v0_session";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const params = new URLSearchParams(window.location.search);
  const sessionMode = params.get("review") === "all" ? "review" : "participant";

  const els = {
    trialView: $("#trialView"),
    doneView: $("#doneView"),
    trialMeta: $("#trialMeta"),
    progressFill: $("#progressFill"),
    progressText: $("#progressText"),
    transcriptText: $("#transcriptText"),
    mediaStatus: $("#mediaStatus"),
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
  let mediaReady = false;
  let currentVideoToken = 0;
  let videoReady = { A: false, B: false };

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
    els.trialView.classList.toggle("hidden", viewName !== "trial");
    els.doneView.classList.toggle("hidden", viewName !== "done");
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
      if (!restoreSession()) startSession(sessionMode);
    } catch (error) {
      showLoadError();
      console.error(error);
    }
  }

  function showLoadError() {
    setVisible("trial");
    els.trialMeta.textContent = "Demo unavailable";
    els.progressText.textContent = "0 / 0";
    els.progressFill.style.width = "0%";
    els.transcriptText.textContent = "The demo data could not be loaded. Please refresh the page.";
    [els.videoA, els.videoB].forEach(clearVideo);
    $$("[data-choice], [data-confidence]").forEach((button) => {
      button.disabled = true;
    });
    els.mismatchSelect.disabled = true;
    els.noteText.disabled = true;
    els.notSureButton.disabled = true;
    els.nextButton.disabled = true;
  }

  function selectTrialPools(mode) {
    if (mode === "review") {
      const count = manifest.ui?.review_trial_count || manifest.trial_pools.length;
      return shuffle(manifest.trial_pools).slice(0, count);
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

  function startSession(mode) {
    const pools = selectTrialPools(mode);

    session = {
      session_id: makeId("session"),
      manifest_version: manifest.version,
      manifest_built_at: manifest.built_at,
      started_at: nowIso(),
      completed_at: "",
      mode,
      trial_count: pools.length,
      trials: pools.map(makeTrial),
      current_index: 0,
      responses: [],
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    showTrial();
  }

  function restoreSession() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || saved.manifest_version !== manifest.version || saved.mode !== sessionMode) {
        return false;
      }
      session = saved;
      if (session.completed_at || session.current_index >= session.trial_count) {
        showDone();
      } else {
        showTrial();
      }
      return true;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
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
    els.notSureButton.classList.toggle("selected", choice === "not_sure");
    $$("[data-choice]").forEach((button) => {
      const selected = button.dataset.choice === choice;
      button.classList.toggle("selected", selected);
      button.textContent = selected ? `Selected ${button.dataset.choice}` : `Choose ${button.dataset.choice}`;
    });
    if (choice === "not_sure") {
      draft.confidence = "";
      $$("[data-confidence]").forEach((button) => button.classList.remove("selected"));
    }
    updateNextState();
  }

  function setConfidence(value) {
    if (draft.choice_side === "not_sure") {
      setChoice("");
    }
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
    currentVideoToken += 1;
    videoReady = { A: false, B: false };
    mediaReady = false;
    const trial = currentTrial();
    const completed = session.current_index;
    const total = session.trial_count;
    const conditionLabel =
      session.mode === "review" ? ` · ${titleCase(trial.negative_type)}` : "";

    setVisible("trial");
    setMediaStatus("Loading videos...", false);
    setResponseControlsEnabled(false);
    els.trialMeta.textContent = `Trial ${completed + 1} of ${total}${conditionLabel}`;
    els.progressText.textContent = `${completed} / ${total} answered`;
    els.progressFill.style.width = `${(completed / total) * 100}%`;
    els.nextButton.textContent = completed + 1 === total ? "Finish" : "Next";
    els.transcriptText.textContent = trial.transcript;

    clearVideo(els.videoA);
    clearVideo(els.videoB);
    els.videoA.dataset.side = "A";
    els.videoB.dataset.side = "B";
    els.videoA.dataset.token = String(currentVideoToken);
    els.videoB.dataset.token = String(currentVideoToken);
    els.videoA.src = trial.video_a_path;
    els.videoB.src = trial.video_b_path;
    els.videoA.load();
    els.videoB.load();

    els.cardA.classList.remove("selected");
    els.cardB.classList.remove("selected");
    els.notSureButton.classList.remove("selected");
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
    if (!mediaReady || !draft?.choice_side) {
      els.nextButton.disabled = true;
      return;
    }
    els.nextButton.disabled = draft.choice_side !== "not_sure" && !draft.confidence;
  }

  function submitTrial() {
    if (els.nextButton.disabled) return;

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
      confidence: draft.confidence ? Number(draft.confidence) : null,
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
    const confidenceRows = session.responses.filter((row) => Number.isFinite(row.confidence));
    const avgConfidence = confidenceRows.length
      ? (
          confidenceRows.reduce((sum, row) => sum + Number(row.confidence || 0), 0) /
          confidenceRows.length
        ).toFixed(1)
      : "n/a";
    const items = [
      ["Mode", titleCase(session.mode)],
      ["Answered", `${answered} / ${session.trial_count}`],
      ["Avg confidence", avgConfidence],
    ];
    if (session.mode === "review") {
      items.splice(2, 0, ["Accuracy", accuracy]);
    }

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
      "session_started_at",
      "session_completed_at",
      "trial_count",
      "trial_index",
      "trial_pool_id",
      "base_id",
      "speaker",
      "language",
      "transcript",
      "negative_type",
      "positive_sample_id",
      "negative_sample_id",
      "video_a_sample_id",
      "video_b_sample_id",
      "video_a_path",
      "video_b_path",
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
    const trialByIndex = new Map(session.trials.map((trial) => [trial.trial_index, trial]));
    const rows = session.responses.map((row) => ({
      ...row,
      manifest_version: session.manifest_version,
      mode: session.mode,
      session_started_at: session.started_at,
      session_completed_at: session.completed_at,
      trial_count: session.trial_count,
      transcript: trialByIndex.get(row.trial_index)?.transcript || "",
      video_a_path: trialByIndex.get(row.trial_index)?.video_a_path || "",
      video_b_path: trialByIndex.get(row.trial_index)?.video_b_path || "",
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
    startSession(sessionMode);
  }

  function setResponseControlsEnabled(enabled) {
    $$("[data-choice], [data-confidence]").forEach((button) => {
      button.disabled = !enabled;
    });
    els.mismatchSelect.disabled = !enabled;
    els.noteText.disabled = !enabled;
    els.notSureButton.disabled = !enabled;
  }

  function setMediaStatus(message, hidden) {
    els.mediaStatus.textContent = message;
    els.mediaStatus.classList.toggle("hidden", hidden);
  }

  function markVideoReady(video) {
    const token = Number(video.dataset.token || 0);
    if (token !== currentVideoToken) return;
    videoReady[video.dataset.side] = true;
    if (videoReady.A && videoReady.B) {
      mediaReady = true;
      setMediaStatus("", true);
      setResponseControlsEnabled(true);
      updateNextState();
    }
  }

  function markVideoError(video) {
    const token = Number(video.dataset.token || 0);
    if (token !== currentVideoToken) return;
    mediaReady = false;
    setResponseControlsEnabled(false);
    setMediaStatus("One of the videos could not be loaded. Please refresh the page.", false);
    updateNextState();
  }

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
    video.addEventListener("loadedmetadata", () => markVideoReady(video));
    video.addEventListener("error", () => markVideoError(video));
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

  loadManifest();
})();
