const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const clerkId = process.env.DEV_CLERK_ID || 'dev-user-1';
    const email = process.env.DEV_CLERK_EMAIL || 'dev@example.com';
    const name = process.env.DEV_CLERK_NAME || 'Dev User';

    const user = await prisma.user.upsert({
      where: { clerkId },
      update: { email, name },
      create: { clerkId, email, name },
    });

    console.log('User upserted:', user.id, user.clerkId);

    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: { plan: 'SOVEREIGN', status: 'ACTIVE' },
      create: {
        userId: user.id,
        stripeCustomerId: `test_${clerkId}`,
        plan: 'SOVEREIGN',
        status: 'ACTIVE',
      },
    });

    console.log('Subscription upserted:', subscription.plan, subscription.status);
  } catch (e) {
    console.error('Error creating dev user:', e);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
