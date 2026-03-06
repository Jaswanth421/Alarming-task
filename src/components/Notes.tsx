import React, { useState } from 'react';
import { Plus, Trash2, Search, StickyNote, X } from 'lucide-react';
import { Note } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface NotesProps {
  notes: Note[];
  onAdd: (note: Partial<Note>) => void;
  onDelete: (id: string) => void;
}

const NOTE_COLORS = [
  'bg-amber-100 border-amber-200 text-amber-900',
  'bg-blue-100 border-blue-200 text-blue-900',
  'bg-emerald-100 border-emerald-200 text-emerald-900',
  'bg-rose-100 border-rose-200 text-rose-900',
  'bg-indigo-100 border-indigo-200 text-indigo-900',
  'bg-slate-100 border-slate-200 text-slate-900',
];

export default function Notes({ notes, onAdd, onDelete }: NotesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    onAdd({ title, content, color: selectedColor });
    setTitle('');
    setContent('');
    setIsAdding(false);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <StickyNote className="text-primary" />
          My Notes
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
          >
            <Plus size={18} />
            Add Note
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className={`p-6 rounded-3xl border-2 shadow-xl ${selectedColor.split(' ')[0]} ${selectedColor.split(' ')[1]}`}
          >
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  placeholder="Note Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-transparent text-xl font-bold placeholder:text-slate-400 outline-none w-full"
                  autoFocus
                />
                <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <textarea
                placeholder="Write your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-transparent w-full min-h-[150px] outline-none resize-none placeholder:text-slate-400"
              />
              <div className="flex items-center justify-between pt-4 border-t border-black/5">
                <div className="flex gap-2">
                  {NOTE_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${color.split(' ')[0]} ${
                        selectedColor === color ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all"
                >
                  Save Note
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all group relative ${note.color}`}
            >
              <button
                onClick={() => onDelete(note.id)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
              <h3 className="text-lg font-bold mb-3 pr-8">{note.title || 'Untitled'}</h3>
              <p className="text-sm whitespace-pre-wrap line-clamp-6 opacity-80 leading-relaxed">
                {note.content}
              </p>
              <div className="mt-6 pt-4 border-t border-black/5 text-[10px] font-bold uppercase tracking-widest opacity-40">
                {new Date(note.createdAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredNotes.length === 0 && !isAdding && (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <StickyNote size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No notes found</h3>
          <p className="text-slate-400 max-w-xs mx-auto">
            {searchQuery ? "No notes match your search." : "Start capturing your ideas and thoughts!"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-6 text-primary font-bold flex items-center gap-2 mx-auto hover:underline"
            >
              <Plus size={20} /> Create your first note
            </button>
          )}
        </div>
      )}
    </div>
  );
}
