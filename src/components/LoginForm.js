import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

function GestaltLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
      <div style={{ width: 32, height: 32, position: 'relative', flexShrink: 0 }}>
        <div style={{ position: 'absolute', width: 14, height: 14, top: 0, left: 0, background: '#14B860', borderRadius: '3px 3px 14px 3px' }} />
        <div style={{ position: 'absolute', width: 14, height: 14, top: 0, right: 0, border: '1.8px solid #14B860', borderRadius: '3px 3px 3px 14px', boxSizing: 'border-box' }} />
        <div style={{ position: 'absolute', width: 14, height: 14, bottom: 0, left: 0, border: '1.8px solid #14B860', borderRadius: '3px 14px 3px 3px', boxSizing: 'border-box' }} />
        <div style={{ position: 'absolute', width: 14, height: 14, bottom: 0, right: 0, background: '#14B860', borderRadius: '14px 3px 3px 3px' }} />
      </div>
      <span style={{ fontWeight: 600, fontSize: 18, color: '#111827', letterSpacing: '0.02em', fontFamily: "'Outfit', sans-serif" }}>gestalt</span>
    </div>
  );
}

export default function LoginForm({ onLoggedIn, onShowRegister }) {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSubmit(ev) {
    ev.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }

    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const uid = credential.user.uid;

      // Fetch their Firestore profile (role, name, onboardingComplete, etc.)
      const snap = await getDoc(doc(db, 'users', uid));
      const profile = snap.exists() ? snap.data() : { uid, email: email.trim() };

      setLoading(false);
      onLoggedIn(profile);
    } catch (err) {
      setLoading(false);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment and try again.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) { setError('Enter your email address above, then click Forgot password.'); return; }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err) {
      setError('Could not send reset email. Check the address and try again.');
    }
    setResetLoading(false);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#F4F6F3',
      overflowY: 'auto', fontFamily: "'Outfit', sans-serif", padding: '40px 20px',
    }}>
      <div style={{
        width: '100%', maxWidth: 440, background: '#fff', margin: '0 auto',
        borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.1)', padding: '40px 40px 36px',
      }}>
        <GestaltLogo />

        <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: 26, fontWeight: 400, color: '#111827', margin: '0 0 6px', textAlign: 'center' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', margin: '0 0 28px' }}>
          Sign in to continue to your dashboard.
        </p>

        {error && (
          <div style={{
            fontSize: 12, color: '#E24B4A', padding: '10px 14px', background: '#FEF2F2',
            borderRadius: 8, border: '1px solid #FECACA', marginBottom: 20,
            fontFamily: "'Outfit', sans-serif", lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        {resetSent && (
          <div style={{
            fontSize: 12, color: '#0D7A3E', padding: '10px 14px', background: '#E8F7EF',
            borderRadius: 8, border: '1px solid #A7D9BC', marginBottom: 20,
            fontFamily: "'Outfit', sans-serif", lineHeight: 1.5,
          }}>
            Password reset email sent to <strong>{email}</strong>. Check your inbox.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label style={S.label}>Email</label>
          <input
            type="email"
            style={{ ...S.input, borderColor: error ? '#E24B4A' : '#E5E7EB' }}
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="you@example.com"
            autoFocus
          />

          <label style={S.label}>Password</label>
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <input
              type={showPass ? 'text' : 'password'}
              style={{ ...S.input, marginBottom: 0, borderColor: error ? '#E24B4A' : '#E5E7EB', paddingRight: 40 }}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Your password"
            />
            <button type="button" onClick={() => setShowPass(s => !s)} style={S.showHide}>
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              style={{ fontSize: 12, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", textDecoration: 'underline', padding: 0 }}
            >
              {resetLoading ? 'Sending…' : 'Forgot password?'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px 0',
              background: loading ? '#6B7280' : '#111827',
              color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Outfit', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'background 0.2s',
            }}
          >
            {loading && <div style={S.spinner} />}
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', margin: '20px 0 0' }}>
          Don't have an account?{' '}
          <span onClick={onShowRegister} style={{ color: '#14B860', cursor: 'pointer', fontWeight: 500 }}>
            Create one
          </span>
        </p>
      </div>
    </div>
  );
}

const S = {
  label: { display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', fontFamily: "'Outfit', sans-serif", marginBottom: 6 },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13,
    border: '1.5px solid #E5E7EB', fontFamily: "'Outfit', sans-serif",
    outline: 'none', marginBottom: 0, boxSizing: 'border-box', color: '#111827', background: '#fff',
  },
  showHide: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF',
    fontSize: 13, fontFamily: "'Outfit', sans-serif",
  },
  spinner: {
    width: 14, height: 14, borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
    animation: 'spin 0.7s linear infinite',
  },
};
