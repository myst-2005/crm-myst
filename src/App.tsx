import React, { useState } from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { CollegesView } from './components/colleges/CollegesView';
import { CollegeModal } from './components/colleges/CollegeModal';
import { CollegeDetailDrawer } from './components/colleges/CollegeDetailDrawer';
import { ContactsView } from './components/contacts/ContactsView';
import { ContactModal } from './components/contacts/ContactModal';
import { PipelineView } from './components/pipeline/PipelineView';
import { CalendarView } from './components/calendar/CalendarView';
import { TasksView } from './components/tasks/TasksView';
import { SessionsView } from './components/sessions/SessionsView';
import { StudentsView } from './components/students/StudentsView';
import { CoursesView } from './components/courses/CoursesView';
import { ReportsView } from './components/reports/ReportsView';
import { IntegrationsView } from './components/integrations/IntegrationsView';
import { SettingsView } from './components/settings/SettingsView';
import { LoginPage } from './components/auth/LoginPage';
import { ToastContainer } from './components/common/ToastContainer';
import { College, Contact } from './types/crm';

interface AppContentProps {
  isAuthenticated?: boolean;
  onAuth?: () => void;
}

const AppContent: React.FC<AppContentProps> = ({ isAuthenticated = true, onAuth = () => {} }) => {
  const { currentTab, colleges } = useCRM();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal / Drawer states
  const [collegeModalOpen, setCollegeModalOpen] = useState(false);
  const [collegeToEdit, setCollegeToEdit] = useState<College | null>(null);

  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [contactCollegeId, setContactCollegeId] = useState<string | undefined>();

  // Handlers
  const handleOpenNewCollege = () => {
    setCollegeToEdit(null);
    setCollegeModalOpen(true);
  };

  const handleEditCollege = (id: string) => {
    const target = colleges.find((c) => c.id === id);
    if (target) {
      setCollegeToEdit(target);
      setCollegeModalOpen(true);
    }
  };

  const handleOpenCollegeDetail = (id: string) => {
    setSelectedCollegeId(id);
    setDetailDrawerOpen(true);
  };

  const handleOpenNewContact = (collegeId?: string) => {
    setContactToEdit(null);
    setContactCollegeId(collegeId);
    setContactModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setContactToEdit(contact);
    setContactCollegeId(contact.college_id);
    setContactModalOpen(true);
  };

  // If trying to access internal CRM while unauthenticated
  if (!isAuthenticated) {
    return <LoginPage onAuth={onAuth} />;
  }

  return (
    <div className="min-h-screen bg-[#0B0A24] text-[#F7F7FF] flex">
      {/* Sidebar navigation */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-56">
        {/* Top Navbar */}
        <Navbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNewCollegeModal={handleOpenNewCollege}
        />

        {/* Tab Viewport */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              onOpenNewCollege={handleOpenNewCollege}
              onOpenCollegeDetail={handleOpenCollegeDetail}
            />
          )}

          {currentTab === 'colleges' && (
            <CollegesView
              onOpenNewCollege={handleOpenNewCollege}
              onOpenCollegeDetail={handleOpenCollegeDetail}
              onEditCollege={handleEditCollege}
            />
          )}

          {currentTab === 'contacts' && (
            <ContactsView
              onOpenNewContact={() => handleOpenNewContact()}
              onEditContact={handleEditContact}
              onOpenCollegeDetail={handleOpenCollegeDetail}
            />
          )}

          {currentTab === 'pipeline' && (
            <PipelineView onOpenCollegeDetail={handleOpenCollegeDetail} />
          )}

          {currentTab === 'calendar' && (
            <CalendarView onOpenCollegeDetail={handleOpenCollegeDetail} />
          )}

          {currentTab === 'tasks' && (
            <TasksView onOpenCollegeDetail={handleOpenCollegeDetail} />
          )}

          {currentTab === 'sessions' && (
            <SessionsView onOpenCollegeDetail={handleOpenCollegeDetail} />
          )}

          {currentTab === 'students' && (
            <StudentsView onOpenCollegeDetail={handleOpenCollegeDetail} />
          )}

          {currentTab === 'courses' && <CoursesView />}

          {currentTab === 'reports' && <ReportsView />}

          {currentTab === 'integrations' && <IntegrationsView />}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* College Modal (Create / Edit) */}
      <CollegeModal
        isOpen={collegeModalOpen}
        onClose={() => {
          setCollegeModalOpen(false);
          setCollegeToEdit(null);
        }}
        collegeToEdit={collegeToEdit}
      />

      {/* College Detail Drawer */}
      <CollegeDetailDrawer
        isOpen={detailDrawerOpen}
        onClose={() => {
          setDetailDrawerOpen(false);
          setSelectedCollegeId(null);
        }}
        collegeId={selectedCollegeId}
        onEdit={(id) => {
          handleEditCollege(id);
        }}
        onOpenNewContact={(cId) => handleOpenNewContact(cId)}
        onOpenNewSession={() => {}}
        onOpenNewActivity={() => {}}
        onOpenNewStudent={() => {}}
      />

      {/* Contact Modal (Create / Edit) */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setContactToEdit(null);
        }}
        collegeId={contactCollegeId}
        contactToEdit={contactToEdit}
      />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default function App({ isAuthenticated = true, onAuth = () => {} }: AppContentProps) {
  return (
    <CRMProvider>
      <AppContent isAuthenticated={isAuthenticated} onAuth={onAuth} />
    </CRMProvider>
  );
}
