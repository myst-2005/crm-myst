import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Course, TechnologyTrack } from '../../types/crm';
import { TrackBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { BookOpen, Plus, Edit2, IndianRupee, Clock, Users, Sparkles } from 'lucide-react';

export const CoursesView: React.FC = () => {
  const { courses, students, addCourse, updateCourse } = useCRM();

  const [modalOpen, setModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [name, setName] = useState('');
  const [track, setTrack] = useState<TechnologyTrack>('AI Agents');
  const [description, setDescription] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [standardPrice, setStandardPrice] = useState(5499);

  const handleOpenAdd = () => {
    setCourseToEdit(null);
    setName('');
    setTrack('AI Agents');
    setDescription('');
    setDurationWeeks(4);
    setStandardPrice(5499);
    setModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setCourseToEdit(course);
    setName(course.name);
    setTrack(course.track);
    setDescription(course.description);
    setDurationWeeks(course.duration_weeks);
    setStandardPrice(course.standard_price);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (courseToEdit) {
      updateCourse(courseToEdit.id, {
        name: name.trim(),
        track,
        description: description.trim(),
        duration_weeks: Number(durationWeeks),
        standard_price: Number(standardPrice),
      });
    } else {
      addCourse({
        name: name.trim(),
        track,
        description: description.trim(),
        duration_weeks: Number(durationWeeks),
        standard_price: Number(standardPrice),
        active: true,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-600" /> Technology Course Catalogue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurable tracks, duration, and flexible pricing models for campus masterclasses
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Courses Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {courses.map((course) => {
          const enrolledStudents = students.filter((s) => s.course_id === course.id);
          const revenue = enrolledStudents.reduce(
            (sum, s) => sum + (s.payment_status === 'Paid' ? s.agreed_fee : 0),
            0
          );

          return (
            <div
              key={course.id}
              className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-subtle hover:shadow-premium hover:border-brand-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <TrackBadge track={course.track} />
                  <button
                    onClick={() => handleOpenEdit(course)}
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    title="Edit pricing or duration"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-black text-slate-900 mt-3">{course.name}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{course.description}</p>

                <div className="grid grid-cols-2 gap-3 mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Duration
                    </span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {course.duration_weeks} Weeks
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Standard Price
                    </span>
                    <span className="font-extrabold text-brand-700 text-sm">
                      ₹{course.standard_price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Revenue & Enrollment */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{enrolledStudents.length} Students Enrolled</span>
                </div>
                <div className="font-black text-emerald-700">
                  ₹{revenue.toLocaleString()} Revenue
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={courseToEdit ? 'Edit Course Track' : 'Add New Course'}
        subtitle="Manage masterclass duration and standard student fee"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Autonomous AI Agents & Workflows"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Technology Track *</label>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value as TechnologyTrack)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="AI & Automation">AI & Automation</option>
              <option value="AI Agents">AI Agents</option>
              <option value="No-code & Vibe Coding">No-code & Vibe Coding</option>
              <option value="Data Analytics">Data Analytics</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Weeks) *</label>
              <input
                type="number"
                required
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Standard Price (₹) *</label>
              <input
                type="number"
                required
                value={standardPrice}
                onChange={(e) => setStandardPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              Save Course
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
