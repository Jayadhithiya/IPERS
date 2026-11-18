import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import {
  User, AlertTriangle, CheckCircle, Upload, Download,
  Megaphone, Newspaper, Compass, Target, HelpCircle,
  ChevronRight, ArrowRight, Award as GoldAward, Star, Lightbulb,
  UserCheck, LogOut, Sparkles, FileText, Pencil,
  X, CheckCircle2, XCircle, Briefcase, BarChart2
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { profile, token, logout, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Edit form states
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [rollNumber, setRollNumber] = useState(profile?.roll_number || '');
  const [cgpa, setCgpa] = useState(profile?.cgpa?.toString() || '');
  const [internships, setInternships] = useState(profile?.internships?.toString() || '0');
  const [arrears, setArrears] = useState(profile?.arrears?.toString() || '0');
  const [skills, setSkills] = useState(profile?.skills?.join(', ') || '');

  // File upload states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeSuccess, setResumeSuccess] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Communications feeds
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [companyNews, setCompanyNews] = useState<any[]>([]);

  // Recommendation results state
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [selectedCompanyDetail, setSelectedCompanyDetail] = useState<any | null>(null);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [annRes, newsRes] = await Promise.all([
        fetch(`${API_BASE}/common/announcements`, { headers }),
        fetch(`${API_BASE}/common/company-news`, { headers })
      ]);
      if (annRes.ok) setAnnouncements(await annRes.json());
      if (newsRes.ok) setCompanyNews(await newsRes.json());
    } catch (err) {
      console.error("Error fetching news feed", err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSuccess(null);
    setEditError(null);
    try {
      const response = await fetch(`${API_BASE}/student/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullName,
          roll_number: rollNumber,
          cgpa: parseFloat(cgpa) || 0.0,
          internships: parseInt(internships) || 0,
          arrears: parseInt(arrears) || 0,
          skills: skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile.');
      }
      setEditSuccess('Profile updated! Note: Changes to CGPA or internships require faculty re-verification.');
      setIsEditing(false);
      await refreshProfile();
    } catch (err: any) {
      setEditError(err.message || 'Error occurred.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setResumeError('Only PDF format resumes are supported.');
        return;
      }
      setResumeFile(file);
      setResumeError(null);
      setResumeSuccess(null);
    }
  };

  const handleUploadResume = async () => {
    if (!resumeFile) return;
    setUploading(true);
    setResumeError(null);
    setResumeSuccess(null);

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const response = await fetch(`${API_BASE}/student/resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload resume.');
      }
      setResumeSuccess('Resume PDF stored securely in database!');
      setResumeFile(null);
      await refreshProfile();
    } catch (err: any) {
      setResumeError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const runOpportunitiesAnalysis = async () => {
    setAnalyticsOpen(true);
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    setAnalyticsData(null);
    setSelectedCompanyDetail(null);
    try {
      const response = await fetch(`${API_BASE}/student/analyze-opportunities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Analytics failed.');
      }
      setAnalyticsData(data);
    } catch (err: any) {
      setAnalyticsError(err.message || 'Could not fetch placement guidance.');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const getClusteredCompanies = () => {
    if (!analyticsData) return {};
    const groups: { [key: string]: any[] } = {
      "High CGPA + High Aptitude": [],
      "Technical Skill Focused Companies": [],
      "Service Companies": [],
      "Uncategorized": []
    };

    analyticsData.eligible_companies.forEach((item: any) => {
      const clust = item.company.cluster_type || 'Uncategorized';
      if (!groups[clust]) groups[clust] = [];
      groups[clust].push(item);
    });

    return groups;
  };

  const clustered = getClusteredCompanies();

  const initials = (profile?.full_name || 'ST')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const evalScores = [
    profile?.aptitude_score,
    profile?.technical_score,
    profile?.communication_score
  ].filter((v) => typeof v === 'number' && v > 0);
  const avgEval = evalScores.length > 0
    ? Math.round(evalScores.reduce((a, b) => a + b, 0) / evalScores.length)
    : null;

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
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Student Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
                {initials}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-semibold text-slate-900">{profile?.full_name}</p>
                <p className="text-xs text-slate-500 font-mono">{profile?.roll_number}</p>
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
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-saas-md">
          <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />
          <div className="absolute -right-16 -top-16 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-indigo-100 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                Placement Readiness Workspace
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}
              </h1>
              <p className="text-indigo-100/80 max-w-2xl text-sm mt-1.5 leading-relaxed">
                Track your faculty-verified credentials, keep your resume updated, and run the AI eligibility engine to explore matched company tiers.
              </p>
            </div>

            <button
              onClick={runOpportunitiesAnalysis}
              className="w-full lg:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 whitespace-nowrap text-sm"
            >
              <Compass className="w-5 h-5" />
              Analyze Placement Opportunities
            </button>
          </div>

          {/* Quick KPI Strip inside Hero */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7 pt-6 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3">
              <p className="text-[11px] text-indigo-200 font-medium">Cumulative GPA</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-extrabold text-white font-display tabular-nums">
                  {profile?.cgpa?.toFixed(2) ?? '0.00'}
                </span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                  profile?.cgpa_verified ? 'bg-emerald-400/20 text-emerald-200' : 'bg-amber-400/20 text-amber-200'
                }`}>
                  {profile?.cgpa_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3">
              <p className="text-[11px] text-indigo-200 font-medium">Internships</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-extrabold text-white font-display tabular-nums">
                  {profile?.internships ?? 0}
                </span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                  profile?.internships_verified ? 'bg-emerald-400/20 text-emerald-200' : 'bg-amber-400/20 text-amber-200'
                }`}>
                  {profile?.internships_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3">
              <p className="text-[11px] text-indigo-200 font-medium">Eval Average</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-extrabold text-white font-display tabular-nums">
                  {avgEval !== null ? `${avgEval}%` : '—'}
                </span>
                <span className="text-[10px] text-indigo-200/80">Faculty Score</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3">
              <p className="text-[11px] text-indigo-200 font-medium">Active Arrears</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-xl font-extrabold font-display tabular-nums ${
                  (profile?.arrears || 0) > 0 ? 'text-rose-300' : 'text-emerald-300'
                }`}>
                  {profile?.arrears ?? 0}
                </span>
                <span className="text-[10px] text-indigo-200/80">
                  {(profile?.arrears || 0) === 0 ? 'All Clear' : 'Action Needed'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left Column (4 cols): Academic Profile & Resume Vault */}
          <div className="lg:col-span-4 space-y-7">
            {/* Academic Profile Card */}
            <div className="saas-card p-6">
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <h2 className="font-bold text-slate-900 text-base">Academic Profile</h2>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => {
                      setFullName(profile?.full_name || '');
                      setRollNumber(profile?.roll_number || '');
                      setCgpa(profile?.cgpa?.toString() || '');
                      setInternships(profile?.internships?.toString() || '0');
                      setArrears(profile?.arrears?.toString() || '0');
                      setSkills(profile?.skills?.join(', ') || '');
                      setIsEditing(true);
                      setEditSuccess(null);
                      setEditError(null);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>

              {editSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium">
                  {editSuccess}
                </div>
              )}

              {editError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                  {editError}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="saas-label">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="saas-input py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="saas-label">Roll Number</label>
                    <input
                      type="text"
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="saas-input py-2 text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="saas-label">CGPA</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        required
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        className="saas-input py-2 px-2.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="saas-label">Internships</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={internships}
                        onChange={(e) => setInternships(e.target.value)}
                        className="saas-input py-2 px-2.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="saas-label">Arrears</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={arrears}
                        onChange={(e) => setArrears(e.target.value)}
                        className="saas-input py-2 px-2.5 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="saas-label">Skills (comma-separated)</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="saas-input py-2 text-xs"
                    />
                  </div>
                  <div className="flex gap-2.5 pt-2">
                    <button type="submit" className="btn-primary flex-1 py-2 text-xs">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary flex-1 py-2 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5">
                  {/* Student Identity */}
                  <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl">
                    <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-slate-900 text-sm font-bold truncate">{profile?.full_name}</h3>
                      <p className="text-xs text-slate-500 font-mono">{profile?.roll_number}</p>
                    </div>
                  </div>

                  {/* Verified Fields */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <div>
                        <p className="text-slate-500">Cumulative GPA</p>
                        <p className="text-slate-900 font-bold text-sm tabular-nums">{profile?.cgpa?.toFixed(2)} / 10.0</p>
                      </div>
                      {profile?.cgpa_verified ? (
                        <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold rounded-full inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold rounded-full inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <div>
                        <p className="text-slate-500">Internships Completed</p>
                        <p className="text-slate-900 font-bold text-sm tabular-nums">{profile?.internships} completed</p>
                      </div>
                      {profile?.internships_verified ? (
                        <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold rounded-full inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold rounded-full inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500">Active Arrears</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        profile?.arrears > 0
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {profile?.arrears} arrears
                      </span>
                    </div>
                  </div>

                  {/* Faculty Evaluation Bars */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Faculty Evaluation Benchmarks
                    </p>
                    <div className="space-y-3">
                      {[
                        { label: 'Aptitude', value: profile?.aptitude_score || 0, bar: 'bg-indigo-600' },
                        { label: 'Technical', value: profile?.technical_score || 0, bar: 'bg-emerald-500' },
                        { label: 'Communication', value: profile?.communication_score || 0, bar: 'bg-violet-500' },
                      ].map((metric) => (
                        <div key={metric.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-slate-600">{metric.label}</span>
                            <span className="font-bold text-slate-900 tabular-nums">
                              {metric.value > 0 ? `${metric.value}/100` : 'Not graded'}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${metric.bar}`}
                              style={{ width: `${Math.min(100, metric.value)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                      Key Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile?.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200/80"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No skills listed yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Resume Vault Card */}
            <div className="saas-card p-6">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base leading-tight">Resume Vault</h2>
                  <p className="text-[11px] text-slate-500">Stored securely for faculty & TPC review</p>
                </div>
              </div>

              {resumeSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium">
                  {resumeSuccess}
                </div>
              )}
              {resumeError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                  {resumeError}
                </div>
              )}

              <div className="space-y-4">
                {profile?.has_resume ? (
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-white border border-emerald-200 flex items-center justify-center flex-shrink-0 text-emerald-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{profile.resume_name}</p>
                        <p className="text-[11px] text-emerald-700 font-medium">Stored in database</p>
                      </div>
                    </div>
                    <a
                      href={`${API_BASE}/student/resume/${profile.id}`}
                      className="p-2 bg-white hover:bg-emerald-600 border border-emerald-200 text-emerald-700 hover:text-white rounded-lg transition-all flex-shrink-0 shadow-sm"
                      title="Download Resume"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <div className="p-5 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs font-medium text-slate-600">No PDF resume uploaded yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Upload a PDF to share with recruiters</p>
                  </div>
                )}

                <div className="space-y-2.5">
                  <label className="saas-label">Upload or Replace Resume (PDF)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700 file:cursor-pointer hover:file:bg-indigo-50 hover:file:text-indigo-700 hover:file:border-indigo-200 transition-all"
                  />
                  {resumeFile && (
                    <button
                      onClick={handleUploadResume}
                      disabled={uploading}
                      className="btn-primary w-full py-2.5 text-xs mt-2"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploading ? 'Uploading PDF...' : `Upload ${resumeFile.name}`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (8 cols): Announcements & Company Updates */}
          <div className="lg:col-span-8 space-y-7">
            {/* Announcements Feed */}
            <div className="saas-card p-6">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-base leading-tight">Placement Cell Announcements</h2>
                    <p className="text-[11px] text-slate-500">Official deadlines and campus drive circulars</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full tabular-nums">
                  {announcements.length} notices
                </span>
              </div>

              <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
                {announcements.length > 0 ? (
                  announcements.map((a: any) => (
                    <article
                      key={a.id}
                      className="p-4 bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-amber-300/70 rounded-xl transition-all hover:shadow-sm"
                    >
                      <div className="flex justify-between items-start gap-3 mb-1.5">
                        <h3 className="text-slate-900 text-sm font-bold leading-snug">{a.title}</h3>
                        <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap bg-white px-2 py-0.5 rounded-md border border-slate-200/70">
                          {new Date(a.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{a.content}</p>
                      <p className="text-[11px] text-amber-700 font-semibold mt-2.5">
                        Posted by {a.created_by}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    No announcements posted yet.
                  </div>
                )}
              </div>
            </div>

            {/* Company Hiring Updates */}
            <div className="saas-card p-6">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-base leading-tight">Company Hiring Updates</h2>
                    <p className="text-[11px] text-slate-500">Recruiter schedules, syllabi, and interview updates</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full tabular-nums">
                  {companyNews.length} updates
                </span>
              </div>

              <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                {companyNews.length > 0 ? (
                  companyNews.map((n: any) => (
                    <article
                      key={n.id}
                      className="p-4 bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-indigo-300/70 rounded-xl transition-all hover:shadow-sm"
                    >
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[11px] font-bold rounded-md">
                            <Briefcase className="w-3 h-3" />
                            {n.company_name}
                          </span>
                          <h3 className="text-slate-900 text-sm font-bold">{n.title}</h3>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap bg-white px-2 py-0.5 rounded-md border border-slate-200/70">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{n.content}</p>
                    </article>
                  ))
                ) : (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    No company hiring updates posted yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Career Guidance Modal */}
      {analyticsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-5xl w-full rounded-3xl overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col animate-fadeIn">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-display leading-tight">
                    IPERS Career Guidance Center
                  </h3>
                  <p className="text-xs text-slate-500">
                    K-Means Clustering · Decision Tree Eligibility · Alumni Nearest-Neighbor Matching
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAnalyticsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50/70">
              {analyticsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                  <p className="text-sm text-slate-800 font-bold">Running intelligent recommendation models...</p>
                  <p className="text-xs text-slate-500 mt-1">Evaluating company clusters, eligibility rules, and alumni profiles</p>
                </div>
              ) : analyticsError ? (
                <div className="py-12 text-center bg-rose-50 border border-rose-200 rounded-2xl p-6">
                  <AlertTriangle className="w-10 h-10 mx-auto text-rose-500 mb-3" />
                  <p className="text-sm font-semibold text-rose-700">{analyticsError}</p>
                </div>
              ) : (
                <>
                  {/* Profile Snapshot Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                      { label: 'CGPA', val: analyticsData?.student_profile?.cgpa?.toFixed(2) },
                      { label: 'Internships', val: analyticsData?.student_profile?.internships },
                      { label: 'Arrears', val: analyticsData?.student_profile?.arrears },
                      { label: 'Aptitude', val: analyticsData?.student_profile?.aptitude_score || '—' },
                      { label: 'Technical', val: analyticsData?.student_profile?.technical_score || '—' },
                      { label: 'Communication', val: analyticsData?.student_profile?.communication_score || '—' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white border border-slate-200/90 rounded-xl p-3 text-center shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-slate-900 font-extrabold text-base mt-0.5 tabular-nums font-display">{stat.val}</p>
                      </div>
                    ))}
                  </div>

                  {/* 1. Company Category Recommendations */}
                  <div>
                    <h4 className="text-slate-900 font-extrabold text-sm mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-600" />
                      1. Eligible Company Category Recommendations
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Tier 1 */}
                      <div className="bg-white rounded-2xl border border-amber-200/90 p-5 shadow-saas flex flex-col min-h-[230px] relative overflow-hidden">
                        <div className="absolute -right-3 -top-3 opacity-10 pointer-events-none">
                          <GoldAward className="w-20 h-20 text-amber-500" />
                        </div>
                        <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold rounded-lg self-start mb-3">
                          Dream / Tier-1
                        </span>
                        <h5 className="text-slate-900 text-base font-bold mb-1.5">High CGPA + High Aptitude</h5>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-grow">
                          Top-tier companies seeking strong academic scores (&gt;8.5 CGPA, &gt;80 Aptitude) and zero arrears.
                        </p>
                        <div className="space-y-2">
                          {clustered["High CGPA + High Aptitude"]?.length > 0 ? (
                            clustered["High CGPA + High Aptitude"].map((c: any) => (
                              <button
                                key={c.company.id}
                                onClick={() => setSelectedCompanyDetail(c)}
                                className="w-full text-left px-3 py-2.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-xs flex justify-between items-center transition-all"
                              >
                                <span className="font-bold text-slate-800">{c.company.name}</span>
                                <span className="text-[11px] text-amber-700 flex items-center gap-0.5 font-semibold">
                                  Path <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                              </button>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 italic py-2">No eligible companies in this tier yet.</p>
                          )}
                        </div>
                      </div>

                      {/* Tech Focused */}
                      <div className="bg-white rounded-2xl border border-indigo-200/90 p-5 shadow-saas flex flex-col min-h-[230px]">
                        <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold rounded-lg self-start mb-3">
                          R&D & Engineering
                        </span>
                        <h5 className="text-slate-900 text-base font-bold mb-1.5">Technical Skill Focused</h5>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-grow">
                          Organizations prioritizing high technical test scores, hands-on projects, and internships.
                        </p>
                        <div className="space-y-2">
                          {clustered["Technical Skill Focused Companies"]?.length > 0 ? (
                            clustered["Technical Skill Focused Companies"].map((c: any) => (
                              <button
                                key={c.company.id}
                                onClick={() => setSelectedCompanyDetail(c)}
                                className="w-full text-left px-3 py-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs flex justify-between items-center transition-all"
                              >
                                <span className="font-bold text-slate-800">{c.company.name}</span>
                                <span className="text-[11px] text-indigo-600 flex items-center gap-0.5 font-semibold">
                                  Path <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                              </button>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 italic py-2">No eligible companies in this tier yet.</p>
                          )}
                        </div>
                      </div>

                      {/* Service Companies */}
                      <div className="bg-white rounded-2xl border border-emerald-200/90 p-5 shadow-saas flex flex-col min-h-[230px]">
                        <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold rounded-lg self-start mb-3">
                          Enterprise & Consulting
                        </span>
                        <h5 className="text-slate-900 text-base font-bold mb-1.5">Service Sector</h5>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-grow">
                          Broad-intake recruiters with flexible CGPA, aptitude thresholds, and lenient arrear policies.
                        </p>
                        <div className="space-y-2">
                          {clustered["Service Companies"]?.length > 0 ? (
                            clustered["Service Companies"].map((c: any) => (
                              <button
                                key={c.company.id}
                                onClick={() => setSelectedCompanyDetail(c)}
                                className="w-full text-left px-3 py-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs flex justify-between items-center transition-all"
                              >
                                <span className="font-bold text-slate-800">{c.company.name}</span>
                                <span className="text-[11px] text-emerald-700 flex items-center gap-0.5 font-semibold">
                                  Path <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                              </button>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 italic py-2">No eligible companies in this tier yet.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decision Tree Detail Drawer */}
                  {selectedCompanyDetail && (
                    <div className="p-6 bg-white rounded-2xl border-2 border-indigo-200 shadow-saas-md animate-fadeIn">
                      <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-100">
                        <div>
                          <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-600">
                            Decision Tree Explanation
                          </span>
                          <h4 className="text-slate-900 font-extrabold text-lg">
                            {selectedCompanyDetail.company.name} — Eligibility Breakdown
                          </h4>
                        </div>
                        <button
                          onClick={() => setSelectedCompanyDetail(null)}
                          className="btn-secondary px-3 py-1.5 text-xs"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">
                            Minimum Requirements
                          </h5>
                          <div className="grid grid-cols-2 gap-2.5 text-xs">
                            {[
                              { k: 'Min CGPA', v: selectedCompanyDetail.company.min_cgpa },
                              { k: 'Min Aptitude', v: selectedCompanyDetail.company.min_aptitude },
                              { k: 'Min Technical', v: selectedCompanyDetail.company.min_technical },
                              { k: 'Min Comm', v: selectedCompanyDetail.company.min_communication },
                              { k: 'Min Internships', v: selectedCompanyDetail.company.min_internships },
                              { k: 'Max Arrears', v: selectedCompanyDetail.company.allowed_arrears },
                            ].map((p) => (
                              <div key={p.k} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between items-center">
                                <span className="text-slate-500">{p.k}</span>
                                <span className="font-bold text-slate-900 tabular-nums">{p.v}</span>
                              </div>
                            ))}
                          </div>
                          {selectedCompanyDetail.why_recommended && (
                            <div className="mt-4 p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900">
                              <p className="font-bold text-indigo-800 mb-1">Verdict</p>
                              <p className="leading-relaxed">{selectedCompanyDetail.why_recommended}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <h5 className="text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">
                            Decision Tree Node Trajectory
                          </h5>
                          <div className="space-y-2">
                            {selectedCompanyDetail.decision_path.map((step: string, idx: number) => {
                              const isPass = step.includes("Passed");
                              return (
                                <div
                                  key={idx}
                                  className={`p-2.5 rounded-xl text-xs border flex items-center gap-2.5 font-medium ${
                                    isPass
                                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                                      : 'bg-rose-50/80 border-rose-200 text-rose-800'
                                  }`}
                                >
                                  {isPass ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                                  )}
                                  <span>{step}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Ineligible Companies */}
                  <div>
                    <h4 className="text-slate-900 font-extrabold text-sm mb-3 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-slate-500" />
                      2. Ineligible Opportunities & Gaps
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {analyticsData?.ineligible_companies?.length > 0 ? (
                        analyticsData.ineligible_companies.map((item: any) => (
                          <div key={item.company.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col">
                            <p className="text-sm font-bold text-slate-900">{item.company.name}</p>
                            <span className="inline-block self-start mt-1 mb-2.5 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold rounded-md">
                              Not Eligible
                            </span>
                            <div className="space-y-1 flex-grow">
                              {item.failures.map((fail: string, idx: number) => (
                                <p key={idx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                                  <span>{fail}</span>
                                </p>
                              ))}
                            </div>
                            <button
                              onClick={() => setSelectedCompanyDetail(item)}
                              className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                            >
                              Inspect Tree Path <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700">
                          Great work! You currently meet the eligibility criteria for all active recruiters.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Similar Alumni */}
                  <div>
                    <h4 className="text-slate-900 font-extrabold text-sm mb-1 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      3. Historical Alumni Profile Matches (Career Blueprint)
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">
                      Nearest-neighbor analysis comparing your profile against placed alumni benchmarks:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {analyticsData?.similar_students?.map((s: any, idx: number) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-saas">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-bold text-slate-900">{s.name}</span>
                            <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold rounded-full tabular-nums">
                              {s.similarity_score}% Match
                            </span>
                          </div>

                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
                            <div
                              className="bg-gradient-to-r from-indigo-600 to-emerald-500 h-full rounded-full"
                              style={{ width: `${s.similarity_score}%` }}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="block text-[10px] text-slate-400 uppercase font-semibold">CGPA</span>
                              <span className="font-bold text-slate-900 tabular-nums">{s.cgpa}</span>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Tech</span>
                              <span className="font-bold text-slate-900 tabular-nums">{s.technical_score}</span>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Interns</span>
                              <span className="font-bold text-slate-900 tabular-nums">{s.internships}</span>
                            </div>
                          </div>

                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                            <span className="text-emerald-800 font-medium">Placed At</span>
                            <span className="font-bold text-emerald-700 inline-flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-600" />
                              {s.placed_at}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Improvement Checklist */}
                  <div className="border-t border-slate-200 pt-6">
                    <h4 className="text-slate-900 font-extrabold text-sm mb-4 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      4. Personalized Improvement Plan
                    </h4>

                    <div className="space-y-3">
                      {analyticsData?.improvement_suggestions?.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-start gap-3.5">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full self-start whitespace-nowrap ${
                            item.priority === 'High'
                              ? 'bg-rose-50 border border-rose-200 text-rose-700'
                              : item.priority === 'Medium'
                                ? 'bg-amber-50 border border-amber-200 text-amber-700'
                                : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                          }`}>
                            {item.priority} Priority
                          </span>
                          <div>
                            <p className="text-slate-900 font-bold text-xs mb-1">{item.category}</p>
                            <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setAnalyticsOpen(false)}
                className="btn-primary px-5 py-2.5 text-xs"
              >
                Done & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
