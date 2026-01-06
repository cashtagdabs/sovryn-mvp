# Browser Streaming & Control Handoff Research

## Option 1: Browserless.io (Recommended for Quick Implementation)

### Key Features:
- **liveURL API**: Returns a fully-qualified, user-shareable URL for streaming browser to end-user
- **Interactive mode**: Can enable/disable user interaction
- **Hybrid Automations**: Perfect for login handoff scenarios
- **No token in URL**: Safe to share with users

### How it works:
1. Connect to Browserless via Puppeteer
2. Navigate to target page
3. Call `Browserless.liveURL` via CDP session
4. Share URL with user (can embed in iframe)
5. Listen for `Browserless.liveComplete` event when user finishes
6. Continue automation

### Code Example:
```javascript
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.connect({
  browserWSEndpoint: 'ws://localhost:3000?token=YOUR-API-TOKEN',
});
const page = await browser.newPage();
await page.goto('https://target-site.com/');

const cdp = await page.createCDPSession();
const { liveURL } = await cdp.send('Browserless.liveURL');

// Share liveURL with user - embed in iframe or open new window
console.log(`Shareable Public URL:`, liveURL);

// Wait for user to complete their action
await new Promise((r) => cdp.on('Browserless.liveComplete', r));

// Continue with automation
```

### liveURL Parameters:
- `timeout`: Max time for browser to remain alive
- `interactable`: Boolean - allow user interaction (default: true)
- `type`: jpeg or png for stream quality
- `quality`: 1-100 for jpeg quality
- `resizable`: Match user's screen size
- `showBrowserInterface`: Show browser tabs/nav bar

### Pricing:
- Paid tiers only (Scale/Enterprise)
- Session reconnects available
- Custom deployments up to thousands of concurrencies

### Session Persistence:
- Use `--user-data-dir` flag with unique identifier
- Cookies/sessions persist for 7 days
- Users don't need to login every time

## Option 2: Self-Hosted noVNC + Puppeteer

### Components:
- Xvfb (virtual framebuffer)
- VNC server
- noVNC (WebSocket to VNC bridge)
- Puppeteer running in the virtual display

### Pros:
- Full control
- No external dependencies
- Lower cost at scale

### Cons:
- More complex setup
- Need to manage infrastructure
- Higher latency

## Option 3: puppeteer-stream

### Features:
- npm package for audio/video streaming from Puppeteer
- Can stream to file or real-time
- Good for recording, not ideal for interactive control

## Recommendation for Sovryn MVP

**Use Browserless.io** because:
1. Quick integration (just add API calls)
2. Already has socket.io in project for real-time events
3. Existing TakeOver infrastructure can be extended
4. Professional-grade streaming quality
5. Built-in session persistence
6. No infrastructure to manage

### Integration Plan:
1. Add Browserless API key to environment
2. Create new API route for browser sessions
3. Extend TakeOverPanel to show liveURL iframe
4. Add WebSocket events for session state
5. Implement handoff flow: AI runs → needs login → shows liveURL → user completes → AI resumes
