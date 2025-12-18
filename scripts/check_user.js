const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

function generateId() {
  return 'c' + crypto.randomBytes(12).toString('hex');
}

(async () => {
  const prisma = new PrismaClient();
  try {
    const email = 'tylerchoag@gmail.com';
    
    // Find user by email
    let user = await prisma.user.findUnique({ 
      where: { email },
      include: { Subscription: true }
    });
    
    if (user) {
      console.log('Found existing user:', JSON.stringify(user, null, 2));
      
      // Update or create subscription to SOVEREIGN
      const subscription = await prisma.subscription.upsert({
        where: { userId: user.id },
        update: { 
          plan: 'SOVEREIGN', 
          status: 'ACTIVE' 
        },
        create: {
          id: generateId(),
          userId: user.id,
          stripeCustomerId: `cus_sovereign_${user.id.slice(-8)}`,
          plan: 'SOVEREIGN',
          status: 'ACTIVE',
        },
      });
      
      console.log('\n✅ Subscription updated to SOVEREIGN:', JSON.stringify(subscription, null, 2));
    } else {
      console.log('No user found with email:', email);
    }
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
})();
