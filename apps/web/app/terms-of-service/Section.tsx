"use client"

import React from 'react';

type SectionProps = {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
};

export const Section = ({ title, icon: Icon, children }: SectionProps) => (
  <section className="mb-8">
    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
      <Icon className="w-7 h-7 text-primary mr-3 flex-shrink-0" />
      {title}
    </h2>
    {children}
  </section>
); 