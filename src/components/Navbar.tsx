import { LayoutDashboard, CheckSquare, Bell, User, LogOut, Search, Plus } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  user: UserType | null;
  onLogout: () => void;
  onNewTask: () => void;
}

export default function Navbar({ user, onLogout, onNewTask }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-slate-200 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <CheckSquare size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">AlarmingTasks</span>
        </div>

        <div className="flex-1 max-w-md relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-xl transition-all outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <button 
            onClick={onNewTask}
            className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-md shadow-primary/10"
          >
            <Plus size={18} />
            <span>New Task</span>
          </button>
          
          <button className="relative p-2 text-slate-500 hover:text-primary transition-colors">
            <Bell size={22} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>

          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">Pro Member</p>
              </div>
              <div className="group relative">
                <button className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm hover:border-primary transition-all">
                  <img 
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0">
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                    <User size={16} /> Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                    <LayoutDashboard size={16} /> Preferences
                  </button>
                  <div className="h-px bg-slate-100 my-2"></div>
                  <button 
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-left text-sm text-rose-500 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
