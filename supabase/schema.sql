-- ==============================================================================
-- MYST Edge Campus CRM — Production Supabase / PostgreSQL Schema & RLS Policies
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Manager', 'Team Member')) DEFAULT 'Team Member',
    avatar TEXT,
    phone TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOM LEAD SOURCES
CREATE TABLE IF NOT EXISTS lead_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'Inbound',
    referrer_name TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COLLEGES TABLE
CREATE TABLE IF NOT EXISTS colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    institution_type TEXT NOT NULL CHECK (institution_type IN ('Engineering', 'Arts & Science', 'Polytechnic', 'University / Autonomous', 'Management / Business', 'Other')),
    location TEXT NOT NULL,
    district TEXT NOT NULL,
    website TEXT,
    departments TEXT[] DEFAULT '{}',
    estimated_strength INTEGER DEFAULT 0,
    priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')) DEFAULT 'Medium',
    stage TEXT NOT NULL CHECK (stage IN (
        'New', 'Contacted', 'Meeting Scheduled', 'Session Proposed',
        'Approved', 'Session Scheduled', 'Session Completed',
        'Course Proposed', 'Converted', 'Lost', 'On Hold'
    )) DEFAULT 'New',
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    lead_source TEXT NOT NULL DEFAULT 'Manual',
    referrer_name TEXT,
    last_contacted_at TIMESTAMPTZ,
    next_follow_up_date DATE,
    next_action TEXT,
    notes TEXT,
    lost_reason TEXT,
    stage_updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching and filtering
CREATE INDEX IF NOT EXISTS idx_colleges_stage ON colleges(stage);
CREATE INDEX IF NOT EXISTS idx_colleges_owner ON colleges(owner_id);
CREATE INDEX IF NOT EXISTS idx_colleges_district ON colleges(district);
CREATE INDEX IF NOT EXISTS idx_colleges_priority ON colleges(priority);

-- 4. CONTACTS TABLE (One College -> Multiple Contacts)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    department TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    whatsapp TEXT,
    relationship_owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    preferred_method TEXT NOT NULL CHECK (preferred_method IN ('Call', 'WhatsApp', 'Email', 'Meeting')) DEFAULT 'Call',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_college ON contacts(college_id);

-- 5. ACTIVITIES & TASKS TABLE
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('Call', 'Email', 'WhatsApp', 'Meeting', 'Note', 'Task')),
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    completed BOOLEAN DEFAULT false,
    outcome TEXT,
    assigned_to_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_college ON activities(college_id);
CREATE INDEX IF NOT EXISTS idx_activities_assigned ON activities(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities(due_date);

-- 6. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    track TEXT NOT NULL CHECK (track IN ('AI & Automation', 'AI Agents', 'No-code & Vibe Coding', 'Data Analytics')),
    description TEXT,
    duration_weeks INTEGER NOT NULL DEFAULT 4,
    standard_price NUMERIC(10, 2) NOT NULL DEFAULT 4999.00,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CAMPUS SESSIONS TABLE
CREATE TABLE IF NOT EXISTS campus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    track TEXT NOT NULL CHECK (track IN ('AI & Automation', 'AI Agents', 'No-code & Vibe Coding', 'Data Analytics')),
    coordinator_name TEXT NOT NULL,
    proposed_date DATE NOT NULL,
    confirmed_date DATE,
    time TEXT,
    venue TEXT,
    team_member_ids UUID[] DEFAULT '{}',
    approval_status TEXT NOT NULL CHECK (approval_status IN ('Proposed', 'Approved', 'Scheduled', 'Completed', 'Cancelled')) DEFAULT 'Proposed',
    expected_attendance INTEGER DEFAULT 0,
    actual_attendance INTEGER,
    feedback_score NUMERIC(3, 2),
    notes TEXT,
    post_session_completed BOOLEAN DEFAULT false,
    interested_students_count INTEGER DEFAULT 0,
    next_action TEXT,
    follow_up_owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_college ON campus_sessions(college_id);

-- 8. CALENDAR EVENTS TABLE
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('Call', 'Meeting', 'Campus Session', 'Reminder', 'Task')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    venue TEXT,
    college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    participants JSONB DEFAULT '[]'::jsonb,
    session_track TEXT,
    approval_status TEXT,
    google_event_id TEXT,
    synced_to_google BOOLEAN DEFAULT false,
    outcome TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. STUDENTS & ENROLMENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    session_id UUID REFERENCES campus_sessions(id) ON DELETE SET NULL,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    consent_status BOOLEAN DEFAULT true,
    lead_stage TEXT NOT NULL CHECK (lead_stage IN ('Interested', 'Enrolled', 'Dropped')) DEFAULT 'Interested',
    payment_status TEXT NOT NULL CHECK (payment_status IN ('Unpaid', 'Partial', 'Paid')) DEFAULT 'Unpaid',
    agreed_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    enrolled_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_email_college UNIQUE (email, college_id)
);

CREATE INDEX IF NOT EXISTS idx_students_college ON students(college_id);
CREATE INDEX IF NOT EXISTS idx_students_course ON students(course_id);

-- 10. STAGE HISTORY TABLE
CREATE TABLE IF NOT EXISTS stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    from_stage TEXT NOT NULL,
    to_stage TEXT NOT NULL,
    reason TEXT,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    user_name TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper to check user role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Authenticated users can view profiles; only self or Admin can update
CREATE POLICY "Profiles viewable by all authenticated users"
ON profiles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Profiles updatable by self or Admin"
ON profiles FOR UPDATE USING (
  auth.uid() = id OR current_user_role() = 'Admin'
);

-- Colleges: Admins & Managers see all; Team members see assigned or can view all for collaboration
CREATE POLICY "Colleges readable by authenticated team"
ON colleges FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Colleges editable by team"
ON colleges FOR ALL USING (
  current_user_role() IN ('Admin', 'Manager') OR owner_id = auth.uid() OR owner_id IS NULL
);

-- Contacts: Full team read, assignment or admin write
CREATE POLICY "Contacts readable by authenticated team"
ON contacts FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Contacts manageable by authenticated team"
ON contacts FOR ALL USING (auth.role() = 'authenticated');

-- Courses: Read by all, manageable by Admin
CREATE POLICY "Courses readable by all"
ON courses FOR SELECT USING (true);

CREATE POLICY "Courses managed by Admin"
ON courses FOR ALL USING (current_user_role() = 'Admin');

-- Students: Read/Write by authenticated team
CREATE POLICY "Students readable by authenticated team"
ON students FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Students manageable by authenticated team"
ON students FOR ALL USING (auth.role() = 'authenticated');

-- Campus Sessions: Read/Write by team
CREATE POLICY "Sessions manageable by authenticated team"
ON campus_sessions FOR ALL USING (auth.role() = 'authenticated');

-- Activities & Calendar Events: Read/Write by authenticated team
CREATE POLICY "Activities manageable by authenticated team"
ON activities FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Events manageable by authenticated team"
ON calendar_events FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Audit logs insertable by all, viewable by Admin/Manager"
ON audit_logs FOR SELECT USING (current_user_role() IN ('Admin', 'Manager'));

CREATE POLICY "Audit logs insertable"
ON audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
