"use client"

import React from 'react';

type SectionProps = {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
};

export const Section = ({ title, icon: Icon, children, className }: SectionProps) => (
  <section className={`bg-white dark:bg-gray-800/50 shadow-xl rounded-xl p-8 md:p-10 ring-1 ring-gray-200 dark:ring-gray-700 ${className}`}>
    <div className="flex flex-col sm:flex-row items-center mb-6 md:mb-8">
      {Icon && <Icon className="w-12 h-12 sm:w-14 sm:h-14 text-primary mr-0 sm:mr-6 mb-4 sm:mb-0 flex-shrink-0" />}
      <h2 className={`text-3xl sm:text-4xl font-semibold text-gray-700 dark:text-gray-200 ${Icon ? 'text-center sm:text-left' : 'w-full text-center sm:text-left'}`}>
        {title}
      </h2>
    </div>
    {children}
  </section>
); 