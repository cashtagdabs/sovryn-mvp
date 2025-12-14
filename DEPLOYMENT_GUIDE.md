# SOVRYN.AI + PRIMEX Deployment Guide

Complete guide for deploying the integrated platform to production.

## Architecture Overview

The production deployment consists of two main components that work together to provide a seamless experience. The Next.js frontend is hosted on Vercel, providing the public-facing interface with serverless API routes for standard operations. The PRIMEX backend runs on a dedicated VPS, hosting the FastAPI service and Ollama with local AI models for specialized agent operations.

## Prerequisites

Before beginning deployment, ensure you have the following accounts and resources ready. You will need a Vercel account for frontend hosting, a VPS provider account (DigitalOcean, Linode, or Hetzner recommended) with at least 8GB RAM and 16GB recommended for optimal performance. Additionally, you need a Supabase or Neon account for PostgreSQL database, a Clerk account for authentication, a Stripe account for payment processing, and API keys for at least one AI provider (OpenAI, Anthropic, or Groq).

## Part 1: Frontend Deployment (Vercel)

### Step 1: Prepare Repository

Push your code to GitHub, ensuring all sensitive files are in .gitignore. Verify that the .env.example file is included but .env is excluded. Commit and push all changes to your main branch.

### Step 2: Create Vercel Project

Log in to Vercel and click "Add New Project". Import your GitHub repository and configure the project settings. Set the root directory to the project root, select Next.js as the framework preset, and configure the build command as "npm run build" with output directory as ".next".

### Step 3: Configure Environment Variables

In the Vercel dashboard, navigate to Settings, then Environment Variables. Add all required variables for production, including database configuration with your DATABASE_URL from Supabase or Neon. Configure Clerk authentication with NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY. Set up Stripe with STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, and STRIPE_WEBHOOK_SECRET. Add AI provider keys for OPENAI_API_KEY, ANTHROPIC_API_KEY, and GROQ_API_KEY. Configure PRIMEX integration with PRIMEX_API_URL pointing to your VPS and SOVEREIGN_USER_ID for owner access. Set NEXT_PUBLIC_APP_URL to your production domain.

### Step 4: Deploy

Click "Deploy" and wait for the build to complete. Vercel will automatically deploy your application and provide a URL. Note the deployment URL for webhook configuration.

### Step 5: Configure Webhooks

Set up Clerk webhooks by going to the Clerk Dashboard, navigating to Webhooks, and adding an endpoint at https://your-app.vercel.app/api/webhooks/clerk. Subscribe to user.created, user.updated, and user.deleted events. Copy the signing secret and add it to Vercel environment variables.

Configure Stripe webhooks by going to the Stripe Dashboard, navigating to Developers, then Webhooks, and adding an endpoint at https://your-app.vercel.app/api/webhooks/stripe. Select relevant events for subscriptions and payments. Copy the webhook signing secret and add it to Vercel environment variables.

## Part 2: PRIMEX Backend Deployment (VPS)

### Step 1: Provision VPS

Choose a VPS provider and select a plan with at least 8GB RAM and 50GB storage. Recommended providers include DigitalOcean Droplets (Basic 8GB), Linode Shared CPU (8GB), or Hetzner Cloud (CX31). Select Ubuntu 22.04 LTS as the operating system and choose a region close to your users.

### Step 2: Initial Server Setup

SSH into your VPS and update the system packages. Create a non-root user with sudo privileges and set up SSH key authentication. Configure the firewall to allow SSH (port 22), HTTP (port 80), HTTPS (port 443), and the PRIMEX API (port 8000 temporarily, will be proxied).

### Step 3: Install Dependencies

Install system dependencies including Python 3.11, pip, venv, Node.js, npm, Nginx, Certbot, and Git. Install Ollama using the official installation script.

### Step 4: Clone Repository

Clone your repository to /opt/sovryn-primex and set appropriate permissions. Navigate to the PRIMEX backend directory.

### Step 5: Setup Python Environment

Create a virtual environment, activate it, and install Python dependencies from requirements.txt.

### Step 6: Setup Ollama Models

Run the setup script to download and configure all PRIMEX AI models. This process may take 10-20 minutes depending on your internet speed.

### Step 7: Configure Systemd Service

Create a systemd service file for the PRIMEX backend at /etc/systemd/system/primex.service. Configure it to run as your user, set the working directory to your PRIMEX backend path, and execute uvicorn with the appropriate settings. Enable and start the service, then verify it's running correctly.

### Step 8: Configure Nginx Reverse Proxy

Create an Nginx configuration file at /etc/nginx/sites-available/primex. Configure it to proxy requests to the PRIMEX backend, set up SSL termination, and handle WebSocket connections. Enable the site and test the Nginx configuration before reloading.

### Step 9: Setup SSL with Let's Encrypt

