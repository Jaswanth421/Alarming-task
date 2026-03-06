import React from 'react';
import { CheckCircle2, Circle, Clock, Bell, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { Todo } from '../types';
import { motion } from 'motion/react';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit }) => {
  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;
  
  const priorityColors = {
    low: 'bg-blue-100 text-blue-600',
    medium: 'bg-amber-100 text-amber-600',
    high: 'bg-rose-100 text-rose-600',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all ${
        todo.completed ? 'bg-slate-50/50 border-slate-100' : 'bg-white border-slate-200 hover:border-primary/30 hover:shadow-md'
      }`}
    >
      <button
        onClick={() => onToggle(todo.id)}
        className={`mt-1 transition-colors ${todo.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-primary'}`}
      >
        {todo.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-semibold truncate ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
            {todo.title}
          </h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${priorityColors[todo.priority]}`}>
            {todo.priority}
          </span>
        </div>

        {todo.description && (
          <p className={`text-sm mb-3 line-clamp-2 ${todo.completed ? 'text-slate-300' : 'text-slate-500'}`}>
            {todo.description}
          </p>
        )}

        <div className="flex flex-wrap gap-3 items-center text-xs text-slate-400">
          {todo.dueDate && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-rose-500 font-medium' : ''}`}>
              <Clock size={12} />
              {new Date(todo.dueDate).toLocaleDateString()} {new Date(todo.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {isOverdue && <AlertCircle size={12} className="ml-1" />}
            </div>
          )}
          {todo.alarmTime && (
            <div className="flex items-center gap-1 text-primary font-medium">
              <Bell size={12} />
              {new Date(todo.alarmTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          <div className="bg-slate-100 px-2 py-0.5 rounded text-slate-500">
            {todo.category}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(todo)}
          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default TodoItem;
