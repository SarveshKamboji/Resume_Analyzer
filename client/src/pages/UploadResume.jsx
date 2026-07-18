import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ResumeDropzone from '../components/ResumeDropzone';
import api from '../api/axios';

export default function UploadResume() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [step, setStep] = useState(1); // 1: upload, 2: select job, 3: analyzing
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/jobs').then((res) => setJobs(res.data));
  }, []);

  const handleAnalyze = async () => {
    if (!file || !selectedJob) {
      return setError('Please upload a resume and select a job.');
    }
    setError('');
    setLoading(true);
    setStep(3);

    try {
      // Step 1: Upload resume
      const formData = new FormData();
      formData.append('resume', file);
      const uploadRes = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const resumeId = uploadRes.data.resume._id;

      // Step 2: Run analysis
      const analysisRes = await api.post('/analysis', { resumeId, jobId: selectedJob });
      navigate(`/analysis/${analysisRes.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Analyze Resume</h1>
          <p className="page-subtitle">Upload your resume and select a job to get an instant match score.</p>
        </div>

        {/* Steps indicator */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 36, maxWidth: 500 }}>
          {['Upload Resume', 'Select Job', 'Analyze'].map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, flex: 1,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: step > i + 1 ? 'var(--emerald)' : step === i + 1 ? 'var(--violet)' : 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                  transition: 'all 0.3s',
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  color: step === i + 1 ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: step === i + 1 ? 600 : 400,
                }}>
                  {s}
                </span>
              </div>
              {i < 2 && <div style={{ width: 24, height: 1, background: 'var(--card-border)', flexShrink: 0 }} />}
            </div>
          ))}
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {/* Step 3: Analyzing */}
        {step === 3 && (
          <div className="glass-card" style={{ padding: 64, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div className="spinner" style={{ width: 56, height: 56, borderWidth: 4 }} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 12 }}>
              Analyzing Your Resume...
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Running TF-IDF keyword analysis and generating your match score. This takes 2–5 seconds.
            </p>
          </div>
        )}

        {step !== 3 && (
          <div className="grid-2" style={{ gap: 28 }}>
            {/* Upload Section */}
            <div>
              <h2 className="section-title">📄 Step 1: Your Resume</h2>
              <ResumeDropzone onFileDrop={(f) => { setFile(f); setStep(2); }} file={file} />
              {file && (
                <div style={{ marginTop: 12 }}>
                  <div className="alert alert-success">
                    ✅ {file.name} ready for analysis
                  </div>
                </div>
              )}
            </div>

            {/* Job Selection */}
            <div>
              <h2 className="section-title">💼 Step 2: Select a Job</h2>
              {jobs.length === 0 ? (
                <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>📭</div>
                  <p>No jobs available yet.</p>
                  <p style={{ fontSize: '0.8rem', marginTop: 8 }}>Ask an admin to post job listings.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {jobs.map((job) => (
                    <div
                      key={job._id}
                      className="glass-card"
                      onClick={() => setSelectedJob(job._id)}
                      id={`job-card-${job._id}`}
                      style={{
                        padding: '18px 20px',
                        cursor: 'pointer',
                        border: selectedJob === job._id
                          ? '1px solid var(--violet)'
                          : '1px solid var(--card-border)',
                        background: selectedJob === job._id
                          ? 'rgba(124,58,237,0.1)'
                          : 'var(--card-bg)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{job.title}</div>
                          {job.company && (
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              🏢 {job.company}
                            </div>
                          )}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                            {job.requiredSkills?.slice(0, 4).map((skill) => (
                              <span key={skill} className="badge badge-violet">{skill}</span>
                            ))}
                            {job.requiredSkills?.length > 4 && (
                              <span className="badge badge-cyan">+{job.requiredSkills.length - 4} more</span>
                            )}
                          </div>
                        </div>
                        {selectedJob === job._id && (
                          <span style={{ color: 'var(--violet-light)', fontSize: '1.2rem' }}>✓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 24 }}
                onClick={handleAnalyze}
                disabled={!file || !selectedJob || loading}
                id="btn-run-analysis"
              >
                🎯 Run Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
