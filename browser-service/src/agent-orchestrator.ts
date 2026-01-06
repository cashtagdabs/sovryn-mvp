/**
 * PRIMEX SOVEREIGN - Agent Orchestrator
 * 
 * The "brain" that connects the NAVIGATOR LLM to browser automation.
 * This is the core agent loop that:
 * 1. Takes a task from the user
 * 2. Gets the current page state
 * 3. Asks NAVIGATOR for the next action
 * 4. Executes the action
 * 5. Repeats until done or human takeover needed
 */

import { puppeteerController } from './puppeteer-controller';
import { sessionManager } from './session-manager';
import { EventEmitter } from 'events';

interface AgentAction {
  thought: string;
  action: 'click' | 'type' | 'scroll' | 'navigate' | 'wait' | 'done' | 'need_human';
  target?: string;
  value?: string;
  confidence: number;
}

interface AgentConfig {
  ollamaUrl: string;
  model: string;
  maxSteps: number;
  confidenceThreshold: number;
}

const DEFAULT_CONFIG: AgentConfig = {
  ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  model: process.env.NAVIGATOR_MODEL || 'navigator',
  maxSteps: 20,
  confidenceThreshold: 0.7,
};

export class AgentOrchestrator extends EventEmitter {
  private config: AgentConfig;
  private runningTasks: Map<string, boolean> = new Map();

  constructor(config: Partial<AgentConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Run a browser automation task
   */
  async runTask(sessionId: string, task: string): Promise<{ success: boolean; message: string }> {
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      return { success: false, message: 'Session not found' };
    }

    if (this.runningTasks.get(sessionId)) {
      return { success: false, message: 'Task already running for this session' };
    }

    this.runningTasks.set(sessionId, true);
    console.log(`[AgentOrchestrator] Starting task: "${task}" for session ${sessionId}`);

    try {
      for (let step = 0; step < this.config.maxSteps; step++) {
        // Check if task was cancelled
        if (!this.runningTasks.get(sessionId)) {
          return { success: false, message: 'Task cancelled' };
        }

        // Check if user has taken control
        if (session.state === 'USER_CONTROL') {
          console.log(`[AgentOrchestrator] User has control, waiting...`);
          this.emit('waiting_for_user', { sessionId, step });
          await this.waitForAIControl(sessionId);
          continue;
        }

        // Get current page state
        const pageInfo = await puppeteerController.getPageInfo(sessionId);
        const screenshot = await puppeteerController.getScreenshot(sessionId);

        // Emit progress
        this.emit('step_start', { sessionId, step: step + 1, pageInfo });

        // Ask NAVIGATOR for next action
        const action = await this.getNextAction(task, pageInfo, step);
        console.log(`[AgentOrchestrator] Step ${step + 1}: ${action.action} - ${action.thought}`);

        // Emit the action decision
        this.emit('action_decided', { sessionId, step: step + 1, action });

        // Handle low confidence - request human takeover
        if (action.confidence < this.config.confidenceThreshold || action.action === 'need_human') {
          console.log(`[AgentOrchestrator] Requesting human takeover: ${action.thought}`);
          sessionManager.requestTakeover(sessionId, action.thought);
          this.emit('takeover_requested', { sessionId, reason: action.thought });
          await this.waitForAIControl(sessionId);
          continue;
        }

        // Check if task is complete
        if (action.action === 'done') {
          console.log(`[AgentOrchestrator] Task completed: ${action.thought}`);
          this.emit('task_complete', { sessionId, message: action.thought });
          this.runningTasks.delete(sessionId);
          return { success: true, message: action.thought };
        }

        // Execute the action
        try {
          await this.executeAction(sessionId, action);
          this.emit('action_executed', { sessionId, step: step + 1, action });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`[AgentOrchestrator] Action failed: ${errorMessage}`);
          this.emit('action_failed', { sessionId, step: step + 1, action, error: errorMessage });
          
          // Continue to next step, let NAVIGATOR decide what to do
        }

        // Small delay between steps
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Max steps reached
      console.log(`[AgentOrchestrator] Max steps (${this.config.maxSteps}) reached`);
      this.runningTasks.delete(sessionId);
      return { success: false, message: `Max steps (${this.config.maxSteps}) reached without completing task` };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[AgentOrchestrator] Task failed: ${errorMessage}`);
      this.runningTasks.delete(sessionId);
      return { success: false, message: errorMessage };
    }
  }

  /**
   * Cancel a running task
   */
  cancelTask(sessionId: string): void {
    this.runningTasks.delete(sessionId);
    this.emit('task_cancelled', { sessionId });
  }

  /**
   * Ask NAVIGATOR for the next action
   */
  private async getNextAction(
    task: string,
    pageInfo: { url: string; title: string; content: string },
    currentStep: number
  ): Promise<AgentAction> {
    const prompt = `TASK: ${task}

CURRENT STEP: ${currentStep + 1}
PAGE URL: ${pageInfo.url}
PAGE TITLE: ${pageInfo.title}

VISIBLE ELEMENTS:
${pageInfo.content || 'No elements detected'}

Based on the task and current page state, decide the next action.
Output valid JSON only.`;

    try {
      const response = await fetch(`${this.config.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.2,
            num_predict: 500,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.response.trim();

      // Parse JSON from response (handle potential markdown code blocks)
      let jsonStr = responseText;
      if (responseText.includes('```')) {
        const match = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) jsonStr = match[1].trim();
      }

      const action = JSON.parse(jsonStr) as AgentAction;
      
      // Validate action
      if (!action.action || !action.thought || action.confidence === undefined) {
        throw new Error('Invalid action format');
      }

      return action;

    } catch (error) {
      console.error(`[AgentOrchestrator] Failed to get action from NAVIGATOR:`, error);
      
      // Return a safe fallback action
      return {
        thought: `Error getting action: ${error instanceof Error ? error.message : 'Unknown error'}`,
        action: 'need_human',
        confidence: 0,
      };
    }
  }

