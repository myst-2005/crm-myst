import React from 'react';
import { useCRM, NavTab } from '../../context/CRMContext';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Kanban,
  Calendar,
  CheckSquare,
  Presentation,
  UserCheck,
  BookOpen,
  BarChart3,
  Settings,
  Globe,
  LogOut,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const NAV_ITEMS: { id: NavTab; label: string; icon: React.ReactNode; isSpecial?: boolean }[] = [
  { id: 'website',      label: 'Edge Website', icon: <Globe className="w-4 h-4" />, isSpecial: true },
  { id: 'dashboard',    label: 'Dashboard',    icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'colleges',     label: 'Colleges',     icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'contacts',     label: 'Contacts',     icon: <Users className="w-4 h-4" /> },
  { id: 'pipeline',     label: 'Pipeline',     icon: <Kanban className="w-4 h-4" /> },
  { id: 'calendar',     label: 'Calendar',     icon: <Calendar className="w-4 h-4" /> },
  { id: 'tasks',        label: 'Tasks',        icon: <CheckSquare className="w-4 h-4" /> },
  { id: 'sessions',     label: 'Sessions',     icon: <Presentation className="w-4 h-4" /> },
  { id: 'students',     label: 'Students',     icon: <UserCheck className="w-4 h-4" /> },
  { id: 'courses',      label: 'Courses',      icon: <BookOpen className="w-4 h-4" /> },
  { id: 'reports',      label: 'Reports',      icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'settings',     label: 'Settings',     icon: <Settings className="w-4 h-4" /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { currentTab, setCurrentTab, currentUser, activities } = useCRM();

  const overdueTasks = activities.filter(
    (a) => !a.completed && a.due_date && a.due_date <= new Date().toISOString().split('T')[0]
  ).length;

  const handleNav = (tab: NavTab) => {
    setCurrentTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-56 bg-[#11102D] border-r border-[rgba(196,181,253,0.12)] flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo & Brand Header */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-[rgba(196,181,253,0.12)] bg-[#0B0A24]/50">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-[rgba(196,181,253,0.2)] shadow-[0_0_15px_rgba(139,92,246,0.3)] shrink-0 bg-[#0B0A24]">
            <img
              src="/edge-logo.jpg"
              alt="Edge Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-[#F7F7FF]">
                EDGE
              </span>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#8B5CF6]/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] tracking-wider text-[#AAA9C5] truncate font-medium">
              A MYST INITIATIVE
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#8B5CF6]/25 via-[#8B5CF6]/15 to-transparent text-[#F7F7FF] font-semibold border-l-2 border-[#8B5CF6] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                    : item.isSpecial
                    ? 'text-[#C4B5FD] bg-[#171638]/60 hover:bg-[#8B5CF6]/15 hover:text-[#F7F7FF] border border-[rgba(196,181,253,0.14)] mb-2'
                    : 'text-[#AAA9C5] hover:text-[#F7F7FF] hover:bg-[#171638]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={active ? 'text-[#C4B5FD]' : item.isSpecial ? 'text-[#8B5CF6]' : 'text-[#AAA9C5]/80'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.id === 'tasks' && overdueTasks > 0 && (
                  <span className="text-[10px] font-bold bg-rose-500/80 text-white px-1.5 py-0.2 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]">
                    {overdueTasks}
                  </span>
                )}
                {item.isSpecial && !active && (
                  <span className="text-[9px] uppercase tracking-wider px-1 py-0.5 rounded bg-[#4F7DFF]/20 text-[#4F7DFF] font-bold">
                    LIVE
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card + Sign out */}
        <div className="px-3 py-3 border-t border-[rgba(196,181,253,0.12)] bg-[#0B0A24]/40">
          <div className="flex items-center gap-2.5 mb-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#4F7DFF] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-[0_0_10px_rgba(139,92,246,0.3)]">
              {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#F7F7FF] truncate">{currentUser.name}</p>
              <p className="text-[10px] text-[#AAA9C5] truncate">{currentUser.role} · Edge Team</p>
            </div>
          </div>
          <button
            onClick={async () => {
              if (supabase) await supabase.auth.signOut();
              else window.location.reload();
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-[#AAA9C5] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
};
