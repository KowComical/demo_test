# Backend Collection

The live demo can submit each trial response to a backend endpoint.

## Google Sheets Option

1. Create a Google Sheet for pilot responses.
2. Open Extensions -> Apps Script.
3. Paste `google_apps_script_collect.gs`.
4. If the script is not bound to the Sheet, set `SPREADSHEET_ID` to the Sheet ID.
5. Deploy -> New deployment -> Web app.
6. Execute as: Me.
7. Who has access: Anyone.
8. Copy the Web app URL.
9. Put that URL in `docs/pilot-demo/data/demo_manifest.json` and `.js`:

```json
"response_endpoint": "YOUR_WEB_APP_URL",
"response_endpoint_mode": "no-cors"
```

With `no-cors`, the browser can send responses to Apps Script, but cannot confirm the server reply. The sheet should still receive one row per answered trial.
