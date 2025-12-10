// ABOUTME: Specification documents editor page
// ABOUTME: Tabs for facility spec, company context, and AI context - read/write via API

'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type DocId = 'facility' | 'company' | 'context';

interface Tab {
  id: DocId;
  label: string;
  labelHe: string;
}

const TABS: Tab[] = [
  { id: 'facility', label: 'Facility Spec', labelHe: 'מפרט מתקן' },
  { id: 'company', label: 'Company Context', labelHe: 'הקשר חברה' },
  { id: 'context', label: 'AI Context', labelHe: 'הקשר AI' },
];

export default function SpecsPage() {
  const [activeTab, setActiveTab] = useState<DocId>('facility');
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [docName, setDocName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hasChanges = content !== originalContent;

  const loadDocument = useCallback(async (docId: DocId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/specs?doc=${docId}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to load');

      setContent(data.content);
      setOriginalContent(data.content);
      setDocName(data.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocument(activeTab);
  }, [activeTab, loadDocument]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/specs?doc=${activeTab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save');

      setOriginalContent(content);
      setSuccess(data.message);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setContent(originalContent);
    setError(null);
    setSuccess(null);
  };

  const handleTabChange = (newTab: DocId) => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Discard and switch tabs?');
      if (!confirmed) return;
    }
    setActiveTab(newTab);
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
            <span className="text-lg font-medium text-[var(--pbf-navy)]">Specification Editor</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-[var(--pbf-navy)]/70 hover:text-[var(--pbf-ocean)] transition"
            >
              Visualization Studio
            </Link>
            <span className="text-sm text-[var(--pbf-ocean)] font-medium">
              Specs Editor
            </span>
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
              <h2 className="text-lg font-semibold text-[var(--pbf-navy)]">{docName}</h2>
              {hasChanges && (
                <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
              )}
            </div>
            <div className="flex gap-3">
              {hasChanges && (
                <button
                  onClick={handleDiscard}
                  className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Discard
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="btn-primary px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-[60vh] rounded-xl bg-[var(--pbf-aqua-pale)]/50 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-[var(--pbf-turquoise)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-premium w-full h-[60vh] px-4 py-4 rounded-xl text-sm font-mono resize-none"
              placeholder="Document content..."
              dir={activeTab === 'facility' ? 'rtl' : 'ltr'}
            />
          )}

          {/* Status Messages */}
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
              {success}
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-[var(--pbf-navy)]/50">
          {activeTab === 'facility' && 'Hebrew facility specifications - dimensions, layouts, technical details'}
          {activeTab === 'company' && 'English company context - about PBF, technology, team'}
          {activeTab === 'context' && 'TypeScript code - context injected into AI image generation prompts'}
        </div>
      </main>
    </div>
  );
}
