# Pull Request and Issue Management Guide

This guide documents how pull requests and issues are managed in this repository.

## Current Open Pull Requests

### PR #6: Refactor codebase to eliminate duplication and optimize performance
**Status**: Draft  
**Created**: Nov 5, 2025  
**Purpose**: Code refactoring and performance improvements

**Key Changes**:
- Created WalletManager class (eliminated ~300 lines of duplicate code)
- Extracted shared utilities to utils.js
- Optimized DOM operations with event delegation
- Security improvements (0 vulnerabilities found)

**Review Status**: Pending reviewer approval

---

### PR #5: Replace static mock data with persistent localStorage-backed state
**Status**: Draft  
**Created**: Nov 4, 2025  
**Purpose**: Add persistent state management

**Key Changes**:
- Implemented blockchain simulation layer
- Added persistent localStorage state
- Updated domain operations to use real state
- State persists across page refreshes

**Review Status**: Pending reviewer approval

---

### PR #4: Add local test suite
**Status**: Draft  
**Created**: Nov 3, 2025  
**Purpose**: Add Jest-based testing infrastructure

**Key Changes**:
- Added 78 unit tests across 3 modules
- Jest + jsdom configuration
- Test coverage for domain search, marketplace, and domain management
- Added .gitignore for test artifacts

**Review Status**: Pending reviewer approval

---

### PR #3: Optimize code performance
**Status**: Draft  
**Created**: Nov 2, 2025  
**Purpose**: Performance optimizations

**Key Changes**:
- Shared utilities module creation
- DOM query caching
- Consolidated constants
- Single-pass filtering for marketplace

**Review Status**: Pending reviewer approval

---

## PR Review Process

### For Contributors

1. **Before Creating a PR**:
   - Ensure your branch is up to date with main
   - Run any tests locally
   - Review your own code first
   - Check for security issues

2. **Creating the PR**:
   - Use the PR template
   - Provide clear description
   - Reference related issues
   - Add screenshots if applicable
   - Mark as draft if not ready for review

3. **During Review**:
   - Respond to feedback promptly
   - Make requested changes
   - Re-request review after updates
   - Keep the PR focused and small

4. **After Approval**:
   - Ensure all checks pass
   - Squash commits if requested
   - Wait for maintainer to merge

### For Reviewers

1. **Review Checklist**:
   - Code quality and standards
   - Security considerations
   - Performance impact
   - Documentation updates
   - Breaking changes
   - Test coverage

2. **Providing Feedback**:
   - Be constructive and specific
   - Explain the "why" behind suggestions
   - Distinguish between must-fix and nice-to-have
   - Approve when ready

3. **Merging**:
   - Ensure all checks pass
   - Verify branch is up to date
   - Use appropriate merge strategy
   - Delete branch after merge

## Issue Management

### Current State

- **Open Issues**: 0
- **Open PRs**: 4 (all draft)

### Issue Workflow

1. **New Issue**:
   - Triaged within 48 hours
   - Labeled appropriately
   - Assigned if clear owner
   - Linked to PR if fix is underway

2. **Active Issue**:
   - Regular updates
   - Status changes
   - Discussion and clarification
   - Priority adjustments

3. **Resolved Issue**:
   - Linked to PR that fixes it
   - Verified by reporter (if possible)
   - Closed when merged
   - Added to release notes

### Issue Labels

Common labels used:

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `security`: Security-related issues

## Best Practices

### For Pull Requests

✅ **Do**:
- Keep PRs small and focused
- Write clear commit messages
- Update documentation
- Add tests for new features
- Respond to reviews promptly

❌ **Don't**:
- Mix unrelated changes
- Force push after review starts
- Ignore review feedback
- Submit without testing

### For Issues

✅ **Do**:
- Use the issue templates
- Provide reproduction steps
- Include environment details
- Search for duplicates first
- Be respectful and patient

❌ **Don't**:
- Create duplicate issues
- Use issues for support questions
- Be vague or unclear
- Demand immediate attention

## Automated Processes

### Copilot Coding Agent

The repository uses Copilot Coding Agent to:
- Automatically address issues
- Create improvement PRs
- Respond to PR feedback
- Maintain code quality

Recent activity shows successful automated improvements across multiple areas.

### CI/CD

- Automatic deployment to GitHub Pages on merge to main
- Workflow status monitoring
- No test failures blocking merges

## Stale Issue/PR Policy

Currently all PRs are active (created within last week). Future policy:

- PRs with no activity for 30 days will be marked stale
- Issues with no activity for 60 days will be marked stale  
- Stale items will be closed after 14 additional days without activity
- Items can be reopened if still relevant

## Metrics and Tracking

### Current Stats

- **PR Success Rate**: 100% (all completed PRs merged successfully)
- **Average PR Time to Merge**: ~1 day for simple changes
- **Issue Response Time**: < 48 hours
- **Open Issue Age**: N/A (no open issues)

### Goals

- Keep PR count manageable (< 10 open at once)
- Respond to new issues within 48 hours
- Merge or close PRs within 2 weeks
- Maintain 100% CI pass rate

## Getting Help

- Questions about PRs or issues? Open a discussion
- Need reviewer? Tag @kfrye1212
- Security concerns? See SECURITY.md
- General questions? Create an issue

---

Last Updated: November 2025
