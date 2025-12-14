# SOVRYN.AI + PRIMEX Integrated Platform

**Multi-Agent AI Operations Platform with Dual-Mode Architecture**

## Overview

SOVRYN.AI + PRIMEX is an integrated AI platform that combines a public-facing AI chat application with a powerful multi-agent system for sovereign operations. The platform operates in two distinct modes to serve different user needs while maintaining security and performance.

## System Architecture

### Public Mode (SOVRYN.AI)
The public mode provides a polished AI chat experience for all authenticated users. It features multiple AI provider support including OpenAI, Anthropic, and Groq, with conversation management, usage tracking, and subscription billing through Stripe. The system is built on Next.js 14 with the App Router, uses Clerk for authentication, and maintains data in PostgreSQL via Prisma ORM.

### Sovereign Mode (PRIMEX)
The sovereign mode unlocks exclusive access to six specialized AI agents running locally via Ollama. These agents are designed for specific operational tasks and are accessible only to the authorized owner. The system includes ARCHITECT for system building and deployment, CORTEX for strategic analysis and decision-making, CENTURION for auditing and compliance, GHOSTLINE for privacy and anonymity operations, GOODJEW for legal analysis and compliance tactics, and MINT for marketing and revenue optimization.

## Technology Stack

The frontend uses Next.js 14 with the App Router, React 18, TypeScript, and TailwindCSS for styling. The backend consists of Next.js API Routes for standard operations and FastAPI (Python) for PRIMEX clone orchestration. The database layer uses PostgreSQL with Prisma ORM, while the AI layer integrates cloud providers (OpenAI, Anthropic, Groq) for public mode and Ollama with local models (llama3.2:3b, mistral:7b, dolphin-mixtral:8x7b) for PRIMEX. Authentication is handled by Clerk, and payments are processed through Stripe.

## Quick Start

### Prerequisites
You will need Node.js 18 or higher, Python 3.11 or higher, PostgreSQL database (Supabase or Neon recommended), Ollama installed for PRIMEX functionality, and accounts for Clerk, Stripe, and at least one AI provider.

### Installation

Clone the repository and navigate to the project directory. Install the Node.js dependencies using npm install. Set up the PRIMEX backend by navigating to the primex-backend directory, creating a Python virtual environment, activating it, and installing the requirements. Copy the environment example file to create your own configuration and fill in all required API keys and configuration values.

### Database Setup

Generate the Prisma client and run the database migrations to set up your schema. Optionally, you can seed the database with test data.

### PRIMEX Setup

Install Ollama if you haven't already by running the installation script from their website. Then set up the PRIMEX models by running the setup script located in the primex-backend/scripts directory.

### Running the Application

Start the PRIMEX backend by navigating to the primex-backend directory, activating your virtual environment, and running uvicorn. In a separate terminal, start the Next.js frontend by running npm run dev. Access the application at http://localhost:3000 for the public interface and http://localhost:3000/primex for sovereign mode (requires authorization).

## Configuration

### Environment Variables

Configure your database connection string, Clerk authentication keys, Stripe payment keys, AI provider API keys, PRIMEX backend URL, and sovereign user ID for exclusive access.

### Sovereign Access

To grant sovereign access to a user, obtain their Clerk user ID from the Clerk dashboard and set it as the SOVEREIGN_USER_ID in your environment variables. The user will then have access to the PRIMEX interface at /primex.

## Deployment

### Frontend Deployment (Vercel)

Push your code to GitHub, import the repository in Vercel, configure all environment variables in the Vercel dashboard, and deploy. Vercel will automatically build and deploy your Next.js application.

### PRIMEX Backend Deployment (VPS)

Set up a VPS with at least 8GB RAM (16GB recommended for larger models). Install Ollama on the VPS and pull the required models. Clone your repository and set up the Python environment. Configure a systemd service for the FastAPI backend. Set up Nginx as a reverse proxy with SSL using Let's Encrypt. Configure firewall rules to allow necessary ports.

## Usage

### Public Mode

