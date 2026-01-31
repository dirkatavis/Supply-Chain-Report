# Copilot Instructions for Supply-Chain-Report

## Project Overview
- **Purpose:** A static dashboard for visualizing supply chain KPIs and milestones, designed for GitHub Pages deployment.
- **Key Files:**
  - `index.html`: Main dashboard UI and logic (all code is in this file)
  - `status.csv`: Source data for KPIs and activity
  - `config.yaml`: Personal info and responsibilities
  - `README.md`: Usage, deployment, and update instructions

## Architecture & Data Flow
- **Single-Page App:** All logic and rendering are in `index.html` (no separate JS/CSS files).
- **Data Loading:**
  - Loads `status.csv` and `config.yaml` via HTTP fetch (works on GitHub Pages, not file://)
  - Parses CSV for KPI history and YAML for user/responsibility info
- **UI Structure:**
  - KPI cards, trend chart, recent activity table, and sidebar
  - Color/status logic is driven by `status.csv` values

## Developer Workflows
- **Local Preview:**
  - Use `python3 -m http.server 8000` or `npx serve` to preview locally (must use HTTP, not file://)
- **Data Update:**
  - Edit `status.csv` for new KPIs or updates
  - Edit `config.yaml` for user/responsibility changes
  - Commit and push; dashboard auto-refreshes on reload
- **Deployment:**
  - Deploy via GitHub Pages (see README)

## Project-Specific Conventions
- **No frameworks:** Pure HTML/JS/CSS in a single file
- **No build step:** All code is hand-edited; no bundler or transpiler
- **Data format:** CSV for KPIs, YAML for config; both must be valid and parseable
- **Color/status:** Use `status_color` in CSV for card coloring (e.g., Green, Yellow, Red)

## Integration & Extensibility
- **No external APIs:** All data is local to the repo
- **Adding new KPIs:** Add rows to `status.csv` with new `kpi_name`
- **Adding new responsibilities:** Add items to `General Responsibilities` in `config.yaml`

## Examples
- To add a new KPI: append to `status.csv`:
  ```csv
  2026-02-01,Inventory Turnover,7.2,Yellow,Needs improvement
  ```
- To update responsibilities: edit `config.yaml`:
  ```yaml
  General Responsibilities:
    - Inventory Management
    - Supplier Coordination
  ```

---
For more, see [README.md](../README.md).