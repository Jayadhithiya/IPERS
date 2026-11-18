import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap, Mail, Lock, User, FileText, Briefcase,
  Award, ArrowLeft, BarChart2, ChevronRight, Sparkles, CheckCircle2, Users, Building2, TrendingUp
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, register } = useAuth();
  const [activeScreen, setActiveScreen] = useState<'roles' | 'form'>('roles');
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'student' | 'faculty' | 'tpc'>('student');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  // Student Specific
  const [rollNumber, setRollNumber] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [internships, setInternships] = useState('0');
  const [arrears, setArrears] = useState('0');
  const [skills, setSkills] = useState('');
  // Faculty Specific
  const [department, setDepartment] = useState('Computer Science & Engineering');

  const handleRoleSelect = (r: 'student' | 'faculty' | 'tpc') => {
    setRole(r);
    setActiveScreen('form');
    setIsLogin(true);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isLogin) {
        if (!username || !password) {
          throw new Error('Please enter both username and password.');
        }
        await login(username, password);
      } else {
        if (!username || !email || !password || !fullName) {
          throw new Error('Please fill out all required fields.');
        }

        const regData: any = {
          username,
          email,
          password,
          role,
          full_name: fullName
        };

        if (role === 'student') {
          if (!rollNumber) throw new Error('Roll number is required for students.');
          regData.roll_number = rollNumber;
          regData.cgpa = parseFloat(cgpa) || 0.0;
          regData.internships = parseInt(internships) || 0;
          regData.arrears = parseInt(arrears) || 0;
          regData.skills = skills;
        } else if (role === 'faculty') {
          regData.department = department;
        }

        await register(regData);
        setSuccess('Registration successful! Please sign in with your credentials.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleMeta = {
    student: {
      title: 'Student Portal',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconBg: 'bg-indigo-50 text-indigo-600',
      icon: GraduationCap,
    },
    faculty: {
      title: 'Faculty Portal',
      badge: 'bg-violet-50 text-violet-700 border-violet-200',
      iconBg: 'bg-violet-50 text-violet-600',
      icon: User,
    },
    tpc: {
      title: 'Coordinator Portal',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600',
      icon: Briefcase,
    },
  }[role];

  const ActiveRoleIcon = roleMeta.icon;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Left Column - Editorial Indigo Brand Panel */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white">
        {/* Subtle Dot Grid & Ambient Glows */}
        <div className="absolute inset-0 bg-dot-pattern opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Lockup */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <BarChart2 className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white font-display block leading-none">
              IPERS
            </span>
            <span className="text-[11px] font-medium text-indigo-200/80 tracking-wide">
              Placement Intelligence
            </span>
          </div>
        </div>

        {/* Center Hero Copy */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-indigo-100 mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            AI-Powered Academic Placement Suite
          </div>

          <h1 className="text-4xl xl:text-[3.1rem] font-extrabold text-white leading-[1.12] tracking-tight mb-5 font-display">
            Intelligent <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-emerald-300">
              Placement Eligibility
            </span>{' '}
            & Guidance
          </h1>

          <p className="text-indigo-100/80 text-base max-w-md leading-relaxed mb-8">
            Connecting students, faculty evaluators, and placement coordinators through transparent eligibility trees, clustering insights, and alumni career blueprints.
          </p>

          {/* Feature Highlights */}
          <div className="space-y-3 mb-10">
            {[
              'K-Means company tier clustering & readiness scoring',
              'Transparent decision-tree eligibility path breakdowns',
              'Verified academic evaluations & binary resume vault',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-indigo-100/90">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-3 gap-3.5 max-w-md">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
              <div className="flex items-center gap-1.5 text-indigo-200 mb-1">
                <Users className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Students</span>
              </div>
              <p className="text-2xl font-extrabold text-white font-display tabular-nums">2,847</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
              <div className="flex items-center gap-1.5 text-indigo-200 mb-1">
                <Building2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Recruiters</span>
              </div>
              <p className="text-2xl font-extrabold text-white font-display tabular-nums">156</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
              <div className="flex items-center gap-1.5 text-emerald-300 mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Placed</span>
              </div>
              <p className="text-2xl font-extrabold text-white font-display tabular-nums">89%</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-indigo-200/60 text-xs font-medium flex items-center justify-between">
          <span>© {new Date().getFullYear()} IPERS · University Placement Platform</span>
          <span>v2.0</span>
        </div>
      </div>

      {/* Right Column - Clean Light Surface */}
      <div className="w-full lg:w-[56%] xl:w-[58%] flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-10 bg-slate-50 bg-dot-light relative overflow-y-auto">
        {/* Mobile Brand Header */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8 mx-auto">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-slate-900 font-display block leading-none">IPERS</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">Placement Portal</span>
          </div>
        </div>

        {activeScreen === 'roles' ? (
          <div className="max-w-lg w-full mx-auto animate-fadeIn">
            <div className="mb-8">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3">
                Campus Placement Portal
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2 font-display">
                Welcome back
              </h2>
              <p className="text-slate-500 text-sm">
                Choose your institutional role below to sign in or create an account.
              </p>
            </div>

            <div className="space-y-3.5">
              {/* Student Role */}
              <button
                type="button"
                onClick={() => handleRoleSelect('student')}
                className="w-full flex items-center p-5 bg-white border border-slate-200/90 hover:border-indigo-400 rounded-2xl shadow-saas hover:shadow-saas-md transition-all duration-200 group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-indigo-600 transition-colors">
                  <GraduationCap className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-slate-900 font-bold text-base">Student Portal</h3>
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded-full">
                      2,847 Active
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">
                    Check company eligibility, upload resume, and explore AI career recommendations
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all ml-2 flex-shrink-0" />
              </button>

              {/* Faculty Role */}
              <button
                type="button"
                onClick={() => handleRoleSelect('faculty')}
                className="w-full flex items-center p-5 bg-white border border-slate-200/90 hover:border-violet-400 rounded-2xl shadow-saas hover:shadow-saas-md transition-all duration-200 group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-violet-600 transition-colors">
                  <User className="w-6 h-6 text-violet-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-slate-900 font-bold text-base">Faculty Evaluator</h3>
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-violet-50 text-violet-700 rounded-full">
                      124 Faculty
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">
                    Verify CGPA & internships, inspect resumes, and update benchmark scores
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all ml-2 flex-shrink-0" />
              </button>

              {/* TPC Role */}
              <button
                type="button"
                onClick={() => handleRoleSelect('tpc')}
                className="w-full flex items-center p-5 bg-white border border-slate-200/90 hover:border-emerald-400 rounded-2xl shadow-saas hover:shadow-saas-md transition-all duration-200 group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-emerald-600 transition-colors">
                  <Briefcase className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-slate-900 font-bold text-base">Placement Coordinator</h3>
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-full">
                      TPC Admin
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">
                    Manage recruiters, export eligibility reports, and broadcast notices
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all ml-2 flex-shrink-0" />
              </button>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-400">
              <span>Powered by Scikit-Learn & Decision Trees</span>
              <span className="font-medium text-slate-500">University Placement Cell</span>
            </div>
          </div>
        ) : (
          <div className="max-w-md w-full mx-auto animate-fadeIn">
            <button
              type="button"
              onClick={() => setActiveScreen('roles')}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 mb-6 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Role Selection
            </button>

            <div className="bg-white border border-slate-200/90 shadow-saas-md rounded-3xl p-7 sm:p-8">
              {/* Role Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${roleMeta.iconBg}`}>
                  <ActiveRoleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 font-display leading-tight">
                    {roleMeta.title}
                  </h2>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {isLogin ? 'Enter your credentials to access your workspace' : 'Create your institutional profile'}
                  </p>
                </div>
              </div>

              {/* Segmented Tab Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setError(null); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    isLogin
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setError(null); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    !isLogin
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Alerts */}
              {error && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="saas-label">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="saas-input pl-10"
                      placeholder="e.g. student"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="saas-label">Institutional Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="saas-input pl-10"
                        placeholder="name@university.edu"
                      />
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div>
                    <label className="saas-label">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="saas-input pl-10"
                        placeholder="e.g. Prerna Premkumar"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="saas-label">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="saas-input pl-10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Student Registration Fields */}
                {!isLogin && role === 'student' && (
                  <div className="space-y-3.5 pt-4 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                      Academic Details
                    </p>

                    <div>
                      <label className="saas-label">Roll Number</label>
                      <input
                        type="text"
                        required
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        className="saas-input py-2 text-xs font-mono"
                        placeholder="e.g. CS2026001"
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
                          className="saas-input py-2 px-3 text-xs"
                          placeholder="8.5"
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
                          className="saas-input py-2 px-3 text-xs"
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
                          className="saas-input py-2 px-3 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="saas-label">Key Skills (comma-separated)</label>
                      <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="saas-input py-2 text-xs"
                        placeholder="React, Python, SQL, Machine Learning"
                      />
                    </div>
                  </div>
                )}

                {/* Faculty Registration Fields */}
                {!isLogin && role === 'faculty' && (
                  <div className="space-y-3.5 pt-4 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-violet-600 uppercase tracking-wider">
                      Department Details
                    </p>
                    <div>
                      <label className="saas-label">Department</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="saas-input py-2.5 text-xs"
                      >
                        <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                        <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-sm mt-2"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : isLogin ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Sign In to Portal
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      Create Account
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Credentials */}
              {isLogin && (
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
                    Quick Demo Fill
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => { setUsername('student'); setPassword('student123'); }}
                      className="px-2.5 py-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-xs font-semibold text-slate-600 hover:text-indigo-700 rounded-xl transition-all"
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUsername('faculty'); setPassword('faculty123'); }}
                      className="px-2.5 py-2 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 text-xs font-semibold text-slate-600 hover:text-violet-700 rounded-xl transition-all"
                    >
                      Faculty
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUsername('tpc'); setPassword('tpc123'); }}
                      className="px-2.5 py-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-xs font-semibold text-slate-600 hover:text-emerald-700 rounded-xl transition-all"
                    >
                      TPC
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
