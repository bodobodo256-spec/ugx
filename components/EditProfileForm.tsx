'use client';

import React, { useState, useRef, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LOCATIONS } from '@/data/locations';
import { type Profile } from '@/db/schema';
import { adminUpdateProfile, deleteProfile } from '@/app/actions/profiles';

interface EditProfileFormProps {
  profile: Profile;
}

export default function EditProfileForm({ profile }: EditProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local form preview state
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [city, setCity] = useState(profile.city);
  const [location, setLocation] = useState(profile.location);
  const [tier, setTier] = useState<Profile['tier']>(profile.tier);
  const [phone, setPhone] = useState(profile.phone);
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp);
  const [about, setAbout] = useState(profile.about ?? '');
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl ?? '');
  const [status, setStatus] = useState<Profile['status']>(profile.status ?? 'recent');
  const [picsCount, setPicsCount] = useState(profile.picsCount ?? 1);

  // Modern switches
  const [isApproved, setIsApproved] = useState(profile.isApproved ?? false);
  const [isVerified, setIsVerified] = useState(profile.isVerified ?? false);
  const [isPremium, setIsPremium] = useState(profile.isPremium ?? false);
  const [isNew, setIsNew] = useState(profile.isNew ?? false);
  const [isArchived, setIsArchived] = useState(profile.isArchived ?? false);

  // Payment
  const [paymentStatus, setPaymentStatus] = useState<Profile['paymentStatus']>(profile.paymentStatus ?? 'pending');
  const [paymentAmount, setPaymentAmount] = useState(profile.paymentAmount ?? (profile.tier === 'VIP' ? 25000 : 10000));
  const [paymentRef, setPaymentRef] = useState(profile.paymentRef ?? '');

  // File upload preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(profile.photoUrl || '/logo.png');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification state
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Guarantee fields are accurately reflected
    formData.set('id', String(profile.id));
    formData.set('name', name);
    formData.set('age', String(age));
    formData.set('city', city);
    formData.set('location', location);
    formData.set('tier', tier);
    formData.set('phone', phone);
    formData.set('whatsapp', whatsapp);
    formData.set('about', about);
    formData.set('photoUrl', photoUrl);
    formData.set('status', status);
    formData.set('picsCount', String(picsCount));
    formData.set('isApproved', isApproved ? 'true' : 'false');
    formData.set('isVerified', isVerified ? 'true' : 'false');
    formData.set('isPremium', isPremium ? 'true' : 'false');
    formData.set('isNew', isNew ? 'true' : 'false');
    formData.set('isArchived', isArchived ? 'true' : 'false');
    formData.set('paymentStatus', paymentStatus ?? 'pending');
    formData.set('paymentAmount', String(paymentAmount));
    formData.set('paymentRef', paymentRef);

    if (selectedFile) {
      formData.set('photo', selectedFile);
    }

    startTransition(async () => {
      const res = await adminUpdateProfile(formData);
      if (res.success) {
        showToast(`✅ Profile for ${name} saved successfully to Cloudflare D1!`);
        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 1200);
      } else {
        const err = 'error' in res ? res.error : 'Failed to update profile';
        showToast(`❌ Update failed: ${err}`, true);
      }
    });
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${profile.name}"? This action cannot be undone.`)) {
      return;
    }
    setIsDeleting(true);
    const res = await deleteProfile(profile.id);
    if (res.success) {
      showToast(`🗑️ ${profile.name} deleted successfully.`);
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 1000);
    } else {
      setIsDeleting(false);
      showToast(`❌ Deletion failed: ${res.error}`, true);
    }
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
        <Link href="/admin" className="edit-back-btn">
          <span>←</span> Back to Dashboard
        </Link>
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
          <span className="current">Edit #{profile.id}</span>
        </div>
        <div className="edit-top-actions">
          <a
            href={`/#profile-${profile.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="edit-view-live-btn"
          >
            ↗ View Public Listing
          </a>
        </div>
      </div>

      {/* Hero Profile Overview Card */}
      <div className="edit-hero-card">
        <div className="edit-hero-avatar-wrapper">
          <div className="edit-hero-avatar">
            {previewImage ? (
              <img
                src={previewImage}
                alt={name}
                className="edit-avatar-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            ) : (
              <div className="edit-avatar-placeholder">{name.charAt(0) || 'U'}</div>
            )}
            <span
              className={`edit-status-indicator ${status === 'online' ? 'status-online' : 'status-recent'}`}
              title={status === 'online' ? 'Online Now' : 'Recently Active'}
            />
          </div>
        </div>

        <div className="edit-hero-info">
          <div className="edit-hero-name-row">
            <h1 className="edit-hero-title">{name || 'Unnamed Profile'}</h1>
            <span className="edit-id-badge">ID #{profile.id}</span>
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
            <span className="quick-meta-label">Created</span>
            <span className="quick-meta-value">
              {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Editing Form */}
      <form onSubmit={handleSubmit} className="edit-form-layout">
        <input type="hidden" name="id" value={profile.id} />

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
                    placeholder="e.g. Angel, Brenda"
                  />
                  <span className="edit-hint">Name displayed on public search and cards</span>
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
                <label className="edit-label">Upload New Photo to R2</label>
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

            {/* Section 5: Tier & Badges */}
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
                  onChange={(e) => setTier(e.target.value as any)}
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
                    <small>Visible to public website visitors</small>
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

            {/* Section 6: Danger Zone */}
            <div className="edit-card danger-card">
              <div className="edit-card-header">
                <span className="edit-card-icon">⚠️</span>
                <div>
                  <h2 className="edit-card-title" style={{ color: '#FF3B30' }}>
                    Danger Zone
                  </h2>
                  <p className="edit-card-desc">Irreversible profile actions</p>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem', lineHeight: 1.5 }}>
                Permanently remove this profile and all its photos from the database and storage.
              </p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn-danger-full"
              >
                {isDeleting ? 'Deleting Profile...' : '🗑️ Delete Profile Permanently'}
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="edit-sticky-bar">
          <div className="sticky-bar-inner">
            <div className="sticky-bar-status">
              <span className="status-dot-pulse" />
              <span>Editing #{profile.id} • {name}</span>
            </div>
            <div className="sticky-bar-actions">
              <Link href="/admin" className="sticky-btn-cancel">
                Cancel &amp; Return
              </Link>
              <button type="submit" disabled={isPending} className="sticky-btn-save">
                {isPending ? (
                  <span className="btn-loading">
                    <span className="spinner" /> Saving to D1...
                  </span>
                ) : (
                  '💾 Save Profile Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
