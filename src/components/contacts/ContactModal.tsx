import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Contact, PreferredContactMethod } from '../../types/crm';
import { Modal } from '../common/Modal';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  collegeId?: string;
  contactToEdit?: Contact | null;
}

const PREFERRED_METHODS: PreferredContactMethod[] = ['Call', 'WhatsApp', 'Email', 'Meeting'];

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  collegeId,
  contactToEdit,
}) => {
  const { addContact, updateContact, colleges, teamMembers, currentUser } = useCRM();

  const [selectedCollegeId, setSelectedCollegeId] = useState(collegeId || colleges[0]?.id || '');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [ownerId, setOwnerId] = useState(currentUser.id);
  const [preferredMethod, setPreferredMethod] = useState<PreferredContactMethod>('Call');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (contactToEdit) {
      setSelectedCollegeId(contactToEdit.college_id);
      setName(contactToEdit.name);
      setDesignation(contactToEdit.designation);
      setDepartment(contactToEdit.department || '');
      setPhone(contactToEdit.phone);
      setEmail(contactToEdit.email || '');
      setWhatsapp(contactToEdit.whatsapp || contactToEdit.phone);
      setOwnerId(contactToEdit.relationship_owner_id);
      setPreferredMethod(contactToEdit.preferred_method);
      setNotes(contactToEdit.notes || '');
    } else {
      setSelectedCollegeId(collegeId || colleges[0]?.id || '');
      setName('');
      setDesignation('Placement Officer / Dean');
      setDepartment('Training & Placements');
      setPhone('+91 ');
      setEmail('');
      setWhatsapp('');
      setOwnerId(currentUser.id);
      setPreferredMethod('WhatsApp');
      setNotes('');
    }
  }, [contactToEdit, collegeId, isOpen, colleges, currentUser.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !selectedCollegeId) return;

    if (contactToEdit) {
      updateContact(contactToEdit.id, {
        college_id: selectedCollegeId,
        name: name.trim(),
        designation: designation.trim(),
        department: department.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        whatsapp: whatsapp.trim() || phone.trim(),
        relationship_owner_id: ownerId,
        preferred_method: preferredMethod,
        notes: notes.trim() || undefined,
      });
    } else {
      addContact({
        college_id: selectedCollegeId,
        name: name.trim(),
        designation: designation.trim(),
        department: department.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        whatsapp: whatsapp.trim() || phone.trim(),
        relationship_owner_id: ownerId,
        preferred_method: preferredMethod,
        notes: notes.trim() || undefined,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contactToEdit ? 'Edit Contact' : 'Add New Contact'}
      subtitle="Link a placement director, HOD, faculty coordinator, or student rep to a college"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Linked College */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Linked College *</label>
          <select
            required
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

        {/* Contact Name & Designation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. R. Sundaram"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Designation *</label>
            <input
              type="text"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Dean of Placements, HOD CSE"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {/* Department & Preferred Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science & Engg"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Preferred Contact Method
            </label>
            <select
              value={preferredMethod}
              onChange={(e) => setPreferredMethod(e.target.value as PreferredContactMethod)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              {PREFERRED_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Phone & WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98450 11223"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Same as phone or separate"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {/* Email & Owner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dean.placement@college.edu.in"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Relationship Owner
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
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Notes & Preferences</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Available timings, past interactions, interests in AI..."
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
            {contactToEdit ? 'Save Contact' : 'Create Contact'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
