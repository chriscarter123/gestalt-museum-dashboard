import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import GestaltLogo from './GestaltLogo';

const POSITIONS = [
  'Gallery Owner / Director',
  'Curator',
  'Arts Administrator',
  'Registrar',
  'Education Coordinator',
  'Marketing & Communications',
  'Development / Fundraising',
  'Technical Staff',
  'Other',
];


function StepDots({ step }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 28 }}>
      {[1, 2].map(n => (
        <div key={n} style={{
          width: n === step ? 20 : 6, height: 6, borderRadius: 3,
          background: n === step ? '#14B860' : '#E5E7EB',
          transition: 'all 0.25s',
        }} />
      ))}
    </div>
  );
}

function StrengthBar({ password }) {
  const score = !password ? 0
    : password.length < 6 ? 1
    : password.length < 10 && !/[^a-zA-Z0-9]/.test(password) ? 2
    : password.length >= 10 && /[^a-zA-Z0-9]/.test(password) ? 4
    : 3;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#E24B4A', '#D4AF37', '#14B860', '#14B860'];
  return password ? (
    <div style={{ marginTop: -10, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? colors[score] : '#E5E7EB', transition: 'background 0.2s' }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: colors[score], fontFamily: "'Outfit', sans-serif" }}>{labels[score]}</div>
    </div>
  ) : null;
}

