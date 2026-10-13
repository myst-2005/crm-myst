import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Menu, Search, Plus, Bell, AlertCircle, CheckCircle } from 'lucide-react';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onOpenNewCollegeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu, onOpenNewCollegeModal }) => {
  const { searchQuery, setSearchQuery, activities, setCurrentTab } = useCRM();
  const [notifOpen, setNotifOpen] = useState(false);

  const dueTasks = activities.filter(
    (a) => !a.completed && a.due_date && a.due_date <= new Date().toISOString().split('T')[0]
  );

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#11102D]/90 backdrop-blur-xl border-b border-[rgba(196,181,253,0.12)] px-4 sm:px-6 flex items-center gap-3">
      {/* Mobile menu toggle */}
      <button
        onClick={onOpenMobileMenu}
        className="lg:hidden p-2 text-[#AAA9C5] hover:text-[#F7F7FF] rounded-xl hover:bg-[#171638] transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="w-4 h-4 text-[#AAA9C5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search colleges, contacts, sessions…"
          className="w-full pl-10 pr-4 py-2 text-xs bg-[#171638] border border-[rgba(196,181,253,0.14)] rounded-xl text-[#F7F7FF] placeholder-[#AAA9C5]/50 focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAA9C5] hover:text-[#F7F7FF] text-sm"
          >
            ×
          </button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 text-[#AAA9C5] hover:text-[#F7F7FF] hover:bg-[#171638] rounded-xl relative transition-colors border border-[rgba(196,181,253,0.1)]"
          >
            <Bell className="w-4 h-4" />
            {dueTasks.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#171638] border border-[rgba(196,181,253,0.2)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-40 overflow-hidden backdrop-blur-xl">
                <div className="px-3.5 py-3 border-b border-[rgba(196,181,253,0.12)] flex items-center justify-between bg-[#11102D]">
                  <span className="text-xs font-semibold text-[#F7F7FF]">Action Items & Tasks</span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                    {dueTasks.length} Overdue
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {dueTasks.length === 0 ? (
                    <div className="py-8 flex flex-col items-center gap-1.5 text-[#AAA9C5] text-xs">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      All campus tasks up to date!
                    </div>
                  ) : (
                    dueTasks.slice(0, 8).map((t) => (
                      <div
                        key={t.id}
                        onClick={() => { setCurrentTab('tasks'); setNotifOpen(false); }}
                        className="px-3.5 py-2.5 hover:bg-[#11102D] cursor-pointer border-b border-[rgba(196,181,253,0.06)] last:border-0 transition-colors"
                      >
                        <p className="text-xs font-medium text-[#F7F7FF] truncate">{t.title}</p>
                        <p className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3" /> Due {t.due_date}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                {dueTasks.length > 0 && (
                  <button
                    onClick={() => { setCurrentTab('tasks'); setNotifOpen(false); }}
                    className="w-full py-2.5 text-xs font-semibold text-[#C4B5FD] hover:bg-[#11102D] border-t border-[rgba(196,181,253,0.12)] transition-colors"
                  >
                    View all tasks →
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Add lead CTA */}
        <button
          onClick={onOpenNewCollegeModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#4F7DFF] hover:from-[#7C3AED] hover:to-[#3B6AEC] text-white text-xs font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.35)] active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Lead</span>
        </button>
      </div>
    </header>
  );
};
