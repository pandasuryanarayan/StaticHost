import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';

const navItems = [
  { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
  { icon: '🌐', label: 'Sites', path: '/sites' },
  { icon: '📊', label: 'Analytics', path: '/analytics' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}
        style={{
          width: '240px',
          minWidth: '240px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 12px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', marginBottom: '24px', cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #7c3aed, #00d9ff)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px'
          }}>⚡</div>
          <span style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>StaticHost</span>
        </div>

        {/* New Site Button */}
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '20px' }}
          onClick={() => navigate('/sites/new')}
        >
          + New Site
        </button>

        {/* Nav Links */}
        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <div
              key={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '16px',
          marginTop: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', borderRadius: '8px', marginBottom: '8px' }}>
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=7c3aed&color=fff`}
              alt="Avatar"
              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
            />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <div
            className="nav-link"
            onClick={logout}
            style={{ color: 'var(--accent-red)' }}
          >
            <span>🚪</span>
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <div style={{
          height: '56px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: 'var(--bg-secondary)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          {/* Mobile Menu Button */}
          <button
            className="btn btn-ghost"
            style={{ display: 'none' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          {/* Breadcrumb */}
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {navItems.find(n => location.pathname.startsWith(n.path))?.label || 'Dashboard'}
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}>
              📖 Docs
            </button>
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=7c3aed&color=fff`}
              alt="Avatar"
              style={{ width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}
              onClick={() => navigate('/settings')}
            />
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }} className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
