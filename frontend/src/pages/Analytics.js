import React, { useState, useEffect } from 'react';
import { sitesApi } from '../api';
import { useToast } from '../App';

function MiniChart({ data, color = '#7c3aed' }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const normalized = data.map(v => (v / max) * 100);
  const points = normalized.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - v}`).join(' ');

  return (
    <svg viewBox="0 0 100 50" preserveAspectRatio="none" style={{ width: '100%', height: '60px' }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,100 ${points} 100,100`}
        fill="url(#chartGrad)"
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BarChart({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.views));

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px', padding: '0 8px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div
            className="chart-bar"
            style={{ width: '100%', height: `${(d.views / max) * 100}%`, minHeight: '4px' }}
          ></div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', textAlign: 'center' }}>
            {d.date.split(' ')[0]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    sitesApi.list().then(res => {
      setSites(res.data);
      const liveSites = res.data.filter(s => s.status === 'live');
      if (liveSites.length > 0) {
        setSelectedSite(liveSites[0]);
      }
    }).catch(() => addToast('Failed to load sites', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedSite) return;
    setAnalytics(null);
    sitesApi.getAnalytics(selectedSite.id)
      .then(res => setAnalytics(res.data))
      .catch(() => addToast('Failed to load analytics', 'error'));
  }, [selectedSite]);

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '24px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }}></div>)}
        </div>
      </div>
    );
  }

  const chartData = analytics?.chart?.map(d => d.views) || [];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px' }}>📊 Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Monitor your site performance</p>
        </div>
        {sites.length > 0 && (
          <select
            className="form-input"
            style={{ maxWidth: '280px', cursor: 'pointer' }}
            value={selectedSite?.id || ''}
            onChange={e => setSelectedSite(sites.find(s => s.id === e.target.value))}
          >
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </div>

      {!selectedSite || sites.filter(s => s.status === 'live').length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>No Analytics Available</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Deploy a site first to start seeing analytics data.</p>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {analytics ? [
              { icon: '👁️', label: 'Total Page Views', value: analytics.overview.totalViews.toLocaleString(), color: '#7c3aed' },
              { icon: '👤', label: 'Unique Visitors', value: analytics.overview.uniqueVisitors.toLocaleString(), color: '#2563eb' },
              { icon: '📡', label: 'Bandwidth Used', value: analytics.overview.bandwidth, color: '#00d9ff' },
              { icon: '⚡', label: 'Avg Load Time', value: analytics.overview.avgLoadTime, color: '#00e676' },
            ].map(item => (
              <div key={item.label} className="stat-card">
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{item.icon} {item.label}</p>
                <p style={{ fontSize: '28px', fontWeight: '800', color: item.color }}>{item.value}</p>
              </div>
            )) : (
              [1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '90px', borderRadius: '12px' }}></div>)
            )}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {/* Views Chart */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>📈 Page Views (Last 7 Days)</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Daily view counts</p>
              {analytics ? (
                <>
                  <MiniChart data={chartData} color="#7c3aed" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    {analytics.chart.slice(0, 4).map((d, i) => (
                      <span key={i} style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.date.split(' ')[0]}</span>
                    ))}
                  </div>
                </>
              ) : <div className="skeleton" style={{ height: '80px' }}></div>}
            </div>

            {/* Bar Chart */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>📊 Traffic by Day</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Weekly traffic overview</p>
              {analytics ? (
                <BarChart data={analytics.chart} />
              ) : <div className="skeleton" style={{ height: '120px' }}></div>}
            </div>
          </div>

          {/* Bottom Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Top Pages */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>📄 Top Pages</h3>
              {analytics ? analytics.topPages.map((page, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < analytics.topPages.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--accent-cyan)' }}>{page.page}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>{page.views.toLocaleString()} views</span>
                </div>
              )) : <div className="skeleton" style={{ height: '120px' }}></div>}
            </div>

            {/* Countries */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>🌍 Top Countries</h3>
              {analytics ? analytics.countries.map((c, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px' }}>{c.country}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>{c.percentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${c.percentage}%` }}></div>
                  </div>
                </div>
              )) : <div className="skeleton" style={{ height: '150px' }}></div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
