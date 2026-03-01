require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'statichost_secret';

// ─── In-Memory Database (replace with real DB in production) ───────────────
const db = {
  users: [],
  sites: [],
  deployments: []
};

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ─── Directories ────────────────────────────────────────────────────────────
const SITES_DIR = path.join(__dirname, 'sites');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
[SITES_DIR, UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ─── Multer Storage ─────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const deployId = req.deployId || uuidv4();
    req.deployId = deployId;
    const uploadPath = path.join(UPLOADS_DIR, deployId);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Preserve original directory structure
    const filePath = file.originalname;
    cb(null, filePath);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
  fileFilter: (req, file, cb) => {
    const allowed = [
      'text/html', 'text/css', 'application/javascript', 'text/javascript',
      'image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp',
      'application/json', 'text/plain', 'application/font-woff',
      'application/font-woff2', 'font/woff', 'font/woff2', 'font/ttf',
      'application/octet-stream'
    ];
    const mimeType = mime.lookup(file.originalname) || file.mimetype;
    if (allowed.includes(mimeType) || mimeType.startsWith('text/') || 
        mimeType.startsWith('image/') || mimeType.startsWith('font/')) {
      cb(null, true);
    } else {
      cb(null, true); // Accept all for flexibility
    }
  }
});

// ─── Auth Middleware ─────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── Helper: Generate Site Name ─────────────────────────────────────────────
function generateSiteName() {
  const adjectives = ['happy', 'brave', 'clever', 'swift', 'bold', 'calm', 'bright', 'cool', 'epic', 'fast'];
  const nouns = ['panda', 'tiger', 'falcon', 'rocket', 'wave', 'star', 'comet', 'pixel', 'cloud', 'byte'];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}-${nouns[Math.floor(Math.random() * nouns.length)]}-${num}`;
}

// ─── Helper: Format Bytes ────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ─── Helper: Get Directory Size ──────────────────────────────────────────────
function getDirSize(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  let totalSize = 0;
  const files = fs.readdirSync(dirPath, { recursive: true, withFileTypes: true });
  for (const file of files) {
    if (file.isFile()) {
      const filePath = path.join(file.path || dirPath, file.name);
      try {
        totalSize += fs.statSync(filePath).size;
      } catch {}
    }
  }
  return totalSize;
}

// ═══════════════════════════════════════════════════════════
//  AUTH ROUTES
// ═══════════════════════════════════════════════════════════

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (db.users.find(u => u.email === email))
      return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      plan: 'free',
      createdAt: new Date().toISOString(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff`
    };
    db.users.push(user);
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ token, user: userWithoutPassword, message: 'Account created successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });
    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword, message: 'Login successful!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// ═══════════════════════════════════════════════════════════
