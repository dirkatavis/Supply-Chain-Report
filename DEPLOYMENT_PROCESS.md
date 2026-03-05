# Dashboard Deployment & Development Process

The process ensures safe, reliable updates and consistent behavior between your local workspace and the live site.

## 1. Branching Strategy
- **main**: The production branch. Only stable, reviewed code is merged here for live deployment.
- **feature/* branches**: All new features, renaming, and fixes are developed and tested here first.

## 2. Development & Local Testing
- **Create Branch:** `git checkout -b feature/your-fix-name`
- **Make Changes:** Update HTML/JS/CSS, YAML config, or CSV headers.
- **Run Local Server:** Use `python launch.py` to preview. 
- **Inspect Logic:** Always press **F12** to check the **Console**. Verify that data headers from your spreadsheet match the keys in the code exactly to avoid scale regressions.

## 3. Remote Verification (Vercel)
- **Push Branch:** `git push -u origin feature/your-fix-name`
- **Deploy Preview:** Open the Vercel **Preview URL** for your branch. This allows you to verify the dashboard logic in a "live" environment before impacting the production site.

## 4. Pull Request & Merge
- **Open PR:** Submit a Pull Request from your feature branch to `main`.
- **Review:** Use the PR diff to ensure no accidental changes to formatting or logic.
- **Merge:** Merge the PR once you are 100% satisfied with the Vercel preview. **Never merge direct to main.**

## 5. Deployment Sync
- **Live Update:** The production site automatically redeploys from `main`.
- **Local Sync:**
  ```powershell
  git checkout main
  git pull origin main
  ```

---
*Pro-Tip: When renaming metrics, always ensure the Google Sheet column header matches the new key in the code simultaneously.*

