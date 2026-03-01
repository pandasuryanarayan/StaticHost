import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sitesApi } from '../api';
import { useToast } from '../App';

export default function SitesList() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchSites = async () => {
    try {
      const res = await sitesApi.list();
      setSites(res.data);
    } catch (err) {
      addToast('Failed to load sites', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSites(); }, []);

  const handleDelete = async (siteId, siteName) => {
    try {
      await sitesApi.delete(siteId);
      setSites(prev => prev.filter(s => s.id !== siteId));
      addToast(`Site "${siteName}" deleted`, 'success');
      setDeleteConfirm(null);
    } catch (err) {
      addToast(err.response?.data?.error || 'Delete failed', 'error');
    }
  };

  const filtered = sites
    .filter(s => filter === 'all' || s.status === filter)
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const statusColors = { live: '#00e676', building: '#ffbb00', failed: '#ff4444', inactive: '#666' };
  const statusBadge = { live: 'badge-live', building: 'badge-building', failed: 'badge-failed', inactive: 'badge-inactive' };

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '24px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton" style={{ height: '160px', borderRadius: '12px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px' }}>🌐 My Sites</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            {sites.length} site{sites.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{ padding: '12px 24px' }}
          onClick={() => navigate('/sites/new')}
        >
          🚀 Deploy New Site
        </button>
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="form-input"
          style={{ maxWidth: '280px' }}
          placeholder="🔍 Search sites..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'live', 'building', 'failed'].map(f => (
            <button
              key={f}
              className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '13px' }}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' && ` (${sites.length})`}
              {f !== 'all' && ` (${sites.filter(s => s.status === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Sites Grid */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {sites.length === 0 ? '🚀' : '🔍'}
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>
            {sites.length === 0 ? 'No sites yet' : 'No sites found'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {sites.length === 0 ? 'Deploy your first site to get started!' : 'Try adjusting your search or filters'}
          </p>
          {sites.length === 0 && (
            <button className="btn btn-primary" style={{ padding: '12px 28px' }} onClick={() => navigate('/sites/new')}>
              🚀 Deploy First Site
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {filtered.map(site => (
            <div
              key={site.id}
              className="card"
              style={{ padding: '24px', cursor: 'pointer', position: 'relative' }}
              onClick={() => navigate(`/sites/${site.id}`)}
            >
              {/* Status Dot */}
              <div style={{
                position: 'absolute', top: '20px', right: '20px',
                width: '10px', height: '10px', borderRadius: '50%',
                background: statusColors[site.status] || '#666',
                boxShadow: `0 0 8px ${statusColors[site.status] || '#666'}`,
              }}></div>

              {/* Site Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                  background: `linear-gradient(135deg, ${['#7c3aed40', '#2563eb40', '#00d9ff40', '#00e67640'][sites.indexOf(site) % 4]}, #16161640)`,
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px'
                }}>🌐</div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {site.name}
                  </h3>
                  <span className={`badge ${statusBadge[site.status] || 'badge-inactive'}`}>
                    {site.status || 'inactive'}
                  </span>
                </div>
              </div>

              {/* URL */}
              <div style={{
                padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '6px',
                fontSize: '12px', color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono, monospace',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                marginBottom: '16px'
              }}>
                🔗 {site.url || `localhost:3001/sites/${site.name}/`}
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>📦 {site.deploymentCount || 0} deploys</span>
                {site.size && <span>💾 {site.size}</span>}
                <span>📅 {new Date(site.updatedAt || site.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div
                style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '7px', fontSize: '12px' }}
                  onClick={() => navigate(`/sites/${site.id}`)}
                >
                  📋 Details
                </button>
                {site.status === 'live' && (
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '7px', fontSize: '12px', textDecoration: 'none' }}
                  >
                    🌐 Visit
                  </a>
                )}
                <button
                  className="btn btn-danger"
                  style={{ padding: '7px 12px', fontSize: '12px' }}
                  onClick={() => setDeleteConfirm(site)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>Delete Site?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>?
                This action cannot be undone and all deployed files will be removed.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.name)}
              >
                🗑️ Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
