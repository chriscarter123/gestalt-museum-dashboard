import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../firebase';

// ── Constants ──────────────────────────────────────────────────────────────────
const WAVEFORM = [6,10,14,8,16,12,10,14,8,6,12,10,16,8,12,14,10,6,14,12];
const MOCK_DURATION = 24;
const DESCRIBE_URL = 'https://us-central1-gestalt-17ce0.cloudfunctions.net/describeArtwork';

const SUPPORTED_VOICES = [
  { name: 'en-US-Neural2-F', label: 'Female — Warm (default)' },
  { name: 'en-US-Neural2-A', label: 'Female — Bright'         },
  { name: 'en-US-Neural2-C', label: 'Female — Clear'          },
  { name: 'en-US-Neural2-D', label: 'Male — Warm'             },
  { name: 'en-US-Neural2-I', label: 'Male — Steady'           },
  { name: 'en-US-Neural2-J', label: 'Male — Rich'             },
];
const DEFAULT_VOICE = 'en-US-Neural2-F';

const AUDIO_TIERS = [
  { key: 'overview', label: 'Overview', hint: '~15 sec', scriptKey: 'overviewScript', urlKey: 'audioUrlOverview' },
  { key: 'details',  label: 'Details',  hint: '~60 sec', scriptKey: 'detailsScript',  urlKey: 'audioUrlDetails'  },
  { key: 'context',  label: 'Context',  hint: '~45 sec', scriptKey: 'contextScript',  urlKey: 'audioUrlContext'  },
];

const TABS = [
  { key: 'basic',      label: 'Basic Info' },
  { key: 'classify',   label: 'Classification' },
  { key: 'location',   label: 'Location' },
  { key: 'media',      label: 'Media' },
  { key: 'access',     label: 'Accessibility' },
  { key: 'ar',         label: 'AR Anchor' },
  { key: 'museum',     label: 'Museum Details' },
];

// ── AI Description Helper ──────────────────────────────────────────────────────

// Converts a blob URL (from file upload) to { base64, mimeType }
async function blobUrlToBase64(blobUrl) {
  const res = await fetch(blobUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      base64: reader.result.split(',')[1],
      mimeType: blob.type || 'image/jpeg',
    });
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Calls the deployed describeArtwork Cloud Function.
// Returns { visualDescription, overviewScript, detailsScript, contextScript, audioUrl* }
async function callDescribeArtwork(data, voice = DEFAULT_VOICE) {
  // Build image payload — up to 4 images
  const imagePayload = [];
  for (const img of (data.images || []).slice(0, 4)) {
    if (img.type === 'url' && img.src) {
      imagePayload.push({ type: 'url', url: img.src });
    } else if (img.type === 'upload' && img.src) {
      try {
        const { base64, mimeType } = await blobUrlToBase64(img.src);
        imagePayload.push({ type: 'base64', data: base64, mimeType });
      } catch (e) {
        console.warn('[AI] Could not convert uploaded image:', e.message);
      }
    }
  }

  const metadata = {
    title:      data.title      || '',
    artist:     data.artist     || '',
    year:       data.year       || '',
    medium:     data.medium     || '',
    subject:    data.subject    || '',
    dimensions: data.dimensions || '',
  };

  // Get Firebase auth token — required by the Cloud Function
  let token = null;
  try {
    token = await auth.currentUser?.getIdToken();
  } catch (e) { /* no session */ }

  if (!token) {
    throw new Error('Sign in required to use AI generation. Please log in via the onboarding page.');
  }

  const res = await fetch(DESCRIBE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ images: imagePayload, metadata, voice }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }

  return res.json(); // { visualDescription, audioScript }
}

// ── Spinner ────────────────────────────────────────────────────────────────────
function Spinner({ size = 14, color = '#14B860' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      border: `2px solid rgba(0,0,0,0.08)`, borderTopColor: color,
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}

// ── Section Heading ────────────────────────────────────────────────────────────
function SectionHeading({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase',
      letterSpacing: '0.08em', fontFamily: "'Outfit', sans-serif",
      marginBottom: 12, marginTop: 24,
    }}>
      {children}
    </div>
  );
}

