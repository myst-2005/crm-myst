import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Activity, ActivityType } from '../../types/crm';
import { Modal } from '../common/Modal';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Plus,
  CheckCircle2,
  Phone,
  Mail,
  MessageCircle,
  Building,
  User,
  Calendar,
  Send,
  Trash2,
} from 'lucide-react';
import { generateWhatsAppLink, generateMailToLink } from '../../lib/storage';

export const TasksView: React.FC<{
  onOpenCollegeDetail: (id: string) => void;
}> = ({ onOpenCollegeDetail }) => {
  const {
    activities,
    colleges,
    contacts,
    teamMembers,
    currentUser,
    addActivity,
    toggleActivityCompleted,
    deleteActivity,
  } = useCRM();

  const todayStr = new Date().toISOString().split('T')[0];

  // Filters
  const [filterStatus, setFilterStatus] = useState<'pending' | 'due_today' | 'overdue' | 'completed' | 'all'>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // New Activity Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState<ActivityType>('Call');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(todayStr);
  const [collegeId, setCollegeId] = useState(colleges[0]?.id || '');
  const [contactId, setContactId] = useState('');
  const [assignedToId, setAssignedToId] = useState(currentUser.id);

  // Complete Outcome Modal
  const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [outcomeText, setOutcomeText] = useState('');

  // WhatsApp One-Click Modal
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [waPhone, setWaPhone] = useState('');
  const [waContactName, setWaContactName] = useState('');
  const [waCollegeName, setWaCollegeName] = useState('');
  const [waTemplate, setWaTemplate] = useState<'session_pitch' | 'follow_up' | 'confirmation'>('session_pitch');

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      if (typeFilter !== 'ALL' && a.type !== typeFilter) return false;

      const isDueToday = a.due_date === todayStr;
      const isOverdue = a.due_date && a.due_date < todayStr;

      if (filterStatus === 'pending') return !a.completed;
      if (filterStatus === 'due_today') return !a.completed && isDueToday;
      if (filterStatus === 'overdue') return !a.completed && isOverdue;
      if (filterStatus === 'completed') return a.completed;
      return true;
    }).sort((a, b) => {
      // Uncompleted first, then by due date
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (a.due_date || '9999').localeCompare(b.due_date || '9999');
    });
  }, [activities, filterStatus, typeFilter, todayStr]);

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !collegeId) return;

    addActivity({
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      due_date: dueDate || undefined,
      completed: false,
      college_id: collegeId,
      contact_id: contactId || undefined,
      assigned_to_id: assignedToId,
      created_by_id: currentUser.id,
    });

    setModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleFinishCompletion = () => {
    if (!completingTaskId) return;
    toggleActivityCompleted(completingTaskId, outcomeText);
    setOutcomeModalOpen(false);
    setCompletingTaskId(null);
    setOutcomeText('');
  };

  const openWhatsAppHelper = (activity: Activity) => {
    const college = colleges.find((c) => c.id === activity.college_id);
    const contact = contacts.find((con) => con.id === activity.contact_id) || contacts.find((con) => con.college_id === activity.college_id);

    if (contact) {
      setWaPhone(contact.phone);
      setWaContactName(contact.name);
      setWaCollegeName(college?.name || 'the college');
      setWhatsAppModalOpen(true);
    } else {
      window.alert('No contact phone linked to this task. Add a contact first.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-brand-600" /> Tasks, Follow-ups & Activity Log
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep campus touches active with due-date tracking and 1-click WhatsApp & email outreach
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log Activity / Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        {/* Status Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'pending', label: 'Pending Tasks' },
            { id: 'due_today', label: 'Due Today' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'completed', label: 'Completed' },
            { id: 'all', label: 'All History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterStatus === tab.id
                  ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Activity Type selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-500">Activity:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="ALL">All Types</option>
            <option value="Call">Calls</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Email">Emails</option>
            <option value="Meeting">Meetings</option>
            <option value="Task">Tasks</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No tasks found matching current filter.
          </div>
        ) : (
          filteredActivities.map((act) => {
            const linkedCollege = colleges.find((c) => c.id === act.college_id);
            const linkedContact = contacts.find((c) => c.id === act.contact_id);
            const assignedMember = teamMembers.find((m) => m.id === act.assigned_to_id);
            const isDueToday = act.due_date === todayStr;
            const isOverdue = act.due_date && act.due_date < todayStr && !act.completed;

            return (
              <div
                key={act.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  act.completed
                    ? 'bg-slate-50/70 border-slate-200 opacity-75'
                    : isOverdue
                    ? 'bg-rose-50/30 border-rose-200 shadow-xs'
                    : 'bg-white border-slate-200/90 shadow-subtle hover:border-brand-300'
                }`}
              >
                {/* Left check & details */}
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => {
                      if (!act.completed) {
                        setCompletingTaskId(act.id);
                        setOutcomeModalOpen(true);
                      } else {
                        toggleActivityCompleted(act.id);
                      }
                    }}
                    className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${
                      act.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-brand-500 bg-white'
                    }`}
                    title={act.completed ? 'Mark uncompleted' : 'Mark completed with outcome'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          act.type === 'Call'
                            ? 'bg-sky-100 text-sky-800'
                            : act.type === 'WhatsApp'
                            ? 'bg-emerald-100 text-emerald-800'
                            : act.type === 'Email'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {act.type}
                      </span>

                      {act.due_date && (
                        <span
                          className={`text-xs font-bold ${
                            act.completed
                              ? 'text-slate-400'
                              : isOverdue
                              ? 'text-rose-600'
                              : isDueToday
                              ? 'text-amber-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {isOverdue ? `Overdue (${act.due_date})` : isDueToday ? 'Due Today' : `Due: ${act.due_date}`}
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-sm font-bold mt-1 text-slate-900 ${
                        act.completed ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      {act.title}
                    </h3>

                    {act.description && (
                      <p className="text-xs text-slate-600 mt-0.5">{act.description}</p>
                    )}

                    {act.outcome && (
                      <p className="text-xs text-emerald-700 font-semibold mt-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 inline-block">
                        Outcome: {act.outcome}
                      </p>
                    )}

                    {linkedCollege && (
                      <p
                        onClick={() => onOpenCollegeDetail(linkedCollege.id)}
                        className="text-xs text-brand-600 font-semibold hover:underline cursor-pointer mt-1.5 flex items-center gap-1"
                      >
                        <Building className="w-3.5 h-3.5" />
                        {linkedCollege.name}
                        {linkedContact && ` · ${linkedContact.name} (${linkedContact.phone})`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {assignedMember && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold text-[10px] flex items-center justify-center">
                        {assignedMember.name[0]}
                      </div>
                      <span>{assignedMember.name.split(' ')[0]}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    {/* 1-Click WhatsApp helper */}
                    <button
                      onClick={() => openWhatsAppHelper(act)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl border border-emerald-200 transition-colors"
                      title="Open 1-Click WhatsApp Template"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>

                    {/* Delete Task */}
                    <button
                      onClick={() => deleteActivity(act.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Log Activity Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule Outreach Activity or Follow-up"
        subtitle="Log a call, WhatsApp message, email proposal, or internal task"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateActivity} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Activity Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ActivityType)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Call">Phone Call</option>
                <option value="WhatsApp">WhatsApp Outreach</option>
                <option value="Email">Email Communication</option>
                <option value="Meeting">Meeting with Decision-Maker</option>
                <option value="Task">Task / Follow-up</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
              </input>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Follow up with Placement Director on approved dates"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Linked College *</label>
            <select
              value={collegeId}
              onChange={(e) => {
                setCollegeId(e.target.value);
                setContactId('');
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Owner</label>
            <select
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Talking points, links to brochure..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md"
            >
              Save Activity
            </button>
          </div>
        </form>
      </Modal>

      {/* Outcome Prompt Modal */}
      <Modal
        isOpen={outcomeModalOpen}
        onClose={() => setOutcomeModalOpen(false)}
        title="Record Activity Outcome"
        subtitle="What was the result of this call, meeting, or touchpoint?"
        maxWidth="md"
      >
        <div className="space-y-4">
          <textarea
            rows={3}
            value={outcomeText}
            onChange={(e) => setOutcomeText(e.target.value)}
            placeholder="e.g. Dean approved session for 200 students. Moving stage to Approved."
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setOutcomeModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Skip
            </button>
            <button
              onClick={handleFinishCompletion}
              className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
            >
              Mark Completed
            </button>
          </div>
        </div>
      </Modal>

      {/* WhatsApp One-Click Outreach Modal */}
      <Modal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        title="1-Click WhatsApp Outreach"
        subtitle={`Compose message for ${waContactName} (${waCollegeName})`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Message Template</label>
            <div className="space-y-2">
              {[
                { id: 'session_pitch', label: 'Campus Session Pitch (AI & Automation intro)' },
                { id: 'follow_up', label: 'Follow-up on Previous Call / Proposal' },
                { id: 'confirmation', label: 'Session Date & AV Setup Confirmation' },
              ].map((tmpl) => (
                <label
                  key={tmpl.id}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-semibold ${
                    waTemplate === tmpl.id
                      ? 'bg-brand-50 border-brand-300 text-brand-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="waTemplate"
                    checked={waTemplate === tmpl.id}
                    onChange={() => setWaTemplate(tmpl.id as any)}
                  />
                  <span>{tmpl.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setWhatsAppModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <a
              href={generateWhatsAppLink(waPhone, waContactName, waCollegeName, waTemplate)}
              target="_blank"
              rel="noreferrer"
              onClick={() => setWhatsAppModalOpen(false)}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
            >
              <Send className="w-4 h-4" /> Open WhatsApp
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
};
