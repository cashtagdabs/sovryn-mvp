'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Zap, 
  Server, 
  CheckCircle, 
  ArrowRight,
  Brain,
  Eye,
  EyeOff,
  Building2,
  Users,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/app/lib/stripe';

export function LandingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "What do you mean by 'uncensored'?",
      a: "Unlike ChatGPT and Claude, Sovryn doesn't refuse requests based on arbitrary content policies. We provide real, direct answers to legitimate questions - whether you're a researcher, writer, developer, or professional who needs actual information, not sanitized corporate responses."
    },
    {
      q: "Is this legal?",
      a: "Absolutely. We don't enable illegal activity. We simply don't treat adult professionals like children. You can discuss mature topics, get unfiltered analysis, and receive honest answers without the AI constantly refusing to engage."
    },
    {
      q: "What does '100% local' mean?",
      a: "With our Sovereign tier, you can run Sovryn entirely on your own hardware. Your data never leaves your network. Zero cloud dependency. Perfect for healthcare, legal, government, or anyone who takes privacy seriously."
    },
    {
      q: "Is Sovryn HIPAA compliant?",
      a: "Our Enterprise tier includes HIPAA compliance pathway with BAA (Business Associate Agreement) available. We provide the documentation and infrastructure needed for healthcare organizations to use AI legally and safely."
    },
    {
      q: "Do you train on my data?",
      a: "No. Never. Your conversations are yours. We don't use your data to train models, we don't sell it, we don't share it. With the Sovereign tier, your data doesn't even touch our servers."
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-red-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
        
        {/* Navigation */}
        <nav className="relative z-10 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-red-500" />
                <span className="text-2xl font-bold">SOVRYN</span>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => router.push('/sign-in')}
                  className="text-white/70 hover:text-white transition"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => router.push('/sign-up')}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center space-x-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2 mb-8">
              <span className="text-red-400 text-sm font-medium">The AI That Doesn't Say No</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Finally, AI That
              <span className="bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent"> Actually Works</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/70 mb-8 max-w-3xl mx-auto">
              No more "I can't help with that." No more sanitized corporate responses. 
              Get real answers to real questions. Private. Uncensored. Sovereign.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button 
                onClick={() => router.push('/sign-up')}
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 px-8 py-4 rounded-lg font-semibold text-lg transition flex items-center justify-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto border border-white/20 hover:bg-white/5 px-8 py-4 rounded-lg font-semibold text-lg transition"
              >
                View Pricing
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/50 text-sm">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>End-to-end encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <EyeOff className="h-4 w-4" />
                <span>No data training</span>
              </div>
              <div className="flex items-center space-x-2">
                <Server className="h-4 w-4" />
                <span>Self-host available</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Tired of AI That Treats You Like a Child?
              </h2>
              <div className="space-y-4 text-white/70">
                <p className="flex items-start space-x-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>"I can't help with that request"</span>
                </p>
                <p className="flex items-start space-x-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>"As an AI, I need to be careful about..."</span>
                </p>
                <p className="flex items-start space-x-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>"I'd recommend speaking to a professional..."</span>
                </p>
                <p className="flex items-start space-x-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Your data used to train their models</span>
                </p>
                <p className="flex items-start space-x-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>No option for true privacy</span>
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-green-400">Sovryn Is Different</h3>
              <div className="space-y-4">
                <p className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Direct, uncensored answers to your questions</span>
                </p>
                <p className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>No corporate content policies limiting you</span>
                </p>
                <p className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Your data is NEVER used for training</span>
                </p>
                <p className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>100% local deployment option available</span>
                </p>
                <p className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>HIPAA compliance pathway for healthcare</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-24 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Built For Professionals Who Need Real AI</h2>
            <p className="text-xl text-white/70">Not another toy. A tool that actually works.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Brain, title: 'Researchers', desc: 'Explore any topic without arbitrary restrictions' },
              { icon: MessageSquare, title: 'Writers', desc: 'Create content without censorship filters' },
              { icon: Building2, title: 'Healthcare', desc: 'HIPAA-ready AI for medical professionals' },
              { icon: Users, title: 'Enterprises', desc: 'Private, secure AI for sensitive operations' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-black/50 border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition"
              >
                <item.icon className="h-10 w-10 text-purple-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-white/60">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-white/70">No hidden fees. No surprises. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-6 ${
                  plan.highlight 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-white/10 bg-white/5'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-white/60 mb-4">{plan.tagline}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-white/60">/month</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.slice(0, 5).map((feature, j) => (
                    <li key={j} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 5 && (
                    <li className="text-sm text-white/50">
                      +{plan.features.length - 5} more features
                    </li>
                  )}
                </ul>

                <button
                  onClick={() => router.push('/sign-up')}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-white/50 mt-8">
            All plans include 7-day free trial. No credit card required to start.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i}
                className="border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition"
                >
                  <span className="font-semibold pr-4">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-white/70">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Ready for AI That Actually Works?
          </h2>
          <p className="text-xl text-white/70 mb-8">
            Join thousands of professionals who switched to Sovryn for uncensored, private AI.
          </p>
          <button
            onClick={() => router.push('/sign-up')}
            className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 px-12 py-4 rounded-lg font-semibold text-lg transition"
          >
            Start Your Free Trial
          </button>
          <p className="text-white/50 mt-4 text-sm">
            No credit card required • 7-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-500" />
              <span className="text-xl font-bold">SOVRYN</span>
            </div>
            <div className="flex items-center space-x-6 text-white/60 text-sm">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Contact</a>
            </div>
            <p className="text-white/40 text-sm">
              © 2026 Sovryn AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
