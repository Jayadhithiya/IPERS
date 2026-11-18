import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import {
  Search, BookOpen, User, Check, AlertTriangle, FileText,
  Download, Edit3, RefreshCw, LogOut, BarChart2, Users,
  CheckCircle2, Clock, Award
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const { token, logout, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected student details & editor state
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [aptitude, setAptitude] = useState('0');
  const [technical, setTechnical] = useState('0');
  const [communication, setCommunication] = useState('0');
  const [cgpaVerified, setCgpaVerified] = useState(false);
  const [internshipsVerified, setInternshipsVerified] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/faculty/students?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to retrieve student records.');
      }
      const data = await response.json();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(searchQuery);
  };

  const openEvaluationPanel = (student: any) => {
    setSelectedStudent(student);
    setAptitude(student.aptitude_score?.toString() || '0');
    setTechnical(student.technical_score?.toString() || '0');
    setCommunication(student.communication_score?.toString() || '0');
    setCgpaVerified(student.cgpa_verified);
    setInternshipsVerified(student.internships_verified);
    setUpdateSuccess(null);
    setUpdateError(null);
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setUpdating(true);
    setUpdateSuccess(null);
    setUpdateError(null);

    try {
      const response = await fetch(`${API_BASE}/faculty/students/${selectedStudent.id}/evaluation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          aptitude_score: parseInt(aptitude) || 0,
          technical_score: parseInt(technical) || 0,
          communication_score: parseInt(communication) || 0,
          cgpa_verified: cgpaVerified,
          internships_verified: internshipsVerified
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update evaluation.');
      }
      setUpdateSuccess('Student evaluation and verification statuses saved!');
      setSelectedStudent(data.profile);
      setStudents(prev => prev.map(s => s.id === data.profile.id ? data.profile : s));
    } catch (err: any) {
      setUpdateError(err.message || 'Error saving changes.');
    } finally {
      setUpdating(false);
    }
  };

  const verifiedCount = students.filter(s => s.cgpa_verified && s.internships_verified).length;
  const pendingCount = students.length - verifiedCount;
  const avgCgpa = students.length > 0
    ? (students.reduce((acc, s) => acc + (s.cgpa || 0), 0) / students.length).toFixed(2)
    : '0.00';

  const facultyInitials = (profile?.name || 'FA')
    .split(' ')
    .filter((p: string) => !p.endsWith('.'))
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'FA';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-14">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 font-display">IPERS</span>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                Faculty Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center border border-violet-200">
                {facultyInitials}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-semibold text-slate-900">{profile?.name}</p>
                <p className="text-xs text-slate-500">{profile?.department}</p>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-semibold rounded-xl transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Student Evaluation Hub
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Verify self-reported academic credentials, review student resumes, and record benchmark assessment scores.
            </p>
          </div>
          <button
            onClick={() => fetchStudents(searchQuery)}
            className="btn-secondary px-4 py-2.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Records
          </button>
        </div>

        {/* KPI Summary Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="saas-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Students</p>
              <p className="text-2xl font-extrabold text-slate-900 font-display tabular-nums">{students.length}</p>
            </div>
          </div>

          <div className="saas-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Fully Verified</p>
              <p className="text-2xl font-extrabold text-slate-900 font-display tabular-nums">{verifiedCount}</p>
            </div>
          </div>

          <div className="saas-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Pending Review</p>
              <p className="text-2xl font-extrabold text-slate-900 font-display tabular-nums">{pendingCount}</p>
            </div>
          </div>

          <div className="saas-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Cohort Avg CGPA</p>
              <p className="text-2xl font-extrabold text-slate-900 font-display tabular-nums">{avgCgpa}</p>
            </div>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left: Search & Table (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Search Bar Card */}
            <div className="saas-card p-4">
              <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search students by roll number or full name..."
                    className="saas-input pl-10 py-2.5 text-sm"
                  />
                </div>
                <button type="submit" className="btn-primary px-5 py-2.5 text-xs">
                  Search
                </button>
              </form>
            </div>

            {/* Students Table Card */}
            <div className="saas-card overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-slate-900 text-base">Student Directory</h2>
                <span className="text-xs font-medium text-slate-400">
                  {students.length} {students.length === 1 ? 'record' : 'records'}
                </span>
              </div>

              {loading ? (
                <div className="py-16 flex justify-center items-center">
                  <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : error ? (
                <div className="m-6 p-4 text-center bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                  {error}
                </div>
              ) : students.length === 0 ? (
                <div className="py-14 text-center text-slate-400 text-xs">
                  No student profiles matched your search.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3.5 pl-6 pr-3">Student</th>
                        <th className="py-3.5 px-3 text-center">CGPA</th>
                        <th className="py-3.5 px-3 text-center">Interns</th>
                        <th className="py-3.5 px-3 text-center">Scores (A / T / C)</th>
                        <th className="py-3.5 pl-3 pr-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((student) => {
                        const verified = student.cgpa_verified && student.internships_verified;
                        const isSelected = selectedStudent?.id === student.id;
                        return (
                          <tr
                            key={student.id}
                            className={`transition-colors ${
                              isSelected ? 'bg-indigo-50/70' : 'hover:bg-slate-50/90'
                            }`}
                          >
                            <td className="py-4 pl-6 pr-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-slate-200/80">
                                  {(student.full_name || 'S').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-sm leading-tight">{student.full_name}</p>
                                  <div className="flex items-center flex-wrap gap-1.5 mt-1">
                                    <span className="font-mono text-[11px] text-slate-500">{student.roll_number}</span>
                                    <span className="text-slate-300">·</span>
                                    {student.arrears > 0 ? (
                                      <span className="px-1.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-semibold rounded-md">
                                        {student.arrears} Arrears
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md">
                                        0 Arrears
                                      </span>
                                    )}
                                    {verified ? (
                                      <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold rounded-md inline-flex items-center gap-0.5">
                                        <Check className="w-2.5 h-2.5" /> Verified
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold rounded-md inline-flex items-center gap-0.5">
                                        <AlertTriangle className="w-2.5 h-2.5" /> Pending
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-3 text-center font-bold text-slate-900 tabular-nums text-sm">
                              {student.cgpa.toFixed(2)}
                            </td>
                            <td className="py-4 px-3 text-center font-semibold text-slate-700 tabular-nums">
                              {student.internships}
                            </td>
                            <td className="py-4 px-3 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200/80 rounded-lg font-mono text-xs font-semibold text-slate-700 tabular-nums">
                                {student.aptitude_score || '—'} / {student.technical_score || '—'} / {student.communication_score || '—'}
                              </span>
                            </td>
                            <td className="py-4 pl-3 pr-6 text-right">
                              <button
                                onClick={() => openEvaluationPanel(student)}
                                className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs inline-flex items-center gap-1.5 transition-all ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700'
                                }`}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Evaluate
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right: Sticky Evaluation Inspector (4 cols) */}
          <div className="lg:col-span-4">
            {selectedStudent ? (
              <div className="saas-card p-6 sticky top-24 animate-fadeIn">
                <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-base leading-tight">Evaluation Panel</h2>
                    <p className="text-[11px] text-slate-500">Update scores & verify records</p>
                  </div>
                </div>

                {updateSuccess && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium">
                    {updateSuccess}
                  </div>
                )}
                {updateError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                    {updateError}
                  </div>
                )}

                {/* Active Student Card */}
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl mb-5">
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Selected Student</p>
                  <h3 className="text-slate-900 text-base font-extrabold mt-0.5">{selectedStudent.full_name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedStudent.roll_number}</p>

                  <div className="mt-3.5 pt-3 border-t border-slate-200/80 flex justify-between items-center text-xs">
                    <span className="text-slate-500 inline-flex items-center gap-1.5 font-medium">
                      <FileText className="w-3.5 h-3.5" /> Resume PDF
                    </span>
                    {selectedStudent.has_resume ? (
                      <a
                        href={`${API_BASE}/student/resume/${selectedStudent.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Not uploaded</span>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSaveEvaluation} className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="saas-label mb-0">Aptitude Score</label>
                      <span className="text-xs font-bold text-indigo-600 tabular-nums">{aptitude}/100</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={aptitude}
                      onChange={(e) => setAptitude(e.target.value)}
                      className="saas-input py-2 text-sm tabular-nums"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="saas-label mb-0">Technical Score</label>
                      <span className="text-xs font-bold text-emerald-600 tabular-nums">{technical}/100</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={technical}
                      onChange={(e) => setTechnical(e.target.value)}
                      className="saas-input py-2 text-sm tabular-nums"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="saas-label mb-0">Communication Score</label>
                      <span className="text-xs font-bold text-violet-600 tabular-nums">{communication}/100</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={communication}
                      onChange={(e) => setCommunication(e.target.value)}
                      className="saas-input py-2 text-sm tabular-nums"
                    />
                  </div>

                  {/* Verification Checkboxes */}
                  <div className="pt-3 pb-3 border-t border-b border-slate-100 space-y-2.5">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      Credential Verification
                    </p>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 hover:border-indigo-300 bg-slate-50/50 cursor-pointer select-none transition-colors">
                      <input
                        type="checkbox"
                        checked={cgpaVerified}
                        onChange={(e) => setCgpaVerified(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="text-xs">
                        <span className="text-slate-900 font-semibold block">Verify CGPA</span>
                        <span className="text-slate-500">Self-reported: {selectedStudent.cgpa}</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 hover:border-indigo-300 bg-slate-50/50 cursor-pointer select-none transition-colors">
                      <input
                        type="checkbox"
                        checked={internshipsVerified}
                        onChange={(e) => setInternshipsVerified(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="text-xs">
                        <span className="text-slate-900 font-semibold block">Verify Internships</span>
                        <span className="text-slate-500">Self-reported: {selectedStudent.internships} completed</span>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="submit"
                      disabled={updating}
                      className="btn-primary flex-1 py-2.5 text-xs"
                    >
                      {updating ? 'Saving...' : 'Save Evaluation'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStudent(null)}
                      className="btn-secondary px-4 py-2.5 text-xs"
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="saas-card p-8 text-center sticky top-24">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <User className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">No Student Selected</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Click <span className="font-semibold text-indigo-600">Evaluate</span> on any student row to inspect their resume, verify CGPA/internships, and submit benchmark scores.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
