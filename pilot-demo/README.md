# Pilot Demo v0

Static GitHub Pages demo for the first 2AFC human-perception pilot.

## Entry

- GitHub Pages source: `docs/`
- Site entry: `docs/index.html`
- Direct page: `docs/pilot-demo/index.html`

## Modes

- Participant: 5 trials, one randomized negative type per base item. This is the default mode at `pilot-demo/`.
- Review all: 10 trials, all current candidate A/B pairs for internal screening. Use `pilot-demo/?review=all`.

## Current Scope

- 5 base items
- 15 videos total
- 10 A/B trial pools
- Conditions: positive, context-swap negative, arms/hands-swap negative

## Data Recording

This version is static. It stores responses in the browser and exports JSON/CSV from the completion page.

Before external participant collection, connect a backend, Google Sheets/API endpoint, or survey platform so participants do not need to manually download and return files.

The demo does not collect participant background fields. If background information is needed later, collect it after the task or through the recruitment/survey system.

The primary task is the A/B choice. The mismatch reason field is optional and should be treated as a lightweight diagnostic tag, not as the main outcome.
