# Deployment & Branching Process

## Branching Strategy
- **main**: The production branch. Only stable, reviewed, and tested code is merged here. GitHub Pages is configured to publish the live dashboard from this branch.
- **feature/* or dev**: Feature development and staging branches. All new features, bug fixes, and experiments are developed here. Example: `feature/GraphLine`.
- **Pull Requests**: All changes are proposed via pull requests from feature branches into `main`. Code is reviewed and tested before merging.

## Deployment Workflow
1. **Development**
   - Developers create or switch to a feature branch (e.g., `feature/GraphLine`).
   - All changes and testing are done in this branch.
   - Optionally, GitHub Pages can be configured to publish from the feature branch for preview/testing (e.g., for QA or stakeholder review).

2. **Testing & Review**
   - Once a feature is ready, a pull request is opened from the feature branch to `main`.
   - Automated checks (tests, linting) run via GitHub Actions (if configured).
   - Code is reviewed by team members.

3. **Production Release**
   - After approval, the pull request is merged into `main`.
   - GitHub Pages automatically updates the live site from the latest `main` branch.

4. **Post-Release**
   - Monitor the production site for issues.
   - Begin new features or fixes in new feature branches as needed.

## Environment URLs
- **Production:** Published from `main` branch (e.g., `https://<username>.github.io/<repo>/`)
- **Development/Preview:** Published from feature or dev branches (e.g., `https://<username>.github.io/<repo>/feature/GraphLine/` if configured)

## Best Practices
- Never commit directly to `main`.
- Always use feature branches for new work.
- Use pull requests for all merges to `main`.
- Review and test all changes in a preview environment before production release.
- Keep documentation up to date with process changes.

---
This process ensures safe, reliable deployments and clear separation between development and production environments.
