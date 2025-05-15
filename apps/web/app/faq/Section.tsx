import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function Section({ title, icon: Icon, children }: SectionProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-100">
        <Icon className="mr-3 h-7 w-7 text-primary" />
        {title}
      </h2>
      <div className="text-gray-600 dark:text-gray-300 space-y-4">
        {children}
      </div>
    </section>
  );
}
