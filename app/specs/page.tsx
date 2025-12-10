// ABOUTME: Context editor page with 3 tabs
// ABOUTME: Each context has localStorage override with server file fallback

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  STORAGE_KEYS,
  DEFAULT_FACILITY_SPECS,
  DEFAULT_DESIGN_GUIDELINES,
  DEFAULT_COMPANY_CONTEXT,
} from '@/lib/context';

type TabId = 'facilitySpecs' | 'designGuidelines' | 'companyContext';

interface Tab {
  id: TabId;
  label: string;
  labelHe: string;
  file: string;
  defaultContent: string;
}

const TABS: Tab[] = [
  {
    id: 'facilitySpecs',
    label: 'Facility Specs',
    labelHe: 'מפרט טכני',
    file: '/facility-specs.txt',
    defaultContent: DEFAULT_FACILITY_SPECS,
  },
  {
    id: 'designGuidelines',
    label: 'Design Guidelines',
    labelHe: 'הנחיות עיצוב',
    file: '/design-guidelines.txt',
    defaultContent: DEFAULT_DESIGN_GUIDELINES,
  },
  {
    id: 'companyContext',
    label: 'Company Context',
    labelHe: 'הקשר חברה',
    file: '/company-context.txt',
    defaultContent: DEFAULT_COMPANY_CONTEXT,
  },
];

export default function SpecsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('facilitySpecs');
  const [contents, setContents] = useState<Record<TabId, string>>({
    facilitySpecs: '',
    designGuidelines: '',
    companyContext: '',
  });
  const [originals, setOriginals] = useState<Record<TabId, string>>({
    facilitySpecs: '',
    designGuidelines: '',
    companyContext: '',
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);

  const currentTab = TABS.find((t) => t.id === activeTab)!;
  const hasChanges = contents[activeTab] !== originals[activeTab];

  // Load all contexts on mount
  useEffect(() => {
    const loadAll = async () => {
      const newContents: Record<TabId, string> = {
        facilitySpecs: '',
        designGuidelines: '',
        companyContext: '',
      };
      const newOriginals: Record<TabId, string> = {
        facilitySpecs: '',
        designGuidelines: '',
        companyContext: '',
      };

      for (const tab of TABS) {
        // Check localStorage first
        const saved = localStorage.getItem(STORAGE_KEYS[tab.id]);
        if (saved) {
          newContents[tab.id] = saved;
          newOriginals[tab.id] = saved;
          continue;
        }

        // Try server file
        try {
          const res = await fetch(tab.file);
          if (res.ok) {
            const text = await res.text();
            newContents[tab.id] = text;
            newOriginals[tab.id] = text;
            continue;
          }
        } catch {
          // Fall through
        }

        // Use default
        newContents[tab.id] = tab.defaultContent;
        newOriginals[tab.id] = tab.defaultContent;
      }

      setContents(newContents);
      setOriginals(newOriginals);
      setLoading(false);
    };

    loadAll();
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEYS[activeTab], contents[activeTab]);
    setOriginals((prev) => ({ ...prev, [activeTab]: contents[activeTab] }));
    setSuccess('Saved to your session');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDiscard = () => {
    setContents((prev) => ({ ...prev, [activeTab]: originals[activeTab] }));
  };

  const handleReset = async () => {
    if (!window.confirm('Reset to server default? Your changes will be lost.')) return;

    localStorage.removeItem(STORAGE_KEYS[activeTab]);

    // Reload from server
    try {
      const res = await fetch(currentTab.file);
      if (res.ok) {
        const text = await res.text();
        setContents((prev) => ({ ...prev, [activeTab]: text }));
        setOriginals((prev) => ({ ...prev, [activeTab]: text }));
        setSuccess('Reset to default');
        setTimeout(() => setSuccess(null), 3000);
        return;
      }
    } catch {
      // Fall through
    }

    // Use code default
    setContents((prev) => ({ ...prev, [activeTab]: currentTab.defaultContent }));
    setOriginals((prev) => ({ ...prev, [activeTab]: currentTab.defaultContent }));
    setSuccess('Reset to default');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleTabChange = (newTab: TabId) => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Discard and switch tabs?');
      if (!confirmed) return;
    }
    setActiveTab(newTab);
  };

  const handleContentChange = (value: string) => {
    setContents((prev) => ({ ...prev, [activeTab]: value }));
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
            <span className="text-lg font-medium text-[var(--pbf-navy)]">Context Editor</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-[var(--pbf-navy)]/70 hover:text-[var(--pbf-ocean)] transition">
              Visualization Studio
            </Link>
            <span className="text-sm text-[var(--pbf-ocean)] font-medium">Context Editor</span>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="glass-panel rounded-2xl p-2 mb-6 animate-fade-in-up">
          <div className="flex gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[var(--pbf-ocean)] to-[var(--pbf-turquoise)] text-white'
                    : 'bg-white border border-[var(--pbf-ocean)]/20 text-[var(--pbf-navy)] hover:bg-[var(--pbf-aqua-light)]'
                }`}
              >
                <span className="block">{tab.label}</span>
                <span className="block text-xs opacity-70">{tab.labelHe}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="glass-panel rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--pbf-navy)]">{currentTab.label}</h2>
              {hasChanges && <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="text-xs text-[var(--pbf-navy)]/50 hover:text-red-500 transition px-3 py-2"
              >
                Reset to Default
              </button>
              {hasChanges && (
                <button onClick={handleDiscard} className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium">
                  Discard
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="btn-primary px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-[60vh] rounded-xl bg-[var(--pbf-aqua-pale)]/50 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-[var(--pbf-turquoise)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <textarea
              value={contents[activeTab]}
              onChange={(e) => handleContentChange(e.target.value)}
              className="input-premium w-full h-[60vh] px-4 py-4 rounded-xl text-sm font-mono resize-none"
              placeholder="Enter context..."
            />
          )}

          {success && (
            <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
              {success}
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-[var(--pbf-navy)]/50">
          {activeTab === 'facilitySpecs' && 'Technical measurements - dimensions, tank specs, building features'}
          {activeTab === 'designGuidelines' && 'Visual style guidelines - colors, materials, atmosphere, what to avoid'}
          {activeTab === 'companyContext' && 'About PBF - mission, technology, facilities, value proposition'}
        </div>
      </main>
    </div>
  );
}
