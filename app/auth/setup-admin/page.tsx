'use client';

import { useState } from 'react';

export default function SetupAdminPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', secret: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const res = await fetch('/api/auth/setup-admin', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setStatus('success');
      setMessage('Admin created! You can now log in.');
    } else {
      setStatus('error');
      setMessage(data.error || 'Something went wrong');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Admin Setup</h1>

        {status === 'success' ? (
          <div style={{ color: 'green', fontWeight: 600 }}>{message}</div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              placeholder="Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password (min 8 chars)"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Setup Secret"
              value={form.secret}
              onChange={e => setForm(f => ({ ...f, secret: e.target.value }))}
              required
              style={inputStyle}
            />
            {status === 'error' && (
              <div style={{ color: 'red', fontSize: '0.875rem' }}>{message}</div>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{ padding: '0.75rem', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              {status === 'loading' ? 'Creating...' : 'Create Admin'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '0.75rem',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '1rem',
  outline: 'none',
};
