import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Plug,
  Calendar,
  Mail,
  FileSpreadsheet,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Shield,
  Upload,
  Download,
} from 'lucide-react';
import { exportCollegesToCSV } from '../../lib/storage';

export const IntegrationsView: React.FC = () => {
  const {
    integrations,
    toggleGoogleCalendarConnection,
    syncAllGoogleEvents,
    colleges,
    students,
    importCollegesFromCSVData,
    addToast,
  } = useCRM();

  const [testPhone, setTestPhone] = useState('+91 98401 23456');
  const [testName, setTestName] = useState('Dr. Sundaram');
  const [testCollege, setTestCollege] = useState('Bangalore Institute of Applied AI');
  const [testType, setTestType] = useState<'session_pitch' | 'follow_up' | 'confirmation'>('session_pitch');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const parsed: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts.length >= 2 && parts[1]) {
          parsed.push({
            name: parts[1],
            institution_type: parts[2] || 'Engineering',
            location: parts[3] || 'Location Not Specified',
            district: parts[4] || 'District Not Specified',
            estimated_strength: Number(parts[5]) || 2000,
            priority: parts[6] || 'Medium',
            stage: parts[7] || 'New',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Plug className="w-5 h-5 text-brand-600" /> External Integrations & Connectors
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect operational tools: Google Calendar, Gmail, Google Sheets, WhatsApp and Supabase
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5" /> Core Services Active
        </div>
      </div>

      {/* Grid of integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Google Calendar Integration */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Google Calendar</h3>
                  <p className="text-xs text-slate-500">Bi-directional event & visit syncing</p>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  integrations.google_calendar_connected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {integrations.google_calendar_connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5 text-slate-600">
              <div className="flex items-center justify-between">
                <span>Account ID:</span>
                <strong className="text-slate-800">{integrations.google_calendar_id}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Sync:</span>
                <strong className="text-slate-800">
                  {integrations.google_calendar_last_sync
                    ? new Date(integrations.google_calendar_last_sync).toLocaleString()
                    : 'Never'}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Duplicate Prevention:</span>
                <span className="text-emerald-700 font-semibold">Active (Google Event ID match)</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={syncAllGoogleEvents}
              disabled={!integrations.google_calendar_connected}
              className="flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800 disabled:opacity-40"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Sync All Events Now
            </button>

            <button
              onClick={toggleGoogleCalendarConnection}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                integrations.google_calendar_connected
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {integrations.google_calendar_connected ? 'Disconnect' : 'Connect OAuth'}
            </button>
          </div>
        </div>

        {/* 2. Gmail Integration */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Gmail Integration</h3>
                  <p className="text-xs text-slate-500">Link proposal emails to contacts</p>
                </div>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Connected
              </span>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5 text-slate-600">
              <div className="flex items-center justify-between">
                <span>Sender Mailbox:</span>
                <strong className="text-slate-800">{integrations.gmail_account}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Thread Sync:</span>
                <span className="text-emerald-700 font-semibold">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span>1-Click Mailto Drafts:</span>
                <span className="text-slate-800 font-semibold">Ready</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Scopes: mail.send, mail.readonly</span>
            <button
              onClick={() => addToast('Gmail Settings', 'Sender mailbox is active', 'info')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Configure Scopes
            </button>
          </div>
        </div>

        {/* 3. Google Sheets & CSV Data Sync */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Google Sheets / CSV</h3>
                  <p className="text-xs text-slate-500">Bulk college import & duplicate check</p>
                </div>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                CSV Ready
              </span>
            </div>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Import colleges in bulk without overwriting existing entries. The CRM performs duplicate checks on name and district before creating records.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Import Colleges</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => exportCollegesToCSV(colleges)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4. WhatsApp Click-to-Chat Link Builder */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">WhatsApp Outreach</h3>
                  <p className="text-xs text-slate-500">Instant wa.me prefilled outreach links</p>
                </div>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                1-Click Active
              </span>
            </div>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Directly launches WhatsApp Web or desktop with contact-personalized pitch templates, eliminating copy-paste errors.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Policy: Opt-in based direct chat</span>
            <span className="text-xs font-bold text-emerald-600">No API key required</span>
          </div>
        </div>
      </div>

      {/* Sync Logs and Audit Records */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Integration & Sync Health Logs</h3>
        <div className="space-y-2">
          {integrations.error_logs.map((log, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-800">{log.service}:</span>{' '}
                <span className="text-slate-600">{log.message}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
