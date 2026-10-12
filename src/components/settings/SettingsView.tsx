import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Role } from '../../types/crm';
import { RoleBadge } from '../common/Badge';
import {
  Settings,
  Shield,
  Users,
  Database,
  ListPlus,
  History,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Key,
} from 'lucide-react';
import { testSupabaseConnection } from '../../lib/supabase';

export const SettingsView: React.FC = () => {
  const {
    teamMembers,
    currentUser,
    userRole,
    switchUser,
    leadSources,
    addLeadSource,
    toggleLeadSource,
    auditLogs,
    clearAllData,
    realtimeConnected,
    addToast,
  } = useCRM();

  // Supabase connection state
  const [supabaseUrl, setSupabaseUrl] = useState(
    import.meta.env.VITE_SUPABASE_URL || 'https://ztxjoxweovvrrubqhvzv.supabase.co'
  );
  const [supabaseKey, setSupabaseKey] = useState(
    import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null);

  // New Lead Source State
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceCategory, setNewSourceCategory] = useState('Network');
  const [newSourceReferrer, setNewSourceReferrer] = useState('');

  const handleTestSupabase = async () => {
    setTestingConnection(true);
    setConnectionResult(null);
    const res = await testSupabaseConnection(supabaseUrl, supabaseKey);
    setTestingConnection(false);
    setConnectionResult(res);
    if (res.success) {
      addToast('Supabase Verified', res.message, 'success');
    } else {
      addToast('Supabase Connection Failed', res.message, 'warning');
    }
  };

  const handleAddLeadSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;
    addLeadSource({
      name: newSourceName.trim(),
      category: newSourceCategory.trim(),
      referrer_name: newSourceReferrer.trim() || undefined,
      active: true,
    });
    setNewSourceName('');
    setNewSourceReferrer('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-600" /> CRM Settings & Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage user roles, Supabase database, referral sources, and audit logs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-900">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                realtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-brand-500'
              }`}
            />
            <span>{realtimeConnected ? 'Supabase Realtime Live' : 'Supabase Connected'}</span>
          </div>

          <button
            onClick={() => {
              if (
                window.confirm(
                  'Are you sure you want to CLEAR ALL DATA? This will wipe all colleges, contacts, sessions, tasks, and students from both Supabase and local state.'
                )
              ) {
                clearAllData();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Grid: RBAC Simulation + Supabase Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: User Roles & RBAC Simulator */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-600" />
                Team Roles & Permissions (RBAC)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Switch users to test permissions between Admin, Manager, and Team Member
              </p>
            </div>
            <RoleBadge role={userRole} />
          </div>

          <div className="space-y-2.5">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  member.id === currentUser.id
                    ? 'bg-brand-50/70 border-brand-300 ring-1 ring-brand-200'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{member.name}</span>
                    <RoleBadge role={member.role} />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{member.email}</p>
                </div>

                {member.id === currentUser.id ? (
                  <span className="text-xs font-bold text-brand-600">Active</span>
                ) : (
                  <button
                    onClick={() => switchUser(member.id)}
                    className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-xs"
                  >
                    Simulate
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Permissions Matrix Table */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Permissions Matrix
            </span>
            <div className="text-[11px] text-slate-600 space-y-1.5">
              <p>
                <strong>• Admin:</strong> Manage all records, system integrations, lead sources, and database settings.
              </p>
              <p>
                <strong>• Manager:</strong> Review team-wide pipeline performance, reassign colleges, and view reports.
              </p>
              <p>
                <strong>• Team Member:</strong> Create and update assigned colleges, contacts, awareness sessions, and student leads.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Supabase PostgreSQL Connection */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-600" />
              Supabase Project Connection
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Project Ref: <code className="text-brand-600 font-mono font-bold">ztxjoxweovvrrubqhvzv</code>
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Supabase API URL</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://ztxjoxweovvrrubqhvzv.supabase.co"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supabase Anon Public API Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                SQL schema file: <code className="font-mono text-slate-700">supabase/schema.sql</code>
              </span>
              <button
                onClick={handleTestSupabase}
                disabled={testingConnection}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                {testingConnection ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {connectionResult && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
                  connectionResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                {connectionResult.success ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                )}
                <span>{connectionResult.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Lead Sources & Referrers Manager */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ListPlus className="w-4 h-4 text-brand-600" />
            Configurable Lead Sources & Referral Attribution
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Support Manual, Instagram, Referral (friends, faculty, alumni), Calendar, and custom channels
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {leadSources.map((source) => (
            <div
              key={source.id}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-900">{source.name}</span>
                <span className="text-[10px] text-slate-400 block">{source.category}</span>
                {source.referrer_name && (
                  <span className="text-[10px] text-brand-600 font-semibold block mt-0.5">
                    Ref: {source.referrer_name}
                  </span>
                )}
              </div>
              <button
                onClick={() => toggleLeadSource(source.id)}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  source.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {source.active ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}
        </div>

        {/* Add Lead Source Form */}
        <form onSubmit={handleAddLeadSource} className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            required
            value={newSourceName}
            onChange={(e) => setNewSourceName(e.target.value)}
            placeholder="New Source Name (e.g. Campus Tech Fest 2026)"
            className="flex-1 min-w-[200px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
          />
          <input
            type="text"
            value={newSourceCategory}
            onChange={(e) => setNewSourceCategory(e.target.value)}
            placeholder="Category (e.g. Event, Referral)"
            className="w-36 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
          />
          <input
            type="text"
            value={newSourceReferrer}
            onChange={(e) => setNewSourceReferrer(e.target.value)}
            placeholder="Optional Referrer Name"
            className="w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl"
          >
            + Add Source
          </button>
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          CRM System Audit Logs
        </h2>
        <div className="overflow-x-auto max-h-64">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Action</th>
                <th className="pb-2">Details</th>
                <th className="pb-2">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.slice(0, 15).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="py-2 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2 font-bold text-slate-700 whitespace-nowrap">
                    {log.action} ({log.entity_type})
                  </td>
                  <td className="py-2 text-slate-600">{log.details}</td>
                  <td className="py-2 font-semibold text-brand-600 whitespace-nowrap">
                    {log.user_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
