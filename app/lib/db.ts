import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: any;
}

let prismaInstance: any = null;

// In development, if Prisma cannot connect, fall back to a small in-memory mock
function createInMemoryPrisma() {
  const nanoid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

  const users: Record<string, any> = {};
  const subscriptions: Record<string, any> = {};
  const conversations: Record<string, any> = {};
  const messages: Record<string, any> = {};

  return {
    user: {
      async findUnique({ where }: any) {
        if (where.clerkId) {
          return Object.values(users).find((u) => u.clerkId === where.clerkId) || null;
        }
        return null;
      },
      async upsert({ where, update, create }: any) {
        const key = where.clerkId;
        let existing = Object.values(users).find((u) => u.clerkId === key);
        if (existing) {
          Object.assign(existing, update || {});
          return existing;
        }
        const id = nanoid();
        const newUser = Object.assign({ id }, create || {});
        users[id] = newUser;
        return newUser;
      },
    },
    subscription: {
      async upsert({ where, update, create }: any) {
        const userId = where.userId;
        const existing = subscriptions[userId];
        if (existing) {
          Object.assign(existing, update || {});
          return existing;
        }
        const newSub = Object.assign({ id: nanoid() }, create || {});
        subscriptions[userId] = newSub;
        return newSub;
      },
      async update({ where, data }: any) {
        const entry = subscriptions[where.userId];
        if (!entry) throw new Error('No subscription');
        Object.assign(entry, data);
        return entry;
      },
    },
    conversation: {
      async create({ data }: any) {
        const id = nanoid();
        const conv = Object.assign({ id, createdAt: new Date(), updatedAt: new Date() }, data);
        conversations[id] = conv;
        return conv;
      },
      async findFirst({ where }: any) {
        if (!where) return null;
        return Object.values(conversations).find((c) => c.id === where.id && c.userId === where.userId) || null;
      },
    },
    message: {
      async create({ data }: any) {
        const id = nanoid();
        const msg = Object.assign({ id, createdAt: new Date(), updatedAt: new Date() }, data);
        messages[id] = msg;
        return msg;
      },
    },
    // basic query support for tests
    async $disconnect() { },
  };
}

// Track if we've already tried to connect and failed
let connectionFailed = false;

function getPrisma() {
  if (!prismaInstance) {
    // Force in-memory mode if OFFLINE_MODE is set or connection previously failed
    const forceOffline = process.env.OFFLINE_MODE === 'true' || connectionFailed;

    if (!process.env.DATABASE_URL || forceOffline) {
      // No database in env or offline mode — fall back to in-memory (dev only)
      if (process.env.NODE_ENV !== 'production') {
        prismaInstance = createInMemoryPrisma();
        global.prisma = prismaInstance;
        console.warn('[DB] Using in-memory Prisma mock for development (offline mode)');
        return prismaInstance;
      }
      throw new Error('DATABASE_URL not set');
    }

    try {
      prismaInstance = new PrismaClient();
      if (process.env.NODE_ENV !== 'production') {
        global.prisma = prismaInstance;
      }
    } catch (e) {
      console.error('[DB Init Error]', e);
      if (process.env.NODE_ENV !== 'production') {
        connectionFailed = true;
        prismaInstance = createInMemoryPrisma();
        global.prisma = prismaInstance;
        console.warn('[DB] Falling back to in-memory Prisma mock after init error');
      } else {
        throw e;
      }
    }
  }
  return prismaInstance;
}

// Wrapper to handle connection errors at runtime
export async function withDatabaseFallback<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (error?.code === 'P1001' || error?.message?.includes("Can't reach database server")) {
      console.warn('[DB] Database unreachable, using fallback value');
      connectionFailed = true;
      // Reset instance to trigger in-memory on next access
      prismaInstance = null;
      return fallback;
    }
    throw error;
  }
}

export const prisma = new Proxy({}, {
  get(_, prop) {
    return (getPrisma() as any)[prop];
  }
}) as any;

export async function getOrCreateUser(clerkId: string, email: string, name?: string) {
  return await prisma.user.upsert({
    where: { clerkId },
    update: { email, name },
    create: { clerkId, email, name },
  });
}
