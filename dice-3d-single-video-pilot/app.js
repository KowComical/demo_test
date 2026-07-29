(() => {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const inspectMode = params.get("inspect") === "1";
  const backendDisabled = params.get("backend") === "off";
  const requestedForm = (params.get("form") || "").toUpperCase();
  const supportedForms = new Set(["A", "B", "C", "D"]);
  const localeStorageKey = "dice_3d_single_video_locale";
  const reviewerStorageKey = "dice_3d_single_video_reviewer";

  const translations = {
    en: {
      introEyebrow: "Single-video perception check",
      introTitle: "Do the speech and 3D motion feel consistent?",
      introLead: "You will see six short videos, one at a time. Judge each video on its own; there is no A/B comparison.",
      watchTitle: "Watch with sound",
      watchText: "Use headphones if possible and play the full clip before answering.",
      judgeTitle: "Judge internal consistency",
      judgeText: "Consider whether the visible face, hands and body fit the speech and transcript.",
      uncertainTitle: "Uncertainty is useful",
      uncertainText: "Choose Not sure when the evidence is weak. Do not try to guess the study label.",
      privacyNote: "Responses are stored using an anonymous browser-generated code. No correct answers are shown.",
      start: "Start",
      resume: "Resume",
      resumeNote: "An unfinished session was found on this browser.",
      loadingStudy: "Loading study data…",
      loadFailed: "The study data could not be loaded. Please refresh or contact the researcher.",
      trialLabel: "Single-video judgment",
      trialQuestion: "Does this motion fit the speech and transcript?",
      transcriptLabel: "Speech subtitle",
      loadingVideo: "Loading video…",
      playFirst: "Play the video to enable the answer buttons.",
      videoError: "The video could not be loaded.",
      answerPrompt: "Your judgment",
      choices: { consistent: "Consistent", inconsistent: "Inconsistent", not_sure: "Not sure" },
      confidenceLabel: "How confident are you in this judgment?",
      low: "Low",
      high: "High",
      locationLabel: "If anything felt inconsistent or unclear, where?",
      locationHint: "Optional; select all that apply.",
      locations: {
        context: "Speech / context",
        arms_hands: "Arms / hands",
        face: "Face",
        head_body: "Head / body",
        unclear: "Cannot localize",
      },
      doubtLabel: "Anything else affected your judgment?",
      doubtHint: "Optional; select all that apply.",
      doubts: {
        motion_too_weak: "Motion too weak",
        speech_or_text_unclear: "Speech/text unclear",
        multiple_interpretations: "Multiple interpretations",
        technical_artifact: "Technical artifact",
        render_quality: "Render quality",
      },
      noteLabel: "Optional comment",
      notePlaceholder: "What made the video easy or difficult to judge?",
      next: "Next",
      finish: "Finish",
      backendReady: "Responses will be saved automatically.",
      backendDisabled: "Backend disabled for this test session.",
      backendSaving: "Saving response…",
      backendSaved: "Response saved.",
      backendUnconfirmed: "Response sent; receipt not yet confirmed.",
      backendFailed: "Could not confirm the save. A local copy is still retained.",
      doneEyebrow: "Complete",
      doneTitle: "Thank you for completing the check.",
      doneLead: "Correct labels are intentionally not shown.",
      doneSaving: "Saving {count} remaining response(s) in the background. Please keep this page open.",
      doneSaved: "All responses have been saved and confirmed.",
      doneUnconfirmed: "All responses were sent; some receipts could not be confirmed. A local copy is retained.",
      doneFailed: "Some responses could not be sent. A local copy is retained for download.",
      doneLocalOnly: "Backend saving is disabled; responses are retained only in this browser.",
      summaryAnswered: "Answered",
      summaryVersion: "Study version",
      summaryConfidence: "Average confidence",
      summaryAccuracy: "Inspect accuracy",
      downloadJson: "Download JSON",
      downloadCsv: "Download CSV",
      restart: "Start a new session",
    },
    zh: {
      introEyebrow: "单视频感知检查",
      introTitle: "语音和3D动作表达一致吗？",
      introLead: "你将依次看到6个短视频。每题只判断当前视频，不进行A/B对比。",
      watchTitle: "打开声音观看",
      watchText: "建议使用耳机，并在作答前完整播放视频。",
      judgeTitle: "判断内部一致性",
      judgeText: "观察脸、手臂和身体动作是否符合当前语音和字幕。",
      uncertainTitle: "不确定也是有效答案",
      uncertainText: "证据不足时请选择“不确定”，不要猜测研究标签。",
      privacyNote: "网站使用浏览器生成的匿名编号保存回答，不会显示正确答案。",
      start: "开始",
      resume: "继续上次进度",
      resumeNote: "此浏览器中发现一个尚未完成的测试。",
      loadingStudy: "正在加载测试数据……",
      loadFailed: "无法加载测试数据，请刷新页面或联系研究者。",
      trialLabel: "单视频判断",
      trialQuestion: "这个动作与语音和字幕一致吗？",
      transcriptLabel: "语音字幕（中文翻译）",
      loadingVideo: "正在加载视频……",
      playFirst: "请先播放视频，之后才可作答。",
      videoError: "视频加载失败。",
      answerPrompt: "你的判断",
      choices: { consistent: "一致", inconsistent: "不一致", not_sure: "不确定" },
      confidenceLabel: "你对这个判断有多大把握？",
      low: "低",
      high: "高",
      locationLabel: "如果感觉不一致或不清楚，问题可能在哪里？",
      locationHint: "选填，可多选。",
      locations: {
        context: "语音／语境",
        arms_hands: "手臂／手部",
        face: "面部",
        head_body: "头部／身体",
        unclear: "无法定位",
      },
      doubtLabel: "还有什么影响了你的判断？",
      doubtHint: "选填，可多选。",
      doubts: {
        motion_too_weak: "动作太弱",
        speech_or_text_unclear: "语音／字幕不清楚",
        multiple_interpretations: "存在多种解释",
        technical_artifact: "技术破绽",
        render_quality: "渲染质量",
      },
      noteLabel: "补充说明（选填）",
      notePlaceholder: "什么原因让这个视频容易或难以判断？",
      next: "下一题",
      finish: "完成",
      backendReady: "回答将自动保存。",
      backendDisabled: "本次测试已关闭后端提交。",
      backendSaving: "正在保存回答……",
      backendSaved: "回答已保存。",
      backendUnconfirmed: "回答已发送，暂未确认回执。",
      backendFailed: "未能确认保存；本地副本仍然保留。",
      doneEyebrow: "已完成",
      doneTitle: "感谢你完成本次检查。",
      doneLead: "为避免影响后续测试，此处不会显示正确答案。",
      doneSaving: "正在后台保存剩余的{count}条回答，请暂时不要关闭页面。",
      doneSaved: "所有回答均已保存并确认收到。",
      doneUnconfirmed: "所有回答均已发送，但部分回执未能确认；浏览器中仍保留本地副本。",
      doneFailed: "部分回答未能发送；浏览器中仍保留可下载的本地副本。",
      doneLocalOnly: "本次关闭了后端提交，回答只保存在当前浏览器中。",
      summaryAnswered: "已回答",
      summaryVersion: "测试版本",
      summaryConfidence: "平均信心",
      summaryAccuracy: "调试准确率",
      downloadJson: "下载JSON",
      downloadCsv: "下载CSV",
      restart: "开始新的测试",
    },
    ja: {
      introEyebrow: "単一動画の知覚チェック",
      introTitle: "音声と3Dモーションは一貫していますか？",
      introLead: "6本の短い動画を1本ずつ提示します。A/B比較ではなく、それぞれを単独で判断してください。",
      watchTitle: "音声付きで視聴",
      watchText: "可能であればヘッドホンを使用し、回答前に動画を最後まで再生してください。",
      judgeTitle: "内部整合性を判断",
      judgeText: "顔、手、身体の動きが音声と字幕に合っているかを判断してください。",
      uncertainTitle: "不確実さも重要です",
      uncertainText: "判断材料が弱い場合は「わからない」を選び、研究上の正解を推測しないでください。",
      privacyNote: "回答はブラウザが生成した匿名コードで保存され、正解は表示されません。",
      start: "開始",
      resume: "続きから再開",
      resumeNote: "このブラウザに未完了のセッションがあります。",
      loadingStudy: "データを読み込んでいます…",
      loadFailed: "データを読み込めませんでした。ページを再読み込みするか、研究者に連絡してください。",
      trialLabel: "単一動画の判断",
      trialQuestion: "このモーションは音声と字幕に合っていますか？",
      transcriptLabel: "音声字幕（日本語訳）",
      loadingVideo: "動画を読み込んでいます…",
      playFirst: "回答する前に動画を再生してください。",
      videoError: "動画を読み込めませんでした。",
      answerPrompt: "あなたの判断",
      choices: { consistent: "一致", inconsistent: "不一致", not_sure: "わからない" },
      confidenceLabel: "この判断にどの程度自信がありますか？",
      low: "低い",
      high: "高い",
      locationLabel: "不一致または不明瞭に感じた箇所はどこですか？",
      locationHint: "任意・複数選択可。",
      locations: {
        context: "音声／文脈",
        arms_hands: "腕／手",
        face: "顔",
        head_body: "頭／身体",
        unclear: "特定できない",
      },
      doubtLabel: "ほかに判断へ影響した点はありますか？",
      doubtHint: "任意・複数選択可。",
      doubts: {
        motion_too_weak: "動きが弱い",
        speech_or_text_unclear: "音声／字幕が不明瞭",
        multiple_interpretations: "複数の解釈が可能",
        technical_artifact: "技術的な不自然さ",
        render_quality: "レンダリング品質",
      },
      noteLabel: "コメント（任意）",
      notePlaceholder: "判断しやすかった、または難しかった理由を記入してください。",
      next: "次へ",
      finish: "完了",
      backendReady: "回答は自動的に保存されます。",
      backendDisabled: "このテストではバックエンド送信が無効です。",
      backendSaving: "回答を保存しています…",
      backendSaved: "回答を保存しました。",
      backendUnconfirmed: "回答を送信しましたが、受信確認はまだです。",
      backendFailed: "保存を確認できませんでした。ローカルコピーは保持されています。",
      doneEyebrow: "完了",
      doneTitle: "ご協力ありがとうございました。",
      doneLead: "後続の判断に影響しないよう、正解は表示しません。",
      doneSaving: "残り{count}件の回答をバックグラウンドで保存しています。このページを閉じないでください。",
      doneSaved: "すべての回答が保存され、受信確認されました。",
      doneUnconfirmed: "すべての回答を送信しましたが、一部の受信確認ができませんでした。ローカルコピーは保持されています。",
      doneFailed: "一部の回答を送信できませんでした。ダウンロード可能なローカルコピーは保持されています。",
      doneLocalOnly: "バックエンド送信は無効です。回答はこのブラウザ内にのみ保存されています。",
      summaryAnswered: "回答数",
      summaryVersion: "調査バージョン",
      summaryConfidence: "平均確信度",
      summaryAccuracy: "検証用正答率",
      downloadJson: "JSONを保存",
      downloadCsv: "CSVを保存",
      restart: "新しいセッションを開始",
    },
  };

  const ids = [
    "introView", "trialView", "doneView", "introEyebrow", "introTitle", "introLead",
    "watchTitle", "watchText", "judgeTitle", "judgeText", "uncertainTitle", "uncertainText",
    "privacyNote", "startButton", "resumeNote", "loadStatus", "trialLabel", "trialQuestion",
    "progressText", "progressFill", "transcriptLabel", "transcriptText", "trialVideo", "mediaStatus",
    "answerPrompt", "choiceRow", "followupPanel", "confidenceLabel", "confidenceRow", "lowLabel",
    "highLabel", "locationLabel", "locationOptions", "locationHint", "doubtLabel", "doubtOptions",
    "doubtHint", "noteLabel", "noteText", "submissionStatus", "inspectBadge", "nextButton",
    "doneEyebrow", "doneTitle", "doneLead", "summaryGrid", "downloadJson", "downloadCsv",
    "restartButton", "languageToggle", "doneSaveStatus",
  ];
  const els = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));

  let manifest = null;
  let session = null;
  let draft = null;
  let currentLocale = "en";
  let storageKey = "";
  let mediaLoaded = false;
  let videoPlayed = false;
  let watchStartedAt = 0;
  let trialStartedAt = 0;
  let saving = false;
  const pendingResponseIds = new Set();

  const nowIso = () => new Date().toISOString();
  const tr = () => translations[currentLocale] || translations.en;
  const all = (selector) => Array.from(document.querySelectorAll(selector));

  function makeId(prefix) {
    const random = window.crypto?.getRandomValues
      ? Array.from(window.crypto.getRandomValues(new Uint32Array(2)))
          .map((value) => value.toString(16).padStart(8, "0"))
          .join("")
      : Math.random().toString(16).slice(2);
    return `${prefix}_${Date.now().toString(36)}_${random}`;
  }

  function chooseInitialLocale() {
    const requested = (params.get("lang") || "").toLowerCase();
    if (translations[requested]) return requested;
    const stored = localStorage.getItem(localeStorageKey);
    if (translations[stored]) return stored;
    return "en";
  }

  function setText(id, value) {
    if (els[id]) els[id].textContent = value;
  }

  function displayTranscript(trial, locale = currentLocale) {
    if (!trial) return "";
    return trial.display_transcripts?.[locale]
      || trial.display_transcripts?.en
      || trial.transcript
      || "";
  }

  function updateDisplayedTranscript() {
    if (!session || session.completed_at) return;
    setText("transcriptText", displayTranscript(currentTrial()));
  }

  function applyLocale() {
    const t = tr();
    document.documentElement.lang = currentLocale === "zh" ? "zh-CN" : currentLocale;
    [
      "introEyebrow", "introTitle", "introLead", "watchTitle", "watchText", "judgeTitle", "judgeText",
      "uncertainTitle", "uncertainText", "privacyNote", "resumeNote", "trialLabel", "trialQuestion",
      "transcriptLabel", "answerPrompt", "confidenceLabel", "locationLabel", "locationHint", "doubtLabel",
      "doubtHint", "noteLabel", "doneEyebrow", "doneTitle", "doneLead",
    ].forEach((key) => setText(key, t[key]));
    setText("lowLabel", t.low);
    setText("highLabel", t.high);
    setText("downloadJson", t.downloadJson);
    setText("downloadCsv", t.downloadCsv);
    setText("restartButton", t.restart);
    els.noteText.placeholder = t.notePlaceholder;
    all("[data-locale]").forEach((button) => {
      button.classList.toggle("selected", button.dataset.locale === currentLocale);
    });
    all("[data-choice]").forEach((button) => {
      button.textContent = t.choices[button.dataset.choice];
    });
    renderOptionGroups();
    if (!manifest) {
      setText("loadStatus", t.loadingStudy);
    } else if (!session) {
      setText("startButton", t.start);
    } else if (!session.completed_at && els.introView && !els.introView.classList.contains("hidden")) {
      setText("startButton", t.resume);
    }
    if (session && !session.completed_at) {
      updateTrialLabels();
      updateDisplayedTranscript();
      refreshSubmissionStatus();
    } else if (session?.completed_at) {
      renderSummary();
      refreshDoneSaveStatus();
    }
  }

  function renderOptionGroups() {
    if (!manifest) return;
    const selectedLocations = new Set(selectedValues("location"));
    const selectedDoubts = new Set(selectedValues("doubt"));
    renderChecks(
      els.locationOptions,
      manifest.ui.mismatch_locations,
      "location",
      tr().locations,
      selectedLocations,
    );
    renderChecks(
      els.doubtOptions,
      manifest.ui.doubt_options,
      "doubt",
      tr().doubts,
      selectedDoubts,
    );
  }

  function renderChecks(container, values, group, labels, selected) {
    container.replaceChildren();
    values.forEach((value) => {
      const label = document.createElement("label");
      label.className = "check-option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = value;
      input.dataset.optionGroup = group;
      input.checked = selected.has(value);
      const span = document.createElement("span");
      span.textContent = labels[value] || value;
      label.append(input, span);
      container.append(label);
    });
  }

  function selectedValues(group) {
    return all(`[data-option-group="${group}"]:checked`).map((input) => input.value);
  }

  function getReviewerId() {
    const requested = (params.get("reviewer") || params.get("participant") || "").trim();
    if (requested) {
      localStorage.setItem(reviewerStorageKey, requested);
      return requested;
    }
    const stored = localStorage.getItem(reviewerStorageKey);
    if (stored) return stored;
    const generated = makeId("reviewer");
    localStorage.setItem(reviewerStorageKey, generated);
    return generated;
  }

  function stableHash(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function assignedForm(reviewerId) {
    if (supportedForms.has(requestedForm)) return requestedForm;
    const forms = ["A", "B", "C", "D"];
    return forms[stableHash(`${manifest.version}:${reviewerId}`) % forms.length];
  }

  function shuffle(items) {
    const copy = items.map((item) => ({ ...item }));
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  }

  function responseEndpoint() {
    if (backendDisabled) return "";
    return (params.get("endpoint") || manifest?.ui?.response_endpoint || "").trim();
  }

  function responseEndpointMode() {
    return (manifest?.ui?.response_endpoint_mode || "no-cors") === "no-cors" ? "no-cors" : "cors";
  }

  async function loadManifest() {
    currentLocale = chooseInitialLocale();
    applyLocale();
    try {
      manifest = window.SINGLE_VIDEO_MANIFEST;
      if (!manifest) {
        const response = await fetch("data/single_video_manifest.json", { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        manifest = await response.json();
      }
      storageKey = `dice_3d_single_video_session_${manifest.version}`;
      if (params.get("reset") === "1") localStorage.removeItem(storageKey);
      renderOptionGroups();
      restoreSession();
      resumePendingSubmissions();
      els.startButton.disabled = false;
      els.loadStatus.classList.add("hidden");
      if (session?.completed_at) {
        showDone();
      } else {
        showIntro(Boolean(session));
      }
      applyLocale();
    } catch (error) {
      console.error(error);
      setText("loadStatus", tr().loadFailed);
      els.loadStatus.classList.remove("hidden");
      els.startButton.disabled = true;
    }
  }

  function restoreSession() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!saved || saved.manifest_version !== manifest.version) return false;
      if (supportedForms.has(requestedForm) && saved.form_id !== requestedForm) return false;
      session = saved;
      currentLocale = translations[session.ui_locale] ? session.ui_locale : currentLocale;
      return true;
    } catch {
      localStorage.removeItem(storageKey);
      return false;
    }
  }

  function showView(name) {
    els.introView.classList.toggle("hidden", name !== "intro");
    els.trialView.classList.toggle("hidden", name !== "trial");
    els.doneView.classList.toggle("hidden", name !== "done");
  }

  function showIntro(resume = false) {
    showView("intro");
    els.resumeNote.classList.toggle("hidden", !resume);
    setText("startButton", resume ? tr().resume : tr().start);
  }

  function startSession() {
    if (session && !session.completed_at) {
      showTrial();
      return;
    }
    const reviewerId = getReviewerId();
    const formId = assignedForm(reviewerId);
    const trials = shuffle(manifest.forms[formId]).map((trial, index) => ({
      ...trial,
      trial_index: index + 1,
      trial_pool_id: trial.public_trial_id,
      video_a_sample_id: trial.sample_key,
      video_b_sample_id: "",
      positive_side: "",
    }));
    session = {
      session_id: makeId("single_session"),
      manifest_version: manifest.version,
      manifest_built_at: manifest.built_at,
      reviewer_id: reviewerId,
      form_id: formId,
      mode: `single_video_form_${formId}`,
      ui_locale: currentLocale,
      ui_theme: "single_video_neutral",
      started_at: nowIso(),
      completed_at: "",
      current_index: 0,
      trial_count: trials.length,
      trials,
      responses: [],
    };
    saveSession();
    showTrial();
  }

  function saveSession() {
    if (session) localStorage.setItem(storageKey, JSON.stringify(session));
  }

  function currentTrial() {
    return session.trials[session.current_index];
  }

  function resetDraft() {
    draft = {
      choice: "",
      confidence: "",
      shown_at: nowIso(),
      stats: {
        play_count: 0,
        pause_count: 0,
        seek_count: 0,
        watched_time_ms: 0,
        max_video_time_sec: 0,
      },
    };
    mediaLoaded = false;
    videoPlayed = false;
    watchStartedAt = 0;
    trialStartedAt = performance.now();
  }

  function updateTrialLabels() {
    if (!session || session.completed_at) return;
    const completed = session.current_index;
    const total = session.trial_count;
    setText("progressText", `${completed + 1} / ${total}`);
    els.progressFill.style.width = `${(completed / total) * 100}%`;
    setText("nextButton", completed + 1 === total ? tr().finish : tr().next);
    if (!mediaLoaded) setMediaStatus("loading", tr().loadingVideo);
  }

  function showTrial() {
    if (session.current_index >= session.trial_count) {
      showDone();
      return;
    }
    flushWatch();
    els.trialVideo.pause();
    resetDraft();
    showView("trial");
    const trial = currentTrial();
    setText("transcriptText", displayTranscript(trial));
    updateTrialLabels();
    setMediaStatus("loading", tr().loadingVideo);
    els.trialVideo.removeAttribute("src");
    els.trialVideo.load();
    els.trialVideo.src = trial.video_path;
    els.trialVideo.load();
    all("[data-choice]").forEach((button) => {
      button.disabled = true;
      button.classList.remove("selected");
    });
    all("[data-confidence]").forEach((button) => button.classList.remove("selected"));
    all("[data-option-group]").forEach((input) => { input.checked = false; });
    els.noteText.value = "";
    els.followupPanel.classList.add("hidden");
    saving = false;
    updateNextState();
    refreshSubmissionStatus();
    if (inspectMode) {
      els.inspectBadge.classList.remove("hidden");
      els.inspectBadge.textContent = `inspect · form ${session.form_id} · ${trial.public_trial_id}`;
    } else {
      els.inspectBadge.classList.add("hidden");
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function setMediaStatus(kind, message) {
    els.mediaStatus.className = "media-status";
    if (kind === "ready") els.mediaStatus.classList.add("ready");
    if (kind === "error") els.mediaStatus.classList.add("error");
    els.mediaStatus.textContent = message;
  }

  function enableChoices(enabled) {
    all("[data-choice]").forEach((button) => { button.disabled = !enabled; });
  }

  function setChoice(choice) {
    if (!videoPlayed || saving) return;
    draft.choice = choice;
    draft.confidence = "";
    all("[data-choice]").forEach((button) => {
      button.classList.toggle("selected", button.dataset.choice === choice);
    });
    all("[data-confidence]").forEach((button) => button.classList.remove("selected"));
    els.followupPanel.classList.remove("hidden");
    updateNextState();
  }

  function setConfidence(value) {
    if (!draft.choice || saving) return;
    draft.confidence = value;
    all("[data-confidence]").forEach((button) => {
      button.classList.toggle("selected", button.dataset.confidence === value);
    });
    updateNextState();
  }

  function updateNextState() {
    els.nextButton.disabled = saving || !videoPlayed || !draft?.choice || !draft?.confidence;
  }

  function beginWatch() {
    if (!watchStartedAt) watchStartedAt = performance.now();
  }

  function flushWatch() {
    if (!watchStartedAt || !draft) return;
    draft.stats.watched_time_ms += Math.round(performance.now() - watchStartedAt);
    watchStartedAt = 0;
  }

  function updateMaxVideoTime() {
    if (!draft) return;
    const time = Number(els.trialVideo.currentTime || 0);
    if (Number.isFinite(time)) {
      draft.stats.max_video_time_sec = Math.max(draft.stats.max_video_time_sec, Number(time.toFixed(3)));
    }
  }

  function setSubmissionStatus(status, message) {
    els.submissionStatus.dataset.status = status;
    els.submissionStatus.textContent = message;
  }

  function refreshSubmissionStatus() {
    setSubmissionStatus(responseEndpoint() ? "ready" : "disabled", responseEndpoint() ? tr().backendReady : tr().backendDisabled);
  }

  function submitCurrentTrial() {
    if (els.nextButton.disabled || saving) return;
    saving = true;
    updateNextState();
    flushWatch();
    updateMaxVideoTime();
    const trial = currentTrial();
    const locations = selectedValues("location");
    const doubts = selectedValues("doubt");
    const choice = draft.choice;
    const response = {
      response_id: makeId("single_response"),
      session_id: session.session_id,
      reviewer_id: session.reviewer_id,
      form_id: session.form_id,
      trial_index: trial.trial_index,
      trial_pool_id: trial.public_trial_id,
      base_id: trial.base_slot,
      speaker: "",
      language: "",
      negative_type: "",
      positive_sample_id: "",
      negative_sample_id: "",
      shown_sample_id: trial.sample_key,
      transcript_source: trial.transcript,
      transcript_displayed: displayTranscript(trial),
      transcript_locale: currentLocale,
      shown_label: "",
      ground_truth: "",
      video_a_sample_id: trial.sample_key,
      video_b_sample_id: "",
      positive_side: "",
      choice_side: choice,
      chosen_sample_id: trial.sample_key,
      correct: null,
      confidence: Number(draft.confidence),
      mismatch_locations: locations,
      doubt_tags: [...locations.map((value) => `location_${value}`), ...doubts],
      note: els.noteText.value.trim(),
      response_time_ms: Math.round(performance.now() - trialStartedAt),
      play_count: draft.stats.play_count,
      pause_count: draft.stats.pause_count,
      restart_count: 0,
      seek_count: draft.stats.seek_count,
      watched_time_ms: draft.stats.watched_time_ms,
      max_video_time_sec: draft.stats.max_video_time_sec,
      shown_at: draft.shown_at,
      answered_at: nowIso(),
      ui_locale: currentLocale,
      ui_theme: "single_video_neutral",
      backend_status: responseEndpoint() ? "pending" : "disabled",
      backend_error: "",
      backend_submitted_at: "",
    };
    session.responses.push(response);
    session.current_index += 1;
    saveSession();
    queueSubmission(response, trial);
    saving = false;
    showTrial();
  }

  function queueSubmission(response, trial, recovering = false) {
    if (pendingResponseIds.has(response.response_id)) return;
    pendingResponseIds.add(response.response_id);
    const job = recovering
      ? recoverOrSubmit(response, trial)
      : submitToBackend(response, trial);
    job.finally(() => {
      pendingResponseIds.delete(response.response_id);
      refreshDoneSaveStatus();
    });
    refreshDoneSaveStatus();
  }

  async function recoverOrSubmit(response, trial) {
    const endpoint = responseEndpoint();
    if (!endpoint) {
      markBackend(response, "disabled");
      return;
    }
    const verified = await verifyReceipt(endpoint, response.response_id);
    if (verified) {
      markBackend(response, "sent_verified");
      return;
    }
    await submitToBackend(response, trial);
  }

  function resumePendingSubmissions() {
    if (!session) return;
    session.responses
      .filter((response) => response.backend_status === "pending")
      .forEach((response) => {
        const trial = session.trials.find(
          (item) => item.public_trial_id === response.trial_pool_id,
        );
        if (trial) queueSubmission(response, trial, true);
      });
  }

  function markBackend(response, status, error = "") {
    response.backend_status = status;
    response.backend_error = error;
    response.backend_submitted_at = nowIso();
    saveSession();
    refreshDoneSaveStatus();
  }

  async function submitToBackend(response, trial) {
    const endpoint = responseEndpoint();
    if (!endpoint) {
      markBackend(response, "disabled");
      setSubmissionStatus("disabled", tr().backendDisabled);
      return;
    }
    setSubmissionStatus("saving", tr().backendSaving);
    const { display_transcripts: _displayTranscripts, ...publicTrial } = trial;
    const backendTrial = {
      ...publicTrial,
      trial_index: response.trial_index,
      trial_pool_id: trial.public_trial_id,
      transcript: trial.transcript,
      transcript_displayed: response.transcript_displayed,
      transcript_locale: response.transcript_locale,
      video_a_sample_id: trial.sample_key,
      video_b_sample_id: "",
      positive_side: "",
    };
    const payload = {
      event_type: "single_video_trial_response",
      submitted_at: nowIso(),
      manifest: { version: manifest.version, built_at: manifest.built_at },
      session: {
        session_id: session.session_id,
        reviewer_id: session.reviewer_id,
        mode: session.mode,
        form_id: session.form_id,
        ui_locale: currentLocale,
        ui_theme: "single_video_neutral",
        started_at: session.started_at,
        trial_count: session.trial_count,
      },
      trial: backendTrial,
      response,
    };
    try {
      if (responseEndpointMode() === "no-cors") {
        await fetch(endpoint, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });
        const verified = await verifyReceipt(endpoint, response.response_id);
        if (verified) {
          markBackend(response, "sent_verified");
          setSubmissionStatus("saved", tr().backendSaved);
        } else {
          markBackend(response, "sent_unconfirmed");
          setSubmissionStatus("saved", tr().backendUnconfirmed);
        }
        return;
      }
      const result = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!result.ok) throw new Error(`HTTP ${result.status}`);
      markBackend(response, "sent");
      setSubmissionStatus("saved", tr().backendSaved);
    } catch (error) {
      markBackend(response, "failed", error instanceof Error ? error.message : String(error));
      setSubmissionStatus("failed", tr().backendFailed);
    }
  }

  function jsonp(endpoint, query, timeoutMs = 5000) {
    return new Promise((resolve) => {
      const callback = `__dice_single_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        delete window[callback];
        script.remove();
        resolve(value || null);
      };
      const timer = window.setTimeout(() => finish(null), timeoutMs);
      try {
        const url = new URL(endpoint);
        Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value));
        url.searchParams.set("callback", callback);
        url.searchParams.set("_", String(Date.now()));
        window[callback] = finish;
        script.src = url.toString();
        script.async = true;
        script.onerror = () => finish(null);
        document.head.append(script);
      } catch {
        finish(null);
      }
    });
  }

  async function verifyReceipt(endpoint, responseId) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (attempt) await new Promise((resolve) => window.setTimeout(resolve, 850));
      const result = await jsonp(endpoint, { action: "verify_response", response_id: responseId });
      if (result?.ok && result.found) return true;
      if (!result) return false;
    }
    return false;
  }

  function refreshDoneSaveStatus() {
    if (!session || !els.doneSaveStatus) return;
    const responses = session.responses || [];
    const pending = responses.filter((row) => row.backend_status === "pending").length;
    const failed = responses.filter((row) => row.backend_status === "failed").length;
    const unconfirmed = responses.filter((row) => row.backend_status === "sent_unconfirmed").length;
    let status = "saved";
    let message = tr().doneSaved;
    if (!responseEndpoint()) {
      status = "local";
      message = tr().doneLocalOnly;
    } else if (pending > 0) {
      status = "saving";
      message = tr().doneSaving.replace("{count}", String(pending));
    } else if (failed > 0) {
      status = "failed";
      message = tr().doneFailed;
    } else if (unconfirmed > 0) {
      status = "unconfirmed";
      message = tr().doneUnconfirmed;
    }
    els.doneSaveStatus.dataset.status = status;
    els.doneSaveStatus.textContent = message;
  }

  function showDone() {
    flushWatch();
    els.trialVideo.pause();
    session.completed_at = session.completed_at || nowIso();
    saveSession();
    showView("done");
    renderSummary();
    refreshDoneSaveStatus();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function renderSummary() {
    if (!session) return;
    const confidences = session.responses.map((row) => Number(row.confidence)).filter(Number.isFinite);
    const average = confidences.length
      ? (confidences.reduce((sum, value) => sum + value, 0) / confidences.length).toFixed(1)
      : "—";
    const items = [
      [tr().summaryAnswered, `${session.responses.length} / ${session.trial_count}`],
      [tr().summaryVersion, session.form_id],
      [tr().summaryConfidence, average],
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
      },
      session,
    };
  }

  function csvEscape(value) {
    if (value === null || value === undefined) return "";
    const string = Array.isArray(value) ? value.join(";") : String(value);
    return /[",\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
  }

  function exportCsv() {
    const fields = [
      "session_id", "response_id", "reviewer_id", "manifest_version", "form_id", "mode",
      "trial_index", "trial_pool_id", "base_id", "shown_sample_id", "choice_side", "confidence",
      "transcript_source", "transcript_displayed", "transcript_locale",
      "mismatch_locations", "doubt_tags", "note",
      "response_time_ms", "play_count", "pause_count", "seek_count", "watched_time_ms",
      "max_video_time_sec", "shown_at", "answered_at", "ui_locale", "backend_status",
    ];
    const rows = session.responses.map((response) => ({
      ...response,
      manifest_version: manifest.version,
      mode: session.mode,
    }));
    return [fields.join(","), ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))].join("\n");
  }

  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  els.languageToggle.addEventListener("click", (event) => {
    const button = event.target.closest("[data-locale]");
    if (!button || !translations[button.dataset.locale]) return;
    currentLocale = button.dataset.locale;
    localStorage.setItem(localeStorageKey, currentLocale);
    if (session) {
      session.ui_locale = currentLocale;
      saveSession();
    }
    applyLocale();
  });

  els.startButton.addEventListener("click", startSession);
  els.choiceRow.addEventListener("click", (event) => {
    const button = event.target.closest("[data-choice]");
    if (button) setChoice(button.dataset.choice);
  });
  els.confidenceRow.addEventListener("click", (event) => {
    const button = event.target.closest("[data-confidence]");
    if (button) setConfidence(button.dataset.confidence);
  });
  els.nextButton.addEventListener("click", submitCurrentTrial);

  els.trialVideo.addEventListener("loadedmetadata", () => {
    mediaLoaded = true;
    setMediaStatus("waiting", tr().playFirst);
  });
  els.trialVideo.addEventListener("play", () => {
    if (!draft) return;
    draft.stats.play_count += 1;
    videoPlayed = true;
    beginWatch();
    setMediaStatus("ready", "");
    enableChoices(true);
    updateNextState();
  });
  els.trialVideo.addEventListener("pause", () => {
    if (!draft) return;
    if (els.trialVideo.currentTime > 0 && !els.trialVideo.ended) draft.stats.pause_count += 1;
    flushWatch();
    updateMaxVideoTime();
  });
  els.trialVideo.addEventListener("ended", () => {
    flushWatch();
    updateMaxVideoTime();
  });
  els.trialVideo.addEventListener("seeking", () => {
    if (draft && mediaLoaded) draft.stats.seek_count += 1;
  });
  els.trialVideo.addEventListener("timeupdate", updateMaxVideoTime);
  els.trialVideo.addEventListener("error", () => {
    mediaLoaded = false;
    videoPlayed = false;
    enableChoices(false);
    setMediaStatus("error", tr().videoError);
    updateNextState();
  });

  els.downloadJson.addEventListener("click", () => {
    download(
      `dice_3d_single_video_${session.session_id}.json`,
      JSON.stringify(exportObject(), null, 2),
      "application/json",
    );
  });
  els.downloadCsv.addEventListener("click", () => {
    download(`dice_3d_single_video_${session.session_id}.csv`, exportCsv(), "text/csv;charset=utf-8");
  });
  els.restartButton.addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    session = null;
    showIntro(false);
    applyLocale();
  });

  window.addEventListener("beforeunload", flushWatch);
  loadManifest();
})();
