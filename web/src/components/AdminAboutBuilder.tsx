import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  Film,
  GripVertical,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Type,
  Video as VideoIcon,
} from 'lucide-react';
import {
  AboutCardLayout,
  AboutCardMediaType,
  AboutCardTheme,
  AboutConfig,
  AboutCustomCard,
} from '../types';
import { SmartImage } from './SmartImage';
import { SmartVideo } from './SmartVideo';

interface AdminAboutBuilderProps {
  aboutConfig?: AboutConfig;
  onSave: (nextConfig: AboutConfig) => Promise<boolean>;
  showToast: (msg: string) => void;
}

interface PresetTemplate {
  key: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  createCard: (order: number) => AboutCustomCard;
}

const CARD_PRESETS: PresetTemplate[] = [
  {
    key: 'split-image',
    label: 'Photo & Story Card',
    desc: 'Side-by-side layout with Google Drive photo & details',
    icon: ImageIcon,
    createCard: (order) => ({
      id: `about-card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      order,
      layout: 'split',
      theme: 'light',
      badge: 'Agency Highlight',
      title: 'Dedicated Visa & Admissions Support',
      subtitle: 'Certified Gujranwala & Australia Team',
      description:
        'Describe your counseling process, office facilities, or leadership team background here.',
      highlights: ['Official institutional tie-ups', 'Genuine Student (GS) interview coaching'],
      mediaType: 'image',
      mediaUrl: '/slide-australia.jpg',
      ctaLabel: 'Book Consultation',
      ctaLink: '/book-appointment',
      showBadge: true,
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      showMedia: true,
      showHighlights: true,
      showCta: true,
    }),
  },
  {
    key: 'video-showcase',
    label: 'Google Drive Video Card',
    desc: 'Interactive video card with Play / Pause controls',
    icon: VideoIcon,
    createCard: (order) => ({
      id: `about-card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      order,
      layout: 'split',
      theme: 'navy',
      badge: 'Video Introduction',
      title: 'Watch Our Counselors & Office Walkthrough',
      subtitle: 'Direct guidance from SR Global Consultants',
      description:
        'Paste a Google Drive video share link or direct MP4 URL below so students can play and pause directly on the About Us page.',
      highlights: ['Gujranwala Civic Center office tour', 'Step-by-step admission overview'],
      mediaType: 'video',
      mediaUrl: '',
      ctaLabel: 'Explore Destinations',
      ctaLink: '/destinations',
      showBadge: true,
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      showMedia: true,
      showHighlights: true,
      showCta: true,
    }),
  },
  {
    key: 'featured-banner',
    label: 'Full-Width Feature Card',
    desc: 'Bold cyan or navy showcase banner with highlights',
    icon: Sparkles,
    createCard: (order) => ({
      id: `about-card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      order,
      layout: 'featured',
      theme: 'brand',
      badge: 'Why Students Trust Us',
      title: 'Authorized International Education Representation',
      subtitle: 'Verified documentation & ethical fee practices',
      description:
        'Highlight accreditations, awards, or key milestones with a bold full-width section.',
      highlights: ['Transparent fee process', 'End-to-end pre-departure briefing'],
      mediaType: 'none',
      mediaUrl: '',
      ctaLabel: 'Success Stories',
      ctaLink: '/success-stories',
      showBadge: true,
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      showMedia: false,
      showHighlights: true,
      showCta: true,
    }),
  },
  {
    key: 'compact-card',
    label: 'Compact Info Card',
    desc: 'Half-width grid card for branch info or team member',
    icon: LayoutGrid,
    createCard: (order) => ({
      id: `about-card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      order,
      layout: 'compact',
      theme: 'light',
      badge: 'Branch Desk',
      title: 'IELTS & PTE Training Lab',
      subtitle: 'Small batch coaching in Gujranwala',
      description:
        'Daily speaking, writing, and computer-delivered PTE practice tests.',
      highlights: ['Structured mock exams', 'Individual score feedback'],
      mediaType: 'image',
      mediaUrl: '/slide-academy.jpg',
      ctaLabel: 'View Courses',
      ctaLink: '/courses',
      showBadge: true,
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      showMedia: true,
      showHighlights: false,
      showCta: true,
    }),
  },
];

