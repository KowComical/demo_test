(() => {
  const MANIFEST_URL = "data/demo_manifest.json";
  const STORAGE_KEY = "dcc_pilot_demo_v1_session";
  const LOCALE_STORAGE_KEY = "dcc_pilot_demo_locale";
  const THEME_STORAGE_KEY = "dcc_pilot_demo_theme";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const params = new URLSearchParams(window.location.search);
  const requestedMode = params.get("mode");
  const sessionMode =
    requestedMode === "participant" || requestedMode === "review"
      ? requestedMode
      : "review";
  document.documentElement.dataset.mode = sessionMode;

  const LOCALES = ["en", "zh", "ja", "es"];
  const THEMES = ["neutral", "sage", "paper"];
  const LANG_ATTR = { en: "en", zh: "zh-Hans", ja: "ja", es: "es" };
  const DOUBT_OPTIONS = [
    {
      value: "hard_to_tell",
      labels: { en: "Hard to tell", zh: "很难判断", ja: "判断が難しい", es: "Difícil de decidir" },
    },
    {
      value: "both_plausible",
      labels: { en: "Both look plausible", zh: "两个都像真的", ja: "両方あり得る", es: "Ambos parecen plausibles" },
    },
    {
      value: "neither_plausible",
      labels: { en: "Neither looks real", zh: "两个都不像真的", ja: "どちらも本物に見えない", es: "Ninguno parece real" },
    },
    {
      value: "mismatch_not_obvious",
      labels: { en: "Mismatch not obvious", zh: "错配不明显", ja: "不一致が目立たない", es: "El desajuste no es claro" },
    },
    {
      value: "audio_or_text_cut",
      labels: { en: "Audio/text feels cut", zh: "音频或文本像被截断", ja: "音声/テキストが途切れる", es: "Audio/texto cortado" },
    },
    {
      value: "technical_artifact",
      labels: { en: "Technical artifact", zh: "技术破绽", ja: "技術的な破綻", es: "Artefacto técnico" },
    },
    {
      value: "motion_too_weak",
      labels: { en: "Motion too weak/flat", zh: "动作太弱或太平", ja: "動きが弱い/平坦", es: "Movimiento muy débil" },
    },
    {
      value: "timing_rhythm",
      labels: { en: "Timing/rhythm issue", zh: "时机或节奏问题", ja: "タイミング/リズム", es: "Tiempo/ritmo raro" },
    },
    {
      value: "gesture_meaning",
      labels: { en: "Gesture meaning issue", zh: "手势含义问题", ja: "ジェスチャー意味", es: "Problema de gesto" },
    },
  ];

  const I18N = {
    en: {
      documentTitle: "Co-speech Motion Consistency Pilot",
      languageLabel: "Language",
      themeLabel: "Theme",
      themeNeutral: "Neutral",
      themeSage: "Sage",
      themePaper: "Paper",
      pageTitle: "Which video is the real synchronized motion?",
      taskLine: "Review every A/B pair in order, choose the real captured motion, then add doubts if useful.",
      transcriptLabel: "Speech transcript",
      videoA: "Video A",
      videoB: "Video B",
      chooseChoice: (side) => `${side} is real`,
      selectedChoice: (side) => `Selected ${side} as real`,
      loadingVideos: "Loading videos...",
      responseChoose: "Choose which video is real first.",
      responseSelected: (side) => `Selected Video ${side} as real. Now rate your confidence and add optional doubts.`,
      responseNotSure: "You selected Not sure. You can continue.",
      confidenceLabel: "Confidence in your answer",
      low: "Low",
      high: "High",
      diagnosticLabel: "Optional doubts",
      diagnosticHint: "Select any doubts or skip this section.",
      reviewNote: "Doubts / notes",
      reviewPlaceholder: "Write anything confusing: unclear real one, artifact, cut transcript, or reason to discard this item",
      notSure: "Not sure",
      next: "Next",
      finish: "Finish",
      doneEyebrow: "Complete",
      doneTitle: "Responses saved in this browser",
      doneLead: "GitHub Pages is static, so this demo stores responses locally. Download the files below after testing.",
      downloadJson: "Download JSON",
      downloadCsv: "Download CSV",
      restart: "Start new session",
      demoUnavailable: "Demo unavailable",
      demoLoadError: "The demo data could not be loaded. Please refresh the page.",
      videoLoadError: "One of the videos could not be loaded. Please refresh the page.",
      trialMeta: (index, total, condition) => `Trial ${index} of ${total}${condition ? ` · ${condition}` : ""}`,
      progress: (done, total) => `${done} / ${total} answered`,
      modes: { participant: "Participant", review: "Review" },
      negTypes: { context_swap: "Context swap", arms_swap: "Arms swap" },
      summaryMode: "Mode",
      summaryAnswered: "Answered",
      summaryAccuracy: "Accuracy",
      summaryAvgConfidence: "Avg confidence",
    },
    zh: {
      documentTitle: "共语音动作一致性试测",
      languageLabel: "语言",
      themeLabel: "配色",
      themeNeutral: "清爽",
      themeSage: "浅绿",
      themePaper: "纸感",
      pageTitle: "哪个视频是真实同步的？",
      taskLine: "按顺序检查每一组 A/B，选择真实采集同步的视频；有疑惑再补充标记。",
      transcriptLabel: "台词文本",
      videoA: "视频 A",
      videoB: "视频 B",
      chooseChoice: (side) => `${side} 是真的`,
      selectedChoice: (side) => `已选 ${side} 为真实`,
      loadingVideos: "正在加载视频...",
      responseChoose: "请先选择哪个视频是真实同步的。",
      responseSelected: (side) => `已选择视频 ${side} 为真实。请给出信心评分；有疑惑可勾选。`,
      responseNotSure: "你选择了不确定，可以继续。",
      confidenceLabel: "对本次判断的信心",
      low: "低",
      high: "高",
      diagnosticLabel: "可选疑惑",
      diagnosticHint: "有疑惑就多选；没有可以跳过。",
      reviewNote: "疑惑 / 备注",
      reviewPlaceholder: "写下任何困惑：哪个是真的不明显、技术破绽、音频/文本截断，或需要丢弃的原因",
      notSure: "不确定",
      next: "下一题",
      finish: "完成",
      doneEyebrow: "完成",
      doneTitle: "结果已保存在本浏览器",
      doneLead: "GitHub Pages 是静态页面，所以这个 demo 会把回答保存在本地浏览器。测试结束后请下载文件。",
      downloadJson: "下载 JSON",
      downloadCsv: "下载 CSV",
      restart: "重新开始",
      demoUnavailable: "Demo 暂不可用",
      demoLoadError: "无法加载 demo 数据。请刷新页面。",
      videoLoadError: "有视频无法加载。请刷新页面。",
      trialMeta: (index, total, condition) => `第 ${index} / ${total} 题${condition ? ` · ${condition}` : ""}`,
      progress: (done, total) => `已答 ${done} / ${total}`,
      modes: { participant: "参与者", review: "内部检查" },
      negTypes: { context_swap: "上下文错配", arms_swap: "手臂错配" },
      summaryMode: "模式",
      summaryAnswered: "已答",
      summaryAccuracy: "正确率",
      summaryAvgConfidence: "平均信心",
    },
    ja: {
      documentTitle: "共発話モーション一貫性パイロット",
      languageLabel: "言語",
      themeLabel: "配色",
      themeNeutral: "Neutral",
      themeSage: "Sage",
      themePaper: "Paper",
      pageTitle: "本物の同期モーションはどちらですか？",
      taskLine: "A/B ペアを順番に確認し、本物の収録モーションを選び、必要なら疑問点を追加してください。",
      transcriptLabel: "発話テキスト",
      videoA: "動画 A",
      videoB: "動画 B",
      chooseChoice: (side) => `${side} が本物`,
      selectedChoice: (side) => `${side} を本物として選択`,
      loadingVideos: "動画を読み込み中...",
      responseChoose: "まず本物だと思う動画を選んでください。",
      responseSelected: (side) => `動画 ${side} を本物として選択しました。自信度と任意の疑問点を入力してください。`,
      responseNotSure: "「わからない」を選択しました。続行できます。",
      confidenceLabel: "判断への自信度",
      low: "低い",
      high: "高い",
      diagnosticLabel: "任意の疑問点",
      diagnosticHint: "気になる点があれば複数選択できます。なければ空欄で構いません。",
      reviewNote: "疑問 / メモ",
      reviewPlaceholder: "迷った理由、技術的問題、音声/テキストの途切れ、除外理由など",
      notSure: "わからない",
      next: "次へ",
      finish: "完了",
      doneEyebrow: "完了",
      doneTitle: "回答はこのブラウザに保存されました",
      doneLead: "GitHub Pages は静的ページのため、この demo は回答をブラウザ内に保存します。終了後にファイルをダウンロードしてください。",
      downloadJson: "JSON をダウンロード",
      downloadCsv: "CSV をダウンロード",
      restart: "新しく開始",
      demoUnavailable: "Demo を利用できません",
      demoLoadError: "Demo データを読み込めませんでした。ページを更新してください。",
      videoLoadError: "動画の読み込みに失敗しました。ページを更新してください。",
      trialMeta: (index, total, condition) => `${index} / ${total} 問目${condition ? ` · ${condition}` : ""}`,
      progress: (done, total) => `${done} / ${total} 回答済み`,
      modes: { participant: "参加者", review: "レビュー" },
      negTypes: { context_swap: "文脈入れ替え", arms_swap: "腕の入れ替え" },
      summaryMode: "モード",
      summaryAnswered: "回答数",
      summaryAccuracy: "正答率",
      summaryAvgConfidence: "平均自信度",
    },
    es: {
      documentTitle: "Piloto de consistencia de movimiento",
      languageLabel: "Idioma",
      themeLabel: "Tema",
      themeNeutral: "Neutral",
      themeSage: "Verde suave",
      themePaper: "Papel",
      pageTitle: "¿Cuál video es el movimiento real sincronizado?",
      taskLine: "Revisa cada par A/B en orden, elige el movimiento real capturado y añade dudas si hace falta.",
      transcriptLabel: "Transcripción",
      videoA: "Video A",
      videoB: "Video B",
      chooseChoice: (side) => `${side} es real`,
      selectedChoice: (side) => `${side} elegido como real`,
      loadingVideos: "Cargando videos...",
      responseChoose: "Primero elige cuál video es real.",
      responseSelected: (side) => `Elegiste Video ${side} como real. Ahora indica tu confianza y dudas opcionales.`,
      responseNotSure: "Elegiste No estoy seguro/a. Puedes continuar.",
      confidenceLabel: "Confianza en tu respuesta",
      low: "Baja",
      high: "Alta",
      diagnosticLabel: "Dudas opcionales",
      diagnosticHint: "Marca cualquier duda o deja esta sección vacía.",
      reviewNote: "Dudas / notas",
      reviewPlaceholder: "Escribe lo que confunde: cuál es real, artefacto, audio/texto cortado o razón para descartar",
      notSure: "No estoy seguro/a",
      next: "Siguiente",
      finish: "Finalizar",
      doneEyebrow: "Completado",
      doneTitle: "Respuestas guardadas en este navegador",
      doneLead: "GitHub Pages es estático, así que este demo guarda las respuestas localmente. Descarga los archivos al terminar.",
      downloadJson: "Descargar JSON",
      downloadCsv: "Descargar CSV",
      restart: "Nueva sesión",
      demoUnavailable: "Demo no disponible",
      demoLoadError: "No se pudieron cargar los datos del demo. Actualiza la página.",
      videoLoadError: "Uno de los videos no se pudo cargar. Actualiza la página.",
      trialMeta: (index, total, condition) => `Pregunta ${index} de ${total}${condition ? ` · ${condition}` : ""}`,
      progress: (done, total) => `${done} / ${total} respondidas`,
      modes: { participant: "Participante", review: "Revisión" },
      negTypes: { context_swap: "Cambio de contexto", arms_swap: "Cambio de brazos" },
      summaryMode: "Modo",
      summaryAnswered: "Respondidas",
      summaryAccuracy: "Precisión",
      summaryAvgConfidence: "Confianza media",
    },
  };

  function normalizeLocale(value) {
    if (!value) return "";
    const lowered = value.toLowerCase();
    if (lowered.startsWith("zh")) return "zh";
    if (lowered.startsWith("ja")) return "ja";
    if (lowered.startsWith("es")) return "es";
    if (lowered.startsWith("en")) return "en";
    return LOCALES.includes(lowered) ? lowered : "";
  }

  function initialLocale() {
    return (
      normalizeLocale(params.get("lang")) ||
      normalizeLocale(localStorage.getItem(LOCALE_STORAGE_KEY)) ||
      normalizeLocale(navigator.language) ||
      "en"
    );
  }

  function initialTheme() {
    const requested = params.get("theme") || localStorage.getItem(THEME_STORAGE_KEY) || "neutral";
    return THEMES.includes(requested) ? requested : "neutral";
  }

  let currentLocale = initialLocale();
  let currentTheme = initialTheme();
  document.documentElement.lang = LANG_ATTR[currentLocale];
  document.documentElement.dataset.theme = currentTheme;

  const els = {
    trialView: $("#trialView"),
    doneView: $("#doneView"),
    languageLabel: $("#languageLabel"),
    languageButtons: $$("[data-locale]"),
    themeLabel: $("#themeLabel"),
    themeSelect: $("#themeSelect"),
    trialMeta: $("#trialMeta"),
    pageTitle: $("#pageTitle"),
    taskLine: $("#taskLine"),
    progressFill: $("#progressFill"),
    progressText: $("#progressText"),
    transcriptLabel: $("#transcriptLabel"),
    transcriptText: $("#transcriptText"),
    mediaStatus: $("#mediaStatus"),
    responsePanel: $("#responsePanel"),
    responseGuidance: $("#responseGuidance"),
    videoALabel: $("#videoALabel"),
    videoBLabel: $("#videoBLabel"),
    cardA: $("#cardA"),
    cardB: $("#cardB"),
    videoA: $("#videoA"),
    videoB: $("#videoB"),
    confidenceRow: $("#confidenceRow"),
    confidenceLabel: $("#confidenceLabel"),
    lowLabel: $("#lowLabel"),
    highLabel: $("#highLabel"),
    diagnosticLabel: $("#diagnosticLabel"),
    doubtOptions: $("#doubtOptions"),
    diagnosticHint: $("#diagnosticHint"),
    reviewNoteLabel: $("#reviewNoteLabel"),
    noteText: $("#noteText"),
    notSureButton: $("#notSureButton"),
    nextButton: $("#nextButton"),
    summaryGrid: $("#summaryGrid"),
    doneEyebrow: $("#doneEyebrow"),
    doneTitle: $("#doneTitle"),
    doneLead: $("#doneLead"),
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

  function tr() {
    return I18N[currentLocale] || I18N.en;
  }

  function text(key, ...args) {
    const value = tr()[key];
    return typeof value === "function" ? value(...args) : value;
  }

  function conditionLabel(type) {
    return tr().negTypes[type] || titleCase(type || "");
  }

  function applyTheme() {
    document.documentElement.dataset.theme = currentTheme;
    if (els.themeSelect) els.themeSelect.value = currentTheme;
  }

  function updateChoiceButtonLabels() {
    $$("[data-choice]").forEach((button) => {
      const side = button.dataset.choice;
      const selected = draft?.choice_side === side;
      button.textContent = selected ? text("selectedChoice", side) : text("chooseChoice", side);
    });
  }

  function refreshProgressText() {
    if (!session) return;
    const completed = session.current_index;
    const total = session.trial_count;
    const trial = session.trials[session.current_index];
    const reviewCondition =
      session.mode === "review" && trial ? conditionLabel(trial.negative_type) : "";
    els.trialMeta.textContent = text("trialMeta", Math.min(completed + 1, total), total, reviewCondition);
    els.progressText.textContent = text("progress", Math.min(completed, total), total);
    els.nextButton.textContent = completed + 1 === total ? text("finish") : text("next");
  }

  function refreshResponseGuidance() {
    if (!draft?.choice_side) {
      setResponseGuidance(text("responseChoose"), false);
    } else if (draft.choice_side === "not_sure") {
      setResponseGuidance(text("responseNotSure"), true);
    } else {
      setResponseGuidance(text("responseSelected", draft.choice_side), true);
    }
  }

  function applyLocale() {
    document.documentElement.lang = LANG_ATTR[currentLocale];
    document.title = text("documentTitle");
    els.languageLabel.textContent = text("languageLabel");
    els.languageButtons.forEach((button) => {
      const selected = button.dataset.locale === currentLocale;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    els.themeLabel.textContent = text("themeLabel");
    if (els.themeSelect) {
      els.themeSelect.querySelector('option[value="neutral"]').textContent = text("themeNeutral");
      els.themeSelect.querySelector('option[value="sage"]').textContent = text("themeSage");
      els.themeSelect.querySelector('option[value="paper"]').textContent = text("themePaper");
    }
    els.pageTitle.textContent = text("pageTitle");
    els.taskLine.textContent = text("taskLine");
    els.transcriptLabel.textContent = text("transcriptLabel");
    els.videoALabel.textContent = text("videoA");
    els.videoBLabel.textContent = text("videoB");
    els.confidenceLabel.textContent = text("confidenceLabel");
    els.lowLabel.textContent = text("low");
    els.highLabel.textContent = text("high");
    els.diagnosticLabel.textContent = text("diagnosticLabel");
    els.diagnosticHint.textContent = text("diagnosticHint");
    els.reviewNoteLabel.textContent = text("reviewNote");
    els.noteText.placeholder = text("reviewPlaceholder");
    els.notSureButton.textContent = text("notSure");
    els.downloadJson.textContent = text("downloadJson");
    els.downloadCsv.textContent = text("downloadCsv");
    els.restartButton.textContent = text("restart");
    els.doneEyebrow.textContent = text("doneEyebrow");
    els.doneTitle.textContent = text("doneTitle");
    els.doneLead.textContent = text("doneLead");
    populateDoubtOptions();
    updateChoiceButtonLabels();
    refreshProgressText();
    refreshResponseGuidance();
    if (!els.doneView.classList.contains("hidden") && session) renderSummary();
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

  function selectedDoubtTags() {
    return $$("[data-doubt-option]:checked").map((input) => input.value);
  }

  function setDoubtOptionsEnabled(enabled) {
    $$("[data-doubt-option]").forEach((input) => {
      input.disabled = !enabled;
    });
  }

  function clearDoubtSelections() {
    $$("[data-doubt-option]").forEach((input) => {
      input.checked = false;
    });
  }

  function populateDoubtOptions() {
    const previous = new Set(selectedDoubtTags());
    els.doubtOptions.replaceChildren();
    DOUBT_OPTIONS.forEach((item) => {
      const label = document.createElement("label");
      label.className = "doubt-option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = item.value;
      input.dataset.doubtOption = "true";
      input.checked = previous.has(item.value);
      const span = document.createElement("span");
      span.textContent = item.labels[currentLocale] || item.labels.en;
      label.append(input, span);
      els.doubtOptions.append(label);
    });
    setDoubtOptionsEnabled(Boolean(draft?.choice_side && draft.choice_side !== "not_sure" && mediaReady));
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
      populateDoubtOptions();
      applyLocale();
      if (!restoreSession()) startSession(sessionMode);
    } catch (error) {
      showLoadError();
      console.error(error);
    }
  }

  function showLoadError() {
    setVisible("trial");
    els.trialMeta.textContent = text("demoUnavailable");
    els.progressText.textContent = "0 / 0";
    els.progressFill.style.width = "0%";
    els.transcriptText.textContent = text("demoLoadError");
    [els.videoA, els.videoB].forEach(clearVideo);
    $$("[data-choice], [data-confidence]").forEach((button) => {
      button.disabled = true;
    });
    setDoubtOptionsEnabled(false);
    els.noteText.disabled = true;
    els.notSureButton.disabled = true;
    els.nextButton.disabled = true;
  }

  function selectTrialPools(mode) {
    if (mode === "review") {
      return manifest.trial_pools.slice();
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
      ui_locale: currentLocale,
      ui_theme: currentTheme,
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
      session.ui_locale = session.ui_locale || currentLocale;
      session.ui_theme = session.ui_theme || currentTheme;
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
      doubt_tags: [],
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
    });
    updateChoiceButtonLabels();
    if (choice === "not_sure") {
      draft.confidence = "";
      draft.doubt_tags = [];
      clearDoubtSelections();
      $$("[data-confidence]").forEach((button) => button.classList.remove("selected"));
      setFollowupControlsEnabled(false);
      setResponseGuidance(text("responseNotSure"), true);
    } else if (choice) {
      setFollowupControlsEnabled(true);
      setResponseGuidance(text("responseSelected", choice), true);
    } else {
      draft.confidence = "";
      draft.doubt_tags = [];
      clearDoubtSelections();
      $$("[data-confidence]").forEach((button) => button.classList.remove("selected"));
      setFollowupControlsEnabled(false);
      setResponseGuidance(text("responseChoose"), false);
    }
    updateNextState();
  }

  function setConfidence(value) {
    if (!draft.choice_side || draft.choice_side === "not_sure") return;
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
    const reviewCondition = session.mode === "review" ? conditionLabel(trial.negative_type) : "";

    setVisible("trial");
    setMediaStatus(text("loadingVideos"), false);
    setResponseControlsEnabled(false);
    setResponseGuidance(text("responseChoose"), false);
    els.trialMeta.textContent = text("trialMeta", completed + 1, total, reviewCondition);
    els.progressText.textContent = text("progress", completed, total);
    els.progressFill.style.width = `${(completed / total) * 100}%`;
    els.nextButton.textContent = completed + 1 === total ? text("finish") : text("next");
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
    });
    updateChoiceButtonLabels();
    $$("[data-confidence]").forEach((button) => button.classList.remove("selected"));
    draft.doubt_tags = [];
    clearDoubtSelections();
    els.noteText.value = "";
    setFollowupControlsEnabled(false);
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
    const doubtTags = selectedDoubtTags();

    session.responses.push({
      session_id: session.session_id,
      trial_index: trial.trial_index,
      trial_pool_id: trial.trial_pool_id,
      base_id: trial.base_id,
      speaker: trial.speaker,
      language: trial.language,
      ui_locale: currentLocale,
      ui_theme: currentTheme,
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
      doubt_tags: doubtTags,
      mismatch_location: doubtTags.join(";"),
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
      [text("summaryMode"), tr().modes[session.mode] || titleCase(session.mode)],
      [text("summaryAnswered"), `${answered} / ${session.trial_count}`],
      [text("summaryAvgConfidence"), avgConfidence],
    ];
    if (session.mode === "review") {
      items.splice(2, 0, [text("summaryAccuracy"), accuracy]);
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
      "session_ui_locale",
      "session_ui_theme",
      "session_started_at",
      "session_completed_at",
      "trial_count",
      "trial_index",
      "trial_pool_id",
      "base_id",
      "speaker",
      "language",
      "ui_locale",
      "ui_theme",
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
      "doubt_tags",
      "mismatch_location",
      "note",
      "response_time_ms",
      "shown_at",
      "answered_at",
    ];
    const trialByIndex = new Map(session.trials.map((trial) => [trial.trial_index, trial]));
    const rows = session.responses.map((row) => ({
      ...row,
      doubt_tags: Array.isArray(row.doubt_tags) ? row.doubt_tags.join(";") : row.doubt_tags || "",
      manifest_version: session.manifest_version,
      mode: session.mode,
      session_ui_locale: session.ui_locale || "",
      session_ui_theme: session.ui_theme || "",
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
    $$("[data-choice]").forEach((button) => {
      button.disabled = !enabled;
    });
    els.notSureButton.disabled = !enabled;
    els.noteText.disabled = !enabled;
    setFollowupControlsEnabled(false);
  }

  function setFollowupControlsEnabled(enabled) {
    $$("[data-confidence]").forEach((button) => {
      button.disabled = !enabled;
    });
    setDoubtOptionsEnabled(enabled);
  }

  function setResponseGuidance(message, ready) {
    els.responseGuidance.textContent = message;
    els.responsePanel.classList.toggle("pending", !ready);
    els.responsePanel.classList.toggle("active", ready);
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
      setResponseGuidance(text("responseChoose"), false);
      updateNextState();
    }
  }

  function markVideoError(video) {
    const token = Number(video.dataset.token || 0);
    if (token !== currentVideoToken) return;
    mediaReady = false;
    setResponseControlsEnabled(false);
    setMediaStatus(text("videoLoadError"), false);
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

  els.languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentLocale = normalizeLocale(button.dataset.locale) || "en";
      localStorage.setItem(LOCALE_STORAGE_KEY, currentLocale);
      if (session) {
        session.ui_locale = currentLocale;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      }
      applyLocale();
    });
  });

  els.themeSelect.addEventListener("change", () => {
    currentTheme = THEMES.includes(els.themeSelect.value) ? els.themeSelect.value : "neutral";
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
    if (session) {
      session.ui_theme = currentTheme;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
    applyTheme();
  });

  applyTheme();
  applyLocale();
  loadManifest();
})();