Use Certbot to obtain SSL certificates for your domain. Configure automatic renewal and verify the SSL setup.

### Step 10: Update Vercel Environment

Update the PRIMEX_API_URL in Vercel to point to your VPS domain (https://primex.yourdomain.com). Redeploy the Vercel application to apply the changes.

## Part 3: Database Setup

### Using Supabase

Create a new project in Supabase and wait for provisioning. Navigate to Settings, then Database, and copy the connection string. Update DATABASE_URL in Vercel environment variables. Run Prisma migrations from your local machine after pulling environment variables from Vercel.

### Using Neon

Create a new project in Neon and copy the connection string. Update DATABASE_URL in Vercel environment variables. Run Prisma migrations from your local machine.

## Part 4: Post-Deployment Configuration

### Set Up Monitoring

Configure Vercel Analytics in your Vercel dashboard. Set up server monitoring on your VPS using tools like htop or Netdata. Configure log rotation for PRIMEX backend logs. Set up uptime monitoring using services like UptimeRobot or Pingdom.

### Configure Backups

Set up automated database backups in Supabase or Neon. Configure VPS snapshots with your provider. Back up Ollama models and PRIMEX configurations regularly.

### Security Hardening

Configure fail2ban on your VPS to prevent brute force attacks. Set up automatic security updates. Review and restrict firewall rules. Enable HTTPS-only access. Configure rate limiting in Nginx. Review and rotate API keys regularly.

## Part 5: Testing

### Functional Testing

Test user authentication by signing up and signing in. Verify public mode chat functionality with all AI providers. Test sovereign mode access with the authorized user. Verify PRIMEX clone invocations. Test subscription and payment flows. Verify webhook processing for Clerk and Stripe.

### Performance Testing

Test response times for chat and PRIMEX operations. Verify Ollama model loading times. Test concurrent user handling. Monitor memory and CPU usage on VPS. Check database query performance.

### Security Testing

Verify SSL certificates are valid. Test authentication and authorization. Verify API endpoint security. Test webhook signature validation. Verify environment variable security.

## Part 6: Monitoring & Maintenance

### Daily Checks

Monitor Vercel deployment status. Check VPS server health and resource usage. Review error logs for both frontend and backend. Monitor database performance. Check uptime monitoring alerts.

### Weekly Maintenance

Review and analyze usage metrics. Check for security updates. Review and optimize database queries. Monitor costs across all services. Review and respond to user feedback.

### Monthly Tasks

Update dependencies for both frontend and backend. Review and optimize infrastructure costs. Perform security audits. Review and update documentation. Plan and implement new features.

## Troubleshooting

### Frontend Issues

If deployments are failing, check Vercel build logs, verify environment variables, and ensure all dependencies are correctly specified. If authentication is not working, verify Clerk keys and webhook configuration. If API routes are failing, check Vercel function logs and verify environment variables.

### Backend Issues

If the PRIMEX service is not starting, check systemd logs, verify Python dependencies, and ensure Ollama is running. If Ollama models are not responding, verify model installation, check Ollama service status, and review available disk space. If Nginx is not proxying correctly, verify Nginx configuration, check SSL certificates, and review Nginx error logs.

### Database Issues

If connections are timing out, verify connection string format, check database service status, and review connection pool settings. If migrations are failing, verify database permissions, check for conflicting migrations, and review Prisma schema.

## Rollback Procedures

### Frontend Rollback

In Vercel dashboard, navigate to Deployments. Select a previous successful deployment and click "Promote to Production". Verify the rollback was successful.

### Backend Rollback

SSH into your VPS and navigate to the project directory. Checkout the previous stable commit. Restart the PRIMEX service and verify functionality.

### Database Rollback

If possible, restore from a backup. If using migrations, roll back to the previous migration. Verify data integrity after rollback.

## Cost Optimization

### Vercel

Use the free tier for development and testing. Upgrade to Pro for production with custom domains. Monitor bandwidth and function execution limits.

### VPS

Start with the minimum recommended specs (8GB RAM). Scale up only when needed based on usage. Use reserved instances for cost savings if available.

### Database

Use free tiers for development. Monitor connection pooling to optimize costs. Implement caching to reduce database queries.

### AI Providers

Use PRIMEX local models for sovereign operations to reduce API costs. Implement rate limiting to control API usage. Monitor and optimize token usage.

## Support & Resources

For deployment issues, consult the Vercel documentation, VPS provider documentation, and Ollama documentation. For application issues, review the README.md and QUICKSTART.md files, check GitHub Issues, and contact the owner directly for sovereign mode issues.

## Conclusion

This deployment guide provides a comprehensive approach to launching SOVRYN.AI + PRIMEX in production. Follow each step carefully and verify functionality at each stage. Monitor your deployment closely in the first few days to catch and resolve any issues quickly.

---

**Ready for production? Deploy with confidence! 🚀**
