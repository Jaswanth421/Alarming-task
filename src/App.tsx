/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Plus, Filter, Calendar as CalendarIcon, List, Bell, X, StickyNote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Todo, User, Note, AppView } from './types';
import Navbar from './components/Navbar';
import TodoItem from './components/TodoItem';
import TodoForm from './components/TodoForm';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import Notes from './components/Notes';
import AIChat from './components/AIChat';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>('dashboard');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [activeAlarm, setActiveAlarm] = useState<Todo | null>(null);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todosRes, notesRes] = await Promise.all([
          fetch('/api/todos'),
          fetch('/api/notes')
        ]);
        if (todosRes.ok) setTodos(await todosRes.json());
        if (notesRes.ok) setNotes(await notesRes.json());
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchData();

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Save user only to localStorage (for demo)
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Alarm checker
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      todos.forEach(todo => {
        if (todo.alarmTime && !todo.completed) {
          const alarmDate = new Date(todo.alarmTime);
          // Check if alarm time is within the last minute and hasn't been triggered
          if (
            alarmDate.getTime() <= now.getTime() && 
            alarmDate.getTime() > now.getTime() - 60000 &&
            activeAlarm?.id !== todo.id
          ) {
            setActiveAlarm(todo);
            // Browser notification if permitted
            if (Notification.permission === 'granted') {
              new Notification(`Task Reminder: ${todo.title}`, {
                body: todo.description || 'Time to get it done!',
                icon: '/favicon.ico'
              });
            }
          }
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [todos, activeAlarm]);

  const handleAddTodo = async (todoData: Partial<Todo>) => {
    let newTodo: Todo;
    if (editingTodo) {
      newTodo = { ...editingTodo, ...todoData } as Todo;
      setTodos(prev => prev.map(t => t.id === editingTodo.id ? newTodo : t));
      setEditingTodo(undefined);
    } else {
      newTodo = {
        id: Math.random().toString(36).substr(2, 9),
        title: todoData.title!,
        description: todoData.description || '',
        completed: false,
        createdAt: Date.now(),
        dueDate: todoData.dueDate,
        alarmTime: todoData.alarmTime,
        priority: todoData.priority || 'medium',
        category: todoData.category || 'General',
      };
      setTodos(prev => [newTodo, ...prev]);
    }
    
    try {
      await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      });
    } catch (error) {
      console.error("Save error:", error);
    }
    
    setIsFormOpen(false);
  };

  const handleAddNote = async (noteData: Partial<Note>) => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: noteData.title || '',
      content: noteData.content || '',
      createdAt: Date.now(),
      color: noteData.color || 'bg-amber-100 border-amber-200 text-amber-900',
    };
    setNotes(prev => [newNote, ...prev]);

    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      });
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleToggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    const updatedTodo = { ...todo, completed: !todo.completed };
    setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));

    try {
      await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo)
      });
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  };

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar 
        user={user} 
        onLogout={() => setUser(null)} 
        onNewTask={() => {
          setEditingTodo(undefined);
          setIsFormOpen(true);
        }} 
      />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* View Switcher */}
        <div className="flex items-center gap-4 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit shadow-sm overflow-x-auto max-w-full no-scrollbar">
          <button
            onClick={() => setView('dashboard')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              view === 'dashboard' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <CalendarIcon size={18} />
            Dashboard
          </button>
          <button
            onClick={() => setView('tasks')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              view === 'tasks' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <List size={18} />
            My Tasks
          </button>
          <button
            onClick={() => setView('notes')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              view === 'notes' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <StickyNote size={18} />
            My Notes
          </button>
        </div>

        <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Dashboard todos={todos} />
            </motion.div>
          ) : view === 'tasks' ? (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Your Tasks</h2>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
                  {(['all', 'active', 'completed'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${
                        filter === f ? 'bg-slate-100 text-primary' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <AnimatePresence mode="popLayout">
                  {filteredTodos.length > 0 ? (
                    filteredTodos.map(todo => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={handleToggleTodo}
                        onDelete={handleDeleteTodo}
                        onEdit={handleEditTodo}
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200"
                    >
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <List size={40} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-700 mb-2">No tasks found</h3>
                      <p className="text-slate-400 max-w-xs mx-auto">
                        {filter === 'all' ? "You haven't created any tasks yet. Start by adding a new one!" : `No ${filter} tasks to show.`}
                      </p>
                      <button
                        onClick={() => setIsFormOpen(true)}
                        className="mt-6 text-primary font-bold flex items-center gap-2 mx-auto hover:underline"
                      >
                        <Plus size={20} /> Create your first task
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Notes 
                notes={notes} 
                onAdd={handleAddNote} 
                onDelete={handleDeleteNote} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AIChat onAddTask={handleAddTodo} />

      {/* Task Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl"
            >
              <TodoForm
                onSubmit={handleAddTodo}
                onCancel={() => setIsFormOpen(false)}
                initialData={editingTodo}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Alarm Notification Modal */}
      <AnimatePresence>
        {activeAlarm && (
          <div className="fixed bottom-8 right-8 z-[70]">
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className="bg-primary text-white p-6 rounded-3xl shadow-2xl shadow-primary/40 border border-white/20 w-80"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-bounce">
                  <Bell size={24} />
                </div>
                <button onClick={() => setActiveAlarm(null)} className="text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Task Reminder</h4>
              <h3 className="text-xl font-bold mb-2">{activeAlarm.title}</h3>
              <p className="text-sm text-white/80 mb-6 line-clamp-2">
                {activeAlarm.description || 'Time to complete this task!'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleToggleTodo(activeAlarm.id);
                    setActiveAlarm(null);
                  }}
                  className="flex-1 bg-white text-primary font-bold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors"
                >
                  Mark Done
                </button>
                <button
                  onClick={() => setActiveAlarm(null)}
                  className="flex-1 bg-primary-dark text-white font-bold py-2.5 rounded-xl text-sm hover:bg-primary-dark/80 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Add Button */}
      <button
        onClick={() => {
          setEditingTodo(undefined);
          setIsFormOpen(true);
        }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 sm:hidden w-14 h-14 bg-primary text-white rounded-full shadow-xl shadow-primary/40 flex items-center justify-center z-50 active:scale-95 transition-transform"
      >
        <Plus size={32} />
      </button>
    </div>
  );
}
