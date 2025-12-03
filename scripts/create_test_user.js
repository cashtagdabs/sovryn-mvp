const { prisma, getOrCreateUser } = require('../app/lib/db');

async function main(){
  try{
    const clerkId = process.env.TEST_CLERK_ID || 'test_user_local';
    const email = process.env.TEST_EMAIL || 'test@local.dev';
    const name = process.env.TEST_NAME || 'Local Tester';

    if (typeof getOrCreateUser === 'function'){
      const user = await getOrCreateUser(clerkId, email, name);
      console.log('Upserted user:', user);
    } else if (prisma && prisma.user && prisma.user.upsert){
      const user = await prisma.user.upsert({
        where: { clerkId },
        update: { email, name },
        create: { clerkId, email, name },
      });
      console.log('Upserted user via prisma:', user);
    } else {
      console.error('Prisma client not available');
    }
  }catch(e){
    console.error('Error creating test user', e);
    process.exit(1);
  }
}

main();
