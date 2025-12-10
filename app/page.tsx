// ABOUTME: Main page for PBF Visualization Studio v2
// ABOUTME: Agent-native: loads 3 contexts, passes to chat API

'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { INITIAL_ASSISTANT_MESSAGE } from '@/lib/prompts';
import {
  STORAGE_KEYS,
  DEFAULT_FACILITY_SPECS,
  DEFAULT_DESIGN_GUIDELINES,
  DEFAULT_COMPANY_CONTEXT,
} from '@/lib/context';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type Mode = 'chat' | 'direct';

const STORAGE_KEY = 'pbf-viz-state';

interface PersistedState {
  apiKey: string;
  messages: Message[];
  history: string[];
  generatedImage: string | null;
  mode: Mode;
}

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [mode, setMode] = useState<Mode>('chat');

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: INITIAL_ASSISTANT_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [extractedPrompt, setExtractedPrompt] = useState<string | null>(null);

  // Direct mode state
  const [directPrompt, setDirectPrompt] = useState('');
  const [includeContext, setIncludeContext] = useState(true);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('2K');

  // Shared state
  const [imageLoading, setImageLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [blueprintName, setBlueprintName] = useState<string | null>(null);

  // 3 contexts for agent-native architecture
  const [facilitySpecs, setFacilitySpecs] = useState(DEFAULT_FACILITY_SPECS);
  const [designGuidelines, setDesignGuidelines] = useState(DEFAULT_DESIGN_GUIDELINES);
  const [companyContext, setCompanyContext] = useState(DEFAULT_COMPANY_CONTEXT);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persisted state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: PersistedState = JSON.parse(saved);
        if (state.apiKey) setApiKey(state.apiKey);
        if (state.messages?.length > 0) setMessages(state.messages);
        if (state.history?.length > 0) setHistory(state.history);
        if (state.generatedImage) setGeneratedImage(state.generatedImage);
        if (state.mode) setMode(state.mode);
      }
    } catch {
      // Ignore parse errors
    }

    // Load selected blueprint from /blueprints page
    const selectedBlueprint = localStorage.getItem('pbf-selected-blueprint');
    if (selectedBlueprint) {
      try {
        const bp = JSON.parse(selectedBlueprint);
        setReferenceImage(bp.url);
        setBlueprintName(bp.name);
        localStorage.removeItem('pbf-selected-blueprint'); // Clear after loading
      } catch {
        // Ignore
      }
    }

    setHydrated(true);
  }, []);

  // Load all 3 contexts: localStorage > server file > default
  useEffect(() => {
    const loadOneContext = async (
      key: keyof typeof STORAGE_KEYS,
      file: string,
      defaultVal: string,
      setter: (val: string) => void
    ) => {
      // Check localStorage first
      const saved = localStorage.getItem(STORAGE_KEYS[key]);
      if (saved) {
        setter(saved);
        return;
      }
      // Try server file
      try {
        const res = await fetch(file);
        if (res.ok) {
          setter(await res.text());
          return;
        }
      } catch {
        // Fall through to default
      }
      setter(defaultVal);
    };

    loadOneContext('facilitySpecs', '/facility-specs.txt', DEFAULT_FACILITY_SPECS, setFacilitySpecs);
    loadOneContext('designGuidelines', '/design-guidelines.txt', DEFAULT_DESIGN_GUIDELINES, setDesignGuidelines);
    loadOneContext('companyContext', '/company-context.txt', DEFAULT_COMPANY_CONTEXT, setCompanyContext);
  }, []);

  // Persist state on changes
  useEffect(() => {
    if (!hydrated) return;
    const state: PersistedState = { apiKey, messages, history, generatedImage, mode };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [apiKey, messages, history, generatedImage, mode, hydrated]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Extract prompt from message
  const extractPromptFromMessage = (content: string): string | null => {
    const match = content.match(/---PROMPT---\s*([\s\S]*?)\s*---END---/);
    return match ? match[1].trim() : null;
  };

  // Check last message for prompt
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      const prompt = extractPromptFromMessage(lastMessage.content);
      setExtractedPrompt(prompt);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || chatLoading) return;

    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key');
      return;
    }

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setError(null);
    setChatLoading(true);

    setMessages([...newMessages, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          apiKey,
          facilitySpecs,
          designGuidelines,
          companyContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Chat failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantContent += parsed.text;
                setMessages([...newMessages, { role: 'assistant', content: assistantContent }]);
              }
              if (parsed.error) throw new Error(parsed.error);
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Chat error');
      setMessages(newMessages);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateImage = async (promptToUse?: string) => {
    const prompt = promptToUse || (mode === 'chat' ? extractedPrompt : directPrompt);
    if (!prompt || imageLoading) return;

    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key');
      return;
    }

    setImageLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          apiKey,
          includeContext: mode === 'direct' ? includeContext : false,
          customContext: facilitySpecs,
          aspectRatio,
          imageSize: resolution,
          referenceImage,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Image generation failed');

      setGeneratedImage(data.image);
      setHistory((prev) => [data.image, ...prev.slice(0, 9)]);
      if (mode === 'chat') setExtractedPrompt(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Image generation error');
    } finally {
      setImageLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!editPrompt.trim() || !generatedImage || imageLoading) return;

    setImageLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: editPrompt,
          apiKey,
          includeContext: false,
          aspectRatio,
          imageSize: resolution,
          editImage: generatedImage,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Refinement failed');

      setGeneratedImage(data.image);
      setHistory((prev) => [data.image, ...prev.slice(0, 9)]);
      setEditPrompt('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Refinement error');
    } finally {
      setImageLoading(false);
    }
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setReferenceImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearReference = () => {
    setReferenceImage(null);
    setBlueprintName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearChat = () => {
    setMessages([{ role: 'assistant', content: INITIAL_ASSISTANT_MESSAGE }]);
    setExtractedPrompt(null);
  };

  const handleClearAll = () => {
    if (!window.confirm('Clear all data including history?')) return;
    setMessages([{ role: 'assistant', content: INITIAL_ASSISTANT_MESSAGE }]);
    setHistory([]);
    setGeneratedImage(null);
    setExtractedPrompt(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (content: string, isAssistant: boolean) => {
    if (!isAssistant) return <p className="whitespace-pre-wrap">{content}</p>;

    const promptMatch = content.match(/([\s\S]*?)---PROMPT---\s*([\s\S]*?)\s*---END---([\s\S]*)/);
    if (promptMatch) {
      const [, before, prompt, after] = promptMatch;
      return (
        <>
          {before && <p className="whitespace-pre-wrap mb-3">{before.trim()}</p>}
          <div className="bg-[var(--pbf-aqua-light)] border border-[var(--pbf-turquoise)]/30 rounded-xl p-4 my-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--pbf-turquoise)] mb-2">
              Generated Prompt
            </div>
            <p className="text-sm text-[var(--pbf-navy)] font-mono whitespace-pre-wrap">{prompt}</p>
          </div>
          {after && <p className="whitespace-pre-wrap mt-3">{after.trim()}</p>}
        </>
      );
    }
    return <p className="whitespace-pre-wrap">{content}</p>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[var(--pbf-aqua-pale)] to-white">
      {/* Header */}
      <header className="border-b border-[var(--pbf-ocean)]/10 bg-white/70 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Pure Blue Fish" width={180} height={88} className="h-12 w-auto" />
            <div className="h-8 w-px bg-[var(--pbf-ocean)]/20" />
            <span className="text-lg font-medium text-[var(--pbf-navy)]">Visualization Studio</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-4">
              <span className="text-sm text-[var(--pbf-ocean)] font-medium">Studio</span>
              <a
                href="/blueprints"
                className="text-sm text-[var(--pbf-navy)]/70 hover:text-[var(--pbf-ocean)] transition"
              >
                Blueprints
              </a>
              <a
                href="/specs"
                className="text-sm text-[var(--pbf-navy)]/70 hover:text-[var(--pbf-ocean)] transition"
              >
                Context
              </a>
            </nav>
            <div className="h-6 w-px bg-[var(--pbf-ocean)]/20" />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Gemini API Key"
              className="input-premium px-4 py-2 rounded-lg text-sm w-48"
            />
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--pbf-turquoise)] hover:text-[var(--pbf-ocean)] transition"
            >
              Get Key
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          {/* Left Panel */}
          <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="glass-panel rounded-2xl p-4 animate-fade-in-up">
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('chat')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition ${
                    mode === 'chat'
                      ? 'bg-gradient-to-r from-[var(--pbf-ocean)] to-[var(--pbf-turquoise)] text-white'
                      : 'bg-white border border-[var(--pbf-ocean)]/20 text-[var(--pbf-navy)] hover:bg-[var(--pbf-aqua-light)]'
                  }`}
                >
                  Chat with AI
                </button>
                <button
                  onClick={() => setMode('direct')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition ${
                    mode === 'direct'
                      ? 'bg-gradient-to-r from-[var(--pbf-ocean)] to-[var(--pbf-turquoise)] text-white'
                      : 'bg-white border border-[var(--pbf-ocean)]/20 text-[var(--pbf-navy)] hover:bg-[var(--pbf-aqua-light)]'
                  }`}
                >
                  Direct Prompt
                </button>
              </div>
            </div>

            {mode === 'chat' ? (
              /* Chat Mode */
              <div className="glass-panel rounded-2xl p-5 flex flex-col h-[calc(100vh-280px)] animate-fade-in-up">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--pbf-ocean)]">
                    Chat with AI Assistant
                  </h2>
                  <button
                    onClick={handleClearChat}
                    className="text-xs text-[var(--pbf-navy)]/50 hover:text-[var(--pbf-ocean)] transition"
                    title="Clear chat"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-[var(--pbf-ocean)] to-[var(--pbf-turquoise)] text-white'
                            : 'bg-white border border-[var(--pbf-ocean)]/10 text-[var(--pbf-navy)]'
                        }`}
                      >
                        {renderMessage(msg.content, msg.role === 'assistant')}
                      </div>
                    </div>
                  ))}
                  {chatLoading && messages[messages.length - 1]?.content === '' && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-[var(--pbf-ocean)]/10 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-[var(--pbf-turquoise)] rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-[var(--pbf-turquoise)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-[var(--pbf-turquoise)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {extractedPrompt && !imageLoading && (
                  <button onClick={() => handleGenerateImage()} className="btn-primary w-full py-3 rounded-xl font-semibold mb-3">
                    Generate Image
                  </button>
                )}

                <div className="flex gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe what you want..."
                    rows={2}
                    className="input-premium flex-1 px-4 py-3 rounded-xl text-sm resize-none"
                    disabled={chatLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={chatLoading || !input.trim()}
                    className="btn-primary px-5 rounded-xl font-medium disabled:opacity-50"
                  >
                    {chatLoading ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            ) : (
              /* Direct Mode */
              <div className="space-y-4 animate-fade-in-up">
                <div className="glass-panel rounded-2xl p-5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--pbf-ocean)] mb-3">
                    Your Prompt
                  </label>
                  <textarea
                    value={directPrompt}
                    onChange={(e) => setDirectPrompt(e.target.value)}
                    placeholder="e.g., Aerial view of the facility at sunset..."
                    rows={5}
                    className="input-premium w-full px-4 py-3 rounded-xl text-sm resize-none"
                  />

                  <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-[var(--pbf-aqua-light)]/50">
                    <div>
                      <span className="text-sm font-medium text-[var(--pbf-navy)]">Include facility specs</span>
                      <p className="text-xs text-[var(--pbf-navy)]/60">Adds PBF dimensions & style</p>
                    </div>
                    <button
                      onClick={() => setIncludeContext(!includeContext)}
                      className={`relative w-12 h-6 rounded-full transition-all ${
                        includeContext ? 'bg-gradient-to-r from-[var(--pbf-ocean)] to-[var(--pbf-turquoise)]' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        includeContext ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="glass-panel rounded-2xl p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--pbf-ocean)] mb-2">
                        Aspect Ratio
                      </label>
                      <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="input-premium w-full px-3 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
                      >
                        <option value="16:9">16:9 Wide</option>
                        <option value="4:3">4:3 Standard</option>
                        <option value="1:1">1:1 Square</option>
                        <option value="3:2">3:2 Photo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--pbf-ocean)] mb-2">
                        Resolution
                      </label>
                      <select
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        className="input-premium w-full px-3 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
                      >
                        <option value="1K">1K Fast</option>
                        <option value="2K">2K Balanced</option>
                        <option value="4K">4K Quality</option>
                      </select>
                    </div>
                  </div>

                  {/* Reference Image */}
                  <div className="mt-4">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--pbf-ocean)] mb-2">
                      Reference Image
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleReferenceUpload}
                      className="hidden"
                    />
                    {referenceImage ? (
                      <div className="space-y-2">
                        <div className="relative rounded-xl overflow-hidden border border-[var(--pbf-turquoise)]/30">
                          <Image src={referenceImage} alt="Reference" width={200} height={150} className="w-full h-24 object-cover" unoptimized />
                          <button
                            onClick={clearReference}
                            className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-[var(--pbf-navy)] hover:bg-white"
                          >
                            x
                          </button>
                        </div>
                        {blueprintName && <p className="text-xs text-[var(--pbf-turquoise)] font-medium">{blueprintName}</p>}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 py-3 rounded-xl border-2 border-dashed border-[var(--pbf-ocean)]/20 text-sm text-[var(--pbf-navy)]/60 hover:border-[var(--pbf-turquoise)] hover:bg-[var(--pbf-aqua-light)]/30 transition"
                        >
                          Upload
                        </button>
                        <a
                          href="/blueprints"
                          className="flex-1 py-3 rounded-xl border-2 border-[var(--pbf-ocean)]/20 text-sm text-[var(--pbf-navy)]/60 hover:border-[var(--pbf-turquoise)] hover:bg-[var(--pbf-aqua-light)]/30 transition text-center"
                        >
                          Choose Blueprint
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleGenerateImage()}
                  disabled={imageLoading || !directPrompt.trim()}
                  className="btn-primary w-full py-4 rounded-xl font-semibold text-lg disabled:opacity-50"
                >
                  {imageLoading ? 'Generating...' : 'Generate Visualization'}
                </button>
              </div>
            )}

            {/* Reference Image (for Chat mode) */}
            {mode === 'chat' && (
              <div className="glass-panel rounded-2xl p-5 animate-fade-in-up">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--pbf-ocean)] mb-2">
                  Reference Image (optional)
                </label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleReferenceUpload} className="hidden" />
                {referenceImage ? (
                  <div className="space-y-2">
                    <div className="relative rounded-xl overflow-hidden border border-[var(--pbf-turquoise)]/30">
                      <Image src={referenceImage} alt="Reference" width={200} height={150} className="w-full h-24 object-cover" unoptimized />
                      <button
                        onClick={clearReference}
                        className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-[var(--pbf-navy)] hover:bg-white"
                      >
                        x
                      </button>
                    </div>
                    {blueprintName && <p className="text-xs text-[var(--pbf-turquoise)] font-medium">{blueprintName}</p>}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-3 rounded-xl border-2 border-dashed border-[var(--pbf-ocean)]/20 text-sm text-[var(--pbf-navy)]/60 hover:border-[var(--pbf-turquoise)] hover:bg-[var(--pbf-aqua-light)]/30 transition"
                    >
                      Upload
                    </button>
                    <a
                      href="/blueprints"
                      className="flex-1 py-3 rounded-xl border-2 border-[var(--pbf-ocean)]/20 text-sm text-[var(--pbf-navy)]/60 hover:border-[var(--pbf-turquoise)] hover:bg-[var(--pbf-aqua-light)]/30 transition text-center"
                    >
                      Choose Blueprint
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Image */}
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--pbf-ocean)]">
                  Generated Image
                </h2>
                {generatedImage && (
                  <div className="flex gap-2">
                    <a href={generatedImage} download="pbf-visualization.png" className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium">
                      Download
                    </a>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        editMode ? 'bg-[var(--pbf-turquoise)] text-white' : 'btn-secondary'
                      }`}
                    >
                      Refine
                    </button>
                  </div>
                )}
              </div>

              {imageLoading ? (
                <div className="aspect-video rounded-xl bg-[var(--pbf-aqua-pale)]/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 border-4 border-[var(--pbf-turquoise)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[var(--pbf-navy)]/60">Generating visualization...</p>
                  </div>
                </div>
              ) : generatedImage ? (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-[var(--pbf-ocean)]/10 hover-lift">
                    <Image src={generatedImage} alt="Generated visualization" width={800} height={450} className="w-full h-auto" />
                  </div>

                  {editMode && (
                    <div className="p-4 rounded-xl bg-[var(--pbf-aqua-light)]/50 border border-[var(--pbf-turquoise)]/20 animate-fade-in-up">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--pbf-turquoise)] mb-2">
                        Refinement Instructions
                      </label>
                      <textarea
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="e.g., Make the lighting warmer, add more plants..."
                        rows={2}
                        className="input-premium w-full px-4 py-3 rounded-xl text-sm resize-none mb-3"
                      />
                      <button
                        onClick={handleRefine}
                        disabled={imageLoading || !editPrompt.trim()}
                        className="btn-primary w-full py-3 rounded-xl font-medium"
                      >
                        Apply Refinement
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video rounded-xl border-2 border-dashed border-[var(--pbf-ocean)]/15 bg-[var(--pbf-aqua-pale)]/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--pbf-ocean)]/10 to-[var(--pbf-turquoise)]/10 flex items-center justify-center">
                      <svg className="w-8 h-8 text-[var(--pbf-ocean)]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-[var(--pbf-navy)]/50 text-sm">
                      {mode === 'chat' ? 'Chat with the assistant to generate' : 'Enter a prompt to generate'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="glass-panel rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--pbf-ocean)]">
                    Recent Generations
                  </h3>
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-[var(--pbf-navy)]/50 hover:text-red-500 transition"
                    title="Clear all data"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {history.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setGeneratedImage(img)}
                      className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition hover-lift ${
                        generatedImage === img ? 'border-[var(--pbf-turquoise)]' : 'border-transparent hover:border-[var(--pbf-ocean)]/30'
                      }`}
                    >
                      <Image src={img} alt={`History ${idx + 1}`} width={120} height={68} className="w-24 h-auto" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in-up">
                {error}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
