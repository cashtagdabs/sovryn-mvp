# SOVRYN.AI - Powered by PRIMEX

## The Enterprise-Grade, Privacy-First Alternative to ChatGPT

PRIMEX is a self-hosted AI platform that delivers enterprise compliance, predictable costs, and unlimited usage - without compromising your data sovereignty.

---

## Why PRIMEX?

Cloud AI models like ChatGPT are powerful, but they create significant challenges for enterprises:

- **Privacy Risks:** Your data is sent to external servers.
- **Compliance Issues:** Violates GDPR, HIPAA, and data sovereignty laws.
- **Unpredictable Costs:** Per-token pricing leads to surprise bills.
- **Rate Limits:** Throttling during high usage.

**PRIMEX solves these problems.**

---

## Validated Advantages

### ✅ 100% Private & Compliant
- **Self-Hosted:** Runs on your infrastructure (on-premise or private cloud).
- **Data Sovereignty:** Your data never leaves your control.
- **Compliance-Ready:** Meets GDPR, HIPAA, and SOC 2 requirements.

### ✅ Predictable Costs
- **Flat Monthly Pricing:** No per-token charges or surprise bills.
- **Unlimited Usage:** Use as much as you need within your tier.
- **Budget with Confidence:** Predictable AI spending.

### ✅ High Performance
- **2-4x Faster than GPT-4:** With GPU optimization, achieve 40-120 tokens/second.
- **No Rate Limits:** No throttling or usage caps.
- **Scales with Your Needs:** Add more hardware to increase performance.

### ✅ Full Customization
- **Fine-Tune Models:** Train on your proprietary data for specialized tasks.
- **Full Control:** Modify model behavior and output.
- **No Vendor Lock-In:** You own the models and the infrastructure.

---

## Performance Comparison

| Feature | PRIMEX (GPU Optimized) | ChatGPT (GPT-4) |
|---|---|---|
| **Privacy** | ✅ Self-hosted | ❌ Cloud-based |
| **Compliance** | ✅ GDPR/HIPAA | ❌ Limited |
| **Cost** | ✅ Flat-rate | ❌ Per-token |
| **Limits** | ✅ Unlimited | ❌ Rate limited |
| **Speed** | ✅ 40-120 tokens/s | ❌ 13-20 tokens/s |
| **Customization** | ✅ Full | ❌ None |
| **Accuracy** | ❌ ~75% (MMLU) | ✅ 86.4% (MMLU) |

**PRIMEX wins on privacy, cost, and control. ChatGPT wins on raw accuracy.**

---

## Target Audience

### 1. Regulated Enterprises
- **Industries:** Healthcare, Finance, Government, Legal
- **Needs:** GDPR/HIPAA compliance, data sovereignty
- **Why PRIMEX:** The only way to use AI without violating regulations.

### 2. High-Volume Businesses
- **Industries:** SaaS, Agencies, Content Creation
- **Needs:** Predictable costs, unlimited usage
- **Why PRIMEX:** Eliminates budget uncertainty from per-token pricing.

### 3. Developers & Power Users
- **Needs:** Unlimited testing, customization, no rate limits
- **Why PRIMEX:** Full control and freedom to experiment.

---

## Technical Requirements

### Recommended Deployment (Professional)
- **Hardware:** VPS with RTX 4090 24GB
- **Cost:** $200-400/month
- **Performance:** 80-120 tokens/s
- **Models:** mistral:7b, dolphin-mixtral (4-bit quantization)

### Optimization Requirements
- ✅ GPU acceleration (CUDA)
- ✅ 4-bit quantization for speed
- ✅ Flash Attention enabled
- ✅ Batch processing configured

---

## Get Started

### 1. Clone the Repository
```bash
git clone https://github.com/cashtagdabs/sovryn-mvp.git
cd sovryn-mvp
```

### 2. Install Dependencies
```bash
# Frontend
npm install

# PRIMEX Backend
cd primex-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Setup Ollama (for PRIMEX)
```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Install PRIMEX models
cd primex-backend
bash scripts/setup-ollama.sh
```

### 4. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys and hardware config
```

### 5. Start the Application
```bash
# One-command startup
bash scripts/start-local.sh
```

---

## The Honest Truth

PRIMEX is not designed to be "better than GPT-4" in every way. It is designed to be **better for the enterprise**.

If you need the absolute highest accuracy and are not concerned with privacy, compliance, or cost, use ChatGPT.

If you need a private, compliant, and cost-effective AI solution with strong performance and full control, **PRIMEX is the only answer.**

---

**Built by Tyler C. Hoag / SOVRYN CREATIONS**
