const SPREADSHEET_ID = "";
const SHEET_NAME = "responses";

const HEADERS = [
  "received_at",
  "manifest_version",
  "session_id",
  "reviewer_id",
  "mode",
  "trial_index",
  "trial_pool_id",
  "base_id",
  "speaker",
  "language",
  "negative_type",
  "transcript",
  "positive_sample_id",
  "negative_sample_id",
  "video_a_sample_id",
  "video_b_sample_id",
  "positive_side",
  "choice_side",
  "chosen_sample_id",
  "correct",
  "confidence",
  "doubt_tags",
  "note",
  "response_time_ms",
  "shown_at",
  "answered_at",
  "ui_locale",
  "ui_theme",
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const payload = JSON.parse((e.postData && e.postData.contents) || "{}");
    const sheet = getSheet();
    ensureHeaders(sheet);
    sheet.appendRow(rowFromPayload(payload));
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function getSheet() {
  const spreadsheet = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error("Set SPREADSHEET_ID or bind this script to a Google Sheet.");
  }
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaders(sheet) {
  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  const existing = range.getValues()[0];
  if (existing.join("") === "") {
    range.setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function rowFromPayload(payload) {
  const manifest = payload.manifest || {};
  const session = payload.session || {};
  const trial = payload.trial || {};
  const response = payload.response || {};
  const doubtTags = Array.isArray(response.doubt_tags)
    ? response.doubt_tags.join(";")
    : response.doubt_tags || "";

  return [
    new Date(),
    manifest.version || "",
    session.session_id || response.session_id || "",
    session.reviewer_id || response.reviewer_id || "",
    session.mode || "",
    response.trial_index || trial.trial_index || "",
    response.trial_pool_id || trial.trial_pool_id || "",
    response.base_id || trial.base_id || "",
    response.speaker || trial.speaker || "",
    response.language || trial.language || "",
    response.negative_type || trial.negative_type || "",
    trial.transcript || "",
    response.positive_sample_id || trial.positive_sample_id || "",
    response.negative_sample_id || trial.negative_sample_id || "",
    response.video_a_sample_id || trial.video_a_sample_id || "",
    response.video_b_sample_id || trial.video_b_sample_id || "",
    response.positive_side || trial.positive_side || "",
    response.choice_side || "",
    response.chosen_sample_id || "",
    response.correct,
    response.confidence,
    doubtTags,
    response.note || "",
    response.response_time_ms || "",
    response.shown_at || "",
    response.answered_at || "",
    response.ui_locale || session.ui_locale || "",
    response.ui_theme || session.ui_theme || "",
  ];
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
