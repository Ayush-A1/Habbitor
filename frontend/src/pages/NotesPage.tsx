import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pin, Trash2, X, Tag, BookOpen } from 'lucide-react';
import { notesApi, habitsApi } from '../api';
import { Note, NoteColor } from '../types';
import { format, parseISO } from 'date-fns';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

const COLORS: { key: NoteColor; dot: string; bg: string; border: string }[] = [
  { key: 'default', dot: 'rgba(255,255,255,0.2)',  bg: '#111118',              border: 'rgba(255,255,255,0.09)' },
  { key: 'blue',    dot: '#60A5FA',                bg: 'rgba(30,58,138,0.4)',  border: 'rgba(96,165,250,0.25)' },
  { key: 'green',   dot: '#34D399',                bg: 'rgba(6,78,59,0.4)',    border: 'rgba(52,211,153,0.25)' },
  { key: 'yellow',  dot: '#FBBF24',                bg: 'rgba(120,53,15,0.4)', border: 'rgba(251,191,36,0.25)' },
  { key: 'red',     dot: '#F87171',                bg: 'rgba(127,29,29,0.4)', border: 'rgba(248,113,113,0.25)' },
  { key: 'purple',  dot: '#A78BFA',                bg: 'rgba(88,28,135,0.4)', border: 'rgba(167,139,250,0.25)' },
];
const col = (c: NoteColor) => COLORS.find(x => x.key === c) ?? COLORS[0];

