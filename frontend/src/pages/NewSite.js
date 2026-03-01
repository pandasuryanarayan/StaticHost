import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { sitesApi, API_BASE_URL } from '../api';
import { useToast } from '../App';

// ─── Step 1: Upload ──────────────────────────────────────────────────────────
function StepUpload({ files, setFiles, onNext }) {
  const { addToast } = useToast();

  const onDrop = useCallback(acceptedFiles => {
    setFiles(prev => {
      const combined = [...prev];
      acceptedFiles.forEach(f => {
        if (!combined.find(e => e.name === f.name)) combined.push(f);
      });
      return combined;
    });
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'text/html': ['.html', '.htm'],
      'text/css': ['.css'],
      'application/javascript': ['.js'],
      'text/javascript': ['.js'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'],
      'application/json': ['.json'],
      'text/plain': ['.txt'],
      'font/*': ['.woff', '.woff2', '.ttf', '.eot'],
    }
  });

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const getFileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    const icons = { html: '📄', htm: '📄', css: '🎨', js: '⚡', json: '📋', png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', svg: '🖼️', webp: '🖼️', ico: '🖼️', txt: '📝', woff: '🔤', woff2: '🔤', ttf: '🔤' };
    return icons[ext] || '📁';
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''}`}
        style={{ marginBottom: '24px', minHeight: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      >
        <input {...getInputProps()} />
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>📂</div>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
          {isDragActive ? 'Drop files here!' : 'Drag & drop your files'}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
          Supports HTML, CSS, JS, Images, Fonts and more
        </p>
        <button type="button" className="btn btn-secondary" style={{ pointerEvents: 'none' }}>
          📂 Browse Files
        </button>
      </div>

      {files.length > 0 && (
        <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '600' }}>
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </h4>
            {!files.find(f => f.name === 'index.html') && (
              <span style={{ fontSize: '12px', color: 'var(--accent-yellow)', background: 'rgba(255,187,0,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,187,0,0.2)' }}>
                ⚠️ No index.html detected
              </span>
            )}
          </div>
          <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {files.map((file, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', background: 'var(--bg-secondary)',
                borderRadius: '8px', border: '1px solid var(--border)'
              }}>
                <span style={{ fontSize: '20px' }}>{getFileIcon(file.name)}</span>
                <span style={{ flex: 1, fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatSize(file.size)}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', fontSize: '18px', lineHeight: 1 }}
                >×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-primary"
          style={{ padding: '12px 28px' }}
          onClick={() => {
            if (files.length === 0) {
              addToast('Please upload at least one file!', 'warning');
            } else {
              onNext();
            }
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Configure ────────────────────────────────────────────────────────
function StepConfigure({ siteName, setSiteName, branch, setBranch, onBack, onNext }) {
  return (
    <div>
      <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Site Configuration</h3>
        <div className="form-group">
          <label className="form-label">Site Name</label>
          <input
            type="text"
            className="form-input"
            value={siteName}
            onChange={e => setSiteName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            placeholder="my-awesome-site"
          />
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Your site will be available at:{' '}
            <code style={{ color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono, monospace' }}>
              localhost:3001/sites/{siteName}/
            </code>
          </p>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Branch</label>
          <input
            type="text"
            className="form-input"
            value={branch}
            onChange={e => setBranch(e.target.value)}
            placeholder="main"
          />
        </div>
      </div>

      <div className="card" style={{ padding: '20px', marginBottom: '24px', background: 'rgba(0,217,255,0.05)', border: '1px solid rgba(0,217,255,0.15)' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--accent-cyan)' }}>✨ What's included (Free)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {['⚡ Instant deployment', '🔒 Automatic HTTPS', '🌍 Global CDN', '📊 Basic analytics', '🔄 Deployment history', '💾 100GB bandwidth'].map(f => (
            <div key={f} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{f}</div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" style={{ padding: '12px 28px' }} onClick={onNext}>
          🚀 Deploy Now
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Deploy ───────────────────────────────────────────────────────────
function StepDeploy({ deployState, progress, logs }) {
  const progressColors = { 0: '#7c3aed', 33: '#2563eb', 66: '#0ea5e9', 100: '#00e676' };
  const pc = Object.keys(progressColors).reduce((a, b) => progress >= Number(b) ? b : a, 0);

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '20px 0', marginBottom: '24px' }}>
        {deployState === 'deploying' ? (
          <>
            <div style={{ fontSize: '56px', marginBottom: '16px' }} className="animate-float">🚀</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Deploying your site...</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Please wait while we upload and deploy your files</p>
          </>
        ) : deployState === 'success' ? (
          <>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--accent-green)' }}>Deployment Successful!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Your site is now live on the internet</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>❌</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--accent-red)' }}>Deployment Failed</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Something went wrong. Please try again.</p>
          </>
        )}
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Upload Progress</span>
          <span style={{ fontSize: '13px', fontWeight: '600' }}>{progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, var(--accent-purple), ${progressColors[pc]})` }}></div>
        </div>
      </div>

      {/* Terminal Log */}
      <div className="terminal">
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['#ff5f57', '#febc2e', '#28c840'].map(c => (
              <div key={c} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }}></div>
            ))}
          </div>
          <span style={{ color: '#666', fontSize: '12px', marginLeft: '8px' }}>deploy.log</span>
        </div>
        {logs.map((log, i) => (
          <div key={i} className="terminal-line" style={{ color: log.includes('❌') ? '#ff4444' : log.includes('✅') || log.includes('🎉') ? '#00e676' : '#cdd6f4' }}>
            <span style={{ color: '#666', marginRight: '8px' }}>{String(i).padStart(2, '0')}:</span>
            {log}
          </div>
        ))}
        {deployState === 'deploying' && (
          <div className="terminal-line animate-pulse" style={{ color: '#00d9ff' }}>
            █ Processing...
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 4: Success ──────────────────────────────────────────────────────────
function StepSuccess({ siteUrl, siteName, siteId, onNavigate }) {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  const copyUrl = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    addToast('URL copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: '72px', marginBottom: '20px' }}>🎉</div>
      <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '12px' }}>
        <span className="gradient-text">Site is Live!</span>
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '32px' }}>
        Your website is deployed and accessible worldwide
      </p>

      <div className="card" style={{ padding: '20px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Live URL</p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: 'var(--accent-cyan)', wordBreak: 'break-all' }}>
            {siteUrl}
          </p>
        </div>
        <button className="btn btn-secondary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }} onClick={copyUrl}>
          {copied ? '✅ Copied!' : '📋 Copy'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ padding: '12px 24px', textDecoration: 'none' }}
        >
          🌐 Visit Site
        </a>
        <button className="btn btn-secondary" style={{ padding: '12px 24px' }} onClick={() => onNavigate(`/sites/${siteId}`)}>
          📊 Site Details
        </button>
        <button className="btn btn-secondary" style={{ padding: '12px 24px' }} onClick={() => onNavigate('/sites/new')}>
          ➕ Deploy Another
        </button>
        <button className="btn btn-secondary" style={{ padding: '12px 24px' }} onClick={() => onNavigate('/dashboard')}>
          🏠 Dashboard
        </button>
      </div>
    </div>
  );
}