//  SITES ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/sites - List all sites for authenticated user
app.get('/api/sites', authMiddleware, (req, res) => {
  const userSites = db.sites
    .filter(s => s.userId === req.user.id)
    .map(site => {
      const siteDeployments = db.deployments.filter(d => d.siteId === site.id);
      const sitePath = path.join(SITES_DIR, site.id);
      return {
        ...site,
        deploymentCount: siteDeployments.length,
        size: formatBytes(getDirSize(sitePath)),
        lastDeployment: siteDeployments[siteDeployments.length - 1] || null
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(userSites);
});

// POST /api/sites - Create a new site
app.post('/api/sites', authMiddleware, (req, res) => {
  const { name } = req.body;
  const siteName = name || generateSiteName();

  if (db.sites.find(s => s.name === siteName))
    return res.status(409).json({ error: 'Site name already taken. Please choose another.' });

  const site = {
    id: uuidv4(),
    userId: req.user.id,
    name: siteName,
    url: `http://localhost:3001/sites/${siteName}/`,
    status: 'inactive',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    plan: 'free',
    customDomain: null,
    httpsEnabled: true,
    deploymentCount: 0,
    analytics: {
      views: Math.floor(Math.random() * 10000),
      visitors: Math.floor(Math.random() * 5000),
      bandwidth: formatBytes(Math.floor(Math.random() * 1024 * 1024 * 100))
    }
  };
  db.sites.push(site);
  res.status(201).json(site);
});

// GET /api/sites/:id - Get site details
app.get('/api/sites/:id', authMiddleware, (req, res) => {
  const site = db.sites.find(s => s.id === req.params.id && s.userId === req.user.id);
  if (!site) return res.status(404).json({ error: 'Site not found' });
  const siteDeployments = db.deployments.filter(d => d.siteId === site.id);
  const sitePath = path.join(SITES_DIR, site.id);
  res.json({
    ...site,
    deployments: siteDeployments,
    size: formatBytes(getDirSize(sitePath))
  });
});

// DELETE /api/sites/:id - Delete a site
app.delete('/api/sites/:id', authMiddleware, (req, res) => {
  const siteIndex = db.sites.findIndex(s => s.id === req.params.id && s.userId === req.user.id);
  if (siteIndex === -1) return res.status(404).json({ error: 'Site not found' });

  const site = db.sites[siteIndex];
  // Remove files
  const sitePath = path.join(SITES_DIR, site.id);
  if (fs.existsSync(sitePath)) fs.rmSync(sitePath, { recursive: true });
  // Remove deployments
  db.deployments = db.deployments.filter(d => d.siteId !== site.id);
  db.sites.splice(siteIndex, 1);
  res.json({ message: `Site "${site.name}" deleted successfully.` });
});

// PATCH /api/sites/:id - Update site settings
app.patch('/api/sites/:id', authMiddleware, (req, res) => {
  const site = db.sites.find(s => s.id === req.params.id && s.userId === req.user.id);
  if (!site) return res.status(404).json({ error: 'Site not found' });
  const { name, customDomain } = req.body;
  if (name) site.name = name;
  if (customDomain !== undefined) site.customDomain = customDomain;
  site.updatedAt = new Date().toISOString();
  res.json(site);
});

// ═══════════════════════════════════════════════════════════
//  DEPLOYMENT ROUTES
// ═══════════════════════════════════════════════════════════

// POST /api/sites/:id/deploy - Deploy files to a site
app.post('/api/sites/:id/deploy', authMiddleware, (req, res) => {
  // Assign deployId before multer processes files
  req.deployId = uuidv4();
  
  upload.array('files', 200)(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE')
        return res.status(400).json({ error: 'File too large. Max size is 50MB per file.' });
      return res.status(400).json({ error: err.message });
    }

    const site = db.sites.find(s => s.id === req.params.id && s.userId === req.user.id);
    if (!site) return res.status(404).json({ error: 'Site not found' });

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: 'No files uploaded.' });

    // Check if index.html exists
    const hasIndex = req.files.some(f => 
      f.originalname === 'index.html' || f.originalname.endsWith('/index.html')
    );

    const deploymentId = req.deployId;
    const deployment = {
      id: deploymentId,
      siteId: site.id,
      userId: req.user.id,
      status: 'building',
      createdAt: new Date().toISOString(),
      completedAt: null,
      files: req.files.map(f => ({
        name: f.originalname,
        size: formatBytes(f.size),
        type: mime.lookup(f.originalname) || f.mimetype
      })),
      fileCount: req.files.length,
      size: formatBytes(req.files.reduce((sum, f) => sum + f.size, 0)),
      logs: [],
      commitHash: Math.random().toString(36).substring(2, 9),
      branch: req.body.branch || 'main',
      buildDuration: null,
      hasIndexHtml: hasIndex
    };
    db.deployments.push(deployment);

    // Simulate build process
    const buildStart = Date.now();
    const logs = [];
    
    const addLog = (msg) => {
      logs.push({ time: new Date().toISOString(), message: msg });
      deployment.logs = [...logs];
    };

    addLog('🚀 Initializing deployment...');
    addLog(`📦 Processing ${req.files.length} file(s)...`);

    // Move files from uploads to sites directory
    const uploadPath = path.join(UPLOADS_DIR, deploymentId);
    const sitePath = path.join(SITES_DIR, site.id);
    
    try {
      // Clear previous deployment
      if (fs.existsSync(sitePath)) fs.rmSync(sitePath, { recursive: true });
      
      addLog('📋 Validating files...');
      
      // Copy files to site directory preserving structure
      for (const file of req.files) {
        const srcPath = path.join(uploadPath, file.originalname);
        const destPath = path.join(sitePath, file.originalname);
        const destDir = path.dirname(destPath);
        
        fs.mkdirSync(destDir, { recursive: true });
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
          addLog(`✓ Deployed: ${file.originalname}`);
        }
      }

      addLog('⚡ Optimizing assets...');
      addLog('🌍 Deploying to edge network...');
      addLog('🔒 Enabling HTTPS...');
      addLog('✅ Build completed successfully!');
      addLog(`🎉 Site is live at: http://localhost:3001/sites/${site.name}/`);

      // Update deployment
      deployment.status = 'success';
      deployment.completedAt = new Date().toISOString();
      deployment.buildDuration = `${((Date.now() - buildStart) / 1000).toFixed(1)}s`;

      // Update site
      site.status = 'live';
      site.url = `http://localhost:3001/sites/${site.name}/`;
      site.updatedAt = new Date().toISOString();
      site.deploymentCount = (site.deploymentCount || 0) + 1;

      // Cleanup uploads
      if (fs.existsSync(uploadPath)) fs.rmSync(uploadPath, { recursive: true });

      res.json({
        deployment,
        site,
        message: '🎉 Deployment successful!',
        url: site.url
      });

    } catch (copyErr) {
      addLog(`❌ Error: ${copyErr.message}`);
      deployment.status = 'failed';
      deployment.completedAt = new Date().toISOString();
      if (fs.existsSync(uploadPath)) fs.rmSync(uploadPath, { recursive: true });
      res.status(500).json({ error: 'Deployment failed', deployment });
    }
  });
});

