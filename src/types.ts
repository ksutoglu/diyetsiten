// src/types.ts
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

// GENEL ARAYÜZLER
export interface MetaData {
  title?: string;
  ignoreTitleTemplate?: boolean;
  description?: string;
  image?: string;
}

export interface CallToAction {
  text: string;
  href: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
  class?: string; 
}

export interface Item {
  title: string;
  description?: string;
  icon?: string;
  href?: string;
}

// WIDGET'LARIN KULLANDIĞI TEMEL YAPI
export interface Widget {
  id?: string;
  isDark?: boolean;
  classes?: Record<string, string>;
  bg?: AstroComponentFactory | string;
}

// BİLEŞENLERE ÖZEL ARAYÜZLER
export interface Features extends Widget {
  title?: any;
  subtitle?: any;
  tagline?: any;
  items?: Array<Item>;
  columns?: number;
}

export interface Hero extends Widget {
  title?: any;
  subtitle?: any;
  tagline?: string;
  content?: any;
  actions?: Array<CallToAction>;
  image?: string | { src: string; alt: string };
}


export interface Link {
  text?: string;
  href?: string;
  ariaLabel?: string;
  icon?: string;
}
export interface MenuLink extends Link {
  links?: Array<MenuLink>;
}


export interface Stats extends Widget {
  stats?: Array<{ title: string; amount: string }>;
}