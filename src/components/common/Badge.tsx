import React from 'react';
import { PipelineStage, Priority, PaymentStatus, TechnologyTrack, Role } from '../../types/crm';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    primary: 'bg-brand-50 text-brand-700 border border-brand-200',
    purple: 'bg-purple-100 text-purple-800 border border-purple-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    neutral: 'bg-slate-50 text-slate-600 border border-slate-200',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide transition-colors ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  switch (priority) {
    case 'High':
      return (
        <Badge variant="danger" size="sm">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          High Priority
        </Badge>
      );
    case 'Medium':
      return (
        <Badge variant="warning" size="sm">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Medium
        </Badge>
      );
    case 'Low':
      return (
        <Badge variant="neutral" size="sm">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Low
        </Badge>
      );
  }
};

export const StageBadge: React.FC<{ stage: PipelineStage }> = ({ stage }) => {
  switch (stage) {
    case 'New':
      return <Badge variant="neutral">{stage}</Badge>;
    case 'Contacted':
      return <Badge variant="info">{stage}</Badge>;
    case 'Meeting Scheduled':
      return <Badge variant="primary">{stage}</Badge>;
    case 'Session Proposed':
      return <Badge variant="purple">{stage}</Badge>;
    case 'Approved':
      return <Badge variant="warning">{stage}</Badge>;
    case 'Session Scheduled':
      return <Badge variant="primary">{stage}</Badge>;
    case 'Session Completed':
      return <Badge variant="info">{stage}</Badge>;
    case 'Course Proposed':
      return <Badge variant="purple">{stage}</Badge>;
    case 'Converted':
      return (
        <Badge variant="success">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {stage}
        </Badge>
      );
    case 'Lost':
      return <Badge variant="danger">{stage}</Badge>;
    case 'On Hold':
      return <Badge variant="neutral">{stage}</Badge>;
    default:
      return <Badge>{stage}</Badge>;
  }
};

export const TrackBadge: React.FC<{ track: TechnologyTrack }> = ({ track }) => {
  switch (track) {
    case 'AI Agents':
      return <Badge variant="purple">🤖 {track}</Badge>;
    case 'AI & Automation':
      return <Badge variant="primary">⚡ {track}</Badge>;
    case 'No-code & Vibe Coding':
      return <Badge variant="info">✨ {track}</Badge>;
    case 'Data Analytics':
      return <Badge variant="success">📊 {track}</Badge>;
    default:
      return <Badge>{track}</Badge>;
  }
};

export const PaymentBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  switch (status) {
    case 'Paid':
      return <Badge variant="success">Paid in Full</Badge>;
    case 'Partial':
      return <Badge variant="warning">Partially Paid</Badge>;
    case 'Unpaid':
      return <Badge variant="danger">Unpaid</Badge>;
  }
};

export const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  switch (role) {
    case 'Admin':
      return <Badge variant="purple">Admin</Badge>;
    case 'Manager':
      return <Badge variant="primary">Manager</Badge>;
    case 'Team Member':
      return <Badge variant="neutral">Team Member</Badge>;
  }
};
