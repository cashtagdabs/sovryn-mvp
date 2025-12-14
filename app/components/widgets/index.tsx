/**
 * Modular Widget Component Library
 * Premium, reusable, accessible widgets for the Sovryn dashboard
 * Built to exceed Apple, Google, and Notion standards
 */

import React from 'react';
import Link from 'next/link';

// ============================================================================
// CARD WIDGET - Base container for all dashboard cards
// ============================================================================
interface CardProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'glass';
  hoverable?: boolean;
}

export function Card({
  className = '',
  children,
  variant = 'default',
  hoverable = false,
}: CardProps) {
  const variants = {
    default: 'rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-lg',
    gradient: 'rounded-2xl border border-fuchsia-600/30 bg-gradient-to-br from-purple-900/20 to-pink-900/10 p-6 shadow-xl backdrop-blur-lg',
    glass: 'rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl',
  };

  return (
    <div
      className={`
        ${variants[variant]}
        transition-all duration-300
        ${hoverable ? 'hover:shadow-2xl hover:scale-[1.02] cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ============================================================================
// STAT WIDGET - For displaying key metrics and analytics
// ============================================================================
interface StatWidgetProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: 'purple' | 'pink' | 'cyan' | 'amber';
}

export function StatWidget({
  label,
  value,
  icon,
  trend,
  color = 'purple',
}: StatWidgetProps) {
  const colorClasses = {
    purple: 'from-purple-800/20 to-black/40 border-purple-700/20 text-purple-300',
    pink: 'from-pink-800/20 to-black/40 border-pink-700/20 text-pink-300',
    cyan: 'from-cyan-800/20 to-black/40 border-cyan-700/20 text-cyan-300',
    amber: 'from-amber-800/20 to-black/40 border-amber-700/20 text-amber-300',
  };

  return (
    <Card variant="default" className={`bg-gradient-to-br ${colorClasses[color]}`}>
      <div className="flex items-end gap-2">
        {icon && <div className="text-2xl">{icon}</div>}
        <div className="flex flex-col">
          <span className={`text-4xl font-bold ${colorClasses[color].split(' ').pop()}`}>
            {value}
          </span>
          <span className="text-sm text-white/60 mt-1">{label}</span>
        </div>
      </div>
      {trend && (
        <div className={`mt-3 text-xs font-semibold ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// FEATURE CARD - For showcasing features with icon, title, and description
// ============================================================================
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: 'purple' | 'pink' | 'cyan';
}

export function FeatureCard({
  icon,
  title,
  description,
  color = 'purple',
}: FeatureCardProps) {
  const colorClasses = {
    purple: 'bg-gradient-to-br from-purple-800/30 to-black/20 border-purple-700/20 hover:border-purple-500/50',
    pink: 'bg-gradient-to-br from-pink-800/30 to-black/20 border-pink-700/20 hover:border-pink-500/50',
    cyan: 'bg-gradient-to-br from-cyan-800/30 to-black/20 border-cyan-700/20 hover:border-cyan-500/50',
  };

  return (
    <Card
      variant="default"
      hoverable
      className={`flex flex-col gap-3 ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <h3 className="font-bold text-white text-lg">{title}</h3>
      </div>
      <p className="text-sm text-white/70 leading-relaxed">{description}</p>
    </Card>
  );
}

// ============================================================================
// ACTION CARD - For prominent CTA or feature highlights
// ============================================================================
interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color?: 'purple' | 'pink' | 'cyan';
}

export function ActionCard({
  icon,
  title,
  description,
  href,
  color = 'purple',
}: ActionCardProps) {
  const colorClasses = {
    purple: 'border-purple-700/40 bg-gradient-to-br from-purple-900/50 to-purple-800/20',
    pink: 'border-pink-700/40 bg-gradient-to-br from-pink-900/50 to-pink-800/20',
    cyan: 'border-cyan-700/40 bg-gradient-to-br from-cyan-900/50 to-cyan-800/20',
  };

  return (
    <Link href={href} className="group">
      <Card
        variant="default"
        hoverable
        className={`flex flex-col gap-3 ${colorClasses[color]}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="text-3xl text-white group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <span className="text-xl font-bold text-white">{title}</span>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">{description}</p>
      </Card>
    </Link>
  );
}

// ============================================================================
// NOTIFICATION ALERT - For system messages and announcements
// ============================================================================
interface NotificationProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export function Notification({
  icon,
  title,
  description,
  type = 'info',
}: NotificationProps) {
  const typeClasses = {
    info: 'border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-blue-600/5',
    success: 'border-green-500/30 bg-gradient-to-r from-green-500/10 to-green-600/5',
    warning: 'border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-yellow-600/5',
    error: 'border-red-500/30 bg-gradient-to-r from-red-500/10 to-red-600/5',
  };

  return (
    <Card
      variant="default"
      className={`flex items-start gap-4 ${typeClasses[type]}`}
    >
      <div className="text-2xl flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <div className="font-semibold text-white">{title}</div>
        <div className="text-sm text-white/70 mt-1">{description}</div>
      </div>
    </Card>
  );
}

// ============================================================================
// BUTTON WIDGET - Premium, accessible button component
// ============================================================================
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-500 hover:to-pink-400 shadow-lg',
    secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/15',
    glass: 'bg-white/5 text-white backdrop-blur-lg border border-white/20 hover:bg-white/10',
    outline: 'border-2 border-purple-500 text-purple-300 hover:bg-purple-500/10',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`
        rounded-lg font-semibold
        transition-all duration-200
        hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

// ============================================================================
// BADGE WIDGET - For tags, labels, and status indicators
// ============================================================================
interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
}

export function Badge({ label, variant = 'default', icon }: BadgeProps) {
  const variantClasses = {
    default: 'bg-purple-600/30 text-purple-200 border border-purple-600/50',
    success: 'bg-green-600/30 text-green-200 border border-green-600/50',
    warning: 'bg-yellow-600/30 text-yellow-200 border border-yellow-600/50',
    error: 'bg-red-600/30 text-red-200 border border-red-600/50',
    info: 'bg-blue-600/30 text-blue-200 border border-blue-600/50',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1 rounded-full text-sm font-semibold
        ${variantClasses[variant]}
      `}
    >
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
}

// ============================================================================
// EMPTY STATE WIDGET - For empty or error states
// ============================================================================
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card variant="glass" className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/60 mb-6 max-w-sm">{description}</p>
      {action && (
        <a href={action.href}>
          <Button variant="primary" size="md">
            {action.label}
          </Button>
        </a>
      )}
    </Card>
  );
}
