import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  RadialLinearScale, PointElement, LineElement, Filler,
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Navbar from '../components/Navbar';
import ScoreGauge from '../components/ScoreGauge';
import api from '../api/axios';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  RadialLinearScale, PointElement, LineElement, Filler
);

const verdictConfig = {
  shortlisted: {
    className: 'verdict-shortlisted',
    icon: '🎉',
    title: 'SHORTLISTED',
    color: 'var(--emerald-light)',
  },
  borderline: {
    className: 'verdict-borderline',
    icon: '⚠️',
    title: 'BORDERLINE',
    color: 'var(--amber)',
  },
  rejected: {
    className: 'verdict-rejected',
    icon: '❌',
    title: 'REJECTED',
    color: 'var(--rose-light)',
  },
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#1E2435', titleColor: '#F8FAFC', bodyColor: '#94A3B8' },
  },
  scales: {
    r: {
      ticks: { color: '#64748B', backdropColor: 'transparent', font: { size: 10 } },
      grid: { color: 'rgba(255,255,255,0.06)' },
      pointLabels: { color: '#94A3B8', font: { size: 12 } },
      min: 0,
      max: 100,
    },
    x: {
      ticks: { color: '#94A3B8' },
      grid: { color: 'rgba(255,255,255,0.04)' },
    },
    y: {
      ticks: { color: '#94A3B8' },
      grid: { color: 'rgba(255,255,255,0.04)' },
      min: 0,
      max: 100,
    },
  },
};

export default function AnalysisResult() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reportRef = useRef(null);

  useEffect(() => {
    api.get(`/analysis/${reportId}`)
      .then((res) => setReport(res.data))
      .catch(() => setError('Report not found or access denied.'))
      .finally(() => setLoading(false));
  }, [reportId]);

  const handleExportPDF = async () => {
    const el = reportRef.current;
    if (!el) return;
    const canvas = await html2canvas(el, { backgroundColor: '#0A0F1E', scale: 1.5 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
    pdf.save(`resume-analysis-${report.matchScore}pct.pdf`);
  };

  if (loading) return (
    <div><Navbar /><div className="loading-screen"><div className="spinner" /></div></div>
  );

  if (error) return (
    <div><Navbar /><div className="main-content"><div className="alert alert-error">{error}</div></div></div>
  );

  if (!report) return null;

  const vc = verdictConfig[report.verdict] || verdictConfig.borderline;
  const ss = report.sectionScores || {};

  const radarData = {
    labels: ['Skills', 'Keywords', 'Experience', 'Education'],
    datasets: [{
      label: 'Score',
      data: [ss.skills || 0, ss.keywords || 0, ss.experience || 0, ss.education || 0],
      backgroundColor: 'rgba(124, 58, 237, 0.15)',
      borderColor: '#7C3AED',
      borderWidth: 2,
      pointBackgroundColor: '#7C3AED',
      pointRadius: 4,
    }],
  };

  const barData = {
    labels: ['Skills Match', 'Keyword Match', 'Experience', 'Education', 'Overall'],
    datasets: [{
      data: [ss.skills || 0, ss.keywords || 0, ss.experience || 0, ss.education || 0, report.matchScore],
      backgroundColor: [
        'rgba(124,58,237,0.6)', 'rgba(6,182,212,0.6)',
        'rgba(16,185,129,0.6)', 'rgba(245,158,11,0.6)',
        'rgba(124,58,237,0.9)',
      ],
      borderRadius: 8,
    }],
  };

  return (
    <div>
      <Navbar />
      <div className="main-content" ref={reportRef}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page-title">Analysis Result</h1>
            <p className="page-subtitle">
              {report.resumeId?.originalName} vs <strong>{report.jobId?.title}</strong>
              {report.jobId?.company && ` @ ${report.jobId.company}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {report.usedLLM && (
              <span className="ai-badge">✨ AI-Assisted Analysis</span>
            )}
            <button className="btn btn-ghost btn-sm" onClick={handleExportPDF} id="btn-export-pdf">
              📥 Export PDF
            </button>
            <Link to="/upload">
              <button className="btn btn-primary btn-sm" id="btn-new-analysis">
                🎯 New Analysis
              </button>
            </Link>
          </div>
        </div>

        {/* Verdict Banner */}
        <div className={`verdict-banner ${vc.className} fade-in-up`}>
          <div className="verdict-icon">{vc.icon}</div>
          <div>
            <div className="verdict-title">{vc.title}</div>
            <div className="verdict-reason">{report.verdictReason}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Confidence</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: vc.color }}>
              {Math.round((report.confidence || 0.8) * 100)}%
            </div>
          </div>
        </div>

        {/* Score + Charts Row */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          {/* Score Gauge + Section Bars */}
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
              <ScoreGauge score={report.matchScore} size={160} />
              <div style={{ flex: 1, minWidth: 200 }}>
                {[
                  { label: 'Skills Match', val: ss.skills || 0, color: '#7C3AED' },
                  { label: 'Keyword Match', val: ss.keywords || 0, color: '#06B6D4' },
                  { label: 'Experience', val: ss.experience || 0, color: '#10B981' },
                  { label: 'Education', val: ss.education || 0, color: '#F59E0B' },
                ].map((item) => (
                  <div className="progress-bar-wrap" key={item.label}>
                    <div className="progress-bar-label">
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span style={{ fontSize: '0.82rem', color: item.color, fontWeight: 700 }}>{item.val}%</span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${item.val}%`, background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h3 className="section-title">📡 Section Radar</h3>
            <Radar data={radarData} options={{
              ...chartOptions,
              plugins: { ...chartOptions.plugins, legend: { display: false } },
            }} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
          <h3 className="section-title">📊 Score Breakdown</h3>
          <Bar data={barData} options={chartOptions} height={80} />
        </div>

        {/* Skills */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 className="section-title">✅ Matched Skills ({report.matchedSkills?.length || 0})</h3>
            <div className="skill-tags">
              {report.matchedSkills?.length > 0
                ? report.matchedSkills.map((s) => (
                  <span key={s} className="skill-tag skill-matched">{s}</span>
                ))
                : <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No skill matches found.</span>
              }
            </div>
          </div>
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 className="section-title">❌ Missing Skills ({report.missingSkills?.length || 0})</h3>
            <div className="skill-tags">
              {report.missingSkills?.length > 0
                ? report.missingSkills.map((s) => (
                  <span key={s} className="skill-tag skill-missing">{s}</span>
                ))
                : <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No critical skills missing!</span>
              }
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 className="section-title">💡 Improvement Suggestions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(report.suggestions || []).map((s, i) => (
              <div key={i} className="suggestion-card">
                <div className="suggestion-icon">{['📌', '🔧', '📚', '💼', '🎯'][i % 5]}</div>
                <div className="suggestion-text">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
