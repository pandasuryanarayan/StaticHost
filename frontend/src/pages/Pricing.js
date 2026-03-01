import React from 'react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    color: '#666',
    description: 'Perfect for personal projects and experiments',
    features: [
      '100 GB Bandwidth / month',
      '300 Build minutes / month',
      '1 Concurrent build',
      'Instant deployments',
      'Automatic HTTPS',
      'Community support',
      '100 Sites',
    ],
    cta: 'Get Started Free',
    current: true,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    color: '#7c3aed',
    description: 'For professional developers and growing teams',
    popular: true,
    features: [
      '1 TB Bandwidth / month',
      'Unlimited Build minutes',
      '3 Concurrent builds',
      'Custom domains',
      'Priority edge network',
      'Priority support',
      'Unlimited Sites',
      'Advanced analytics',
      'Deploy previews',
    ],
    cta: 'Start Pro Trial',
  },
  {
    name: 'Business',
    price: '$99',
    period: '/month',
    color: '#00d9ff',
    description: 'For teams that need enterprise-grade performance',
    features: [
      'Unlimited Bandwidth',
      'Unlimited Build minutes',
      '10 Concurrent builds',
      'Custom domains',
      'Dedicated edge nodes',
      '24/7 Priority support',
      'Unlimited Sites',
      'Full analytics suite',
      'Team collaboration',
      'SSO / SAML',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
  },
];

const featureComparison = [
  { feature: 'Sites', starter: '100', pro: 'Unlimited', business: 'Unlimited' },
  { feature: 'Bandwidth', starter: '100 GB', pro: '1 TB', business: 'Unlimited' },
  { feature: 'Build Minutes', starter: '300', pro: 'Unlimited', business: 'Unlimited' },
  { feature: 'Concurrent Builds', starter: '1', pro: '3', business: '10' },
  { feature: 'Custom Domains', starter: '—', pro: '✓', business: '✓' },
  { feature: 'Deploy Previews', starter: '—', pro: '✓', business: '✓' },
  { feature: 'Analytics', starter: 'Basic', pro: 'Advanced', business: 'Enterprise' },
  { feature: 'Support', starter: 'Community', pro: 'Priority', business: '24/7 Dedicated' },
  { feature: 'Team Members', starter: '1', pro: '5', business: 'Unlimited' },
  { feature: 'SSL/HTTPS', starter: '✓', pro: '✓', business: '✓' },
  { feature: 'CDN Edge Nodes', starter: '50+', pro: '150+', business: '200+ Dedicated' },
  { feature: 'SLA', starter: '—', pro: '99.9%', business: '99.99%' },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '0' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,10,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px',
      }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #7c3aed, #00d9ff)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
          }}>⚡</div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>StaticHost</span>
        </div>
        <button className="btn btn-primary" style={{ padding: '8px 20px' }} onClick={() => navigate('/')}>
          Back to Home
        </button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 48px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h1 style={{ fontSize: '56px', fontWeight: '900', marginBottom: '20px', letterSpacing: '-2px' }}>
            Simple, <span className="gradient-text">transparent</span> pricing
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
            Start for free. Scale as you grow. No hidden fees.
          </p>
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '80px' }}>
          {plans.map(plan => (
            <div
              key={plan.name}
              className="card"
              style={{
                padding: '36px',
                position: 'relative',
                border: plan.popular ? `1px solid ${plan.color}` : undefined,
                transform: plan.popular ? 'scale(1.02)' : undefined,
                boxShadow: plan.popular ? `0 0 40px ${plan.color}20` : undefined,
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                  padding: '4px 20px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', color: 'white'
                }}>
                  ⭐ Most Popular
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', color: plan.color }}>{plan.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>{plan.description}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '48px', fontWeight: '900', color: plan.color }}>{plan.price}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>{plan.period}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <span style={{ color: plan.color, fontSize: '16px', flexShrink: 0 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>

              <button
                className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%', padding: '14px', fontSize: '15px' }}
                onClick={() => navigate('/')}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', textAlign: 'center', marginBottom: '48px' }}>
            Compare all features
          </h2>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', width: '35%' }}>Feature</th>
                  {['Starter', 'Pro', 'Business'].map(p => (
                    <th key={p} style={{ padding: '16px 20px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: p === 'Pro' ? 'var(--accent-purple)' : 'white', width: '21.6%' }}>{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((row, i) => (
                  <tr key={row.feature} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--text-secondary)' }}>{row.feature}</td>
                    {[row.starter, row.pro, row.business].map((val, idx) => (
                      <td key={idx} style={{ padding: '14px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: val === '—' ? '#333' : val === '✓' ? '#00e676' : 'white' }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', textAlign: 'center', marginBottom: '48px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { q: 'What types of files can I host?', a: 'StaticHost supports any static file — HTML, CSS, JavaScript, images (PNG, JPG, SVG, WebP), fonts (WOFF, WOFF2), JSON, and more. Perfect for websites, portfolios, and web apps.' },
              { q: 'How fast is the deployment?', a: 'Most deployments complete in under 30 seconds. Files are uploaded directly to our edge network and served from 200+ global locations instantly.' },
              { q: 'Can I use a custom domain?', a: 'Yes! Pro and Business plans support custom domains. Simply add a CNAME record to your DNS pointing to StaticHost, and we handle the rest including SSL.' },
              { q: 'Is there a file size limit?', a: 'Individual files can be up to 50MB. Total site size limits depend on your plan. The free plan allows up to 1GB per site.' },
              { q: "What happens if I exceed my plan's bandwidth?", a: "We'll notify you before you hit your limit. On the Free plan, your site may be temporarily throttled. Pro and Business plans have higher limits and automatic scaling." },
            ].map((faq, i) => (
              <div key={i} className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>❓ {faq.q}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-secondary)', borderRadius: '24px' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '900', marginBottom: '16px' }}>Start hosting today</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '17px', marginBottom: '32px' }}>
            No credit card required. Free plan available forever.
          </p>
          <button
            className="btn btn-primary"
            style={{ padding: '16px 40px', fontSize: '16px', borderRadius: '12px' }}
            onClick={() => navigate('/')}
          >
            🚀 Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
}
