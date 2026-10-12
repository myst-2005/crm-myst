import {
  College,
  Contact,
  TeamMember,
  Activity,
  CalendarEvent,
  CampusSession,
  Course,
  Student,
  CustomLeadSource,
  AuditLog,
  StageHistoryEntry,
  IntegrationStatus,
} from '../types/crm';
import {
  initialColleges,
  initialContacts,
  initialTeamMembers,
  initialActivities,
  initialCalendarEvents,
  initialCampusSessions,
  initialCourses,
  initialStudents,
  initialLeadSources,
  initialAuditLogs,
  initialStageHistory,
} from './initialData';

const STORAGE_KEYS = {
  COLLEGES: 'myst_crm_colleges',
  CONTACTS: 'myst_crm_contacts',
  TEAM: 'myst_crm_team',
  ACTIVITIES: 'myst_crm_activities',
  EVENTS: 'myst_crm_events',
  SESSIONS: 'myst_crm_sessions',
  COURSES: 'myst_crm_courses',
  STUDENTS: 'myst_crm_students',
  LEAD_SOURCES: 'myst_crm_lead_sources',
  AUDIT_LOGS: 'myst_crm_audit_logs',
  STAGE_HISTORY: 'myst_crm_stage_history',
  INTEGRATIONS: 'myst_crm_integrations',
  CURRENT_USER_ID: 'myst_crm_current_user_id',
};

// Safe JSON parser
function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error parsing localStorage key ${key}`, e);
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving localStorage key ${key}`, e);
  }
}

export const initialIntegrations: IntegrationStatus = {
  google_calendar_connected: true,
  google_calendar_id: 'mystedge.outreach@gmail.com',
  google_calendar_last_sync: '2026-10-12T09:15:00Z',
  gmail_connected: true,
  gmail_account: 'partnerships@mystedge.io',
  sheets_last_import: '2026-10-01T14:30:00Z',
  sheets_last_export: '2026-10-10T18:00:00Z',
  error_logs: [
    {
      timestamp: '2026-10-09T08:12:00Z',
      service: 'Google Calendar',
      message: 'Network timeout during background refresh; auto-recovered on retry.',
    },
  ],
};

export const StorageService = {
  getColleges(): College[] {
    return getStoredItem<College[]>(STORAGE_KEYS.COLLEGES, initialColleges);
  },
  saveColleges(items: College[]): void {
    setStoredItem(STORAGE_KEYS.COLLEGES, items);
  },

  getContacts(): Contact[] {
    return getStoredItem<Contact[]>(STORAGE_KEYS.CONTACTS, initialContacts);
  },
  saveContacts(items: Contact[]): void {
    setStoredItem(STORAGE_KEYS.CONTACTS, items);
  },

  getTeamMembers(): TeamMember[] {
    return getStoredItem<TeamMember[]>(STORAGE_KEYS.TEAM, initialTeamMembers);
  },
  saveTeamMembers(items: TeamMember[]): void {
    setStoredItem(STORAGE_KEYS.TEAM, items);
  },

  getActivities(): Activity[] {
    return getStoredItem<Activity[]>(STORAGE_KEYS.ACTIVITIES, initialActivities);
  },
  saveActivities(items: Activity[]): void {
    setStoredItem(STORAGE_KEYS.ACTIVITIES, items);
  },

  getEvents(): CalendarEvent[] {
    return getStoredItem<CalendarEvent[]>(STORAGE_KEYS.EVENTS, initialCalendarEvents);
  },
  saveEvents(items: CalendarEvent[]): void {
    setStoredItem(STORAGE_KEYS.EVENTS, items);
  },

  getSessions(): CampusSession[] {
    return getStoredItem<CampusSession[]>(STORAGE_KEYS.SESSIONS, initialCampusSessions);
  },
  saveSessions(items: CampusSession[]): void {
    setStoredItem(STORAGE_KEYS.SESSIONS, items);
  },

  getCourses(): Course[] {
    return getStoredItem<Course[]>(STORAGE_KEYS.COURSES, initialCourses);
  },
  saveCourses(items: Course[]): void {
    setStoredItem(STORAGE_KEYS.COURSES, items);
  },

  getStudents(): Student[] {
    return getStoredItem<Student[]>(STORAGE_KEYS.STUDENTS, initialStudents);
  },
  saveStudents(items: Student[]): void {
    setStoredItem(STORAGE_KEYS.STUDENTS, items);
  },

  getLeadSources(): CustomLeadSource[] {
    return getStoredItem<CustomLeadSource[]>(STORAGE_KEYS.LEAD_SOURCES, initialLeadSources);
  },
  saveLeadSources(items: CustomLeadSource[]): void {
    setStoredItem(STORAGE_KEYS.LEAD_SOURCES, items);
  },

  getAuditLogs(): AuditLog[] {
    return getStoredItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
  },
  saveAuditLogs(items: AuditLog[]): void {
    setStoredItem(STORAGE_KEYS.AUDIT_LOGS, items);
  },

  getStageHistory(): StageHistoryEntry[] {
    return getStoredItem<StageHistoryEntry[]>(STORAGE_KEYS.STAGE_HISTORY, initialStageHistory);
  },
  saveStageHistory(items: StageHistoryEntry[]): void {
    setStoredItem(STORAGE_KEYS.STAGE_HISTORY, items);
  },

  getIntegrations(): IntegrationStatus {
    return getStoredItem<IntegrationStatus>(STORAGE_KEYS.INTEGRATIONS, initialIntegrations);
  },
  saveIntegrations(items: IntegrationStatus): void {
    setStoredItem(STORAGE_KEYS.INTEGRATIONS, items);
  },

  getCurrentUserId(): string {
    return getStoredItem<string>(STORAGE_KEYS.CURRENT_USER_ID, 'user-1'); // Default Sarah Jenkins (Admin)
  },
  saveCurrentUserId(id: string): void {
    setStoredItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  },

  resetToDefault(): void {
    localStorage.clear();
  },
};

