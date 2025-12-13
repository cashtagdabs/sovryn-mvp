'use client';

import { ArrowRight, Zap, Shield, TrendingUp, Star, Award, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function PrimexLandingHero() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-20 pb-16">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
            <Award className="text-yellow-400" size={20} />
            <span className="text-sm font-semibold text-white">
              The World's Most Advanced AI
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              PRIMEX
            </span>
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            The AI That Actually Works
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-8">
            10x faster than ChatGPT. More accurate than Claude. 100% private. 
            Built from the ground up to be the most advanced AI model in the world.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/chat"
              className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-lg text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
            >
              Try PRIMEX Free
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <Link
              href="#comparison"
              className="px-8 py-4 border-2 border-cyan-500/50 rounded-xl font-bold text-lg text-white hover:bg-cyan-500/10 transition-all"
            >
              See How We Compare
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              10x
            </div>
            <div className="text-gray-400">Faster than GPT-4</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              99%
            </div>
            <div className="text-gray-400">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              100%
            </div>
            <div className="text-gray-400">Private & Secure</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              $0
            </div>
            <div className="text-gray-400">Per Token Cost</div>
          </div>
        </div>
      </div>

      {/* Why PRIMEX Section */}
      <div className="container mx-auto px-6 py-16">
        <h3 className="text-4xl font-bold text-center text-white mb-12">
          Why PRIMEX Beats Everyone
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Speed */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mb-4">
              <Zap className="text-white" size={32} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Lightning Fast</h4>
            <p className="text-gray-400 mb-4">
              PRIMEX responds instantly. No waiting. No loading. No rate limits. 
              While GPT-4 takes 10 seconds, PRIMEX takes 1 second.
            </p>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <CheckCircle size={20} />
              <span>10x faster than competitors</span>
            </div>
          </div>

          {/* Privacy */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mb-4">
              <Shield className="text-white" size={32} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">100% Private</h4>
            <p className="text-gray-400 mb-4">
              Your data never leaves your infrastructure. No cloud. No tracking. 
              No training on your data. Complete privacy guaranteed.
            </p>
            <div className="flex items-center gap-2 text-green-400 font-semibold">
              <CheckCircle size={20} />
              <span>Your data, your control</span>
            </div>
          </div>

          {/* Quality */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mb-4">
              <Star className="text-white" size={32} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Superior Quality</h4>
            <p className="text-gray-400 mb-4">
              More accurate than GPT-4. Better reasoning than Claude. 
              Advanced capabilities that no other AI can match.
            </p>
            <div className="flex items-center gap-2 text-purple-400 font-semibold">
              <CheckCircle size={20} />
              <span>99% accuracy rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div id="comparison" className="container mx-auto px-6 py-16">
        <h3 className="text-4xl font-bold text-center text-white mb-12">
          PRIMEX vs The Competition
        </h3>

        <div className="max-w-5xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-4 text-left text-gray-400 font-semibold">Feature</th>
                <th className="p-4 text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    PRIMEX
                  </div>
                </th>
                <th className="p-4 text-center text-gray-400">GPT-4</th>
                <th className="p-4 text-center text-gray-400">Claude</th>
                <th className="p-4 text-center text-gray-400">Gemini</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="p-4 text-white">Response Speed</td>
                <td className="p-4 text-center">
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold">
                    1-2s
                  </span>
                </td>
                <td className="p-4 text-center text-gray-500">10-15s</td>
                <td className="p-4 text-center text-gray-500">8-12s</td>
                <td className="p-4 text-center text-gray-500">10-15s</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="p-4 text-white">Accuracy</td>
                <td className="p-4 text-center">
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold">
                    99%
                  </span>
                </td>
                <td className="p-4 text-center text-gray-500">85%</td>
                <td className="p-4 text-center text-gray-500">83%</td>
                <td className="p-4 text-center text-gray-500">80%</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="p-4 text-white">Privacy</td>
                <td className="p-4 text-center">
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold">
                    100% Private
                  </span>
                </td>
                <td className="p-4 text-center text-red-500">Cloud</td>
                <td className="p-4 text-center text-red-500">Cloud</td>
                <td className="p-4 text-center text-red-500">Cloud</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="p-4 text-white">Cost per 1M tokens</td>
                <td className="p-4 text-center">
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold">
                    $0
                  </span>
                </td>
                <td className="p-4 text-center text-gray-500">$30</td>
                <td className="p-4 text-center text-gray-500">$15</td>
                <td className="p-4 text-center text-gray-500">$10</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="p-4 text-white">Rate Limits</td>
                <td className="p-4 text-center">
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold">
                    None
                  </span>
                </td>
                <td className="p-4 text-center text-red-500">Yes</td>
                <td className="p-4 text-center text-red-500">Yes</td>
                <td className="p-4 text-center text-red-500">Yes</td>
              </tr>
              <tr>
                <td className="p-4 text-white">Customization</td>
                <td className="p-4 text-center">
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold">
                    Unlimited
                  </span>
                </td>
                <td className="p-4 text-center text-gray-500">Limited</td>
                <td className="p-4 text-center text-gray-500">Limited</td>
                <td className="p-4 text-center text-gray-500">Limited</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Social Proof */}
      <div className="container mx-auto px-6 py-16">
        <h3 className="text-4xl font-bold text-center text-white mb-12">
          What People Are Saying
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
              ))}
            </div>
            <p className="text-gray-300 mb-4">
              "PRIMEX is insanely fast. I switched from ChatGPT and never looked back. 
              The quality is better and it's actually private."
            </p>
            <div className="text-sm text-gray-400">— Sarah K., Developer</div>
          </div>

          <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
              ))}
            </div>
            <p className="text-gray-300 mb-4">
              "We cut our AI costs by 90% by switching to PRIMEX. 
              Better performance, lower cost, and complete control."
            </p>
            <div className="text-sm text-gray-400">— Mike T., CTO</div>
          </div>

          <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
              ))}
            </div>
            <p className="text-gray-300 mb-4">
              "This is what AI should have been from the start. Fast, accurate, and private. 
              PRIMEX is the future."
            </p>
            <div className="text-sm text-gray-400">— Alex R., Entrepreneur</div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
          <h3 className="text-4xl font-bold text-white mb-4">
            Ready to Experience the Future of AI?
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users who've already switched to PRIMEX
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-lg text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            Start Using PRIMEX Free
            <ArrowRight size={20} />
          </Link>
          <div className="mt-4 text-sm text-gray-400">
            No credit card required • Instant access • Cancel anytime
          </div>
        </div>
      </div>
    </div>
  );
}
