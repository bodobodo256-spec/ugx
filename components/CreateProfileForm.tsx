'use client';

import React, { useState, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LOCATIONS } from '@/data/locations';
import { type Profile } from '@/db/schema';
import { adminCreateProfile } from '@/app/actions/profiles';
import { compressImage } from '@/lib/image-compress';

interface CreateProfileFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export default function CreateProfileForm({ onSuccess, onCancel, isModal = false }: CreateProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local form state with sensible defaults for quick creation
  const [name, setName] = useState('');
  const [age, setAge] = useState(22);
  const [city, setCity] = useState('Kampala');
  const [location, setLocation] = useState('Kololo, Kampala');
  const [tier, setTier] = useState<Profile['tier']>('VIP');
  const [phone, setPhone] = useState('+256');
  const [whatsapp, setWhatsapp] = useState('256');
  const [about, setAbout] = useState('Sweet, friendly and discreet escort. Available for private hookups and intimate companionship.');
  const [photoUrl, setPhotoUrl] = useState('');
  const [status, setStatus] = useState<Profile['status']>('online');
  const [picsCount, setPicsCount] = useState(1);

  // Modern switches
  const [isApproved, setIsApproved] = useState(true);
  const [isVerified, setIsVerified] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [isArchived, setIsArchived] = useState(false);

  // Payment
  const [paymentStatus, setPaymentStatus] = useState<Profile['paymentStatus']>('verified');
  const [paymentAmount, setPaymentAmount] = useState(25000);
  const [paymentRef, setPaymentRef] = useState('');

  // File upload preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('/logo.png');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gallery state
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]);

  // Video state
  const [newVideoFiles, setNewVideoFiles] = useState<File[]>([]);

  // Notification state
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const handleTierChange = (newTier: Profile['tier']) => {
    setTier(newTier);
    if (newTier === 'VIP') {
      setPaymentAmount(25000);
    } else if (newTier === 'Standard') {
      setPaymentAmount(10000);
    } else if (newTier === 'Premium') {
      setPaymentAmount(50000);
      setIsPremium(true);
    } else if (newTier === 'VIP Spa') {
      setPaymentAmount(35000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const optimized = await compressImage(file);
      setSelectedFile(optimized);
      const objectUrl = URL.createObjectURL(optimized);
      setPreviewImage(objectUrl);
    }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const optimizedFiles: File[] = [];
    for (const f of files) {
      optimizedFiles.push(await compressImage(f));
    }

    setNewGalleryFiles((prev) => [...prev, ...optimizedFiles]);
    const previews = optimizedFiles.map((f) => URL.createObjectURL(f));
    setNewGalleryPreviews((prev) => [...prev, ...previews]);
    setPicsCount((prev) => prev + optimizedFiles.length);
  };

  const removeNewGallery = (idx: number) => {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
    setPicsCount((prev) => Math.max(1, prev - 1));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const MAX_VIDEO_SIZE = 4.5 * 1024 * 1024; // 4.5MB Vercel limit
    const validFiles: File[] = [];

    for (const f of files) {
      if (f.size > MAX_VIDEO_SIZE) {
        showToast(`⚠️ "${f.name}" is ${(f.size / 1024 / 1024).toFixed(1)}MB. Max video upload size is 4.5MB.`, true);
      } else {
        validFiles.push(f);
      }
    }

    if (validFiles.length) {
      setNewVideoFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeNewVideo = (idx: number) => {
    setNewVideoFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!name.trim()) {
      showToast('⚠️ Please enter a model name / alias.', true);
      return;
    }

    // Guarantee fields are accurately reflected
    formData.set('name', name.trim());
    formData.set('age', String(age));
    formData.set('city', city);
    formData.set('location', location.trim());
    formData.set('tier', tier);
    formData.set('phone', phone.trim());
    formData.set('whatsapp', whatsapp.trim());
    formData.set('about', about.trim());
    formData.set('photoUrl', photoUrl.trim());
    formData.set('status', status);
    formData.set('picsCount', String(picsCount));
    formData.set('isApproved', isApproved ? 'true' : 'false');
    formData.set('isVerified', isVerified ? 'true' : 'false');
    formData.set('isPremium', isPremium ? 'true' : 'false');
    formData.set('isNew', isNew ? 'true' : 'false');
    formData.set('isArchived', isArchived ? 'true' : 'false');
    formData.set('paymentStatus', paymentStatus ?? 'verified');
    formData.set('paymentAmount', String(paymentAmount));
    formData.set('paymentRef', paymentRef.trim());

    if (selectedFile) {
      formData.set('photo', selectedFile);
    }

    // Gallery & videos
    newGalleryFiles.forEach((f) => formData.append('gallery', f));
    newVideoFiles.forEach((f) => formData.append('videos', f));

    startTransition(async () => {
      try {
        const adminKey = typeof window !== 'undefined' ? (localStorage.getItem('ug_admin_key') || '') : '';
        const response = await fetch('/api/admin/profile', {
          method: 'POST',
          headers: { 'x-admin-passkey': adminKey },
          body: formData,
        });

        if (response.ok) {
          const res = await response.json();
          if (res.success) {
            showToast(`✅ Profile for ${name} created successfully in Cloudflare D1!`);
            if (onSuccess) {
              onSuccess();
            } else {
              setTimeout(() => {
                router.push('/admin');
                router.refresh();
              }, 1200);
            }
            return;
          } else {
            showToast(`❌ Create failed: ${res.error || 'Unknown error'}`, true);
            return;
          }
        }

        // Fallback to direct Server Action
        const res = await adminCreateProfile(formData);
        if (res.success) {
          showToast(`✅ Profile for ${name} created successfully in Cloudflare D1!`);
          if (onSuccess) {
            onSuccess();
          } else {
            setTimeout(() => {
              router.push('/admin');
              router.refresh();
            }, 1200);
          }
        } else {
          const err = 'error' in res ? res.error : 'Failed to create profile';
          showToast(`❌ Create failed: ${err}`, true);
        }
      } catch (err: any) {
        console.error('Create error:', err);
        showToast(`❌ Create error: ${err?.message || 'Network error occurred while saving.'}`, true);
      }
    });
  };

  return (
    <div className="edit-page-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`edit-toast ${toast.isError ? 'edit-toast-error' : 'edit-toast-success'}`}>
          {toast.message}
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="edit-top-nav">
        {onCancel ? (
          <button type="button" onClick={onCancel} className="edit-back-btn">
            <span>←</span> Back to Dashboard
          </button>
        ) : (
          <Link href="/admin" className="edit-back-btn">
            <span>←</span> Back to Dashboard
          </Link>
        )}
        <div className="edit-breadcrumbs">
          <img
            src="/logo.png"
            alt="Uganda Sexy Babes"
            style={{ width: '22px', height: '22px', marginRight: '8px', verticalAlign: 'middle', display: 'inline-block' }}
          />
          <Link href="/admin">Admin</Link>
          <span>/</span>
          <span>Profiles</span>
          <span>/</span>
          <span className="current">➕ Add New Profile</span>
        </div>
        <div className="edit-top-actions">
          <span style={{ fontSize: '0.85rem', color: '#FFD600', fontWeight: 600 }}>
            ✨ New Profile Mode
          </span>
        </div>
      </div>

      {/* Hero Profile Overview Card (Live Preview) */}
      <div className="edit-hero-card">
        <div className="edit-hero-avatar-wrapper">
          <div className="edit-hero-avatar">
            {previewImage && previewImage !== '/logo.png' ? (
              <img
                src={previewImage}
                alt={name || 'New Profile'}
                className="edit-avatar-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            ) : (
              <div className="edit-avatar-placeholder">{name ? name.charAt(0).toUpperCase() : '➕'}</div>
            )}
            <span
              className={`edit-status-indicator ${status === 'online' ? 'status-online' : 'status-recent'}`}
              title={status === 'online' ? 'Online Now' : 'Recently Active'}
            />
          </div>
        </div>

        <div className="edit-hero-info">
          <div className="edit-hero-name-row">
            <h1 className="edit-hero-title">{name || 'New Profile Name'}</h1>
            <span className="edit-id-badge">ID #New</span>
            <span className={`edit-tier-pill tier-${tier.toLowerCase().replace(/\s+/g, '-')}`}>
              {tier}
            </span>
            {isApproved ? (
              <span className="edit-badge-live">🟢 Live</span>
            ) : (
              <span className="edit-badge-pending">🟡 Pending Review</span>
            )}
            {isVerified && <span className="edit-badge-verified">🛡️ Verified</span>}
            {isPremium && <span className="edit-badge-premium">💎 Premium</span>}
            {isNew && <span className="edit-badge-new">🆕 New</span>}
            {isArchived && <span className="edit-badge-archived">📦 Archived</span>}
          </div>

          <p className="edit-hero-subtitle">
            📍 {location ? `${location}, ${city}` : city} • Age: {age} • Phone: {phone}
          </p>
        </div>

        <div className="edit-hero-quick-meta">
          <div className="quick-meta-box">
            <span className="quick-meta-label">Payment</span>
            <span className={`quick-meta-value payment-${paymentStatus}`}>
              {paymentStatus === 'verified' ? '🟢 Paid' : paymentStatus === 'pending' ? '🟡 Pending' : '🔴 Unpaid'}
            </span>
          </div>
          <div className="quick-meta-box">
            <span className="quick-meta-label">Status</span>
            <span className="quick-meta-value" style={{ color: '#00E676' }}>
              ✨ Creating New
            </span>
          </div>
        </div>
      </div>

      {/* Main Form Layout (2 Columns) */}
      <form onSubmit={handleSubmit} className="edit-form-layout">
        <div className="edit-columns">
          {/* Left Column: Core Data */}
          <div className="edit-col-main">
            {/* Section 1: Identity & Location */}
            <div className="edit-card">
              <div className="edit-card-header">
                <span className="edit-card-icon">👤</span>
                <div>
                  <h2 className="edit-card-title">Identity &amp; Location</h2>
                  <p className="edit-card-desc">Personal profile details and primary city location</p>
                </div>
              </div>

              <div className="edit-grid-2">
                <div className="edit-field">
                  <label className="edit-label">
                    Full / Display Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="edit-input"
                    placeholder="e.g. Angel, Brenda, Natasha"
                  />
                  <span className="edit-hint">Name displayed on public search, cards and banner</span>
                </div>

                <div className="edit-field">
                  <label className="edit-label">
                    Age <span className="req">*</span> (18 - 65)
                  </label>
                  <input
                    type="number"
                    name="age"
                    min="18"
                    max="65"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value, 10) || 18)}
                    required
                    className="edit-input"
                  />
                  <span className="edit-hint">Must be 18+ for adult directory compliance</span>
                </div>
              </div>

              <div className="edit-grid-2" style={{ marginTop: '1.25rem' }}>
                <div className="edit-field">
                  <label className="edit-label">
                    City <span className="req">*</span>
                  </label>
                  <select
                    name="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="edit-select"
                  >
                    {LOCATIONS.map((l) => (
                      <option key={l.slug} value={l.name}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <span className="edit-hint">Primary city for SEO landing pages and filters</span>
                </div>

                <div className="edit-field">
                  <label className="edit-label">
                    Specific Suburb / Area <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="edit-input"
                    placeholder="e.g. Kololo, Ntinda, Kabalagala"
                  />
                  <span className="edit-hint">Neighborhood or street for local search queries</span>
                </div>
              </div>

              <div className="edit-field" style={{ marginTop: '1.25rem' }}>
                <label className="edit-label">
                  Bio &amp; Services Description
                  <span className="char-count">{about.length} characters</span>
                </label>
                <textarea
                  name="about"
                  rows={4}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="edit-textarea"
                  placeholder="Describe services, availability, preferences, massage packages, and outcall/incall arrangements..."
                />
                <span className="edit-hint">
                  A detailed bio with verified details receives 3x more WhatsApp calls.
                </span>
              </div>
            </div>

            {/* Section 2: Contact Channels */}
            <div className="edit-card">
              <div className="edit-card-header">
                <span className="edit-card-icon">📞</span>
                <div>
                  <h2 className="edit-card-title">Contact &amp; Messaging</h2>
                  <p className="edit-card-desc">Direct phone call and WhatsApp channels for clients</p>
                </div>
              </div>

              <div className="edit-grid-2">
                <div className="edit-field">
                  <label className="edit-label">
                    Direct Phone Number <span className="req">*</span>
                  </label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">📞</span>
                    <input
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="edit-input has-prefix"
                      placeholder="e.g. 0770000000 or +25677..."
                    />
                  </div>
                  <span className="edit-hint">Phone number dialed on &quot;Call&quot; button tap</span>
                </div>

                <div className="edit-field">
                  <label className="edit-label">
                    WhatsApp Number <span className="req">*</span>
                  </label>
                  <div className="input-with-prefix">
                    <span className="input-prefix prefix-whatsapp">💬</span>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      required
                      className="edit-input has-prefix"
                      placeholder="e.g. 256700000000"
                    />
                  </div>
                  <span className="edit-hint">Direct chat opened on &quot;WhatsApp&quot; button tap</span>
                </div>
              </div>
            </div>

            {/* Section 3: Billing & Payment Verification */}
            <div className="edit-card">
              <div className="edit-card-header">
                <span className="edit-card-icon">💳</span>
                <div>
                  <h2 className="edit-card-title">Billing &amp; Weekly Payment</h2>
                  <p className="edit-card-desc">Track subscription fees, mobile money reference and tier status</p>
                </div>
              </div>

              <div className="edit-grid-3">
                <div className="edit-field">
                  <label className="edit-label">Payment Status</label>
                  <select
                    name="paymentStatus"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="edit-select"
                  >
                    <option value="verified">Verified (Paid) 🟢</option>
                    <option value="pending">Pending 🟡</option>
                    <option value="unpaid">Unpaid 🔴</option>
                    <option value="failed">Failed ❌</option>
                  </select>
                </div>

                <div className="edit-field">
                  <label className="edit-label">Weekly Fee (UGX)</label>
                  <input
                    type="number"
                    name="paymentAmount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseInt(e.target.value, 10) || 0)}
                    className="edit-input"
                  />
                  <div className="quick-presets">
                    <button type="button" onClick={() => setPaymentAmount(10000)} className="preset-btn">
                      10k
                    </button>
                    <button type="button" onClick={() => setPaymentAmount(25000)} className="preset-btn">
                      25k (VIP)
                    </button>
                    <button type="button" onClick={() => setPaymentAmount(50000)} className="preset-btn">
                      50k
                    </button>
                  </div>
                </div>

                <div className="edit-field">
                  <label className="edit-label">Payment Tx Reference</label>
                  <input
                    type="text"
                    name="paymentRef"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="edit-input"
                    placeholder="Sender phone / Tx ID"
                  />
                  <span className="edit-hint">MoMo / Airtel Money Tx confirmation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Media & Badges */}
          <div className="edit-col-sidebar">
            {/* Section 4: Photo & Media (Cloudflare R2) */}
            <div className="edit-card">
              <div className="edit-card-header">
                <span className="edit-card-icon">📸</span>
                <div>
                  <h2 className="edit-card-title">Profile Photo</h2>
                  <p className="edit-card-desc">Uploaded to Cloudflare R2 bucket</p>
                </div>
              </div>

              {/* Photo Preview Box */}
              <div className="edit-photo-preview-box">
                <img
                  src={previewImage}
                  alt="Profile Preview"
                  className="preview-img-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </div>

              <div className="edit-field" style={{ marginTop: '1rem' }}>
                <label className="edit-label">Upload Photo to R2</label>
                <input
                  type="file"
                  name="photo"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="edit-file-input"
                />
                <span className="edit-hint">JPEG, PNG or WebP up to 10MB</span>
              </div>

              <div className="edit-field" style={{ marginTop: '1rem' }}>
                <label className="edit-label">Or Custom Image URL</label>
                <input
                  type="url"
                  name="photoUrl"
                  value={photoUrl}
                  onChange={(e) => {
                    setPhotoUrl(e.target.value);
                    if (e.target.value.startsWith('http')) {
                      setPreviewImage(e.target.value);
                    }
                  }}
                  className="edit-input"
                  placeholder="https://..."
                />
                <span className="edit-hint">Direct link from R2 or external CDN</span>
              </div>

              <div className="edit-field" style={{ marginTop: '1rem' }}>
                <label className="edit-label">Total Gallery Photos</label>
                <input
                  type="number"
                  name="picsCount"
                  min="0"
                  max="50"
                  value={picsCount}
                  onChange={(e) => setPicsCount(parseInt(e.target.value, 10) || 0)}
                  className="edit-input"
                />
              </div>
            </div>

            {/* Section 5: Gallery Photos (R2) */}
            <div className="edit-card">
              <div className="edit-card-header">
                <span className="edit-card-icon">🖼️</span>
                <div>
                  <h2 className="edit-card-title">Gallery Photos</h2>
                  <p className="edit-card-desc">Upload multiple photos to showcase on the profile page</p>
                </div>
              </div>

              {/* New gallery previews */}
              {newGalleryPreviews.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <span className="edit-label" style={{ marginBottom: '0.6rem', display: 'block', color: '#34C759' }}>
                    New Photos to Upload ({newGalleryPreviews.length})
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
                    {newGalleryPreviews.map((url, idx) => (
                      <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1', background: '#1a1a1a', border: '2px solid #34C759' }}>
                        <img src={url} alt={`New ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => removeNewGallery(idx)}
                          title="Remove"
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(255,59,48,0.9)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '22px',
                            height: '22px',
                            color: '#fff',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="edit-field">
                <label className="edit-label">Add Gallery Photos</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                  className="edit-file-input"
                />
                <span className="edit-hint">Select multiple photos at once. JPEG, PNG, WebP up to 10MB each.</span>
              </div>
            </div>

            {/* Section 6: Videos (R2) */}
            <div className="edit-card">
              <div className="edit-card-header">
                <span className="edit-card-icon">🎬</span>
                <div>
                  <h2 className="edit-card-title">Videos</h2>
                  <p className="edit-card-desc">Upload video clips displayed on the profile page</p>
                </div>
              </div>

              {/* New video files queued */}
              {newVideoFiles.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <span className="edit-label" style={{ marginBottom: '0.6rem', display: 'block', color: '#34C759' }}>
                    New Videos to Upload ({newVideoFiles.length})
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {newVideoFiles.map((f, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#0d1f0d', borderRadius: '8px', padding: '0.6rem 0.75rem', border: '1px solid #34C759' }}>
                        <span style={{ fontSize: '1.25rem' }}>🎞️</span>
                        <span style={{ flex: 1, fontSize: '0.8rem', color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {f.name}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#888', flexShrink: 0 }}>
                          {(f.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNewVideo(idx)}
                          style={{
                            background: 'rgba(255,59,48,0.15)',
                            border: '1px solid rgba(255,59,48,0.4)',
                            borderRadius: '6px',
                            color: '#FF3B30',
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="edit-field">
                <label className="edit-label">Upload Videos</label>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoChange}
                  className="edit-file-input"
                />
                <span className="edit-hint">MP4, MOV, WebM up to 4.5MB each. Videos are streamed from R2.</span>
              </div>
            </div>

            {/* Section 7: Tier & Badges */}
            <div className="edit-card">
              <div className="edit-card-header">
                <span className="edit-card-icon">🏷️</span>
                <div>
                  <h2 className="edit-card-title">Listing &amp; Badges</h2>
                  <p className="edit-card-desc">Control visibility, tier, and trust badges</p>
                </div>
              </div>

              <div className="edit-field" style={{ marginBottom: '1.25rem' }}>
                <label className="edit-label">Membership Tier</label>
                <select
                  name="tier"
                  value={tier}
                  onChange={(e) => handleTierChange(e.target.value as any)}
                  className="edit-select"
                >
                  <option value="Standard">Standard (10,000 UGX/wk)</option>
                  <option value="VIP">VIP (25,000 UGX/wk) ⭐</option>
                  <option value="Premium">Premium 💎</option>
                  <option value="VIP Spa">VIP Spa 💆</option>
                </select>
              </div>

              <div className="edit-field" style={{ marginBottom: '1.25rem' }}>
                <label className="edit-label">Live Activity Status</label>
                <select
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="edit-select"
                >
                  <option value="online">Online Now 🟢 (Top Priority)</option>
                  <option value="recent">Recently Active ⚪</option>
                </select>
              </div>

              {/* Modern Toggle Switches */}
              <div className="toggle-list">
                {/* Approved Toggle */}
                <label className="modern-toggle">
                  <input
                    type="checkbox"
                    checked={isApproved}
                    onChange={(e) => setIsApproved(e.target.checked)}
                  />
                  <span className="toggle-slider slider-green" />
                  <span className="toggle-text">
                    <strong>Approved &amp; Live</strong>
                    <small>Visible to public website visitors immediately</small>
                  </span>
                </label>

                {/* Verified Toggle */}
                <label className="modern-toggle">
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                  />
                  <span className="toggle-slider slider-blue" />
                  <span className="toggle-text">
                    <strong>Verified ID &amp; Photos 🛡️</strong>
                    <small>Displays verified blue badge</small>
                  </span>
                </label>

                {/* Premium Toggle */}
                <label className="modern-toggle">
                  <input
                    type="checkbox"
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                  />
                  <span className="toggle-slider slider-purple" />
                  <span className="toggle-text">
                    <strong>Premium Badge 💎</strong>
                    <small>Highlights with diamond badge</small>
                  </span>
                </label>

                {/* New Badge Toggle */}
                <label className="modern-toggle">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                  />
                  <span className="toggle-slider slider-gold" />
                  <span className="toggle-text">
                    <strong>New Companion Badge 🆕</strong>
                    <small>Marks profile as newly joined</small>
                  </span>
                </label>

                {/* Archived Toggle */}
                <label className="modern-toggle">
                  <input
                    type="checkbox"
                    checked={isArchived}
                    onChange={(e) => setIsArchived(e.target.checked)}
                  />
                  <span className="toggle-slider slider-red" />
                  <span className="toggle-text">
                    <strong>Archived / Hidden 📦</strong>
                    <small>Hides profile without deleting</small>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="edit-sticky-bar">
          <div className="sticky-bar-inner">
            <div className="sticky-bar-status">
              <span className="status-dot-pulse" />
              <span>Creating New Profile • {name || 'Draft'}</span>
            </div>
            <div className="sticky-bar-actions">
              {onCancel ? (
                <button type="button" onClick={onCancel} className="sticky-btn-cancel">
                  Cancel &amp; Return
                </button>
              ) : (
                <Link href="/admin" className="sticky-btn-cancel">
                  Cancel &amp; Return
                </Link>
              )}
              <button type="submit" disabled={isPending} className="sticky-btn-save">
                {isPending ? (
                  <span className="btn-loading">
                    <span className="spinner" /> Saving to Cloudflare D1...
                  </span>
                ) : (
                  '✨ Create & Publish Profile'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
