import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { supabase } from '../../lib/supabase';
import {
  Sparkles,
  ArrowRight,
  ChevronDown,
  Cpu,
  Bot,
  Code2,
  BarChart,
  CheckCircle2,
  Calendar,
  Building2,
  GraduationCap,
  Users,
  ShieldCheck,
  Send,
  Loader2,
  ArrowUpRight,
  HelpCircle,
  FileText,
  MapPin,
  Mail,
  Phone,
  Layers,
  Check,
  ExternalLink,
} from 'lucide-react';

export const EdgeWebsiteView: React.FC = () => {
  const { setCurrentTab, addToast } = useCRM();

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Enquiry Form State
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    college_name: '',
    contact_name: '',
    designation: '',
    email: '',
    phone: '',
    district: 'Ernakulam',
    department: '',
    student_count: '150',
    technology_track: 'AI & Automation',
    preferred_date: '',
    additional_requirements: '',
    consent: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.college_name || !formData.contact_name || !formData.email || !formData.phone) {
      addToast('Missing Required Fields', 'Please fill in the required contact information.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (supabase) {
        // Try saving to website_enquiries table
        const { error } = await supabase.from('website_enquiries').insert([
          {
            college_name: formData.college_name,
            contact_name: formData.contact_name,
            designation: formData.designation,
            email: formData.email,
            phone: formData.phone,
            district: formData.district,
            department: formData.department,
            student_count: parseInt(formData.student_count) || 100,
            technology_track: formData.technology_track,
            preferred_date: formData.preferred_date,
            additional_requirements: formData.additional_requirements,
            consent: formData.consent,
          },
        ]);

        if (error) {
          console.warn('Enquiry table fallback to colleges:', error.message);
          // Fallback insert to colleges table
          await supabase.from('colleges').insert([
            {
              name: formData.college_name,
              institution_type: 'Engineering',
              location: formData.district,
              district: formData.district,
              estimated_strength: parseInt(formData.student_count) || 100,
              priority: 'High',
              stage: 'New',
              lead_source: 'Website Enquiry',
              poc_name: formData.contact_name,
              poc_phone: formData.phone,
              notes: `Track: ${formData.technology_track}. Preferred Date: ${formData.preferred_date}. Requirements: ${formData.additional_requirements}`,
            },
          ]);
        }
      }

      setSubmitted(true);
      addToast('Enquiry Received', 'Thank you! The Edge team will connect with your institution.', 'success');
    } catch (err: unknown) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToEnquiry = () => {
    const el = document.getElementById('enquiry-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const faqs = [
    {
      q: 'What is Edge?',
      a: 'Edge is a technology education and campus engagement initiative by MYST. We partner with colleges to introduce students to cutting-edge emerging technologies through practical, offline awareness sessions designed for real-world impact.',
    },
    {
      q: 'Who can request a campus session?',
      a: 'College Principals, Deans, Heads of Department (HODs), Training & Placement Officers (TPO), faculty coordinators, and recognised student body leads can request a customised campus session.',
    },
    {
      q: 'Is the initial awareness session free for the institution?',
      a: 'Yes. There is no initial session fee charged to the college for hosting the technology awareness session on campus. Students who subsequently choose to pursue in-depth, hands-on certification programmes can explore separate paid learning pathways.',
    },
    {
      q: 'Can the session be customised for our specific department?',
      a: 'Absolutely. We tailor curriculum, case studies, and practical demonstrations to match Computer Science, Electronics, Mechanical, Commerce, Design, or interdisciplinary audiences based on your academic calendar.',
    },
    {
      q: 'Which technology tracks are available?',
      a: 'We offer four primary focus tracks: (1) AI & Automation, (2) AI Agents & Autonomous Workflows, (3) No-code & Vibe Coding, and (4) Modern Data Analytics.',
    },
    {
      q: 'How long does an offline session typically last?',
      a: 'Sessions are typically structured for 90 to 120 minutes, including interactive live demonstrations and a direct Q&A segment with industry practitioners.',
    },
    {
      q: 'How does the college coordinate the session logistics?',
      a: 'Once you submit the campus enquiry form, our academic partnership team reviews your department objectives, shares a detailed session outline, and finalises dates and auditorium arrangements with your coordinator.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0A24] text-[#F7F7FF] selection:bg-[#8B5CF6]/30 selection:text-white">
      {/* 1. TOP MINIMAL NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-[#0B0A24]/85 backdrop-blur-xl border-b border-[rgba(196,181,253,0.12)] px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-[rgba(196,181,253,0.25)] shadow-[0_0_20px_rgba(139,92,246,0.3)] bg-[#0B0A24]">
              <img src="/edge-logo.jpg" alt="Edge Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-[#F7F7FF]">EDGE</span>
              </div>
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#AAA9C5] font-semibold">
                A MYST INITIATIVE
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-medium text-[#AAA9C5]">
            <a href="#about" className="hover:text-[#F7F7FF] transition-colors">About</a>
            <a href="#tracks" className="hover:text-[#F7F7FF] transition-colors">Technology Tracks</a>
            <a href="#for-colleges" className="hover:text-[#F7F7FF] transition-colors">For Colleges</a>
            <a href="#how-it-works" className="hover:text-[#F7F7FF] transition-colors">How It Works</a>
            <a href="#faqs" className="hover:text-[#F7F7FF] transition-colors">FAQs</a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="text-xs font-semibold text-[#AAA9C5] hover:text-[#F7F7FF] px-3 py-1.5 rounded-lg hover:bg-[#171638] transition-colors hidden sm:block"
            >
              Internal CRM →
            </button>
            <button
              onClick={scrollToEnquiry}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#4F7DFF] hover:from-[#7C3AED] hover:to-[#3B6AEC] text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] active:scale-95"
            >
              <span>Plan a Campus Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION WITH LUMINOUS HORIZON */}
      <section className="relative pt-16 pb-24 sm:pt-24 sm:pb-32 overflow-hidden px-4 sm:px-6">
        {/* Atmospheric Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#8B5CF6]/25 via-[#4F7DFF]/15 to-transparent blur-[140px] pointer-events-none rounded-full" />
        
        {/* Luminous Curved Horizon Line */}
        <div className="absolute top-[380px] sm:top-[420px] left-1/2 -translate-x-1/2 w-[1400px] h-[200px] pointer-events-none">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#C4B5FD] to-transparent opacity-60 shadow-[0_0_25px_#8B5CF6]" />
          <div className="w-full h-full bg-gradient-to-b from-[#8B5CF6]/15 via-transparent to-transparent rounded-[100%]" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#11102D] border border-[rgba(196,181,253,0.2)] mb-8 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#C4B5FD] uppercase">
              A MYST INITIATIVE
            </span>
          </div>

          {/* Primary Logo Showcase */}
          <div className="max-w-xs mx-auto mb-8 relative">
            <div className="rounded-3xl overflow-hidden border border-[rgba(196,181,253,0.25)] shadow-[0_0_50px_rgba(139,92,246,0.45)] bg-[#0B0A24] transform hover:scale-[1.02] transition-transform duration-500">
              <img
                src="/edge-logo.jpg"
                alt="Edge — A MYST Initiative"
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Luminous horizon highlight beneath logo */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-gradient-to-r from-transparent via-[#C4B5FD] to-transparent rounded-full blur-[2px]" />
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6">
            Bring the Next Wave of <br />
            <span className="edge-gradient-text">Technology to Your Campus.</span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg text-[#AAA9C5] max-w-2xl mx-auto font-normal leading-relaxed mb-8">
            Customised, offline awareness sessions that help college students explore AI,
            automation, and emerging technologies through practical, relevant learning experiences.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button
              onClick={scrollToEnquiry}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#8B5CF6] to-[#4F7DFF] hover:from-[#7C3AED] hover:to-[#3B6AEC] text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_30px_rgba(139,92,246,0.4)] flex items-center justify-center gap-2"
            >
              <span>Plan a Campus Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#tracks"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#171638] hover:bg-[#11102D] text-[#F7F7FF] font-semibold text-sm rounded-xl border border-[rgba(196,181,253,0.18)] transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Technology Tracks</span>
            </a>
          </div>

          {/* Transparent Session Fee Tagline */}
          <div className="inline-flex items-center gap-2 text-xs text-[#AAA9C5]">
            <CheckCircle2 className="w-4 h-4 text-[#8B5CF6]" />
            <span>Designed around your college, department and students.</span>
            <span className="text-[#C4B5FD] font-semibold">· No initial session fee for the awareness session.</span>
          </div>
        </div>
      </section>

      {/* 3. THE PROBLEM AND OPPORTUNITY */}
      <section id="about" className="py-20 border-t border-[rgba(196,181,253,0.12)] bg-[#0B0A24] px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-bold tracking-[0.2em] text-[#8B5CF6] uppercase mb-2">
              ACADEMIC RELEVANCE
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F7F7FF] tracking-tight">
              Technology Is Moving Fast. <br />
              Student Exposure Should Keep Up.
            </h2>
            <p className="text-sm sm:text-base text-[#AAA9C5] mt-4 leading-relaxed">
              Emerging tools, AI workflows, and automation are reshaping how modern software and systems are built.
              Colleges need practical, grounded ways to introduce these developments without relying solely on textbook theory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#11102D] border border-[rgba(196,181,253,0.14)] p-7 rounded-2xl relative overflow-hidden group hover:border-[#8B5CF6]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 flex items-center justify-center text-[#C4B5FD] mb-5 border border-[#8B5CF6]/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#F7F7FF] mb-2">
                Discover Emerging Technology
              </h3>
              <p className="text-xs text-[#AAA9C5] leading-relaxed">
                Demystify real artificial intelligence, prompt engineering, agentic architecture, and modern developer toolchains with live, non-trivial demonstrations.
              </p>
            </div>

            <div className="bg-[#11102D] border border-[rgba(196,181,253,0.14)] p-7 rounded-2xl relative overflow-hidden group hover:border-[#8B5CF6]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#4F7DFF]/15 flex items-center justify-center text-[#4F7DFF] mb-5 border border-[#4F7DFF]/30">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#F7F7FF] mb-2">
                Explore Practical Applications
              </h3>
              <p className="text-xs text-[#AAA9C5] leading-relaxed">
                Connect academic computer science and engineering concepts directly to actual enterprise tools, real product building, and hands-on case studies.
              </p>
            </div>

            <div className="bg-[#11102D] border border-[rgba(196,181,253,0.14)] p-7 rounded-2xl relative overflow-hidden group hover:border-[#8B5CF6]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 flex items-center justify-center text-[#C4B5FD] mb-5 border border-[#8B5CF6]/30">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#F7F7FF] mb-2">
                Identify Relevant Learning Pathways
              </h3>
              <p className="text-xs text-[#AAA9C5] leading-relaxed">
                Equip students with structured roadmaps, project ideas, and industry guidance so they know how to continue building their skills after the session.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHAT EDGE BRINGS TO CAMPUS — 4 TECHNOLOGY TRACKS */}
      <section id="tracks" className="py-20 border-t border-[rgba(196,181,253,0.12)] bg-[#11102D]/60 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-[#C4B5FD] uppercase mb-2">
                CONFIGURABLE CURRICULUM
              </p>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F7F7FF] tracking-tight">
                Four Dedicated Technology Tracks
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#AAA9C5] max-w-md mt-4 md:mt-0">
              Each campus session can be tailored around one or more configurable learning themes depending on your department's specific interests.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Track 1 */}
            <div className="bg-[#171638] border border-[rgba(196,181,253,0.14)] p-6 rounded-2xl flex flex-col justify-between hover:border-[#8B5CF6] transition-all hover:shadow-[0_0_25px_rgba(139,92,246,0.2)]">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center text-[#C4B5FD] mb-4 border border-[#8B5CF6]/30">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-[#8B5CF6] uppercase">TRACK 01</span>
                <h3 className="text-base font-bold text-[#F7F7FF] mt-1 mb-2">AI & Automation</h3>
                <p className="text-xs text-[#AAA9C5] leading-relaxed">
                  Explore practical applications of generative AI tools, prompt patterns, API integrations, and workplace automation workflows.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[rgba(196,181,253,0.1)] flex items-center justify-between text-[11px] text-[#C4B5FD]">
                <span>LLMs & Automations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Track 2 */}
            <div className="bg-[#171638] border border-[rgba(196,181,253,0.14)] p-6 rounded-2xl flex flex-col justify-between hover:border-[#4F7DFF] transition-all hover:shadow-[0_0_25px_rgba(79,125,255,0.2)]">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#4F7DFF]/20 flex items-center justify-center text-[#4F7DFF] mb-4 border border-[#4F7DFF]/30">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-[#4F7DFF] uppercase">TRACK 02</span>
                <h3 className="text-base font-bold text-[#F7F7FF] mt-1 mb-2">AI Agents</h3>
                <p className="text-xs text-[#AAA9C5] leading-relaxed">
                  Understand how autonomous AI agents execute multi-step tasks, interface with tools, and solve domain-specific problems.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[rgba(196,181,253,0.1)] flex items-center justify-between text-[11px] text-[#4F7DFF]">
                <span>Autonomous Agents</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Track 3 */}
            <div className="bg-[#171638] border border-[rgba(196,181,253,0.14)] p-6 rounded-2xl flex flex-col justify-between hover:border-[#8B5CF6] transition-all hover:shadow-[0_0_25px_rgba(139,92,246,0.2)]">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center text-[#C4B5FD] mb-4 border border-[#8B5CF6]/30">
                  <Code2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-[#8B5CF6] uppercase">TRACK 03</span>
                <h3 className="text-base font-bold text-[#F7F7FF] mt-1 mb-2">No-code & Vibe Coding</h3>
                <p className="text-xs text-[#AAA9C5] leading-relaxed">
                  Discover how to rapidly prototype digital products, interactive web applications, and MVPs using visual development tools.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[rgba(196,181,253,0.1)] flex items-center justify-between text-[11px] text-[#C4B5FD]">
                <span>Rapid Prototyping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Track 4 */}
            <div className="bg-[#171638] border border-[rgba(196,181,253,0.14)] p-6 rounded-2xl flex flex-col justify-between hover:border-[#4F7DFF] transition-all hover:shadow-[0_0_25px_rgba(79,125,255,0.2)]">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#4F7DFF]/20 flex items-center justify-center text-[#4F7DFF] mb-4 border border-[#4F7DFF]/30">
                  <BarChart className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-[#4F7DFF] uppercase">TRACK 04</span>
                <h3 className="text-base font-bold text-[#F7F7FF] mt-1 mb-2">Data Analytics</h3>
                <p className="text-xs text-[#AAA9C5] leading-relaxed">
                  Discover how raw data is transformed into structured intelligence, business dashboards, and data-backed decision frameworks.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[rgba(196,181,253,0.1)] flex items-center justify-between text-[11px] text-[#4F7DFF]">
                <span>Insights & Dashboards</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CUSTOMISED FOR YOUR CAMPUS */}
      <section id="for-colleges" className="py-20 border-t border-[rgba(196,181,253,0.12)] bg-[#0B0A24] px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-[#8B5CF6] uppercase mb-2">
                INSTITUTIONAL TAILORING
              </p>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F7F7FF] tracking-tight leading-tight">
                One Campus. Different Needs. <br />
                A Session Designed Around Yours.
              </h2>
              <p className="text-sm text-[#AAA9C5] mt-4 leading-relaxed">
                We believe generic seminar presentations fail to hold student attention. Every Edge campus engagement is planned in close alignment with your department leads and student skill level.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#8B5CF6]/20 text-[#C4B5FD] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#F7F7FF]">Academic Discipline Alignment</h4>
                    <p className="text-[11px] text-[#AAA9C5]">Custom examples for Engineering, Arts & Science, Polytechnic, or Business students.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#8B5CF6]/20 text-[#C4B5FD] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#F7F7FF]">Flexible Session Formats</h4>
                    <p className="text-[11px] text-[#AAA9C5]">Structured for auditorium assemblies (100–300+ students) or interactive lab batches.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#8B5CF6]/20 text-[#C4B5FD] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#F7F7FF]">Zero Disruption to Timetables</h4>
                    <p className="text-[11px] text-[#AAA9C5]">Scheduled strictly during designated department seminar slots or post-exam windows.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Panel */}
            <div className="bg-[#11102D] border border-[rgba(196,181,253,0.16)] rounded-3xl p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5CF6]/10 blur-3xl pointer-events-none rounded-full" />
              <div className="flex items-center justify-between pb-6 border-b border-[rgba(196,181,253,0.1)] mb-6">
                <div>
                  <span className="text-[10px] font-bold text-[#8B5CF6] uppercase">CAMPUS PROFILE</span>
                  <h4 className="text-base font-bold text-[#F7F7FF]">College Customisation Matrix</h4>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#8B5CF6]/30">
                  Kerala & Pan-India
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#171638] border border-[rgba(196,181,253,0.08)] flex items-center justify-between">
                  <span className="text-xs text-[#AAA9C5]">Session Duration</span>
                  <span className="text-xs font-semibold text-[#F7F7FF]">90 – 120 Minutes</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#171638] border border-[rgba(196,181,253,0.08)] flex items-center justify-between">
                  <span className="text-xs text-[#AAA9C5]">Audience Size</span>
                  <span className="text-xs font-semibold text-[#F7F7FF]">50 to 500+ Students</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#171638] border border-[rgba(196,181,253,0.08)] flex items-center justify-between">
                  <span className="text-xs text-[#AAA9C5]">Delivery Mode</span>
                  <span className="text-xs font-semibold text-[#F7F7FF]">In-Person Offline Workshop</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#171638] border border-[rgba(196,181,253,0.08)] flex items-center justify-between">
                  <span className="text-xs text-[#AAA9C5]">Initial College Cost</span>
                  <span className="text-xs font-bold text-emerald-400">Zero Session Fee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS — 4-STEP JOURNEY */}
      <section id="how-it-works" className="py-20 border-t border-[rgba(196,181,253,0.12)] bg-[#11102D]/40 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold tracking-[0.2em] text-[#C4B5FD] uppercase mb-2">
              SEAMLESS COORDINATION
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F7F7FF] tracking-tight">
              How a Campus Session Works
            </h2>
            <p className="text-xs sm:text-sm text-[#AAA9C5] mt-3">
              A transparent four-step process built to respect your academic schedule and faculty time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#171638] border border-[rgba(196,181,253,0.14)] p-6 rounded-2xl relative">
              <span className="text-2xl font-black text-[#8B5CF6]/50">01</span>
              <h3 className="text-sm font-bold text-[#F7F7FF] mt-2 mb-2">Tell Us About Your College</h3>
              <p className="text-xs text-[#AAA9C5] leading-relaxed">
                Submit an enquiry sharing your institution, department, audience count, and primary learning goals.
              </p>
            </div>

            <div className="bg-[#171638] border border-[rgba(196,181,253,0.14)] p-6 rounded-2xl relative">
              <span className="text-2xl font-black text-[#4F7DFF]/50">02</span>
              <h3 className="text-sm font-bold text-[#F7F7FF] mt-2 mb-2">Plan the Session Together</h3>
              <p className="text-xs text-[#AAA9C5] leading-relaxed">
                Discuss suitable technology tracks, format, coordinator contacts, and date windows with our team.
              </p>
            </div>

            <div className="bg-[#171638] border border-[rgba(196,181,253,0.14)] p-6 rounded-2xl relative">
              <span className="text-2xl font-black text-[#8B5CF6]/50">03</span>
              <h3 className="text-sm font-bold text-[#F7F7FF] mt-2 mb-2">Experience the Campus Session</h3>
              <p className="text-xs text-[#AAA9C5] leading-relaxed">
                Our practitioners deliver the agreed offline awareness session directly on your college premises.
              </p>
            </div>

            <div className="bg-[#171638] border border-[rgba(196,181,253,0.14)] p-6 rounded-2xl relative">
              <span className="text-2xl font-black text-[#4F7DFF]/50">04</span>
              <h3 className="text-sm font-bold text-[#F7F7FF] mt-2 mb-2">Explore the Next Learning Step</h3>
              <p className="text-xs text-[#AAA9C5] leading-relaxed">
                Interested students can independently explore hands-on project cohorts and extended programmes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHY THIS MODEL WORKS */}
      <section className="py-20 border-t border-[rgba(196,181,253,0.12)] bg-[#0B0A24] px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-[#8B5CF6] uppercase mb-2">
            INSTITUTIONAL INTEGRITY
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F7F7FF] mb-12">
            Why Colleges Value This Engagement Model
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <div className="bg-[#11102D] p-6 rounded-2xl border border-[rgba(196,181,253,0.12)]">
              <h4 className="text-sm font-bold text-[#F7F7FF] mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8B5CF6]" />
                Explore Before Committing
              </h4>
              <p className="text-xs text-[#AAA9C5] leading-relaxed">
                Students and college management evaluate the quality, pedagogy, and technical substance firsthand before any optional deeper programmes.
              </p>
            </div>

            <div className="bg-[#11102D] p-6 rounded-2xl border border-[rgba(196,181,253,0.12)]">
              <h4 className="text-sm font-bold text-[#F7F7FF] mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4F7DFF]" />
                Ground Discussions in Reality
              </h4>
              <p className="text-xs text-[#AAA9C5] leading-relaxed">
                Rather than generic motivational speeches, our sessions showcase actual working software, realistic developer workflows, and actionable career context.
              </p>
            </div>

            <div className="bg-[#11102D] p-6 rounded-2xl border border-[rgba(196,181,253,0.12)]">
              <h4 className="text-sm font-bold text-[#F7F7FF] mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8B5CF6]" />
                Zero Administrative Burden
              </h4>
              <p className="text-xs text-[#AAA9C5] leading-relaxed">
                We handle speaker logistics, workshop presentation decks, and technical demonstration setups, requiring only standard auditorium AV support.
              </p>
            </div>

            <div className="bg-[#11102D] p-6 rounded-2xl border border-[rgba(196,181,253,0.12)]">
              <h4 className="text-sm font-bold text-[#F7F7FF] mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4F7DFF]" />
                Independent Student Choice
              </h4>
              <p className="text-xs text-[#AAA9C5] leading-relaxed">
                Paid course enrolment is strictly optional for individual students who want dedicated mentorship. No mandatory purchase is forced upon the college.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. INSTITUTIONAL ENQUIRY FORM */}
      <section id="enquiry-section" className="py-24 border-t border-[rgba(196,181,253,0.12)] bg-[#11102D] px-4 sm:px-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[#8B5CF6]/15 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#C4B5FD] uppercase bg-[#171638] px-3.5 py-1.5 rounded-full border border-[rgba(196,181,253,0.2)]">
              COMMENCE PARTNERSHIP
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F7F7FF] mt-4 tracking-tight">
              Let's Bring Edge to Your Campus.
            </h2>
            <p className="text-xs sm:text-sm text-[#AAA9C5] max-w-xl mx-auto mt-2">
              Share your institution's details. Our academic outreach team will reach out to discuss a suitable session for your students.
            </p>
          </div>

          <div className="bg-[#171638] border border-[rgba(196,181,253,0.2)] rounded-3xl p-6 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#F7F7FF]">Enquiry Successfully Submitted</h3>
                <p className="text-xs text-[#AAA9C5] max-w-md mx-auto">
                  Thank you, <span className="text-[#F7F7FF] font-semibold">{formData.contact_name}</span>. We have recorded your interest for <span className="text-[#F7F7FF] font-semibold">{formData.college_name}</span>. Our partnership team will contact you shortly on {formData.phone || formData.email}.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-[#11102D] hover:bg-[#0B0A24] text-xs font-semibold text-[#C4B5FD] rounded-xl border border-[rgba(196,181,253,0.2)] transition-all"
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#AAA9C5] mb-1.5 uppercase tracking-wider">
                      College / Institution Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.college_name}
                      onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
                      placeholder="e.g. Model Engineering College"
                      className="w-full px-4 py-2.5 bg-[#11102D] border border-[rgba(196,181,253,0.16)] rounded-xl text-xs text-[#F7F7FF] placeholder-[#AAA9C5]/40 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#AAA9C5] mb-1.5 uppercase tracking-wider">
                      Contact Person's Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      placeholder="e.g. Dr. Ramesh Kumar"
                      className="w-full px-4 py-2.5 bg-[#11102D] border border-[rgba(196,181,253,0.16)] rounded-xl text-xs text-[#F7F7FF] placeholder-[#AAA9C5]/40 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#AAA9C5] mb-1.5 uppercase tracking-wider">
                      Designation *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. HOD / Placement Officer"
                      className="w-full px-4 py-2.5 bg-[#11102D] border border-[rgba(196,181,253,0.16)] rounded-xl text-xs text-[#F7F7FF] placeholder-[#AAA9C5]/40 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#AAA9C5] mb-1.5 uppercase tracking-wider">
                      Official Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="coordinator@college.ac.in"
                      className="w-full px-4 py-2.5 bg-[#11102D] border border-[rgba(196,181,253,0.16)] rounded-xl text-xs text-[#F7F7FF] placeholder-[#AAA9C5]/40 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#AAA9C5] mb-1.5 uppercase tracking-wider">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 bg-[#11102D] border border-[rgba(196,181,253,0.16)] rounded-xl text-xs text-[#F7F7FF] placeholder-[#AAA9C5]/40 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#AAA9C5] mb-1.5 uppercase tracking-wider">
                      District (Kerala / State)
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="e.g. Ernakulam / Kozhikode"
                      className="w-full px-4 py-2.5 bg-[#11102D] border border-[rgba(196,181,253,0.16)] rounded-xl text-xs text-[#F7F7FF] placeholder-[#AAA9C5]/40 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#AAA9C5] mb-1.5 uppercase tracking-wider">
                      Department or Audience
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. CSE, ECE, MCA, All"
                      className="w-full px-4 py-2.5 bg-[#11102D] border border-[rgba(196,181,253,0.16)] rounded-xl text-xs text-[#F7F7FF] placeholder-[#AAA9C5]/40 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#AAA9C5] mb-1.5 uppercase tracking-wider">
                      Estimated Students
                    </label>
                    <select
                      value={formData.student_count}
                      onChange={(e) => setFormData({ ...formData, student_count: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#11102D] border border-[rgba(196,181,253,0.16)] rounded-xl text-xs text-[#F7F7FF] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                    >
                      <option value="50">50 - 100 Students</option>
                      <option value="150">100 - 250 Students</option>
                      <option value="300">250 - 500 Students</option>
                      <option value="600">500+ Students</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#AAA9C5] mb-1.5 uppercase tracking-wider">
                      Primary Technology Track
                    </label>
                    <select
                      value={formData.technology_track}
                      onChange={(e) => setFormData({ ...formData, technology_track: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#11102D] border border-[rgba(196,181,253,0.16)] rounded-xl text-xs text-[#F7F7FF] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                    >
                      <option value="AI & Automation">AI & Automation</option>
                      <option value="AI Agents">AI Agents & Autonomous Systems</option>
                      <option value="No-code & Vibe Coding">No-code & Vibe Coding</option>
                      <option value="Data Analytics">Data Analytics & Insights</option>
                      <option value="Combined Orientation">Combined Tech Orientation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#AAA9C5] mb-1.5 uppercase tracking-wider">
                      Preferred Date Window
                    </label>
                    <input
                      type="text"
                      value={formData.preferred_date}
                      onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                      placeholder="e.g. Next month, late Friday"
                      className="w-full px-4 py-2.5 bg-[#11102D] border border-[rgba(196,181,253,0.16)] rounded-xl text-xs text-[#F7F7FF] placeholder-[#AAA9C5]/40 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#AAA9C5] mb-1.5 uppercase tracking-wider">
                    Additional Requirements or Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.additional_requirements}
                    onChange={(e) => setFormData({ ...formData, additional_requirements: e.target.value })}
                    placeholder="Tell us about any specific tools, college guidelines or queries..."
                    className="w-full px-4 py-2.5 bg-[#11102D] border border-[rgba(196,181,253,0.16)] rounded-xl text-xs text-[#F7F7FF] placeholder-[#AAA9C5]/40 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="consent-check"
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#11102D] border-[rgba(196,181,253,0.2)] text-[#8B5CF6] focus:ring-0"
                  />
                  <label htmlFor="consent-check" className="text-[11px] text-[#AAA9C5]">
                    I consent to being contacted by Edge / MYST representatives to discuss campus session details.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-[#8B5CF6] to-[#4F7DFF] hover:from-[#7C3AED] hover:to-[#3B6AEC] text-white font-bold text-xs rounded-xl shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Enquiry...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Request Campus Session Details</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section id="faqs" className="py-20 border-t border-[rgba(196,181,253,0.12)] bg-[#0B0A24] px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.2em] text-[#8B5CF6] uppercase mb-2">
              FREQUENTLY ASKED QUESTIONS
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F7F7FF]">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#11102D] border border-[rgba(196,181,253,0.12)] rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-[#F7F7FF] hover:text-[#C4B5FD] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#AAA9C5] transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-[#8B5CF6]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 text-xs text-[#AAA9C5] leading-relaxed border-t border-[rgba(196,181,253,0.06)] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="py-12 border-t border-[rgba(196,181,253,0.12)] bg-[#070617] px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-[rgba(196,181,253,0.2)] bg-[#0B0A24]">
              <img src="/edge-logo.jpg" alt="Edge Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-[#F7F7FF]">EDGE</span>
              <p className="text-[9px] tracking-[0.2em] text-[#AAA9C5] uppercase font-semibold">
                A MYST INITIATIVE
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#AAA9C5]">
            <a href="#about" className="hover:text-[#F7F7FF] transition-colors">About</a>
            <a href="#tracks" className="hover:text-[#F7F7FF] transition-colors">Tracks</a>
            <a href="#for-colleges" className="hover:text-[#F7F7FF] transition-colors">For Colleges</a>
            <a href="#how-it-works" className="hover:text-[#F7F7FF] transition-colors">Process</a>
            <button
              onClick={() => setPrivacyModalOpen(true)}
              className="hover:text-[#F7F7FF] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="text-[#C4B5FD] font-semibold hover:underline"
            >
              CRM Workspace →
            </button>
          </div>

          <p className="text-xs text-[#AAA9C5]/50">
            © {new Date().getFullYear()} Edge · A MYST Initiative. All rights reserved.
          </p>
        </div>
      </footer>

      {/* PRIVACY POLICY MODAL */}
      {privacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#11102D] border border-[rgba(196,181,253,0.2)] rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#F7F7FF] mb-3">Edge Privacy Policy</h3>
            <div className="text-xs text-[#AAA9C5] space-y-3 leading-relaxed">
              <p>
                Edge ("A MYST Initiative") respects institutional and individual privacy. Any contact information, emails, or phone numbers collected through this website are used strictly for academic collaboration, session scheduling, and educational communications.
              </p>
              <p>
                We do not sell, rent, or share institutional contact records with third-party advertisers. All data is protected with secure encryption protocols and managed in accordance with applicable Indian digital data protection standards.
              </p>
              <p>
                Colleges may at any point request the removal of their contact details or unsubscribe from partnership correspondence by writing to our team.
              </p>
            </div>
            <button
              onClick={() => setPrivacyModalOpen(false)}
              className="mt-6 w-full py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-xl transition-all"
            >
              Close Privacy Policy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
