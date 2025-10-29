import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Helper function to get or create user
export async function getOrCreateUser(clerkId: string, email: string, name?: string) {
  return await prisma.user.upsert({
    where: { clerkId },
    update: { email, name },
    create: {
      clerkId,
      email,
      name,
    },
  });
}