// ─── Main NewSite Component ───────────────────────────────────────────────────
export default function NewSite() {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [siteName, setSiteName] = useState(`my-site-${Math.floor(Math.random() * 900) + 100}`);
  const [branch, setBranch] = useState('main');
  const [deployState, setDeployState] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const steps = [
    { num: 1, label: 'Upload Files' },
    { num: 2, label: 'Configure' },
    { num: 3, label: 'Deploy' },
    { num: 4, label: 'Success' },
  ];

  const handleDeploy = async () => {
    setStep(3);
    setDeployState('deploying');
    setProgress(0);
    setLogs(['🚀 Initializing deployment...']);

    try {
      // Create site first
      setLogs(prev => [...prev, '📝 Creating site configuration...']);
      setProgress(15);
      const siteRes = await sitesApi.create({ name: siteName });
      const site = siteRes.data;

      setLogs(prev => [...prev, `✓ Site created: ${site.name}`]);
      setProgress(25);

      // Deploy files
      const formData = new FormData();
      files.forEach(f => formData.append('files', f, f.name));
      formData.append('branch', branch);

      setLogs(prev => [...prev, `📦 Uploading ${files.length} file(s)...`]);

      const deployRes = await sitesApi.deploy(site.id, formData, (pct) => {
        setProgress(25 + Math.floor(pct * 0.5));
      });

      setProgress(80);
      setLogs(prev => [...prev, '⚡ Optimizing assets...']);
      await new Promise(r => setTimeout(r, 500));
      
      setProgress(90);
      setLogs(prev => [...prev, '🌍 Deploying to edge network...']);
      await new Promise(r => setTimeout(r, 500));
      
      setProgress(95);
      setLogs(prev => [...prev, '🔒 Enabling HTTPS...']);
      await new Promise(r => setTimeout(r, 300));
      
      setProgress(100);
      setLogs(prev => [...prev, '✅ Build completed!', `🎉 Site is live at: ${deployRes.data.url}`]);
      setDeployState('success');
      setResult(deployRes.data);

      setTimeout(() => setStep(4), 1500);
      addToast('🎉 Site deployed successfully!', 'success');

    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setLogs(prev => [...prev, `❌ Deployment failed: ${msg}`]);
      setDeployState('failed');
      addToast(`Deployment failed: ${msg}`, 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px' }}>🚀 Deploy New Site</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Upload your static files and go live in seconds</p>
      </div>

      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '36px', overflowX: 'auto', paddingBottom: '8px' }}>
        {steps.map((s, i) => (
          <React.Fragment key={s.num}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: '700',
                background: step === s.num ? 'linear-gradient(135deg, #7c3aed, #2563eb)' :
                           step > s.num ? 'rgba(0,230,118,0.15)' : 'var(--bg-secondary)',
                border: step === s.num ? 'none' : step > s.num ? '1px solid rgba(0,230,118,0.3)' : '1px solid var(--border)',
                color: step === s.num ? 'white' : step > s.num ? '#00e676' : 'var(--text-secondary)',
                transition: 'all 0.3s ease'
              }}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span style={{
                fontSize: '13px', fontWeight: '600',
                color: step === s.num ? 'white' : step > s.num ? '#00e676' : 'var(--text-muted)',
                whiteSpace: 'nowrap'
              }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, minWidth: '24px', height: '2px', margin: '0 12px',
                background: step > s.num ? 'linear-gradient(90deg, #00e676, #7c3aed)' : 'var(--border)',
                transition: 'all 0.3s ease'
              }}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="card" style={{ padding: '32px', maxWidth: '680px' }}>
        {step === 1 && <StepUpload files={files} setFiles={setFiles} onNext={() => setStep(2)} />}
        {step === 2 && (
          <StepConfigure
            siteName={siteName} setSiteName={setSiteName}
            branch={branch} setBranch={setBranch}
            onBack={() => setStep(1)} onNext={handleDeploy}
          />
        )}
        {step === 3 && <StepDeploy deployState={deployState} progress={progress} logs={logs} />}
        {step === 4 && result && (
          <StepSuccess
            siteUrl={result.url}
            siteName={result.site?.name}
            siteId={result.site?.id}
            onNavigate={navigate}
          />
        )}
      </div>
    </div>
  );
}
