# SOVRYN.AI + PRIMEX Testing Checklist

Comprehensive testing checklist to ensure all features work correctly before deployment.

## Pre-Testing Setup

- [ ] Environment variables configured in .env
- [ ] Database migrations completed
- [ ] Ollama service running
- [ ] PRIMEX models installed
- [ ] Frontend and backend services running

## Authentication Tests

### Clerk Integration
- [ ] Sign up with email works
- [ ] Sign up with OAuth (Google, GitHub) works
- [ ] Sign in with email works
- [ ] Sign in with OAuth works
- [ ] Sign out works correctly
- [ ] Session persistence works
- [ ] Protected routes redirect to sign-in
- [ ] User profile displays correctly

### Authorization
- [ ] Non-sovereign users cannot access /primex
- [ ] Sovereign user can access /primex
- [ ] API routes validate authentication
- [ ] Webhook endpoints validate signatures

## Public Mode Tests (SOVRYN.AI)

### Chat Functionality
- [ ] New conversation creation works
- [ ] Message sending works
- [ ] AI response received and displayed
- [ ] Streaming responses work correctly
- [ ] Multiple AI providers selectable
- [ ] OpenAI models work (if configured)
- [ ] Anthropic models work (if configured)
- [ ] Groq models work (if configured)
- [ ] Error handling for failed requests
- [ ] Loading states display correctly

### Conversation Management
- [ ] Conversation list displays
- [ ] Conversation selection works
- [ ] Conversation title updates
- [ ] Conversation deletion works
- [ ] Conversation archiving works
- [ ] Conversation pinning works
- [ ] Search conversations works
- [ ] Conversation history loads correctly

### UI/UX
- [ ] Responsive design on mobile
- [ ] Responsive design on tablet
- [ ] Responsive design on desktop
- [ ] Dark mode displays correctly
- [ ] Animations work smoothly
- [ ] Loading indicators appear
- [ ] Error messages display properly
- [ ] Toast notifications work

## Sovereign Mode Tests (PRIMEX)

### Access Control
- [ ] /primex redirects non-sovereign users
- [ ] /primex allows sovereign user access
- [ ] Mode switcher displays correctly
- [ ] Mode switcher only shows PRIMEX for sovereign users
- [ ] Switching between modes works

### Clone Selection
- [ ] All 6 clones display in sidebar
- [ ] Clone selection updates interface
- [ ] Clone details display correctly
- [ ] Clone capabilities show
- [ ] Clone model information displays

### Clone Invocation
- [ ] ARCHITECT responds correctly
- [ ] CORTEX responds correctly
- [ ] CENTURION responds correctly
- [ ] GHOSTLINE responds correctly (if installed)
- [ ] GOODJEW responds correctly (if installed)
- [ ] MINT responds correctly
- [ ] Response time is acceptable (<5s)
- [ ] Responses are relevant to clone role
- [ ] Error handling works

### Command Interface
- [ ] Text input works
- [ ] Ctrl+Enter shortcut works
- [ ] Execute button works
- [ ] Loading state displays
- [ ] Response displays correctly
- [ ] Long responses display properly
- [ ] Command history saves
- [ ] History displays correctly

### Multi-Agent Workflows
- [ ] Multiple clones can be invoked sequentially
- [ ] Context carries between invocations
- [ ] Results aggregate correctly

## Database Tests

### Data Persistence
- [ ] User data persists across sessions
- [ ] Conversations save correctly
- [ ] Messages save correctly
- [ ] PRIMEX invocations log correctly
- [ ] Usage counts update

### Data Integrity
- [ ] User deletion cascades correctly
- [ ] Conversation deletion cascades
- [ ] Orphaned records don't exist
- [ ] Indexes improve query performance

## Subscription Tests (if Stripe configured)

### Subscription Flow
- [ ] Subscription page loads
- [ ] Plan selection works
- [ ] Checkout redirects to Stripe
- [ ] Successful payment creates subscription
- [ ] Subscription status updates
- [ ] Usage limits enforce correctly
- [ ] Billing portal access works

### Webhooks
- [ ] Stripe webhooks receive events
- [ ] Subscription created event processes
- [ ] Subscription updated event processes
- [ ] Subscription cancelled event processes
- [ ] Payment succeeded event processes
- [ ] Payment failed event processes

## API Tests

### Public API Routes
- [ ] /api/chat works
- [ ] /api/chat/stream works
- [ ] /api/conversations works
- [ ] /api/conversations/[id] works
- [ ] /api/user/usage works
- [ ] Rate limiting works (if configured)

### PRIMEX API Routes
- [ ] /api/primex/clones works
- [ ] /api/primex/invoke works
- [ ] Authorization validates correctly
- [ ] Error responses formatted correctly

