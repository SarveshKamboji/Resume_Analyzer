import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const verdictStyle = {
  shortlisted: { color: 'var(--emerald-light)', bg: 'rgba(16,185,129,0.1)', icon: '✅' },
  borderline: { color: 'var(--amber)', bg: 'rgba(245,158,11,0.1)', icon: '⚠️' },
  rejected: { color: 'var(--rose-light)', bg: 'rgba(244,63,94,0.1)', icon: '❌' },
};

export default function AllReports() {
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/analysis/admin/all')
      .then((r) => { setReports(r.data); setFiltered(r.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let data = reports;
    if (filter !== 'all') data = data.filter((r) => r.verdict === filter);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((r) =>
        r.userId?.username?.toLowerCase().includes(q) ||
        r.jobId?.title?.toLowerCase().includes(q) ||
        r.resumeId?.originalName?.toLowerCase().includes(q)
      );
    }
    setFiltered(data);
  }, [filter, search, reports]);

  if (loading) return (
    <div><Navbar /><div className="loading-screen"><div className="spinner" /></div></div>
  );

  return (
    <div>
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">All Reports 📋</h1>
          <p className="page-subtitle">Complete history of all resume analysis results across all users.</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="form-input"
            style={{ maxWidth: 260 }}
            placeholder="🔍 Search user, job, resume..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="reports-search"
          />
          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'shortlisted', 'borderline', 'rejected'].map((v) => (
              <button
                key={v}
                className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilter(v)}
                id={`filter-${v}`}
              >
                {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {filtered.length} report{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Candidate</th>
                  <th>Resume</th>
                  <th>Job</th>
                  <th>Score</th>
                  <th>Verdict</th>
                  <th>AI Used</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => {
                  const vs = verdictStyle[r.verdict] || verdictStyle.borderline;
                  return (
                    <tr
                      key={r._id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/analysis/${r._id}`)}
                      id={`report-row-${r._id}`}
                    >
                      <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {r.userId?.username || 'N/A'}
                      </td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.resumeId?.originalName || 'N/A'}
                      </td>
                      <td>
                        {r.jobId?.title}
                        {r.jobId?.company && <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>@ {r.jobId.company}</span>}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: vs.color, fontSize: '1rem' }}>
                          {r.matchScore}%
                        </span>
                      </td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: '100px', background: vs.bg, color: vs.color, fontSize: '0.75rem', fontWeight: 600 }}>
                          {vs.icon} {r.verdict}
                        </span>
                      </td>
                      <td>
                        {r.usedLLM ? (
                          <span className="badge badge-violet">✨ AI</span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TF-IDF</span>
                        )}
                      </td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                      No reports found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