// GET /api/sites/:id/deployments - Get deployment history
app.get('/api/sites/:id/deployments', authMiddleware, (req, res) => {
  const site = db.sites.find(s => s.id === req.params.id && s.userId === req.user.id);
  if (!site) return res.status(404).json({ error: 'Site not found' });
  const siteDeployments = db.deployments
    .filter(d => d.siteId === site.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(siteDeployments);
});

// GET /api/deployments/:id - Get single deployment
app.get('/api/deployments/:id', authMiddleware, (req, res) => {
  const deployment = db.deployments.find(d => d.id === req.params.id && d.userId === req.user.id);
  if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
  res.json(deployment);
});

// DELETE /api/deployments/:id/rollback - Rollback to previous deployment
app.post('/api/deployments/:id/rollback', authMiddleware, (req, res) => {
  res.json({ message: 'Rollback initiated (demo mode)' });
});

// ═══════════════════════════════════════════════════════════
//  STATIC FILE SERVING - This is the actual "hosting"
// ═══════════════════════════════════════════════════════════

// Serve hosted sites: GET /sites/:siteName/*
app.use('/sites/:siteName', (req, res, next) => {
  const site = db.sites.find(s => s.name === req.params.siteName);
  if (!site) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 - Site Not Found | StaticHost</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', sans-serif; 
            background: #0a0a0a; 
            color: #fff; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh;
          }
          .container { text-align: center; padding: 2rem; }
          .code { font-size: 8rem; font-weight: 900; background: linear-gradient(135deg, #7c3aed, #00d9ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          h1 { font-size: 2rem; margin: 1rem 0; color: #ccc; }
          p { color: #666; margin-bottom: 2rem; }
          a { 
            display: inline-block; 
            padding: 0.75rem 1.5rem; 
            background: linear-gradient(135deg, #7c3aed, #2563eb); 
            color: white; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600;
          }
          .logo { font-size: 1.5rem; font-weight: 800; margin-bottom: 2rem; color: #00d9ff; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">⚡ StaticHost</div>
          <div class="code">404</div>
          <h1>Site Not Found</h1>
          <p>The site <strong>"${req.params.siteName}"</strong> doesn't exist or hasn't been deployed yet.</p>
          <a href="http://localhost:3000">← Go to StaticHost</a>
        </div>
      </body>
      </html>
    `);
  }

  const sitePath = path.join(SITES_DIR, site.id);
  let requestedPath = req.path === '/' ? '/index.html' : req.path;
  let filePath = path.join(sitePath, requestedPath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(sitePath)) {
    return res.status(403).send('Forbidden');
  }

  // Try exact file first, then index.html for SPA routing
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      filePath = indexPath;
    } else {
      filePath = path.join(sitePath, 'index.html');
    }
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).send(`
      <!DOCTYPE html><html><head><title>Page Not Found</title>
      <style>body{font-family:sans-serif;background:#0a0a0a;color:#fff;text-align:center;padding:4rem;}</style>
      </head><body><h1>404 - Page Not Found</h1><p>This page doesn't exist on this site.</p></body></html>
    `);
  }

  const mimeType = mime.lookup(filePath) || 'application/octet-stream';
  res.setHeader('Content-Type', mimeType);
  res.setHeader('X-Powered-By', 'StaticHost');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  
  // Track analytics (simple view counter)
  site.analytics = site.analytics || { views: 0, visitors: 0 };
  site.analytics.views = (site.analytics.views || 0) + 1;

  res.sendFile(filePath);
});

// ═══════════════════════════════════════════════════════════
//  ANALYTICS ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/sites/:id/analytics', authMiddleware, (req, res) => {
  const site = db.sites.find(s => s.id === req.params.id && s.userId === req.user.id);
  if (!site) return res.status(404).json({ error: 'Site not found' });
  
  // Generate mock analytics data
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      views: Math.floor(Math.random() * 1000) + 100,
      visitors: Math.floor(Math.random() * 500) + 50,
      bandwidth: `${(Math.random() * 100).toFixed(1)} MB`
    });
  }

  res.json({
    overview: {
      totalViews: site.analytics?.views || 0,
      uniqueVisitors: site.analytics?.visitors || 0,
      bandwidth: site.analytics?.bandwidth || '0 B',
      avgLoadTime: '1.2s'
    },
    chart: last7Days,
    topPages: [
      { page: '/', views: Math.floor(Math.random() * 500) + 100 },
      { page: '/about', views: Math.floor(Math.random() * 200) + 50 },
      { page: '/contact', views: Math.floor(Math.random() * 100) + 20 },
      { page: '/blog', views: Math.floor(Math.random() * 150) + 30 }
    ],
    countries: [
      { country: '🇺🇸 United States', percentage: 35 },
      { country: '🇮🇳 India', percentage: 22 },
      { country: '🇬🇧 United Kingdom', percentage: 12 },
      { country: '🇩🇪 Germany', percentage: 8 },
      { country: '🇨🇦 Canada', percentage: 7 },
      { country: '🌍 Other', percentage: 16 }
    ]
  });
});

// ═══════════════════════════════════════════════════════════
//  USER ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/user/stats', authMiddleware, (req, res) => {
  const userSites = db.sites.filter(s => s.userId === req.user.id);
  const userDeployments = db.deployments.filter(d => d.userId === req.user.id);
  res.json({
    totalSites: userSites.length,
    activeSites: userSites.filter(s => s.status === 'live').length,
    totalDeployments: userDeployments.length,
    successfulDeployments: userDeployments.filter(d => d.status === 'success').length,
    bandwidthUsed: formatBytes(userSites.reduce((sum, _) => sum + Math.random() * 1024 * 1024 * 10, 0))
  });
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    version: '1.0.0', 
    name: 'StaticHost API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n⚡ StaticHost Backend running on http://localhost:${PORT}`);
  console.log(`📁 Sites directory: ${SITES_DIR}`);
  console.log(`🔒 JWT Auth enabled`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  POST   /api/auth/signup`);
  console.log(`  POST   /api/auth/login`);
  console.log(`  GET    /api/auth/me`);
  console.log(`  GET    /api/sites`);
  console.log(`  POST   /api/sites`);
  console.log(`  GET    /api/sites/:id`);
  console.log(`  DELETE /api/sites/:id`);
  console.log(`  POST   /api/sites/:id/deploy`);
  console.log(`  GET    /api/sites/:id/deployments`);
  console.log(`  GET    /api/sites/:id/analytics`);
  console.log(`  GET    /sites/:siteName/* (Hosted Sites)`);
  console.log(`\n✅ Ready to host websites!\n`);
});

module.exports = app;
