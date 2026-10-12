import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { PipelineStage, College, Priority } from '../../types/crm';
import { PriorityBadge, StageBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Kanban,
  List,
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PIPELINE_COLUMNS: { stage: PipelineStage; label: string; color: string; desc: string }[] = [
  { stage: 'New', label: '01 New', color: 'border-slate-300 bg-slate-50', desc: 'No outreach yet' },
  { stage: 'Contacted', label: '02 Contacted', color: 'border-sky-300 bg-sky-50/40', desc: 'First touch logged' },
  { stage: 'Meeting Scheduled', label: '03 Meeting Scheduled', color: 'border-indigo-300 bg-indigo-50/40', desc: 'Decision-maker booked' },
  { stage: 'Session Proposed', label: '04 Session Proposed', color: 'border-purple-300 bg-purple-50/40', desc: 'Deck / proposal shared' },
  { stage: 'Approved', label: '05 Approved', color: 'border-amber-300 bg-amber-50/40', desc: 'College confirms session' },
  { stage: 'Session Scheduled', label: '06 Session Scheduled', color: 'border-brand-300 bg-brand-50/40', desc: 'Venue & team confirmed' },
  { stage: 'Session Completed', label: '07 Session Completed', color: 'border-teal-300 bg-teal-50/40', desc: 'Attendance recorded' },
  { stage: 'Course Proposed', label: '08 Course Proposed', color: 'border-violet-300 bg-violet-50/40', desc: 'Student pricing shared' },
  { stage: 'Converted', label: '09 Converted', color: 'border-emerald-300 bg-emerald-50/40', desc: 'Paid student enrolments' },
  { stage: 'Lost', label: '10 Lost / On Hold', color: 'border-rose-300 bg-rose-50/40', desc: 'Closed or postponed' },
];

export const PipelineView: React.FC<{
  onOpenCollegeDetail: (id: string) => void;
}> = ({ onOpenCollegeDetail }) => {
  const { colleges, moveCollegeStage, teamMembers, stageHistory } = useCRM();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [draggedCollegeId, setDraggedCollegeId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);

  // Lost Reason Modal State
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [pendingLostCollegeId, setPendingLostCollegeId] = useState<string | null>(null);
  const [lostReasonCategory, setLostReasonCategory] = useState('No Response');
  const [customLostReason, setCustomLostReason] = useState('');

  // Handle Drag Start
  const handleDragStart = (e: React.DragEvent, collegeId: string) => {
    e.dataTransfer.setData('text/plain', collegeId);
    setDraggedCollegeId(collegeId);
  };

  const handleDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const collegeId = e.dataTransfer.getData('text/plain') || draggedCollegeId;
    if (!collegeId) return;

    if (targetStage === 'Lost') {
      setPendingLostCollegeId(collegeId);
      setLostModalOpen(true);
      return;
    }

    if (targetStage === 'Converted') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // silent fallback
      }
    }

    moveCollegeStage(collegeId, targetStage);
    setDraggedCollegeId(null);
  };

  const handleConfirmLost = () => {
    if (!pendingLostCollegeId) return;
    const finalReason = `${lostReasonCategory}: ${customLostReason || 'Lead marked lost'}`;
    moveCollegeStage(pendingLostCollegeId, 'Lost', finalReason);
    setLostModalOpen(false);
    setPendingLostCollegeId(null);
    setCustomLostReason('');
  };

  const calculateStageAgeing = (college: College) => {
    const stageDate = new Date(college.stage_updated_at || college.created_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - stageDate.getTime()) / (1000 * 3600 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Kanban className="w-5 h-5 text-brand-600" /> Outreach & Conversion Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            10-Stage college journey from initial contact to completed campus session and paid enrolments
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3.5 min-w-[2800px]">
            {PIPELINE_COLUMNS.map((col) => {
              const columnColleges = colleges.filter((c) => {
                if (col.stage === 'Lost') {
                  return c.stage === 'Lost' || c.stage === 'On Hold';
                }
                return c.stage === col.stage;
              });

              const isDropTarget = dragOverStage === col.stage;

              return (
                <div
                  key={col.stage}
                  onDragOver={(e) => handleDragOver(e, col.stage)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.stage)}
                  className={`w-72 shrink-0 rounded-2xl border-2 flex flex-col transition-all ${
                    col.color
                  } ${
                    isDropTarget
                      ? 'border-brand-500 bg-brand-50/70 scale-[1.01] shadow-lg ring-2 ring-brand-300'
                      : 'border-slate-200/80 bg-white/70'
                  }`}
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-slate-200/80 bg-white/90 rounded-t-2xl flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        {col.label}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">{col.desc}</p>
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {columnColleges.length}
                    </span>
                  </div>

                  {/* Cards container */}
                  <div className="p-2.5 flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[380px]">
                    {columnColleges.length === 0 ? (
                      <div className="h-28 flex items-center justify-center text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                        Drop college cards here
                      </div>
                    ) : (
                      columnColleges.map((college) => {
                        const owner = teamMembers.find((m) => m.id === college.owner_id);
                        const ageingDays = calculateStageAgeing(college);
                        const isStalled = ageingDays >= 14 && college.stage !== 'Converted';

                        return (
                          <div
                            key={college.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, college.id)}
                            onClick={() => onOpenCollegeDetail(college.id)}
                            className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-subtle hover:shadow-premium hover:border-brand-300 cursor-grab active:cursor-grabbing transition-all group"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <PriorityBadge priority={college.priority} />
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  isStalled
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                                title={`In this stage for ${ageingDays} days`}
                              >
                                {ageingDays}d in stage
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 mt-2 group-hover:text-brand-700 transition-colors">
                              {college.name}
                            </h4>

                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              {college.district} · {college.institution_type}
                            </p>

                            {/* Next Action Box */}
                            {college.next_action && (
                              <div className="mt-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px]">
                                <span className="text-[9px] uppercase font-bold text-slate-400 block">
                                  Next Action
                                </span>
                                <p className="font-semibold text-slate-700 line-clamp-1">
                                  {college.next_action}
                                </p>
                              </div>
                            )}

                            {/* Reopen Button for Lost/On Hold */}
                            {(college.stage === 'Lost' || college.stage === 'On Hold') && (
                              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] text-rose-600 font-medium truncate max-w-[130px]">
                                  {college.lost_reason || 'Closed'}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveCollegeStage(college.id, 'Contacted', 'Reopened lead');
                                  }}
                                  className="flex items-center gap-1 text-[10px] font-bold text-brand-600 hover:text-brand-800 bg-brand-50 px-2 py-0.5 rounded-md"
                                >
                                  <RotateCcw className="w-3 h-3" /> Reopen
                                </button>
                              </div>
                            )}

                            {/* Card Footer */}
                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                              <div className="flex items-center gap-1">
                                <div className="w-4 h-4 rounded-full bg-brand-100 text-brand-700 text-[9px] font-bold flex items-center justify-center">
                                  {owner ? owner.name[0] : '?'}
                                </div>
                                <span className="text-slate-600 font-medium truncate max-w-[90px]">
                                  {owner ? owner.name.split(' ')[0] : 'None'}
                                </span>
                              </div>
                              <span className="text-brand-600 font-semibold group-hover:underline">
                                View →
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TABLE MODE FOR PIPELINE */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">College</th>
                <th className="py-3 px-3">Current Stage</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Ageing in Stage</th>
                <th className="py-3 px-3">Owner</th>
                <th className="py-3 px-3">Quick Move</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {colleges.map((college) => {
                const owner = teamMembers.find((m) => m.id === college.owner_id);
                const ageing = calculateStageAgeing(college);

                return (
                  <tr
                    key={college.id}
                    onClick={() => onOpenCollegeDetail(college.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900">{college.name}</td>
                    <td className="py-3 px-3">
                      <StageBadge stage={college.stage} />
                    </td>
                    <td className="py-3 px-3">
                      <PriorityBadge priority={college.priority} />
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{ageing} days</td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {owner?.name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={college.stage}
                        onChange={(e) => {
                          const nextStage = e.target.value as PipelineStage;
                          if (nextStage === 'Lost') {
                            setPendingLostCollegeId(college.id);
                            setLostModalOpen(true);
                          } else {
                            moveCollegeStage(college.id, nextStage);
                          }
                        }}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                      >
                        {PIPELINE_COLUMNS.map((col) => (
                          <option key={col.stage} value={col.stage}>
                            {col.stage}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right text-brand-600 font-bold hover:underline">
                      View
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Lost Reason Mandatory Modal */}
      <Modal
        isOpen={lostModalOpen}
        onClose={() => setLostModalOpen(false)}
        title="Reason for Closing Lead"
        subtitle="Mandatory CRM rule: Record why this college relationship was closed or postponed"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lost Category *</label>
            <select
              value={lostReasonCategory}
              onChange={(e) => setLostReasonCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="No Response">No Response after multiple follow-ups</option>
              <option value="Budget / Financial">Budget / Commercial Constraints</option>
              <option value="Internal Curriculum Only">Prefers internal faculty / no external trainers</option>
              <option value="Exam / Timing Conflict">Semester exams / schedule conflict (postponed)</option>
              <option value="Direct Rejection">Direct rejection by Principal / Management</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Specific Notes / Context
            </label>
            <textarea
              rows={3}
              value={customLostReason}
              onChange={(e) => setCustomLostReason(e.target.value)}
              placeholder="e.g. Principal declined offline workshop; suggested following up in next academic year..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setLostModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLost}
              className="px-5 py-2 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
            >
              Confirm Lost / On Hold
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