### PRIMEX Backend API
- [ ] http://localhost:8000/ responds
- [ ] http://localhost:8000/health responds
- [ ] http://localhost:8000/clones returns data
- [ ] http://localhost:8000/invoke works
- [ ] http://localhost:8000/docs displays
- [ ] CORS configured correctly

## Performance Tests

### Response Times
- [ ] Chat responses < 3s
- [ ] PRIMEX responses < 5s
- [ ] Page loads < 2s
- [ ] API calls < 1s
- [ ] Database queries < 500ms

### Resource Usage
- [ ] Frontend memory usage acceptable
- [ ] Backend memory usage acceptable
- [ ] Ollama memory usage acceptable
- [ ] CPU usage under load acceptable
- [ ] Database connections managed

### Scalability
- [ ] Multiple concurrent users supported
- [ ] Multiple concurrent PRIMEX invocations
- [ ] Database handles load
- [ ] No memory leaks detected

## Security Tests

### Authentication Security
- [ ] JWT tokens secure
- [ ] Session hijacking prevented
- [ ] CSRF protection works
- [ ] XSS protection works

### Authorization Security
- [ ] Sovereign access properly restricted
- [ ] API routes validate permissions
- [ ] Database queries filter by user
- [ ] No unauthorized data access

### Data Security
- [ ] Passwords never stored
- [ ] API keys not exposed
- [ ] Environment variables secure
- [ ] HTTPS enforced (production)
- [ ] Webhook signatures validated

### PRIMEX Security
- [ ] Loyalty core verification works
- [ ] Owner credentials validated
- [ ] Audit logs created
- [ ] No unauthorized clone access

## Integration Tests

### Clerk Integration
- [ ] User creation webhook works
- [ ] User update webhook works
- [ ] User deletion webhook works
- [ ] Webhook signatures validate

### Stripe Integration
- [ ] Checkout session creation works
- [ ] Customer creation works
- [ ] Subscription creation works
- [ ] Webhook processing works
- [ ] Billing portal works

### Ollama Integration
- [ ] Ollama service connects
- [ ] Models load correctly
- [ ] Responses stream properly
- [ ] Error handling works
- [ ] Model switching works

## Error Handling Tests

### Frontend Errors
- [ ] Network errors display messages
- [ ] API errors display messages
- [ ] 404 pages display
- [ ] 500 pages display
- [ ] Form validation works

### Backend Errors
- [ ] Invalid requests return 400
- [ ] Unauthorized returns 401
- [ ] Forbidden returns 403
- [ ] Not found returns 404
- [ ] Server errors return 500
- [ ] Error messages helpful

### PRIMEX Errors
- [ ] Ollama connection errors handled
- [ ] Model not found errors handled
- [ ] Timeout errors handled
- [ ] Invalid clone errors handled

## Deployment Tests (Production)

### Vercel Deployment
- [ ] Build succeeds
- [ ] Environment variables set
- [ ] Domain configured
- [ ] SSL certificate valid
- [ ] Functions deploy correctly

### VPS Deployment
- [ ] PRIMEX service running
- [ ] Ollama service running
- [ ] Nginx configured
- [ ] SSL certificate valid
- [ ] Firewall configured

### Database
- [ ] Migrations applied
- [ ] Backups configured
- [ ] Connection pooling works
- [ ] Performance acceptable

### Monitoring
- [ ] Vercel Analytics working
- [ ] Error tracking working
- [ ] Uptime monitoring active
- [ ] Alerts configured

## User Acceptance Tests

### User Experience
- [ ] Onboarding clear
- [ ] Interface intuitive
- [ ] Features discoverable
- [ ] Help documentation accessible
- [ ] Feedback mechanisms work

### Performance Perception
- [ ] App feels responsive
- [ ] Loading times acceptable
- [ ] Animations smooth
- [ ] No lag or stuttering

### Feature Completeness
- [ ] All advertised features work
- [ ] No critical bugs
- [ ] Edge cases handled
- [ ] Error messages helpful

## Final Checklist

Before marking as production-ready:

- [ ] All critical tests pass
- [ ] No known critical bugs
- [ ] Performance acceptable
- [ ] Security validated
- [ ] Documentation complete
- [ ] Deployment successful
- [ ] Monitoring active
- [ ] Backup strategy in place
- [ ] Rollback plan documented
- [ ] Support channels ready

## Testing Notes

Record any issues, bugs, or observations during testing:

```
Date: ___________
Tester: ___________

Issues Found:
1. 
2. 
3. 

Performance Notes:


Security Concerns:


Recommendations:


```

---

**Testing Status: [ ] NOT STARTED  [ ] IN PROGRESS  [ ] COMPLETED**

**Production Ready: [ ] YES  [ ] NO**

**Blocker Issues: ___________**

---

**Sign-off:**

Tester: ___________ Date: ___________

Owner: ___________ Date: ___________
