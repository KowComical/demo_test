# Pilot Demo v1

Static GitHub Pages demo for the first 2AFC human-perception pilot.

## Entry

- GitHub Pages source: `docs/`
- Site entry: `docs/index.html`
- Direct page: `docs/pilot-demo/index.html`

## Modes

- Review all: all current A/B trial pools in manifest order for internal screening. This is the default mode at `pilot-demo/`.
- Participant: 10 trials, one randomized negative type per sampled base item. Use `pilot-demo/?mode=participant`.

## Current Scope

- 20 base items
- 60 active videos total
- 40 A/B trial pools
- Conditions: positive, context-swap negative, arms/hands-swap negative

## Data Recording

This version stores responses in the browser and exports JSON/CSV from the completion page. It can also POST every answered trial to a backend endpoint when `ui.response_endpoint` is configured in the manifest.

The included lightweight backend template is `backend/google_apps_script_collect.gs`, which appends one row per answered trial to a Google Sheet.

The demo does not collect participant background fields. If background information is needed later, collect it after the task or through the recruitment/survey system.

The primary task is the A/B choice: select which video is the real synchronized motion. Optional doubt tags and notes are lightweight diagnostics for deciding which candidate items to keep or discard.
