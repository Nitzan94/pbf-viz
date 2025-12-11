// ABOUTME: Inspiration gallery page with visualization angles reference
// ABOUTME: Bilingual (Hebrew + English) guide for users to understand available views

'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ViewAngle {
  id: string;
  nameEn: string;
  nameHe: string;
  description: string;
  image?: string;
}

interface Category {
  titleEn: string;
  titleHe: string;
  views: ViewAngle[];
}

const CATEGORIES: Category[] = [
  {
    titleEn: 'Exterior Views',
    titleHe: 'מבטים חיצוניים',
    views: [
      {
        id: 'aerial',
        nameEn: 'Aerial / Bird\'s Eye',
        nameHe: 'מבט אווירי / ציפור',
        description: '45 deg from above, full facility layout, tank arrangement',
        image: '/inspiration/aerial.jpg',
      },
      {
        id: 'entrance',
        nameEn: 'Eye-Level Entrance',
        nameHe: 'מבט גובה עיניים - כניסה',
        description: 'Human perspective approaching building entrance',
        image: '/inspiration/entrance.jpg',
      },
      {
        id: 'corner',
        nameEn: 'Corner View (3/4)',
        nameHe: 'מבט פינתי',
        description: 'Shows two facades simultaneously',
        image: '/inspiration/corner.jpg',
      },
      {
        id: 'drone',
        nameEn: 'Drone Oblique',
        nameHe: 'מבט דרון אלכסוני',
        description: 'Dramatic angle emphasizing scale',
        image: '/inspiration/drone.jpg',
      },
      {
        id: 'sunset',
        nameEn: 'Sunset / Golden Hour',
        nameHe: 'שקיעה / שעת הזהב',
        description: 'Warm lighting, atmospheric',
        image: '/inspiration/sunset.jpg',
      },
    ],
  },
  {
    titleEn: 'Interior Views',
    titleHe: 'מבטים פנימיים',
    views: [
      {
        id: 'panorama',
        nameEn: 'Wide Interior Panorama',
        nameHe: 'פנורמה פנימית רחבה',
        description: 'Full hall with tank rows visible',
        image: '/inspiration/panorama.jpg',
      },
      {
        id: 'walkway',
        nameEn: 'Walkway Perspective',
        nameHe: 'מבט שביל / מעבר',
        description: 'Human POV walking between tanks',
        image: '/inspiration/walkway.jpg',
      },
      {
        id: 'tank-closeup',
        nameEn: 'Tank Close-up',
        nameHe: 'תקריב בריכה',
        description: 'Single tank detail - water, fish, monitoring',
        image: '/inspiration/tank-closeup.jpg',
      },
      {
        id: 'elevated',
        nameEn: 'Elevated Platform',
        nameHe: 'מבט מרומם',
        description: 'From monitoring station looking down',
        image: '/inspiration/elevated.jpg',
      },
      {
        id: 'control-room',
        nameEn: 'Control Room',
        nameHe: 'חדר בקרה',
        description: 'Screens, operators, technology focus',
        image: '/inspiration/control-room.jpg',
      },
    ],
  },
  {
    titleEn: 'Specialized Views',
    titleHe: 'מבטים מיוחדים',
    views: [
      {
        id: 'cross-section',
        nameEn: 'Cross-Section / Cutaway',
        nameHe: 'חתך',
        description: 'Reveals internal systems, pipes, water flow',
        image: '/inspiration/cross-section.jpg',
      },
      {
        id: 'night',
        nameEn: 'Night / Lighting',
        nameHe: 'לילה / תאורה',
        description: 'LED effects, atmosphere, dramatic',
        image: '/inspiration/night.jpg',
      },
      {
        id: 'operations',
        nameEn: 'Operations',
        nameHe: 'תפעול',
        description: 'Workers in lab coats, equipment in action',
        image: '/inspiration/operations.jpg',
      },
      {
        id: 'construction',
        nameEn: 'Construction Progress',
        nameHe: 'התקדמות בנייה',
        description: 'Phases of construction for investor updates',
        image: '/inspiration/construction.jpg',
      },
    ],
  },
];

function ViewCard({ view }: { view: ViewAngle }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden hover-lift transition-all">
      <div className="aspect-video bg-gradient-to-br from-[var(--pbf-aqua-light)] to-[var(--pbf-aqua-pale)] relative">
        {view.image && !imageError ? (
          <Image
            src={view.image}
            alt={view.nameEn}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <svg className="w-10 h-10 mx-auto text-[var(--pbf-ocean)]/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-[var(--pbf-navy)]/40">Image pending</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-[var(--pbf-navy)] text-sm">{view.nameEn}</h3>
        <h4 className="font-medium text-[var(--pbf-ocean)] text-sm mb-2" dir="rtl">{view.nameHe}</h4>
        <p className="text-xs text-[var(--pbf-navy)]/60">{view.description}</p>
      </div>
    </div>
  );
}

export default function InspirationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[var(--pbf-aqua-pale)] to-white">
      {/* Header */}
      <header className="border-b border-[var(--pbf-ocean)]/10 bg-white/70 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Pure Blue Fish" width={180} height={88} className="h-12 w-auto" />
            <div className="h-8 w-px bg-[var(--pbf-ocean)]/20" />
            <span className="text-lg font-medium text-[var(--pbf-navy)]">Inspiration Gallery</span>
          </div>
          <nav className="flex items-center gap-4">
            <a href="/" className="text-sm text-[var(--pbf-navy)]/70 hover:text-[var(--pbf-ocean)] transition">
              Studio
            </a>
            <a href="/blueprints" className="text-sm text-[var(--pbf-navy)]/70 hover:text-[var(--pbf-ocean)] transition">
              Blueprints
            </a>
            <a href="/specs" className="text-sm text-[var(--pbf-navy)]/70 hover:text-[var(--pbf-ocean)] transition">
              Context
            </a>
            <a href="/help" className="text-sm text-[var(--pbf-navy)]/70 hover:text-[var(--pbf-ocean)] transition">
              Help
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[var(--pbf-navy)] mb-2">
            Visualization Angles
          </h1>
          <h2 className="text-2xl font-medium text-[var(--pbf-ocean)] mb-4" dir="rtl">
            זוויות להדמיה
          </h2>
          <p className="text-[var(--pbf-navy)]/60 max-w-2xl mx-auto">
            Reference guide for visualization angles. Use these examples to guide your prompts in the Studio.
          </p>
          <p className="text-[var(--pbf-navy)]/60 max-w-2xl mx-auto mt-1" dir="rtl">
            מדריך זוויות להדמיות. השתמשו בדוגמאות אלה כהשראה לפרומפטים בסטודיו.
          </p>
        </div>

        {/* Categories */}
        {CATEGORIES.map((category) => (
          <section key={category.titleEn} className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold text-[var(--pbf-navy)]">{category.titleEn}</h2>
              <div className="h-px flex-1 bg-[var(--pbf-ocean)]/10" />
              <h2 className="text-xl font-medium text-[var(--pbf-ocean)]" dir="rtl">{category.titleHe}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.views.map((view) => (
                <ViewCard key={view.id} view={view} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
