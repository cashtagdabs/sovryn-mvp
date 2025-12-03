import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

let prismaInstance: PrismaClient | null = null;

// Lazy initialization - only create when first accessed
function getPrisma() {
  if (!prismaInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not set');
    }
    try {
      prismaInstance = new PrismaClient();
      if (process.env.NODE_ENV !== 'production') {
        global.prisma = prismaInstance;
      }
    } catch (e) {
      console.error('[DB Init Error]', e);
      throw e;
    }
  }
  return prismaInstance;
}

// Create a proxy object that defers instantiation
export const prisma = new Proxy(
  {},
  {
    get(_, prop) {
      return (getPrisma() as any)[prop];
    },
  }
) as PrismaClient;

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
