'use client';

import React, { useState, useRef, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LOCATIONS } from '@/data/locations';
import { type Profile } from '@/db/schema';
import { adminCreateProfile } from '@/app/actions/profiles';
import { compressImage } from '@/lib/image-compress';
import { uploadFileToR2 } from '@/lib/upload-client';

const AVAILABLE_SERVICES = [
  'Incall (Private Place)',
  'Outcall (Hotels & Homes)',
  'Full Package (Hookup)',
  'Body to Body Massage',
  'Sensual Oil Massage',
  'Overnight Stay',
  'Dinner Date & Travel',
  'Oral (Blowjob / BBB)',
  'Roleplay & Fantasy',
  'Car Play / Quickie',
  'Couples Friendly',
  'Deep Tissue Massage',
  'Strictly Safe Sex',
  'Shower Together',
];

const AVAILABLE_CATEGORIES = [
  'VIP Escorts ⭐',
  'Adult Hookups & Companions 🔥',
  'Sensual Massage & Spa 💆',
  'College & Young Babes 🎓',
  'Curvy & Thick Babes 🍑',
  'Discreet & High Class 💎',
  'Travel & Dinner Dates ✈️',
];

const BODY_TYPES = [
  'Curvy / Bootylicious',
  'Slim & Petite',
  'Thick / BBW',
  'Athletic / Toned',
  'Medium / Average',
];

const COMPLEXIONS = [
  'Chocolate Skin',
  'Light Skin / Brown',
  'Caramel / Brown Skin',
  'Ebony / Dark & Lovely',
];

