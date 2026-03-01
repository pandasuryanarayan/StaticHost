import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { sitesApi, userApi } from '../api';

function StatCard({ icon, label, value, color, delta }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{label}</p>
          <p style={{ fontSize: '32px', fontWeight: '800', color: color || 'white' }}>{value}</p>
          {delta && <p style={{ fontSize: '12px', color: 'var(--accent-green)', marginTop: '6px' }}>↑ {delta}</p>}
        </div>
        <div style={{
          width: '44px', height: '44px',
          background: `${color}20`,
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px'
        }}>{icon}</div>
      </div>
    </div>
  );
}

function SiteCard({ site, onClick }) {
  const statusColors = { live: 'badge-live', building: 'badge-building', failed: 'badge-failed', inactive: 'badge-inactive' };
  const statusIcons = { live: '🟢', building: '🟡', failed: '🔴', inactive: '⚫' };

  return (
    <div className="card" style={{ padding: '20px', cursor: 'pointer' }} onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: `linear-gradient(135deg, ${['#7c3aed', '#2563eb', '#00d9ff', '#00e676', '#ff4444'][Math.floor(Math.random() * 5)]}, #111)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
          }}>🌐</div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '2px' }}>{site.name}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {new Date(site.updatedAt || site.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <span className={`badge ${statusColors[site.status] || 'badge-inactive'}`}>
          {statusIcons[site.status]} {site.status}
        </span>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', wordBreak: 'break-all', marginBottom: '12px' }}>
        🔗 {site.url || `localhost:3001/sites/${site.name}`}
      </div>
      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <span>📦 {site.deploymentCount || 0} deploys</span>
        {site.size && <span>💾 {site.size}</span>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userApi.stats(),
      sitesApi.list()
    ]).then(([statsRes, sitesRes]) => {
      setStats(statsRes.data);
      setSites(sitesRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: '32px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
          {greeting}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Here's an overview of your StaticHost projects.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '36px' }}>
        <StatCard icon="🌐" label="Total Sites" value={stats?.totalSites || 0} color="#7c3aed" delta="2 this month" />
        <StatCard icon="🚀" label="Deployments" value={stats?.totalDeployments || 0} color="#2563eb" delta={`${stats?.successfulDeployments || 0} successful`} />
        <StatCard icon="✅" label="Active Sites" value={stats?.activeSites || 0} color="#00e676" />
        <StatCard icon="📊" label="Bandwidth Used" value={stats?.bandwidthUsed || '0 B'} color="#00d9ff" />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '36px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary"
          style={{ padding: '12px 24px' }}
          onClick={() => navigate('/sites/new')}
        >
          🚀 Deploy New Site
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/sites')}
        >
          🌐 View All Sites
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/analytics')}
        >
          📊 View Analytics
        </button>
      </div>

      {/* Recent Sites */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Recent Sites</h2>
          <button className="btn btn-ghost" style={{ fontSize: '13px' }} onClick={() => navigate('/sites')}>
            View All →
          </button>
        </div>

        {sites.length === 0 ? (
          <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>Deploy your first site!</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '15px' }}>
              Upload your static files and go live in seconds.
            </p>
            <button
              className="btn btn-primary"
              style={{ padding: '12px 28px' }}
              onClick={() => navigate('/sites/new')}
            >
              🚀 Start Deploying
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {sites.slice(0, 6).map(site => (
              <SiteCard key={site.id} site={site} onClick={() => navigate(`/sites/${site.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
