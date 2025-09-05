# PWA Testing Notes

This guide explains how to test the Progressive Web App (PWA) features using Google Chrome's DevTools.

## 1. Opening DevTools

Right-click anywhere on the page and select "Inspect", or use the shortcut `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Opt+I` (Mac).

## 2. The "Application" Tab

Most PWA testing is done in the "Application" tab of DevTools.

### Service Worker Testing

1.  Navigate to **Application > Service Workers**.
2.  **Verify Registration**: You should see a service worker listed with the source `sw.js`. Its status should be "activated and is running".
3.  **Debugging Tools**:
    *   **Offline**: Check this box to simulate being completely offline. The app should still load and function using cached data.
    *   **Update on reload**: A very useful tool for development. It forces the service worker to update every time you reload the page.
    *   **Bypass for network**: This tells the browser to ignore the service worker and always fetch from the network. Use this if you suspect the service worker is causing issues with updates.
    *   **Unregister**: You can manually unregister the service worker here.

### Cache Inspection

1.  Navigate to **Application > Storage > Cache Storage**.
2.  You should see a cache named `incident-dashboard-v1`.
3.  Click on it to see all the cached assets.
    *   **Pre-cached Assets**: You will see `/`, `/index.html`, etc., which were cached during the `install` event.
    *   **Runtime Caching**: As you navigate and use the app, you will see new entries appear. Look for API calls (e.g., `/api/incidents`) and static assets (like the bundled JS/CSS files).
4.  You can right-click and delete the cache to test the caching process from scratch.

### Testing Offline Mode

1.  Open the application and navigate around to populate the cache.
2.  Go to the **Application > Service Workers** tab and check the **Offline** box.
3.  Reload the page (`F5` or `Ctrl+R`).
4.  **Expected Behavior**: The application should load and display the last-fetched data from the cache, even though you are offline. The "Offline Outbox" system should queue any actions you take.
5.  Uncheck the "Offline" box. The outbox should process its queue, and the UI should update with fresh data.

### Web App Manifest & Installability

1.  Navigate to **Application > Manifest**.
2.  **Verify Manifest**: You should see the details from `manifest.json` displayed correctly (App Name, Start URL, Icons, etc.).
3.  **Install Prompt**: An "Add to Home Screen" button should be available in the address bar (usually an icon of a monitor with a down arrow). You can also trigger the installation from the "Application" tab.
4.  After installing, the app should appear on your desktop or mobile home screen and launch in its own standalone window.

## 3. Responsive Design Testing

1.  Click the "Toggle device toolbar" icon (looks like a phone and tablet) in the top-left of DevTools, or use `Ctrl+Shift+M` / `Cmd+Shift+M`.
2.  This will switch to a mobile view. You can select different device presets from the dropdown at the top (e.g., "iPhone 12 Pro", "Pixel 5").
3.  **Expected Behavior on Mobile**:
    *   The KPI cards at the top should stack into a single vertical column.
    *   The main filters panel should be hidden.
    *   A "Filters" button should be visible. Clicking it should open a slide-in drawer from the right with all the filter controls.
    *   The main content (Map and Tables) should reflow into a single-column layout.