/**
 * Generates WhatsApp click-to-chat URL with prefilled template
 */
export function generateWhatsAppLink(
  phone: string,
  contactName: string,
  collegeName: string,
  type: 'session_pitch' | 'follow_up' | 'confirmation' | 'custom',
  customMessage?: string
): string {
  // Clean phone number (remove +, spaces, hyphens)
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  let message = '';
  switch (type) {
    case 'session_pitch':
      message = `Hello ${contactName}, this is regarding MYST Edge's practical hands-on campus session on AI Agents & Automation for students at ${collegeName}. We would love to share a short 3-minute deck or schedule a quick call at your convenience.`;
      break;
    case 'follow_up':
      message = `Hi ${contactName}, following up on our previous discussion regarding the upcoming campus session at ${collegeName}. Hope you are having a productive week! Could we confirm a suitable time to discuss next steps?`;
      break;
    case 'confirmation':
      message = `Dear ${contactName}, thank you for confirming our campus session at ${collegeName}. Our team is looking forward to delivering an impactful session. We have noted down the date and will arrive 30 minutes prior for technical setup.`;
      break;
    case 'custom':
      message = customMessage || `Hi ${contactName}, reaching out from MYST Edge regarding ${collegeName}.`;
      break;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates Email mailto link with prefilled subject and body
 */
export function generateMailToLink(
  email: string,
  contactName: string,
  collegeName: string,
  type: 'session_proposal' | 'post_session_report' | 'course_details'
): string {
  let subject = '';
  let body = '';

  switch (type) {
    case 'session_proposal':
      subject = `Proposal: Complimentary Hands-on Campus Awareness Session on AI & Modern Tech | ${collegeName}`;
      body = `Dear ${contactName},\n\nGreetings from MYST Edge.\n\nWe would like to propose an offline, highly practical awareness session for the students of ${collegeName}. Our sessions cover practical industry tracks including AI Agents, Automation, No-Code & Vibe Coding, and Applied Data Analytics.\n\nKey highlights:\n- 100% Free offline campus workshop\n- Live demonstrations and student engagement\n- Industry curriculum aligned with recruitment demands\n\nPlease let us know a suitable time this week for a 10-minute briefing call.\n\nWarm regards,\nMYST Edge Campus Outreach Team`;
      break;
    case 'post_session_report':
      subject = `Post-Session Outcome & Student Attendance Report | ${collegeName}`;
      body = `Dear ${contactName},\n\nThank you for hosting the MYST Edge team at ${collegeName}. It was a pleasure interacting with your enthusiastic students.\n\nWe are compiling the student attendance, project submissions, and feedback ratings. We would like to discuss the subsequent advanced hands-on masterclasses for interested candidates.\n\nWarm regards,\nMYST Edge Team`;
      break;
    case 'course_details':
      subject = `Curriculum & Registration Details for Students of ${collegeName}`;
      body = `Dear ${contactName},\n\nFollowing up on our recent session, here is the detailed curriculum breakdown and registration link for interested students.\n\nWarm regards,\nMYST Edge Team`;
      break;
  }

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * CSV Exporter for Colleges
 */
export function exportCollegesToCSV(colleges: College[]): void {
  const headers = [
    'ID',
    'College Name',
    'Institution Type',
    'Location',
    'District',
    'Estimated Strength',
    'Priority',
    'Stage',
    'Lead Source',
    'Referrer Name',
    'Last Contacted',
    'Next Follow-Up',
    'Next Action',
    'Notes',
  ];

  const rows = colleges.map((c) => [
    `"${c.id}"`,
    `"${c.name.replace(/"/g, '""')}"`,
    `"${c.institution_type}"`,
    `"${c.location.replace(/"/g, '""')}"`,
    `"${c.district.replace(/"/g, '""')}"`,
    c.estimated_strength,
    `"${c.priority}"`,
    `"${c.stage}"`,
    `"${c.lead_source}"`,
    `"${(c.referrer_name || '').replace(/"/g, '""')}"`,
    `"${c.last_contacted_at || ''}"`,
    `"${c.next_follow_up_date || ''}"`,
    `"${(c.next_action || '').replace(/"/g, '""')}"`,
    `"${(c.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `MYST_Edge_Colleges_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
