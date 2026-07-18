import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const verdictConfig = {
  shortlisted: { color: 'var(--emerald-light)', bg: 'rgba(16,185,129,0.1)', icon: '✅', label: 'Shortlisted' },
  borderline: { color: 'var(--amber)', bg: 'rgba(245,158,11,0.1)', icon: '⚠️', label: 'Borderline' },
  rejected: { color: 'var(--rose-light)', bg: 'rgba(244,63,94,0.1)', icon: '❌', label: 'Rejected' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analysis/user/all'),
      api.get('/resumes'),
    ]).then(([reportsRes, resumesRes]) => {
      setReports(reportsRes.data);
      setResumes(resumesRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const avgScore = reports.length > 0
    ? Math.round(reports.reduce((s, r) => s + r.matchScore, 0) / reports.length)
    : 0;

  const shortlisted = reports.filter((r) => r.verdict === 'shortlisted').length;

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-screen">
          <div className="spinner" />
          <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="main-content">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Good day, {user?.username}! 👋</h1>
          <p className="page-subtitle">Here's an overview of your resume analysis activity.</p>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {[
            { icon: '📄', label: 'Resumes Uploaded', value: resumes.length, color: 'rgba(124,58,237,0.15)' },
            { icon: '📊', label: 'Analyses Run', value: reports.length, color: 'rgba(6,182,212,0.15)' },
            { icon: '🏆', label: 'Avg Match Score', value: `${avgScore}%`, color: 'rgba(245,158,11,0.15)' },
            { icon: '✅', label: 'Shortlisted', value: shortlisted, color: 'rgba(16,185,129,0.15)' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card stat-card fade-in-up">
              <div className="stat-card-icon" style={{ background: stat.color }}>{stat.icon}</div>
              <div className="stat-card-value">{stat.value}</div>
              <div className="stat-card-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ gap: 24 }}>
          {/* Recent Analyses */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)' }}>
              <h2 className="section-title" style={{ margin: 0 }}>📊 Recent Analyses</h2>
            </div>
            {reports.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
                <p>No analyses yet.</p>
                <Link to="/upload" style={{ display: 'inline-block', marginTop: 12 }}>
                  <button className="btn btn-primary btn-sm">Analyze Your First Resume</button>
                </Link>
              </div>
            ) : (
              reports.slice(0, 6).map((report) => {
                const vc = verdictConfig[report.verdict] || verdictConfig.borderline;
                return (
                  <div
                    key={report._id}
                    className="report-item"
                    onClick={() => navigate(`/analysis/${report._id}`)}
                    id={`report-${report._id}`}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {report.resumeId?.originalName || 'Resume'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        vs {report.jobId?.title} · {report.jobId?.company}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: vc.color,
                      }}>{report.matchScore}%</span>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '100px',
                        background: vc.bg,
                        color: vc.color,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}>
                        {vc.icon} {vc.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="glass-card" style={{ padding: 28 }}>
              <h2 className="section-title">⚡ Quick Actions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link to="/upload">
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} id="btn-new-analysis">
                    🎯 New Resume Analysis
                  </button>
                </Link>
              </div>
            </div>

            {/* Uploaded Resumes */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)' }}>
                <h2 className="section-title" style={{ margin: 0 }}>📁 My Resumes</h2>
              </div>
              {resumes.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No resumes uploaded yet.
                </div>
              ) : (
                resumes.slice(0, 4).map((r) => (
                  <div key={r._id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <span>📄</span>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.originalName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.skills?.slice(0, 3).join(', ')}
                      </div>
                    </div>
                    <span className="badge badge-violet">{r.fileType?.toUpperCase()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
