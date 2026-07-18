import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const features = [
  { icon: '🎯', title: 'ATS-Grade Scoring', desc: 'Algorithmic TF-IDF analysis compares your resume against the job description like a real ATS system.', color: 'rgba(124,58,237,0.15)' },
  { icon: '⚡', title: 'Instant Results', desc: 'Get your match score, skill analysis, and improvement suggestions in seconds.', color: 'rgba(6,182,212,0.15)' },
  { icon: '✅', title: 'Shortlist Verdict', desc: 'Know immediately: SHORTLISTED, BORDERLINE, or REJECTED — with an explainable reason.', color: 'rgba(16,185,129,0.15)' },
  { icon: '📊', title: 'Visual Analytics', desc: 'Interactive charts show skill match breakdown, section scores, and radar analysis.', color: 'rgba(245,158,11,0.15)' },
  { icon: '💡', title: 'Smart Suggestions', desc: 'Actionable improvement tips to close the gap between your resume and the job requirements.', color: 'rgba(244,63,94,0.15)' },
  { icon: '🔐', title: 'Secure & Private', desc: 'JWT authentication with role-based access. Your data is yours alone.', color: 'rgba(124,58,237,0.15)' },
];

export default function LandingPage() {
  return (
    <div>
      <Navbar />
      <main>
        {/* ── HERO ── */}
        <section className="hero-section">
          <div className="hero-glow" />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
            <div className="hero-badge">
              <span>🚀</span> AI-Powered Resume Analyzer
            </div>
            <h1 className="hero-title">
              Know Your Chances<br />
              <span className="grad-text">Before You Apply</span>
            </h1>
            <p className="hero-subtitle">
              Upload your resume, paste the job description, and get an instant ATS-grade score —
              matched skills, missing gaps, improvement tips, and a clear <strong>shortlisting verdict</strong>.
            </p>
            <div className="hero-actions">
              <Link to="/register">
                <button className="btn btn-primary btn-lg" id="hero-cta-register">
                  🎯 Analyze My Resume
                </button>
              </Link>
              <Link to="/login">
                <button className="btn btn-ghost btn-lg" id="hero-cta-login">
                  Login →
                </button>
              </Link>
            </div>

            {/* Stats row */}
            <div style={{
              display: 'flex',
              gap: 32,
              justifyContent: 'center',
              marginTop: 56,
              flexWrap: 'wrap',
            }}>
              {[
                { label: 'Match Accuracy', value: '92%' },
                { label: 'Skills Tracked', value: '300+' },
                { label: 'Instant Analysis', value: '<2s' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ padding: '0 32px 100px', maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.03em' }}>
            Everything You Need to Land the Job
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 48 }}>
            Built for candidates who want real feedback, not guesswork.
          </p>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="glass-card feature-card fade-in-up">
                <div className="feature-icon" style={{ background: f.color }}>
                  {f.icon}
                </div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA FOOTER ── */}
        <section style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.1) 100%)',
          borderTop: '1px solid var(--card-border)',
          padding: '80px 32px',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.03em' }}>
            Ready to Stand Out?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
            Create your free account and analyze your first resume in under 2 minutes.
          </p>
          <Link to="/register">
            <button className="btn btn-primary btn-lg" id="footer-cta">
              Get Started Free →
            </button>
          </Link>
        </section>
      </main>
    </div>
  );
}