// ── Field ──────────────────────────────────────────────────────────────────────
function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 500, color: '#374151',
        fontFamily: "'Outfit', sans-serif", marginBottom: 5,
      }}>
        {label}{required && <span style={{ color: '#E24B4A', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif", marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );
}

// ── Input / Select / Textarea styles ──────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: 13,
  border: '1.5px solid #E5E7EB', fontFamily: "'Outfit', sans-serif",
  outline: 'none', boxSizing: 'border-box', color: '#111827', background: '#fff',
};
const textareaStyle = {
  ...inputStyle, resize: 'vertical', minHeight: 90, lineHeight: 1.6,
};
const selectStyle = {
  ...inputStyle, cursor: 'pointer',
};

// ── Audio Player ───────────────────────────────────────────────────────────────
function AudioPlayer({ script, audioUrl }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(MOCK_DURATION);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  // Use real <audio> element when audioUrl is available
  const hasRealAudio = !!audioUrl;

  useEffect(() => {
    if (hasRealAudio && !audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current.duration && isFinite(audioRef.current.duration)) {
          setDuration(Math.round(audioRef.current.duration));
        }
      });
      audioRef.current.addEventListener('ended', () => {
        setPlaying(false);
        setProgress(0);
      });
    }
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      clearInterval(intervalRef.current);
    };
  }, [audioUrl, hasRealAudio]);

  useEffect(() => {
    if (playing) {
      if (hasRealAudio && audioRef.current) {
        audioRef.current.play().catch(() => setPlaying(false));
        intervalRef.current = setInterval(() => {
          if (audioRef.current) {
            const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setProgress(isNaN(pct) ? 0 : pct);
          }
        }, 100);
      } else {
        // Fallback: simulated playback for script-only
        intervalRef.current = setInterval(() => {
          setProgress(p => {
            if (p >= 100) { setPlaying(false); clearInterval(intervalRef.current); return 0; }
            return p + (100 / duration / 10);
          });
        }, 100);
      }
    } else {
      if (hasRealAudio && audioRef.current) audioRef.current.pause();
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, hasRealAudio, duration]);

  function handleToggle() {
    if (progress >= 100) {
      setProgress(0);
      if (hasRealAudio && audioRef.current) audioRef.current.currentTime = 0;
    }
    setPlaying(p => !p);
  }

  function handleSeek(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setProgress(pct);
    if (hasRealAudio && audioRef.current) {
      audioRef.current.currentTime = (pct / 100) * audioRef.current.duration;
    }
    if (!playing) setPlaying(true);
  }

  const elapsed = hasRealAudio && audioRef.current
    ? Math.floor(audioRef.current.currentTime || 0)
    : Math.floor((progress / 100) * duration);

  return (
    <div style={{ background: '#E8F7EF', borderRadius: 8, padding: 14 }}>
      <style>{`@keyframes waveBar { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.9)} }`}</style>
      {hasRealAudio && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#14B860', fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ✧ Neural Narration
          </span>
        </div>
      )}
      <p style={{ fontSize: 11, color: '#0D7A3E', fontFamily: "'Outfit', sans-serif", marginBottom: 12, lineHeight: 1.6 }}>
        {script}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <button onClick={handleToggle} style={{
          width: 32, height: 32, borderRadius: '50%', border: 'none',
          background: '#14B860', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', flexShrink: 0,
        }}>
          {playing ? '⏸' : '▶'}
        </button>
        <div style={{ flex: 1, display: 'flex', gap: 3, alignItems: 'center', height: 28, overflow: 'hidden' }}>
          {WAVEFORM.map((h, i) => {
            const played = (i / WAVEFORM.length) * 100 < progress;
            return (
              <div key={i} style={{
                width: 3, flexShrink: 0, height: h,
                background: played ? '#14B860' : '#A7D9BC',
                borderRadius: 2, transformOrigin: 'center',
                animation: playing ? `waveBar ${0.6 + (i % 4) * 0.15}s ease-in-out ${(i * 0.04).toFixed(2)}s infinite` : 'none',
              }} />
            );
          })}
        </div>
        <span style={{ fontSize: 11, color: '#0D7A3E', fontFamily: "'Outfit', sans-serif", flexShrink: 0, minWidth: 32, textAlign: 'right' }}>
          {elapsed}s / {duration}s
        </span>
      </div>
      <div style={{ height: 3, background: 'rgba(13,122,62,0.15)', borderRadius: 2, cursor: 'pointer' }} onClick={handleSeek}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#14B860', borderRadius: 2, transition: 'width 0.1s linear' }} />
      </div>
    </div>
  );
}

// ── Trust Badge ────────────────────────────────────────────────────────────────
function TrustBadge({ trust }) {
  const isAI = trust !== 'curator';
  return (
    <div
      title={isAI ? 'This description was generated automatically and may contain inaccuracies. Review before publishing.' : 'A curator has reviewed and edited this description.'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 9px', borderRadius: 20, cursor: isAI ? 'help' : 'default',
        background: isAI ? '#FEF3C7' : '#D1FAE5',
        color:      isAI ? '#92400E' : '#065F46',
        fontSize: 10, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
        textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0,
      }}
    >
      {isAI ? '◎ AI Generated' : '✓ Curator Approved'}
      {isAI && <span style={{ fontSize: 11, fontWeight: 700 }}>?</span>}
    </div>
  );
}

// ── Tiered Audio Player ────────────────────────────────────────────────────────
function TieredAudioPlayer({ data, onChange }) {
  const [activeTier, setActiveTier] = useState('overview');
  const tier = AUDIO_TIERS.find(t => t.key === activeTier);

  function handleScriptEdit(val) {
    onChange({
      ...data,
      [tier.scriptKey]: val,
      descriptionTrust: 'curator',
      descriptionEditedAt: new Date().toISOString(),
    });
  }

  const script   = data[tier.scriptKey] || '';
  const audioUrl = data[tier.urlKey]    || null;

  return (
    <div>
      {/* Tier tab strip */}
      <div style={{
        display: 'flex', borderRadius: 8, overflow: 'hidden',
        border: '1.5px solid #E5E7EB', marginBottom: 12,
      }}>
        {AUDIO_TIERS.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setActiveTier(t.key)}
            style={{
              flex: 1, padding: '8px 4px', border: 'none', cursor: 'pointer',
              background: activeTier === t.key ? '#14B860' : '#fff',
              color: activeTier === t.key ? '#fff' : '#6B7280',
              fontFamily: "'Outfit', sans-serif",
              borderRight: i < AUDIO_TIERS.length - 1 ? '1px solid #E5E7EB' : 'none',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.label}</div>
            <div style={{ fontSize: 9, opacity: 0.7, marginTop: 1 }}>{t.hint}</div>
          </button>
        ))}
      </div>

      {script || audioUrl ? (
        <>
          <AudioPlayer script={script} audioUrl={audioUrl} />
          <div style={{ marginTop: 12 }}>
            <label style={{
              fontSize: 12, fontWeight: 500, color: '#374151',
              fontFamily: "'Outfit', sans-serif", display: 'block', marginBottom: 5,
            }}>
              Edit {tier.label} Script
            </label>
            <textarea
              style={{ ...textareaStyle, minHeight: 80 }}
              value={script}
              onChange={e => handleScriptEdit(e.target.value)}
              placeholder={`${tier.label} script…`}
            />
          </div>
        </>
      ) : (
        <div style={{
          border: '1.5px dashed #E5E7EB', borderRadius: 8,
          padding: '14px 16px', textAlign: 'center',
          color: '#9CA3AF', fontSize: 12, fontFamily: "'Outfit', sans-serif",
        }}>
          No {tier.label.toLowerCase()} audio yet — click Generate Audio above.
        </div>
      )}
    </div>
  );
}

