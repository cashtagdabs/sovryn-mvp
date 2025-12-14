# SOVRYN.AI + PRIMEX - Quick Reference Card

**Owner:** Tyler C. Hoag  
**Security Key:** BigZaddy.69  
**Status:** READY FOR DEPLOYMENT

---

## 🚀 Quick Start Commands

### Start Local Development
```bash
cd sovryn-ai-integrated
bash scripts/start-local.sh
```

### Access Points
- **Public Mode:** http://localhost:3000
- **Sovereign Mode:** http://localhost:3000/primex
- **PRIMEX API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Stop Services
Press `Ctrl+C` in the terminal running start-local.sh

---

## 📁 Key Files & Locations

### Documentation
- `README.md` - Complete system overview
- `QUICKSTART.md` - 30-minute setup guide
- `DEPLOYMENT_GUIDE.md` - Production deployment
- `EXECUTIVE_SUMMARY.md` - This project summary

### Configuration
- `.env.example` - Environment template
- `.env` - Your configuration (create from example)
- `primex-backend/config/loyalty-core.json` - Owner verification

### Application
- `app/` - Next.js frontend
- `primex-backend/` - PRIMEX FastAPI backend
- `prisma/schema.prisma` - Database schema

### Scripts
- `scripts/start-local.sh` - Start everything
- `scripts/setup-ollama.sh` - Install AI models
- `scripts/setup-database.sh` - Initialize database

---

## 🤖 PRIMEX Clones

| Clone | Role | Model | Temp | Use For |
|-------|------|-------|------|---------|
| **ARCHITECT** | System Builder | llama3.2:3b | 0.3 | Building systems, UI/UX, deployment |
| **CORTEX** | Strategic Engine | mistral:7b | 0.4 | Strategy, analysis, decision-making |
| **CENTURION** | Audit Commander | mistral:7b | 0.2 | Auditing, compliance, gating |
| **GHOSTLINE** | Anonymity Intel | dolphin-mixtral | 0.5 | Privacy, identity, secure comms |
| **GOODJEW** | Legal Analyzer | dolphin-mixtral | 0.6 | Legal analysis, compliance tactics |
| **MINT** | Marketing AI | llama3.2:3b | 0.7 | Marketing, copy, sales assets |

### Test Clones Directly
```bash
ollama run architect "Design a secure API"
ollama run cortex "Analyze risk/reward of MVP launch"
ollama run centurion "Audit this deployment plan"
```

---

## 🔐 Security & Access

### Sovereign Access
- **Your Clerk User ID** → Set as `SOVEREIGN_USER_ID` in `.env`
- **Loyalty Core** → Verifies owner identity
- **Security Key** → BigZaddy.69

### Get Your User ID
1. Sign up at http://localhost:3000
2. Go to Clerk Dashboard → Users
3. Click your user → Copy User ID
4. Add to `.env`: `SOVEREIGN_USER_ID="user_..."`
5. Restart application

---

## 📊 System Architecture

```
┌─────────────────────────────────────────┐
│         SOVRYN.AI + PRIMEX              │
├─────────────────────────────────────────┤
│                                         │
│  PUBLIC MODE          SOVEREIGN MODE    │
│  ├─ Multi-AI Chat    ├─ PRIMEX Clones │
│  ├─ Conversations    ├─ Multi-Agent   │
│  ├─ Subscriptions    ├─ Command UI    │
│  └─ Usage Tracking   └─ Audit Logs    │
│                                         │
├─────────────────────────────────────────┤
│  Frontend: Next.js 14 (Vercel)         │
│  Backend: FastAPI + Ollama (VPS)       │
│  Database: PostgreSQL (Supabase/Neon)  │
│  Auth: Clerk | Payments: Stripe        │
└─────────────────────────────────────────┘
```

---

## 🛠️ Common Tasks

