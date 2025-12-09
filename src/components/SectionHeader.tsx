import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  color?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon: Icon,
  title,
  color = 'text-slate-800',
}) => (
  <div className="flex items-center gap-2 mb-4">
    <div className={`p-2 rounded-lg bg-slate-50 ${color}`}>
      <Icon size={20} />
    </div>
    <h3 className="font-bold text-lg text-slate-800">{title}</h3>
  </div>
);
