import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Student, PaymentStatus, StudentLeadStage } from '../../types/crm';
import { PaymentBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  UserCheck,
  Plus,
  IndianRupee,
  Search,
  Building,
  BookOpen,
  CheckCircle,
  Clock,
  Trash2,
  Edit2,
  Mail,
  Phone,
} from 'lucide-react';

export const StudentsView: React.FC<{
  onOpenCollegeDetail: (id: string) => void;
}> = ({ onOpenCollegeDetail }) => {
  const {
    students,
    colleges,
    courses,
    sessions,
    addStudent,
    updateStudent,
    deleteStudent,
    searchQuery,
  } = useCRM();

  // Filters
  const [collegeFilter, setCollegeFilter] = useState('ALL');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  // New Student Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCollegeId, setSelectedCollegeId] = useState(colleges[0]?.id || '');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [leadStage, setLeadStage] = useState<StudentLeadStage>('Enrolled');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [agreedFee, setAgreedFee] = useState<number>(5499);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Calculations
  const verifiedPaidEnrolments = students.filter(
    (s) => s.lead_stage === 'Enrolled' && s.payment_status === 'Paid'
  ).length;

  const totalCollectedRevenue = students.reduce((sum, s) => {
    if (s.payment_status === 'Paid') return sum + s.agreed_fee;
    if (s.payment_status === 'Partial') return sum + s.agreed_fee * 0.5;
    return sum;
  }, 0);

  const totalExpectedRevenue = students.reduce((sum, s) => sum + s.agreed_fee, 0);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesEmail = s.email.toLowerCase().includes(q);
        const matchesPhone = s.phone.includes(q);
        const linkedCol = colleges.find((c) => c.id === s.college_id);
        const matchesCol = linkedCol?.name.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesCol) return false;
      }

      if (collegeFilter !== 'ALL' && s.college_id !== collegeFilter) return false;
      if (courseFilter !== 'ALL' && s.course_id !== courseFilter) return false;
      if (paymentFilter !== 'ALL' && s.payment_status !== paymentFilter) return false;

      return true;
    });
  }, [students, colleges, searchQuery, collegeFilter, courseFilter, paymentFilter]);

  const handleOpenAddModal = () => {
    setStudentToEdit(null);
    setName('');
    setEmail('');
    setPhone('+91 ');
    setSelectedCollegeId(colleges[0]?.id || '');
    setSelectedSessionId('');
    setSelectedCourseId(courses[0]?.id || '');
    setLeadStage('Enrolled');
    setPaymentStatus('Paid');
    setAgreedFee(courses[0]?.standard_price || 5499);
    setNotes('');
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (stu: Student) => {
    setStudentToEdit(stu);
    setName(stu.name);
    setEmail(stu.email);
    setPhone(stu.phone);
    setSelectedCollegeId(stu.college_id);
    setSelectedSessionId(stu.session_id || '');
    setSelectedCourseId(stu.course_id || courses[0]?.id || '');
    setLeadStage(stu.lead_stage);
    setPaymentStatus(stu.payment_status);
    setAgreedFee(stu.agreed_fee);
    setNotes(stu.notes || '');
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !selectedCollegeId) return;

    if (studentToEdit) {
      await updateStudent(studentToEdit.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        college_id: selectedCollegeId,
        session_id: selectedSessionId || undefined,
        course_id: selectedCourseId || undefined,
        lead_stage: leadStage,
        payment_status: paymentStatus,
        agreed_fee: Number(agreedFee),
        notes: notes.trim() || undefined,
      });
      setModalOpen(false);
    } else {
      const res = await addStudent({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        college_id: selectedCollegeId,
        session_id: selectedSessionId || undefined,
        course_id: selectedCourseId || undefined,
        consent_status: true,
        lead_stage: leadStage,
        payment_status: paymentStatus,
        agreed_fee: Number(agreedFee),
        enrolled_date: new Date().toISOString().split('T')[0],
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        setModalOpen(false);
      } else {
        setErrorMessage(res.error || 'Failed to add student.');
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-brand-600" /> Student Enrolments & Conversions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual student records traced back to college awareness sessions and paid masterclasses
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Register Student</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-subtle">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Verified Paid Enrolments
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {verifiedPaidEnrolments}{' '}
            <span className="text-xs font-medium text-slate-400">
              ({students.length} Total Leads)
            </span>
          </p>
        </div>

        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 shadow-subtle">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Collected Verified Revenue
          </span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            ₹{totalCollectedRevenue.toLocaleString()}
          </p>
        </div>

        <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 shadow-subtle">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
            Expected Total Pipeline
          </span>
          <p className="text-2xl font-black text-purple-900 mt-1">
            ₹{totalExpectedRevenue.toLocaleString()}
          </p>
        </div>
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
          <span className="font-bold text-slate-500">Course:</span>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="ALL">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-500">Payment:</span>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="ALL">All Payment States</option>
            <option value="Paid">Paid in Full</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Student Name & Contact</th>
                <th className="py-3 px-3">College</th>
                <th className="py-3 px-3">Course Track</th>
                <th className="py-3 px-3">Lead Stage</th>
                <th className="py-3 px-3">Agreed Fee</th>
                <th className="py-3 px-3">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No student enrolments found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {
                  const linkedCollege = colleges.find((c) => c.id === stu.college_id);
                  const linkedCourse = courses.find((c) => c.id === stu.course_id);

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{stu.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{stu.email}</span>
                          <span>·</span>
                          <span>{stu.phone}</span>
                        </div>
                      </td>

                      {/* College */}
                      <td className="py-3.5 px-3">
                        {linkedCollege ? (
                          <span
                            onClick={() => onOpenCollegeDetail(linkedCollege.id)}
                            className="font-semibold text-brand-600 hover:underline cursor-pointer"
                          >
                            {linkedCollege.name}
                          </span>
                        ) : (
                          'None'
                        )}
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-800">
                          {linkedCourse ? linkedCourse.name : 'Undecided Track'}
                        </span>
                      </td>

                      {/* Lead Stage */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            stu.lead_stage === 'Enrolled'
                              ? 'bg-emerald-100 text-emerald-800'
                              : stu.lead_stage === 'Interested'
                              ? 'bg-brand-100 text-brand-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {stu.lead_stage}
                        </span>
                      </td>

                      {/* Fee */}
                      <td className="py-3.5 px-3">
                        <span className="font-extrabold text-slate-900">
                          ₹{stu.agreed_fee.toLocaleString()}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-3">
                        <PaymentBadge status={stu.payment_status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(stu)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Student"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete record for ${stu.name}?`)) {
                                deleteStudent(stu.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Student Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={studentToEdit ? 'Edit Student Record' : 'Register Student'}
        subtitle="Capture course interest, agreed fee, and payment status"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Karthik Rao"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="karthik.rao@gmail.com"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 11223"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Origin College *</label>
            <select
              required
              value={selectedCollegeId}
              onChange={(e) => setSelectedCollegeId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Selected Course Track</label>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  const c = courses.find((course) => course.id === e.target.value);
                  if (c) setAgreedFee(c.standard_price);
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} (₹{course.standard_price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Agreed Fee (₹) *</label>
              <input
                type="number"
                required
                value={agreedFee}
                onChange={(e) => setAgreedFee(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lead Stage</label>
              <select
                value={leadStage}
                onChange={(e) => setLeadStage(e.target.value as StudentLeadStage)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Interested">Interested</option>
                <option value="Enrolled">Enrolled</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Paid">Paid in Full</option>
                <option value="Partial">Partial Payment</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Batch schedule preference, payment receipt ID..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md"
            >
              {studentToEdit ? 'Save Changes' : 'Register Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
