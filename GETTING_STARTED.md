# PRIMEX SOVEREIGN - Getting Started on Mac Studio M4 Max

Your repo is now cleaned up and the Agent Orchestrator is built. Follow these steps to get PrimeX running.

---

## Step 1: Create the NAVIGATOR Model (5 minutes)

Open Terminal and run:

```bash
# Navigate to your project
cd ~/path/to/sovryn-mvp

# Create the NAVIGATOR model in Ollama
ollama create navigator -f primex-backend/ollama/clone-prompts/navigator.Modelfile
```

**Verify it worked:**
```bash
ollama list
# Should show: navigator:latest
```

---

## Step 2: Install Browser Service Dependencies (2 minutes)

```bash
cd browser-service
npm install
```

---

## Step 3: Start the Browser Service (1 minute)

```bash
cd browser-service
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════════════╗
║           PRIMEX SOVEREIGN - Browser Service                  ║
╠═══════════════════════════════════════════════════════════════╣
║  Platform:       darwin                                       ║
║  HTTP Server:    http://localhost:3001                        ║
║  WebSocket:      ws://localhost:3001                          ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Step 4: Test the Agent (5 minutes)

Open a new terminal and test with curl:

```bash
# Check health
curl http://localhost:3001/health

# Check if NAVIGATOR is available
curl http://localhost:3001/api/agent/status

# Create a session
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"userId": "test", "task": "Go to google.com and search for PRIMEX AI", "url": "https://google.com"}'

# Note the sessionId from the response, then start the agent:
curl -X POST http://localhost:3001/api/sessions/{sessionId}/agent/start
```

A Chrome window will open and you'll see the AI navigating!

---

## Step 5: Start the Frontend (Optional)

In another terminal:

```bash
cd sovryn-mvp
npm install
npm run dev
```

Visit `http://localhost:3000` to use the full UI.

---

## Repo Structure (After Cleanup)

```
sovryn-mvp/
├── README.md                    # Main readme
├── GETTING_STARTED.md           # This file
├── app/                         # Next.js frontend
├── browser-service/             # Browser automation backend
│   └── src/
│       ├── agent-orchestrator.ts   # The "brain" ⭐
│       ├── puppeteer-controller.ts # Browser control
│       ├── session-manager.ts      # Session state
│       └── index.ts                # API server
├── primex-backend/              # PrimeX Ollama backend
│   └── ollama/clone-prompts/
│       └── navigator.Modelfile     # NAVIGATOR model ⭐
├── docs/                        # All documentation
│   ├── setup/                   # Setup guides
│   ├── architecture/            # Architecture docs
│   ├── primex/                  # PrimeX specific docs
│   ├── reference/               # PDFs and references
│   └── archive/                 # Old docs
└── prisma/                      # Database schema
```

---

## Key Files You Should Know

| File | Purpose |
|------|---------|
| `browser-service/src/agent-orchestrator.ts` | The AI agent loop - connects NAVIGATOR to browser |
| `browser-service/src/puppeteer-controller.ts` | Browser control (click, type, navigate) |
| `primex-backend/ollama/clone-prompts/navigator.Modelfile` | NAVIGATOR's personality and instructions |
| `app/components/LiveTakeOverPanel.tsx` | Frontend for watching/controlling the browser |
| `docs/primex/PRIMEX_SOVEREIGN_ROADMAP.md` | Full roadmap for future development |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/agent/status` | GET | Check if NAVIGATOR model is available |
| `/api/sessions` | POST | Create a new browser session |
| `/api/sessions/:id` | GET | Get session details |
| `/api/sessions/:id/agent/start` | POST | Start the AI agent |
| `/api/sessions/:id/agent/cancel` | POST | Cancel the running task |
| `/api/sessions/:id/control` | PUT | Take/return control |
| `/api/sessions/:id/screenshot` | GET | Get current screenshot |
| `/api/sessions/:id` | DELETE | End session |

---

## Troubleshooting

### "NAVIGATOR model not available"
```bash
ollama create navigator -f primex-backend/ollama/clone-prompts/navigator.Modelfile
```

### "Cannot find module 'puppeteer'"
```bash
cd browser-service && npm install
```

### Browser doesn't open
Make sure you're running on Mac with a display. The browser runs in headful mode (visible window).

### Ollama not running
```bash
# Start Ollama
ollama serve
```

---

## What's Next?

1. **Test basic tasks** - Try simple navigation and search tasks
2. **Add vision** - Integrate Llama 3.2 Vision for screenshot analysis
3. **Fine-tune NAVIGATOR** - Improve the Modelfile based on results
4. **Build custom tools** - Add specialized actions for your use cases

See `docs/primex/PRIMEX_SOVEREIGN_ROADMAP.md` for the full development plan.

---

**You're ready to go. Your AI, your rules, no limits.**
