import { prisma } from './db';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from './stripe';

export interface UsageStats {
  messagesThisMonth: number;
  maxMessages: number;
  canSendMessage: boolean;
  plan: SubscriptionTier;
}

export async function getUserUsage(userId: string): Promise<UsageStats> {
  // Get user's subscription
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const plan = (user.subscription?.plan as SubscriptionTier) || 'FREE';
  const planConfig = SUBSCRIPTION_PLANS[plan];

  // Get start of current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Count messages this month
  const messagesThisMonth = await prisma.message.count({
    where: {
      userId: user.id,
      role: 'USER', // Only count user messages
      createdAt: {
        gte: startOfMonth,
      },
    },
  });

  const maxMessages = planConfig.maxMessages;
  const canSendMessage = maxMessages === -1 || messagesThisMonth < maxMessages;

  return {
    messagesThisMonth,
    maxMessages,
    canSendMessage,
    plan,
  };
}

export async function checkUsageLimit(userId: string): Promise<boolean> {
  const usage = await getUserUsage(userId);
  return usage.canSendMessage;
}

export async function incrementUsage(userId: string): Promise<void> {
  // Usage is automatically tracked when messages are saved to the database
  // This function could be used for additional analytics or rate limiting
}

export function getRemainingMessages(usage: UsageStats): number {
  if (usage.maxMessages === -1) return -1; // Unlimited
  return Math.max(0, usage.maxMessages - usage.messagesThisMonth);
}

export function getUsagePercentage(usage: UsageStats): number {
  if (usage.maxMessages === -1) return 0; // Unlimited plans show 0%
  return Math.min(100, (usage.messagesThisMonth / usage.maxMessages) * 100);
}

export function shouldShowUpgradePrompt(usage: UsageStats): boolean {
  if (usage.plan === 'FREE') {
    return usage.messagesThisMonth >= usage.maxMessages * 0.8; // Show at 80% usage
  }
  return false;
}

export async function getMonthlyUsageHistory(userId: string, months: number = 6) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - months);

  const messages = await prisma.message.findMany({
    where: {
      userId,
      role: 'USER',
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
      tokenCount: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group by month
  const monthlyStats: Record<string, { messages: number; tokens: number }> = {};

  messages.forEach((message) => {
    const monthKey = message.createdAt.toISOString().slice(0, 7); // YYYY-MM
    if (!monthlyStats[monthKey]) {
      monthlyStats[monthKey] = { messages: 0, tokens: 0 };
    }
    monthlyStats[monthKey].messages++;
    monthlyStats[monthKey].tokens += message.tokenCount || 0;
  });

  return monthlyStats;
}
