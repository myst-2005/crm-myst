import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Contact, PreferredContactMethod } from '../../types/crm';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MessageCircle,
  Building,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { generateWhatsAppLink, generateMailToLink } from '../../lib/storage';

interface ContactsViewProps {
  onOpenNewContact: () => void;
  onEditContact: (contact: Contact) => void;
  onOpenCollegeDetail: (id: string) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  onOpenNewContact,
  onEditContact,
  onOpenCollegeDetail,
}) => {
  const {
    contacts,
    colleges,
    teamMembers,
    deleteContact,
    searchQuery,
    setSearchQuery,
  } = useCRM();

  const [collegeFilter, setCollegeFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesDesig = c.designation.toLowerCase().includes(q);
        const matchesDept = c.department?.toLowerCase().includes(q);
        const matchesPhone = c.phone.includes(q);
        const matchesEmail = c.email?.toLowerCase().includes(q);
        const linkedCollege = colleges.find((col) => col.id === c.college_id);
        const matchesCollege = linkedCollege?.name.toLowerCase().includes(q);
        if (!matchesName && !matchesDesig && !matchesDept && !matchesPhone && !matchesEmail && !matchesCollege) {
          return false;
        }
      }

      if (collegeFilter !== 'ALL' && c.college_id !== collegeFilter) return false;
      if (methodFilter !== 'ALL' && c.preferred_method !== methodFilter) return false;

      return true;
    });
  }, [contacts, colleges, searchQuery, collegeFilter, methodFilter]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" /> College Contacts & Coordinators
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Placement directors, department heads, faculty advisors, and student representatives
          </p>
        </div>

        <button
          onClick={onOpenNewContact}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-500">College:</span>
          <select
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 max-w-[200px]"
          >
            <option value="ALL">All Colleges</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-500">Preferred Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="ALL">All Methods</option>
            <option value="Call">Call</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Email">Email</option>
            <option value="Meeting">Meeting</option>
          </select>
        </div>
      </div>

      {/* Contacts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            No contacts found matching your query.
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const linkedCollege = colleges.find((c) => c.id === contact.college_id);
            const owner = teamMembers.find((m) => m.id === contact.relationship_owner_id);

            return (
              <div
                key={contact.id}
                className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle hover:shadow-premium hover:border-brand-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">{contact.name}</h3>
                      <p className="text-xs font-semibold text-brand-700 mt-0.5">
                        {contact.designation}
                        {contact.department && ` · ${contact.department}`}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {contact.preferred_method}
                    </span>
                  </div>

                  {linkedCollege && (
                    <div
                      onClick={() => onOpenCollegeDetail(linkedCollege.id)}
                      className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-600 cursor-pointer font-medium p-2 bg-slate-50 rounded-xl transition-colors group"
                    >
                      <Building className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500" />
                      <span className="truncate">{linkedCollege.name}</span>
                    </div>
                  )}

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <span className="text-slate-400">Phone:</span>
                      <strong className="text-slate-800">{contact.phone}</strong>
                    </p>
                    {contact.email && (
                      <p className="flex items-center gap-2 truncate">
                        <span className="text-slate-400">Email:</span>
                        <span className="text-slate-700 truncate">{contact.email}</span>
                      </p>
                    )}
                  </div>

                  {contact.notes && (
                    <p className="mt-2.5 text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                      "{contact.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {/* Quick communication buttons */}
                  <div className="flex items-center gap-2">
                    <a
                      href={generateWhatsAppLink(
                        contact.phone,
                        contact.name,
                        linkedCollege?.name || 'your college',
                        'follow_up'
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl border border-emerald-200 transition-colors"
                      title="1-Click WhatsApp Chat"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    {contact.email && (
                      <a
                        href={generateMailToLink(
                          contact.email,
                          contact.name,
                          linkedCollege?.name || 'your college',
                          'session_proposal'
                        )}
                        className="p-2 text-brand-600 hover:bg-brand-50 rounded-xl border border-brand-200 transition-colors"
                        title="Send Draft Email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    <a
                      href={`tel:${contact.phone}`}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                      title="Direct Call"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Edit/Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditContact(contact)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Contact"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete contact ${contact.name}?`)) {
                          deleteContact(contact.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
