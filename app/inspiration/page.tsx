// ABOUTME: Inspiration page with angle reference list and image gallery
// ABOUTME: Bilingual (Hebrew + English) guide for visualization angles

'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ViewAngle {
  nameEn: string;
  nameHe: string;
  description: string;
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
      { nameEn: 'Aerial / Bird\'s Eye', nameHe: 'מבט אווירי / ציפור', description: '45 deg from above, full facility layout' },
      { nameEn: 'Eye-Level Entrance', nameHe: 'מבט גובה עיניים - כניסה', description: 'Human perspective approaching building' },
      { nameEn: 'Corner View (3/4)', nameHe: 'מבט פינתי', description: 'Shows two facades simultaneously' },
      { nameEn: 'Drone Oblique', nameHe: 'מבט דרון אלכסוני', description: 'Dramatic angle emphasizing scale' },
      { nameEn: 'Sunset / Golden Hour', nameHe: 'שקיעה / שעת הזהב', description: 'Warm lighting, atmospheric' },
    ],
  },
  {
    titleEn: 'Interior Views',
    titleHe: 'מבטים פנימיים',
    views: [
      { nameEn: 'Wide Interior Panorama', nameHe: 'פנורמה פנימית רחבה', description: 'Full hall with tank rows visible' },
      { nameEn: 'Walkway Perspective', nameHe: 'מבט שביל / מעבר', description: 'Human POV walking between tanks' },
      { nameEn: 'Tank Close-up', nameHe: 'תקריב בריכה', description: 'Single tank detail - water, fish, monitoring' },
      { nameEn: 'Elevated Platform', nameHe: 'מבט מרומם', description: 'From monitoring station looking down' },
      { nameEn: 'Control Room', nameHe: 'חדר בקרה', description: 'Screens, operators, technology focus' },
    ],
  },
  {
    titleEn: 'Specialized Views',
    titleHe: 'מבטים מיוחדים',
    views: [
      { nameEn: 'Cross-Section / Cutaway', nameHe: 'חתך', description: 'Reveals internal systems, pipes, water flow' },
      { nameEn: 'Night / Lighting', nameHe: 'לילה / תאורה', description: 'LED effects, atmosphere, dramatic' },
      { nameEn: 'Operations', nameHe: 'תפעול', description: 'Workers in lab coats, equipment in action' },
      { nameEn: 'Construction Progress', nameHe: 'התקדמות בנייה', description: 'Phases of construction for investor updates' },
    ],
  },
];

const GALLERY_IMAGES = [
  '/inspiration/pbf-visualization.png',
  '/inspiration/pbf-visualization (2).png',
  '/inspiration/pbf-visualization (3).png',
  '/inspiration/pbf-visualization (7).png',
  '/inspiration/pbf-visualization (8).png',
];

export default function InspirationPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);

  useEffect(() => {
    // Check which images exist
    GALLERY_IMAGES.forEach((src) => {
      const img = new window.Image();
      img.onload = () => setLoadedImages((prev) => [...prev, src]);
      img.src = src;
    });
  }, []);

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
            <a href="/" className="text-sm text-[var(--pbf-navy)]/70 hover:text-[var(--pbf-ocean)] transition">Studio</a>
            <a href="/blueprints" className="text-sm text-[var(--pbf-navy)]/70 hover:text-[var(--pbf-ocean)] transition">Blueprints</a>
            <a href="/specs" className="text-sm text-[var(--pbf-navy)]/70 hover:text-[var(--pbf-ocean)] transition">Context</a>
            <a href="/help" className="text-sm text-[var(--pbf-navy)]/70 hover:text-[var(--pbf-ocean)] transition">Help</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[var(--pbf-navy)] mb-2">Visualization Angles</h1>
          <h2 className="text-2xl font-medium text-[var(--pbf-ocean)] mb-4" dir="rtl">זוויות להדמיה</h2>
          <p className="text-[var(--pbf-navy)]/60 max-w-2xl mx-auto">
            Reference guide for visualization angles. Use these ideas to guide your prompts.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Left: Angle Categories */}
          <div className="space-y-8">
            {CATEGORIES.map((category) => (
              <section key={category.titleEn} className="glass-panel rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-[var(--pbf-navy)]">{category.titleEn}</h2>
                  <span className="text-[var(--pbf-ocean)]">/</span>
                  <h2 className="text-lg font-medium text-[var(--pbf-ocean)]" dir="rtl">{category.titleHe}</h2>
                </div>
                <div className="space-y-3">
                  {category.views.map((view) => (
                    <div key={view.nameEn} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--pbf-aqua-light)]/50 hover:bg-[var(--pbf-aqua-light)] transition">
                      <div className="w-2 h-2 mt-2 rounded-full bg-[var(--pbf-turquoise)]" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-[var(--pbf-navy)] text-sm">{view.nameEn}</span>
                          <span className="text-[var(--pbf-ocean)]/50">|</span>
                          <span className="font-medium text-[var(--pbf-ocean)] text-sm" dir="rtl">{view.nameHe}</span>
                        </div>
                        <p className="text-xs text-[var(--pbf-navy)]/60 mt-1">{view.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Right: Gallery */}
          <div className="space-y-4">
            <div className="glass-panel rounded-2xl p-6 sticky top-24">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--pbf-ocean)] mb-4">
                Example Gallery / גלריית דוגמאות
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {loadedImages.map((src, idx) => (
                  <button
                    key={src}
                    onClick={() => setSelectedImage(src)}
                    className="aspect-video rounded-xl overflow-hidden border-2 border-transparent hover:border-[var(--pbf-turquoise)] transition hover-lift"
                  >
                    <Image
                      src={src}
                      alt={`Example ${idx + 1}`}
                      width={200}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              {loadedImages.length === 0 && (
                <p className="text-sm text-[var(--pbf-navy)]/50 text-center py-8">Loading images...</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full">
            <Image
              src={selectedImage}
              alt="Selected visualization"
              width={1200}
              height={675}
              className="w-full h-auto rounded-xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-[var(--pbf-navy)] hover:bg-white"
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
