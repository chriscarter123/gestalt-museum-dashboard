import React, { useState, useRef } from 'react';

const VENUE_TYPES = [
  { value: 'gallery',      label: 'Commercial gallery' },
  { value: 'artist-run',   label: 'Artist-run space' },
  { value: 'popup',        label: 'Pop-up / temporary installation' },
  { value: 'outdoor',      label: 'Outdoor sculpture / public art' },
  { value: 'museum',       label: 'Museum or institution' },
];

function deriveTier(artworkRange) {
  if (artworkRange === '1-10')   return 'starter';
  if (artworkRange === '11-50')  return 'gallery';
  if (artworkRange === '51-200') return 'gallery';
  return 'institution';
}

const PLAN_DATA = [
  {
    key: 'starter',
    name: 'Free',
    price: '$0 / month',
    features: ['5 artworks', 'QR codes + basic audio', 'Gestalt branding on visitor cards', 'No analytics'],
  },
  {
    key: 'gallery',
    name: 'Gallery',
    price: '$99 / month',
    features: ['50 artworks', 'Audio descriptions (AI-generated)', 'Basic visitor analytics', 'Exhibition mode', 'Custom branding'],
  },
  {
    key: 'institution',
    name: 'Institution',
    price: '$500–$3,000 / month',
    features: ['Unlimited artworks', 'Full ADA scorecard', 'AR anchor management', 'NEA grant report builder', 'Multi-user, multi-floor'],
  },
];

