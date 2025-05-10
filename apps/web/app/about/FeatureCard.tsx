"use client"

import React from 'react';

type FeatureCardProps = {
  title: string;
  icon: React.ElementType;
  description: string;
};

export const FeatureCard = ({ title, icon: Icon, description }: FeatureCardProps) => (
  <div className="bg-gray-50 dark:bg-gray-700/60 p-6 rounded-lg transform hover:scale-105 transition-transform duration-300 ease-in-out shadow-md">
    <Icon className="w-10 h-10 text-secondary mb-4" />
    <h3 className="font-semibold text-xl mb-2 text-gray-700 dark:text-gray-200">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
  </div>
); 