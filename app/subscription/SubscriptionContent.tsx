'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Crown, Sparkles, CreditCard, ArrowLeft } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/app/lib/stripe';
import { cn } from '@/app/lib/utils';
import toast from 'react-hot-toast';

interface UserUsage {
  messagesThisMonth: number;
  maxMessages: number;
  plan: string;
}

export function SubscriptionContent() {
  const [currentPlan, setCurrentPlan] = useState<string>('STARTER');
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/usage');
      if (response.ok) {
        const data = await response.json();
        setUsage(data.usage);
        setCurrentPlan(data.usage.plan || 'STARTER');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const handleSubscribe = async (planKey: string) => {
    if (planKey === currentPlan) {
      toast.error('You are already on this plan');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ plan: planKey }),
      });

      const text = await response.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { raw: text };
      }

      if (!response.ok) {
        console.error('Create subscription failed', { status: response.status, body: data });
        if (response.status === 401) {
          toast.error('You must sign in to subscribe — redirecting to sign-in');
          router.push('/sign-in');
          return;
        }
        throw new Error(data?.error || data?.raw || 'Failed to create subscription');
      }

      if (data.clientSecret) {
        window.location.href = `/checkout?subscription_id=${data.subscriptionId}&client_secret=${data.clientSecret}`;
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      toast.success('Subscription flow started. Follow the next steps.');
    } catch (error: any) {
      console.error('handleSubscribe error', error);
      toast.error(error.message || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/subscriptions/billing-portal', {
        method: 'POST',
      });

      const text = await response.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { raw: text };
      }

      if (!response.ok) {
        console.error('Billing portal error', { status: response.status, body: data });
        if (response.status === 401) {
          toast.error('Sign in required to manage billing');
          router.push('/sign-in');
          return;
        }
        toast.error('Failed to open billing portal');
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Billing portal URL missing from response');
      }
    } catch (error) {
      toast.error('Failed to open billing portal');
    }
  };

  const planIcons = {
    STARTER: Sparkles,
    PROFESSIONAL: Zap,
    SOVEREIGN: Shield,
    ENTERPRISE: Crown,
  };

  const planColors = {
    STARTER: 'from-blue-500 to-cyan-500',
    PROFESSIONAL: 'from-purple-500 to-pink-500',
    SOVEREIGN: 'from-red-500 to-orange-500',
    ENTERPRISE: 'from-yellow-500 to-amber-500',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-white">Upgrade Your Plan</h1>
            </div>
            {currentPlan !== 'STARTER' && (
              <button
                onClick={handleManageBilling}
                className="flex items-center space-x-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/10"
              >
                <CreditCard className="h-4 w-4" />
                <span>Manage Billing</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      {usage && (
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Current Usage</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-white/60">Current Plan</p>
                  <p className="text-xl font-bold text-white">{usage.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Messages This Month</p>
                  <p className="text-xl font-bold text-white">
                    {usage.messagesThisMonth}
                    {usage.maxMessages !== -1 && (
                      <span className="text-sm font-normal text-white/60">
                        {' '}/ {usage.maxMessages}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Usage</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                        style={{ 
                          width: usage.maxMessages === -1 ? '0%' : 
                                 `${Math.min(100, (usage.messagesThisMonth / usage.maxMessages) * 100)}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-white/60">
                      {usage.maxMessages === -1 ? 'Unlimited' : 
                       `${Math.round((usage.messagesThisMonth / usage.maxMessages) * 100)}%`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Grid */}
      <div className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Choose Your Level of Sovereignty
            </h2>
            <p className="text-xl text-white/70">
              The AI that doesn't say no. Private. Uncensored. Yours.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {Object.entries(SUBSCRIPTION_PLANS).map(([planKey, plan], index) => {
              const Icon = planIcons[planKey as keyof typeof planIcons];
              const isCurrentPlan = currentPlan === planKey;
              const isPopular = plan.highlight;

              return (
                <motion.div
                  key={planKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'relative rounded-2xl border p-8 backdrop-blur-sm',
                    isCurrentPlan
                      ? 'border-green-500 bg-green-500/10'
                      : isPopular
                      ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/50'
                      : 'border-white/10 bg-white/5'
                  )}
                >
                  {isPopular && !isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <span className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                        Current Plan
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <div className={cn(
                      'mx-auto mb-4 inline-flex rounded-full bg-gradient-to-r p-3',
                      planColors[planKey as keyof typeof planColors]
                    )}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-white/60 mt-1 mb-4">{plan.tagline}</p>
                    
                    <div className="mt-4 mb-6">
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      <span className="text-white/60">/month</span>
                    </div>

                    <ul className="mb-8 space-y-3 text-left">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-400" />
                          <span className="text-sm text-white/80">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrentPlan ? (
                      <div className="rounded-lg bg-green-500/20 border border-green-500/30 px-4 py-2 text-sm font-medium text-green-400">
                        Your Current Plan
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSubscribe(planKey);
                        }}
                        disabled={loading}
                        type="button"
                        className={cn(
                          'w-full rounded-lg px-4 py-3 font-semibold text-white transition-all cursor-pointer',
                          cn(
                            'bg-gradient-to-r hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
                            planColors[planKey as keyof typeof planColors]
                          )
                        )}
                      >
                        {loading ? 'Processing...' : 'Upgrade Now'}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <p className="text-center text-white/50 mt-8">
            All plans include 7-day free trial. Cancel anytime. No questions asked.
          </p>
        </div>
      </div>
    </div>
  );
}
