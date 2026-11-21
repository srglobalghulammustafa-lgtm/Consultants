import React, { useState, useEffect, useRef } from 'react';
import {
  StickyNote,
  Plus,
  Trash2,
  Pin,
  Minimize2,
  Maximize2,
  X,
  GripHorizontal,
  Search,
  CheckCircle2,
  Cloud,
  MoveDiagonal2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminNote } from '../types';

const NOTES_STORAGE_KEY = 'sr_admin_persistent_notepad_v1';
const WINDOW_PREFS_KEY = 'sr_admin_notepad_window_v1';

interface WindowPrefs {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
}

const DEFAULT_PREFS: WindowPrefs = {
  x: typeof window !== 'undefined' ? Math.max(16, window.innerWidth - 430) : 600,
  y: typeof window !== 'undefined' ? Math.max(80, window.innerHeight - 520) : 140,
  width: 390,
  height: 440,
  isMinimized: false,
};

const COLOR_STYLES: Record<
  AdminNote['color'],
  { bg: string; border: string; dot: string; activeRing: string }
> = {
  amber: {
    bg: 'bg-amber-50/90',
    border: 'border-amber-200',
    dot: 'bg-amber-400',
    activeRing: 'ring-amber-400',
  },
  sky: {
    bg: 'bg-sky-50/90',
    border: 'border-sky-200',
    dot: 'bg-sky-400',
    activeRing: 'ring-sky-400',
  },
  emerald: {
    bg: 'bg-emerald-50/90',
    border: 'border-emerald-200',
    dot: 'bg-emerald-400',
    activeRing: 'ring-emerald-400',
  },
  rose: {
    bg: 'bg-rose-50/90',
    border: 'border-rose-200',
    dot: 'bg-rose-400',
    activeRing: 'ring-rose-400',
  },
};

