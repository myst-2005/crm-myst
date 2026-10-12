export type Role = 'Admin' | 'Manager' | 'Team Member';

export type PipelineStage =
  | 'New'
  | 'Contacted'
  | 'Meeting Scheduled'
  | 'Session Proposed'
  | 'Approved'
  | 'Session Scheduled'
  | 'Session Completed'
  | 'Course Proposed'
  | 'Converted'
  | 'Lost'
  | 'On Hold';

export type InstitutionType =
  | 'Engineering'
  | 'Arts & Science'
  | 'Polytechnic'
  | 'University / Autonomous'
  | 'Management / Business'
  | 'Other';

export type Priority = 'High' | 'Medium' | 'Low';

export type LeadSource = 'Manual' | 'Instagram' | 'Referral' | 'Calendar' | string;

export type PreferredContactMethod = 'Call' | 'WhatsApp' | 'Email' | 'Meeting';

export type TechnologyTrack =
  | 'AI & Automation'
  | 'AI Agents'
  | 'No-code & Vibe Coding'
  | 'Data Analytics';

export type SessionApprovalStatus = 'Proposed' | 'Approved' | 'Scheduled' | 'Completed' | 'Cancelled';

export type ActivityType = 'Call' | 'Email' | 'WhatsApp' | 'Meeting' | 'Note' | 'Task';

export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid';

export type StudentLeadStage = 'Interested' | 'Enrolled' | 'Dropped';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  active: boolean;
  created_at?: string;
}

export interface College {
  id: string;
  name: string;
  institution_type: InstitutionType;
  location: string;
  district: string;
  website?: string;
  departments: string[];
  estimated_strength: number;
  priority: Priority;
  stage: PipelineStage;
  owner_id: string; // TeamMember id
  lead_source: LeadSource;
  referrer_name?: string; // If referral, friend/faculty name
  poc_name?: string;  // Point of Contact name
  poc_phone?: string; // Point of Contact phone
  last_contacted_at?: string; // ISO date
  next_follow_up_date?: string; // YYYY-MM-DD
  next_action?: string;
  notes?: string;
  lost_reason?: string;
  stage_updated_at: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  college_id: string;
  name: string;
  designation: string;
  department?: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  relationship_owner_id: string;
  preferred_method: PreferredContactMethod;
  notes?: string;
  created_at: string;
}

export interface Activity {
  id: string;
  college_id: string;
  contact_id?: string;
  type: ActivityType;
  title: string;
  description?: string;
  due_date?: string; // ISO or YYYY-MM-DD
  completed: boolean;
  outcome?: string;
  assigned_to_id: string;
  created_by_id: string;
  created_at: string;
}

export interface EventParticipant {
  name: string;
  email?: string;
  is_team_member: boolean;
  team_member_id?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  event_type: 'Call' | 'Meeting' | 'Campus Session' | 'Reminder' | 'Task';
  start_time: string; // ISO string
  end_time: string; // ISO string
  venue?: string;
  college_id?: string;
  contact_id?: string;
  owner_id: string;
  participants: EventParticipant[];
  session_track?: TechnologyTrack;
  approval_status?: SessionApprovalStatus;
  google_event_id?: string;
  synced_to_google: boolean;
  outcome?: string;
  notes?: string;
  created_at: string;
}

export interface CampusSession {
  id: string;
  college_id: string;
  title: string;
  track: TechnologyTrack;
  coordinator_name: string;
  proposed_date: string;
  confirmed_date?: string;
  time?: string;
  venue?: string;
  team_member_ids: string[];
  approval_status: SessionApprovalStatus;
  expected_attendance: number;
  actual_attendance?: number;
  feedback_score?: number; // 1-5 scale
  notes?: string;
  post_session_completed: boolean;
  interested_students_count?: number;
  next_action?: string;
  follow_up_owner_id?: string;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  track: TechnologyTrack;
  description: string;
  duration_weeks: number;
  standard_price: number;
  active: boolean;
  created_at: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  college_id: string;
  session_id?: string;
  course_id?: string;
  consent_status: boolean;
  lead_stage: StudentLeadStage;
  payment_status: PaymentStatus;
  agreed_fee: number;
  enrolled_date?: string;
  notes?: string;
  created_at: string;
}

export interface CustomLeadSource {
  id: string;
  name: string;
  category: string;
  referrer_name?: string;
  active: boolean;
}

export interface AuditLog {
  id: string;
  entity_type: 'College' | 'Contact' | 'Session' | 'Student' | 'Task' | 'Event' | 'Integration';
  entity_id: string;
  action: 'Created' | 'Updated' | 'Stage Changed' | 'Deleted' | 'Synced' | 'Imported';
  details: string;
  user_name: string;
  timestamp: string;
}

export interface IntegrationStatus {
  google_calendar_connected: boolean;
  google_calendar_id?: string;
  google_calendar_last_sync?: string;
  gmail_connected: boolean;
  gmail_account?: string;
  sheets_last_import?: string;
  sheets_last_export?: string;
  error_logs: { timestamp: string; service: string; message: string }[];
}

export interface StageHistoryEntry {
  id: string;
  college_id: string;
  from_stage: PipelineStage;
  to_stage: PipelineStage;
  reason?: string;
  user_id: string;
  timestamp: string;
}
