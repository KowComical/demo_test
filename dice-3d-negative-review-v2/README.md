# DICE-3D Negative Candidate Review v2

This is an internal A/B review site for screening newly generated controlled
negative candidates. It is deliberately separate from the existing v1.1
participant and researcher pages.

## Review bank

- 8 matched-positive base clips.
- 2 independently selected context-swap candidates per base.
- 2 independently selected arms/hands-swap candidates per base.
- 40 videos and 32 randomized A/B trial pools.
- 5-second, 30 fps software-mesh renders with matched positive audio.

The page shows the negative type and candidate number in review mode but never
reveals which side contains the matched positive. Responses are stored locally,
can be exported as JSON/CSV, and are also sent to the configured Google Apps
Script endpoint.

This bank is for screening only. It is not a locked formal pilot set.
