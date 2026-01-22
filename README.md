# Supply-Chain-Report

This dashboard provides a centralized overview of key performance indicators and project milestones, synthesized from raw data to track operational efficiency. By transforming complex datasets into actionable insights, this page facilitates transparent progress tracking. These metrics reflect project health and cumulative output for stakeholders.

## 🚀 Accessing the Dashboard

### GitHub Pages Deployment

Once this repository is deployed to GitHub Pages, the dashboard will be accessible at:

```
https://dirkatavis.github.io/Supply-Chain-Report/
```

### Enable GitHub Pages

To deploy this dashboard to GitHub Pages:

1. Go to your repository on GitHub: `https://github.com/dirkatavis/Supply-Chain-Report`
2. Click on **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar under "Code and automation")
4. Under **Source**, select the branch you want to deploy (e.g., `main` or `copilot/create-project-status-dashboard`)
5. Select **/ (root)** as the folder
6. Click **Save**
7. Wait a few minutes for GitHub to build and deploy
8. Your dashboard will be live at the URL shown on the Pages settings page

### Local Development

To view the dashboard locally:

```bash
# Clone the repository
git clone https://github.com/dirkatavis/Supply-Chain-Report.git
cd Supply-Chain-Report

# Start a simple HTTP server (Python 3)
python3 -m http.server 8000

# Or use Python 2
python -m SimpleHTTPServer 8000

# Or use Node.js
npx serve

# Open your browser to:
# http://localhost:8000
```

## 📊 Dashboard Features

- **Current Status Cards**: Real-time KPI metrics with color-coded status indicators
- **Progress Over Time**: Interactive chart showing trends across multiple KPIs
- **Recent Activity**: Searchable table of the latest 10 KPI updates
- **General Responsibilities**: Quick reference sidebar with key responsibilities

## 🔧 Updating Data

### Update KPIs (`status.csv`)

Edit the `status.csv` file to add new KPI entries:

```csv
date,kpi_name,kpi_value,status_color,notes
2026-01-23,New KPI Name,95,Green,Performance exceeds expectations
```

### Update Configuration (`config.yaml`)

Edit the `config.yaml` file to change personal info or responsibilities:

```yaml
Name: Your Name
Role: Your Role
General Responsibilities:
  - Responsibility 1
  - Responsibility 2
```

After updating, commit and push the changes to GitHub. The dashboard will automatically refresh with the new data when accessed.