function NoteCard({ note, onEdit, onDelete, onPin }: { note: Note; onEdit: (n: Note) => void; onDelete: (id: string) => void; onPin: (id: string) => void }) {
  const c = col(note.color);
  return (
    <div onClick={() => onEdit(note)} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 14, padding: 14, cursor: 'pointer', transition: 'transform 0.1s', position: 'relative' as const }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.01)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
      {note.isPinned && <div style={{ position: 'absolute', top: 10, right: 10 }}><Pin size={13} style={{ color: '#A5B4FC', fill: '#A5B4FC' }} /></div>}
      {note.title && <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 6, paddingRight: 20 }}>{note.title}</div>}
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {note.content.length > 180 ? note.content.slice(0, 180) + '…' : note.content}
      </div>
      {note.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
          {note.tags.slice(0, 4).map(t => <span key={t} style={{ fontSize: 10, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)', padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>#{t}</span>)}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)' }}>{format(parseISO(note.updatedAt), 'MMM d, h:mm a')}</span>
        <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
          <button onClick={() => onPin(note._id)} style={{ padding: 5, borderRadius: 7, border: 'none', background: note.isPinned ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)', color: note.isPinned ? '#A5B4FC' : 'rgba(255,255,255,0.35)', cursor: 'pointer' }}><Pin size={12} /></button>
          <button onClick={() => onDelete(note._id)} style={{ padding: 5, borderRadius: 7, border: 'none', background: 'rgba(239,68,68,0.07)', color: '#F87171', cursor: 'pointer' }}><Trash2 size={12} /></button>
        </div>
      </div>
    </div>
  );
}

function Editor({ note, habits, onClose, onSave }: { note: Note | null; habits: any[]; onClose: () => void; onSave: (d: any, id?: string) => void }) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [color, setColor] = useState<NoteColor>(note?.color ?? 'default');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(note?.tags ?? []);
  const [habitId, setHabitId] = useState(note?.habitId ?? '');
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t) && tags.length < 10) { setTags([...tags, t]); setTagInput(''); }
  };

  const c = col(color);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.75)' }}>
      <div className="anim-pop" style={{ width: '100%', maxWidth: 520, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 20, display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, fontWeight: 600, color: '#fff', fontFamily: 'inherit' }} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 4 }}><X size={16} /></button>
        </div>
        <textarea ref={ref} value={content} onChange={e => setContent(e.target.value)} placeholder="Start writing…" rows={8} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '14px 20px', fontSize: 13, color: 'rgba(255,255,255,0.8)', resize: 'none', lineHeight: 1.7, fontFamily: 'inherit', overflowY: 'auto' }} />
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 20px 10px' }}>
            {tags.map(t => (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                #{t}<button onClick={() => setTags(tags.filter(x => x !== t))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 0, marginLeft: 2 }}><X size={10} /></button>
              </span>
            ))}
          </div>
        )}
        <div style={{ padding: '10px 20px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag size={13} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Add tag, press Enter" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'inherit' }} />
          </div>
          {habits.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={13} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
              <select value={habitId} onChange={e => setHabitId(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'inherit' }}>
                <option value="">Link to a habit (optional)</option>
                {habits.map(h => <option key={h._id} value={h._id}>{h.icon} {h.name}</option>)}
              </select>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {COLORS.map(c2 => (
                <button key={c2.key} onClick={() => setColor(c2.key)} style={{ width: 20, height: 20, borderRadius: '50%', background: c2.dot, border: 'none', cursor: 'pointer', outline: color === c2.key ? '2px solid white' : 'none', outlineOffset: 2 }} title={c2.key} />
              ))}
            </div>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>{content.length}/10000</span>
            <button onClick={onClose} className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }}>Cancel</button>
            <button onClick={() => { if (!content.trim()) { toast.error('Content required'); return; } onSave({ title: title.trim(), content: content.trim(), color, tags, habitId: habitId || undefined }, note?._id); }} className="btn-primary" style={{ padding: '5px 14px', fontSize: 12 }}>
              {note ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [activeColor, setActiveColor] = useState<NoteColor | ''>('');
  const [editor, setEditor] = useState<Note | null | undefined>(undefined);

  const { data: notes = [], isLoading } = useQuery({ queryKey: ['notes', search, activeTag, activeColor], queryFn: () => notesApi.getAll({ q: search || undefined, tag: activeTag || undefined, color: activeColor || undefined }) });
  const { data: tags = [] } = useQuery({ queryKey: ['notes-tags'], queryFn: notesApi.tags });
  const { data: habits = [] } = useQuery({ queryKey: ['habits'], queryFn: habitsApi.getAll });

  const inv = () => { qc.invalidateQueries({ queryKey: ['notes'] }); qc.invalidateQueries({ queryKey: ['notes-tags'] }); };

  const create = useMutation({ mutationFn: notesApi.create, onSuccess: () => { inv(); toast.success('Note saved!'); setEditor(undefined); }, onError: () => toast.error('Failed') });
  const update = useMutation({ mutationFn: ({ id, data }: any) => notesApi.update(id, data), onSuccess: () => { inv(); toast.success('Updated!'); setEditor(undefined); }, onError: () => toast.error('Failed') });
  const pin    = useMutation({ mutationFn: notesApi.pin, onSuccess: () => inv() });
  const del    = useMutation({ mutationFn: notesApi.remove, onSuccess: () => { inv(); toast.success('Deleted'); } });

  const onSave = (data: any, id?: string) => id ? update.mutate({ id, data }) : create.mutate(data);

  const pinned   = notes.filter(n => n.isPinned);
  const unpinned = notes.filter(n => !n.isPinned);

  return (
    <div className="anim-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div><h1 className="page-title">Notes</h1><p className="page-sub">{notes.length} note{notes.length !== 1 ? 's' : ''}</p></div>
        <button onClick={() => setEditor(null)} className="btn-primary"><Plus size={16} />New Note</button>
      </div>

      {/* Search + color filter */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes…" className="input-base" style={{ paddingLeft: 32 }} />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><X size={13} /></button>}
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 12 }}>
          {COLORS.map(c => (
            <button key={c.key} onClick={() => setActiveColor(activeColor === c.key ? '' : c.key)} style={{ width: 18, height: 18, borderRadius: '50%', background: c.dot, border: 'none', cursor: 'pointer', outline: activeColor === c.key ? '2px solid white' : 'none', outlineOffset: 2, transition: 'transform 0.1s' }} title={c.key} />
          ))}
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {tags.map(t => (
            <button key={t} onClick={() => setActiveTag(activeTag === t ? '' : t)} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', background: activeTag === t ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)', color: activeTag === t ? '#A5B4FC' : 'rgba(255,255,255,0.45)', transition: 'all 0.15s' }}>
              #{t}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
          {[0,1,2,3].map(i => <div key={i} style={{ height: 140, background: 'rgba(255,255,255,0.03)', borderRadius: 14 }} />)}
        </div>
      ) : notes.length === 0 ? (
        <div className="card" style={{ padding: 64, textAlign: 'center', borderRadius: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 6 }}>{search || activeTag || activeColor ? 'No notes match' : 'No notes yet'}</p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 20 }}>Capture thoughts, ideas, and reflections</p>
          {!search && !activeTag && !activeColor && <button onClick={() => setEditor(null)} className="btn-primary" style={{ margin: '0 auto' }}><Plus size={16} />Write first note</button>}
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Pin size={12} style={{ color: '#A5B4FC' }} />
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: 'rgba(255,255,255,0.35)' }}>Pinned</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
                {pinned.map(n => <NoteCard key={n._id} note={n} onEdit={setEditor} onDelete={id => { if (confirm('Delete?')) del.mutate(id); }} onPin={id => pin.mutate(id)} />)}
              </div>
            </div>
          )}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Others</div>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
                {unpinned.map(n => <NoteCard key={n._id} note={n} onEdit={setEditor} onDelete={id => { if (confirm('Delete?')) del.mutate(id); }} onPin={id => pin.mutate(id)} />)}
              </div>
            </div>
          )}
        </>
      )}

      {editor !== undefined && <Editor note={editor} habits={habits} onClose={() => setEditor(undefined)} onSave={onSave} />}
    </div>
  );
}
