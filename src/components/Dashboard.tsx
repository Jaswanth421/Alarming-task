import { CheckCircle2, Clock, ListTodo, AlertTriangle, TrendingUp } from 'lucide-react';
import { Todo } from '../types';
import { motion } from 'motion/react';

interface DashboardProps {
  todos: Todo[];
}

export default function Dashboard({ todos }: DashboardProps) {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const pending = total - completed;
  const overdue = todos.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: 'Total Tasks', value: total, icon: ListTodo, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending', value: pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Overdue', value: overdue, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bg} rounded-2xl flex items-center justify-center ${stat.color} mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-800">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-primary" />
              Progress Overview
            </h2>
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {completionRate}% Done
            </span>
          </div>

          <div className="space-y-6">
            <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Most Productive Category</p>
                <p className="text-lg font-bold text-slate-700">Work</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Next Deadline</p>
                <p className="text-lg font-bold text-slate-700">Today, 5:00 PM</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-primary p-8 rounded-3xl shadow-xl shadow-primary/20 text-white flex flex-col justify-between"
        >
          <div>
            <h3 className="text-2xl font-bold mb-2">Upgrade to Pro</h3>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Get unlimited tasks, cloud sync, and advanced AI-powered scheduling.
            </p>
          </div>
          <button className="mt-8 bg-white text-primary font-bold py-3 rounded-2xl hover:bg-slate-50 transition-colors shadow-lg">
            Start Free Trial
          </button>
        </motion.div>
      </div>
    </div>
  );
}
