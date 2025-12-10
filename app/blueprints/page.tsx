// ABOUTME: Blueprints/reference images management page
// ABOUTME: View, upload, and select reference images for visualization

'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Blueprint {
  id: string;
  name: string;
  url: string;
  description: string;
  isCustom: boolean;
}

const STORAGE_KEY = 'pbf-blueprints';

// Default blueprints that come with the app
const DEFAULT_BLUEPRINTS: Blueprint[] = [
  {
    id: 'main-building',
    name: 'Main Building Plan',
    url: '/blueprints/main-building-architectural_plan.jpg',
    description: '2 halls, 12 tanks (6 per hall)',
    isCustom: false,
  },
  {
    id: 'quarantine',
    name: 'Quarantine Building',
    url: '/blueprints/quarantine-plan.jpg',
    description: '14 smaller tanks',
    isCustom: false,
  },
  {
    id: 'full-facility',
    name: 'Full Facility Plan',
    url: '/blueprints/full-facility-plan.png',
    description: 'Main building + quarantine + external tanks',
    isCustom: false,
  },
];

export default function BlueprintsPage() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load blueprints on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const custom = JSON.parse(saved) as Blueprint[];
        setBlueprints([...DEFAULT_BLUEPRINTS, ...custom]);
      } catch {
        setBlueprints(DEFAULT_BLUEPRINTS);
      }
    } else {
      setBlueprints(DEFAULT_BLUEPRINTS);
    }
    setLoading(false);
  }, []);

  // Save custom blueprints
  const saveCustomBlueprints = (all: Blueprint[]) => {
    const custom = all.filter((b) => b.isCustom);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newBlueprint: Blueprint = {
        id: `custom-${Date.now()}`,
        name: uploadName || file.name.replace(/\.[^/.]+$/, ''),
        url: dataUrl,
        description: uploadDesc || 'Custom uploaded blueprint',
        isCustom: true,
      };

      const updated = [...blueprints, newBlueprint];
      setBlueprints(updated);
      saveCustomBlueprints(updated);

      // Reset form
      setUploadName('');
      setUploadDesc('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this blueprint?')) return;
    const updated = blueprints.filter((b) => b.id !== id);
    setBlueprints(updated);
    saveCustomBlueprints(updated);
    if (selectedId === id) setSelectedId(null);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    // Store selected blueprint for use in main page
    const blueprint = blueprints.find((b) => b.id === id);
    if (blueprint) {
      localStorage.setItem('pbf-selected-blueprint', JSON.stringify(blueprint));
    }
  };

  const handleUseInStudio = () => {
    if (!selectedId) return;
    const blueprint = blueprints.find((b) => b.id === selectedId);
    if (blueprint) {
      localStorage.setItem('pbf-selected-blueprint', JSON.stringify(blueprint));
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[var(--pbf-aqua-pale)] to-white">
      {/* Header */}
      <header className="border-b border-[var(--pbf-ocean)]/10 bg-white/70 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image src="/logo.png" alt="Pure Blue Fish" width={180} height={88} className="h-12 w-auto" />
            </Link>
            <div className="h-8 w-px bg-[var(--pbf-ocean)]/20" />
            <span className="text-lg font-medium text-[var(--pbf-navy)]">Blueprints</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-[var(--pbf-navy)]/70 hover:text-[var(--pbf-ocean)] transition">
              Studio
            </Link>
            <Link href="/specs" className="text-sm text-[var(--pbf-navy)]/70 hover:text-[var(--pbf-ocean)] transition">
              Context Editor
            </Link>
            <span className="text-sm text-[var(--pbf-ocean)] font-medium">Blueprints</span>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Blueprints Grid */}
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--pbf-ocean)]">
                  Reference Images
                </h2>
                {selectedId && (
                  <button onClick={handleUseInStudio} className="btn-primary px-4 py-2 rounded-lg text-sm font-medium">
                    Use in Studio
                  </button>
                )}
              </div>

              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-[var(--pbf-turquoise)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {blueprints.map((blueprint) => (
                    <div
                      key={blueprint.id}
                      onClick={() => handleSelect(blueprint.id)}
                      className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover-lift ${
                        selectedId === blueprint.id
                          ? 'border-[var(--pbf-turquoise)] ring-2 ring-[var(--pbf-turquoise)]/30'
                          : 'border-[var(--pbf-ocean)]/10 hover:border-[var(--pbf-ocean)]/30'
                      }`}
                    >
                      <div className="aspect-[4/3] relative bg-[var(--pbf-aqua-pale)]">
                        <Image
                          src={blueprint.url}
                          alt={blueprint.name}
                          fill
                          className="object-cover"
                          unoptimized={blueprint.isCustom}
                        />
                      </div>
                      <div className="p-3 bg-white">
                        <h3 className="font-medium text-sm text-[var(--pbf-navy)] truncate">{blueprint.name}</h3>
                        <p className="text-xs text-[var(--pbf-navy)]/60 truncate">{blueprint.description}</p>
                      </div>

                      {/* Delete button for custom blueprints */}
                      {blueprint.isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(blueprint.id);
                          }}
                          className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition hover:bg-white"
                        >
                          x
                        </button>
                      )}

                      {/* Selected indicator */}
                      {selectedId === blueprint.id && (
                        <div className="absolute top-2 left-2 w-6 h-6 bg-[var(--pbf-turquoise)] rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upload Panel */}
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--pbf-ocean)] mb-4">
                Upload New Blueprint
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--pbf-navy)]/70 mb-1">Name</label>
                  <input
                    type="text"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="e.g., Quarantine Building"
                    className="input-premium w-full px-3 py-2 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--pbf-navy)]/70 mb-1">Description</label>
                  <input
                    type="text"
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    placeholder="e.g., Floor plan with 14 tanks"
                    className="input-premium w-full px-3 py-2 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--pbf-navy)]/70 mb-1">Image</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 rounded-xl border-2 border-dashed border-[var(--pbf-ocean)]/20 text-sm text-[var(--pbf-navy)]/60 hover:border-[var(--pbf-turquoise)] hover:bg-[var(--pbf-aqua-light)]/30 transition flex flex-col items-center gap-2"
                  >
                    <svg className="w-8 h-8 text-[var(--pbf-ocean)]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Click to upload</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Preview */}
            {selectedId && (
              <div className="glass-panel rounded-2xl p-6 animate-fade-in-up">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--pbf-ocean)] mb-4">
                  Selected
                </h2>
                {(() => {
                  const selected = blueprints.find((b) => b.id === selectedId);
                  if (!selected) return null;
                  return (
                    <div>
                      <div className="aspect-[4/3] relative rounded-xl overflow-hidden mb-3">
                        <Image
                          src={selected.url}
                          alt={selected.name}
                          fill
                          className="object-cover"
                          unoptimized={selected.isCustom}
                        />
                      </div>
                      <h3 className="font-medium text-[var(--pbf-navy)]">{selected.name}</h3>
                      <p className="text-sm text-[var(--pbf-navy)]/60">{selected.description}</p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Info */}
            <div className="text-center text-sm text-[var(--pbf-navy)]/50 px-4">
              Select a blueprint and click &quot;Use in Studio&quot; to set it as your reference image for visualization.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