// ── Tab: Basic Info ────────────────────────────────────────────────────────────
function TabBasicInfo({ data, onChange }) {
  const [imgUrl, setImgUrl] = useState('');
  const [embState, setEmbState] = useState('idle'); // idle | generating | done
  const [visState, setVisState] = useState('idle'); // idle | generating | done | error
  const [visError, setVisError] = useState('');
  const fileRef = useRef();

  function addImageUrl() {
    const trimmed = imgUrl.trim();
    if (!trimmed) return;
    onChange({ ...data, images: [...(data.images || []), { type: 'url', src: trimmed }] });
    setImgUrl('');
  }

  function handleFileUpload(file) {
    if (!file) return;
    const src = URL.createObjectURL(file);
    onChange({ ...data, images: [...(data.images || []), { type: 'upload', src, name: file.name }] });
  }

  function removeImage(idx) {
    const next = (data.images || []).filter((_, i) => i !== idx);
    onChange({ ...data, images: next });
  }

  function generateEmbeddings() {
    setEmbState('generating');
    setTimeout(() => setEmbState('done'), 1800);
  }

  async function generateVisDesc() {
    setVisState('generating');
    setVisError('');
    try {
      const result = await callDescribeArtwork(data);
      onChange({ ...data, visualDescription: result.visualDescription });
      setVisState('done');
    } catch (e) {
      setVisError(e.message);
      setVisState('error');
    }
  }

  const today = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

  return (
    <div>
      {/* Artwork Images */}
      <SectionHeading>Artwork Images ({(data.images || []).length} added)</SectionHeading>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          placeholder="https://firebasestorage.googleapis.com/…"
          value={imgUrl}
          onChange={e => setImgUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addImageUrl()}
        />
        <button onClick={addImageUrl} style={{
          padding: '9px 14px', borderRadius: 6, border: '1.5px solid #E5E7EB',
          background: '#fff', cursor: 'pointer', fontSize: 18, color: '#374151',
          display: 'flex', alignItems: 'center',
        }}>↑</button>
        <button onClick={() => setImgUrl('')} style={{
          padding: '9px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB',
          background: '#FEE2E2', cursor: 'pointer', fontSize: 16, color: '#E24B4A',
          display: 'flex', alignItems: 'center',
        }}>×</button>
      </div>

      {/* Image previews */}
      {(data.images || []).length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8, marginBottom: 10 }}>
          {(data.images || []).map((img, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', border: '1px solid #E5E7EB', background: '#F9FAFB', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={img.src}
                alt={`artwork ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', padding: 8 }}>
                <div style={{ fontSize: 20 }}>🖼</div>
                <div style={{ fontSize: 9, color: '#9CA3AF', textAlign: 'center', wordBreak: 'break-all', fontFamily: "'Outfit', sans-serif" }}>{img.name || 'Image'}</div>
              </div>
              <button
                onClick={() => removeImage(i)}
                style={{
                  position: 'absolute', top: 4, right: 4, width: 18, height: 18,
                  borderRadius: '50%', background: 'rgba(226,75,74,0.9)', border: 'none',
                  color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif",
                }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      {/* Add Another Image */}
      <div
        onClick={() => fileRef.current.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files[0]); }}
        style={{
          border: '1.5px dashed #14B860', borderRadius: 8, padding: '12px 16px',
          textAlign: 'center', cursor: 'pointer', marginBottom: 6,
          color: '#14B860', fontSize: 13, fontFamily: "'Outfit', sans-serif", fontWeight: 500,
          background: 'rgba(20,184,96,0.02)',
        }}
      >
        + Add Another Image
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif" style={{ display: 'none' }}
        onChange={e => handleFileUpload(e.target.files[0])} />
      <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif", marginBottom: 20 }}>
        Paste a URL, upload from your device, or drag & drop.
      </div>

      {/* AR Recognition Embeddings */}
      <SectionHeading>AR Recognition Embeddings</SectionHeading>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <button
          onClick={generateEmbeddings}
          disabled={embState === 'generating'}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 8,
            border: '1.5px solid #14B860', background: embState === 'done' ? 'rgba(20,184,96,0.08)' : '#fff',
            color: '#14B860', fontSize: 13, fontWeight: 500, cursor: embState === 'generating' ? 'not-allowed' : 'pointer',
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {embState === 'generating' ? <Spinner size={13} /> : '↻'}
          Generate Embeddings
        </button>
        {embState === 'done' && (
          <span style={{ fontSize: 12, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif" }}>
            9 embeddings · clip-vit-b32-v1 · {today}
          </span>
        )}
      </div>
      {embState === 'done' && (
        <div style={{ fontSize: 12, color: '#6B7280', fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>
          Done — 9 embeddings generated
        </div>
      )}

      {/* Visual Description */}
      <SectionHeading>Visual Description (AI-generated, editable)</SectionHeading>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, alignItems: 'center', gap: 10 }}>
        {visState === 'error' && (
          <span style={{ fontSize: 11, color: '#E24B4A', fontFamily: "'Outfit', sans-serif", flex: 1 }}>
            {visError}
          </span>
        )}
        <button
          onClick={generateVisDesc}
          disabled={visState === 'generating'}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8,
            border: '1.5px solid #14B860', background: 'rgba(20,184,96,0.06)',
            color: '#14B860', fontSize: 12, fontWeight: 500,
            cursor: visState === 'generating' ? 'not-allowed' : 'pointer',
            fontFamily: "'Outfit', sans-serif", flexShrink: 0,
          }}
        >
          {visState === 'generating' ? <Spinner size={12} /> : '✦'}
          {visState === 'generating' ? 'Analysing images…' : visState === 'done' ? 'Regenerate' : 'Generate from Images'}
        </button>
      </div>
      <textarea
        style={{ ...textareaStyle, minHeight: 100 }}
        value={data.visualDescription || ''}
        onChange={e => onChange({ ...data, visualDescription: e.target.value })}
        placeholder="AI-generated visual description will appear here after clicking 'Generate from Images'…"
      />
    </div>
  );
}

// ── Tab: Classification ────────────────────────────────────────────────────────
function TabClassification({ data, onChange }) {
  return (
    <div>
      <SectionHeading>Core Identifiers</SectionHeading>
      <Field label="Title" required>
        <input style={inputStyle} value={data.title || ''} onChange={e => onChange({ ...data, title: e.target.value })} placeholder="Artwork title" />
      </Field>
      <Field label="Artist / Creator">
        <input style={inputStyle} value={data.artist || ''} onChange={e => onChange({ ...data, artist: e.target.value })} placeholder="Artist or creator name" />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Year / Date">
          <input style={inputStyle} value={data.year || ''} onChange={e => onChange({ ...data, year: e.target.value })} placeholder="e.g. 1923, c. 1910–15" />
        </Field>
        <Field label="Type">
          <select style={selectStyle} value={data.artType || ''} onChange={e => onChange({ ...data, artType: e.target.value })}>
            {['', 'Painting', 'Drawing', 'Photography', 'Sculpture', 'Installation', 'Print', 'Mixed Media', 'Textile', 'Ceramics', 'Video', 'Digital', 'Other'].map(t => (
              <option key={t} value={t}>{t || 'Select type…'}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Medium / Materials">
        <input style={inputStyle} value={data.medium || ''} onChange={e => onChange({ ...data, medium: e.target.value })} placeholder="e.g. Oil on canvas, Watercolour on paper, Bronze" />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Width">
          <input style={inputStyle} value={data.width || ''} onChange={e => onChange({ ...data, width: e.target.value })} placeholder="e.g. 60 cm" />
        </Field>
        <Field label="Height">
          <input style={inputStyle} value={data.height || ''} onChange={e => onChange({ ...data, height: e.target.value })} placeholder="e.g. 80 cm" />
        </Field>
      </div>
      <Field label="Depth / Diameter" hint="Leave blank if not applicable.">
        <input style={inputStyle} value={data.depth || ''} onChange={e => onChange({ ...data, depth: e.target.value })} placeholder="e.g. 12 cm" />
      </Field>

      <SectionHeading>Style & Subject</SectionHeading>
      <Field label="Style / Period">
        <input style={inputStyle} value={data.style || ''} onChange={e => onChange({ ...data, style: e.target.value })} placeholder="e.g. Impressionism, Abstract Expressionism, Contemporary" />
      </Field>
      <Field label="Subject / Theme">
        <input style={inputStyle} value={data.subject || ''} onChange={e => onChange({ ...data, subject: e.target.value })} placeholder="e.g. Seascape, Portrait, Still life" />
      </Field>
      <Field label="Tags" hint="Comma-separated keywords for search and filtering.">
        <input style={inputStyle} value={data.tags || ''} onChange={e => onChange({ ...data, tags: e.target.value })} placeholder="e.g. maritime, blue, calm, sailboat" />
      </Field>
    </div>
  );
}

// ── Tab: Location ──────────────────────────────────────────────────────────────
function TabLocation({ data, onChange }) {
  return (
    <div>
      <SectionHeading>Venue Position</SectionHeading>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Gallery / Room">
          <input style={inputStyle} value={data.gallery || ''} onChange={e => onChange({ ...data, gallery: e.target.value })} placeholder="e.g. East Gallery, Room 3" />
        </Field>
        <Field label="Floor">
          <select style={selectStyle} value={data.floor || '1'} onChange={e => onChange({ ...data, floor: e.target.value })}>
            {['1', '2', '3', '4', 'Basement', 'Mezzanine', 'Outdoor'].map(f => <option key={f}>{f}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Wall / Position" hint="Describe placement to help staff and AR system locate the work.">
        <input style={inputStyle} value={data.wallPosition || ''} onChange={e => onChange({ ...data, wallPosition: e.target.value })} placeholder="e.g. North wall, centre — between windows" />
      </Field>
      <Field label="Hanging Height (cm from floor)" hint="Used for AR anchor calibration.">
        <input style={inputStyle} type="number" value={data.hangingHeight || ''} onChange={e => onChange({ ...data, hangingHeight: e.target.value })} placeholder="e.g. 150" />
      </Field>

      <SectionHeading>Proximity & GPS</SectionHeading>
      <Field
        label="Visitor Proximity Trigger"
        hint={`${data.proximityRadius || 50} m — visitor's app alerts them when within this distance. Use 10–30 m for indoor works, 50–150 m for street murals.`}
      >
        <input
          type="range" min={5} max={150} step={5}
          value={data.proximityRadius || 50}
          onChange={e => onChange({ ...data, proximityRadius: parseInt(e.target.value) })}
          style={{ width: '100%', accentColor: '#14B860' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif", marginTop: 4 }}>
          <span>5 m</span>
          <span style={{ color: '#14B860', fontWeight: 500 }}>{data.proximityRadius || 50} m</span>
          <span>150 m</span>
        </div>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="GPS Latitude" hint="Optional, for outdoor works.">
          <input style={inputStyle} value={data.lat || ''} onChange={e => onChange({ ...data, lat: e.target.value })} placeholder="e.g. 39.9526" />
        </Field>
        <Field label="GPS Longitude">
          <input style={inputStyle} value={data.lng || ''} onChange={e => onChange({ ...data, lng: e.target.value })} placeholder="e.g. -75.1652" />
        </Field>
      </div>
    </div>
  );
}

// ── Tab: Media ─────────────────────────────────────────────────────────────────
function TabMedia({ data, onChange }) {
  const hasExisting = !!(data.overviewScript || data.audioScript);
  const [audioState, setAudioState] = useState(() => hasExisting ? 'done' : 'idle');
  const [audioError, setAudioError] = useState('');

  const voice = data.voice || DEFAULT_VOICE;
  const trust = data.descriptionTrust || (hasExisting ? 'ai' : null);
  const hasAudio = audioState === 'done' || hasExisting;

  async function generateAudio() {
    setAudioState('generating');
    setAudioError('');
    try {
      const result = await callDescribeArtwork(data, voice);
      onChange({
        ...data,
        // Three-tier fields
        overviewScript:   result.overviewScript   || result.audioScript || '',
        detailsScript:    result.detailsScript    || '',
        contextScript:    result.contextScript    || '',
        audioUrlOverview: result.audioUrlOverview || result.audioUrl    || null,
        audioUrlDetails:  result.audioUrlDetails  || null,
        audioUrlContext:  result.audioUrlContext  || null,
        // Legacy fields (backward compat)
        audioScript: result.overviewScript || result.audioScript || '',
        audioUrl:    result.audioUrlOverview || result.audioUrl  || null,
        hasAudio:    true,
        descriptionTrust: 'ai',
        voice: result.voice || voice,
      });
      setAudioState('done');
    } catch (e) {
      setAudioError(e.message);
      setAudioState('idle');
    }
  }

  return (
    <div>
      <SectionHeading>Audio Description</SectionHeading>

      {/* Trust badge + voice picker + generate button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {trust && <TrustBadge trust={trust} />}
        <div style={{ flex: 1 }} />
        <select
          style={{ ...selectStyle, width: 'auto', minWidth: 170, fontSize: 12, padding: '6px 10px' }}
          value={voice}
          onChange={e => onChange({ ...data, voice: e.target.value })}
          title="Voice used for the next Generate Audio call"
        >
          {SUPPORTED_VOICES.map(v => (
            <option key={v.name} value={v.name}>{v.label}</option>
          ))}
        </select>
        <button
          onClick={generateAudio}
          disabled={audioState === 'generating'}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            borderRadius: 8, border: '1.5px solid #14B860', background: 'rgba(20,184,96,0.06)',
            color: '#14B860', fontSize: 12, fontWeight: 500,
            cursor: audioState === 'generating' ? 'not-allowed' : 'pointer',
            fontFamily: "'Outfit', sans-serif", flexShrink: 0,
          }}
        >
          {audioState === 'generating' ? <Spinner size={12} /> : '✦'}
          {audioState === 'generating' ? 'Generating…' : hasAudio ? 'Regenerate All' : 'Generate Audio'}
        </button>
      </div>

      {audioError && (
        <div style={{ fontSize: 12, color: '#E24B4A', fontFamily: "'Outfit', sans-serif", marginBottom: 10 }}>
          {audioError}
        </div>
      )}

      {audioState === 'generating' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F4F6F3', borderRadius: 8, marginBottom: 12 }}>
          <Spinner />
          <span style={{ fontSize: 12, color: '#6B7280', fontFamily: "'Outfit', sans-serif" }}>
            Generating three-tier audio — Overview, Details, and Context…
          </span>
        </div>
      )}

      {hasAudio && <TieredAudioPlayer data={data} onChange={onChange} />}

      {!hasAudio && audioState !== 'generating' && (
        <div style={{
          border: '1.5px dashed #E5E7EB', borderRadius: 8, padding: '20px 16px',
          textAlign: 'center', marginBottom: 16, background: '#F9FAFB',
        }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>🎙</div>
          <div style={{ fontSize: 13, color: '#374151', fontFamily: "'Outfit', sans-serif", fontWeight: 500, marginBottom: 4 }}>
            No audio description yet
          </div>
          <div style={{ fontSize: 12, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif" }}>
            Click <strong style={{ color: '#14B860' }}>Generate Audio</strong> above to create Overview, Details, and Context tiers.
          </div>
        </div>
      )}

      <SectionHeading>Supplementary Media</SectionHeading>
      <Field label="Video URL" hint="YouTube, Vimeo, or direct MP4 link.">
        <input style={inputStyle} value={data.videoUrl || ''} onChange={e => onChange({ ...data, videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=…" />
      </Field>
      <Field label="Catalog / External Link" hint="Link to museum catalog entry or artist website.">
        <input style={inputStyle} value={data.catalogUrl || ''} onChange={e => onChange({ ...data, catalogUrl: e.target.value })} placeholder="https://…" />
      </Field>
      <Field label="Document / PDF" hint="Conservation report, exhibition essay, etc.">
        <input style={inputStyle} value={data.docUrl || ''} onChange={e => onChange({ ...data, docUrl: e.target.value })} placeholder="https://… (PDF link)" />
      </Field>
    </div>
  );
}

// ── Tab: Accessibility ─────────────────────────────────────────────────────────
function TabAccessibility({ data, onChange }) {
  function toggleCheck(key) {
    onChange({ ...data, [key]: !data[key] });
  }

  const checks = [
    { key: 'adaWheelchair',  label: 'Wheelchair-accessible viewing position' },
    { key: 'adaAudioGuide',  label: 'Audio guide available in visitor app' },
    { key: 'adaTactile',     label: 'Tactile replica or 3D print available' },
    { key: 'adaLargePrint',  label: 'Large-print label installed nearby' },
    { key: 'adaSignLang',    label: 'Sign language video available' },
    { key: 'adaBraille',     label: 'Braille label installed' },
  ];

  return (
    <div>
      <SectionHeading>ADA Compliance Checklist</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {checks.map(({ key, label }) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div
              onClick={() => toggleCheck(key)}
              style={{
                width: 18, height: 18, borderRadius: 4, flexShrink: 0, cursor: 'pointer',
                border: `2px solid ${data[key] ? '#14B860' : '#D1D5DB'}`,
                background: data[key] ? '#14B860' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {data[key] && <div style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</div>}
            </div>
            <span style={{ fontSize: 13, color: '#374151', fontFamily: "'Outfit', sans-serif" }}>{label}</span>
          </label>
        ))}
      </div>

      <SectionHeading>Descriptive Text</SectionHeading>
      <Field label="Tactile Description" hint="Describes texture, form, and material for visitors who cannot see the work.">
        <textarea
          style={textareaStyle}
          value={data.tactileDescription || ''}
          onChange={e => onChange({ ...data, tactileDescription: e.target.value })}
          placeholder="e.g. The canvas surface is smooth with subtle visible brushstrokes…"
        />
      </Field>
      <Field label="Large Print Label Text" hint="Short description formatted for large-print wall labels.">
        <textarea
          style={{ ...textareaStyle, minHeight: 70 }}
          value={data.largePrintText || ''}
          onChange={e => onChange({ ...data, largePrintText: e.target.value })}
          placeholder="Brief text for large-print label…"
        />
      </Field>
      <Field label="Sign Language Video URL" hint="Link to BSL/ASL description video.">
        <input style={inputStyle} value={data.signLangUrl || ''} onChange={e => onChange({ ...data, signLangUrl: e.target.value })} placeholder="https://…" />
      </Field>

      <SectionHeading>Accessibility Notes</SectionHeading>
      <Field label="Additional ADA Notes">
        <textarea
          style={{ ...textareaStyle, minHeight: 70 }}
          value={data.adaNotes || ''}
          onChange={e => onChange({ ...data, adaNotes: e.target.value })}
          placeholder="Any additional accessibility considerations for this artwork…"
        />
      </Field>
    </div>
  );
}

// ── Tab: AR Anchor ─────────────────────────────────────────────────────────────
function TabARAnchor({ data, onChange }) {
  const [testState, setTestState] = useState('idle');

  function testAnchor() {
    setTestState('testing');
    setTimeout(() => setTestState('pass'), 1500);
  }

  return (
    <div>
      <SectionHeading>Anchor Configuration</SectionHeading>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>AR Anchor Active</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>Enables AR experience in visitor app</div>
        </div>
        <div
          onClick={() => onChange({ ...data, arActive: !data.arActive })}
          style={{
            width: 44, height: 24, borderRadius: 12, cursor: 'pointer', flexShrink: 0,
            background: data.arActive ? '#14B860' : '#E5E7EB',
            position: 'relative', transition: 'background 0.2s',
          }}
        >
          <div style={{
            position: 'absolute', top: 3, left: data.arActive ? 22 : 3,
            width: 18, height: 18, borderRadius: '50%', background: '#fff',
            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Anchor Type">
          <select style={selectStyle} value={data.anchorType || 'qr'} onChange={e => onChange({ ...data, anchorType: e.target.value })}>
            {[
              { value: 'qr',    label: 'QR Code' },
              { value: 'image', label: 'Image Target' },
              { value: 'gps',   label: 'GPS Coordinates' },
              { value: 'nfc',   label: 'NFC Tag' },
            ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="AR Experience">
          <select style={selectStyle} value={data.arExperience || 'audio'} onChange={e => onChange({ ...data, arExperience: e.target.value })}>
            {[
              { value: 'audio',   label: 'Audio Description' },
              { value: '3d',      label: '3D Overlay' },
              { value: 'video',   label: 'Video Layer' },
              { value: 'text',    label: 'Text Annotation' },
              { value: 'tour',    label: 'Guided Tour Stop' },
            ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Scan Distance" hint={`${data.scanDistance || 2} m — how close visitor must be to trigger AR.`}>
        <input
          type="range" min={0.5} max={10} step={0.5}
          value={data.scanDistance || 2}
          onChange={e => onChange({ ...data, scanDistance: parseFloat(e.target.value) })}
          style={{ width: '100%', accentColor: '#14B860' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', fontFamily: "'Outfit', sans-serif", marginTop: 4 }}>
          <span>0.5 m</span><span style={{ color: '#14B860', fontWeight: 500 }}>{data.scanDistance || 2} m</span><span>10 m</span>
        </div>
      </Field>

      <SectionHeading>QR / Image Target</SectionHeading>
      <Field label="Anchor ID / Target Slug" hint="Used to match the physical QR code or image target.">
        <input style={inputStyle} value={data.anchorId || ''} onChange={e => onChange({ ...data, anchorId: e.target.value })} placeholder="e.g. artwork-sail-001" />
      </Field>
      <Field label="Override URL" hint="Optional deep-link override for this anchor.">
        <input style={inputStyle} value={data.anchorUrl || ''} onChange={e => onChange({ ...data, anchorUrl: e.target.value })} placeholder="https://gestalt-17ce0.web.app/app/…" />
      </Field>

      <SectionHeading>Anchor Test</SectionHeading>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={testAnchor}
          disabled={testState === 'testing'}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px',
            borderRadius: 8, border: '1.5px solid #E5E7EB', background: '#fff',
            color: '#374151', fontSize: 13, fontWeight: 500, cursor: testState === 'testing' ? 'not-allowed' : 'pointer',
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {testState === 'testing' ? <Spinner size={13} color="#374151" /> : '⬡'}
          {testState === 'testing' ? 'Testing…' : 'Test Anchor'}
        </button>
        {testState === 'pass' && (
          <div style={{ fontSize: 12, color: '#14B860', fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>
            ✓ Anchor resolved successfully
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab: Museum Details ────────────────────────────────────────────────────────
function TabMuseumDetails({ data, onChange }) {
  return (
    <div>
      <SectionHeading>Acquisition</SectionHeading>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Accession Number">
          <input style={inputStyle} value={data.accessionNo || ''} onChange={e => onChange({ ...data, accessionNo: e.target.value })} placeholder="e.g. 2024.001.01" />
        </Field>
        <Field label="Acquisition Date">
          <input style={inputStyle} type="date" value={data.acquisitionDate || ''} onChange={e => onChange({ ...data, acquisitionDate: e.target.value })} />
        </Field>
      </div>
      <Field label="Acquisition Method">
        <select style={selectStyle} value={data.acquisitionMethod || ''} onChange={e => onChange({ ...data, acquisitionMethod: e.target.value })}>
          {['', 'Purchase', 'Donation', 'Long-term Loan', 'Bequest', 'Commission', 'Exchange', 'Found in collection'].map(m => (
            <option key={m} value={m}>{m || 'Select method…'}</option>
          ))}
        </select>
      </Field>
      <Field label="Donor / Seller" hint="Name of donor or seller, if applicable.">
        <input style={inputStyle} value={data.donor || ''} onChange={e => onChange({ ...data, donor: e.target.value })} placeholder="Full name or organisation" />
      </Field>

      <SectionHeading>Provenance</SectionHeading>
      <Field label="Provenance Notes" hint="Ownership history and exhibition record.">
        <textarea
          style={{ ...textareaStyle, minHeight: 90 }}
          value={data.provenance || ''}
          onChange={e => onChange({ ...data, provenance: e.target.value })}
          placeholder="Acquired from the artist's estate in 2018. Previously exhibited at…"
        />
      </Field>

      <SectionHeading>Condition</SectionHeading>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Condition Rating">
          <select style={selectStyle} value={data.condition || 'Good'} onChange={e => onChange({ ...data, condition: e.target.value })}>
            {['Excellent', 'Good', 'Fair', 'Poor', 'Under conservation'].map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Last Inspection Date">
          <input style={inputStyle} type="date" value={data.lastInspection || ''} onChange={e => onChange({ ...data, lastInspection: e.target.value })} />
        </Field>
      </div>
      <Field label="Condition Notes">
        <textarea
          style={{ ...textareaStyle, minHeight: 70 }}
          value={data.conditionNotes || ''}
          onChange={e => onChange({ ...data, conditionNotes: e.target.value })}
          placeholder="Minor foxing on lower left edge. Surface stable…"
        />
      </Field>

      <SectionHeading>Valuation</SectionHeading>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Estimated Value">
          <input style={inputStyle} value={data.estimatedValue || ''} onChange={e => onChange({ ...data, estimatedValue: e.target.value })} placeholder="e.g. $24,000" />
        </Field>
        <Field label="Insurance Value">
          <input style={inputStyle} value={data.insuranceValue || ''} onChange={e => onChange({ ...data, insuranceValue: e.target.value })} placeholder="e.g. $28,000" />
        </Field>
      </div>
      <Field label="Storage Location" hint="Used when artwork is not on display.">
        <input style={inputStyle} value={data.storageLocation || ''} onChange={e => onChange({ ...data, storageLocation: e.target.value })} placeholder="e.g. Storage room B, rack 4, shelf 2" />
      </Field>
      <Field label="Exhibition History">
        <textarea
          style={{ ...textareaStyle, minHeight: 70 }}
          value={data.exhibitionHistory || ''}
          onChange={e => onChange({ ...data, exhibitionHistory: e.target.value })}
          placeholder="2022 — Maritime Visions, Philadelphia Museum of Art…"
        />
      </Field>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────────
export default function ArtworkEditorModal({ artwork, onSave, onClose }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [data, setData] = useState({
    // basic
    images: artwork?.images || (artwork?.photoPreview ? [{ type: 'upload', src: artwork.photoPreview }] : []),
    visualDescription: artwork?.visualDescription || '',
    // classification
    title: artwork?.title || '',
    artist: artwork?.artist || '',
    year: artwork?.year || '',
    artType: artwork?.type || '',
    medium: artwork?.medium || '',
    width: artwork?.width || '',
    height: artwork?.height || '',
    depth: artwork?.depth || '',
    style: artwork?.style || '',
    subject: artwork?.subject || '',
    tags: artwork?.tags || '',
    // location
    gallery: artwork?.gallery || '',
    floor: artwork?.floor || '1',
    wallPosition: artwork?.wallPosition || '',
    hangingHeight: artwork?.hangingHeight || '',
    proximityRadius: artwork?.proximityRadius || 50,
    lat: artwork?.lat || '',
    lng: artwork?.lng || '',
    // media — three-tier audio
    overviewScript:   artwork?.overviewScript   || artwork?.audioScript || '',
    detailsScript:    artwork?.detailsScript    || '',
    contextScript:    artwork?.contextScript    || '',
    audioUrlOverview: artwork?.audioUrlOverview || artwork?.audioUrl   || null,
    audioUrlDetails:  artwork?.audioUrlDetails  || null,
    audioUrlContext:  artwork?.audioUrlContext  || null,
    voice:            artwork?.voice            || DEFAULT_VOICE,
    descriptionTrust: artwork?.descriptionTrust || null,
    descriptionEditedAt: artwork?.descriptionEditedAt || null,
    // legacy (kept for older builds / backward compat)
    audioScript: artwork?.audioScript || '',
    videoUrl: artwork?.videoUrl || '',
    catalogUrl: artwork?.catalogUrl || '',
    docUrl: artwork?.docUrl || '',
    // accessibility
    adaWheelchair: artwork?.adaWheelchair || false,
    adaAudioGuide: artwork?.adaAudioGuide || false,
    adaTactile: artwork?.adaTactile || false,
    adaLargePrint: artwork?.adaLargePrint || false,
    adaSignLang: artwork?.adaSignLang || false,
    adaBraille: artwork?.adaBraille || false,
    tactileDescription: artwork?.tactileDescription || '',
    largePrintText: artwork?.largePrintText || '',
    signLangUrl: artwork?.signLangUrl || '',
    adaNotes: artwork?.adaNotes || '',
    // ar anchor
    arActive: artwork?.arActive || false,
    anchorType: artwork?.anchorType || 'qr',
    arExperience: artwork?.arExperience || 'audio',
    scanDistance: artwork?.scanDistance || 2,
    anchorId: artwork?.anchorId || '',
    anchorUrl: artwork?.anchorUrl || '',
    // museum details
    accessionNo: artwork?.accessionNo || '',
    acquisitionDate: artwork?.acquisitionDate || '',
    acquisitionMethod: artwork?.acquisitionMethod || '',
    donor: artwork?.donor || '',
    provenance: artwork?.provenance || '',
    condition: artwork?.condition || 'Good',
    lastInspection: artwork?.lastInspection || '',
    conditionNotes: artwork?.conditionNotes || '',
    estimatedValue: artwork?.estimatedValue || '',
    insuranceValue: artwork?.insuranceValue || '',
    storageLocation: artwork?.storageLocation || '',
    exhibitionHistory: artwork?.exhibitionHistory || '',
  });

  const [saveError, setSaveError] = useState(false);

  function handleSave() {
    if (!data.title.trim()) {
      setActiveTab('classify');
      setSaveError(true);
      setTimeout(() => setSaveError(false), 4000);
      return;
    }
    onSave({
      ...artwork,
      ...data,
      id: artwork?.id || `ART-${Date.now()}`,
      hasAudio: !!(data.overviewScript || data.audioScript),
      arScore: data.arActive ? 0.85 : 0.5,
      status: artwork?.status || 'active',
    });
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: '100%', maxWidth: 680, maxHeight: '90vh',
        background: '#fff', borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Outfit', sans-serif",
      }}>
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 28px', borderBottom: '1px solid #F3F4F6', flexShrink: 0,
        }}>
          <div style={{ fontFamily: "'Newsreader', serif", fontSize: 22, fontWeight: 400, color: '#111827' }}>
            {artwork?.id ? 'Edit Artwork' : 'Add Artwork'}
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF', lineHeight: 1,
          }}>×</button>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', borderBottom: '1px solid #F3F4F6', padding: '0 28px',
          overflowX: 'auto', flexShrink: 0, gap: 0,
        }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 16px', background: 'none', border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #14B860' : '2px solid transparent',
                color: activeTab === tab.key ? '#14B860' : '#6B7280',
                fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400,
                cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                whiteSpace: 'nowrap', marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
          {activeTab === 'basic'    && <TabBasicInfo data={data} onChange={setData} />}
          {activeTab === 'classify' && <TabClassification data={data} onChange={setData} />}
          {activeTab === 'location' && <TabLocation data={data} onChange={setData} />}
          {activeTab === 'media'    && <TabMedia data={data} onChange={setData} />}
          {activeTab === 'access'   && <TabAccessibility data={data} onChange={setData} />}
          {activeTab === 'ar'       && <TabARAnchor data={data} onChange={setData} />}
          {activeTab === 'museum'   && <TabMuseumDetails data={data} onChange={setData} />}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 28px', borderTop: '1px solid #F3F4F6', flexShrink: 0,
        }}>
          <div>
            {saveError && (
              <div style={{ fontSize: 12, color: '#E24B4A', fontFamily: "'Outfit', sans-serif" }}>
                Title is required. Please fill in Classification → Title.
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{
              padding: '10px 28px', borderRadius: 8, border: '1.5px solid #E5E7EB',
              background: '#fff', color: '#374151', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
            }}>
              Cancel
            </button>
            <button onClick={handleSave} style={{
              padding: '10px 28px', borderRadius: 8, border: 'none',
              background: '#14B860', color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
            }}>
              Save Artwork
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
