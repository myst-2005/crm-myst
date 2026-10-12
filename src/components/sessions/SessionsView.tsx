import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { CampusSession, TechnologyTrack, SessionApprovalStatus } from '../../types/crm';
import { TrackBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Presentation,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Star,
  CheckCircle2,
  Building,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const TRACKS: TechnologyTrack[] = [
  'AI & Automation',
  'AI Agents',
  'No-code & Vibe Coding',
  'Data Analytics',
];

export const SessionsView: React.FC<{
  onOpenCollegeDetail: (id: string) => void;
}> = ({ onOpenCollegeDetail }) => {
  const {
    sessions,
    colleges,
    teamMembers,
    addSession,
    updateSession,
    completeSessionOutcome,
    currentUser,
  } = useCRM();

  // Filters
  const [trackFilter, setTrackFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // New Session Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCollegeId, setSelectedCollegeId] = useState(colleges[0]?.id || '');
  const [title, setTitle] = useState('');
  const [track, setTrack] = useState<TechnologyTrack>('AI Agents');
  const [coordinatorName, setCoordinatorName] = useState('');
  const [proposedDate, setProposedDate] = useState(new Date().toISOString().split('T')[0]);
  const [confirmedDate, setConfirmedDate] = useState('');
  const [time, setTime] = useState('10:00 AM - 12:30 PM');
  const [venue, setVenue] = useState('Campus Auditorium / Seminar Hall');
  const [expectedAttendance, setExpectedAttendance] = useState<number>(200);
  const [approvalStatus, setApprovalStatus] = useState<SessionApprovalStatus>('Proposed');
  const [sessionNotes, setSessionNotes] = useState('');

  // Post Session Outcome Wizard Modal
  const [wizardOpen, setWizardOpen] = useState(false);
  const [targetSessionId, setTargetSessionId] = useState<string | null>(null);
  const [actualAttendance, setActualAttendance] = useState<number>(200);
  const [feedbackScore, setFeedbackScore] = useState<number>(4.8);
  const [interestedCount, setInterestedCount] = useState<number>(45);
  const [postNotes, setPostNotes] = useState('');
  const [nextActionText, setNextActionText] = useState('Distribute course registrations & WhatsApp group link');

  const filteredSessions = sessions.filter((s) => {
    if (trackFilter !== 'ALL' && s.track !== trackFilter) return false;
    if (statusFilter !== 'ALL' && s.approval_status !== statusFilter) return false;
    return true;
  });

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedCollegeId) return;

    addSession({
      college_id: selectedCollegeId,
      title: title.trim(),
      track,
      coordinator_name: coordinatorName.trim() || 'HOD / Faculty Coordinator',
      proposed_date: proposedDate,
      confirmed_date: confirmedDate || undefined,
      time: time.trim() || undefined,
      venue: venue.trim() || undefined,
      team_member_ids: [currentUser.id],
      approval_status: approvalStatus,
      expected_attendance: Number(expectedAttendance),
      notes: sessionNotes.trim() || undefined,
      post_session_completed: false,
    });

    setModalOpen(false);
    setTitle('');
  };

  const handleOpenOutcomeWizard = (session: CampusSession) => {
    setTargetSessionId(session.id);
    setActualAttendance(session.actual_attendance || session.expected_attendance || 150);
    setFeedbackScore(session.feedback_score || 4.8);
    setInterestedCount(session.interested_students_count || 40);
    setPostNotes(session.notes || '');
    setNextActionText(session.next_action || 'Share course registration links with high-intent attendees');
    setWizardOpen(true);
  };

  const handleSaveOutcome = () => {
    if (!targetSessionId) return;
    completeSessionOutcome(
      targetSessionId,
      Number(actualAttendance),
      Number(feedbackScore),
      postNotes,
      Number(interestedCount),
      nextActionText
    );
    setWizardOpen(false);
    setTargetSessionId(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Presentation className="w-5 h-5 text-brand-600" /> Campus Awareness Sessions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Free, customised, offline awareness sessions across 4 frontier technology tracks
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('Autonomous AI Agents & Real-World Automation');
            setCoordinatorName('Placement Cell');
            setModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Propose Campus Session</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-500">Track:</span>
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="ALL">All Tracks</option>
            {TRACKS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Proposed">Proposed</option>
            <option value="Approved">Approved</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSessions.map((session) => {
          const linkedCollege = colleges.find((c) => c.id === session.college_id);

          return (
            <div
              key={session.id}
              className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle hover:shadow-premium hover:border-brand-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <TrackBadge track={session.track} />
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      session.approval_status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : session.approval_status === 'Scheduled'
                        ? 'bg-brand-50 text-brand-700 border border-brand-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {session.approval_status}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mt-2.5">{session.title}</h3>

                {linkedCollege && (
                  <p
                    onClick={() => onOpenCollegeDetail(linkedCollege.id)}
                    className="text-xs font-bold text-brand-600 hover:underline cursor-pointer mt-1 flex items-center gap-1"
                  >
                    <Building className="w-3.5 h-3.5" />
                    {linkedCollege.name} ({linkedCollege.district})
                  </p>
                )}

                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>
                      Coordinator: <strong>{session.coordinator_name}</strong>
                    </span>
                    <span>
                      Date:{' '}
                      <strong>{session.confirmed_date || session.proposed_date}</strong>
                    </span>
                  </div>
                  {session.venue && (
                    <p className="flex items-center gap-1 truncate text-slate-500">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {session.venue}
                    </p>
                  )}
                </div>

                {/* Post-Session Results if Completed */}
                {session.approval_status === 'Completed' && (
                  <div className="mt-3 p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-emerald-800">
                      <span>Attendees: {session.actual_attendance || 0} students</span>
                      {session.feedback_score && (
                        <span className="text-amber-700 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {session.feedback_score}/5
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-slate-700 font-semibold">
                      <span>Leads: {session.interested_students_count || 0} interested</span>
                      <span className="text-[11px] text-emerald-700">Outcome recorded ✓</span>
                    </div>
                    {session.next_action && (
                      <p className="text-[11px] text-slate-600 pt-1 border-t border-emerald-200/50">
                        Next: {session.next_action}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  Expected: {session.expected_attendance}
                </span>

                {session.approval_status !== 'Completed' ? (
                  <button
                    onClick={() => handleOpenOutcomeWizard(session)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete Session & Log Outcome</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenOutcomeWizard(session)}
                    className="text-xs font-bold text-brand-600 hover:underline"
                  >
                    Edit Post-Session Outcome →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Propose Campus Session Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Propose Campus Awareness Session"
        subtitle="Offer a complimentary hands-on session on AI, Agents, or Data Analytics"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSession} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target College *</label>
            <select
              value={selectedCollegeId}
              onChange={(e) => setSelectedCollegeId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.district})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Session Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Autonomous AI Agents & Hands-on Workflows"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Technology Track *
              </label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value as TechnologyTrack)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                {TRACKS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Proposed Date *</label>
              <input
                type="date"
                required
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirmed Date</label>
              <input
                type="date"
                value={confirmedDate}
                onChange={(e) => setConfirmedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value as SessionApprovalStatus)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Proposed">Proposed</option>
                <option value="Approved">Approved</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                College Coordinator / HOD
              </label>
              <input
                type="text"
                value={coordinatorName}
                onChange={(e) => setCoordinatorName(e.target.value)}
                placeholder="Dr. R. Sundaram (Dean)"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Expected Student Attendance
              </label>
              <input
                type="number"
                value={expectedAttendance}
                onChange={(e) => setExpectedAttendance(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Venue / Auditorium</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Dr. APJ Abdul Kalam Auditorium, 3rd Floor"
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
              Propose Session
            </button>
          </div>
        </form>
      </Modal>

      {/* Post-Session Outcome & Follow-Up Wizard Modal */}
      <Modal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        title="Post-Session Outcome & Attendance Wizard"
        subtitle="Prompt to capture student attendance, feedback score, interested leads, and follow-up action"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-900 leading-relaxed">
            Completing a session automatically advances the linked college stage to{' '}
            <strong>Session Completed</strong> and generates a follow-up reminder for your team.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Actual Attendance (Students) *
              </label>
              <input
                type="number"
                required
                value={actualAttendance}
                onChange={(e) => setActualAttendance(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Average Student Feedback (1 to 5) *
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                required
                value={feedbackScore}
                onChange={(e) => setFeedbackScore(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Interested Students Count (High Intent Leads) *
            </label>
            <input
              type="number"
              value={interestedCount}
              onChange={(e) => setInterestedCount(Number(e.target.value))}
              placeholder="e.g. 65 students opted in for hands-on masterclass"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Immediate Next Course-Related Action *
            </label>
            <input
              type="text"
              required
              value={nextActionText}
              onChange={(e) => setNextActionText(e.target.value)}
              placeholder="e.g. Send registration discount link to 65 leads within 48 hours"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Key Insights & Feedback Notes
            </label>
            <textarea
              rows={2}
              value={postNotes}
              onChange={(e) => setPostNotes(e.target.value)}
              placeholder="Highlight standout questions, college dean response, student project demos..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setWizardOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveOutcome}
              className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
            >
              Confirm Outcome & Create Follow-up
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
