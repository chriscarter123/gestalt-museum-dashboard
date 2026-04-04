// ── OnboardingWizard ──────────────────────────────────────────────────────────
// 6-step guided setup for new institutions and galleries.
// Integrates with App.js via the onComplete(venueData) callback.

import React, { useState, useEffect, useRef } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────
const VENUE_TYPES = [
  { value: 'museum',      label: 'Museum or institution',     icon: '🏛' },
  { value: 'gallery',     label: 'Commercial gallery',        icon: '🖼' },
  { value: 'artist-run',  label: 'Artist-run space',          icon: '🎨' },
  { value: 'popup',       label: 'Pop-up / temporary',        icon: '📍' },
  { value: 'outdoor',     label: 'Outdoor / public art',      icon: '🌳' },
];

const ROLES = [
  'Curator', 'Registrar', 'Digital Experiences Coordinator',
  'Accessibility Coordinator', 'Visitor Services',
  'Director / Administration', 'IT / Technical', 'Other',
];

const ARTWORK_RANGES = ['1–10', '11–50', '51–200', '200+'];

const PLAN_DATA = [
  {
    key: 'starter',
    name: 'Free',
    price: '$0 / mo',
    note: 'Great for getting started',
    features: ['5 artworks', 'QR codes + basic audio', 'Gestalt branding'],
  },
  {
    key: 'gallery',
    name: 'Gallery',
    price: '$99 / mo',
    note: 'For growing galleries',
    features: ['50 artworks', 'AI audio descriptions', 'Visitor analytics', 'Custom branding'],
  },
  {
    key: 'institution',
    name: 'Institution',
    price: 'From $500 / mo',
    note: 'For museums & institutions',
    features: ['Unlimited artworks', 'ADA scorecard', 'NEA grant reports', 'Multi-floor, multi-user'],
  },
];

function deriveTier(range) {
  if (range === '1–10')   return 'starter';
  if (range === '11–50')  return 'gallery';
  if (range === '51–200') return 'gallery';
  return 'institution';
}

// ── Mock audio waveform ────────────────────────────────────────────────────────
const WAVEFORM   = [6,10,14,8,16,12,10,14,8,6,12,10,16,8,12,14,10,6,14,12];
const MOCK_SECS  = 26;

