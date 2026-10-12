import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { College, Priority, PipelineStage, InstitutionType } from '../../types/crm';
import { PriorityBadge, StageBadge } from '../common/Badge';
import {
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  LayoutGrid,
  List,
  Building,
  MapPin,
  Calendar,
  Users,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { exportCollegesToCSV, generateWhatsAppLink } from '../../lib/storage';

interface CollegesViewProps {
  onOpenNewCollege: () => void;
  onOpenCollegeDetail: (id: string) => void;
  onEditCollege: (id: string) => void;
}

export const CollegesView: React.FC<CollegesViewProps> = ({
  onOpenNewCollege,
  onOpenCollegeDetail,
  onEditCollege,
}) => {
  const {
    colleges,
    contacts,
    teamMembers,
    searchQuery,
    setSearchQuery,
    importCollegesFromCSVData,
  } = useCRM();

  // Filters
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [ownerFilter, setOwnerFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'followup' | 'strength'>('priority');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredColleges = useMemo(() => {
    return colleges.filter((c) => {
      // Global Search or local query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesDistrict = c.district.toLowerCase().includes(q);
        const matchesLocation = c.location.toLowerCase().includes(q);
        const matchesDept = c.departments.some((d) => d.toLowerCase().includes(q));
        const matchesReferrer = c.referrer_name?.toLowerCase().includes(q);
        if (!matchesName && !matchesDistrict && !matchesLocation && !matchesDept && !matchesReferrer) {
          return false;
        }
      }

      if (stageFilter !== 'ALL' && c.stage !== stageFilter) return false;
      if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;
      if (typeFilter !== 'ALL' && c.institution_type !== typeFilter) return false;
      if (ownerFilter !== 'ALL' && c.owner_id !== ownerFilter) return false;
      if (sourceFilter !== 'ALL' && c.lead_source !== sourceFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'strength') return b.estimated_strength - a.estimated_strength;
      if (sortBy === 'followup') {
        return (a.next_follow_up_date || '9999').localeCompare(b.next_follow_up_date || '9999');
      }
      // priority
      const pMap = { High: 3, Medium: 2, Low: 1 };
      return pMap[b.priority] - pMap[a.priority];
    });
  }, [
    colleges,
    searchQuery,
    stageFilter,
    priorityFilter,
    typeFilter,
    ownerFilter,
    sourceFilter,
    sortBy,
  ]);

  const handleExportCSV = () => {
    exportCollegesToCSV(filteredColleges);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      // Simple CSV parsing
      const parsed: Partial<College>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts.length >= 2 && parts[1]) {
          parsed.push({
            name: parts[1],
            institution_type: (parts[2] as InstitutionType) || 'Engineering',
            location: parts[3] || 'Location Not Specified',
            district: parts[4] || 'District Not Specified',
            estimated_strength: Number(parts[5]) || 2000,
            priority: (parts[6] as Priority) || 'Medium',
            stage: (parts[7] as PipelineStage) || 'New',
            lead_source: parts[8] || 'Manual',
            referrer_name: parts[9] || undefined,
            next_action: parts[12] || 'Follow up on outreach',
          });
        }
      }

      if (parsed.length > 0) {
        importCollegesFromCSVData(parsed);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-brand-600" /> College Database
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {filteredColleges.length} of {colleges.length} institutional partners
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* CSV Import */}
          <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* View toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Add College */}
          <button
            onClick={onOpenNewCollege}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add College</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-wrap items-center gap-3 text-xs">
        {/* Stage Filter */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-500">Stage:</span>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="ALL">All Stages ({colleges.length})</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Meeting Scheduled">Meeting Scheduled</option>
            <option value="Session Proposed">Session Proposed</option>
            <option value="Approved">Approved</option>
            <option value="Session Scheduled">Session Scheduled</option>
            <option value="Session Completed">Session Completed</option>
            <option value="Course Proposed">Course Proposed</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-500">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Institution Type */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-500">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="ALL">All Types</option>
            <option value="Engineering">Engineering</option>
            <option value="Arts & Science">Arts & Science</option>
            <option value="Polytechnic">Polytechnic</option>
            <option value="University / Autonomous">University / Autonomous</option>
            <option value="Management / Business">Management / Business</option>
          </select>
        </div>

        {/* Owner */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-500">Owner:</span>
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="ALL">All Owners</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="font-bold text-slate-500">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="priority">Priority (High to Low)</option>
            <option value="followup">Follow-up Due Date</option>
            <option value="strength">Student Strength</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* View: Table Mode */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">College & Location</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Relationship Owner</th>
                  <th className="py-3 px-3">Source</th>
                  <th className="py-3 px-3">Next Action / Due</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredColleges.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No colleges match your current search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredColleges.map((college) => {
                    const owner = teamMembers.find((m) => m.id === college.owner_id);
                    const isDueToday = college.next_follow_up_date === todayStr;
                    const isOverdue =
                      college.next_follow_up_date && college.next_follow_up_date < todayStr;
                    const collegeContactList = contacts.filter((c) => c.college_id === college.id);
                    const primaryContact = collegeContactList[0];

                    return (
                      <tr
                        key={college.id}
                        onClick={() => onOpenCollegeDetail(college.id)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        {/* Name & Location */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 group-hover:text-brand-700 text-sm">
                            {college.name}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {college.district} · {college.estimated_strength.toLocaleString()} students
                          </div>
                        </td>

                        {/* Institution Type */}
                        <td className="py-3.5 px-3">
                          <span className="text-slate-700 font-medium">{college.institution_type}</span>
                        </td>

                        {/* Stage */}
                        <td className="py-3.5 px-3">
                          <StageBadge stage={college.stage} />
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-3">
                          <PriorityBadge priority={college.priority} />
                        </td>

                        {/* Owner */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold text-[10px] flex items-center justify-center">
                              {owner ? owner.name[0] : '?'}
                            </div>
                            <span className="font-medium text-slate-700">
                              {owner ? owner.name : 'Unassigned'}
                            </span>
                          </div>
                        </td>

                        {/* Lead Source */}
                        <td className="py-3.5 px-3">
                          <span className="text-slate-600 font-medium">
                            {college.lead_source}
                            {college.referrer_name && (
                              <span className="text-[10px] block text-brand-600 truncate max-w-[120px]">
                                via {college.referrer_name}
                              </span>
                            )}
                          </span>
                        </td>

                        {/* Next Action */}
                        <td className="py-3.5 px-3">
                          <div className="max-w-[200px] truncate font-medium text-slate-800">
                            {college.next_action || 'No action specified'}
                          </div>
                          {college.next_follow_up_date && (
                            <span
                              className={`text-[11px] font-bold block mt-0.5 ${
                                isOverdue
                                  ? 'text-rose-600'
                                  : isDueToday
                                  ? 'text-amber-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              Due: {college.next_follow_up_date}
                            </span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {primaryContact && (
                              <a
                                href={generateWhatsAppLink(
                                  primaryContact.phone,
                                  primaryContact.name,
                                  college.name,
                                  'session_pitch'
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => onOpenCollegeDetail(college.id)}
                              className="px-2.5 py-1 text-xs font-bold text-brand-600 hover:text-brand-800 hover:bg-brand-50 rounded-lg transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View: Grid Card Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredColleges.map((college) => {
            const owner = teamMembers.find((m) => m.id === college.owner_id);
            const isDueToday = college.next_follow_up_date === todayStr;
            const isOverdue =
              college.next_follow_up_date && college.next_follow_up_date < todayStr;
            const collegeContactList = contacts.filter((c) => c.college_id === college.id);

            return (
              <div
                key={college.id}
                onClick={() => onOpenCollegeDetail(college.id)}
                className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle hover:shadow-premium hover:border-brand-300 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <StageBadge stage={college.stage} />
                    <PriorityBadge priority={college.priority} />
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mt-3 hover:text-brand-700 transition-colors">
                    {college.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {college.district} · {college.institution_type}
                  </p>

                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Next Action
                    </span>
                    <p className="font-semibold text-slate-800 line-clamp-1">
                      {college.next_action || 'None scheduled'}
                    </p>
                    {college.next_follow_up_date && (
                      <span
                        className={`text-[11px] font-bold mt-1 block ${
                          isOverdue
                            ? 'text-rose-600'
                            : isDueToday
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}
                      >
                        Follow-up: {college.next_follow_up_date}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{collegeContactList.length} contacts</span>
                  </div>

                  <div className="flex items-center gap-1 text-brand-600 font-bold group-hover:underline">
                    <span>Manage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
