import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sitesApi, API_BASE_URL } from '../api';
import { useToast } from '../App';

export default function SiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [site, setSite] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [savingDomain, setSavingDomain] = useState(false);

  useEffect(() => {
    Promise.all([
      sitesApi.get(id),
      sitesApi.getDeployments(id)
    ]).then(([siteRes, depRes]) => {
      setSite(siteRes.data);
      setDeployments(depRes.data);
      setCustomDomain(siteRes.data.customDomain || '');
    }).catch(() => {
      addToast('Failed to load site', 'error');
      navigate('/sites');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await sitesApi.delete(id);
      addToast(`Site deleted successfully`, 'success');
      navigate('/sites');
    } catch (err) {
      addToast(err.response?.data?.error || 'Delete failed', 'error');
    }
  };

  const handleSaveDomain = async () => {
    setSavingDomain(true);
    try {
      await sitesApi.update(id, { customDomain });
      addToast('Custom domain saved!', 'success');
    } catch (err) {
      addToast('Failed to save domain', 'error');
    } finally {
      setSavingDomain(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: '48px', width: '300px', marginBottom: '32px' }}></div>
        <div className="skeleton" style={{ height: '200px', borderRadius: '12px', marginBottom: '24px' }}></div>
        <div className="skeleton" style={{ height: '300px', borderRadius: '12px' }}></div>
      </div>
    );
  }

  if (!site) return null;

  const statusBadge = { live: 'badge-live', building: 'badge-building', failed: 'badge-failed', inactive: 'badge-inactive' };
  const tabs = ['overview', 'deployments', 'settings'];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/sites')} style={{ padding: '8px' }}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800' }}>{site.name}</h1>
            <span className={`badge ${statusBadge[site.status] || 'badge-inactive'}`}>{site.status}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Created {new Date(site.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {site.status === 'live' && (
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ textDecoration: 'none', padding: '10px 20px' }}
            >
              🌐 Visit Site
            </a>
          )}
          <button
            className="btn btn-secondary"
            style={{ padding: '10px 20px' }}
            onClick={() => navigate('/sites/new')}
          >
            🚀 Redeploy
          </button>
        </div>
      </div>

      {/* Site URL Card */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px', background: 'rgba(0,217,255,0.03)', border: '1px solid rgba(0,217,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>🔗 Live URL</p>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: 'var(--accent-cyan)', textDecoration: 'none' }}
            >
              {site.url}
            </a>
          </div>
          <button
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '8px 16px' }}
            onClick={() => {
              navigator.clipboard.writeText(site.url);
              addToast('URL copied!', 'success');
            }}
          >
            📋 Copy URL
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 20px', fontSize: '14px', fontWeight: '600',
              color: activeTab === tab ? 'white' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '2px solid var(--accent-purple)' : '2px solid transparent',
              transition: 'all 0.15s ease', borderRadius: '4px 4px 0 0',
              textTransform: 'capitalize'
            }}
          >
            {tab === 'overview' && '📊 '}
            {tab === 'deployments' && '🚀 '}
            {tab === 'settings' && '⚙️ '}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {[
              { label: 'Status', value: site.status || 'inactive', icon: '🔴' },
              { label: 'Deploy Count', value: site.deploymentCount || 0, icon: '🚀' },
              { label: 'Size', value: site.size || '0 B', icon: '💾' },
              { label: 'HTTPS', value: 'Enabled ✅', icon: '🔒' },
            ].map(item => (
              <div key={item.label} className="stat-card">
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{item.icon} {item.label}</p>
                <p style={{ fontSize: '18px', fontWeight: '700' }}>{String(item.value)}</p>
              </div>
            ))}
          </div>

          {/* Files Preview */}
          {deployments[0]?.files && (
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>📁 Deployed Files</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                {deployments[0].files.map((file, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '13px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>
                      {file.name.includes('.html') ? '📄' : file.name.includes('.css') ? '🎨' : file.name.includes('.js') ? '⚡' : '📁'} {file.name}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{file.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deployments Tab */}
      {activeTab === 'deployments' && (
        <div className="animate-fade-in">
          {deployments.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚀</div>
              <p style={{ color: 'var(--text-secondary)' }}>No deployments yet</p>
            </div>
          ) : (
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '14px' }}>
                Deployment History ({deployments.length})
              </div>
              {deployments.map((dep, i) => (
                <div key={dep.id} style={{
                  padding: '16px 20px', borderBottom: i < deployments.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap'
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                    background: dep.status === 'success' ? '#00e676' : dep.status === 'failed' ? '#ff4444' : '#ffbb00',
                    boxShadow: `0 0 6px ${dep.status === 'success' ? '#00e676' : dep.status === 'failed' ? '#ff4444' : '#ffbb00'}`,
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px' }}>
                        #{dep.commitHash || dep.id.slice(0, 7)}
                      </span>
                      <span className={`badge ${dep.status === 'success' ? 'badge-live' : dep.status === 'failed' ? 'badge-failed' : 'badge-building'}`}>
                        {dep.status}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dep.branch}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {dep.fileCount} files • {dep.size} • {dep.buildDuration || '-'}
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(dep.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>🌐 Custom Domain</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="yourdomain.com"
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" style={{ padding: '10px 20px', whiteSpace: 'nowrap' }} onClick={handleSaveDomain} disabled={savingDomain}>
                {savingDomain ? '⏳ Saving...' : '💾 Save'}
              </button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
              Add a CNAME record pointing your domain to our servers
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>📋 Site Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Site ID', value: site.id },
                { label: 'Created', value: new Date(site.createdAt).toLocaleString() },
                { label: 'Last Updated', value: new Date(site.updatedAt || site.createdAt).toLocaleString() },
                { label: 'Plan', value: site.plan || 'Free' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--text-secondary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '24px', borderColor: 'rgba(255,68,68,0.2)', background: 'rgba(255,68,68,0.03)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px', color: 'var(--accent-red)' }}>🗑️ Danger Zone</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
              Permanently delete this site and all its deployments. This action cannot be undone.
            </p>
            {!deleteConfirm ? (
              <button className="btn btn-danger" style={{ padding: '10px 20px' }} onClick={() => setDeleteConfirm(true)}>
                🗑️ Delete This Site
              </button>
            ) : (
              <div>
                <p style={{ color: 'var(--accent-red)', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                  ⚠️ Are you absolutely sure? Type the site name to confirm.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" onClick={() => setDeleteConfirm(false)}>Cancel</button>
                  <button className="btn btn-danger" style={{ padding: '10px 20px' }} onClick={handleDelete}>
                    🗑️ Yes, Delete Permanently
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
