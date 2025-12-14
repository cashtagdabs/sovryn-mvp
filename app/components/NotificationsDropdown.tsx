'use client';

import { Bell, Check, X, Sparkles, CreditCard, Trophy, MessageCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Mock notifications (replace with real API data)
  const notifications = [
    {
      id: 1,
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      title: 'Welcome to SOVRYN!',
      message: 'Your account is ready. Start chatting with PRIMEX now.',
      time: '2 min ago',
      unread: true,
      action: { label: 'Start Chat', href: '/chat' },
    },
    {
      id: 2,
      icon: <Trophy className="w-4 h-4 text-yellow-400" />,
      title: 'Achievement Unlocked',
      message: 'You earned "First Chat" badge! Keep going.',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      icon: <CreditCard className="w-4 h-4 text-green-400" />,
      title: 'Free Trial Active',
      message: 'You have 7 days of premium access. Upgrade anytime.',
      time: '2 hours ago',
      unread: false,
      action: { label: 'View Plans', href: '/subscription' },
    },
    {
      id: 4,
      icon: <MessageCircle className="w-4 h-4 text-blue-400" />,
      title: 'New Model Available',
      message: 'PRIMEX Ultra is now available for all users.',
      time: '1 day ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-12 right-0 w-96 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-white/20 shadow-2xl overflow-hidden z-50"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-white" />
          <h3 className="font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-white/40">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs mt-2">We'll notify you when something happens</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-white/5 transition-colors ${
                  notification.unread ? 'bg-white/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="mt-1 flex-shrink-0">{notification.icon}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-white text-sm">
                        {notification.title}
                      </div>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-sm text-white/60 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-white/40">
                        {notification.time}
                      </span>
                      {notification.action && (
                        <a
                          href={notification.action.href}
                          onClick={onClose}
                          className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
                        >
                          {notification.action.label} →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
          <button className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Mark all as read
          </button>
          <a
            href="/notifications"
            onClick={onClose}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            View all →
          </a>
        </div>
      )}
    </div>
  );
}
