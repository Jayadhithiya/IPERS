import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import {
  Briefcase, Plus, Edit2, Trash2, Megaphone, Newspaper,
  Check, X, RefreshCw, Download, LogOut, BarChart2,
  Building2, CheckCircle2, XCircle, Award
} from 'lucide-react';

export const TpcDashboard: React.FC = () => {
  const { token, logout, profile } = useAuth();

  // Data lists
  const [companies, setCompanies] = useState<any[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Company Form states
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [minCgpa, setMinCgpa] = useState('6.0');
  const [minAptitude, setMinAptitude] = useState('0');
  const [minTechnical, setMinTechnical] = useState('0');
  const [minCommunication, setMinCommunication] = useState('0');
  const [minInternships, setMinInternships] = useState('0');
  const [allowedArrears, setAllowedArrears] = useState('0');
  const [companyStatus, setCompanyStatus] = useState<'Open' | 'Closed'>('Open');
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Announcement Form states
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annSuccess, setAnnSuccess] = useState<string | null>(null);
  const [annError, setAnnError] = useState<string | null>(null);

  // Company News Form states
  const [newsCompany, setNewsCompany] = useState('');
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsSuccess, setNewsSuccess] = useState<string | null>(null);
  const [newsError, setNewsError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleExportReport = async () => {
    try {
      const response = await fetch(`${API_BASE}/tpc/eligibility-report`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to generate report.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Eligibility_Report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(err.message || 'Error exporting report.');
    }
  };

  const fetchCompanies = async () => {
    setCompaniesLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/tpc/companies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to retrieve companies list.');
      }
      const data = await response.json();
      setCompanies(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    } finally {
      setCompaniesLoading(false);
    }
  };

  const resetCompanyForm = () => {
    setIsEditingCompany(false);
    setEditingId(null);
    setCompanyName('');
    setMinCgpa('6.0');
    setMinAptitude('0');
    setMinTechnical('0');
    setMinCommunication('0');
    setMinInternships('0');
    setAllowedArrears('0');
    setCompanyStatus('Open');
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess(null);
    setFormError(null);

    const payload = {
      name: companyName,
      min_cgpa: parseFloat(minCgpa) || 0.0,
      min_aptitude: parseInt(minAptitude) || 0,
      min_technical: parseInt(minTechnical) || 0,
      min_communication: parseInt(minCommunication) || 0,
      min_internships: parseInt(minInternships) || 0,
      allowed_arrears: parseInt(allowedArrears) || 0,
      status: companyStatus
    };

    try {
      let response;
      if (isEditingCompany && editingId) {
        response = await fetch(`${API_BASE}/tpc/companies/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_BASE}/tpc/companies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Company submission failed.');
      }

      setFormSuccess(isEditingCompany ? 'Company criteria updated successfully!' : 'New recruiter profile added!');
      resetCompanyForm();
      fetchCompanies();
    } catch (err: any) {
      setFormError(err.message || 'Error occurred.');
    }
  };

  const handleEditCompany = (company: any) => {
    setIsEditingCompany(true);
    setEditingId(company.id);
    setCompanyName(company.name);
    setMinCgpa(company.min_cgpa.toString());
    setMinAptitude(company.min_aptitude.toString());
    setMinTechnical(company.min_technical.toString());
    setMinCommunication(company.min_communication.toString());
    setMinInternships(company.min_internships.toString());
    setAllowedArrears(company.allowed_arrears.toString());
    setCompanyStatus(company.status);
    setFormSuccess(null);
    setFormError(null);
  };

  const handleDeleteCompany = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    try {
      const response = await fetch(`${API_BASE}/tpc/companies/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete company.');
      }
      fetchCompanies();
    } catch (err: any) {
      alert(err.message || 'Error deleting company.');
    }
  };

  const handleToggleStatus = async (company: any) => {
    const nextStatus = company.status === 'Open' ? 'Closed' : 'Open';
    try {
      const response = await fetch(`${API_BASE}/tpc/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to toggle status.');
      }
      setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, status: nextStatus } : c));
    } catch (err: any) {
      alert(err.message || 'Error updating status.');
    }
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnSuccess(null);
    setAnnError(null);

    try {
      const response = await fetch(`${API_BASE}/tpc/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: annTitle, content: annContent })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create announcement.');
      }
      setAnnSuccess('Announcement broadcast to all students!');
      setAnnTitle('');
      setAnnContent('');
    } catch (err: any) {
      setAnnError(err.message || 'Error occurred.');
    }
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsSuccess(null);
    setNewsError(null);

    try {
      const response = await fetch(`${API_BASE}/tpc/company-news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          company_name: newsCompany,
          title: newsTitle,
          content: newsContent
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to post company news.');
      }
      setNewsSuccess('Company hiring update published!');
      setNewsCompany('');
      setNewsTitle('');
      setNewsContent('');
    } catch (err: any) {
      setNewsError(err.message || 'Error occurred.');
    }
  };

  const openDrives = companies.filter(c => c.status === 'Open').length;
  const closedDrives = companies.length - openDrives;
  const dreamDrives = companies.filter(c => c.cluster_type === 'High CGPA + High Aptitude').length;

  const tpcInitials = (profile?.name || 'TP')
    .split(' ')
    .filter((p: string) => !p.endsWith('.'))
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'TP';

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
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                TPC Admin Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200">
                {tpcInitials}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-semibold text-slate-900">{profile?.name}</p>
                <p className="text-xs text-slate-500">Placement Coordinator</p>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Coordinator Admin Console
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Configure eligibility benchmarks for campus drives, monitor active recruitments, and publish student notices.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchCompanies}
              className="btn-secondary px-4 py-2.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${companiesLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExportReport}
              className="btn-primary px-4 py-2.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Export Eligibility CSV
            </button>
          </div>
        </div>

        {/* KPI Summary Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="saas-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Recruiters</p>
              <p className="text-2xl font-extrabold text-slate-900 font-display tabular-nums">{companies.length}</p>
            </div>
          </div>

          <div className="saas-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Open Drives</p>
              <p className="text-2xl font-extrabold text-slate-900 font-display tabular-nums">{openDrives}</p>
            </div>
          </div>

          <div className="saas-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Closed Drives</p>
              <p className="text-2xl font-extrabold text-slate-900 font-display tabular-nums">{closedDrives}</p>
            </div>
          </div>

          <div className="saas-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Tier-1 / Dream</p>
              <p className="text-2xl font-extrabold text-slate-900 font-display tabular-nums">{dreamDrives}</p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left Column (8 cols): Recruiters Table + Add/Edit Form */}
          <div className="lg:col-span-8 space-y-7">
            {/* Recruiters Table */}
            <div className="saas-card overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h2 className="font-bold text-slate-900 text-base">Recruiters Directory</h2>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  Click status pill to toggle Open / Closed
                </span>
              </div>

              {companiesLoading ? (
                <div className="py-16 flex justify-center items-center">
                  <div className="w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : error ? (
                <div className="m-6 p-4 text-center bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                  {error}
                </div>
              ) : companies.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-12">
                  No companies configured yet. Use the form below to add a recruiter.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3.5 pl-6 pr-2">Company</th>
                        <th className="py-3.5 px-2 text-center">Criteria (CGPA · A/T/C · Int)</th>
                        <th className="py-3.5 px-2 text-center">Arrears</th>
                        <th className="py-3.5 px-2 text-center">Cluster Tier</th>
                        <th className="py-3.5 px-2 text-center">Status</th>
                        <th className="py-3.5 pl-2 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {companies.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/90 transition-colors">
                          <td className="py-4 pl-6 pr-2 font-bold text-slate-900 text-sm">{c.name}</td>
                          <td className="py-4 px-2 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/70 font-mono text-[11px] font-medium text-slate-700 tabular-nums">
                              {c.min_cgpa.toFixed(1)} · {c.min_aptitude}/{c.min_technical}/{c.min_communication} · {c.min_internships}i
                            </span>
                          </td>
                          <td className="py-4 px-2 text-center font-mono text-slate-600 tabular-nums">
                            ≤ {c.allowed_arrears}
                          </td>
                          <td className="py-4 px-2 text-center">
                            <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                              c.cluster_type === 'High CGPA + High Aptitude'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : c.cluster_type === 'Technical Skill Focused Companies'
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {c.cluster_type || 'Unclustered'}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-center">
                            <button
                              onClick={() => handleToggleStatus(c)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                                c.status === 'Open'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              }`}
                            >
                              {c.status === 'Open' ? (
                                <><Check className="w-3 h-3" /> Open</>
                              ) : (
                                <><X className="w-3 h-3" /> Closed</>
                              )}
                            </button>
                          </td>
                          <td className="py-4 pl-2 pr-6 text-right">
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => handleEditCompany(c)}
                                className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                                title="Edit Criteria"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCompany(c.id)}
                                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                title="Delete Company"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Company CRUD Form */}
            <div className={`saas-card p-6 ${isEditingCompany ? 'ring-2 ring-indigo-500/20 border-indigo-300' : ''}`}>
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-base leading-tight">
                      {isEditingCompany ? `Edit Criteria: ${companyName}` : 'Add New Recruiter'}
                    </h2>
                    <p className="text-[11px] text-slate-500">Define minimum eligibility rules for placement matching</p>
                  </div>
                </div>
                {isEditingCompany && (
                  <button
                    type="button"
                    onClick={resetCompanyForm}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              {formSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium">
                  {formSuccess}
                </div>
              )}
              {formError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCompanySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="saas-label">Company Name</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="saas-input py-2 text-sm"
                      placeholder="e.g. Amazon"
                    />
                  </div>
                  <div>
                    <label className="saas-label">Hiring Status</label>
                    <select
                      value={companyStatus}
                      onChange={(e) => setCompanyStatus(e.target.value as 'Open' | 'Closed')}
                      className="saas-input py-2 text-sm"
                    >
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div>
                    <label className="saas-label">Min CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      required
                      value={minCgpa}
                      onChange={(e) => setMinCgpa(e.target.value)}
                      className="saas-input py-2 text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="saas-label">Min Aptitude</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={minAptitude}
                      onChange={(e) => setMinAptitude(e.target.value)}
                      className="saas-input py-2 text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="saas-label">Min Technical</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={minTechnical}
                      onChange={(e) => setMinTechnical(e.target.value)}
                      className="saas-input py-2 text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="saas-label">Min Comm.</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={minCommunication}
                      onChange={(e) => setMinCommunication(e.target.value)}
                      className="saas-input py-2 text-sm tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="saas-label">Min Internships Required</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={minInternships}
                      onChange={(e) => setMinInternships(e.target.value)}
                      className="saas-input py-2 text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="saas-label">Max Allowed Arrears</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={allowedArrears}
                      onChange={(e) => setAllowedArrears(e.target.value)}
                      className="saas-input py-2 text-sm tabular-nums"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button type="submit" className="btn-primary flex-1 py-2.5 text-xs">
                    {isEditingCompany ? 'Update Recruiter Criteria' : 'Add Recruiter Profile'}
                  </button>
                  {isEditingCompany && (
                    <button
                      type="button"
                      onClick={resetCompanyForm}
                      className="btn-secondary px-5 py-2.5 text-xs"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right Column (4 cols): Broadcast Studio */}
          <div className="lg:col-span-4 space-y-7">
            {/* Announcement Publisher */}
            <div className="saas-card p-6">
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base leading-tight">Publish Announcement</h2>
                  <p className="text-[11px] text-slate-500">Broadcast campus-wide placement notices</p>
                </div>
              </div>

              {annSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium">
                  {annSuccess}
                </div>
              )}
              {annError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                  {annError}
                </div>
              )}

              <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                <div>
                  <label className="saas-label">Notice Title</label>
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="e.g. TCS Drive Registration Deadline"
                    className="saas-input py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="saas-label">Message Content</label>
                  <textarea
                    required
                    rows={4}
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    placeholder="Include dates, venue, or eligibility reminders..."
                    className="saas-input py-2 text-xs resize-none"
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-2.5 text-xs">
                  <Megaphone className="w-3.5 h-3.5" />
                  Broadcast Notice
                </button>
              </form>
            </div>

            {/* Company News Publisher */}
            <div className="saas-card p-6">
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Newspaper className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base leading-tight">Company Hiring Update</h2>
                  <p className="text-[11px] text-slate-500">Post drive schedules & recruiter updates</p>
                </div>
              </div>

              {newsSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium">
                  {newsSuccess}
                </div>
              )}
              {newsError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                  {newsError}
                </div>
              )}

              <form onSubmit={handleNewsSubmit} className="space-y-4">
                <div>
                  <label className="saas-label">Target Company</label>
                  <input
                    type="text"
                    required
                    value={newsCompany}
                    onChange={(e) => setNewsCompany(e.target.value)}
                    placeholder="e.g. Google"
                    className="saas-input py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="saas-label">Headline</label>
                  <input
                    type="text"
                    required
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="e.g. Interview Dates Rescheduled"
                    className="saas-input py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="saas-label">Details</label>
                  <textarea
                    required
                    rows={4}
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    placeholder="Share presentation slides, test syllabus, or interview rounds..."
                    className="saas-input py-2 text-xs resize-none"
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-2.5 text-xs">
                  <Newspaper className="w-3.5 h-3.5" />
                  Publish Update
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
