import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { CalendarEvent, EventParticipant } from '../../types/crm';
import { Modal } from '../common/Modal';
import { Plus, X, Users, User, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: CalendarEvent | null;
  defaultDate?: string;
  defaultCollegeId?: string;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  defaultDate,
  defaultCollegeId,
}) => {
  const {
    addEvent,
    updateEvent,
    colleges,
    contacts,
    teamMembers,
    currentUser,
    integrations,
  } = useCRM();

  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<CalendarEvent['event_type']>('Meeting');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [venue, setVenue] = useState('');
  const [collegeId, setCollegeId] = useState(defaultCollegeId || '');
  const [contactId, setContactId] = useState('');
  const [ownerId, setOwnerId] = useState(currentUser.id);
  const [notes, setNotes] = useState('');
  const [participants, setParticipants] = useState<EventParticipant[]>([]);

  // New participant input
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [isTeamMember, setIsTeamMember] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setEventType(eventToEdit.event_type);
      const [d, tStart] = eventToEdit.start_time.split('T');
      setDate(d);
      setStartTime(tStart?.slice(0, 5) || '10:00');
      const [, tEnd] = eventToEdit.end_time.split('T');
      setEndTime(tEnd?.slice(0, 5) || '11:00');
      setVenue(eventToEdit.venue || '');
      setCollegeId(eventToEdit.college_id || '');
      setContactId(eventToEdit.contact_id || '');
      setOwnerId(eventToEdit.owner_id);
      setNotes(eventToEdit.notes || '');
      setParticipants(eventToEdit.participants || []);
    } else {
      setTitle('');
      setEventType('Meeting');
      const today = defaultDate || new Date().toISOString().split('T')[0];
      setDate(today);
      setStartTime('10:00');
      setEndTime('11:00');
      setVenue('Campus Seminar Hall / Google Meet');
      setCollegeId(defaultCollegeId || '');
      setContactId('');
      setOwnerId(currentUser.id);
      setNotes('');
      setParticipants([
        {
          name: currentUser.name,
          email: currentUser.email,
          is_team_member: true,
          team_member_id: currentUser.id,
        },
      ]);
    }
  }, [eventToEdit, defaultDate, defaultCollegeId, isOpen, currentUser]);

  const availableContacts = collegeId ? contacts.filter((c) => c.college_id === collegeId) : [];

  const handleAddParticipant = () => {
    if (!newParticipantName.trim()) return;
    setParticipants((prev) => [
      ...prev,
      {
        name: newParticipantName.trim(),
        email: newParticipantEmail.trim() || undefined,
        is_team_member: isTeamMember,
      },
    ]);
    setNewParticipantName('');
    setNewParticipantEmail('');
    setIsTeamMember(false);
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;

    if (eventToEdit) {
      updateEvent(eventToEdit.id, {
        title: title.trim(),
        event_type: eventType,
        start_time: startDateTime,
        end_time: endDateTime,
        venue: venue.trim() || undefined,
        college_id: collegeId || undefined,
        contact_id: contactId || undefined,
        owner_id: ownerId,
        participants,
        notes: notes.trim() || undefined,
      });
    } else {
      addEvent({
        title: title.trim(),
        event_type: eventType,
        start_time: startDateTime,
        end_time: endDateTime,
        venue: venue.trim() || undefined,
        college_id: collegeId || undefined,
        contact_id: contactId || undefined,
        owner_id: ownerId,
        participants,
        synced_to_google: integrations.google_calendar_connected,
        notes: notes.trim() || undefined,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={eventToEdit ? 'Edit Calendar Event' : 'Schedule Operational Event'}
      subtitle="Create meetings, campus sessions, calls, or reminders with team & external guests"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Campus Awareness Session or Dean Briefing"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as CalendarEvent['event_type'])}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="Campus Session">Campus Session</option>
              <option value="Meeting">Meeting</option>
              <option value="Call">Call</option>
              <option value="Reminder">Reminder</option>
              <option value="Task">Task</option>
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {/* Venue / Location */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Venue / Conference Link
          </label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="e.g. Auditorium Hall, PSG Tech or Google Meet link"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>

        {/* Linked College & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Linked College</label>
            <select
              value={collegeId}
              onChange={(e) => {
                setCollegeId(e.target.value);
                setContactId('');
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">-- None (Internal Activity) --</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Linked Contact</label>
            <select
              value={contactId}
              disabled={!collegeId}
              onChange={(e) => setContactId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-50"
            >
              <option value="">-- Select Contact --</option>
              {availableContacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.designation})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assigned Owner */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Assigned Team Member (Owner)
          </label>
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
          >
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>
        </div>

        {/* Named Participants (Team Members + External Friends / Guests) */}
        <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand-600" />
              Named Participants & External Guests
            </span>
            <span className="text-[11px] text-slate-400">Teammates, Referrers or Faculty</span>
          </div>

          {/* Current participants list */}
          <div className="flex flex-wrap gap-2">
            {participants.map((p, idx) => (
              <div
                key={idx}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                  p.is_team_member
                    ? 'bg-brand-50 border-brand-200 text-brand-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <span>{p.name}</span>
                <span className="text-[10px] opacity-70">
                  ({p.is_team_member ? 'Team' : 'External Guest'})
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveParticipant(idx)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Add participant inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60">
            <input
              type="text"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              placeholder="Participant name"
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
            />
            <input
              type="email"
              value={newParticipantEmail}
              onChange={(e) => setNewParticipantEmail(e.target.value)}
              placeholder="Optional email"
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
            />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTeamMember}
                  onChange={(e) => setIsTeamMember(e.target.checked)}
                  className="rounded text-brand-600"
                />
                Is Team
              </label>
              <button
                type="button"
                onClick={handleAddParticipant}
                className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 ml-auto"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Event Agenda & Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Agenda points, speaker equipment requirements, briefing notes..."
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md"
          >
            {eventToEdit ? 'Save Event' : 'Schedule Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
