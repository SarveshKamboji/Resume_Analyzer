import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Navbar from '../components/Navbar';
import api from '../api/axios';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/analysis/admin/stats'),
      api.get('/analysis/admin/all'),
    ]).then(([statsRes, reportsRes]) => {
      setStats(statsRes.data);
      setReports(reportsRes.data.slice(0, 10));
    }).finally(() => setLoading(false));
  }, []);

  const doughnutData = stats ? {
    labels: ['Shortlisted', 'Borderline', 'Rejected'],
    datasets: [{
      data: [
        stats.verdictBreakdown.shortlisted,
        stats.verdictBreakdown.borderline,
        stats.verdictBreakdown.rejected,
      ],
      backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(244,63,94,0.8)'],
      borderColor: ['#10B981', '#F59E0B', '#F43F5E'],
      borderWidth: 2,
    }],
  } : null;

  if (loading) return (
    <div><Navbar /><div className="loading-screen"><div className="spinner" /></div></div>
  );

  const verdictStyle = {
    shortlisted: { color: 'var(--emerald-light)', bg: 'rgba(16,185,129,0.1)', icon: '✅' },
    borderline: { color: 'var(--amber)', bg: 'rgba(245,158,11,0.1)', icon: '⚠️' },
    rejected: { color: 'var(--rose-light)', bg: 'rgba(244,63,94,0.1)', icon: '❌' },
  };

  return (
    <div>
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard 🏢</h1>
          <p className="page-subtitle">Platform-wide analytics and resume analysis reports.</p>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {[
            { icon: '👥', label: 'Total Users', value: stats?.totalUsers || 0, color: 'rgba(124,58,237,0.15)' },
            { icon: '📊', label: 'Total Analyses', value: stats?.totalReports || 0, color: 'rgba(6,182,212,0.15)' },
            { icon: '🏆', label: 'Avg Match Score', value: `${stats?.avgMatchScore || 0}%`, color: 'rgba(245,158,11,0.15)' },
            { icon: '✅', label: 'Shortlisted', value: stats?.verdictBreakdown?.shortlisted || 0, color: 'rgba(16,185,129,0.15)' },
          ].map((s) => (
            <div key={s.label} className="glass-card stat-card">
              <div className="stat-card-icon" style={{ background: s.color }}>{s.icon}</div>
              <div className="stat-card-value">{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ marginBottom: 32 }}>
          {/* Doughnut Chart */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h2 className="section-title">📈 Verdict Distribution</h2>
            {doughnutData && stats?.totalReports > 0 ? (
              <div style={{ maxWidth: 280, margin: '0 auto' }}>
                <Doughnut data={doughnutData} options={{
                  plugins: {
                    legend: { labels: { color: '#94A3B8', padding: 16 } },
                    tooltip: { backgroundColor: '#1E2435' },
                  },
                  cutout: '65%',
                }} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                No data yet
              </div>
            )}
          </div>

          {/* Verdict Breakdown */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h2 className="section-title">🔢 Verdict Breakdown</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
              {['shortlisted', 'borderline', 'rejected'].map((v) => {
                const count = stats?.verdictBreakdown?.[v] || 0;
                const total = stats?.totalReports || 1;
                const pct = Math.round((count / total) * 100);
                const vs = verdictStyle[v];
                return (
                  <div key={v}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: vs.color }}>
                        {vs.icon} {v.charAt(0).toUpperCase() + v.slice(1)}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${pct}%`, background: vs.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Reports Table */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="section-title" style={{ margin: 0 }}>📋 Recent Analyses</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/reports')} id="btn-view-all-reports">
              View All →
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Resume</th>
                  <th>Job</th>
                  <th>Score</th>
                  <th>Verdict</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => {
                  const vs = verdictStyle[r.verdict] || verdictStyle.borderline;
                  return (
                    <tr key={r._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/analysis/${r._id}`)}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {r.userId?.username || 'N/A'}
                      </td>
                      <td>{r.resumeId?.originalName || 'N/A'}</td>
                      <td>{r.jobId?.title} {r.jobId?.company ? `@ ${r.jobId.company}` : ''}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: vs.color }}>{r.matchScore}%</span>
                      </td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: '100px', background: vs.bg, color: vs.color, fontSize: '0.75rem', fontWeight: 600 }}>
                          {vs.icon} {r.verdict}
                        </span>
                      </td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
                {reports.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No reports yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
