'use client';

import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquare, Search, Sparkles, CreditCard, Brain, Zap, Shield, Globe } from "lucide-react";

export function DashboardContent() {
  const router = useRouter();

  const features = [
    {
      title: 'AI Chat',
      description: 'Chat with GPT-4, Claude 3, and more',
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-500',
      href: '/chat',
      available: true,
    },
    {
      title: 'Web Search',
      description: 'Real-time search with citations',
      icon: Search,
      color: 'from-blue-500 to-cyan-500',
      href: '/search',
      available: false,
    },
    {
      title: 'PRIMEX Sovereign',
      description: 'Elite AI command system',
      icon: Shield,
      color: 'from-red-500 to-orange-500',
      href: '/primex',
      available: false,
    },
    {
      title: 'Prompt Library',
      description: 'Save and share prompts',
      icon: Sparkles,
      color: 'from-green-500 to-emerald-500',
      href: '/prompts',
      available: false,
    },
  ];

  const stats = [
    { label: 'Models Available', value: '10+', icon: Brain },
    { label: 'Response Time', value: '<1s', icon: Zap },
    { label: 'Global Users', value: '1M+', icon: Globe },
    { label: 'Uptime', value: '99.9%', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.h1 
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                SOVRYN
              </motion.h1>
              <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white">
                BETA
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/subscription')}
                className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
              >
                <CreditCard className="h-4 w-4" />
                <span>Upgrade</span>
              </button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white"
          >
            Welcome to the Future of AI
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-xl text-white/70"
          >
            The most advanced multi-model AI platform ever created
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <Icon className="mb-2 h-8 w-8 text-purple-400" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h3 className="mb-8 text-center text-3xl font-bold text-white">
            Powerful Features
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity group-hover:opacity-10`}
                  />
                  <div className="relative z-10">
                    <div
                      className={`mb-4 inline-flex rounded-lg bg-gradient-to-r ${feature.color} p-3`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="mb-2 text-lg font-semibold text-white">
                      {feature.title}
                    </h4>
                    <p className="mb-4 text-sm text-white/60">
                      {feature.description}
                    </p>
                    {feature.available ? (
                      <button
                        onClick={() => router.push(feature.href)}
                        className="text-sm font-medium text-purple-400 hover:text-purple-300"
                      >
                        Launch →
                      </button>
                    ) : (
                      <span className="text-sm text-white/40">Coming Soon</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-8 backdrop-blur-sm"
          >
            <h3 className="mb-4 text-2xl font-bold text-white">
              Ready to Experience the Future?
            </h3>
            <p className="mb-6 text-white/70">
              Start chatting with the world&apos;s most advanced AI models
            </p>
            <button
              onClick={() => router.push('/chat')}
              className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 font-semibold text-white transition-all hover:opacity-90"
            >
              Start Chatting Now
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
