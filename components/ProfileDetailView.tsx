'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Profile } from '@/db/schema';
import ProfileCard from '@/components/ProfileCard';

interface ProfileDetailViewProps {
  profile: Profile;
  relatedProfiles: Profile[];
}

export default function ProfileDetailView({ profile, relatedProfiles }: ProfileDetailViewProps) {
  // Parse gallery and videos
  const gallery: string[] = (() => {
    if (!profile.galleryUrls) return [];
    try {
      const parsed = JSON.parse(profile.galleryUrls);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return profile.galleryUrls.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    }
  })();

  const videos: string[] = (() => {
    if (!profile.videoUrls) return [];
    try {
      const parsed = JSON.parse(profile.videoUrls);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return profile.videoUrls.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    }
  })();

  // All photos combined: main photo + gallery photos
  const allPhotos: string[] = [
    ...(profile.photoUrl ? [profile.photoUrl] : []),
    ...gallery.filter((url) => url !== profile.photoUrl),
  ];

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'videos'>('photos');

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextPhoto = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % allPhotos.length);
    }
  };
  const prevPhoto = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + allPhotos.length) % allPhotos.length);
    }
  };

  const isVip = profile.tier.startsWith('VIP');
  const isPremium = Boolean(profile.isPremium || profile.tier === 'Premium');

  const waGreeting = encodeURIComponent(
    `Hello ${profile.name}, I saw your verified profile on Uganda Sexy Babes and I would love to connect with you.`
  );

  return (
    <div className="profile-detail-page">
      {/* ══ BREADCRUMBS ══ */}
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <div className="detail-container">
          <Link href="/">Home</Link>
          <span className="sep">/</span>
          <Link href={`/location/${encodeURIComponent(profile.city.toLowerCase())}`}>{profile.city}</Link>
          <span className="sep">/</span>
          <span className="current">{profile.name}</span>
        </div>
      </nav>

      <div className="detail-container">
        {/* ══ TOP HERO BANNER ══ */}
        <div className="detail-hero-card">
          <div className="detail-hero-grid">
            
            {/* Main Featured Photo with Lightbox Click */}
            <div className="detail-photo-col">
              <div className="detail-main-photo-wrap" onClick={() => openLightbox(0)}>
                <img
                  src={profile.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=800&q=80'}
                  alt={`${profile.name} — ${profile.location}`}
                  className="detail-main-photo"
                />
                <div className="detail-photo-overlay">
                  <span className="detail-photo-zoom-hint">🔍 Tap to expand photo</span>
                </div>
                <div className="detail-photo-badges">
                  {profile.picsCount > 0 && (
                    <span className="detail-badge badge-media">📷 {profile.picsCount} Photos</span>
                  )}
                  {profile.vidsCount && profile.vidsCount > 0 && (
                    <span className="detail-badge badge-media">🎥 {profile.vidsCount} Videos</span>
                  )}
                </div>
              </div>

              {/* Thumbnail Strip (if multiple photos) */}
              {allPhotos.length > 1 && (
                <div className="detail-thumb-strip">
                  {allPhotos.slice(0, 5).map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`detail-thumb-btn ${idx === 0 ? 'active' : ''}`}
                      onClick={() => openLightbox(idx)}
                      title={`View photo ${idx + 1}`}
                    >
                      <img src={url} alt={`Thumbnail ${idx + 1}`} />
                      {idx === 4 && allPhotos.length > 5 && (
                        <span className="detail-thumb-more">+{allPhotos.length - 5}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Info & Direct Actions */}
            <div className="detail-info-col">
              <div className="detail-header-row">
                <div>
                  <h1 className="detail-name">
                    {profile.name}
                    <span className="detail-age">, {profile.age}</span>
                  </h1>
                  <div className="detail-location-row">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span>{profile.location}, {profile.city}</span>
                  </div>
                </div>

                {/* Status Dot */}
                <div className="detail-status-pill">
                  <span className={`status-dot-pulse ${profile.status === 'online' ? 'online' : 'recent'}`}></span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    {profile.status === 'online' ? 'Online Now 🟢' : 'Recently Active ⚪'}
                  </span>
                </div>
              </div>

              {/* Badges Bar */}
              <div className="detail-badges-list">
                <span className={`detail-pill ${isVip ? 'pill-vip' : isPremium ? 'pill-premium' : 'pill-standard'}`}>
                  {isPremium ? '💎 Premium' : isVip ? '⭐ VIP Model' : 'Standard'}
                </span>
                {profile.isVerified && (
                  <span className="detail-pill pill-verified">🛡️ 100% Verified</span>
                )}
                {profile.isNew && (
                  <span className="detail-pill pill-new">🆕 New Girl</span>
                )}
                <span className="detail-pill pill-loc">📍 {profile.city}</span>
              </div>

              {/* Action Buttons */}
              <div className="detail-actions-box">
                <div className="detail-actions-title">📞 Connect Directly (Discreet &amp; Instant)</div>
                <div className="detail-buttons-grid">
                  <a
                    href={`https://wa.me/${profile.whatsapp}?text=${waGreeting}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-btn detail-btn-whatsapp"
                  >
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                      <path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.5L3 20.7l1.4-4.8A8.5 8.5 0 1 1 20.5 11.8Z"/>
                      <path d="M8.2 7.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.8 2c.1.3.1.5-.1.7l-.6.8c-.2.2-.1.4 0 .6.5 1 1.3 1.8 2.3 2.3.2.1.4.2.6 0l.9-1c.2-.2.4-.2.7-.1l1.9.9c.3.1.4.3.4.5 0 .3-.2 1.5-.8 2-.5.5-1.2.7-2 .7-1.2 0-3-.7-4.8-2.3-2.1-1.9-3.4-4.3-3.4-5.7 0-.7.2-1.1.4-1.4Z"/>
                    </svg>
                    <span>Chat on WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${profile.phone}`}
                    className="detail-btn detail-btn-call"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1Z"/>
                    </svg>
                    <span>Call Now ({profile.phone})</span>
                  </a>
                </div>
              </div>

              {/* Bio / About */}
              <div className="detail-about-card">
                <h3>About {profile.name}</h3>
                <p>{profile.about || 'No detailed description provided yet. Contact directly via WhatsApp or phone for full booking details, rates, and schedule availability.'}</p>
              </div>

              {/* Key Specs */}
              <div className="detail-specs-grid">
                <div className="detail-spec-item">
                  <span className="spec-label">Age</span>
                  <span className="spec-val">{profile.age} Years</span>
                </div>
                <div className="detail-spec-item">
                  <span className="spec-label">City</span>
                  <span className="spec-val">{profile.city}</span>
                </div>
                <div className="detail-spec-item">
                  <span className="spec-label">Area</span>
                  <span className="spec-val">{profile.location}</span>
                </div>
                <div className="detail-spec-item">
                  <span className="spec-label">Status</span>
                  <span className="spec-val" style={{ color: '#22c55e' }}>Available</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ══ MEDIA SECTION: PHOTO GALLERY & VIDEOS ══ */}
        {(gallery.length > 0 || videos.length > 0) && (
          <section className="detail-media-section" id="media">
            <div className="detail-media-nav">
              <h2>Photos &amp; Media ({allPhotos.length + videos.length})</h2>
              <div className="detail-tabs">
                <button
                  type="button"
                  className={`detail-tab-btn ${activeMediaTab === 'photos' ? 'active' : ''}`}
                  onClick={() => setActiveMediaTab('photos')}
                >
                  📷 Photos ({allPhotos.length})
                </button>
                {videos.length > 0 && (
                  <button
                    type="button"
                    className={`detail-tab-btn ${activeMediaTab === 'videos' ? 'active' : ''}`}
                    onClick={() => setActiveMediaTab('videos')}
                  >
                    🎥 Videos ({videos.length})
                  </button>
                )}
              </div>
            </div>

            {/* Photos Tab */}
            {activeMediaTab === 'photos' && (
              <div className="detail-gallery-grid">
                {allPhotos.map((url, idx) => (
                  <div
                    key={idx}
                    className="detail-gallery-item"
                    onClick={() => openLightbox(idx)}
                    role="button"
                    tabIndex={0}
                  >
                    <img src={url} alt={`${profile.name} photo ${idx + 1}`} loading="lazy" />
                    <div className="gallery-hover-overlay">
                      <span>🔍 Expand</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Videos Tab */}
            {activeMediaTab === 'videos' && (
              <div className="detail-videos-grid">
                {videos.map((vidUrl, idx) => (
                  <div key={idx} className="detail-video-card">
                    <video
                      src={vidUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="detail-video-player"
                    >
                      Your browser does not support HTML5 video.
                    </video>
                    <div className="detail-video-caption">
                      <span>🎥 Video Clip #{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ══ SAFETY & DISCRETION NOTICE ══ */}
        <div className="detail-safety-box">
          <div className="safety-icon">🛡️</div>
          <div>
            <strong>Discreet &amp; Safe Encounters Guarantee</strong>
            <p>
              Uganda Sexy Babes is a verified directory for consensual adult hookups, escorts, and private companions in Uganda. Always verify details beforehand, respect each model's boundaries, and practice safe, responsible encounters.
            </p>
          </div>
        </div>

        {/* ══ RELATED BABES IN SAME LOCATION ══ */}
        {relatedProfiles.length > 0 && (
          <section className="detail-related-section">
            <div className="detail-section-head">
              <h2>More Sexy Babes in {profile.city}</h2>
              <Link href={`/location/${encodeURIComponent(profile.city.toLowerCase())}`} className="view-all-link">
                View all in {profile.city} →
              </Link>
            </div>
            <div className="card-grid">
              {relatedProfiles.map((p) => (
                <ProfileCard key={p.id} profile={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ══ LIGHTBOX MODAL ══ */}
      {lightboxIndex !== null && (
        <div className="detail-lightbox" onClick={closeLightbox}>
          <button type="button" className="lightbox-close" onClick={closeLightbox} aria-label="Close">
            ✕
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={allPhotos[lightboxIndex]}
              alt={`${profile.name} photo ${lightboxIndex + 1}`}
              className="lightbox-main-img"
            />
            {allPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  className="lightbox-nav lightbox-prev"
                  onClick={prevPhoto}
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="lightbox-nav lightbox-next"
                  onClick={nextPhoto}
                  aria-label="Next photo"
                >
                  ›
                </button>
                <div className="lightbox-counter">
                  {lightboxIndex + 1} / {allPhotos.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
