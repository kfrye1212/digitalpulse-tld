# GitHub Actions Workflows

This document describes the GitHub Actions workflows configured for this repository.

## Active Workflows

### 1. Pages Build and Deployment

**Workflow File**: `.github/workflows/pages/pages-build-deployment` (Dynamic)

**Purpose**: Automatically builds and deploys the application to GitHub Pages.

**Triggers**:
- Push to `main` branch
- Manual workflow dispatch

**Status**: [![Pages Build and Deployment](https://github.com/kfrye1212/digitalpulse-tld/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/kfrye1212/digitalpulse-tld/actions/workflows/pages/pages-build-deployment)

**What it does**:
1. Checks out the repository code
2. Builds the static site
3. Deploys to GitHub Pages
4. Makes the site available at https://kfrye1212.github.io/digitalpulse-tld/

**Recent Runs**: All deployments have been successful

---

### 2. Copilot Coding Agent

**Workflow File**: `.github/workflows/copilot-swe-agent/copilot` (Dynamic)

**Purpose**: Automated code improvements and issue resolution using GitHub Copilot.

**Triggers**:
- Issue creation
- Pull request comments
- Manual workflow dispatch

**What it does**:
1. Analyzes code for improvements
2. Addresses issues automatically
3. Creates pull requests with fixes
4. Responds to code review comments

**Recent Activity**:
- Successfully completed 8 workflow runs
- Created and managed multiple improvement PRs
- All runs completed successfully

---

## Workflow History

All workflows are monitored and maintained. Recent statistics:

- **Total Copilot Runs**: 8
- **Success Rate**: 100%
- **Total Pages Deployments**: 5
- **Deployment Success Rate**: 100%

## Monitoring Workflows

### View Workflow Runs

1. Navigate to the [Actions tab](https://github.com/kfrye1212/digitalpulse-tld/actions)
2. Select the workflow you want to monitor
3. View individual run details, logs, and artifacts

### Workflow Status Badges

Workflow status badges are displayed in the main README to show real-time status of deployments.

## Troubleshooting

### Pages Deployment Issues

If pages deployment fails:
1. Check the workflow logs
2. Verify GitHub Pages is enabled in repository settings
3. Ensure the source branch is set to `main`
4. Check for any build errors in HTML/CSS/JS files

### Copilot Workflow Issues

The Copilot workflow operates autonomously:
- Monitors issues and PRs
- Creates automated improvements
- Requires appropriate permissions

## Adding New Workflows

To add a new workflow:

1. Create a `.github/workflows/[workflow-name].yml` file
2. Define triggers, jobs, and steps
3. Test in a separate branch first
4. Merge to main after verification

## Security Considerations

- Workflows use repository secrets for sensitive data
- No secrets or credentials are exposed in logs
- All workflows run in isolated GitHub-hosted runners
- Permissions are set to minimum required access

## Best Practices

- Keep workflows focused and single-purpose
- Use caching to speed up builds
- Set appropriate timeouts
- Monitor workflow usage and costs
- Document any custom workflows

---

For more information about GitHub Actions, visit the [official documentation](https://docs.github.com/en/actions).
