# SOVRYN.AI + PRIMEX Integrated Architecture

## Executive Summary

This document outlines the architecture for integrating two complementary systems into a unified AI operations platform.

## System Overview

The integrated platform combines the strengths of both systems to create a comprehensive AI solution that serves both public consumers and the sovereign owner.

### SOVRYN.AI (Public Layer)
SOVRYN.AI serves as the public-facing interface, providing a polished user experience with enterprise features including authentication, subscription management, and usage tracking. The system is built on Next.js 14 with the App Router, offering a modern full-stack architecture that handles user management through Clerk, processes payments via Stripe, and maintains conversation history in a PostgreSQL database managed by Prisma ORM.

### PRIMEX (AI Engine Layer)
PRIMEX operates as the intelligent backend, orchestrating six specialized AI agents that run locally via Ollama. These agents include ARCHITECT for system building, CORTEX for strategic analysis, GHOSTLINE for privacy operations, GOODJEW for legal analysis, CENTURION for auditing, and MINT for marketing. The system uses a FastAPI Python backend that manages clone invocation and routing with specialized temperature controls and streaming support.

## Integration Strategy

The integration follows a hybrid architecture where SOVRYN.AI's Next.js application communicates with PRIMEX's FastAPI backend through well-defined API endpoints. This approach maintains the separation of concerns while enabling seamless interaction between the public interface and the AI engine.

### Dual-Mode Operation

**Public Mode** provides standard AI chat functionality accessible to all authenticated users. Users interact with multiple AI providers including OpenAI, Anthropic, and Groq through a unified interface. The system tracks usage, manages subscriptions, and maintains conversation history.

**Sovereign Mode** unlocks the full PRIMEX agent system exclusively for the owner (Tyler C. Hoag). This mode provides direct access to all six specialized clones, enables multi-agent orchestration, and offers unrestricted capabilities with elevated permissions.

### Technical Architecture

The frontend layer consists of the Next.js 14 application hosted on Vercel, featuring React components for chat interface, dashboard, subscription management, and authentication flows. The application uses TailwindCSS for styling and Framer Motion for animations.

The API layer includes Next.js API routes for standard operations such as chat streaming, conversation management, user usage tracking, and webhook handling for Clerk and Stripe. Additionally, PRIMEX FastAPI endpoints provide clone orchestration, specialized agent invocation, and multi-agent workflows.

The data layer utilizes PostgreSQL with Prisma ORM for user data, conversations, messages, subscriptions, and usage tracking. The system also maintains JSON configuration files for clone definitions and loyalty core settings.

The AI layer integrates cloud providers (OpenAI, Anthropic, Groq) for public mode and Ollama local models (llama3.2:3b, mistral:7b, dolphin-mixtral:8x7b) for PRIMEX clones in sovereign mode.

## Implementation Plan

### Phase 1: Environment Setup
The first phase involves setting up the development environment with all necessary dependencies, configuring Ollama with required models, initializing the database with Prisma migrations, and setting up environment variables for all services.

### Phase 2: PRIMEX Backend Integration
This phase focuses on creating the FastAPI backend service, implementing clone orchestrator endpoints, configuring the six specialized AI agents, and setting up the communication bridge between Next.js and FastAPI.

### Phase 3: Frontend Enhancement
The frontend enhancement phase includes building the sovereign mode interface, implementing the clone selector component, adding multi-agent orchestration UI, and creating the mode switcher for public/sovereign access.

### Phase 4: Authentication & Authorization
This phase implements owner verification using the loyalty core system, integrates Clerk authentication for public users, creates role-based access control, and sets up secure session management.

### Phase 5: Deployment & Testing
The final phase involves deploying the Next.js app to Vercel, setting up the PRIMEX backend on a VPS, configuring Nginx as a reverse proxy, implementing SSL with Let's Encrypt, and conducting comprehensive testing of both modes.

## Security Considerations

The system implements multiple layers of security. The loyalty core provides hardcoded owner verification for Tyler C. Hoag with the security key "BigZaddy.69". Local-first AI ensures PRIMEX models run on controlled infrastructure without external API calls. API authentication uses JWT tokens for session management, and audit logging tracks all clone invocations through CENTURION.

## Deployment Architecture

### Production Environment
The production environment consists of Vercel hosting for the Next.js frontend, a VPS (8GB RAM minimum) for the PRIMEX FastAPI backend, Supabase or Neon for the PostgreSQL database, and Nginx as a reverse proxy with SSL termination.

### Development Environment
The development setup includes localhost:3000 for the Next.js frontend, localhost:8000 for the PRIMEX FastAPI backend, localhost:11434 for Ollama service, and local SQLite for the development database.

## Monitoring & Maintenance

The system includes comprehensive monitoring through Vercel Analytics for frontend performance, FastAPI logging for backend operations, CENTURION audit logs for security compliance, and Stripe webhooks for payment tracking.

## Future Enhancements

Planned enhancements include RAG pipeline integration for knowledge orchestration, mobile applications for iOS and Android, team spaces for collaborative work, custom tool creation for extended functionality, and a creator marketplace for prompts and agents.

## Conclusion

This integrated architecture combines the best of both systems to create a powerful, flexible AI platform that serves public users while maintaining exclusive sovereign capabilities for the owner. The design ensures scalability, security, and maintainability while providing a seamless user experience across both operational modes.