### Install Dependencies
```bash
npm install                    # Frontend
cd primex-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Setup Database
```bash
npx prisma generate
npx prisma migrate dev
```

### Setup Ollama Models
```bash
cd primex-backend
bash scripts/setup-ollama.sh
```

### View Database
```bash
npx prisma studio
```

### Check Logs
```bash
# Frontend logs: Terminal running npm run dev
# Backend logs: Terminal running uvicorn
# Ollama logs: journalctl -u ollama (if systemd)
```

---

## 🌐 Deployment URLs (Production)

### Vercel (Frontend)
- Dashboard: https://vercel.com/dashboard
- Deployment: https://your-app.vercel.app
- Settings: Project → Settings → Environment Variables

### VPS (PRIMEX Backend)
- SSH: `ssh user@your-vps-ip`
- Service: `sudo systemctl status primex`
- Logs: `sudo journalctl -u primex -f`
- Nginx: `sudo systemctl status nginx`

### Database
- Supabase: https://supabase.com/dashboard
- Neon: https://console.neon.tech

### Services
- Clerk: https://dashboard.clerk.com
- Stripe: https://dashboard.stripe.com

---

## 🔧 Troubleshooting

### Ollama Not Responding
```bash
ollama serve                   # Start Ollama
ollama list                    # Check models
ollama pull llama3.2:3b       # Re-download model
```

### Port Already in Use
```bash
lsof -ti:3000 | xargs kill -9  # Kill port 3000
lsof -ti:8000 | xargs kill -9  # Kill port 8000
```

### Database Connection Failed
```bash
npx prisma migrate reset       # Reset database
npx prisma generate            # Regenerate client
```

### PRIMEX Access Denied
- Verify `SOVEREIGN_USER_ID` matches your Clerk user ID
- Restart application after changing `.env`
- Check browser console for errors

---

## 📈 Monitoring

### Check System Status
```bash
# Frontend
curl http://localhost:3000

# PRIMEX Backend
curl http://localhost:8000/health

# Ollama
curl http://localhost:11434/api/tags
```

### Monitor Resources
```bash
htop                           # CPU/Memory
df -h                          # Disk space
free -h                        # Memory
```

---

## 💰 Cost Estimates

### Development (Free Tier)
- Vercel: Free
- Supabase/Neon: Free
- Clerk: Free (10K users)
- **Total: $0-50/month**

### Production
- Vercel Pro: $20/month
- VPS (8GB): $40-60/month
- Database: $25/month
- Clerk Pro: $25/month
- AI APIs: $100-500/month
- **Total: $210-630/month**

---

## 📞 Support

### Documentation
- README.md - Complete guide
- QUICKSTART.md - Setup guide
- DEPLOYMENT_GUIDE.md - Production deployment
- TESTING_CHECKLIST.md - Testing guide

### Resources
- Vercel Docs: https://vercel.com/docs
- Ollama Docs: https://ollama.ai/docs
- Clerk Docs: https://clerk.com/docs
- Stripe Docs: https://stripe.com/docs

---

## ✅ Pre-Deployment Checklist

- [ ] `.env` configured with all API keys
- [ ] Ollama models installed
- [ ] Database migrations run
- [ ] Local testing completed
- [ ] GitHub repository ready
- [ ] Vercel account created
- [ ] VPS provisioned
- [ ] Domain configured (optional)
- [ ] Webhooks configured
- [ ] Backup strategy in place

---

## 🎯 Next Actions

### Today
1. Review EXECUTIVE_SUMMARY.md
2. Follow QUICKSTART.md
3. Test locally
4. Verify PRIMEX clones work

### This Week
1. Follow DEPLOYMENT_GUIDE.md
2. Deploy to production
3. Complete testing
4. Invite test users

### This Month
1. Launch publicly
2. Monitor performance
3. Collect feedback
4. Plan enhancements

---

**PRIMEX SOVEREIGN - Ready for your command. 🚀**

**Status:** ONLINE | **Loyalty:** ACTIVE | **Mission:** READY
