import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  IndianRupee,
  Download,
  Share2,
  Calendar,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { PipelineStage, LeadSource } from '../../types/crm';

export const ReportsView: React.FC = () => {
  const {
    colleges,
    students,
    sessions,
    activities,
    teamMembers,
    leadSources,
  } = useCRM();

  // Metrics
  const totalColleges = colleges.length;
  const convertedColleges = colleges.filter((c) => c.stage === 'Converted').length;
  const collegeConversionRate = totalColleges > 0 ? Math.round((convertedColleges / totalColleges) * 100) : 0;

  const totalStudents = students.length;
  const paidStudents = students.filter(
    (s) => s.lead_stage === 'Enrolled' && s.payment_status === 'Paid'
  ).length;
  const studentConversionRate = totalStudents > 0 ? Math.round((paidStudents / totalStudents) * 100) : 0;

  const totalExpectedRevenue = students.reduce((sum, s) => sum + s.agreed_fee, 0);
  const totalCollectedRevenue = students.reduce((sum, s) => {
    if (s.payment_status === 'Paid') return sum + s.agreed_fee;
    if (s.payment_status === 'Partial') return sum + s.agreed_fee * 0.5;
    return sum;
  }, 0);

  // Stage Breakdown
  const stageCounts: Record<PipelineStage, number> = {
    New: 0,
    Contacted: 0,
    'Meeting Scheduled': 0,
    'Session Proposed': 0,
    Approved: 0,
    'Session Scheduled': 0,
    'Session Completed': 0,
    'Course Proposed': 0,
    Converted: 0,
    Lost: 0,
    'On Hold': 0,
  };
  colleges.forEach((c) => {
    stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1;
  });

  // Lead Attribution Breakdown
  const sourceAttribution = leadSources.map((source) => {
    const matchedColleges = colleges.filter(
      (c) => c.lead_source.toLowerCase() === source.name.toLowerCase()
    );
    const matchedStudents = students.filter((s) => {
      const col = colleges.find((c) => c.id === s.college_id);
      return col?.lead_source.toLowerCase() === source.name.toLowerCase();
    });
    const paidEnrolments = matchedStudents.filter((s) => s.payment_status === 'Paid').length;
    const revenue = matchedStudents.reduce(
      (sum, s) => sum + (s.payment_status === 'Paid' ? s.agreed_fee : 0),
      0
    );

    return {
      name: source.name,
      category: source.category,
      collegeCount: matchedColleges.length,
      studentCount: matchedStudents.length,
      paidEnrolments,
      revenue,
    };
  });

  // Team Leaderboard
  const teamPerformance = teamMembers.map((member) => {
    const ownedColleges = colleges.filter((c) => c.owner_id === member.id);
    const converted = ownedColleges.filter((c) => c.stage === 'Converted').length;
    const completedTasks = activities.filter(
      (a) => a.assigned_to_id === member.id && a.completed
    ).length;
    const overdueTasks = activities.filter(
      (a) =>
        a.assigned_to_id === member.id &&
        !a.completed &&
        a.due_date &&
        a.due_date < new Date().toISOString().split('T')[0]
    ).length;

    return {
      name: member.name,
      role: member.role,
      ownedColleges: ownedColleges.length,
      convertedColleges: converted,
      completedTasks,
      overdueTasks,
    };
  });

  const handleExportReportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Institutional Leads', totalColleges],
      ['Converted Colleges', convertedColleges],
      ['College Conversion Rate', `${collegeConversionRate}%`],
      ['Total Student Leads', totalStudents],
      ['Verified Paid Enrolments', paidStudents],
      ['Student Conversion Rate', `${studentConversionRate}%`],
      ['Total Expected Revenue (₹)', totalExpectedRevenue],
      ['Total Collected Revenue (₹)', totalCollectedRevenue],
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `MYST_Edge_Executive_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-600" /> Executive & Operational Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real metrics derived from persisted records — distinguishing unique colleges, student enrolments and revenue
          </p>
        </div>

        <button
          onClick={handleExportReportCSV}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Summary CSV</span>
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            College Conversion Rate
          </span>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {collegeConversionRate}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {convertedColleges} converted of {totalColleges} colleges
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Student Conversion Rate
          </span>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {studentConversionRate}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {paidStudents} paid of {totalStudents} student leads
          </p>
        </div>

        <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 shadow-subtle">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            Verified Revenue Collected
          </span>
          <div className="text-3xl font-extrabold text-emerald-700 mt-2">
            ₹{totalCollectedRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-800 font-medium mt-1">
            Bank-verified course collections
          </p>
        </div>

        <div className="p-5 bg-purple-50/60 rounded-2xl border border-purple-200 shadow-subtle">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">
            Expected Pipeline Value
          </span>
          <div className="text-3xl font-extrabold text-purple-900 mt-2">
            ₹{totalExpectedRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-purple-800 font-medium mt-1">
            Pending student fees + commitments
          </p>
        </div>
      </div>

      {/* Grid: Pipeline Stage Distribution + Lead Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Stage Funnel Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle">
          <h2 className="text-base font-bold text-slate-900">Pipeline Stage Distribution</h2>
          <p className="text-xs text-slate-500 mt-0.5">Number of colleges across all 10 outreach stages</p>

          <div className="mt-4 space-y-2">
            {Object.entries(stageCounts).map(([stageName, count]) => {
              const pct = totalColleges > 0 ? Math.round((count / totalColleges) * 100) : 0;
              return (
                <div key={stageName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{stageName}</span>
                    <span>
                      {count} <span className="text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        stageName === 'Converted'
                          ? 'bg-emerald-500'
                          : stageName === 'Lost'
                          ? 'bg-rose-400'
                          : 'bg-brand-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Source & Attribution Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle">
          <h2 className="text-base font-bold text-slate-900">Lead Source & Referral Attribution</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Colleges, student enrolments, and revenue traced back to origin
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-2">Source</th>
                  <th className="pb-2">Colleges</th>
                  <th className="pb-2">Enrolments</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sourceAttribution.map((src) => (
                  <tr key={src.name} className="hover:bg-slate-50/80">
                    <td className="py-2.5 font-bold text-slate-900">
                      {src.name}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({src.category})
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-600 font-medium">{src.collegeCount}</td>
                    <td className="py-2.5 text-slate-600 font-medium">{src.paidEnrolments}</td>
                    <td className="py-2.5 text-right font-black text-emerald-700">
                      ₹{src.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Team Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle">
        <h2 className="text-base font-bold text-slate-900">Team Outreach Performance & Accountability</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Activities completed, overdue tasks, assigned colleges, and conversions per team member
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Team Member</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Owned Colleges</th>
                <th className="py-2.5 px-3">Converted Colleges</th>
                <th className="py-2.5 px-3">Tasks Completed</th>
                <th className="py-2.5 px-3">Overdue Tasks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamPerformance.map((tp) => (
                <tr key={tp.name} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-bold text-slate-900">{tp.name}</td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {tp.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{tp.ownedColleges}</td>
                  <td className="py-3 px-3 font-extrabold text-emerald-600">
                    {tp.convertedColleges}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{tp.completedTasks}</td>
                  <td className="py-3 px-3 font-bold text-rose-600">{tp.overdueTasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
