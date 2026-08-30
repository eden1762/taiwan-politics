# Taiwan Politics site architecture

This project intentionally stays a static, zero-build Vercel site: plain HTML, CSS and JavaScript.

## Single-source rules

- There is exactly one HTML page for each public route: `index.html`, `mayor-2026.html`, `council-2026.html`, `president-2028.html`, `method.html`, `sovereignty.html`.
- Do **not** create `*-en.html` copies. English uses the same URL with `?lang=en` and the same data/model code.
- `election-data.js` is the canonical election/model dataset used by `app.js`.
- `site-research.js` is the canonical research bridge for post-2024 historical polling and the 2022 council-seat baseline. Comparable historical party polls are merged into `ELECTION_DATA.councilPolls` before `app.js` runs, so the main forecast and trend charts use the same polling pool.
- `data.js` remains the canonical civic/sovereignty dataset. Do not copy those records into election files.
- `app.js` remains the canonical base forecast/rendering engine.
- `site-enhancements.js` is the shared progressive-enhancement layer for IG/language controls, map-reading legends, monthly backcasts, council seat proxy and presidential national-vote cards.
- `site-enhancements.css` contains only the shared enhancement styles. No per-page duplicate stylesheet is required.

## Poll ordering and weighting

- Calculation inputs are sorted from older to newer before pooling.
- Display tables are sorted from newer to older for readers.
- Poll weights use the existing inverse-total-variance model plus exponential time decay, so older polls lose influence automatically.
- Different question types are not silently mixed. Direct candidate vote, party support/preference, favorability and intra-party candidate preference remain distinguishable.

## Trend charts

Trend charts are historical **backcasts**, not retroactive publication claims. Each monthly point reruns the model using only polls with `fieldEnd <= month end`.

- Mayor chart: 22 county/city chief offices by the model-leading camp.
- Council chart: low-confidence 910-seat proxy anchored to actual 2022 seats and adjusted by national party swing.
- President chart: national scenario vote totals using the fixed 2024 valid-vote baseline (13,947,506), not a 2028 turnout forecast.

## Deployment

Vercel is linked directly to `eden1762/taiwan-politics`. Feature branches create Preview deployments; `main` creates the Production deployment. There is no build step.
