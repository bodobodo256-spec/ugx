import React from 'react';
import { type Profile } from '@/db/schema';

interface ProfileCardProps {
  profile: Profile;
  priority?: boolean;
}

export default function ProfileCard({ profile, priority = false }: ProfileCardProps) {
  const isVip = profile.tier.startsWith('VIP');
  const isPremium = Boolean(profile.isPremium || profile.tier === 'Premium');

  return (
    <article className={`profile-card ${isVip || isPremium ? 'pcard-vip' : ''}`} itemScope itemType="https://schema.org/Person">
      <div className="card-shell">
        <a href={`#profile-${profile.id}`} className="card-main-link" itemProp="url" aria-label={`View ${profile.name} profile`}>
          <div className="card-img-wrap">
            <img
              className="card-photo"
              width={320}
              height={480}
              src={profile.photoUrl ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=320&h=480&q=80'}
              alt={`${profile.name} — ${profile.location}`}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              itemProp="image"
            />
            <div className="card-topbar">
              <div className="card-media-counts">
                <span className="media-badge">{profile.picsCount} pics</span>
                {profile.vidsCount && <span className="media-badge">{profile.vidsCount} vids</span>}
              </div>
              <span className={`card-tier ${isVip ? 'tier-vip' : isPremium ? 'tier-vip' : 'tier-standard'}`} style={isPremium ? { background: 'linear-gradient(135deg, #9b59b6, #8e44ad)', color: '#fff', borderColor: '#d2b4de' } : undefined}>
                {isPremium ? '💎 Premium' : profile.tier}
              </span>
            </div>

            <div className="card-about-overlay" aria-hidden="true">
              <p>{profile.about}</p>
            </div>

            <div className="card-name-row">
              <div className="card-name" itemProp="name">{profile.name}</div>
              {profile.isNew && <span className="card-badge-new">New</span>}
            </div>
          </div>

          <div className="card-details">
            <div className="card-location" itemProp="homeLocation">
              <svg className="card-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/>
                <circle cx="12" cy="10" r="2.4"/>
              </svg>
              <span>{profile.location}</span>
            </div>
            <div className="card-status-row">
              <span className="labels">
                {profile.isNew && <span className="label label-new">NEW</span>}
                {profile.isVerified && <span className="label label-verified">VERIFIED</span>}
                {isPremium && <span className="label" style={{ background: '#8e44ad', color: '#fff' }}>PREMIUM</span>}
              </span>
              <span className={`card-status status-${profile.status}`}>
                <i className="status-dot" aria-hidden="true"></i>
                {profile.status === 'online' ? 'Online Now' : 'Recently Active'}
              </span>
            </div>
          </div>
        </a>

        {/* ── Action Buttons: Red Call Button & Green WhatsApp Button ── */}
        <div className="card-actions">
          <a
            className="card-action action-call"
            href={`tel:${profile.phone}`}
            aria-label={`Call ${profile.name}`}
          >
            <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1Z"/>
            </svg>
            <span>Call</span>
          </a>

          <a
            className="card-action action-whatsapp"
            href={`https://wa.me/${profile.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp ${profile.name}`}
          >
            <svg className="action-icon action-icon-wa" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.5L3 20.7l1.4-4.8A8.5 8.5 0 1 1 20.5 11.8Z"/>
              <path d="M8.2 7.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.8 2c.1.3.1.5-.1.7l-.6.8c-.2.2-.1.4 0 .6.5 1 1.3 1.8 2.3 2.3.2.1.4.2.6 0l.9-1c.2-.2.4-.2.7-.1l1.9.9c.3.1.4.3.4.5 0 .3-.2 1.5-.8 2-.5.5-1.2.7-2 .7-1.2 0-3-.7-4.8-2.3-2.1-1.9-3.4-4.3-3.4-5.7 0-.7.2-1.1.4-1.4Z"/>
            </svg>
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </article>
  );
}