Sign up or sign in using Clerk authentication. Select an AI model from the available providers. Start chatting and manage your conversations. Monitor your usage in the dashboard and manage your subscription if needed.

### Sovereign Mode

Access the PRIMEX interface at /primex (requires sovereign authorization). Select an AI clone from the sidebar based on your operational need. Enter your command or query in the command interface. Execute the command and review the specialized response. View command history and manage multi-agent workflows.

## PRIMEX Clones

**ARCHITECT** serves as the system builder and asset deployer, specializing in scalable system design, UI/UX creation, VPS deployment automation, and production-ready code generation. It uses the llama3.2:3b model with a temperature of 0.3.

**CORTEX** functions as the strategic decision engine, focusing on operational strategy analysis, action plan optimization, risk/reward simulations, and strategic weakness detection. It operates on the mistral:7b model with a temperature of 0.4.

**CENTURION** acts as the audit commander and gate-keeper, providing PASS/FAIL operation gating, drift checking, compliance enforcement, and system integrity auditing. It uses the mistral:7b model with a temperature of 0.2.

**GHOSTLINE** specializes in anonymity and movement intelligence, offering alias identity kit design, privacy practices guidance, secure communication protocols, and identity management systems. It runs on the dolphin-mixtral:8x7b model with a temperature of 0.5.

**GOODJEW** serves as the legal loophole analyzer and tactical ethics advisor, identifying legal grey zones, mapping policy inconsistencies, providing compliance tactics, and offering best-case interpretations of vague law. It uses the dolphin-mixtral:8x7b model with a temperature of 0.6.

**MINT** functions as the money and marketing AI, specializing in landing page copywriting, marketing headline generation, social media content creation, sales asset development, and creator enablement kits. It operates on the llama3.2:3b model with a temperature of 0.7.

## Security

The system implements multiple security layers. The loyalty core provides hardcoded owner verification for Tyler C. Hoag. Local-first AI ensures PRIMEX models run on your infrastructure without external API calls. Role-based access control restricts sovereign mode to authorized users only. All clone invocations are logged through CENTURION for audit purposes. Clerk handles secure authentication and session management, while Stripe manages secure payment processing.

## Monitoring

Monitor your system using Vercel Analytics for frontend performance tracking, FastAPI logs for backend operations, CENTURION audit logs for security and compliance, and Stripe webhooks for payment event tracking.

## Development

### Project Structure

The app directory contains the Next.js application with pages, components, and API routes. The primex-backend directory houses the FastAPI backend with services, configuration, Ollama Modelfiles, and deployment scripts. The prisma directory contains the database schema and migrations. The public directory holds static assets.

### Adding New Features

To add new PRIMEX clones, create a JSON configuration file in primex-backend/config/clones, create an Ollama Modelfile in primex-backend/ollama/clone-prompts, and update the setup script to include the new clone. To add new AI providers for public mode, update app/lib/ai/providers.ts with the new provider configuration and add the API key to your environment variables.

## Troubleshooting

If Ollama models are not responding, verify that Ollama is running with ollama serve, check that models are installed using ollama list, and verify the OLLAMA_HOST environment variable. If authentication is not working, verify Clerk keys in environment variables, check webhook configuration in the Clerk dashboard, and review Vercel logs for errors. If PRIMEX access is denied, verify that your user ID matches SOVEREIGN_USER_ID and check that the PRIMEX backend is running and accessible.

## Roadmap

Planned enhancements include RAG pipeline integration for knowledge orchestration, mobile applications for iOS and Android, team spaces for collaborative work, custom tool creation for extended functionality, a creator marketplace for prompts and agents, and enterprise SSO/SCIM support.

## Support

For bug reports, use GitHub Issues. For detailed documentation, see the docs folder. For direct support, contact Tyler C. Hoag.

## License

Proprietary - All Rights Reserved. Copyright 2024 SOVRYN CREATIONS.

## Owner

Tyler C. Hoag (SOVRYN CREATIONS). Loyalty Core: ACTIVE. Security Key: BigZaddy.69.

---

**PRIMEX SOVEREIGN ONLINE. Awaiting Commander directive.**
