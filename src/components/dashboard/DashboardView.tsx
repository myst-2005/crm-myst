import React from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  GraduationCap,
  Presentation,
  CheckCircle2,
  AlertCircle,
  Users,
  IndianRupee,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  PhoneCall,
  Mail,
  MessageCircle,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { PriorityBadge, StageBadge, TrackBadge } from '../common/Badge';

export const DashboardView: React.FC<{
  onOpenNewCollege: () => void;
  onOpenCollegeDetail: (id: string) => void;
}> = ({ onOpenNewCollege, onOpenCollegeDetail }) => {
  const {
    colleges,
    sessions,
    activities,
    students,
    courses,
    calendarEvents,
    teamMembers,
    setCurrentTab,
    toggleActivityCompleted,
  } = useCRM();

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. KPI Metrics
  const totalColleges = colleges.length;
  const upcomingSessions = sessions.filter(
    (s) => s.approval_status === 'Scheduled' || s.approval_status === 'Approved'
  ).length;

  const dueOrOverdueTasks = activities.filter(
    (a) => !a.completed && a.due_date && a.due_date <= todayStr
  );

  const verifiedPaidEnrolments = students.filter(
    (s) => s.lead_stage === 'Enrolled' && s.payment_status === 'Paid'
  ).length;

  const totalCollectedRevenue = students.reduce((sum, s) => {
    if (s.payment_status === 'Paid') return sum + s.agreed_fee;
    if (s.payment_status === 'Partial') return sum + s.agreed_fee * 0.5;
    return sum;
  }, 0);

  const totalExpectedRevenue = students.reduce((sum, s) => sum + s.agreed_fee, 0);

  // Today's Calendar activities
  const todayEvents = calendarEvents.filter((e) => {
    const eventDate = e.start_time.split('T')[0];
    return eventDate === todayStr;
  });

  // Recent leads
  const recentLeads = [...colleges]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  // Colleges needing attention next (High Priority, active, follow-up overdue or due soon)
  const collegesToContactNext = colleges
    .filter((c) => c.stage !== 'Converted' && c.stage !== 'Lost')
    .sort((a, b) => {
      const priorityWeight = { High: 3, Medium: 2, Low: 1 };
      const diff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (diff !== 0) return diff;
      return (a.next_follow_up_date || '9999').localeCompare(b.next_follow_up_date || '9999');
    })
    .slice(0, 4);

  // Sessions completed post-outcome summary
  const completedSessions = sessions.filter((s) => s.approval_status === 'Completed');

  return (
    <div className="space-y-6">
      {/* Top Banner: The 5 Core CRM Questions Quick Status Pill */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-brand-500/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-semibold backdrop-blur-xs mb-2">
              <TrendingUp className="w-3.5 h-3.5" /> High-Impact Outreach Status
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              MYST Edge Campus CRM
            </h1>
            <p className="text-sm text-brand-100/90 mt-1 max-w-2xl leading-relaxed">
              Managing relationships from first outreach to hands-on awareness sessions and verified paid enrolments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentTab('pipeline')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl backdrop-blur-xs border border-white/20 transition-all"
            >
              View Pipeline Board
            </button>
            <button
              onClick={onOpenNewCollege}
              className="px-4 py-2 bg-white hover:bg-brand-50 text-brand-900 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              + Add College
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Top Metrics (from spec 6. Dashboard requirements) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Colleges */}
        <div
          onClick={() => setCurrentTab('colleges')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle hover:shadow-premium hover:border-brand-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Colleges
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{totalColleges}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Total institutional records</span>
              <span className="text-brand-600 font-semibold flex items-center">
                Explore <ArrowRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Sessions Booked */}
        <div
          onClick={() => setCurrentTab('sessions')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle hover:shadow-premium hover:border-brand-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sessions Booked
            </span>
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Presentation className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{upcomingSessions}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Upcoming awareness sessions</span>
              <span className="text-brand-600 font-semibold flex items-center">
                Schedule <ArrowRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Follow-ups Due */}
        <div
          onClick={() => setCurrentTab('tasks')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle hover:shadow-premium hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Follow-ups Due
            </span>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                dueOrOverdueTasks.length > 0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-3xl font-extrabold ${
                dueOrOverdueTasks.length > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {dueOrOverdueTasks.length}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Due today or overdue</span>
              <span className="text-rose-600 font-semibold flex items-center">
                Take action <ArrowRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Enrolments & Revenue */}
        <div
          onClick={() => setCurrentTab('students')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle hover:shadow-premium hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Paid Enrolments
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {verifiedPaidEnrolments}
            </div>
            <div className="text-xs text-emerald-700 font-semibold mt-1 flex items-center justify-between">
              <span>₹{totalCollectedRevenue.toLocaleString()} collected</span>
              <span className="text-slate-400 font-normal">
                (Exp: ₹{totalExpectedRevenue.toLocaleString()})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Center: Today's Priorities + Today's Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Priorities (Follow-up Tasks) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                Today's Priorities & Overdue Tasks
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Immediate calls, WhatsApp outreach, and proposals due
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('tasks')}
              className="text-xs font-bold text-brand-600 hover:text-brand-800 hover:underline"
            >
              View all ({activities.length}) →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {dueOrOverdueTasks.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">
                  You're all caught up on follow-ups!
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Schedule next touches or explore new college outreach.
                </p>
              </div>
            ) : (
              dueOrOverdueTasks.map((task) => {
                const linkedCollege = colleges.find((c) => c.id === task.college_id);
                const assignedMember = teamMembers.find((m) => m.id === task.assigned_to_id);
                const isOverdue = task.due_date && task.due_date < todayStr;

                return (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-brand-300 bg-slate-50/50 hover:bg-white transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleActivityCompleted(task.id, 'Completed from Dashboard')}
                        className="mt-0.5 w-5 h-5 rounded-md border-2 border-slate-300 hover:border-brand-600 flex items-center justify-center transition-colors group-hover:border-brand-500"
                        title="Mark task completed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-transparent hover:text-brand-600" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              task.type === 'Call'
                                ? 'bg-sky-100 text-sky-800'
                                : task.type === 'WhatsApp'
                                ? 'bg-emerald-100 text-emerald-800'
                                : task.type === 'Email'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {task.type}
                          </span>
                          <span
                            className={`text-xs font-bold ${
                              isOverdue ? 'text-rose-600' : 'text-amber-600'
                            }`}
                          >
                            {isOverdue ? `Overdue (${task.due_date})` : 'Due Today'}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 mt-1">
                          {task.title}
                        </h4>
                        {linkedCollege && (
                          <p
                            onClick={() => onOpenCollegeDetail(linkedCollege.id)}
                            className="text-xs text-brand-600 hover:underline cursor-pointer font-medium mt-0.5"
                          >
                            {linkedCollege.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {assignedMember && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold text-[10px] flex items-center justify-center">
                            {assignedMember.name[0]}
                          </div>
                          <span>{assignedMember.name}</span>
                        </div>
                      )}
                      <button
                        onClick={() => setCurrentTab('tasks')}
                        className="px-2.5 py-1 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                      >
                        Action
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Today's Calendar & Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                Today's Calendar
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Calls, meetings & sessions today</p>
            </div>
            <button
              onClick={() => setCurrentTab('calendar')}
              className="text-xs font-bold text-brand-600 hover:text-brand-800 hover:underline"
            >
              Open Calendar →
            </button>
          </div>

          <div className="mt-4 flex-1 space-y-3">
            {todayEvents.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Calendar className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No events scheduled today</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Schedule calls or sync your Google Calendar.
                </p>
              </div>
            ) : (
              todayEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-brand-200 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                      {evt.start_time.split('T')[1]?.slice(0, 5) || 'Today'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {evt.event_type}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1.5">{evt.title}</h4>
                  {evt.venue && (
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{evt.venue}</p>
                  )}
                  {evt.participants && evt.participants.length > 0 && (
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {evt.participants.map((p) => p.name).join(', ')}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Strategic Section: Which colleges should we contact next? */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Which colleges should we contact next? */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-brand-600" />
                Which colleges should we contact next?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ranked by priority, relationship ownership, and upcoming follow-up milestones
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('colleges')}
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              All Colleges →
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {collegesToContactNext.map((college) => {
              const owner = teamMembers.find((m) => m.id === college.owner_id);
              return (
                <div
                  key={college.id}
                  onClick={() => onOpenCollegeDetail(college.id)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={college.priority} />
                      <StageBadge stage={college.stage} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 truncate mt-1">
                      {college.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Next: <span className="font-medium text-slate-700">{college.next_action || 'Log next outreach'}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-slate-600 block">
                      Owner: {owner ? owner.name.split(' ')[0] : 'Unassigned'}
                    </span>
                    <span className="text-[11px] text-brand-600 font-medium">
                      Due: {college.next_follow_up_date || 'None'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Campus Awareness Sessions & What happened afterward? */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" />
                Which colleges hosted a session & outcomes?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Completed campus sessions, attendance, feedback scores, and student leads
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('sessions')}
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              All Sessions →
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {completedSessions.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No sessions completed yet. Schedule one today!
              </div>
            ) : (
              completedSessions.map((ses) => {
                const linkedCollege = colleges.find((c) => c.id === ses.college_id);
                return (
                  <div
                    key={ses.id}
                    onClick={() => setCurrentTab('sessions')}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <TrackBadge track={ses.track} />
                        {ses.feedback_score && (
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            ★ {ses.feedback_score}/5
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 truncate">
                        {ses.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {linkedCollege?.name} · {ses.confirmed_date}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-slate-900 block">
                        {ses.actual_attendance || 0} Attended
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600">
                        {ses.interested_students_count || 0} Leads Registered
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
