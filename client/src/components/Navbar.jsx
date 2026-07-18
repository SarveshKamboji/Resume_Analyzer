import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <Link to={user ? '/dashboard' : '/'} className="navbar-brand">
        <div className="navbar-logo">🎯</div>
        <span>ResumeAI</span>
      </Link>

      <div className="navbar-nav">
        {user ? (
          <>
            {user.role === 'admin' ? (
              <>
                <Link to="/admin" className={isActive('/admin')}>Dashboard</Link>
                <Link to="/admin/jobs" className={isActive('/admin/jobs')}>Manage Jobs</Link>
                <Link to="/admin/reports" className={isActive('/admin/reports')}>All Reports</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
                <Link to="/upload" className={isActive('/upload')}>Analyze</Link>
              </>
            )}
            <div style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                padding: '6px 14px',
                borderRadius: '100px',
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.2)',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--violet-light)',
              }}>
                {user.username}
                {user.role === 'admin' && (
                  <span style={{ marginLeft: 6, color: 'var(--amber)', fontSize: '0.72rem' }}>ADMIN</span>
                )}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link" id="nav-login">Login</Link>
            <Link to="/register">
              <button className="btn btn-primary btn-sm" id="nav-register">Get Started</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
