import puppeteer, { Browser, Page } from 'puppeteer';
import { EventEmitter } from 'events';
import { sessionManager, BrowserSession, SessionStep } from './session-manager';

interface BrowserInstance {
  browser: Browser;
  page: Page;
  session: BrowserSession;
  isPaused: boolean;
  shouldStop: boolean;
}

class PuppeteerController extends EventEmitter {
  private instances: Map<string, BrowserInstance> = new Map();

  constructor() {
    super();
    this.setupSessionListeners();
  }

  private setupSessionListeners() {
    sessionManager.on('session:control_changed', ({ sessionId, controller }) => {
      const instance = this.instances.get(sessionId);
      if (instance) {
        if (controller === 'USER') {
          instance.isPaused = true;
          console.log(`[PuppeteerController] Pausing automation for session ${sessionId} - user took control`);
        } else {
          instance.isPaused = false;
          console.log(`[PuppeteerController] Resuming automation for session ${sessionId} - AI has control`);
          this.emit('resume', sessionId);
        }
      }
    });

    sessionManager.on('session:paused', ({ sessionId }) => {
      const instance = this.instances.get(sessionId);
      if (instance) {
        instance.isPaused = true;
      }
    });

    sessionManager.on('session:resumed', ({ sessionId }) => {
      const instance = this.instances.get(sessionId);
      if (instance) {
        instance.isPaused = false;
        this.emit('resume', sessionId);
      }
    });
  }

  async launchBrowser(session: BrowserSession): Promise<void> {
    const displayNum = session.displayNum;
    
    console.log(`[PuppeteerController] Launching browser for session ${session.id} on display :${displayNum}`);

    try {
      const browser = await puppeteer.launch({
        headless: false,
        args: [
          `--display=:${displayNum}`,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--window-size=1920,1080',
          '--start-maximized',
        ],
        defaultViewport: {
          width: 1920,
          height: 1080,
        },
      });

      const page = await browser.newPage();
      
      // Set a reasonable timeout
      page.setDefaultTimeout(30000);
      page.setDefaultNavigationTimeout(30000);

      const instance: BrowserInstance = {
        browser,
        page,
        session,
        isPaused: false,
        shouldStop: false,
      };

      this.instances.set(session.id, instance);
      sessionManager.updateSessionState(session.id, 'AI_CONTROL');

      // Navigate to initial URL if provided
      if (session.url) {
        await this.navigateTo(session.id, session.url);
      }

      console.log(`[PuppeteerController] Browser launched successfully for session ${session.id}`);
      this.emit('browser:launched', { sessionId: session.id });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[PuppeteerController] Failed to launch browser: ${errorMessage}`);
      sessionManager.setError(session.id, `Failed to launch browser: ${errorMessage}`);
      throw error;
    }
  }

  async navigateTo(sessionId: string, url: string): Promise<void> {
    const instance = this.instances.get(sessionId);
    if (!instance) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      console.log(`[PuppeteerController] Navigating to ${url}`);
      await instance.page.goto(url, { waitUntil: 'networkidle2' });
      
      sessionManager.addStep(sessionId, {
        action: `Navigate to ${url}`,
        result: 'Successfully loaded page',
        status: 'completed',
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sessionManager.addStep(sessionId, {
        action: `Navigate to ${url}`,
        result: `Failed: ${errorMessage}`,
        status: 'failed',
      });
      throw error;
    }
  }

  async executeStep(sessionId: string, action: string, script?: string): Promise<SessionStep | undefined> {
    const instance = this.instances.get(sessionId);
    if (!instance) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Wait if paused (user has control)
    while (instance.isPaused && !instance.shouldStop) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (instance.shouldStop) {
      return undefined;
    }

    try {
      console.log(`[PuppeteerController] Executing step: ${action}`);
      
      let result = 'Step completed';
      
      if (script) {
        // Execute custom script
        result = await instance.page.evaluate(script);
      }

      // Take screenshot after step
      const screenshot = await instance.page.screenshot({ encoding: 'base64' });

      const step = sessionManager.addStep(sessionId, {
        action,
        result: typeof result === 'string' ? result : JSON.stringify(result),
        status: 'completed',
        screenshot: `data:image/png;base64,${screenshot}`,
      });

      return step;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      const step = sessionManager.addStep(sessionId, {
        action,
        result: `Failed: ${errorMessage}`,
        status: 'failed',
      });

      return step;
    }
  }

  async click(sessionId: string, selector: string): Promise<void> {
    const instance = this.instances.get(sessionId);
    if (!instance) throw new Error(`Session ${sessionId} not found`);

    while (instance.isPaused && !instance.shouldStop) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    await instance.page.click(selector);
    sessionManager.addStep(sessionId, {
      action: `Click on ${selector}`,
      result: 'Clicked successfully',
      status: 'completed',
    });
  }

  async type(sessionId: string, selector: string, text: string): Promise<void> {
    const instance = this.instances.get(sessionId);
    if (!instance) throw new Error(`Session ${sessionId} not found`);

    while (instance.isPaused && !instance.shouldStop) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    await instance.page.type(selector, text);
    sessionManager.addStep(sessionId, {
      action: `Type into ${selector}`,
      result: 'Text entered successfully',
      status: 'completed',
    });
  }

  async waitForSelector(sessionId: string, selector: string, timeout: number = 30000): Promise<void> {
    const instance = this.instances.get(sessionId);
    if (!instance) throw new Error(`Session ${sessionId} not found`);

    await instance.page.waitForSelector(selector, { timeout });
  }

  async getScreenshot(sessionId: string): Promise<string> {
    const instance = this.instances.get(sessionId);
    if (!instance) throw new Error(`Session ${sessionId} not found`);

    const screenshot = await instance.page.screenshot({ encoding: 'base64' });
    return `data:image/png;base64,${screenshot}`;
  }

  async getPageContent(sessionId: string): Promise<string> {
    const instance = this.instances.get(sessionId);
    if (!instance) throw new Error(`Session ${sessionId} not found`);

    return await instance.page.content();
  }

  async getPageUrl(sessionId: string): Promise<string> {
    const instance = this.instances.get(sessionId);
    if (!instance) throw new Error(`Session ${sessionId} not found`);

    return instance.page.url();
  }

  getPage(sessionId: string): Page | undefined {
    return this.instances.get(sessionId)?.page;
  }

  isPaused(sessionId: string): boolean {
    return this.instances.get(sessionId)?.isPaused ?? false;
  }

  async closeBrowser(sessionId: string): Promise<void> {
    const instance = this.instances.get(sessionId);
    if (instance) {
      instance.shouldStop = true;
      
      try {
        await instance.browser.close();
        console.log(`[PuppeteerController] Browser closed for session ${sessionId}`);
      } catch (error) {
        console.error(`[PuppeteerController] Error closing browser: ${error}`);
      }

      this.instances.delete(sessionId);
      this.emit('browser:closed', { sessionId });
    }
  }

  async closeAllBrowsers(): Promise<void> {
    const sessionIds = Array.from(this.instances.keys());
    await Promise.all(sessionIds.map(id => this.closeBrowser(id)));
  }
}

// Singleton instance
export const puppeteerController = new PuppeteerController();
