import React from 'react';

export interface NavLinkItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export interface ProjectAsset {
  seed: string;
  name: string;
  type?: 'ai-canvas' | 'nutshel-studios';
  sourceApp?: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  bannerSeed: string;
  generations: ProjectAsset[];
}

export interface User {
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
}

