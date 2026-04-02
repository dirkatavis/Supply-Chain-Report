# Supply Chain Report

## Project overview
Centralized dashboard tracking KPIs and project milestones for supply chain operations. Transforms raw data into actionable insights for stakeholder reporting.

## FRA Profile

- **name:** Supply Chain Report
- **repo:** dirkatavis/Supply-Chain-Report
- **stack:** HTML, CSS, JS, Python, CSV, YAML
- **deploy:** GitHub Pages (auto-deploys from main)
- **datasources:** Google Sheets (KPI data — source of truth, fetched as published CSV), config.yaml (responsibilities and reference lines). status.csv in the repo is not used by the live dashboard.
- **testing:** python test_data.py — covers CSV/YAML validation, KPI processing, status/color mapping, chart data prep, UI rendering logic. CI runs automatically on PRs to dev/main via GitHub Actions.
- **git:** Feature branches (feature/<name>), PR required before merge to dev/main, GitHub Actions CI runs on every PR
Git: Check the current branch before doing anything. 
If on main: auto-create a feature/<name>, chore/<name> or bugfix/<name> branch appropriate to the work. 
If already on a feature or bugfix branch: ask the user whether to continue on this branch or create a new one.
Never commit directly to main or dev.
- **owners:** Dirk Steele (Supply Management)
- **deployNotes:** GitHub Pages auto-deploys from main after merge. No manual deploy step required.
- **gotchas:** Oil reference line already includes delivery buffer — do not subtract delivery lag a second time. Average consumption calculated since last refill only. Tank capacity hardcoded: oil_0_20 = 500 gal, oil_5_30 = 1000 gal. Deadline and Bingo Date are the same concept — use Deadline in the dashboard. Refill events detected by upward level jump. Google Sheets is the source of truth for all KPI data — do not switch the fetch URL in index.html to a relative path (status.csv); doing so will break charts for any metrics not present in the repo CSV.

## Build and test
- Run tests: `python test_data.py`
- Local dev: `python3 -m http.server 8000`
- Live URL: https://dirkatavis.github.io/Supply-Chain-Report/
