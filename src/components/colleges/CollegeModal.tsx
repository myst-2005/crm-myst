import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { College, InstitutionType, Priority, PipelineStage } from '../../types/crm';
import { Modal } from '../common/Modal';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  collegeToEdit?: College | null;
}

const INSTITUTION_TYPES: InstitutionType[] = [
  'Engineering',
  'Arts & Science',
  'Polytechnic',
  'University / Autonomous',
  'Management / Business',
  'Other',
];

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

const PIPELINE_STAGES: PipelineStage[] = [
  'New', 'Contacted', 'Meeting Scheduled', 'Session Proposed',
  'Approved', 'Session Scheduled', 'Session Completed',
  'Course Proposed', 'Converted', 'Lost', 'On Hold',
];

const inputCls =
  'w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all';
const labelCls = 'block text-xs font-semibold text-slate-500 mb-1';

export const CollegeModal: React.FC<CollegeModalProps> = ({ isOpen, onClose, collegeToEdit }) => {
  const { addCollege, updateCollege, teamMembers, leadSources, currentUser } = useCRM();

  // Core fields
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [institutionType, setInstitutionType] = useState<InstitutionType>('Engineering');
  const [pocName, setPocName] = useState('');
  const [pocPhone, setPocPhone] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');

  // Extra fields (collapsed by default)
  const [showMore, setShowMore] = useState(false);
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [departments, setDepartments] = useState('');
  const [estimatedStrength, setEstimatedStrength] = useState<number>(2000);
  const [stage, setStage] = useState<PipelineStage>('New');
  const [ownerId, setOwnerId] = useState(currentUser.id);
  const [leadSource, setLeadSource] = useState('Manual');
  const [referrerName, setReferrerName] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [notes, setNotes] = useState('');
  const [lostReason, setLostReason] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (collegeToEdit) {
      setName(collegeToEdit.name);
      setDistrict(collegeToEdit.district);
      setInstitutionType(collegeToEdit.institution_type);
      setPocName(collegeToEdit.poc_name || '');
      setPocPhone(collegeToEdit.poc_phone || '');
      setPriority(collegeToEdit.priority);
      setLocation(collegeToEdit.location);
      setWebsite(collegeToEdit.website || '');
      setDepartments(collegeToEdit.departments.join(', '));
      setEstimatedStrength(collegeToEdit.estimated_strength);
      setStage(collegeToEdit.stage);
      setOwnerId(collegeToEdit.owner_id);
      setLeadSource(collegeToEdit.lead_source);
      setReferrerName(collegeToEdit.referrer_name || '');
      setNextFollowUpDate(collegeToEdit.next_follow_up_date || '');
      setNextAction(collegeToEdit.next_action || '');
      setNotes(collegeToEdit.notes || '');
      setLostReason(collegeToEdit.lost_reason || '');
      setShowMore(true); // show all when editing
    } else {
      setName('');
      setDistrict('');
      setInstitutionType('Engineering');
      setPocName('');
      setPocPhone('');
      setPriority('Medium');
      setLocation('');
      setWebsite('');
      setDepartments('');
      setEstimatedStrength(2000);
      setStage('New');
      setOwnerId(currentUser.id);
      setLeadSource('Manual');
      setReferrerName('');
      setNextFollowUpDate(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
      setNextAction('');
      setNotes('');
      setLostReason('');
      setShowMore(false);
    }
    setErrorMessage('');
  }, [collegeToEdit, isOpen, currentUser.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErrorMessage('College name is required.'); return; }
    if (!district.trim()) { setErrorMessage('District / City is required.'); return; }
    setLoading(true);

    const deptArray = departments.split(',').map((d) => d.trim()).filter(Boolean);

    const payload = {
      name: name.trim(),
      institution_type: institutionType,
      location: location.trim() || district.trim(),
      district: district.trim(),
      website: website.trim() || undefined,
      departments: deptArray,
      estimated_strength: Number(estimatedStrength),
      priority,
      stage,
      owner_id: ownerId,
      lead_source: leadSource,
      referrer_name: leadSource === 'Referral' ? referrerName.trim() : undefined,
      poc_name: pocName.trim() || undefined,
      poc_phone: pocPhone.trim() || undefined,
      next_follow_up_date: nextFollowUpDate || undefined,
      next_action: nextAction.trim() || undefined,
      notes: notes.trim() || undefined,
      lost_reason: stage === 'Lost' ? lostReason.trim() : undefined,
    };

    if (collegeToEdit) {
      await updateCollege(collegeToEdit.id, payload);
      onClose();
    } else {
      const res = await addCollege(payload);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to add college.');
      }
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={collegeToEdit ? 'Edit Lead' : 'Add College Lead'}
      subtitle={collegeToEdit ? 'Update lead details' : 'Quick capture — fill required fields to get started'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">

        {errorMessage && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* College Name */}
        <div>
          <label className={labelCls}>College / Institution Name *</label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Anna University, PSG Tech"
            className={inputCls}
          />
        </div>

        {/* District + Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>District / City *</label>
            <input
              type="text"
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Chennai, Coimbatore"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Type</label>
            <select value={institutionType} onChange={(e) => setInstitutionType(e.target.value as InstitutionType)} className={inputCls}>
              {INSTITUTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* POC */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>POC Name</label>
            <input
              type="text"
              value={pocName}
              onChange={(e) => setPocName(e.target.value)}
              placeholder="e.g. Dr. Ramesh"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>POC Phone</label>
            <input
              type="tel"
              value={pocPhone}
              onChange={(e) => setPocPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className={inputCls}
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className={labelCls}>Priority</label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  priority === p
                    ? p === 'High'
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : p === 'Medium'
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'bg-slate-400 border-slate-400 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* More details toggle */}
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors pt-1"
        >
          {showMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {showMore ? 'Hide details' : 'More details'}
        </button>

        {showMore && (
          <div className="space-y-3 pt-1 border-t border-slate-100">

            {/* Location */}
            <div>
              <label className={labelCls}>Campus Address</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Whitefield, Bengaluru" className={inputCls} />
            </div>

            {/* Website + Departments */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Website</label>
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Departments</label>
                <input type="text" value={departments} onChange={(e) => setDepartments(e.target.value)}
                  placeholder="CSE, AI & ML, ECE" className={inputCls} />
              </div>
            </div>

            {/* Stage + Owner */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Pipeline Stage</label>
                <select value={stage} onChange={(e) => setStage(e.target.value as PipelineStage)} className={inputCls}>
                  {PIPELINE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Owner</label>
                <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)} className={inputCls}>
                  {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>

            {/* Lead Source */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Lead Source</label>
                <select value={leadSource} onChange={(e) => setLeadSource(e.target.value)} className={inputCls}>
                  {leadSources.map((ls) => <option key={ls.id} value={ls.name}>{ls.name}</option>)}
                </select>
              </div>
              {leadSource === 'Referral' && (
                <div>
                  <label className={labelCls}>Referrer Name *</label>
                  <input type="text" required value={referrerName} onChange={(e) => setReferrerName(e.target.value)}
                    placeholder="e.g. Dr. Karthik" className={inputCls} />
                </div>
              )}
              <div>
                <label className={labelCls}>Est. Students</label>
                <input type="number" value={estimatedStrength} onChange={(e) => setEstimatedStrength(Number(e.target.value))}
                  placeholder="2000" className={inputCls} />
              </div>
            </div>

            {/* Follow-up + Next Action */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Follow-up Date</label>
                <input type="date" value={nextFollowUpDate} onChange={(e) => setNextFollowUpDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Next Action</label>
                <input type="text" value={nextAction} onChange={(e) => setNextAction(e.target.value)}
                  placeholder="e.g. Send WhatsApp" className={inputCls} />
              </div>
            </div>

            {/* Lost reason */}
            {stage === 'Lost' && (
              <div>
                <label className="block text-xs font-semibold text-rose-600 mb-1">Lost Reason *</label>
                <input type="text" required value={lostReason} onChange={(e) => setLostReason(e.target.value)}
                  placeholder="e.g. No response, Budget issues" className={`${inputCls} border-rose-200 bg-rose-50`} />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className={labelCls}>Notes</label>
              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Any context about the lead…"
                className={inputCls} />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="px-5 py-2 text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-60">
            {loading ? 'Saving…' : collegeToEdit ? 'Save Changes' : 'Add Lead'}
          </button>
        </div>

      </form>
    </Modal>
  );
};
