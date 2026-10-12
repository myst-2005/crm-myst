import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { CalendarEvent } from '../../types/crm';
import { CalendarModal } from './CalendarModal';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  RefreshCw,
  Building,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

export const CalendarView: React.FC<{
  onOpenCollegeDetail: (id: string) => void;
}> = ({ onOpenCollegeDetail }) => {
  const {
    calendarEvents,
    colleges,
    teamMembers,
    integrations,
    syncAllGoogleEvents,
    syncEventToGoogle,
    deleteEvent,
  } = useCRM();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [ownerFilter, setOwnerFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [defaultDateForModal, setDefaultDateForModal] = useState<string | undefined>();

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return calendarEvents.filter((e) => {
      if (typeFilter !== 'ALL' && e.event_type !== typeFilter) return false;
      if (ownerFilter !== 'ALL' && e.owner_id !== ownerFilter) return false;
      return true;
    });
  }, [calendarEvents, typeFilter, ownerFilter]);

  // Date Navigation
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 7);
      setCurrentDate(prev);
    } else {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 1);
      setCurrentDate(prev);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    } else {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 1);
      setCurrentDate(next);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate calendar days for month view
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter((e) => e.start_time.startsWith(dayStr));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-black text-lg border border-brand-200/60 shadow-xs">
            <CalendarIcon className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              Outreach & Campus Calendar
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Working operational schedule for visits, sessions, calls, and follow-ups
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sync status button */}
          <button
            onClick={syncAllGoogleEvents}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            title="Sync all calendar events with Google Calendar"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync Google Calendar</span>
          </button>

          {/* Add Event Button */}
          <button
            onClick={() => {
              setSelectedEvent(null);
              setDefaultDateForModal(new Date().toISOString().split('T')[0]);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Schedule Event</span>
          </button>
        </div>
      </div>

      {/* Navigation & Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        {/* Date Navigator */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Today
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-base font-extrabold text-slate-900 tracking-tight ml-1">
            {monthName}
          </h2>
        </div>

        {/* View Switcher & Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="ALL">All Event Types</option>
            <option value="Campus Session">Campus Sessions</option>
            <option value="Meeting">Meetings</option>
            <option value="Call">Calls</option>
            <option value="Reminder">Reminders</option>
          </select>

          {/* Owner Filter */}
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="ALL">All Team Members</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['month', 'week', 'agenda'] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg font-semibold uppercase text-[11px] transition-colors ${
                  viewMode === mode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 text-center py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {blankDays.map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[110px] bg-slate-50/40 p-2" />
            ))}

            {daysArray.map((day) => {
              const dayDate = new Date(year, month, day);
              const isToday = dayDate.toDateString() === new Date().toDateString();
              const dayEvents = getEventsForDay(day);
              const dateIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => {
                    setSelectedEvent(null);
                    setDefaultDateForModal(dateIso);
                    setModalOpen(true);
                  }}
                  className={`min-h-[120px] p-2 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col justify-between group ${
                    isToday ? 'bg-brand-50/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'text-slate-700 group-hover:text-brand-600'
                      }`}
                    >
                      {day}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-bold">
                        {dayEvents.length} evt
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="mt-1 space-y-1 flex-1">
                    {dayEvents.slice(0, 3).map((evt) => {
                      const isSession = evt.event_type === 'Campus Session';
                      return (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(evt);
                            setModalOpen(true);
                          }}
                          className={`p-1.5 rounded-lg text-[11px] font-semibold truncate border transition-all ${
                            isSession
                              ? 'bg-purple-100/90 text-purple-900 border-purple-200'
                              : 'bg-brand-50 text-brand-900 border-brand-200/80 hover:bg-brand-100'
                          }`}
                          title={`${evt.title} (${evt.event_type})`}
                        >
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0" />
                            <span className="truncate">{evt.title}</span>
                          </div>
                        </div>
                      );
                    })}

                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-slate-500 font-bold block pl-1">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AGENDA VIEW */}
      {(viewMode === 'agenda' || viewMode === 'week') && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Upcoming Operational Schedule
          </h3>

          <div className="divide-y divide-slate-100">
            {filteredEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No events scheduled. Click "Schedule Event" to plan outreach visits.
              </div>
            ) : (
              filteredEvents
                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                .map((evt) => {
                  const linkedCollege = colleges.find((c) => c.id === evt.college_id);
                  const owner = teamMembers.find((m) => m.id === evt.owner_id);
                  const isSession = evt.event_type === 'Campus Session';

                  return (
                    <div
                      key={evt.id}
                      onClick={() => {
                        setSelectedEvent(evt);
                        setModalOpen(true);
                      }}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 px-3 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                            isSession
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-brand-50 text-brand-700'
                          }`}
                        >
                          <Clock className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                              {evt.start_time.split('T')[0]} ·{' '}
                              {evt.start_time.split('T')[1]?.slice(0, 5)}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {evt.event_type}
                            </span>
                            {evt.synced_to_google && (
                              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                GCal Synced
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 mt-1">{evt.title}</h4>

                          {linkedCollege && (
                            <p
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenCollegeDetail(linkedCollege.id);
                              }}
                              className="text-xs text-brand-600 font-semibold hover:underline mt-0.5"
                            >
                              {linkedCollege.name}
                            </p>
                          )}

                          {evt.venue && (
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {evt.venue}
                            </p>
                          )}

                          {evt.participants && evt.participants.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {evt.participants.map((p, idx) => (
                                <span
                                  key={idx}
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                    p.is_team_member
                                      ? 'bg-slate-100 text-slate-700'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {p.name} {p.is_team_member ? '' : '(Guest)'}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 text-right">
                        <span className="text-xs text-slate-500">
                          Owner: <strong>{owner?.name.split(' ')[0] || 'Unassigned'}</strong>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(evt);
                            setModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEvent(null);
        }}
        eventToEdit={selectedEvent}
        defaultDate={defaultDateForModal}
      />
    </div>
  );
};
