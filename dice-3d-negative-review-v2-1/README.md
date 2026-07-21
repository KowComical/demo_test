# DICE-3D Negative Correction Review v2.1

This is the second internal A/B quality-control round. It contains only the
conditions that changed after the 32-trial v2 review; it is not a volunteer
pilot and it does not replace the preserved v2 site.

## Correction bank

- 8 positive bases, including a repaired `call back` window and the new
  `three days a week` replacement base.
- 10 canonical context-swap trials using `motion_A + audio/transcript_B`.
- 9 arms-swap trials using
  `audio/transcript_A + face/body_A + arms/hands_B`.
- 27 videos and 19 randomized A/B trial pools.
- Context pairs use separate playback and per-video transcripts because the
  two audio tracks differ; arms pairs retain synchronized playback.

The page records A/B/Not sure, confidence, doubt tags, notes and backend
receipt status. The doubt list now includes `negative_too_obvious` so an item
can be rejected for being trivial rather than perceptually meaningful.

Passing this round means the controlled-negative construction is feasible for
the reviewed conditions. It does not by itself establish population-level
human validity or automatic generalization to unseen clips; those claims
require the later counterbalanced single-video pilot.
