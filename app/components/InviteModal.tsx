'use client';

import { useState } from 'react';
import { X, Copy, Check, Mail, MessageCircle, Share2, Gift } from 'lucide-react';
import { useUser } from '../hooks/useClerkUser';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);

  // Generate referral link (use actual user ID in production)
  const referralCode = user?.id?.slice(0, 8) || 'DEMO123';
  const referralLink = `https://sovryn-mvp.vercel.app/signup?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform: string) => {
    const text = `Join me on SOVRYN AI - the best AI platform with PRIMEX! Get started: ${referralLink}`;
    
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      email: `mailto:?subject=${encodeURIComponent('Join SOVRYN AI')}&body=${encodeURIComponent(text)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 px-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Gift className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Invite Friends</h2>
                <p className="text-sm text-white/60">
                  Share SOVRYN and earn rewards
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Rewards Info */}
            <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Gift className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    Earn Rewards for Every Referral
                  </h3>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>• You get 1 month free Pro when they upgrade</li>
                    <li>• They get 20% off their first month</li>
                    <li>• Unlimited referrals, unlimited rewards</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Referral Link */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Your Referral Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors flex items-center gap-2 text-white font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Share Buttons */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Share via
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleShare('email')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg transition-colors text-white"
                >
                  <Mail className="w-5 h-5" />
                  <span className="font-medium">Email</span>
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg transition-colors text-white"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">Twitter</span>
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg transition-colors text-white"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg transition-colors text-white"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">LinkedIn</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">0</p>
                <p className="text-xs text-white/60 mt-1">Invites Sent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">0</p>
                <p className="text-xs text-white/60 mt-1">Signups</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">0</p>
                <p className="text-xs text-white/60 mt-1">Rewards Earned</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white/5 border-t border-white/10">
            <p className="text-xs text-white/60 text-center">
              Rewards are applied automatically when your referrals upgrade to Pro
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
