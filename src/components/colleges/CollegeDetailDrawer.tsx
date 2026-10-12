import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Drawer } from '../common/Drawer';
import {
  PriorityBadge,
  StageBadge,
  TrackBadge,
  PaymentBadge,
} from '../common/Badge';
import {
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Users,
  Presentation,
  BookOpen,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Clock,
  CheckCircle,
  Building,
  MapPin,
  Globe,
  Share2,
} from 'lucide-react';
import { generateWhatsAppLink, generateMailToLink } from '../../lib/storage';
import { PipelineStage } from '../../types/crm';

interface CollegeDetailDrawerProps {
  collegeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (collegeId: string) => void;
  onOpenNewContact: (collegeId: string) => void;
  onOpenNewSession: (collegeId: string) => void;
  onOpenNewActivity: (collegeId: string) => void;
  onOpenNewStudent: (collegeId: string) => void;
}

type TabKey = 'overview' | 'contacts' | 'sessions' | 'students' | 'history' | 'activities';

export const CollegeDetailDrawer: React.FC<CollegeDetailDrawerProps> = ({
  collegeId,
  isOpen,
  onClose,
  onEdit,
  onOpenNewContact,
  onOpenNewSession,
  onOpenNewActivity,
  onOpenNewStudent,
}) => {
  const {
    colleges,
    contacts,
    sessions,
    students,
    activities,
    teamMembers,
    stageHistory,
    moveCollegeStage,
    deleteCollege,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const college = colleges.find((c) => c.id === collegeId);
  if (!college) return null;

  const owner = teamMembers.find((m) => m.id === college.owner_id);
  const collegeContacts = contacts.filter((c) => c.college_id === college.id);
  const collegeSessions = sessions.filter((s) => s.college_id === college.id);
  const collegeStudents = students.filter((s) => s.college_id === college.id);
  const collegeActivities = activities.filter((a) => a.college_id === college.id);
  const collegeHistory = stageHistory.filter((h) => h.college_id === college.id);

  const primaryContact = collegeContacts[0];

  const paidEnrolments = collegeStudents.filter(
    (s) => s.lead_stage === 'Enrolled' && s.payment_status === 'Paid'
  ).length;
  const totalRevenue = collegeStudents.reduce(
    (acc, s) => acc + (s.payment_status === 'Paid' ? s.agreed_fee : 0),
    0
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={college.name}
      subtitle={`${college.institution_type} · ${college.district}`}
      width="2xl"
    >
      <div className="space-y-6">
        {/* Top Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex flex-wrap items-center gap-2">
            <StageBadge stage={college.stage} />
            <PriorityBadge priority={college.priority} />
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              Source: {college.lead_source}
              {college.referrer_name && ` (${college.referrer_name})`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(college.id)}
              className="p-2 text-slate-600 hover:text-brand-600 hover:bg-white rounded-xl border border-slate-200 shadow-xs transition-all"
              title="Edit college details"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete college "${college.name}"?`)) {
                  deleteCollege(college.id);
                  onClose();
                }
              }}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent transition-all"
              title="Delete college record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Outreach Action Bar (1-Click WhatsApp & Email pitch) */}
        {primaryContact && (
          <div className="p-3.5 bg-gradient-to-r from-brand-50/70 via-purple-50/70 to-indigo-50/70 border border-brand-200/70 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                Primary Contact
              </span>
              <p className="text-xs font-bold text-slate-900 truncate">
                {primaryContact.name} ({primaryContact.designation})
              </p>
              <p className="text-[11px] text-slate-500">{primaryContact.phone}</p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={generateWhatsAppLink(
                  primaryContact.phone,
                  primaryContact.name,
                  college.name,
                  'session_pitch'
                )}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Pitch
              </a>

              {primaryContact.email && (
                <a
                  href={generateMailToLink(
                    primaryContact.email,
                    primaryContact.name,
                    college.name,
                    'session_proposal'
                  )}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" /> Email Proposal
                </a>
              )}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'contacts', label: `Contacts (${collegeContacts.length})` },
            { key: 'sessions', label: `Sessions (${collegeSessions.length})` },
            { key: 'students', label: `Students (${collegeStudents.length})` },
            { key: 'activities', label: `Activity (${collegeActivities.length})` },
            { key: 'history', label: 'Stage Audit' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`px-3.5 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Est. Strength</span>
                <p className="text-base font-extrabold text-slate-800 mt-0.5">
                  {college.estimated_strength.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Sessions</span>
                <p className="text-base font-extrabold text-slate-800 mt-0.5">
                  {collegeSessions.length}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Paid Enrolments</span>
                <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                  {paidEnrolments}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Revenue</span>
                <p className="text-base font-extrabold text-slate-800 mt-0.5">
                  ₹{totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Next Action Box */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Immediate Next Action
              </span>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {college.next_action || 'No next action logged.'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                <span>
                  Due Date:{' '}
                  <strong className="text-slate-800">
                    {college.next_follow_up_date || 'Not set'}
                  </strong>
                </span>
                <span>
                  Owner: <strong className="text-slate-800">{owner?.name || 'Unassigned'}</strong>
                </span>
              </div>
            </div>

            {/* Institutional Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Campus Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2 p-2.5 bg-white rounded-xl border border-slate-200/70">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700">Location:</span>
                    <p className="text-slate-600 mt-0.5">{college.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-white rounded-xl border border-slate-200/70">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700">Website:</span>
                    <p className="text-slate-600 mt-0.5 truncate">
                      {college.website ? (
                        <a
                          href={college.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-600 hover:underline flex items-center gap-1"
                        >
                          {college.website} <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        'None'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {college.departments && college.departments.length > 0 && (
                <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                  <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Target Departments:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {college.departments.map((d, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-md font-medium"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {college.notes && (
                <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                  <span className="text-xs font-semibold text-slate-700 block mb-1">
                    Internal Notes:
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {college.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Action Button Grid */}
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={() => onOpenNewSession(college.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 transition-colors"
              >
                <Presentation className="w-3.5 h-3.5" /> Propose Campus Session
              </button>
              <button
                onClick={() => onOpenNewActivity(college.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Log Task / Call
              </button>
              <button
                onClick={() => onOpenNewStudent(college.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-colors"
              >
                <Users className="w-3.5 h-3.5" /> Add Student
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: CONTACTS */}
        {activeTab === 'contacts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Department Heads & Decision Makers
              </h4>
              <button
                onClick={() => onOpenNewContact(college.id)}
                className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800"
              >
                <Plus className="w-3.5 h-3.5" /> Add Contact
              </button>
            </div>

            {collegeContacts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
                No contacts added yet. Add placement directors or faculty advisors.
              </div>
            ) : (
              <div className="space-y-3">
                {collegeContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-slate-900">{contact.name}</h5>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {contact.preferred_method}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-brand-700 mt-0.5">
                        {contact.designation} · {contact.department}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-600">
                        <span>📞 {contact.phone}</span>
                        {contact.email && <span>✉️ {contact.email}</span>}
                      </div>
                      {contact.notes && (
                        <p className="text-[11px] text-slate-500 mt-1.5 italic">
                          "{contact.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <a
                        href={generateWhatsAppLink(
                          contact.phone,
                          contact.name,
                          college.name,
                          'follow_up'
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl border border-emerald-200 transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="p-2 text-brand-600 hover:bg-brand-50 rounded-xl border border-brand-200 transition-colors"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      <a
                        href={`tel:${contact.phone}`}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                        title="Call Phone"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SESSIONS */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Awareness Sessions
              </h4>
              <button
                onClick={() => onOpenNewSession(college.id)}
                className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800"
              >
                <Plus className="w-3.5 h-3.5" /> Propose Session
              </button>
            </div>

            {collegeSessions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
                No campus awareness sessions recorded for this college.
              </div>
            ) : (
              <div className="space-y-3">
                {collegeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <TrackBadge track={session.track} />
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                        {session.approval_status}
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 mt-2">{session.title}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Coordinator: {session.coordinator_name} · Date:{' '}
                      {session.confirmed_date || session.proposed_date}
                    </p>

                    {session.actual_attendance !== undefined && (
                      <div className="mt-3 p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span>Attendance: {session.actual_attendance} students</span>
                        {session.feedback_score && (
                          <span className="text-amber-600">★ {session.feedback_score}/5 Rating</span>
                        )}
                        <span className="text-emerald-600">
                          {session.interested_students_count || 0} Student Leads
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STUDENTS */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Registered Students & Course Conversions
              </h4>
              <button
                onClick={() => onOpenNewStudent(college.id)}
                className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800"
              >
                <Plus className="w-3.5 h-3.5" /> Add Student
              </button>
            </div>

            {collegeStudents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
                No students enrolled from this college yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {collegeStudents.map((stu) => (
                  <div
                    key={stu.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{stu.name}</h5>
                      <p className="text-[11px] text-slate-500">{stu.email} · {stu.phone}</p>
                    </div>
                    <div className="text-right">
                      <PaymentBadge status={stu.payment_status} />
                      <span className="text-xs font-extrabold text-slate-900 block mt-1">
                        ₹{stu.agreed_fee.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ACTIVITIES */}
        {activeTab === 'activities' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Activity Timeline
              </h4>
              <button
                onClick={() => onOpenNewActivity(college.id)}
                className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800"
              >
                <Plus className="w-3.5 h-3.5" /> Log Activity
              </button>
            </div>

            {collegeActivities.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
                No interactions logged yet.
              </div>
            ) : (
              <div className="space-y-3">
                {collegeActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-start gap-3"
                  >
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-brand-50 text-brand-700">
                      {act.type}
                    </span>
                    <div className="flex-1">
                      <h5 className="text-xs font-bold text-slate-900">{act.title}</h5>
                      {act.description && (
                        <p className="text-xs text-slate-600 mt-0.5">{act.description}</p>
                      )}
                      {act.outcome && (
                        <p className="text-xs text-emerald-700 font-medium mt-1">
                          Outcome: {act.outcome}
                        </p>
                      )}
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {new Date(act.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: STAGE AUDIT HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pipeline Stage Transitions
            </h4>

            {collegeHistory.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
                Current stage: {college.stage}
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {collegeHistory.map((entry) => {
                  const user = teamMembers.find((m) => m.id === entry.user_id);
                  return (
                    <div key={entry.id} className="relative">
                      <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-brand-500 border-2 border-white ring-2 ring-brand-100" />
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                          <span>{entry.from_stage}</span>
                          <span>→</span>
                          <span className="text-brand-600">{entry.to_stage}</span>
                        </div>
                        {entry.reason && (
                          <p className="text-xs text-slate-600 mt-1 italic">
                            Reason: {entry.reason}
                          </p>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Changed by {user?.name || 'User'} on{' '}
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
};