  /**
   * Execute an action on the browser
   */
  private async executeAction(sessionId: string, action: AgentAction): Promise<void> {
    switch (action.action) {
      case 'click':
        if (!action.target) throw new Error('Click action requires target');
        await puppeteerController.click(sessionId, action.target);
        break;

      case 'type':
        if (!action.target || !action.value) throw new Error('Type action requires target and value');
        await puppeteerController.type(sessionId, action.target, action.value);
        break;

      case 'scroll':
        const direction = (action.value?.toLowerCase() === 'up') ? 'up' : 'down';
        await puppeteerController.scroll(sessionId, direction);
        break;

      case 'navigate':
        if (!action.value) throw new Error('Navigate action requires URL');
        await puppeteerController.navigateTo(sessionId, action.value);
        break;

      case 'wait':
        const ms = action.value ? parseInt(action.value) : 2000;
        await puppeteerController.wait(sessionId, ms);
        break;

      case 'done':
      case 'need_human':
        // These are handled in the main loop
        break;

      default:
        throw new Error(`Unknown action: ${action.action}`);
    }
  }

  /**
   * Wait for AI to regain control after user takeover
   */
  private async waitForAIControl(sessionId: string): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const session = sessionManager.getSession(sessionId);
        
        // Task was cancelled
        if (!this.runningTasks.get(sessionId)) {
          clearInterval(checkInterval);
          resolve();
          return;
        }

        // AI has control again
        if (session?.state === 'AI_CONTROL') {
          clearInterval(checkInterval);
          console.log(`[AgentOrchestrator] AI control restored for session ${sessionId}`);
          resolve();
        }
      }, 1000);
    });
  }

  /**
   * Check if NAVIGATOR model is available
   */
  async checkModelAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.ollamaUrl}/api/tags`);
      if (!response.ok) return false;
      
      const data = await response.json();
      const models = data.models || [];
      
      return models.some((m: any) => m.name.startsWith(this.config.model));
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const agentOrchestrator = new AgentOrchestrator();
