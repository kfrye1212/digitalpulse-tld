# GitHub Pages Deployment Guide

This document provides step-by-step instructions for deploying the Digital Pulse TLD dApp to GitHub Pages with custom domain support.

## Prerequisites

- GitHub account with repository access
- Domain name (e.g., www.chainpulse.info) with DNS management access
- Basic understanding of DNS configuration

## Setup Instructions

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/kfrye1212/digitalpulse-tld
2. Click on **Settings** (top navigation)
3. Click on **Pages** (left sidebar under "Code and automation")
4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - The workflow `.github/workflows/pages.yml` will automatically handle deployments

### Step 2: Verify Deployment

1. Push changes to the `main` branch (or any branch)
2. Go to the **Actions** tab in your repository
3. Watch the "Deploy to GitHub Pages" workflow run
4. Once complete (green checkmark), your site will be live at:
   - https://kfrye1212.github.io/digitalpulse-tld/

### Step 3: Configure Custom Domain (Optional)

#### In GitHub:

1. Go to **Settings** → **Pages**
2. Under "Custom domain", enter: `www.chainpulse.info`
3. Click **Save**
4. Wait for DNS check to complete (green checkmark)
5. Once verified, check "Enforce HTTPS" (recommended)

#### In Your DNS Provider (GoDaddy, Cloudflare, etc.):

**Using www Subdomain (Recommended for this setup):**
Add a CNAME record:

```
Type: CNAME
Name: www
Value: kfrye1212.github.io
TTL: 600
```

**Optional: Redirect apex domain to www**
If you want chainpulse.info to redirect to www.chainpulse.info:
```
Type: URL Redirect (or ALIAS/ANAME if supported)
Name: @ (or chainpulse.info)
Target: https://www.chainpulse.info
```

### Step 4: Verify DNS Configuration

1. Wait 5-30 minutes for DNS propagation
2. Check DNS propagation at: https://www.whatsmydns.net/
3. Test your domain: https://www.chainpulse.info
4. Verify HTTPS is working

## Troubleshooting

### Site not loading
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Verify DNS records are correct
- Check DNS propagation status
- Wait longer (can take up to 48 hours in rare cases)

### Workflow failing
- Check Actions tab for error messages
- Ensure Pages is enabled in Settings
- Verify workflow file syntax is correct
- Check repository permissions

### Custom domain not working
- Verify CNAME file contains only domain name (no http://, no trailing slash)
- Ensure DNS records point to correct GitHub Pages IPs
- Check that domain is verified in GitHub Settings
- Wait for DNS propagation

### HTTPS not available
- Custom domain must be verified first
- DNS must be properly configured
- Wait a few minutes after DNS verification
- Try unchecking and re-checking "Enforce HTTPS"

## Files Reference

- `.github/workflows/pages.yml` - GitHub Actions workflow for deployment
- `CNAME` - Custom domain configuration
- `.nojekyll` - Bypasses Jekyll processing (important for static sites)
- `.gitignore` - Git ignore rules

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Custom Domain Configuration](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Troubleshooting Custom Domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)

## Updating the Site

To update the site:
1. Make changes to HTML, CSS, or JS files
2. Commit and push to `main` branch
3. GitHub Actions will automatically deploy updates
4. Changes will be live in 1-2 minutes

---

**Need Help?** Open an issue in the repository or contact the development team.