// ── Shared primitives ──────────────────────────────────────────────────────────
function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1.5px solid #E5E7EB', width: 'fit-content' }}>
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)} style={{
          padding: '7px 16px', fontSize: 12, cursor: 'pointer',
          fontFamily: "'Outfit', sans-serif", fontWeight: 500,
          border: 'none', borderRight: '1px solid #E5E7EB',
          background: value === opt ? '#111827' : '#fff',
          color: value === opt ? '#fff' : '#6B7280',
          transition: 'background 0.15s',
        }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── STEP 1: WELCOME ────────────────────────────────────────────────────────────
function Step1({ onNext }) {
  return (
    <div>
      <p style={s.eyebrow}>Welcome to Gestalt</p>
      <h2 style={s.heading}>
        Your visitors are about to hear your collection.
      </h2>
      <p style={s.body}>
        Gestalt is a native mobile app built for the museum floor. It uses your
        visitors' cameras to recognize artworks instantly and delivers rich audio
        experiences — hands-free, no QR codes, no searching.
      </p>
      <p style={{ ...s.body, color: '#9CA3AF', fontStyle: 'italic', marginBottom: 28, marginTop: -8 }}>
        It requires a download — and that download is exactly what makes it exceptional.
      </p>

      {/* Stat */}
      <div style={s.statBox}>
        <span style={s.statNum}>40%</span>
        <span style={s.statLabel}>
          longer time spent with individual works at museums using Gestalt
        </span>
      </div>

      <button onClick={onNext} style={{ ...s.primaryBtn, width: '100%', padding: '14px' }}>
        Set Up Your Institution →
      </button>
      <p style={s.nudge}>About 10 minutes to have your first artwork live.</p>
    </div>
  );
}

// ── STEP 2: INSTITUTION PROFILE ────────────────────────────────────────────────
function Step2({ data, onChange }) {
  return (
    <div>
      <p style={s.eyebrow}>Step 1 of 4</p>
      <h2 style={s.heading}>Let's make this official.</h2>
      <p style={s.body}>This is the profile your team will manage your collection under.</p>

      <label style={s.label}>Institution Name</label>
      <input
        autoFocus
        value={data.name}
        onChange={e => onChange({ ...data, name: e.target.value })}
        style={s.input}
        placeholder="e.g. Philadelphia Museum of Art"
      />

      <label style={s.label}>Type</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {VENUE_TYPES.map(({ value, label, icon }) => (
          <div
            key={value}
            onClick={() => onChange({ ...data, type: value })}
            style={{
              ...s.radioCard,
              borderColor:  data.type === value ? '#14B860' : '#E5E7EB',
              background:   data.type === value ? '#F0FAF4' : '#fff',
            }}
          >
            <div style={{
              width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${data.type === value ? '#14B860' : '#D1D5DB'}`,
              background: data.type === value ? '#14B860' : 'transparent',
              position: 'relative',
            }}>
              {data.type === value && (
                <div style={{ position: 'absolute', inset: 3, borderRadius: '50%', background: '#fff' }} />
              )}
            </div>
            <span style={{ fontSize: 13, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>
              {icon} {label}
            </span>
          </div>
        ))}
      </div>

      <label style={s.label}>Your Role <span style={s.optional}>(optional)</span></label>
      <select value={data.role || ''} onChange={e => onChange({ ...data, role: e.target.value })} style={s.input}>
        <option value="">Select your role…</option>
        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
      </select>

      <label style={s.label}>Approximate artwork count</label>
      <SegmentedControl
        options={ARTWORK_RANGES}
        value={data.artworkRange}
        onChange={v => onChange({ ...data, artworkRange: v })}
      />

      {data.name.trim() && (
        <div style={s.confirmBox}>
          <span style={s.confirmDot} />
          <span style={{ fontSize: 13, color: '#374151', fontFamily: "'Outfit', sans-serif" }}>
            <strong style={{ color: '#111827' }}>{data.name}</strong> is ready to be added to Gestalt.
          </span>
        </div>
      )}
    </div>
  );
}

// ── STEP 3: FIRST ARTWORK ──────────────────────────────────────────────────────
function Step3({ data, onChange }) {
  const fileRef = useRef();

  function handleFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ ...data, photoPreview: url, fileName: file.name, file });
  }

  return (
    <div>
      <p style={s.eyebrow}>Step 2 of 4</p>
      <h2 style={s.heading}>Pick one artwork to start.</h2>
      <p style={s.body}>
        Choose a piece {data.name ? `from ${data.name} ` : ''}that visitors always ask about — something with a story worth telling.
      </p>

      {/* Photo upload */}
      <div
        onClick={() => fileRef.current.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        style={{
          ...s.uploadZone,
          ...(data.photoPreview ? s.uploadZoneLoaded : {}),
          backgroundImage: data.photoPreview ? `url(${data.photoPreview})` : 'none',
        }}
      >
        {!data.photoPreview ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🖼</div>
            <p style={{ margin: 0, fontSize: 13, color: '#374151', fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>
              Upload a photo
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif" }}>
              A clear front-facing photo works best. Even a phone photo is fine.
            </p>
          </div>
        ) : (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.2s',
          }} className="upload-hover-overlay">
            <span style={{ fontSize: 12, color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 600, background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: 6 }}>
              Change photo
            </span>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])} />

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 140px' }}>
          <label style={s.label}>Title</label>
          <input value={data.title} onChange={e => onChange({ ...data, title: e.target.value })}
            style={s.input} placeholder="Water Lilies" />
        </div>
        <div style={{ flex: '2 1 140px' }}>
          <label style={s.label}>Artist</label>
          <input value={data.artist} onChange={e => onChange({ ...data, artist: e.target.value })}
            style={s.input} placeholder="Claude Monet" />
        </div>
        <div style={{ flex: '1 1 80px' }}>
          <label style={s.label}>Year</label>
          <input value={data.year} onChange={e => onChange({ ...data, year: e.target.value })}
            style={s.input} placeholder="1906" type="number" />
        </div>
      </div>

      <label style={s.label}>
        What do your guides usually say about this piece?{' '}
        <span style={s.optional}>(optional)</span>
      </label>
      <textarea
        value={data.context || ''}
        onChange={e => onChange({ ...data, context: e.target.value })}
        style={{ ...s.input, minHeight: 80, resize: 'vertical', lineHeight: 1.6 }}
        placeholder="Context, provenance, what makes it significant…"
      />

      <p style={{ ...s.nudge, color: '#14B860', fontStyle: 'italic' }}>This is where it gets good.</p>
    </div>
  );
}

// ── STEP 4: THE MAGIC MOMENT ───────────────────────────────────────────────────
const GEN_PHASES = [
  'Analyzing your artwork…',
  'Reading the composition and visual details…',
  'Writing an audio description…',
  'Recording the narration…',
];

function Step4({ artworkData }) {
  const [phase,    setPhase]    = useState(0);
  const [genDone,  setGenDone]  = useState(false);
  const [playing,  setPlaying]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasPlayed,setHasPlayed]= useState(false);
  const playRef = useRef(null);

  const mockDesc = artworkData.title
    ? `${artworkData.title}${artworkData.artist ? ` by ${artworkData.artist}` : ''}${artworkData.year ? `, ${artworkData.year}` : ''}. A compelling work that draws the viewer into its composition through a deliberate use of form, color, and texture. The artist invites sustained looking — a conversation between the artwork and the space around it.`
    : 'A captivating work that draws the viewer into its composition through a deliberate use of form and color.';

  // Auto-start mock generation on mount
  useEffect(() => {
    let p = 0;
    const phaseTimer = setInterval(() => {
      p = Math.min(p + 1, GEN_PHASES.length - 1);
      setPhase(p);
    }, 5500);
    const doneTimer = setTimeout(() => {
      clearInterval(phaseTimer);
      setGenDone(true);
    }, 3000);
    return () => { clearInterval(phaseTimer); clearTimeout(doneTimer); };
  }, []);

  // Playback progress ticker
  useEffect(() => {
    if (playing) {
      playRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { setPlaying(false); clearInterval(playRef.current); return 0; }
          return p + (100 / MOCK_SECS / 10);
        });
      }, 100);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [playing]);

  function togglePlay() {
    if (progress >= 100) setProgress(0);
    if (!hasPlayed) setHasPlayed(true);
    setPlaying(p => !p);
  }

  return (
    <div>
      <p style={s.eyebrow}>Step 2 of 4 — continued</p>
      <h2 style={s.heading}>Gestalt is working on it.</h2>

      {!genDone ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0 24px' }}>
          {/* Pulse ring */}
          <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 28 }}>
            <style>{`
              @keyframes ob-pulse { 0%,100% { transform:scale(1); opacity:.5; } 50% { transform:scale(1.18); opacity:.15; } }
              @keyframes ob-fade-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
              @keyframes ob-pop { 0% { transform:scale(.8); opacity:0; } 65% { transform:scale(1.06); } 100% { transform:scale(1); opacity:1; } }
              @keyframes ob-spin { to { transform:rotate(360deg); } }
            `}</style>
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'1.5px solid rgba(20,184,96,0.3)', animation:'ob-pulse 2.4s ease-in-out infinite' }} />
            <div style={{ position:'absolute', inset:14, borderRadius:'50%', border:'1px solid rgba(20,184,96,0.2)', animation:'ob-pulse 2.4s ease-in-out infinite 0.4s' }} />
            <div style={{ position:'absolute', inset:26, borderRadius:'50%', background:'rgba(20,184,96,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ color:'#14B860', fontSize:16 }}>✦</span>
            </div>
          </div>
          <p key={phase} style={{ fontSize:13, color:'#9CA3AF', fontFamily:"'Outfit', sans-serif", textAlign:'center', animation:'ob-fade-in 0.4s ease both', margin:0 }}>
            {GEN_PHASES[phase]}
          </p>
        </div>
      ) : (
        <div style={{ animation:'ob-fade-in 0.5s ease both' }}>
          {/* Artwork thumbnail */}
          {artworkData.photoPreview && (
            <img
              src={artworkData.photoPreview}
              alt={artworkData.title}
              style={{ width:72, height:72, objectFit:'cover', borderRadius:10, marginBottom:16, border:'1px solid #E5E7EB', display:'block' }}
            />
          )}

          {/* Description text */}
          <div style={{ background:'#F0FAF4', borderRadius:10, padding:'16px 18px', marginBottom:16 }}>
            <p style={{ fontSize:13, color:'#0D7A3E', fontFamily:"'Outfit', sans-serif", lineHeight:1.65, margin:'0 0 14px' }}>
              {mockDesc}
            </p>

            {/* Waveform player */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <button
                onClick={togglePlay}
                style={{ width:32, height:32, borderRadius:'50%', border:'none', background:'#14B860', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#fff', flexShrink:0, animation:'ob-pop 0.4s ease both' }}
              >
                {playing ? '⏸' : '▶'}
              </button>
              <div style={{ flex:1, display:'flex', gap:3, alignItems:'center', height:28 }}>
                {WAVEFORM.map((h,i) => {
                  const played = (i / WAVEFORM.length) * 100 < progress;
                  return (
                    <div key={i} style={{
                      width:3, flexShrink:0, height:h,
                      background: played ? '#14B860' : '#A7D9BC',
                      borderRadius:2, transformOrigin:'center',
                      animation: playing ? `ob-pulse ${0.6+(i%4)*0.15}s ease-in-out ${(i*0.04).toFixed(2)}s infinite` : 'none',
                    }} />
                  );
                })}
              </div>
              <span style={{ fontSize:11, color:'#0D7A3E', fontFamily:"'Outfit', sans-serif", flexShrink:0, minWidth:28, textAlign:'right' }}>
                {playing || progress > 0 ? `${Math.floor((progress/100)*MOCK_SECS)}s` : `${MOCK_SECS}s`}
              </span>
            </div>
            <div
              style={{ height:3, background:'rgba(13,122,62,0.12)', borderRadius:2, cursor:'pointer' }}
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct  = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                setProgress(pct);
                if (!playing) setPlaying(true);
                setHasPlayed(true);
              }}
            >
              <div style={{ height:'100%', width:`${progress}%`, background:'#14B860', borderRadius:2, transition:'width 0.1s linear' }} />
            </div>
          </div>

          {hasPlayed && (
            <p style={{ fontSize:13, color:'#6B7280', fontFamily:"'Outfit', sans-serif", lineHeight:1.6, animation:'ob-fade-in 0.4s ease both' }}>
              This is what a visitor hears when they stand in front of{' '}
              <em style={{ color:'#374151' }}>{artworkData.title || 'this artwork'}</em> — generated in under 60 seconds.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── STEP 5: TWO MODES ─────────────────────────────────────────────────────────
function Step5({ venueName }) {
  return (
    <div>
      <p style={s.eyebrow}>Step 3 of 4</p>
      <h2 style={s.heading}>Here's how your visitors will experience this.</h2>
      <p style={s.body}>
        Gestalt works in two modes. You choose what's right for {venueName || 'your institution'}.
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
        {/* App card */}
        <div style={{ ...s.modeCard, borderColor:'rgba(20,184,96,0.3)', background:'#F0FAF4' }}>
          <span style={{ fontSize:22 }}>📱</span>
          <h3 style={{ fontFamily:"'Newsreader', serif", fontSize:16, fontWeight:400, color:'#111827', margin:'4px 0 6px' }}>
            The Gestalt App
          </h3>
          <span style={s.modePill}>Best experience</span>
          <p style={s.modeBody}>
            Visitors download the free app once. Their camera recognizes artworks instantly — spatial audio plays as they move through the space.
          </p>
          <p style={{ ...s.modeBody, color:'#9CA3AF', fontStyle:'italic', marginBottom:0 }}>iOS and Android.</p>
        </div>

        {/* Lite card */}
        <div style={{ ...s.modeCard, borderColor:'#E5E7EB', background:'#F9FAFB' }}>
          <span style={{ fontSize:22 }}>🔗</span>
          <h3 style={{ fontFamily:"'Newsreader', serif", fontSize:16, fontWeight:400, color:'#111827', margin:'4px 0 6px' }}>
            Gestalt Lite
          </h3>
          <span style={{ ...s.modePill, color:'#6B7280', borderColor:'#D1D5DB', background:'#F3F4F6' }}>
            No download
          </span>
          <p style={s.modeBody}>
            A visitor opens a URL on their phone — the audio description plays immediately. No account, no friction. Works on any device.
          </p>
          <p style={{ ...s.modeBody, color:'#9CA3AF', fontStyle:'italic', marginBottom:0 }}>A great reason to get the full app.</p>
        </div>
      </div>

      <div style={s.recoBox}>
        <span style={{ fontSize:16, flexShrink:0 }}>💡</span>
        <p style={{ margin:0, fontSize:13, color:'#6B7280', fontFamily:"'Outfit', sans-serif", lineHeight:1.65 }}>
          Most institutions lead with Lite to remove the barrier, then convert engaged
          visitors to the full app through in-gallery signage.
        </p>
      </div>
    </div>
  );
}

// ── STEP 6: PLAN + DONE ────────────────────────────────────────────────────────
function Step6({ venueName, artworkTitle, recommendedTier, selectedPlan, onSelect, onComplete }) {
  return (
    <div>
      <p style={s.eyebrow}>Step 4 of 4</p>
      <h2 style={s.heading}>
        {artworkTitle || 'Your first artwork'} is live in both modes.
      </h2>
      <p style={s.body}>
        Walk-in visitors can reach it at a URL. Returning visitors get the full experience
        through the app. Your collection is accessible from day one.
      </p>

      {/* Screenshot badge */}
      <div style={s.badge}>
        <div style={s.badgeDot} />
        <div>
          <p style={{ fontFamily:"'Outfit', sans-serif", fontSize:14, fontWeight:600, color:'#111827', margin:'0 0 4px' }}>
            {venueName || 'Your Institution'}
          </p>
          <p style={{ fontFamily:"'Outfit', sans-serif", fontSize:11, color:'#9CA3AF', margin:0 }}>
            1 artwork · Audio descriptions enabled · ADA-ready
          </p>
        </div>
      </div>

      {/* Plan selection */}
      <p style={{ fontFamily:"'Outfit', sans-serif", fontSize:12, fontWeight:600, color:'#374151', marginBottom:12, letterSpacing:'0.06em', textTransform:'uppercase' }}>
        Choose your plan
      </p>
      <div style={{ display:'flex', gap:10, marginBottom:24 }}>
        {PLAN_DATA.map(plan => {
          const isRec = plan.key === recommendedTier;
          const isSel = (selectedPlan || recommendedTier) === plan.key;
          return (
            <div
              key={plan.key}
              onClick={() => onSelect(plan.key)}
              style={{
                flex:1, borderRadius:10, padding:'14px 12px', cursor:'pointer',
                border:`1.5px solid ${isSel ? '#14B860' : '#E5E7EB'}`,
                background: isSel ? '#F0FAF4' : '#fff',
                position:'relative', transition:'border-color 0.15s',
              }}
            >
              {isRec && (
                <div style={{ position:'absolute', top:-9, left:'50%', transform:'translateX(-50%)', background:'#14B860', color:'#fff', fontSize:8, fontWeight:700, padding:'2px 8px', borderRadius:8, whiteSpace:'nowrap', fontFamily:"'Outfit', sans-serif", letterSpacing:'0.06em', textTransform:'uppercase' }}>
                  Recommended
                </div>
              )}
              <p style={{ fontFamily:"'Outfit', sans-serif", fontSize:13, fontWeight:600, color:'#111827', margin:'0 0 2px' }}>{plan.name}</p>
              <p style={{ fontFamily:"'Outfit', sans-serif", fontSize:11, color:'#14B860', fontWeight:500, margin:'0 0 10px' }}>{plan.price}</p>
              <ul style={{ margin:0, padding:0, listStyle:'none' }}>
                {plan.features.map((f,i) => (
                  <li key={i} style={{ fontSize:10, color:'#6B7280', fontFamily:"'Outfit', sans-serif", marginBottom:3, paddingLeft:12, position:'relative' }}>
                    <span style={{ position:'absolute', left:0, color:'#14B860' }}>·</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p style={{ fontFamily:"'Outfit', sans-serif", fontSize:11, color:'#9CA3AF', textAlign:'center', marginBottom:20 }}>
        Your director can review {venueName ? `${venueName}'s` : "your institution's"} progress at{' '}
        <span style={{ color:'#14B860' }}>gestalt.gallery/institutions</span>
      </p>

      <button onClick={() => onComplete('gallery-home')} style={{ ...s.primaryBtn, width:'100%', padding:'14px' }}>
        Open my dashboard →
      </button>
    </div>
  );
}

// ── MAIN WIZARD ────────────────────────────────────────────────────────────────
export default function OnboardingWizard({ onComplete }) {
  const TOTAL = 6;
  const [step,      setStep]      = useState(1);
  const [visible,   setVisible]   = useState(true);

  const [step2Data, setStep2Data] = useState({ name:'', type:null, artworkRange:'1–10', role:'' });
  const [step3Data, setStep3Data] = useState({ photoPreview:null, title:'', artist:'', year:'', context:'', file:null });
  const [selPlan,   setSelPlan]   = useState(null);

  const recommendedTier = deriveTier(step2Data.artworkRange);
  const can2 = step2Data.name.trim() !== '' && step2Data.type !== null;
  const can3 = step3Data.title.trim() !== '';

  // ── Step transition ──────────────────────────────────────────────────────
  function goTo(n) {
    setVisible(false);
    setTimeout(() => { setStep(n); setVisible(true); }, 180);
  }
  function next() { goTo(Math.min(step + 1, TOTAL)); }
  function back() { goTo(Math.max(step - 1, 1)); }
  function skip() { goTo(Math.min(step + 1, TOTAL)); }

  // ── Complete handler ─────────────────────────────────────────────────────
  function handleComplete(targetPage = 'gallery-home') {
    const plan = selPlan || recommendedTier;
    onComplete({
      name:             step2Data.name,
      type:             step2Data.type,
      tier:             plan,
      floorCount:       1,
      artworkCount:     step3Data.title ? 1 : 0,
      onboardingComplete: true,
      _targetPage:      targetPage,
      _artworkData:     step3Data.title ? {
        title:   step3Data.title,
        artist:  step3Data.artist || 'Unknown',
        year:    step3Data.year ? parseInt(step3Data.year) : null,
        context: step3Data.context,
        type:    step2Data.type || 'Other',
        status:  'active',
        hasAudio: false,
      } : null,
      owner: { name:'', role: step2Data.role || 'Gallery Owner', initials:'' },
      plan: {
        artworkLimit:          plan === 'starter' ? 5 : plan === 'gallery' ? 50 : null,
        analyticsEnabled:      plan !== 'starter',
        grantReportsEnabled:   plan === 'institution',
        exhibitionsEnabled:    plan !== 'starter',
        multiFloorEnabled:     plan === 'institution',
        arAnchorsEnabled:      plan === 'institution',
        customBrandingEnabled: plan !== 'starter',
      },
    });
  }

  const canAdvance = step === 2 ? can2 : step === 3 ? can3 : true;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      position:'fixed', inset:0,
      background:'#F4F6F3',
      overflowY:'auto',
      fontFamily:"'Outfit', sans-serif",
      zIndex:1000,
      padding:'40px 20px 80px',
    }}>
      <div style={{
        width:'100%', maxWidth:560, margin:'0 auto',
        background:'#fff', borderRadius:20,
        boxShadow:'0 8px 48px rgba(0,0,0,0.1)',
        padding:'36px 40px',
        position:'relative',
      }}>

        {/* Progress bar */}
        {step > 1 && step < TOTAL && (
          <div style={{ marginBottom:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:11, color:'#9CA3AF', fontFamily:"'Outfit', sans-serif" }}>
                Step {step - 1} of {TOTAL - 2}
              </span>
              <button onClick={skip} style={s.linkBtn}>
                I'll do this later
              </button>
            </div>
            <div style={{ height:3, background:'#E5E7EB', borderRadius:2 }}>
              <div style={{
                height:'100%', background:'#14B860', borderRadius:2,
                width:`${((step - 1) / (TOTAL - 1)) * 100}%`,
                transition:'width 0.35s ease',
              }} />
            </div>
          </div>
        )}

        {/* Step content with fade */}
        <div style={{
          opacity:   visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
          transition:'opacity 0.18s ease, transform 0.18s ease',
        }}>
          {step === 1 && <Step1 onNext={next} />}
          {step === 2 && <Step2 data={{ ...step2Data, name: step2Data.name }} onChange={d => setStep2Data(d)} />}
          {step === 3 && <Step3 data={{ ...step3Data, name: step2Data.name }} onChange={d => setStep3Data(d)} />}
          {step === 4 && <Step4 artworkData={step3Data} />}
          {step === 5 && <Step5 venueName={step2Data.name} />}
          {step === 6 && (
            <Step6
              venueName={step2Data.name}
              artworkTitle={step3Data.title}
              recommendedTier={recommendedTier}
              selectedPlan={selPlan}
              onSelect={p => setSelPlan(p)}
              onComplete={handleComplete}
            />
          )}
        </div>

        {/* Nav buttons */}
        {step > 1 && step < TOTAL && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:28 }}>
            <button onClick={back} style={s.ghostBtn}>← Back</button>
            {step !== 4 ? (
              <button
                onClick={next}
                disabled={!canAdvance}
                style={{ ...s.primaryBtn, opacity: canAdvance ? 1 : 0.38, cursor: canAdvance ? 'pointer' : 'not-allowed' }}
              >
                Continue →
              </button>
            ) : (
              /* Step 4: auto-advance after generation, or manual continue */
              <button onClick={next} style={s.primaryBtn}>
                See the full experience →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  eyebrow: {
    fontFamily:"'Outfit', sans-serif", fontSize:11, fontWeight:600,
    letterSpacing:'0.12em', textTransform:'uppercase', color:'#9CA3AF', margin:'0 0 16px',
  },
  heading: {
    fontFamily:"'Newsreader', serif", fontSize:26, fontWeight:400,
    color:'#111827', margin:'0 0 14px', lineHeight:1.25,
  },
  body: {
    fontFamily:"'Outfit', sans-serif", fontSize:14, color:'#6B7280',
    lineHeight:1.7, margin:'0 0 24px',
  },
  label: {
    display:'block', fontSize:12, fontWeight:500, color:'#374151',
    fontFamily:"'Outfit', sans-serif", marginBottom:6,
  },
  optional: {
    fontWeight:400, color:'#9CA3AF', fontSize:11,
  },
  input: {
    width:'100%', padding:'10px 12px', borderRadius:8, fontSize:13,
    border:'1.5px solid #E5E7EB', fontFamily:"'Outfit', sans-serif",
    outline:'none', marginBottom:16, boxSizing:'border-box',
    color:'#111827', background:'#fff', transition:'border-color 0.15s',
  },
  radioCard: {
    display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
    borderRadius:8, border:'1.5px solid #E5E7EB', cursor:'pointer',
    transition:'border-color 0.15s, background 0.15s',
  },
  statBox: {
    display:'flex', alignItems:'center', gap:16,
    padding:'18px 20px', marginBottom:32,
    background:'#F0FAF4',
    border:'1px solid rgba(20,184,96,0.2)',
    borderRadius:12,
  },
  statNum: {
    fontFamily:"'Newsreader', serif", fontSize:40, fontWeight:400,
    color:'#14B860', lineHeight:1, flexShrink:0,
  },
  statLabel: {
    fontFamily:"'Outfit', sans-serif", fontSize:13, color:'#6B7280', lineHeight:1.55,
  },
  nudge: {
    fontFamily:"'Outfit', sans-serif", fontSize:12, color:'#9CA3AF',
    textAlign:'center', margin:'12px 0 0',
  },
  confirmBox: {
    display:'flex', alignItems:'center', gap:10,
    padding:'12px 16px', marginTop:16,
    background:'#F0FAF4',
    border:'1px solid rgba(20,184,96,0.2)',
    borderRadius:8,
  },
  confirmDot: {
    width:8, height:8, borderRadius:'50%',
    background:'#14B860', flexShrink:0,
  },
  uploadZone: {
    width:'100%', height:180, borderRadius:10, marginBottom:18,
    border:'2px dashed #E5E7EB', background:'#F9FAFB',
    display:'flex', alignItems:'center', justifyContent:'center',
    cursor:'pointer', overflow:'hidden', position:'relative',
    backgroundSize:'cover', backgroundPosition:'center',
    transition:'border-color 0.2s', boxSizing:'border-box',
  },
  uploadZoneLoaded: {
    border:'2px solid rgba(20,184,96,0.3)',
  },
  primaryBtn: {
    padding:'10px 24px', background:'#111827', color:'#fff',
    border:'none', borderRadius:8, fontSize:13, fontWeight:600,
    cursor:'pointer', fontFamily:"'Outfit', sans-serif",
    transition:'filter 0.15s',
  },
  ghostBtn: {
    padding:'8px 14px', background:'none', color:'#6B7280',
    border:'1px solid #E5E7EB', borderRadius:6, fontSize:12,
    cursor:'pointer', fontFamily:"'Outfit', sans-serif",
  },
  linkBtn: {
    background:'none', border:'none', color:'#9CA3AF', fontSize:11,
    cursor:'pointer', fontFamily:"'Outfit', sans-serif",
    textDecoration:'underline', padding:0,
  },
  modeCard: {
    padding:'18px 16px', borderRadius:12, border:'1.5px solid',
    display:'flex', flexDirection:'column', gap:8,
  },
  modePill: {
    display:'inline-block', fontSize:9, fontWeight:700,
    letterSpacing:'0.06em', textTransform:'uppercase',
    color:'#14B860', background:'rgba(20,184,96,0.1)',
    border:'1px solid rgba(20,184,96,0.25)',
    borderRadius:20, padding:'2px 10px', width:'fit-content',
  },
  modeBody: {
    fontFamily:"'Outfit', sans-serif", fontSize:12, color:'#6B7280', lineHeight:1.65, margin:0,
  },
  recoBox: {
    display:'flex', alignItems:'flex-start', gap:10,
    padding:'14px 16px', marginBottom:4,
    background:'#F9FAFB', border:'1px solid #F3F4F6', borderRadius:8,
  },
  badge: {
    display:'flex', alignItems:'center', gap:14,
    padding:'16px 18px', marginBottom:24,
    background:'#F0FAF4', border:'1px solid rgba(20,184,96,0.25)',
    borderRadius:10,
  },
  badgeDot: {
    width:10, height:10, borderRadius:'50%',
    background:'#14B860', flexShrink:0,
    boxShadow:'0 0 8px rgba(20,184,96,0.5)',
  },
};