interface AdminFloatingNotepadProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const AdminFloatingNotepad: React.FC<AdminFloatingNotepadProps> = ({
  isOpen,
  onClose,
  onOpen,
}) => {
  const [notes, setNotes] = useState<AdminNote[]>(() => {
    try {
      const saved = localStorage.getItem(NOTES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore parse errors
    }
    const now = new Date().toISOString();
    return [
      {
        id: `note-${Date.now()}`,
        title: 'Counselor Daily Scratchpad',
        content: '',
        color: 'amber',
        is_pinned: true,
        created_at: now,
        updated_at: now,
      },
    ];
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(() => notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState<'saved' | 'syncing' | 'local'>('saved');
  const [isMobileView, setIsMobileView] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
  const [isMobileExpanded, setIsMobileExpanded] = useState<boolean>(false);

  const [prefs, setPrefs] = useState<WindowPrefs>(() => {
    try {
      const saved = localStorage.getItem(WINDOW_PREFS_KEY);
      if (saved) {
        return { ...DEFAULT_PREFS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_PREFS;
  });

  const syncTimeoutRef = useRef<number | null>(null);
  const dragStateRef = useRef<{
    type: 'drag' | 'resize' | null;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  }>({
    type: null,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    origW: 390,
    origH: 440,
  });

  // Load persisted notes from Supabase on mount
  useEffect(() => {
    let mounted = true;
    const loadRemoteNotes = async () => {
      try {
        const { data: tableNotes, error: tableErr } = await supabase
          .from('admin_notes')
          .select('*')
          .order('is_pinned', { ascending: false })
          .order('updated_at', { ascending: false });

        if (!mounted) return;
        if (!tableErr && tableNotes && tableNotes.length > 0) {
          setNotes(tableNotes);
          localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(tableNotes));
          setActiveNoteId((prev) =>
            tableNotes.some((n) => n.id === prev) ? prev : tableNotes[0].id
          );
          setSyncStatus('saved');
          return;
        }

        const { data: settingRow } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'admin_notepad')
          .maybeSingle();

        if (!mounted) return;
        const remoteList = settingRow?.setting_value?.notes;
        if (Array.isArray(remoteList) && remoteList.length > 0) {
          setNotes(remoteList);
          localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(remoteList));
          setActiveNoteId((prev) =>
            remoteList.some((n: AdminNote) => n.id === prev) ? prev : remoteList[0].id
          );
          setSyncStatus('saved');
        }
      } catch {
        // local storage already hydrated
      }
    };

    loadRemoteNotes();
    return () => {
      mounted = false;
    };
  }, []);

  // Persist window preferences and track viewport width
  useEffect(() => {
    localStorage.setItem(WINDOW_PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    const handleViewportResize = () => {
      setIsMobileView(window.innerWidth < 640);
      setPrefs((prev) => ({
        ...prev,
        width: Math.min(prev.width, Math.max(280, window.innerWidth - 24)),
        height: Math.min(prev.height, Math.max(260, window.innerHeight - 40)),
        x: Math.max(8, Math.min(prev.x, window.innerWidth - Math.min(prev.width, window.innerWidth - 24) - 8)),
        y: Math.max(8, Math.min(prev.y, window.innerHeight - 60)),
      }));
    };
    window.addEventListener('resize', handleViewportResize);
    return () => window.removeEventListener('resize', handleViewportResize);
  }, []);

  // Desktop pointer drag & resize listeners
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (isMobileView) return;
      const state = dragStateRef.current;
      if (!state.type) return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;

      if (state.type === 'drag') {
        const nextX = Math.max(8, Math.min(window.innerWidth - prefs.width - 8, state.origX + dx));
        const nextY = Math.max(8, Math.min(window.innerHeight - 56, state.origY + dy));
        setPrefs((prev) => ({ ...prev, x: nextX, y: nextY }));
      } else if (state.type === 'resize') {
        const maxW = Math.max(320, window.innerWidth - state.origX - 12);
        const maxH = Math.max(280, window.innerHeight - state.origY - 12);
        const nextW = Math.max(300, Math.min(Math.min(760, maxW), state.origW + dx));
        const nextH = Math.max(260, Math.min(Math.min(760, maxH), state.origH + dy));
        setPrefs((prev) => ({ ...prev, width: nextW, height: nextH }));
      }
    };

    const onPointerUp = () => {
      dragStateRef.current.type = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [prefs.width, isMobileView]);

  const persistNotesToCloud = async (nextNotes: AdminNote[], deletedId?: string) => {
    setSyncStatus('syncing');
    try {
      if (deletedId) {
        await supabase.from('admin_notes').delete().eq('id', deletedId);
      }

      if (nextNotes.length > 0) {
        const { error: upsertErr } = await supabase
          .from('admin_notes')
          .upsert(nextNotes, { onConflict: 'id' });

        if (!upsertErr) {
          await supabase
            .from('site_settings')
            .upsert(
              {
                setting_key: 'admin_notepad',
                setting_value: { notes: nextNotes, updated_at: new Date().toISOString() },
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'setting_key' }
            );
          setSyncStatus('saved');
          return;
        }
      }

      const { error: settingsErr } = await supabase
        .from('site_settings')
        .upsert(
          {
            setting_key: 'admin_notepad',
            setting_value: { notes: nextNotes, updated_at: new Date().toISOString() },
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'setting_key' }
        );

      setSyncStatus(settingsErr ? 'local' : 'saved');
    } catch {
      setSyncStatus('local');
    }
  };

  const scheduleCloudSync = (nextNotes: AdminNote[], deletedId?: string) => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(nextNotes));
    setSyncStatus('syncing');
    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = window.setTimeout(() => {
      persistNotesToCloud(nextNotes, deletedId);
    }, 450);
  };

  const handleAddNote = () => {
    const now = new Date().toISOString();
    const fresh: AdminNote = {
      id: `note-${Date.now()}`,
      title: `Quick Note ${notes.length + 1}`,
      content: '',
      color: 'amber',
      is_pinned: false,
      created_at: now,
      updated_at: now,
    };
    const next = [fresh, ...notes];
    setNotes(next);
    setActiveNoteId(fresh.id);
    scheduleCloudSync(next);
  };

  const handleUpdateActiveNote = (patch: Partial<AdminNote>) => {
    if (!activeNote) return;
    const updatedAt = new Date().toISOString();
    const next = notes.map((n) =>
      n.id === activeNote.id ? { ...n, ...patch, updated_at: updatedAt } : n
    );
    setNotes(next);
    scheduleCloudSync(next);
  };

  const handleDeleteNote = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!window.confirm(`Permanently remove "${target?.title || 'this note'}"? Notes stay saved until you delete them.`)) {
      return;
    }
    const remaining = notes.filter((n) => n.id !== id);
    if (remaining.length === 0) {
      const now = new Date().toISOString();
      const blank: AdminNote = {
        id: `note-${Date.now()}`,
        title: 'Counselor Scratchpad',
        content: '',
        color: 'amber',
        is_pinned: true,
        created_at: now,
        updated_at: now,
      };
      setNotes([blank]);
      setActiveNoteId(blank.id);
      scheduleCloudSync([blank], id);
    } else {
      setNotes(remaining);
      if (activeNoteId === id) {
        setActiveNoteId(remaining[0].id);
      }
      scheduleCloudSync(remaining, id);
    }
  };

  const sortedNotes = [...notes]
    .filter((n) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const activeNote = notes.find((n) => n.id === activeNoteId) || sortedNotes[0] || notes[0];
  const activeStyle = activeNote ? COLOR_STYLES[activeNote.color || 'amber'] : COLOR_STYLES.amber;

  if (!isOpen) {
    return (
      <button
        onClick={onOpen}
        className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 inline-flex items-center gap-2 sm:gap-2.5 bg-navy-950 hover:bg-navy-900 text-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-2xl border border-amber-400/50 transition-all hover:scale-105"
        title="Open Floating Admin Notepad"
      >
        <span className="w-7 h-7 rounded-xl bg-amber-400 text-navy-950 flex items-center justify-center shrink-0">
          <StickyNote className="w-4 h-4" />
        </span>
        <div className="text-left">
          <div className="text-xs font-bold leading-none">Admin Notepad</div>
          <div className="text-[10px] text-amber-300 mt-0.5">{notes.length} persistent {notes.length === 1 ? 'note' : 'notes'}</div>
        </div>
      </button>
    );
  }

  if (prefs.isMinimized) {
    return (
      <div
        style={isMobileView ? undefined : { left: prefs.x, top: prefs.y }}
        className={
          isMobileView
            ? 'fixed bottom-3 inset-x-3 z-50 bg-navy-950 text-white rounded-2xl shadow-2xl border border-amber-400/60 px-4 py-3 flex items-center justify-between gap-3 select-none'
            : 'fixed z-50 bg-navy-950 text-white rounded-2xl shadow-2xl border border-amber-400/60 px-3.5 py-2.5 flex items-center gap-3 select-none'
        }
      >
        <div
          onPointerDown={(e) => {
            if (isMobileView) return;
            dragStateRef.current = {
              type: 'drag',
              startX: e.clientX,
              startY: e.clientY,
              origX: prefs.x,
              origY: prefs.y,
              origW: prefs.width,
              origH: prefs.height,
            };
          }}
          onClick={() => {
            if (isMobileView) setPrefs((p) => ({ ...p, isMinimized: false }));
          }}
          className={`flex items-center gap-2 ${isMobileView ? 'cursor-pointer flex-1' : 'cursor-move'}`}
          title={isMobileView ? 'Tap to expand notepad' : 'Drag floating notepad'}
        >
          {!isMobileView && <GripHorizontal className="w-4 h-4 text-amber-400" />}
          <StickyNote className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-bold">Notepad ({notes.length})</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPrefs((p) => ({ ...p, isMinimized: false }))}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-200"
            title="Expand Notepad"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300"
            title="Dock to corner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={
        isMobileView
          ? undefined
          : {
              left: prefs.x,
              top: prefs.y,
              width: prefs.width,
              height: prefs.height,
            }
      }
      className={
        isMobileView
          ? `fixed inset-x-2.5 bottom-2.5 z-50 ${
              isMobileExpanded ? 'h-[78vh]' : 'h-[54vh]'
            } max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden ring-1 ring-black/10 transition-[height] duration-200`
          : 'fixed z-50 bg-white rounded-3xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden ring-1 ring-black/5'
      }
    >
      {/* Header Bar (Draggable on desktop, Bottom Sheet Bar on mobile) */}
      <div
        onPointerDown={(e) => {
          if (isMobileView || (e.target as HTMLElement).closest('button')) return;
          dragStateRef.current = {
            type: 'drag',
            startX: e.clientX,
            startY: e.clientY,
            origX: prefs.x,
            origY: prefs.y,
            origW: prefs.width,
            origH: prefs.height,
          };
        }}
        onDoubleClick={() => {
          if (isMobileView) {
            setIsMobileExpanded((v) => !v);
            return;
          }
          setPrefs((p) => ({
            ...p,
            width: p.width > 480 ? 390 : 540,
            height: p.height > 520 ? 440 : 560,
          }));
        }}
        className={`bg-navy-950 text-white px-3.5 sm:px-4 py-3 flex items-center justify-between select-none shrink-0 ${
          isMobileView ? '' : 'cursor-move'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <GripHorizontal className="hidden sm:block w-4 h-4 text-amber-400 shrink-0" />
          <StickyNote className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="text-xs font-bold tracking-wide truncate">
            {isMobileView ? 'Admin Notepad' : 'Admin Persistent Notepad'}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-emerald-300 shrink-0">
            {syncStatus === 'syncing' ? (
              <span>Saving…</span>
            ) : syncStatus === 'saved' ? (
              <>
                <Cloud className="w-3 h-3" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Local</span>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleAddNote}
            className="p-2 sm:p-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold transition-colors"
            title="New Persistent Note"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {isMobileView && (
            <button
              type="button"
              onClick={() => setIsMobileExpanded((v) => !v)}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-200"
              title={isMobileExpanded ? 'Compact height' : 'Expand sheet height'}
            >
              {isMobileExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            type="button"
            onClick={() => setPrefs((p) => ({ ...p, isMinimized: true }))}
            className="p-2 sm:p-1.5 rounded-lg hover:bg-white/10 text-slate-300"
            title="Minimize Notepad"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:p-1.5 rounded-lg hover:bg-white/10 text-slate-300"
            title="Hide to Corner Button (Notes Stay Saved)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Note Tabs Strip + Search */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 space-y-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {sortedNotes.map((n) => {
            const st = COLOR_STYLES[n.color || 'amber'];
            const isSelected = activeNote?.id === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setActiveNoteId(n.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:py-1 rounded-lg text-[11px] font-bold border whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? `${st.bg} ${st.border} text-navy-950 shadow-sm`
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                {n.is_pinned && <Pin className="w-2.5 h-2.5 text-amber-600" />}
                <span className="max-w-[110px] truncate">{n.title || 'Untitled'}</span>
              </button>
            );
          })}
        </div>

        {notes.length > 2 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter saved notes..."
              className="w-full pl-8 pr-3 py-1.5 sm:py-1 rounded-lg border border-slate-200 bg-white text-xs sm:text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        )}
      </div>

      {/* Active Note Editor */}
      {activeNote && (
        <div className={`flex-1 flex flex-col p-3 sm:p-3.5 gap-2.5 overflow-hidden ${activeStyle.bg}`}>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={activeNote.title}
              onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
              placeholder="Note title..."
              className="flex-1 min-w-[140px] bg-white/85 px-3 py-1.5 rounded-xl border border-slate-200/80 text-xs font-bold text-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />

            {/* Color Picker Dots & Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-1.5 bg-white/85 px-2 py-1.5 rounded-xl border border-slate-200/80">
                {(Object.keys(COLOR_STYLES) as AdminNote['color'][]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleUpdateActiveNote({ color: c })}
                    className={`w-3.5 h-3.5 rounded-full ${COLOR_STYLES[c].dot} ${
                      activeNote.color === c ? `ring-2 ring-offset-1 ${COLOR_STYLES[c].activeRing}` : 'opacity-65 hover:opacity-100'
                    }`}
                    title={`Set ${c} theme`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleUpdateActiveNote({ is_pinned: !activeNote.is_pinned })}
                className={`p-1.5 rounded-xl border transition-colors ${
                  activeNote.is_pinned
                    ? 'bg-amber-200/80 border-amber-300 text-amber-900'
                    : 'bg-white/85 border-slate-200 text-slate-400 hover:text-slate-700'
                }`}
                title={activeNote.is_pinned ? 'Unpin note' : 'Pin note to front'}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleDeleteNote(activeNote.id)}
                className="p-1.5 rounded-xl bg-white/85 border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors"
                title="Delete this note manually"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <textarea
            value={activeNote.content}
            onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
            placeholder="Type counselor reminders, visa checklists, call back numbers, or fee notes here. Nothing is ever cleared automatically — it stays saved until you remove it."
            className="flex-1 w-full resize-none bg-white/90 rounded-2xl border border-slate-200/90 p-3 text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          {/* Footer info + Desktop Resize Handle */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 select-none shrink-0">
            <span>
              Updated{' '}
              {new Date(activeNote.updated_at).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {isMobileView ? ' • Saved until deleted' : ' • Drag corner to resize'}
            </span>

            {!isMobileView && (
              <div
                onPointerDown={(e) => {
                  e.preventDefault();
                  dragStateRef.current = {
                    type: 'resize',
                    startX: e.clientX,
                    startY: e.clientY,
                    origX: prefs.x,
                    origY: prefs.y,
                    origW: prefs.width,
                    origH: prefs.height,
                  };
                }}
                className="p-1 rounded-lg bg-white/90 border border-slate-300 text-slate-600 hover:text-brand-600 cursor-nwse-resize"
                title="Drag to resize window width & height"
              >
                <MoveDiagonal2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