// ── Step 1 ─────────────────────────────────────────────────────────────────────
function Step1({ data, onChange }) {
  return (
    <div>
      <h2 style={styles.stepHeading}>Tell us about your venue</h2>
      <p style={styles.stepSubheading}>We'll tailor Gestalt to fit your space.</p>

      <label style={styles.label}>Venue name</label>
      <input
        style={styles.input}
        value={data.name}
        onChange={e => onChange({ ...data, name: e.target.value })}
        placeholder="e.g. Crane Arts, Tiger Strikes Asteroid"
      />

      <label style={styles.label}>Venue type</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {VENUE_TYPES.map(({ value, label }) => (
          <div
            key={value}
            onClick={() => onChange({ ...data, type: value })}
            style={{
              ...styles.radioCard,
              borderColor: data.type === value ? '#14B860' : '#E5E7EB',
              background: data.type === value ? '#E8F7EF' : '#fff',
            }}
          >
            <div style={{
              width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${data.type === value ? '#14B860' : '#D1D5DB'}`,
              background: data.type === value ? '#14B860' : 'transparent',
              position: 'relative',
            }}>
              {data.type === value && (
                <div style={{
                  position: 'absolute', inset: 3, borderRadius: '50%', background: '#fff',
                }} />
              )}
            </div>
            <span style={{ fontSize: 13, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>{label}</span>
          </div>
        ))}
      </div>

      <label style={styles.label}>Floor count</label>
      <SegmentedControl
        options={['1', '2', '3', '4+']}
        value={data.floorCount}
        onChange={v => onChange({ ...data, floorCount: v })}
      />

      <label style={{ ...styles.label, marginTop: 16 }}>Approximate artwork count</label>
      <SegmentedControl
        options={['1–10', '11–50', '51–200', '200+']}
        value={data.artworkRange}
        onChange={v => onChange({ ...data, artworkRange: v })}
      />
    </div>
  );
}

// ── Step 2 ─────────────────────────────────────────────────────────────────────
function Step2({ data, onChange }) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const fileRef = useRef();

  function handleFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ ...data, photoPreview: url });
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 1500);
  }

  const descText = data.title
    ? `${data.title || 'Untitled'} by ${data.artist || 'Unknown'}, ${data.year || 'date unknown'}. A captivating work that draws the viewer into its composition through deliberate use of form and color.`
    : null;

  return (
    <div>
      <h2 style={styles.stepHeading}>Let's add your first artwork</h2>
      <p style={styles.stepSubheading}>You'll hear it described in seconds.</p>

      {/* Photo upload */}
      <div
        onClick={() => fileRef.current.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: '2px dashed #E5E7EB', borderRadius: 8, padding: 24,
          textAlign: 'center', cursor: 'pointer', marginBottom: 16,
          background: '#F9FAFB', position: 'relative',
        }}
      >
        {data.photoPreview ? (
          <img src={data.photoPreview} alt="preview" style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 4 }} />
        ) : (
          <>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🖼</div>
            <div style={{ fontSize: 13, color: '#6B7280', fontFamily: "'Outfit', sans-serif" }}>
              Drag & drop a photo, or <span style={{ color: '#14B860', fontWeight: 500 }}>choose file</span>
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, fontFamily: "'Outfit', sans-serif" }}>JPG or PNG</div>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png" style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])} />
      </div>

      <label style={styles.label}>Title</label>
      <input style={styles.input} value={data.title} onChange={e => onChange({ ...data, title: e.target.value })} placeholder="Artwork title" />

      <label style={styles.label}>Artist</label>
      <input style={styles.input} value={data.artist} onChange={e => onChange({ ...data, artist: e.target.value })} placeholder="Artist name" />

      <label style={styles.label}>Year</label>
      <input style={styles.input} value={data.year} onChange={e => onChange({ ...data, year: e.target.value })} placeholder="Year created" />

      {generating && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#F4F6F3', borderRadius: 8, marginTop: 12 }}>
          <div style={styles.spinner} />
          <span style={{ fontSize: 13, color: '#6B7280', fontFamily: "'Outfit', sans-serif" }}>Generating audio description…</span>
        </div>
      )}

      {generated && descText && (
        <div style={{ background: '#E8F7EF', borderRadius: 8, padding: 16, marginTop: 12 }}>
          <p style={{ fontSize: 12, color: '#0D7A3E', fontFamily: "'Outfit', sans-serif", marginBottom: 12, lineHeight: 1.5 }}>
            {descText}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setPlaying(p => !p)} style={{
              width: 32, height: 32, borderRadius: '50%', border: 'none',
              background: '#14B860', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: '#fff', flexShrink: 0,
            }}>
              {playing ? '⏸' : '▶'}
            </button>
            <div style={{ flex: 1, display: 'flex', gap: 2, alignItems: 'flex-end', height: 24 }}>
              {[6,10,14,8,16,12,10,14,8,6,12,10,16,8,12,14,10,6,14,12].map((h, i) => (
                <div key={i} style={{ flex: 1, height: h, background: playing ? '#14B860' : '#A7D9BC', borderRadius: 2 }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 3 ─────────────────────────────────────────────────────────────────────
const A11Y_QUESTIONS = [
  'Is your main entrance wheelchair accessible?',
  'Do you currently offer any audio guides or narration?',
  'Do you have printed materials available in large text?',
];

function Step3({ data, onChange }) {
  function setAnswer(i, val) {
    const answers = [...(data.answers || ['', '', ''])];
    answers[i] = val;
    onChange({ ...data, answers });
  }

  const answers = data.answers || ['', '', ''];
  const allAnswered = answers.every(a => a !== '');
  const score = answers.reduce((s, a) => s + (a === 'Yes' ? 33 : a === 'Not sure' ? 11 : 0), 0);

  return (
    <div>
      <h2 style={styles.stepHeading}>Quick accessibility check</h2>
      <p style={styles.stepSubheading}>3 questions to give you a starting score.</p>

      {A11Y_QUESTIONS.map((q, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: 8, lineHeight: 1.5 }}>{q}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Yes', 'No', 'Not sure'].map(opt => (
              <button
                key={opt}
                onClick={() => setAnswer(i, opt)}
                style={{
                  padding: '6px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif", fontWeight: 500,
                  border: `1.5px solid ${answers[i] === opt ? '#14B860' : '#E5E7EB'}`,
                  background: answers[i] === opt ? '#E8F7EF' : '#fff',
                  color: answers[i] === opt ? '#0D7A3E' : '#6B7280',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {allAnswered && (
        <div style={{ background: '#F4F6F3', borderRadius: 8, padding: 16, marginTop: 8 }}>
          <div style={{ fontSize: 13, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>
            Your starting accessibility score: <strong>{score} / 100</strong>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6, fontFamily: "'Outfit', sans-serif" }}>
            Adding audio descriptions to your artworks will raise this to {Math.min(score + 33, 100)}.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 4 ─────────────────────────────────────────────────────────────────────
function Step4({ recommendedTier, selectedPlan, onSelect }) {
  return (
    <div>
      <h2 style={styles.stepHeading}>Choose your plan</h2>

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        {PLAN_DATA.map(plan => {
          const isRecommended = plan.key === recommendedTier;
          const isSelected = selectedPlan === plan.key;
          return (
            <div key={plan.key} style={{
              flex: 1, border: `2px solid ${isSelected ? '#14B860' : isRecommended ? '#14B860' : '#E5E7EB'}`,
              borderRadius: 10, padding: 16, position: 'relative',
              background: isSelected ? '#E8F7EF' : '#fff',
            }}>
              {isRecommended && (
                <div style={{
                  position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                  background: '#14B860', color: '#fff', fontSize: 9, fontWeight: 600,
                  padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap',
                  fontFamily: "'Outfit', sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                  Recommended
                </div>
              )}
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 12, color: '#14B860', fontWeight: 500, fontFamily: "'Outfit', sans-serif", marginBottom: 12 }}>{plan.price}</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ fontSize: 11, color: '#6B7280', fontFamily: "'Outfit', sans-serif", marginBottom: 4, paddingLeft: 14, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#14B860' }}>·</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => onSelect(plan.key)} style={{
                marginTop: 14, width: '100%', padding: '7px 0', borderRadius: 6, fontSize: 12,
                fontFamily: "'Outfit', sans-serif", fontWeight: 500, cursor: 'pointer',
                border: `1.5px solid ${isSelected ? '#14B860' : '#E5E7EB'}`,
                background: isSelected ? '#14B860' : '#fff',
                color: isSelected ? '#fff' : '#374151',
              }}>
                {isSelected ? '✓ Selected' : 'Select'}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button onClick={() => onSelect('starter')} style={styles.linkBtn}>
          Start with Free — upgrade anytime
        </button>
      </div>
    </div>
  );
}

// ── Step 5 ─────────────────────────────────────────────────────────────────────
function Step5({ venueName, onComplete }) {
  return (
    <div>
      <h2 style={styles.stepHeading}>You're all set{venueName ? `, ${venueName}` : ''}.</h2>
      <p style={styles.stepSubheading}>Here's what to do first.</p>

      {[
        { label: 'Add your first 5 artworks', btnLabel: 'Go to Artworks', action: () => {} },
        { label: 'Print a QR label and put it on your wall', btnLabel: 'Print QR Label', action: () => {} },
        { label: 'Preview your gallery in the Gestalt visitor app', btnLabel: 'Preview as Visitor', action: () => window.open('https://gestalt-17ce0.web.app/app', '_blank') },
      ].map(({ label, btnLabel, action }, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 0', borderBottom: '1px solid #F3F4F6',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 18, height: 18, border: '2px solid #E5E7EB', borderRadius: 4, flexShrink: 0,
            }} />
            <span style={{ fontSize: 13, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>{label}</span>
          </div>
          <button onClick={action} style={{
            fontSize: 11, color: '#14B860', background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 500, whiteSpace: 'nowrap',
          }}>
            {btnLabel} →
          </button>
        </div>
      ))}

      <button onClick={onComplete} style={{
        ...styles.primaryBtn, width: '100%', marginTop: 28,
      }}>
        Open my dashboard
      </button>
    </div>
  );
}

// ── Segmented Control ──────────────────────────────────────────────────────────
function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1.5px solid #E5E7EB', width: 'fit-content' }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            padding: '6px 14px', fontSize: 12, cursor: 'pointer',
            fontFamily: "'Outfit', sans-serif", fontWeight: 500,
            border: 'none', borderRight: '1px solid #E5E7EB',
            background: value === opt ? '#111827' : '#fff',
            color: value === opt ? '#fff' : '#6B7280',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── Main Wizard ────────────────────────────────────────────────────────────────
export default function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState({ name: '', type: null, floorCount: '1', artworkRange: '1–10' });
  const [step2Data, setStep2Data] = useState({ photoPreview: null, title: '', artist: '', year: '' });
  const [step3Data, setStep3Data] = useState({ answers: ['', '', ''] });
  const [selectedPlan, setSelectedPlan] = useState(null);

  const recommendedTier = deriveTier(step1Data.artworkRange);
  const canAdvance1 = step1Data.name.trim() !== '' && step1Data.type !== null;

  function handleNext() {
    if (step === 4 && !selectedPlan) {
      setSelectedPlan(recommendedTier);
    }
    setStep(s => Math.min(s + 1, 5));
  }

  function handleBack() { setStep(s => Math.max(s - 1, 1)); }
  function handleSkip() { setStep(s => Math.min(s + 1, 5)); }

  function handleComplete() {
    onComplete({
      name: step1Data.name,
      type: step1Data.type,
      tier: selectedPlan || recommendedTier,
      floorCount: parseInt(step1Data.floorCount) || 1,
      artworkCount: step2Data.title ? 1 : 0,
      onboardingComplete: true,
      owner: { name: '', role: 'Gallery Owner', initials: '' },
      plan: {
        artworkLimit: (selectedPlan || recommendedTier) === 'starter' ? 5 : (selectedPlan || recommendedTier) === 'gallery' ? 50 : null,
        analyticsEnabled: (selectedPlan || recommendedTier) !== 'starter',
        grantReportsEnabled: (selectedPlan || recommendedTier) === 'institution',
        exhibitionsEnabled: (selectedPlan || recommendedTier) !== 'starter',
        multiFloorEnabled: (selectedPlan || recommendedTier) === 'institution',
        arAnchorsEnabled: (selectedPlan || recommendedTier) === 'institution',
        customBrandingEnabled: (selectedPlan || recommendedTier) !== 'starter',
      },
    });
  }

  const canAdvance = step === 1 ? canAdvance1 : true;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#F4F6F3',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Outfit', sans-serif", zIndex: 1000,
    }}>
      <div style={{
        width: '100%', maxWidth: 560, background: '#fff',
        borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
        padding: 40, position: 'relative',
      }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif" }}>Step {step} of 5</span>
          </div>
          <div style={{ height: 3, background: '#E5E7EB', borderRadius: 2 }}>
            <div style={{ height: '100%', background: '#14B860', borderRadius: 2, width: `${(step / 5) * 100}%`, transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Step content */}
        {step === 1 && <Step1 data={step1Data} onChange={setStep1Data} />}
        {step === 2 && <Step2 data={step2Data} onChange={setStep2Data} />}
        {step === 3 && <Step3 data={step3Data} onChange={setStep3Data} />}
        {step === 4 && <Step4 recommendedTier={recommendedTier} selectedPlan={selectedPlan} onSelect={p => { setSelectedPlan(p); setStep(5); }} />}
        {step === 5 && <Step5 venueName={step1Data.name} onComplete={handleComplete} />}

        {/* Nav buttons */}
        {step < 5 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 }}>
            <div>
              {step > 1 && (
                <button onClick={handleBack} style={styles.ghostBtn}>← Back</button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {step >= 3 && step < 5 && (
                <button onClick={handleSkip} style={styles.linkBtn}>I'll do this later</button>
              )}
              {step !== 4 && (
                <button
                  onClick={handleNext}
                  disabled={!canAdvance}
                  style={{ ...styles.primaryBtn, opacity: canAdvance ? 1 : 0.4, cursor: canAdvance ? 'pointer' : 'not-allowed' }}
                >
                  Continue →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = {
  stepHeading: {
    fontFamily: "'Newsreader', serif", fontSize: 24, fontWeight: 400,
    color: '#111827', margin: '0 0 8px',
  },
  stepSubheading: {
    fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#6B7280',
    margin: '0 0 24px',
  },
  label: {
    display: 'block', fontSize: 12, fontWeight: 500, color: '#374151',
    fontFamily: "'Outfit', sans-serif", marginBottom: 6,
  },
  input: {
    width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: 13,
    border: '1.5px solid #E5E7EB', fontFamily: "'Outfit', sans-serif",
    outline: 'none', marginBottom: 16, boxSizing: 'border-box', color: '#111827',
    background: '#fff',
  },
  radioCard: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
    borderRadius: 8, border: '1.5px solid #E5E7EB', cursor: 'pointer',
  },
  primaryBtn: {
    padding: '10px 24px', background: '#111827', color: '#fff', border: 'none',
    borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
  },
  ghostBtn: {
    padding: '8px 14px', background: 'none', color: '#6B7280', border: '1px solid #E5E7EB',
    borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
  },
  linkBtn: {
    background: 'none', border: 'none', color: '#6B7280', fontSize: 12,
    cursor: 'pointer', fontFamily: "'Outfit', sans-serif", textDecoration: 'underline',
  },
  spinner: {
    width: 16, height: 16, borderRadius: '50%',
    border: '2px solid #E5E7EB', borderTopColor: '#14B860',
    animation: 'spin 0.7s linear infinite', flexShrink: 0,
  },
};