export const AdminAboutBuilder: React.FC<AdminAboutBuilderProps> = ({
  aboutConfig,
  onSave,
  showToast,
}) => {
  const [form, setForm] = useState<AboutConfig>(() => ({
    heroEyebrow: aboutConfig?.heroEyebrow || 'About SR Global',
    heroTitle: aboutConfig?.heroTitle || 'Empowering Pakistani Students to Excel Worldwide',
    heroDescription:
      aboutConfig?.heroDescription ||
      'Founded with a vision of transparent, ethical, and high-standard foreign education counseling, SR Global Consultants has guided over 5,200 ambitious candidates to Australia, the UK, the USA, Canada, and Europe.',
    customCards: aboutConfig?.customCards ? [...aboutConfig.customCards] : [],
  }));

  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    aboutConfig?.customCards?.[0]?.id || null
  );
  const [draggingPresetKey, setDraggingPresetKey] = useState<string | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [newHighlightText, setNewHighlightText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!aboutConfig) return;
    setForm({
      heroEyebrow: aboutConfig.heroEyebrow || 'About SR Global',
      heroTitle: aboutConfig.heroTitle || 'Empowering Pakistani Students to Excel Worldwide',
      heroDescription: aboutConfig.heroDescription || '',
      customCards: [...(aboutConfig.customCards || [])],
    });
  }, [aboutConfig]);

  const selectedCard = form.customCards.find((c) => c.id === selectedCardId) || null;

  const insertPresetCard = (presetKey: string, insertAtIndex?: number) => {
    const preset = CARD_PRESETS.find((p) => p.key === presetKey);
    if (!preset) return;
    const newCard = preset.createCard(form.customCards.length);
    setForm((prev) => {
      const nextCards = [...prev.customCards];
      if (typeof insertAtIndex === 'number' && insertAtIndex >= 0 && insertAtIndex <= nextCards.length) {
        nextCards.splice(insertAtIndex, 0, newCard);
      } else {
        nextCards.push(newCard);
      }
      return {
        ...prev,
        customCards: nextCards.map((c, idx) => ({ ...c, order: idx })),
      };
    });
    setSelectedCardId(newCard.id);
    showToast(`Added "${preset.label}" card — customize fields below & click Save.`);
  };

  const reorderCard = (fromId: string, toIndex: number) => {
    setForm((prev) => {
      const list = [...prev.customCards];
      const fromIndex = list.findIndex((c) => c.id === fromId);
      if (fromIndex < 0 || toIndex < 0 || toIndex >= list.length || fromIndex === toIndex) return prev;
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      return {
        ...prev,
        customCards: list.map((c, idx) => ({ ...c, order: idx })),
      };
    });
  };

  const moveCardByStep = (index: number, delta: -1 | 1) => {
    const nextIndex = index + delta;
    const card = form.customCards[index];
    if (!card || nextIndex < 0 || nextIndex >= form.customCards.length) return;
    reorderCard(card.id, nextIndex);
  };

  const updateSelectedCard = (patch: Partial<AboutCustomCard>) => {
    if (!selectedCardId) return;
    setForm((prev) => ({
      ...prev,
      customCards: prev.customCards.map((c) => (c.id === selectedCardId ? { ...c, ...patch } : c)),
    }));
  };

  const deleteCard = (id: string) => {
    setForm((prev) => {
      const remaining = prev.customCards.filter((c) => c.id !== id).map((c, idx) => ({ ...c, order: idx }));
      if (selectedCardId === id) {
        setSelectedCardId(remaining[0]?.id || null);
      }
      return { ...prev, customCards: remaining };
    });
    showToast('Card removed from draft — click Publish About Page to save.');
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await onSave(form);
      showToast('About Us cards, videos & layout published live!');
    } finally {
      setSaving(false);
    }
  };

  const visibilityToggles: Array<{ key: keyof Pick<AboutCustomCard, 'showBadge' | 'showTitle' | 'showSubtitle' | 'showDescription' | 'showMedia' | 'showHighlights' | 'showCta'>; label: string }> = [
    { key: 'showBadge', label: 'Badge Pill' },
    { key: 'showTitle', label: 'Card Title' },
    { key: 'showSubtitle', label: 'Subtitle' },
    { key: 'showDescription', label: 'Description' },
    { key: 'showMedia', label: 'Image / Video' },
    { key: 'showHighlights', label: 'Highlights List' },
    { key: 'showCta', label: 'Action Button' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Action Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-navy-950">About Us Drag & Drop Page Builder</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Drag preset cards onto the canvas or reorder existing cards, toggle which elements show per card, and embed Google Drive images or videos.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePublish}
          disabled={saving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-xl text-xs shadow-md transition-all shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Publishing...' : 'Publish About Page Live'}</span>
        </button>
      </div>

      {/* Main Intro Text Editor */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Type className="w-4 h-4 text-brand-500" />
          <span>About Us Hero Header Copy</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Eyebrow Badge</label>
            <input
              type="text"
              value={form.heroEyebrow || ''}
              onChange={(e) => setForm({ ...form, heroEyebrow: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Main Page Headline</label>
            <input
              type="text"
              value={form.heroTitle || ''}
              onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Intro Description</label>
          <textarea
            rows={2}
            value={form.heroDescription || ''}
            onChange={(e) => setForm({ ...form, heroDescription: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
          />
        </div>
      </div>

      {/* Drag-and-Drop Builder Split Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Draggable Template Palette & Ordered Card Dropzone */}
        <div className="xl:col-span-5 space-y-5">
          {/* Draggable Presets */}
          <div className="bg-navy-950 text-white p-5 rounded-3xl border border-navy-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
                1. Drag Card Template onto Canvas
              </span>
              <span className="text-[10px] text-slate-400">or Tap + Add</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CARD_PRESETS.map((preset) => {
                const Icon = preset.icon;
                return (
                  <div
                    key={preset.key}
                    draggable
                    onDragStart={(e) => {
                      setDraggingPresetKey(preset.key);
                      setDraggingCardId(null);
                      e.dataTransfer.effectAllowed = 'copy';
                      e.dataTransfer.setData('text/plain', `preset:${preset.key}`);
                    }}
                    onDragEnd={() => {
                      setDraggingPresetKey(null);
                      setDragOverTarget(null);
                    }}
                    className="group p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-brand-400/60 cursor-grab active:cursor-grabbing transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="p-1.5 rounded-lg bg-brand-500/25 text-brand-300">
                        <Icon className="w-4 h-4" />
                      </span>
                      <button
                        type="button"
                        onClick={() => insertPresetCard(preset.key)}
                        className="text-[10px] font-bold bg-brand-500 hover:bg-brand-400 text-white px-2 py-1 rounded-lg inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{preset.label}</div>
                      <div className="text-[10px] text-slate-300 leading-snug mt-0.5">{preset.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dropzone & Reorderable Canvas Cards */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverTarget('canvas-end');
            }}
            onDragLeave={() => setDragOverTarget(null)}
            onDrop={(e) => {
              e.preventDefault();
              const payload = e.dataTransfer.getData('text/plain');
              if (payload.startsWith('preset:') || draggingPresetKey) {
                const key = payload.startsWith('preset:') ? payload.replace('preset:', '') : draggingPresetKey!;
                insertPresetCard(key);
              } else if (draggingCardId) {
                reorderCard(draggingCardId, form.customCards.length - 1);
              }
              setDraggingPresetKey(null);
              setDraggingCardId(null);
              setDragOverTarget(null);
            }}
            className={`bg-white p-5 rounded-3xl border-2 transition-all space-y-3 ${
              dragOverTarget === 'canvas-end'
                ? 'border-dashed border-brand-500 bg-brand-50/40'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-950">
                2. About Page Cards ({form.customCards.length})
              </span>
              <span className="text-[11px] text-slate-400">Drag rows to reorder</span>
            </div>

            {form.customCards.length === 0 ? (
              <div className="py-10 px-4 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-2 bg-slate-50">
                <Layers className="w-8 h-8 text-brand-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Drop a card template here to add it</p>
                <p className="text-[11px] text-slate-400">Or click "+ Add" on any template above</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {form.customCards.map((card, idx) => {
                  const isSelected = selectedCardId === card.id;
                  const isOver = dragOverTarget === card.id;
                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggingCardId(card.id);
                        setDraggingPresetKey(null);
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', `card:${card.id}`);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverTarget(card.id);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const payload = e.dataTransfer.getData('text/plain');
                        if (payload.startsWith('preset:') || draggingPresetKey) {
                          const key = payload.startsWith('preset:') ? payload.replace('preset:', '') : draggingPresetKey!;
                          insertPresetCard(key, idx);
                        } else if (draggingCardId && draggingCardId !== card.id) {
                          reorderCard(draggingCardId, idx);
                        }
                        setDraggingPresetKey(null);
                        setDraggingCardId(null);
                        setDragOverTarget(null);
                      }}
                      onDragEnd={() => {
                        setDraggingCardId(null);
                        setDragOverTarget(null);
                      }}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                        isOver
                          ? 'border-brand-500 ring-2 ring-brand-400 bg-brand-50'
                          : isSelected
                          ? 'border-brand-500 bg-brand-50/70 shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      <span
                        className="p-1 text-slate-400 hover:text-navy-950 cursor-grab shrink-0"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-navy-950 text-white">
                            #{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-brand-100 text-brand-700">
                            {card.layout}
                          </span>
                          {card.mediaType !== 'none' && (
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 inline-flex items-center gap-0.5">
                              {card.mediaType === 'video' ? <Film className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
                              {card.mediaType}
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-xs text-navy-950 truncate mt-1">
                          {card.title || card.badge || 'Untitled Card'}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => moveCardByStep(idx, -1)}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveCardByStep(idx, 1)}
                          disabled={idx === form.customCards.length - 1}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCard(card.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete Card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected Card Customization & Field Visibility Studio */}
        <div className="xl:col-span-7">
          {selectedCard ? (
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600">
                    3. Customize Selected Card
                  </span>
                  <h3 className="text-lg font-bold text-navy-950 truncate">
                    {selectedCard.title || 'Card Configuration'}
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  Changes apply instantly after clicking Publish
                </span>
              </div>

              {/* Visibility Toggles: Setup what shows on this card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-navy-950 uppercase tracking-wider">
                  <Eye className="w-4 h-4 text-brand-500" />
                  <span>Choose What to Show on This Card</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {visibilityToggles.map((toggle) => {
                    const enabled = Boolean(selectedCard[toggle.key]);
                    return (
                      <button
                        key={toggle.key}
                        type="button"
                        onClick={() => updateSelectedCard({ [toggle.key]: !enabled })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          enabled
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-white text-slate-400 border-slate-200 line-through'
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 ${enabled ? 'text-emerald-600' : 'opacity-30'}`} />
                        <span>{toggle.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Layout & Color Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Card Layout</label>
                  <select
                    value={selectedCard.layout}
                    onChange={(e) => updateSelectedCard({ layout: e.target.value as AboutCardLayout })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="split">Split (Side-by-Side Media & Details)</option>
                    <option value="featured">Featured (Full-Row Showcase)</option>
                    <option value="compact">Compact (2-Column Grid Card)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Color Theme</label>
                  <select
                    value={selectedCard.theme}
                    onChange={(e) => updateSelectedCard({ theme: e.target.value as AboutCardTheme })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="light">Clean White Card</option>
                    <option value="navy">Midnight Navy Theme</option>
                    <option value="brand">Aegean Cyan Brand Theme</option>
                  </select>
                </div>
              </div>

              {/* Content Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={selectedCard.badge || ''}
                    onChange={(e) => updateSelectedCard({ badge: e.target.value })}
                    placeholder="e.g. Gujranwala Desk"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={selectedCard.subtitle || ''}
                    onChange={(e) => updateSelectedCard({ subtitle: e.target.value })}
                    placeholder="e.g. Certified counseling team"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Card Title</label>
                <input
                  type="text"
                  value={selectedCard.title}
                  onChange={(e) => updateSelectedCard({ title: e.target.value })}
                  placeholder="Card headline..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={selectedCard.description}
                  onChange={(e) => updateSelectedCard({ description: e.target.value })}
                  placeholder="Write card details here..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              {/* Media Configuration: Google Drive Image or Video */}
              <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-navy-950 uppercase mb-1">Media Type</label>
                    <select
                      value={selectedCard.mediaType}
                      onChange={(e) =>
                        updateSelectedCard({
                          mediaType: e.target.value as AboutCardMediaType,
                          showMedia: e.target.value !== 'none',
                        })
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-semibold"
                    >
                      <option value="none">No Media</option>
                      <option value="image">Image (Google Drive / URL)</option>
                      <option value="video">Video (Google Drive / MP4)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-navy-950 uppercase mb-1">
                      Google Drive or Direct {selectedCard.mediaType === 'video' ? 'Video' : 'Image'} Link
                    </label>
                    <input
                      type="text"
                      disabled={selectedCard.mediaType === 'none'}
                      value={selectedCard.mediaUrl || ''}
                      onChange={(e) => updateSelectedCard({ mediaUrl: e.target.value })}
                      placeholder={
                        selectedCard.mediaType === 'video'
                          ? 'https://drive.google.com/file/d/.../view or .mp4 URL'
                          : 'https://drive.google.com/file/d/.../view or /slide-academy.jpg'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white disabled:opacity-50 font-mono"
                    />
                  </div>
                </div>

                {selectedCard.mediaType !== 'none' && selectedCard.mediaUrl?.trim() && (
                  <div className="max-w-md">
                    <div className="text-[10px] font-bold uppercase text-slate-500 mb-1.5">Live Media Preview</div>
                    {selectedCard.mediaType === 'video' ? (
                      <SmartVideo src={selectedCard.mediaUrl} title={selectedCard.title} />
                    ) : (
                      <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                        <SmartImage
                          src={selectedCard.mediaUrl}
                          alt="Media Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bullet Highlights Editor */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-700 uppercase">Bullet Highlights</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newHighlightText}
                    onChange={(e) => setNewHighlightText(e.target.value)}
                    placeholder="Add a highlight point..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = newHighlightText.trim();
                      if (!trimmed) return;
                      updateSelectedCard({
                        highlights: [...(selectedCard.highlights || []), trimmed],
                        showHighlights: true,
                      });
                      setNewHighlightText('');
                    }}
                    className="bg-navy-950 hover:bg-navy-900 text-white font-bold px-4 py-2 rounded-xl text-xs shrink-0"
                  >
                    + Add Point
                  </button>
                </div>

                {(selectedCard.highlights || []).length > 0 && (
                  <div className="space-y-1.5">
                    {(selectedCard.highlights || []).map((hl, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
                        <span className="text-slate-700">{hl}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedCard({
                              highlights: (selectedCard.highlights || []).filter((_, idx) => idx !== i),
                            })
                          }
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA Button Config */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Action Button Label</label>
                  <input
                    type="text"
                    value={selectedCard.ctaLabel || ''}
                    onChange={(e) => updateSelectedCard({ ctaLabel: e.target.value })}
                    placeholder="e.g. Book Consultation"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Action Button Route / URL</label>
                  <input
                    type="text"
                    value={selectedCard.ctaLink || ''}
                    onChange={(e) => updateSelectedCard({ ctaLink: e.target.value })}
                    placeholder="/book-appointment or https://..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-2 text-slate-500 text-sm">
              Select a card on the left or drag a new template onto the canvas to customize it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
