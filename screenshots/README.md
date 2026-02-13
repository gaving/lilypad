# Screenshots

This directory contains placeholder screenshots for the README.

## Current Placeholders

- `dashboard-light.svg` - Light mode dashboard
- `dashboard-dark.svg` - Dark mode dashboard  
- `bulk-actions.svg` - Bulk actions feature

## How to Replace

1. **Run Lilypad locally:**
   ```bash
   docker run -d -p 8080:8888 -v /var/run/docker.sock:/var/run/docker.sock ghcr.io/gaving/lilypad:latest
   ```

2. **Take screenshots:**
   - Open http://localhost:8080
   - Use browser dev tools (F12) → Toggle device toolbar for consistent sizing
   - Screenshot dimensions: 1200x800 pixels

3. **Replace files:**
   - Save light mode as `dashboard-light.png`
   - Save dark mode as `dashboard-dark.png`
   - Save bulk actions as `bulk-actions.png`

4. **Update README:**
   Change file extensions from `.svg` to `.png` in README.md

## Recommended Screenshots

1. **Dashboard (Light)** - Show running/stopped/pinned containers
2. **Dashboard (Dark)** - Same view in dark mode
3. **Bulk Actions** - Show checkboxes selected and bulk action bar
4. **Mobile View** - Responsive layout on mobile (optional)
5. **Logs View** - Expanded container with logs visible (optional)

## Tools

- **macOS:** Cmd+Shift+4 (area screenshot)
- **Windows:** Win+Shift+S (Snipping Tool)
- **Browser:** DevTools → Capture screenshot
- **Chrome Extension:** GoFullPage for full page screenshots
