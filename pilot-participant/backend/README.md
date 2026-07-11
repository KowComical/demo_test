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

The frontend writes with `no-cors` and then verifies receipt with a JSONP `doGet` request using `response_id`.
If the Apps Script deployment has the current template, the page can mark responses as `sent_verified`.
If the deployment is still the older `doPost`-only version, the row may still be written, but the page will show `sent_unconfirmed`.

When updating an existing Apps Script deployment, use **Deploy -> Manage deployments -> Edit -> New version**. Pasting code without creating a new deployed version will not update the live Web App URL.

## Other Backend Options

- Supabase table with insert-only Row Level Security: good CORS support and easy CSV export.
- Cloudflare Worker + D1/KV/R2: small custom API with explicit CORS and full control over storage.
- Firebase/Firestore: works from a static page if security rules are configured carefully.
- Vercel/Netlify function + database: clean API, but requires deploying a serverless function and storage.

Do not call the GitHub API directly from the browser with a token; it would expose write credentials.