interface CreateProfileFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export default function CreateProfileForm({ onSuccess, onCancel }: CreateProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ── Authentication Check ──
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(true);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('ug_admin_auth') === 'true';
      setIsAdminAuthenticated(isAuth);
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: passkeyInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('ug_admin_auth', 'true');
          localStorage.setItem('ug_admin_key', passkeyInput.trim());
        }
      } else {
        setAuthError(data.error || 'Incorrect admin passkey. Please try again.');
      }
    } catch {
      setAuthError('Connection error. Please try again.');
    }
  };

  // ── Local Form State with Sensible Defaults ──
  const [name, setName] = useState('');
  const [age, setAge] = useState(22);
  const [city, setCity] = useState('Kampala');
  const [location, setLocation] = useState('Kololo, Kampala');
  const [tier, setTier] = useState<Profile['tier']>('VIP');
  const [category, setCategory] = useState('VIP Escorts ⭐');
  const [bodyType, setBodyType] = useState('Curvy / Bootylicious');
  const [complexion, setComplexion] = useState('Chocolate Skin');
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Incall (Private Place)',
    'Outcall (Hotels & Homes)',
    'Full Package (Hookup)',
  ]);
  const [phone, setPhone] = useState('+256');
  const [whatsapp, setWhatsapp] = useState('256');
  const [about, setAbout] = useState(
    'Sweet, friendly and discreet companion. Available for private hookups, outcall hotel visits, and unforgettable intimate moments.'
  );

  // ── Media State (Uploaded URLs) ──
  const [photoUrl, setPhotoUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string>('/logo.png');
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);

  // Gallery
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [galleryProgressText, setGalleryProgressText] = useState('');

  // Videos
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [customVideoInput, setCustomVideoInput] = useState('');
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoStatusText, setVideoStatusText] = useState('');

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

  // Notification state
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 5000);
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

  const toggleService = (srv: string) => {
    setSelectedServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  // ── Profile Photo Upload Handler (Uploads Immediately to R2) ──
  const handlePhotoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsPhotoUploading(true);
      setPhotoProgress(10);
      const localPreview = URL.createObjectURL(file);
      setPreviewImage(localPreview);

      // Compress client-side
      const optimized = await compressImage(file);
      setPhotoProgress(30);

      // Upload directly to Cloudflare R2
      const slugFolder = name.trim() ? name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'profile-photo';
      const uploadedUrl = await uploadFileToR2(optimized, slugFolder, (pct) => {
        setPhotoProgress(Math.max(30, pct));
      });

      setPhotoUrl(uploadedUrl);
      setPreviewImage(uploadedUrl);
      setPhotoProgress(100);
      showToast('✅ Profile photo uploaded to Cloudflare R2 storage!');
    } catch (err: any) {
      console.error('[handlePhotoFileSelect error]', err);
      showToast(`❌ Photo upload failed: ${err.message || 'Error uploading image'}`, true);
    } finally {
      setIsPhotoUploading(false);
    }
  };

  // ── Gallery Multi-Upload Handler (Uploads Immediately to R2 in parallel) ──
  const handleGalleryFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setIsGalleryUploading(true);
    setGalleryProgressText(`Compressing & preparing ${files.length} photo(s)...`);

    try {
      const slugFolder = name.trim() ? name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'gallery';
      let completedCount = 0;

      const uploadPromises = files.map(async (file) => {
        const optimized = await compressImage(file);
        const url = await uploadFileToR2(optimized, slugFolder);
        completedCount++;
        setGalleryProgressText(`Uploaded ${completedCount} of ${files.length} photos...`);
        return url;
      });

      const newUrls = await Promise.all(uploadPromises);
      const validUrls = newUrls.filter(Boolean);

      setGalleryUrls((prev) => [...prev, ...validUrls]);
      setPicsCount((prev) => Math.max(1, prev + validUrls.length));
      showToast(`✅ Added ${validUrls.length} photo(s) to gallery!`);
    } catch (err: any) {
      console.error('[handleGalleryFilesSelect error]', err);
      showToast(`❌ Gallery upload failed: ${err.message}`, true);
    } finally {
      setIsGalleryUploading(false);
      setGalleryProgressText('');
      e.target.value = '';
    }
  };

  const removeGalleryPhoto = (idx: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== idx));
    setPicsCount((prev) => Math.max(1, prev - 1));
  };

  // ── Video Upload Handler (Uploads Directly to R2 with live progress) ──
  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const file = files[0];
    const sizeMb = (file.size / 1024 / 1024).toFixed(1);

    setIsVideoUploading(true);
    setVideoProgress(5);
    setVideoStatusText(`Preparing "${file.name}" (${sizeMb} MB)...`);

    try {
      const slugFolder = name.trim() ? name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'videos';

      const uploadedUrl = await uploadFileToR2(file, slugFolder, (pct) => {
        setVideoProgress(pct);
        setVideoStatusText(`Uploading "${file.name}" directly to R2: ${pct}%`);
      });

      setVideoUrls((prev) => [...prev, uploadedUrl]);
      setVideoProgress(100);
      showToast(`✅ Video "${file.name}" uploaded successfully to Cloudflare R2!`);
    } catch (err: any) {
      console.error('[handleVideoFileSelect error]', err);
      showToast(`❌ Video upload failed: ${err.message}`, true);
    } finally {
      setIsVideoUploading(false);
      setVideoProgress(0);
      setVideoStatusText('');
      e.target.value = '';
    }
  };

  const addCustomVideoUrl = () => {
    if (!customVideoInput.trim()) return;
    const url = customVideoInput.trim();
    if (!url.startsWith('http')) {
      showToast('⚠️ Video URL must begin with http:// or https://', true);
      return;
    }
    setVideoUrls((prev) => [...prev, url]);
    setCustomVideoInput('');
    showToast('✅ Video link added!');
  };

  const removeVideo = (idx: number) => {
    setVideoUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Submit Profile (Fast, Lightweight 2KB Payload) ──
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('⚠️ Please enter a model name / alias.', true);
      return;
    }

    if (isPhotoUploading || isGalleryUploading || isVideoUploading) {
      showToast('⏳ Media upload is currently in progress. Please wait a moment until it finishes.', true);
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Set all text metadata & pre-uploaded URLs
    formData.set('name', name.trim());
    formData.set('age', String(age));
    formData.set('city', city);
    formData.set('location', location.trim());
    formData.set('tier', tier);
    formData.set('category', category);
    formData.set('services', selectedServices.join(', '));
    formData.set('phone', phone.trim());
    formData.set('whatsapp', whatsapp.trim());
    formData.set('about', about.trim());
    formData.set('photoUrl', photoUrl.trim());
    formData.set('galleryUrls', JSON.stringify(galleryUrls));
    formData.set('videoUrls', JSON.stringify(videoUrls));
    formData.set('status', status);
    formData.set('picsCount', String(Math.max(picsCount, (photoUrl ? 1 : 0) + galleryUrls.length)));
    formData.set('isApproved', isApproved ? 'true' : 'false');
    formData.set('isVerified', isVerified ? 'true' : 'false');
    formData.set('isPremium', isPremium ? 'true' : 'false');
    formData.set('isNew', isNew ? 'true' : 'false');
    formData.set('isArchived', isArchived ? 'true' : 'false');
    formData.set('paymentStatus', paymentStatus ?? 'verified');
    formData.set('paymentAmount', String(paymentAmount));
    formData.set('paymentRef', paymentRef.trim());

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
            showToast(`✅ Profile for ${name} created and published successfully!`);
            if (onSuccess) {
              onSuccess();
            } else {
              setTimeout(() => {
                router.push('/admin');
                router.refresh();
              }, 1000);
            }
            return;
          } else {
            showToast(`❌ Create failed: ${res.error || 'Unknown error'}`, true);
            return;
          }
        }

        // Direct Server Action fallback
        const res = await adminCreateProfile(formData);
        if (res.success) {
          showToast(`✅ Profile for ${name} created successfully!`);
          if (onSuccess) {
            onSuccess();
          } else {
            setTimeout(() => {
              router.push('/admin');
              router.refresh();
            }, 1000);
          }
        } else {
          const err = 'error' in res ? res.error : 'Failed to create profile';
          showToast(`❌ Create failed: ${err}`, true);
        }
      } catch (err: any) {
        console.error('Create error:', err);
        showToast(`❌ Save error: ${err?.message || 'Network error occurred while saving.'}`, true);
      }
    });
  };

  // If not authenticated, show smooth unlock box
  if (!isAdminAuthenticated) {
    return (
      <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '420px', width: '100%', background: '#141414', border: '1px solid #333', borderRadius: '16px', padding: '2rem', textAlign: 'center', color: '#fff' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '48px', height: '48px', margin: '0 auto 1rem', display: 'block' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: '#FFD600' }}>Admin Authentication Required</h2>
          <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Please enter your admin passkey to access the profile creator.</p>
          <form onSubmit={handleAdminLogin}>
            <input
              type="password"
              className="edit-input"
              style={{ width: '100%', marginBottom: '1rem', textAlign: 'center', fontSize: '1rem' }}
              placeholder="Enter Admin Passkey"
              value={passkeyInput}
              onChange={(e) => setPasskeyInput(e.target.value)}
              autoFocus
              required
            />
            {authError && <div style={{ color: '#FF2E55', fontSize: '0.82rem', marginBottom: '1rem' }}>{authError}</div>}
            <button type="submit" className="sticky-btn-save" style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }}>
              🔒 Unlock Form
            </button>
            <div style={{ marginTop: '1rem' }}>
              <Link href="/admin" style={{ color: '#888', fontSize: '0.8rem', textDecoration: 'none' }}>
                ← Return to Dashboard
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

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
            ✨ Fast Profile Creator (R2 Direct)
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
            <span className="edit-id-badge">ID #Draft</span>
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
            📍 {location ? `${location}, ${city}` : city} • Age: {age} • Phone: {phone} • {category}
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
              ✨ Instant Save Ready
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
                  <h2 className="edit-card-title">Identity &amp; Profile Details</h2>
                  <p className="edit-card-desc">Personal details, category, city and appearance</p>
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
                  <span className="edit-hint">Publicly displayed name on cards and search</span>
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
                  <span className="edit-hint">Must be 18+ for adult compliance</span>
                </div>
              </div>

              <div className="edit-grid-2" style={{ marginTop: '1.25rem' }}>
                <div className="edit-field">
                  <label className="edit-label">
                    City / Town <span className="req">*</span>
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
                  <span className="edit-hint">Primary city for SEO landing pages</span>
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
                    placeholder="e.g. Kololo, Ntinda, Kabalagala, Munyonyo"
                  />
                  <span className="edit-hint">Neighborhood or street for local searches</span>
                </div>
              </div>

              {/* Category & Appearance */}
              <div className="edit-grid-3" style={{ marginTop: '1.25rem' }}>
                <div className="edit-field">
                  <label className="edit-label">Primary Category</label>
                  <select
                    name="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="edit-select"
                  >
                    {AVAILABLE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="edit-field">
                  <label className="edit-label">Body Type</label>
                  <select
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                    className="edit-select"
                  >
                    {BODY_TYPES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="edit-field">
                  <label className="edit-label">Complexion</label>
                  <select
                    value={complexion}
                    onChange={(e) => setComplexion(e.target.value)}
                    className="edit-select"
                  >
                    {COMPLEXIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
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
                  A detailed bio with verified details receives 3x more calls and bookings.
                </span>
              </div>
            </div>

            {/* Section 2: Services Checkboxes / Tags */}
            <div className="edit-card">
              <div className="edit-card-header">
                <span className="edit-card-icon">🔥</span>
                <div>
                  <h2 className="edit-card-title">Services Offered</h2>
                  <p className="edit-card-desc">Tap tags to select or deselect specific services provided</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {AVAILABLE_SERVICES.map((srv) => {
                  const isChecked = selectedServices.includes(srv);
                  return (
                    <button
                      key={srv}
                      type="button"
                      onClick={() => toggleService(srv)}
                      style={{
                        background: isChecked ? 'rgba(255, 214, 0, 0.18)' : '#1a1a1a',
                        border: isChecked ? '1px solid #FFD600' : '1px solid #333',
                        color: isChecked ? '#FFD600' : '#aaa',
                        fontWeight: isChecked ? 700 : 500,
                        padding: '0.45rem 0.85rem',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{isChecked ? '✓' : '+'}</span>
                      {srv}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Contact Channels */}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span className="edit-hint">Direct chat opened on &quot;WhatsApp&quot; button</span>
                    {whatsapp && whatsapp.length > 5 && (
                      <a
                        href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.75rem', color: '#00E676', textDecoration: 'none' }}
                      >
                        ↗ Test WhatsApp Link
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Billing & Payment Verification */}
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
                    <button type="button" onClick={() => setPaymentAmount(35000)} className="preset-btn">
                      35k
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
            {/* Section 5: Photo & Media (Cloudflare R2 Direct) */}
            <div className="edit-card">
              <div className="edit-card-header">
                <span className="edit-card-icon">📸</span>
                <div>
                  <h2 className="edit-card-title">Primary Profile Photo</h2>
                  <p className="edit-card-desc">Uploaded directly to Cloudflare R2 bucket</p>
                </div>
              </div>

              {/* Photo Preview Box */}
              <div className="edit-photo-preview-box" style={{ position: 'relative' }}>
                <img
                  src={previewImage}
                  alt="Profile Preview"
                  className="preview-img-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
                {isPhotoUploading && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.7)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFD600',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      gap: '0.5rem',
                    }}
                  >
                    <span className="spinner" style={{ width: '24px', height: '24px', border: '3px solid #333', borderTop: '3px solid #FFD600', borderRadius: '50%' }} />
                    <span>Uploading: {photoProgress}%</span>
                  </div>
                )}
                {photoUrl && !isPhotoUploading && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'rgba(0, 230, 118, 0.9)',
                      color: '#000',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    ✓ R2 Ready
                  </div>
                )}
              </div>

              <div className="edit-field" style={{ marginTop: '1rem' }}>
                <label className="edit-label">Upload Photo (Immediate R2 Direct)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileSelect}
                  disabled={isPhotoUploading}
                  className="edit-file-input"
                />
                <span className="edit-hint">Auto-compressed and uploaded to R2 immediately</span>
              </div>

              <div className="edit-field" style={{ marginTop: '1rem' }}>
                <label className="edit-label">Or Custom Image URL</label>
                <input
                  type="url"
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
                <label className="edit-label">Total Photos Count Displayed</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={picsCount}
                  onChange={(e) => setPicsCount(parseInt(e.target.value, 10) || 0)}
                  className="edit-input"
                />
              </div>
            </div>

            {/* Section 6: Gallery Photos (R2) */}
            <div className="edit-card">
              <div className="edit-card-header">
                <span className="edit-card-icon">🖼️</span>
                <div>
                  <h2 className="edit-card-title">Gallery Photos</h2>
                  <p className="edit-card-desc">Uploaded in parallel to Cloudflare R2</p>
                </div>
              </div>

              {/* Gallery previews */}
              {galleryUrls.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <span className="edit-label" style={{ marginBottom: '0.6rem', display: 'block', color: '#34C759' }}>
                    Gallery Photos Ready ({galleryUrls.length})
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
                    {galleryUrls.map((url, idx) => (
                      <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1', background: '#1a1a1a', border: '1px solid #34C759' }}>
                        <img src={url} alt={`Gallery ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => removeGalleryPhoto(idx)}
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

              {isGalleryUploading && (
                <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(255,214,0,0.1)', border: '1px solid #FFD600', borderRadius: '8px', color: '#FFD600', fontSize: '0.8rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner" style={{ width: '14px', height: '14px', border: '2px solid #333', borderTop: '2px solid #FFD600', borderRadius: '50%' }} />
                  <span>{galleryProgressText || 'Uploading gallery photos to R2...'}</span>
                </div>
              )}

              <div className="edit-field">
                <label className="edit-label">Add Gallery Photos</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isGalleryUploading}
                  onChange={handleGalleryFilesSelect}
                  className="edit-file-input"
                />
                <span className="edit-hint">Select multiple photos. Uploads immediately in parallel to R2.</span>
              </div>
            </div>

            {/* Section 7: Videos (R2 Direct Upload - No Size Limit) */}
            <div className="edit-card">
              <div className="edit-card-header">
                <span className="edit-card-icon">🎬</span>
                <div>
                  <h2 className="edit-card-title">Video Clips</h2>
                  <p className="edit-card-desc">Direct upload to Cloudflare R2 (supports 10MB - 100MB+)</p>
                </div>
              </div>

              {/* Uploaded videos list */}
              {videoUrls.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <span className="edit-label" style={{ marginBottom: '0.6rem', display: 'block', color: '#34C759' }}>
                    Videos Attached ({videoUrls.length})
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {videoUrls.map((url, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#0d1f0d', borderRadius: '8px', padding: '0.6rem 0.75rem', border: '1px solid #34C759' }}>
                        <span style={{ fontSize: '1.25rem' }}>🎥</span>
                        <span style={{ flex: 1, fontSize: '0.8rem', color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {url.split('/').pop() || url}
                        </span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.75rem', color: '#64B5F6', textDecoration: 'none', fontWeight: 600 }}
                        >
                          ↗ Preview
                        </a>
                        <button
                          type="button"
                          onClick={() => removeVideo(idx)}
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

              {/* Active Video Upload Progress Bar */}
              {isVideoUploading && (
                <div style={{ marginBottom: '1rem', background: '#111', border: '1px solid #FFD600', borderRadius: '10px', padding: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#FFD600', fontWeight: 700, marginBottom: '0.4rem' }}>
                    <span>{videoStatusText || 'Uploading video to R2...'}</span>
                    <span>{videoProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${videoProgress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #FFD600, #00E676)',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="edit-field">
                <label className="edit-label">Upload Video File (Direct to R2)</label>
                <input
                  type="file"
                  accept="video/*"
                  disabled={isVideoUploading}
                  onChange={handleVideoFileSelect}
                  className="edit-file-input"
                />
                <span className="edit-hint">Direct-to-R2 upload bypasses server payload limits. MP4, MOV, WebM.</span>
              </div>

              {/* Direct Video URL Input */}
              <div className="edit-field" style={{ marginTop: '1rem' }}>
                <label className="edit-label">Or Add Video Link (R2, CDN, Stream)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="url"
                    value={customVideoInput}
                    onChange={(e) => setCustomVideoInput(e.target.value)}
                    placeholder="https://pub-...r2.dev/video.mp4"
                    className="edit-input"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={addCustomVideoUrl}
                    className="preset-btn"
                    style={{ padding: '0.4rem 0.8rem', whiteSpace: 'nowrap', background: '#222', color: '#FFD600' }}
                  >
                    + Add Link
                  </button>
                </div>
                <span className="edit-hint">Paste direct MP4 or video streaming URL</span>
              </div>
            </div>

            {/* Section 8: Tier & Badges */}
            <div className="edit-card">
              <div className="edit-card-header">
                <span className="edit-card-icon">🏷️</span>
                <div>
                  <h2 className="edit-card-title">Listing Tier &amp; Trust Badges</h2>
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
                  <option value="online">Online Now 🟢 (Top Priority on Home)</option>
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
              <span>
                {isPhotoUploading || isGalleryUploading || isVideoUploading
                  ? '⏳ Uploading media files to R2...'
                  : `Ready to publish • ${name || 'Draft Profile'}`}
              </span>
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
              <button
                type="submit"
                disabled={isPending || isPhotoUploading || isGalleryUploading || isVideoUploading}
                className="sticky-btn-save"
              >
                {isPending ? (
                  <span className="btn-loading">
                    <span className="spinner" /> Saving to Cloudflare D1...
                  </span>
                ) : isPhotoUploading || isGalleryUploading || isVideoUploading ? (
                  <span className="btn-loading">
                    <span className="spinner" /> Uploading Media...
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