export default function RegistrationForm({ onRegistered, onShowLogin }) {
  const [step, setStep]           = useState(1);
  // Step 1
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  // Step 2
  const [name, setName]           = useState('');
  const [position, setPosition]   = useState('');
  const [customPos, setCustomPos] = useState('');

  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});

  // ── Step 1 ───────────────────────────────────────────────────────────────
  function validateStep1() {
    const e = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.';
    if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (password !== confirm) e.confirm = 'Passwords do not match.';
    return e;
  }

  function handleStep1(ev) {
    ev.preventDefault();
    const e = validateStep1();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(2);
  }

  // ── Step 2 ───────────────────────────────────────────────────────────────
  async function handleStep2(ev) {
    ev.preventDefault();
    const e = {};
    if (!name.trim()) e.name = 'Please enter your name.';
    if (!position) e.position = 'Please select your role.';
    if (Object.keys(e).length) { setErrors(e); return; }

    setErrors({});
    setLoading(true);

    const resolvedPosition = position === 'Other' ? (customPos.trim() || 'Other') : position;
    const initials = name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    try {
      // 1. Create Firebase Auth user
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = credential.user.uid;

      // 2. Write profile to Firestore
      //    role: 'institution_admin' distinguishes these users from
      //    museum visitors (role: 'visitor') in the Firestore console
      await setDoc(doc(db, 'users', uid), {
        uid,
        email: email.trim(),
        name: name.trim(),
        position: resolvedPosition,
        initials,
        role: 'institution_admin',   // ← institution staff, not a visitor
        accountType: 'institution',
        onboardingComplete: false,
        createdAt: serverTimestamp(),
        venue: null,                 // populated after onboarding wizard
      });

      setLoading(false);
      onRegistered({ uid, email: email.trim(), name: name.trim(), position: resolvedPosition, initials });

    } catch (err) {
      setLoading(false);
      if (err.code === 'auth/email-already-in-use') {
        setErrors({ firebase: 'An account with this email already exists. Please sign in instead.' });
        setStep(1);
      } else {
        setErrors({ firebase: err.message || 'Something went wrong. Please try again.' });
      }
    }
  }

  const Shell = ({ heading, sub, children, onSubmit }) => (
    <div style={{
      position: 'fixed', inset: 0, background: '#F4F6F3',
      overflowY: 'auto', fontFamily: "'Outfit', sans-serif", padding: '40px 20px',
    }}>
      <div style={{
        width: '100%', maxWidth: 440, background: '#fff', margin: '0 auto',
        borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.1)', padding: '40px 40px 36px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <GestaltLogo height={32} variant="dark" />
        </div>
        <StepDots step={step} />
        <h1 style={{ fontFamily: "'Newsreader', serif", fontSize: 26, fontWeight: 400, color: '#111827', margin: '0 0 6px', textAlign: 'center' }}>
          {heading}
        </h1>
        <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', margin: '0 0 28px' }}>{sub}</p>

        {errors.firebase && (
          <div style={{
            fontSize: 12, color: '#E24B4A', padding: '10px 14px', background: '#FEF2F2',
            borderRadius: 8, border: '1px solid #FECACA', marginBottom: 20,
            fontFamily: "'Outfit', sans-serif", lineHeight: 1.5,
          }}>
            {errors.firebase}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>{children}</form>
      </div>
    </div>
  );

  // ── Step 1 UI ────────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <Shell
        heading="Create your account"
        sub="Set up Gestalt for your gallery in minutes."
        onSubmit={handleStep1}
      >
        <label style={S.label}>Email</label>
        <input
          type="email"
          style={{ ...S.input, borderColor: errors.email ? '#E24B4A' : '#E5E7EB' }}
          value={email}
          onChange={e => { setEmail(e.target.value); setErrors(er => ({ ...er, email: null })); }}
          placeholder="you@example.com"
          autoFocus
        />
        {errors.email && <div style={S.error}>{errors.email}</div>}

        <label style={S.label}>Password</label>
        <div style={{ position: 'relative', marginBottom: 6 }}>
          <input
            type={showPass ? 'text' : 'password'}
            style={{ ...S.input, marginBottom: 0, borderColor: errors.password ? '#E24B4A' : '#E5E7EB', paddingRight: 40 }}
            value={password}
            onChange={e => { setPassword(e.target.value); setErrors(er => ({ ...er, password: null })); }}
            placeholder="Min. 8 characters"
          />
          <button type="button" onClick={() => setShowPass(s => !s)} style={S.showHide}>
            {showPass ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.password && <div style={{ ...S.error, marginBottom: 6 }}>{errors.password}</div>}
        <StrengthBar password={password} />

        <label style={S.label}>Confirm password</label>
        <input
          type={showPass ? 'text' : 'password'}
          style={{ ...S.input, borderColor: errors.confirm ? '#E24B4A' : '#E5E7EB' }}
          value={confirm}
          onChange={e => { setConfirm(e.target.value); setErrors(er => ({ ...er, confirm: null })); }}
          placeholder="Re-enter your password"
        />
        {errors.confirm && <div style={S.error}>{errors.confirm}</div>}

        <button type="submit" style={S.primaryBtn}>Continue →</button>

        {onShowLogin && (
          <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', margin: '16px 0 0' }}>
            Already have an account?{' '}
            <span onClick={onShowLogin} style={{ color: '#14B860', cursor: 'pointer', fontWeight: 500 }}>Sign in</span>
          </p>
        )}

        <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', margin: '16px 0 0', lineHeight: 1.6 }}>
          By continuing you agree to Gestalt's{' '}
          <span style={{ color: '#6B7280', textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span>
          {' '}and{' '}
          <span style={{ color: '#6B7280', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
        </p>
      </Shell>
    );
  }

  // ── Step 2 UI ────────────────────────────────────────────────────────────
  return (
    <Shell
      heading="Tell us about yourself"
      sub="This helps personalise your Gestalt experience."
      onSubmit={handleStep2}
    >
      <label style={S.label}>Full name <span style={{ color: '#E24B4A' }}>*</span></label>
      <input
        style={{ ...S.input, borderColor: errors.name ? '#E24B4A' : '#E5E7EB' }}
        value={name}
        onChange={e => { setName(e.target.value); setErrors(er => ({ ...er, name: null })); }}
        placeholder="e.g. Alex Rivera"
        autoFocus
      />
      {errors.name && <div style={S.error}>{errors.name}</div>}

      <label style={S.label}>Your role <span style={{ color: '#E24B4A' }}>*</span></label>
      <select
        style={{ ...S.input, cursor: 'pointer', color: position ? '#111827' : '#9CA3AF', borderColor: errors.position ? '#E24B4A' : '#E5E7EB' }}
        value={position}
        onChange={e => { setPosition(e.target.value); setErrors(er => ({ ...er, position: null })); }}
      >
        <option value="" disabled>Select your role…</option>
        {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      {errors.position && <div style={S.error}>{errors.position}</div>}

      {position === 'Other' && (
        <>
          <label style={S.label}>Describe your role</label>
          <input
            style={S.input}
            value={customPos}
            onChange={e => setCustomPos(e.target.value)}
            placeholder="e.g. Visitor Experience Manager"
          />
        </>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button type="button" onClick={() => setStep(1)} style={S.ghostBtn}>← Back</button>
        <button
          type="submit"
          disabled={loading}
          style={{ ...S.primaryBtn, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: loading ? 0.7 : 1 }}
        >
          {loading && <div style={S.spinner} />}
          {loading ? 'Creating account…' : 'Create account →'}
        </button>
      </div>
    </Shell>
  );
}

const S = {
  label: { display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', fontFamily: "'Outfit', sans-serif", marginBottom: 6 },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13,
    border: '1.5px solid #E5E7EB', fontFamily: "'Outfit', sans-serif",
    outline: 'none', marginBottom: 16, boxSizing: 'border-box', color: '#111827', background: '#fff',
  },
  error: { fontSize: 12, color: '#E24B4A', fontFamily: "'Outfit', sans-serif", marginTop: -12, marginBottom: 14 },
  primaryBtn: {
    width: '100%', padding: '11px 0', background: '#111827', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500,
    cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'background 0.2s',
  },
  ghostBtn: {
    padding: '11px 20px', background: '#fff', color: '#374151',
    border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
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
