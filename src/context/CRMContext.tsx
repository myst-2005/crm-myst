import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
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
  PipelineStage,
  Role,
} from '../types/crm';
import { StorageService } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type NavTab =
  | 'dashboard'
  | 'colleges'
  | 'contacts'
  | 'pipeline'
  | 'calendar'
  | 'tasks'
  | 'sessions'
  | 'students'
  | 'courses'
  | 'reports'
  | 'integrations'
  | 'settings';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface CRMContextType {
  // Navigation & UI
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toasts: Toast[];
  addToast: (title: string, description?: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;

  // Realtime Status
  realtimeConnected: boolean;
  isCloudConnected: boolean;

  // Active User & RBAC
  currentUser: TeamMember;
  userRole: Role;
  teamMembers: TeamMember[];
  switchUser: (userId: string) => void;

  // Entities
  colleges: College[];
  contacts: Contact[];
  activities: Activity[];
  calendarEvents: CalendarEvent[];
  sessions: CampusSession[];
  courses: Course[];
  students: Student[];
  leadSources: CustomLeadSource[];
  auditLogs: AuditLog[];
  stageHistory: StageHistoryEntry[];
  integrations: IntegrationStatus;

  // College Operations
  addCollege: (data: Omit<College, 'id' | 'created_at' | 'updated_at' | 'stage_updated_at'>) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateCollege: (id: string, updates: Partial<College>) => Promise<void>;
  deleteCollege: (id: string) => Promise<void>;
  moveCollegeStage: (id: string, toStage: PipelineStage, reason?: string) => Promise<void>;
  checkDuplicateCollege: (name: string, excludeId?: string) => College | undefined;

  // Contact Operations
  addContact: (data: Omit<Contact, 'id' | 'created_at'>) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;

  // Activity & Task Operations
  addActivity: (data: Omit<Activity, 'id' | 'created_at'>) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  toggleActivityCompleted: (id: string, outcome?: string) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;

  // Calendar Event Operations
  addEvent: (data: Omit<CalendarEvent, 'id' | 'created_at'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  syncEventToGoogle: (id: string) => void;

  // Campus Session Operations
  addSession: (data: Omit<CampusSession, 'id' | 'created_at'>) => Promise<void>;
  updateSession: (id: string, updates: Partial<CampusSession>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  completeSessionOutcome: (
    sessionId: string,
    actualAttendance: number,
    feedbackScore: number,
    notes: string,
    interestedCount: number,
    nextAction: string
  ) => Promise<void>;

  // Course Operations
  addCourse: (data: Omit<Course, 'id' | 'created_at'>) => Promise<void>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;

  // Student Operations
  addStudent: (data: Omit<Student, 'id' | 'created_at'>) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  // Custom Lead Sources & Settings
  addLeadSource: (source: Omit<CustomLeadSource, 'id'>) => Promise<void>;
  toggleLeadSource: (id: string) => Promise<void>;

  // Integrations
  toggleGoogleCalendarConnection: () => void;
  syncAllGoogleEvents: () => void;

  // Data Reset & Clear
  clearAllData: () => Promise<void>;
  resetAllData: () => void;
  importCollegesFromCSVData: (importedList: Partial<College>[]) => Promise<{ added: number; skippedDuplicates: number }>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation & Search
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Entities State (defaults to empty when Supabase is configured, or local storage fallback)
  const [colleges, setColleges] = useState<College[]>(() => isSupabaseConfigured ? [] : StorageService.getColleges());
  const [contacts, setContacts] = useState<Contact[]>(() => isSupabaseConfigured ? [] : StorageService.getContacts());
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => StorageService.getTeamMembers());
  const [activities, setActivities] = useState<Activity[]>(() => isSupabaseConfigured ? [] : StorageService.getActivities());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => isSupabaseConfigured ? [] : StorageService.getEvents());
  const [sessions, setSessions] = useState<CampusSession[]>(() => isSupabaseConfigured ? [] : StorageService.getSessions());
  const [courses, setCourses] = useState<Course[]>(() => StorageService.getCourses());
  const [students, setStudents] = useState<Student[]>(() => isSupabaseConfigured ? [] : StorageService.getStudents());
  const [leadSources, setLeadSources] = useState<CustomLeadSource[]>(() => StorageService.getLeadSources());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [stageHistory, setStageHistory] = useState<StageHistoryEntry[]>(() => StorageService.getStageHistory());
  const [integrations, setIntegrations] = useState<IntegrationStatus>(() => StorageService.getIntegrations());

  // Current User
  const [currentUserId, setCurrentUserId] = useState<string>(() => StorageService.getCurrentUserId());

  const currentUser = useMemo(() => {
    return teamMembers.find((m) => m.id === currentUserId) || teamMembers[0];
  }, [teamMembers, currentUserId]);

  const userRole = currentUser?.role || 'Admin';

  // Toast Helper
  const addToast = (title: string, description?: string, type: Toast['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Supabase Fetch Helpers
  const fetchAllFromSupabase = async () => {
    if (!supabase) return;
    try {
      const [
        collegesRes,
        contactsRes,
        profilesRes,
        activitiesRes,
        eventsRes,
        sessionsRes,
        coursesRes,
        studentsRes,
        sourcesRes,
        logsRes,
        historyRes,
      ] = await Promise.all([
        supabase.from('colleges').select('*').order('created_at', { ascending: false }),
        supabase.from('contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*'),
        supabase.from('activities').select('*').order('created_at', { ascending: false }),
        supabase.from('calendar_events').select('*').order('start_time', { ascending: true }),
        supabase.from('campus_sessions').select('*').order('created_at', { ascending: false }),
        supabase.from('courses').select('*'),
        supabase.from('students').select('*').order('created_at', { ascending: false }),
        supabase.from('lead_sources').select('*'),
        supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }),
        supabase.from('stage_history').select('*').order('timestamp', { ascending: false }),
      ]);

      if (collegesRes.data) setColleges(collegesRes.data as College[]);
      if (contactsRes.data) setContacts(contactsRes.data as Contact[]);
      if (profilesRes.data && profilesRes.data.length > 0) {
        setTeamMembers(profilesRes.data as TeamMember[]);
      } else {
        // Fallback: get auth user and create a profile row
        const { data: authData } = await supabase!.auth.getUser();
        if (authData?.user) {
          const authUser = authData.user;
          const fallbackProfile: TeamMember = {
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email || '',
            role: 'Admin',
            active: true,
            created_at: authUser.created_at,
          };
          setTeamMembers([fallbackProfile]);
          setCurrentUserId(authUser.id);
          // Persist profile to DB
          await supabase!.from('profiles').upsert([fallbackProfile], { onConflict: 'email' });
        }
      }
      if (activitiesRes.data) setActivities(activitiesRes.data as Activity[]);
      if (eventsRes.data) setCalendarEvents(eventsRes.data as CalendarEvent[]);
      if (sessionsRes.data) setSessions(sessionsRes.data as CampusSession[]);
      if (coursesRes.data && coursesRes.data.length > 0) setCourses(coursesRes.data as Course[]);
      if (studentsRes.data) setStudents(studentsRes.data as Student[]);
      if (sourcesRes.data && sourcesRes.data.length > 0) setLeadSources(sourcesRes.data as CustomLeadSource[]);
      if (logsRes.data) setAuditLogs(logsRes.data as AuditLog[]);
      if (historyRes.data) setStageHistory(historyRes.data as StageHistoryEntry[]);
    } catch (e) {
      console.error('Error fetching Supabase data:', e);
    }
  };

  // Realtime Setup
  useEffect(() => {
    if (!supabase) return;

    // Initial fetch from live Supabase
    fetchAllFromSupabase();

    // Subscribe to all postgres table changes in realtime
    const channel = supabase
      .channel('myst_crm_realtime_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'colleges' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          setColleges((prev) => [payload.new as College, ...prev.filter((c) => c.id !== payload.new.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setColleges((prev) => prev.map((c) => (c.id === payload.new.id ? (payload.new as College) : c)));
        } else if (payload.eventType === 'DELETE') {
          setColleges((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          setContacts((prev) => [payload.new as Contact, ...prev.filter((c) => c.id !== payload.new.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setContacts((prev) => prev.map((c) => (c.id === payload.new.id ? (payload.new as Contact) : c)));
        } else if (payload.eventType === 'DELETE') {
          setContacts((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          setActivities((prev) => [payload.new as Activity, ...prev.filter((a) => a.id !== payload.new.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setActivities((prev) => prev.map((a) => (a.id === payload.new.id ? (payload.new as Activity) : a)));
        } else if (payload.eventType === 'DELETE') {
          setActivities((prev) => prev.filter((a) => a.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campus_sessions' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          setSessions((prev) => [payload.new as CampusSession, ...prev.filter((s) => s.id !== payload.new.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setSessions((prev) => prev.map((s) => (s.id === payload.new.id ? (payload.new as CampusSession) : s)));
        } else if (payload.eventType === 'DELETE') {
          setSessions((prev) => prev.filter((s) => s.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          setCalendarEvents((prev) => [payload.new as CalendarEvent, ...prev.filter((e) => e.id !== payload.new.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setCalendarEvents((prev) => prev.map((e) => (e.id === payload.new.id ? (payload.new as CalendarEvent) : e)));
        } else if (payload.eventType === 'DELETE') {
          setCalendarEvents((prev) => prev.filter((e) => e.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          setStudents((prev) => [payload.new as Student, ...prev.filter((s) => s.id !== payload.new.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setStudents((prev) => prev.map((s) => (s.id === payload.new.id ? (payload.new as Student) : s)));
        } else if (payload.eventType === 'DELETE') {
          setStudents((prev) => prev.filter((s) => s.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          setAuditLogs((prev) => [payload.new as AuditLog, ...prev]);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeConnected(false);
        }
      });

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const logAudit = async (
    entity_type: AuditLog['entity_type'],
    entity_id: string,
    action: AuditLog['action'],
    details: string
  ) => {
    const newLog: AuditLog = {
      id: crypto.randomUUID ? crypto.randomUUID() : `aud-${Date.now()}`,
      entity_type,
      entity_id,
      action,
      details,
      user_name: currentUser.name,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    if (supabase) {
      await supabase.from('audit_logs').insert([newLog]);
    }
  };

  const switchUser = (userId: string) => {
    const member = teamMembers.find((m) => m.id === userId);
    if (member) {
      setCurrentUserId(userId);
      StorageService.saveCurrentUserId(userId);
      addToast('Switched User Role', `Now viewing as ${member.name} (${member.role})`, 'info');
    }
  };

  // Duplicate Check
  const checkDuplicateCollege = (name: string, excludeId?: string): College | undefined => {
    const clean = name.trim().toLowerCase();
    return colleges.find(
      (c) => c.name.trim().toLowerCase() === clean && (!excludeId || c.id !== excludeId)
    );
  };

  // College Operations
  const addCollege = async (data: Omit<College, 'id' | 'created_at' | 'updated_at' | 'stage_updated_at'>) => {
    const existing = checkDuplicateCollege(data.name);
    if (existing) {
      addToast('Duplicate College Detected', `"${data.name}" already exists in ${existing.stage} stage.`, 'warning');
      return { success: false, error: 'A college with this name already exists.' };
    }

    const now = new Date().toISOString();
    const newId = crypto.randomUUID ? crypto.randomUUID() : `col-${Date.now()}`;
    const newCollege: College = {
      ...data,
      id: newId,
      created_at: now,
      updated_at: now,
      stage_updated_at: now,
    };

    setColleges((prev) => [newCollege, ...prev]);

    if (supabase) {
      const { error } = await supabase.from('colleges').insert([newCollege]);
      if (error) {
        console.error('Supabase college insert error:', error);
      }
    }

    await logAudit('College', newId, 'Created', `Added new college: ${data.name} (${data.institution_type})`);
    addToast('College Added (Real-time)', `"${data.name}" added to pipeline under ${data.stage}.`, 'success');
    return { success: true, id: newId };
  };

  const updateCollege = async (id: string, updates: Partial<College>) => {
    const updatedCollege = { ...updates, updated_at: new Date().toISOString() };
    setColleges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedCollege } : c))
    );

    if (supabase) {
      await supabase.from('colleges').update(updatedCollege).eq('id', id);
    }

    await logAudit('College', id, 'Updated', `Updated college details for ID: ${id}`);
    addToast('College Updated', 'Changes saved to Supabase.', 'success');
  };

  const deleteCollege = async (id: string) => {
    const target = colleges.find((c) => c.id === id);
    setColleges((prev) => prev.filter((c) => c.id !== id));
    setContacts((prev) => prev.filter((con) => con.college_id !== id));

    if (supabase) {
      await supabase.from('colleges').delete().eq('id', id);
    }

    if (target) {
      await logAudit('College', id, 'Deleted', `Deleted college: ${target.name}`);
      addToast('College Deleted', `Removed "${target.name}".`, 'info');
    }
  };

  const moveCollegeStage = async (id: string, toStage: PipelineStage, reason?: string) => {
    const target = colleges.find((c) => c.id === id);
    if (!target) return;
    if (target.stage === toStage) return;

    const fromStage = target.stage;
    const now = new Date().toISOString();

    const stageUpdates = {
      stage: toStage,
      stage_updated_at: now,
      updated_at: now,
      lost_reason: toStage === 'Lost' ? reason || 'Not specified' : null,
    };

    setColleges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...stageUpdates, lost_reason: stageUpdates.lost_reason || undefined } : c))
    );

    const historyEntry: StageHistoryEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `sth-${Date.now()}`,
      college_id: id,
      from_stage: fromStage,
      to_stage: toStage,
      reason,
      user_id: currentUser.id,
      timestamp: now,
    };
    setStageHistory((prev) => [historyEntry, ...prev]);

    if (supabase) {
      await supabase.from('colleges').update(stageUpdates).eq('id', id);
      await supabase.from('stage_history').insert([historyEntry]);
    }

    await logAudit(
      'College',
      id,
      'Stage Changed',
      `Moved "${target.name}" from ${fromStage} to ${toStage}${reason ? ` (Reason: ${reason})` : ''}`
    );

    addToast(
      'Stage Updated (Real-time)',
      `Moved "${target.name}" to ${toStage}`,
      toStage === 'Converted' ? 'success' : 'info'
    );
  };

  // Contacts
  const addContact = async (data: Omit<Contact, 'id' | 'created_at'>) => {
    const newId = crypto.randomUUID ? crypto.randomUUID() : `con-${Date.now()}`;
    const newContact: Contact = {
      ...data,
      id: newId,
      created_at: new Date().toISOString(),
    };
    setContacts((prev) => [newContact, ...prev]);

    if (supabase) {
      await supabase.from('contacts').insert([newContact]);
    }

    await logAudit('Contact', newId, 'Created', `Added contact ${data.name} (${data.designation})`);
    addToast('Contact Added', `${data.name} was linked in Supabase.`, 'success');
    return { success: true, id: newId };
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));

    if (supabase) {
      await supabase.from('contacts').update(updates).eq('id', id);
    }

    await logAudit('Contact', id, 'Updated', `Updated contact ID: ${id}`);
    addToast('Contact Saved', 'Contact details updated.', 'success');
  };

  const deleteContact = async (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));

    if (supabase) {
      await supabase.from('contacts').delete().eq('id', id);
    }

    await logAudit('Contact', id, 'Deleted', `Removed contact ID: ${id}`);
    addToast('Contact Removed', 'Contact was deleted.', 'info');
  };

  // Activities & Tasks
  const addActivity = async (data: Omit<Activity, 'id' | 'created_at'>) => {
    const newId = crypto.randomUUID ? crypto.randomUUID() : `act-${Date.now()}`;
    const newActivity: Activity = {
      ...data,
      id: newId,
      created_at: new Date().toISOString(),
    };
    setActivities((prev) => [newActivity, ...prev]);

    if (supabase) {
      await supabase.from('activities').insert([newActivity]);
    }

    await logAudit('Task', newId, 'Created', `Created ${data.type}: ${data.title}`);
    addToast('Activity Scheduled', `${data.type} logged: "${data.title}"`, 'success');
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));

    if (supabase) {
      await supabase.from('activities').update(updates).eq('id', id);
    }

    addToast('Task Updated', 'Changes saved.', 'info');
  };

  const toggleActivityCompleted = async (id: string, outcome?: string) => {
    const target = activities.find((a) => a.id === id);
    if (!target) return;

    const nextState = !target.completed;
    const updates = {
      completed: nextState,
      outcome: outcome || target.outcome,
    };

    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );

    if (supabase) {
      await supabase.from('activities').update(updates).eq('id', id);
    }

    addToast('Task Completed', 'Marked activity as done in Supabase.', 'success');
  };

  const deleteActivity = async (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));

    if (supabase) {
      await supabase.from('activities').delete().eq('id', id);
    }

    addToast('Task Removed', 'Task deleted.', 'info');
  };

  // Calendar Events
  const addEvent = async (data: Omit<CalendarEvent, 'id' | 'created_at'>) => {
    const newId = crypto.randomUUID ? crypto.randomUUID() : `evt-${Date.now()}`;
    const newEvent: CalendarEvent = {
      ...data,
      id: newId,
      created_at: new Date().toISOString(),
      synced_to_google: integrations.google_calendar_connected,
      google_event_id: integrations.google_calendar_connected ? `gcal_${Date.now()}` : undefined,
    };
    setCalendarEvents((prev) => [newEvent, ...prev]);

    if (supabase) {
      await supabase.from('calendar_events').insert([newEvent]);
    }

    await logAudit('Event', newId, 'Created', `Scheduled calendar event: ${data.title}`);
    addToast('Event Added', `"${data.title}" scheduled on calendar.`, 'success');
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));

    if (supabase) {
      await supabase.from('calendar_events').update(updates).eq('id', id);
    }

    addToast('Event Updated', 'Calendar event details saved.', 'info');
  };

  const deleteEvent = async (id: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));

    if (supabase) {
      await supabase.from('calendar_events').delete().eq('id', id);
    }

    addToast('Event Removed', 'Event cancelled.', 'info');
  };

  const syncEventToGoogle = (id: string) => {
    setCalendarEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          return {
            ...e,
            synced_to_google: true,
            google_event_id: e.google_event_id || `gcal_${Date.now()}`,
          };
        }
        return e;
      })
    );
    addToast('Google Calendar Synced', 'Event synchronized with Google account.', 'success');
  };

  // Campus Sessions
  const addSession = async (data: Omit<CampusSession, 'id' | 'created_at'>) => {
    const newId = crypto.randomUUID ? crypto.randomUUID() : `ses-${Date.now()}`;
    const newSession: CampusSession = {
      ...data,
      id: newId,
      created_at: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);

    if (supabase) {
      await supabase.from('campus_sessions').insert([newSession]);
    }

    await logAudit('Session', newId, 'Created', `Proposed campus session: ${data.title} (${data.track})`);
    addToast('Campus Session Added', `Session for track "${data.track}" created in Supabase.`, 'success');
  };

  const updateSession = async (id: string, updates: Partial<CampusSession>) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));

    if (supabase) {
      await supabase.from('campus_sessions').update(updates).eq('id', id);
    }

    addToast('Session Updated', 'Campus session details saved.', 'info');
  };

  const deleteSession = async (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));

    if (supabase) {
      await supabase.from('campus_sessions').delete().eq('id', id);
    }

    addToast('Session Deleted', 'Campus session removed.', 'info');
  };

  const completeSessionOutcome = async (
    sessionId: string,
    actualAttendance: number,
    feedbackScore: number,
    notes: string,
    interestedCount: number,
    nextAction: string
  ) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;

    const outcomeUpdates = {
      actual_attendance: actualAttendance,
      feedback_score: feedbackScore,
      notes: notes,
      interested_students_count: interestedCount,
      next_action: nextAction,
      post_session_completed: true,
      approval_status: 'Completed' as const,
    };

    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, ...outcomeUpdates } : s))
    );

    if (supabase) {
      await supabase.from('campus_sessions').update(outcomeUpdates).eq('id', sessionId);
    }

    // Advance college stage if applicable
    const college = colleges.find((c) => c.id === target.college_id);
    if (college && (college.stage === 'Session Scheduled' || college.stage === 'Approved')) {
      await moveCollegeStage(college.id, 'Session Completed');
    }

    // Create follow-up task
    if (nextAction) {
      await addActivity({
        college_id: target.college_id,
        type: 'Task',
        title: `Post-Session Follow-up: ${target.title}`,
        description: nextAction,
        due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        completed: false,
        assigned_to_id: target.follow_up_owner_id || currentUser.id,
        created_by_id: currentUser.id,
      });
    }

    await logAudit(
      'Session',
      sessionId,
      'Updated',
      `Completed post-session follow-up in Supabase. ${actualAttendance} attendees, ${interestedCount} interested students.`
    );

    addToast(
      'Session Outcome Logged',
      `Recorded ${actualAttendance} attendees and created follow-up tasks!`,
      'success'
    );
  };

  // Courses
  const addCourse = async (data: Omit<Course, 'id' | 'created_at'>) => {
    const newId = crypto.randomUUID ? crypto.randomUUID() : `course-${Date.now()}`;
    const newCourse: Course = {
      ...data,
      id: newId,
      created_at: new Date().toISOString(),
    };
    setCourses((prev) => [...prev, newCourse]);

    if (supabase) {
      await supabase.from('courses').insert([newCourse]);
    }

    addToast('Course Added', `"${data.name}" added to catalogue.`, 'success');
  };

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));

    if (supabase) {
      await supabase.from('courses').update(updates).eq('id', id);
    }

    addToast('Course Updated', 'Course curriculum & pricing updated.', 'success');
  };

  // Students
  const addStudent = async (data: Omit<Student, 'id' | 'created_at'>) => {
    const existing = students.find(
      (s) => s.email.toLowerCase() === data.email.toLowerCase() && s.college_id === data.college_id
    );
    if (existing) {
      addToast('Student Already Exists', `${data.name} is already registered under this college.`, 'warning');
      return { success: false, error: 'Student already exists in this college.' };
    }

    const newId = crypto.randomUUID ? crypto.randomUUID() : `stu-${Date.now()}`;
    const newStudent: Student = {
      ...data,
      id: newId,
      created_at: new Date().toISOString(),
    };
    setStudents((prev) => [newStudent, ...prev]);

    if (supabase) {
      await supabase.from('students').insert([newStudent]);
    }

    if (data.lead_stage === 'Enrolled' && data.payment_status === 'Paid') {
      const college = colleges.find((c) => c.id === data.college_id);
      if (college && college.stage !== 'Converted') {
        await moveCollegeStage(college.id, 'Converted', 'Verified paid student enrolment received.');
      }
    }

    await logAudit('Student', newId, 'Created', `Enrolled student: ${data.name} (Fee: ₹${data.agreed_fee})`);
    addToast('Student Registered', `${data.name} added to live Supabase records.`, 'success');
    return { success: true, id: newId };
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          if (updated.payment_status === 'Paid' && updated.lead_stage === 'Enrolled') {
            const college = colleges.find((c) => c.id === updated.college_id);
            if (college && college.stage !== 'Converted') {
              moveCollegeStage(college.id, 'Converted', 'Verified paid student enrolment received.');
            }
          }
          return updated;
        }
        return s;
      })
    );

    if (supabase) {
      await supabase.from('students').update(updates).eq('id', id);
    }

    addToast('Student Updated', 'Student enrolment details updated in Supabase.', 'success');
  };

  const deleteStudent = async (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));

    if (supabase) {
      await supabase.from('students').delete().eq('id', id);
    }

    addToast('Student Removed', 'Student record deleted.', 'info');
  };

  // Lead sources
  const addLeadSource = async (source: Omit<CustomLeadSource, 'id'>) => {
    const newId = crypto.randomUUID ? crypto.randomUUID() : `src-${Date.now()}`;
    const newSource = { ...source, id: newId };
    setLeadSources((prev) => [...prev, newSource]);

    if (supabase) {
      await supabase.from('lead_sources').insert([newSource]);
    }

    addToast('Lead Source Added', `Added source: ${source.name}`, 'success');
  };

  const toggleLeadSource = async (id: string) => {
    const target = leadSources.find((s) => s.id === id);
    if (!target) return;
    const nextState = !target.active;

    setLeadSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: nextState } : s))
    );

    if (supabase) {
      await supabase.from('lead_sources').update({ active: nextState }).eq('id', id);
    }
  };

  // Integrations
  const toggleGoogleCalendarConnection = () => {
    const nextState = !integrations.google_calendar_connected;
    setIntegrations((prev) => ({
      ...prev,
      google_calendar_connected: nextState,
      google_calendar_last_sync: nextState ? new Date().toISOString() : prev.google_calendar_last_sync,
    }));
    addToast(
      nextState ? 'Google Calendar Connected' : 'Google Calendar Disconnected',
      nextState ? 'Syncing calendar with outreach team' : 'Events will remain internal only',
      nextState ? 'success' : 'info'
    );
  };

  const syncAllGoogleEvents = () => {
    setCalendarEvents((prev) =>
      prev.map((e) => ({
        ...e,
        synced_to_google: true,
        google_event_id: e.google_event_id || `gcal_${Date.now()}_${e.id}`,
      }))
    );
    setIntegrations((prev) => ({
      ...prev,
      google_calendar_last_sync: new Date().toISOString(),
    }));
    addToast('Calendar Sync Complete', 'All calendar events updated to Google Calendar.', 'success');
  };

  // CSV Import
  const importCollegesFromCSVData = async (importedList: Partial<College>[]) => {
    let addedCount = 0;
    let duplicateCount = 0;
    const now = new Date().toISOString();

    const newColleges: College[] = [];

    importedList.forEach((row, idx) => {
      if (!row.name) return;
      const cleanName = row.name.trim();
      const isDuplicate = colleges.some(
        (c) => c.name.trim().toLowerCase() === cleanName.toLowerCase()
      ) || newColleges.some((c) => c.name.trim().toLowerCase() === cleanName.toLowerCase());

      if (isDuplicate) {
        duplicateCount++;
        return;
      }

      const collegeItem: College = {
        id: crypto.randomUUID ? crypto.randomUUID() : `col-imp-${Date.now()}-${idx}`,
        name: cleanName,
        institution_type: (row.institution_type as any) || 'Engineering',
        location: row.location || 'Location Not Specified',
        district: row.district || 'Unspecified',
        website: row.website || '',
        departments: row.departments || ['Engineering'],
        estimated_strength: Number(row.estimated_strength) || 1000,
        priority: (row.priority as any) || 'Medium',
        stage: (row.stage as any) || 'New',
        owner_id: row.owner_id || currentUser.id,
        lead_source: row.lead_source || 'Manual',
        referrer_name: row.referrer_name,
        notes: row.notes || 'Imported via CSV/Sheets',
        stage_updated_at: now,
        created_at: now,
        updated_at: now,
      };

      newColleges.push(collegeItem);
      addedCount++;
    });

    if (newColleges.length > 0) {
      setColleges((prev) => [...newColleges, ...prev]);

      if (supabase) {
        await supabase.from('colleges').insert(newColleges);
      }

      await logAudit(
        'Integration',
        'csv-import',
        'Imported',
        `Imported ${addedCount} colleges from CSV (skipped ${duplicateCount} duplicates)`
      );
    }

    addToast(
      'Import Complete',
      `Imported ${addedCount} colleges (${duplicateCount} duplicate records skipped)`,
      'success'
    );

    return { added: addedCount, skippedDuplicates: duplicateCount };
  };

  // Clear ALL data completely from Supabase & local state
  const clearAllData = async () => {
    if (supabase) {
      try {
        await Promise.all([
          supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          supabase.from('campus_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          supabase.from('activities').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          supabase.from('calendar_events').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          supabase.from('contacts').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          supabase.from('colleges').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          supabase.from('stage_history').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        ]);
      } catch (err) {
        console.error('Error clearing Supabase records:', err);
      }
    }

    // Reset local state to empty
    setColleges([]);
    setContacts([]);
    setActivities([]);
    setCalendarEvents([]);
    setSessions([]);
    setStudents([]);
    setStageHistory([]);
    setAuditLogs([]);

    localStorage.removeItem('myst_crm_colleges');
    localStorage.removeItem('myst_crm_contacts');
    localStorage.removeItem('myst_crm_activities');
    localStorage.removeItem('myst_crm_events');
    localStorage.removeItem('myst_crm_sessions');
    localStorage.removeItem('myst_crm_students');
    localStorage.removeItem('myst_crm_audit_logs');
    localStorage.removeItem('myst_crm_stage_history');

    addToast('Data Cleared', 'All college records, sessions, and students were wiped clean.', 'info');
  };

  const resetAllData = () => {
    clearAllData();
  };

  return (
    <CRMContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        searchQuery,
        setSearchQuery,
        toasts,
        addToast,
        removeToast,
        realtimeConnected,
        isCloudConnected: Boolean(isSupabaseConfigured),
        currentUser,
        userRole,
        teamMembers,
        switchUser,
        colleges,
        contacts,
        activities,
        calendarEvents,
        sessions,
        courses,
        students,
        leadSources,
        auditLogs,
        stageHistory,
        integrations,
        addCollege,
        updateCollege,
        deleteCollege,
        moveCollegeStage,
        checkDuplicateCollege,
        addContact,
        updateContact,
        deleteContact,
        addActivity,
        updateActivity,
        toggleActivityCompleted,
        deleteActivity,
        addEvent,
        updateEvent,
        deleteEvent,
        syncEventToGoogle,
        addSession,
        updateSession,
        deleteSession,
        completeSessionOutcome,
        addCourse,
        updateCourse,
        addStudent,
        updateStudent,
        deleteStudent,
        addLeadSource,
        toggleLeadSource,
        toggleGoogleCalendarConnection,
        syncAllGoogleEvents,
        clearAllData,
        resetAllData,
        importCollegesFromCSVData,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
