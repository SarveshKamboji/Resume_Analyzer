import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ title: '', company: '', description: '', requiredSkills: '', experienceLevel: 'any' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchJobs = () => api.get('/jobs').then((r) => setJobs(r.data));

  useEffect(() => { fetchJobs(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.title || !form.description) return setError('Title and description are required.');
    setLoading(true);
    try {
      const skills = form.requiredSkills
        ? form.requiredSkills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
        : [];
      await api.post('/jobs', { ...form, requiredSkills: skills });
      setSuccess('Job posted successfully!');
      setForm({ title: '', company: '', description: '', requiredSkills: '', experienceLevel: 'any' });
      setShowForm(false);
      fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs(jobs.filter((j) => j._id !== id));
    } catch {
      setError('Failed to delete job.');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page-title">Manage Jobs 💼</h1>
            <p className="page-subtitle">Create and manage job descriptions for resume matching.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} id="btn-new-job">
            {showForm ? '✕ Cancel' : '+ New Job'}
          </button>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        {/* Create Form */}
        {showForm && (
          <div className="glass-card" style={{ padding: 28, marginBottom: 28 }}>
            <h2 className="section-title">📝 Post New Job</h2>
            <form onSubmit={handleSubmit} id="create-job-form">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input id="job-title" className="form-input" placeholder="Software Engineer" value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input id="job-company" className="form-input" placeholder="Google, Amazon..." value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Job Description *</label>
                <textarea id="job-description" className="form-textarea" rows={5} placeholder="Describe the role, responsibilities, requirements..."
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Required Skills (comma-separated)</label>
                  <input id="job-skills" className="form-input" placeholder="React, Node.js, MongoDB..." value={form.requiredSkills}
                    onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Leave blank to auto-extract from description
                  </span>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience Level</label>
                  <select id="job-exp-level" className="form-select" value={form.experienceLevel}
                    onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}>
                    <option value="any">Any Level</option>
                    <option value="entry">Entry Level (0-2 yrs)</option>
                    <option value="mid">Mid Level (2-5 yrs)</option>
                    <option value="senior">Senior (5+ yrs)</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} id="btn-post-job">
                {loading ? 'Posting...' : '📌 Post Job'}
              </button>
            </form>
          </div>
        )}

        {/* Jobs Grid */}
        {jobs.length === 0 ? (
          <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
            <p style={{ color: 'var(--text-muted)' }}>No jobs posted yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid-2">
            {jobs.map((job) => (
              <div key={job._id} className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{job.title}</h3>
                    {job.company && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>🏢 {job.company}</div>}
                  </div>
                  <span className="badge badge-cyan">{job.experienceLevel}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                  {job.description.substring(0, 140)}...
                </p>
                <div className="skill-tags" style={{ marginBottom: 16 }}>
                  {job.requiredSkills?.slice(0, 5).map((s) => (
                    <span key={s} className="skill-tag skill-matched">{s}</span>
                  ))}
                  {job.requiredSkills?.length > 5 && (
                    <span className="badge badge-cyan">+{job.requiredSkills.length - 5}</span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(job._id)}
                    id={`btn-delete-job-${job._id}`}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
