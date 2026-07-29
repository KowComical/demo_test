# DICE-3D Counterbalanced Single-Video Pilot v0.2

This site is the next gate after the internal v2/v2.1 A/B candidate review.
It tests whether a video can be judged without a side-by-side reference.

## Design

- Four forms: A, B, C and D.
- Six trials per form and six unique bases per participant.
- Exactly three matched positives and three controlled negatives per form.
- Eight validated condition pairs in the full bank: four context-swap and four
  arms-swap.
- The two bases with both conditions are assigned only one condition within a
  form, so a participant never sees the same base twice.
- Across forms, every condition pair is shown equally often as positive and
  negative; total condition exposure is 12 context and 12 arms.
- Trial order is randomized within the assigned form.
- Public videos use opaque `svsNNN.mp4` names and the public manifest contains
  no condition, polarity, ground-truth, private sample id, speaker, or base id.
- The private answer key is generated outside `docs/` at
  `data/processed/dice_3d_single_video_pilot/answer_key.json` and is joined to
  responses offline using form id plus opaque public trial id.

The default form is assigned deterministically from the anonymous reviewer
code. A researcher can assign a form explicitly with `?form=A`, `?form=B`,
`?form=C`, or `?form=D`. Use `?backend=off&inspect=1` for local/browser QA;
inspect mode reveals ground truth and must never be sent to participants.

## Participant task

Each trial shows one video and a subtitle in the selected interface language.
English participant subtitles are lightly edited from the raw audio-window
transcript so that visible text ends on complete thoughts rather than abrupt
half-sentences. Chinese and Japanese subtitles translate that edited English
text. Raw source transcripts remain in the manifest and response record for
auditability; visible subtitle text and locale are recorded separately. The
translation source is
`configs/dice_3d_single_video_translations.json` and the build fails if any
active transcript lacks EN/zh/ja text. The participant chooses
`consistent`, `inconsistent`, or `not sure`, rates confidence, and may mark a
mismatch location, doubt reason, or comment. Correct labels are not shown at
completion.

The first visit defaults to English regardless of the browser language. An
explicit `?lang=zh` / `?lang=ja` parameter or a participant's saved manual
language choice still takes precedence.

Submitting a trial advances immediately. Sheet submission and receipt
verification run in the background; the completion page asks the participant
to keep it open only while any final receipts remain pending.

The existing Google Apps Script collector remains compatible by encoding the
form in `mode`, the opaque trial in `trial_pool_id`, the opaque single-video
key in `video_a_sample_id`, and the participant decision in `choice_side`.
Ground truth and condition are intentionally left blank in the public/browser
payload and are recovered only during offline analysis.

This website is still an internal/expert pilot. Passing it is required before
multi-participant human validation and does not itself authorize training the
DICE-3D evaluator.
