import React, { useState } from 'react';
import { useAuth } from '../App';
import { useToast } from '../App';

export default function Settings() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [showApiKey, setShowApiKey] = useState(false);

  const apiKey = `sh_live_${Math.random().toString(36).substr(2, 32)}`;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    addToast('Profile saved successfully!', 'success');
  };

  const tabs = ['profile', 'security', 'api', 'billing', 'team'];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px' }}>⚙️ Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Manage your account and preferences</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Sidebar */}
        <div style={{ width: '200px', flexShrink: 0 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'profile', icon: '👤', label: 'Profile' },
              { id: 'security', icon: '🔒', label: 'Security' },
              { id: 'api', icon: '🔑', label: 'API Keys' },
              { id: 'billing', icon: '💳', label: 'Billing' },
              { id: 'team', icon: '👥', label: 'Team' },
            ].map(tab => (
              <div
                key={tab.id}
                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ cursor: 'pointer' }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="card animate-fade-in" style={{ padding: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>👤 Profile Settings</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=7c3aed&color=fff&size=80`}
                  alt="Avatar"
                  style={{ width: '72px', height: '72px', borderRadius: '50%', border: '3px solid var(--accent-purple)' }}
                />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{user?.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '10px' }}>{user?.email}</p>
                  <span style={{ fontSize: '12px', padding: '3px 12px', background: 'rgba(124,58,237,0.15)', borderRadius: '100px', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}>
                    ✨ Free Plan
                  </span>
                </div>
              </div>
              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                  💾 Save Changes
                </button>
              </form>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="card animate-fade-in" style={{ padding: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>🔒 Security Settings</h2>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" placeholder="Min 8 characters" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-input" placeholder="Confirm your new password" />
              </div>
              <button className="btn btn-primary" onClick={() => addToast('Password updated!', 'success')} style={{ padding: '10px 24px' }}>
                🔑 Update Password
              </button>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '28px 0' }} />
              
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>🛡️ Two-Factor Authentication</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Authenticator App</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Use an authenticator app for 2FA</p>
                </div>
                <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => addToast('2FA setup coming soon!', 'info')}>
                  Enable
                </button>
              </div>
            </div>
          )}

          {/* API Keys */}
          {activeTab === 'api' && (
            <div className="card animate-fade-in" style={{ padding: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>🔑 API Keys</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                Use API keys to integrate StaticHost with your development workflow.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { name: 'Production Key', created: '2024-01-15', lastUsed: '2 hours ago' },
                  { name: 'Development Key', created: '2024-01-20', lastUsed: 'Never' },
                ].map((key, i) => (
                  <div key={i} className="card" style={{ padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{key.name}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Created {key.created} • Last used: {key.lastUsed}</p>
                      </div>
                      <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => addToast('API key revoked', 'info')}>
                        Revoke
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <code style={{
                        flex: 1, padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: '6px', fontSize: '12px',
                        fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent-cyan)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {showApiKey ? apiKey : `sh_live_${'*'.repeat(32)}`}
                      </code>
                      <button className="btn btn-ghost" onClick={() => setShowApiKey(!showApiKey)} style={{ fontSize: '12px', padding: '8px 12px' }}>
                        {showApiKey ? '🙈 Hide' : '👁️ Show'}
                      </button>
                      <button className="btn btn-secondary" onClick={() => { navigator.clipboard.writeText(apiKey); addToast('API key copied!', 'success'); }} style={{ fontSize: '12px', padding: '8px 12px' }}>
                        📋 Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-secondary"
                style={{ marginTop: '20px', padding: '10px 24px' }}
                onClick={() => addToast('New API key generated!', 'success')}
              >
                + Generate New Key
              </button>
            </div>
          )}

          {/* Billing */}
          {activeTab === 'billing' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '24px', background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '24px' }}>✨</span>
                      <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Free Plan</h3>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>You're currently on the Free plan</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => addToast('Upgrade coming soon!', 'info')} style={{ padding: '10px 24px' }}>
                    ⬆️ Upgrade Plan
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {[
                  { name: 'Free', price: '$0', features: ['100GB Bandwidth', '300 Build mins', '1 Concurrent build', 'Community support'] },
                  { name: 'Pro', price: '$19/mo', features: ['1TB Bandwidth', 'Unlimited builds', '3 Concurrent builds', 'Priority support', 'Custom domains'], recommended: true },
                  { name: 'Business', price: '$99/mo', features: ['Unlimited Bandwidth', 'Unlimited builds', '10 Concurrent builds', '24/7 support', 'Team collaboration'] },
                ].map((plan) => (
                  <div
                    key={plan.name}
                    className="card"
                    style={{ padding: '24px', position: 'relative', border: plan.recommended ? '1px solid var(--accent-purple)' : undefined }}
                  >
                    {plan.recommended && (
                      <div style={{
                        position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                        padding: '3px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap'
                      }}>
                        ⭐ Most Popular
                      </div>
                    )}
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{plan.name}</h3>
                    <p style={{ fontSize: '28px', fontWeight: '900', marginBottom: '16px' }} className={plan.recommended ? 'gradient-text' : ''}>{plan.price}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                      {plan.features.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <span style={{ color: '#00e676' }}>✓</span> {f}
                        </div>
                      ))}
                    </div>
                    <button
                      className={`btn ${plan.name === 'Free' ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ width: '100%', padding: '10px' }}
                      onClick={() => addToast(plan.name === 'Free' ? "You're on Free!" : `${plan.name} upgrade coming soon!`, plan.name === 'Free' ? 'info' : 'success')}
                    >
                      {plan.name === 'Free' ? '✅ Current Plan' : `Select ${plan.name}`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team */}
          {activeTab === 'team' && (
            <div className="card animate-fade-in" style={{ padding: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>👥 Team Members</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Collaborate with your team on projects</p>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                <input type="email" className="form-input" placeholder="colleague@example.com" style={{ flex: 1 }} />
                <select className="form-input" style={{ width: '120px' }}>
                  <option>Admin</option>
                  <option>Developer</option>
                  <option>Viewer</option>
                </select>
                <button className="btn btn-primary" onClick={() => addToast('Invitation sent!', 'success')} style={{ whiteSpace: 'nowrap', padding: '10px 16px' }}>
                  + Invite
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { name: user?.name || 'You', email: user?.email || '', role: 'Owner', you: true },
                ].map((member, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=7c3aed&color=fff`}
                      alt="Avatar"
                      style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', fontSize: '14px' }}>{member.name} {member.you && <span style={{ fontSize: '11px', color: '#a78bfa', marginLeft: '6px' }}>(you)</span>}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{member.email}</p>
                    </div>
                    <span className="badge badge-live">{member.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
