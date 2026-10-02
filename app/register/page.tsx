'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('Angel');
  const [age, setAge] = useState(23);
  const [location, setLocation] = useState('Kololo, Kampala');
  const [category, setCategory] = useState('Dating & Hookup');
  const [phone, setPhone] = useState('+256700000001');
  const [whatsapp, setWhatsapp] = useState('256700000001');
  const [bio, setBio] = useState('I am a sweet, beautiful Ugandan lady who loves good conversations, private dates and romantic evenings. Discreet and classy.');
  const [tier, setTier] = useState<'Standard' | 'VIP'>('VIP');
  const [photoPreview, setPhotoPreview] = useState('https://spcdn.shortpixel.ai/spio/ret_img+q_cdnize+to_auto+s_webp:avif/ugandaescorts.net/wp-content/uploads/1790519050120/17905211817455-320x480.jpg');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="register-wrapper">
      <div className="register-header">
        <h1>Create Your <span>Profile</span></h1>
        {/* Uganda flag accent ribbon */}
        <div className="uganda-tri-bar" style={{ justifyContent: 'center', margin: '0.6rem auto 1rem' }} aria-hidden="true">
          <span className="bar-stripe bar-black"></span>
          <span className="bar-stripe bar-yellow"></span>
          <span className="bar-stripe bar-red"></span>
        </div>
        <p>
          Join Uganda's #1 verified dating and companion platform. Showcase your beauty, set your terms, and connect with respectful gentlemen across Uganda.
        </p>
      </div>

      {/* Success Banner */}
      {isSubmitted && (
        <div className="form-success-banner active" id="successBanner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <div>
            <strong>Profile Submitted Successfully!</strong>
            <p style={{ margin: 0, fontSize: '0.82rem', opacity: 0.9 }}>
              Welcome, {name}! Your profile is under review and will appear live in the directory within 15 minutes.
            </p>
          </div>
        </div>
      )}

      <div className="register-layout">

        {/* ══ FORM COLUMN ══ */}
        <div className="form-card">
          <form id="createProfileForm" onSubmit={handleSubmit}>

            {/* Section 1: Basic Info */}
            <div className="form-section">
              <div className="form-section-title">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
                1. Basic Information
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="profileName">
                    Profile Name / Nickname <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="profileName"
                    className="form-input"
                    placeholder="e.g. Angel, Princess Joy, Sheila"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profileAge">
                    Age <span className="req">* (18+)</span>
                  </label>
                  <input
                    type="number"
                    id="profileAge"
                    className="form-input"
                    min="18"
                    max="65"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profileLocation">
                    Primary City / Area <span className="req">*</span>
                  </label>
                  <select
                    id="profileLocation"
                    className="form-select"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  >
                    <option value="Kololo, Kampala">Kampala — Kololo</option>
                    <option value="Nakasero, Kampala">Kampala — Nakasero</option>
                    <option value="Makindye, Kampala">Kampala — Makindye</option>
                    <option value="Kawempe, Kampala">Kampala — Kawempe</option>
                    <option value="Ntinda, Kampala">Kampala — Ntinda</option>
                    <option value="Kira">Kira</option>
                    <option value="Wakiso">Wakiso</option>
                    <option value="Mukono">Mukono</option>
                    <option value="Entebbe">Entebbe</option>
                    <option value="Nansana">Nansana</option>
                    <option value="Jinja">Jinja</option>
                    <option value="Mbarara">Mbarara</option>
                    <option value="Gulu">Gulu</option>
                    <option value="Arua">Arua</option>
                    <option value="Lira">Lira</option>
                    <option value="Fort Portal">Fort Portal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profileCategory">
                    Category <span className="req">*</span>
                  </label>
                  <select
                    id="profileCategory"
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Dating & Hookup">Dating &amp; Hookup</option>
                    <option value="VIP Escort">VIP Escort</option>
                    <option value="Massage & Spa">Massage &amp; Spa</option>
                    <option value="Dinner Date Companion">Dinner Date Companion</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Details */}
            <div className="form-section">
              <div className="form-section-title">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1zM19 12h2c0-4.97-4.03-9-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z"/>
                </svg>
                2. Direct Contact Details
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="profilePhone">
                    Direct Phone Number (for calls) <span className="req">*</span>
                  </label>
                  <input
                    type="tel"
                    id="profilePhone"
                    className="form-input"
                    placeholder="+256 700 000 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profileWhatsApp">
                    WhatsApp Number <span className="req">*</span>
                  </label>
                  <input
                    type="tel"
                    id="profileWhatsApp"
                    className="form-input"
                    placeholder="256 700 000 000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Bio */}
            <div className="form-section">
              <div className="form-section-title">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
                3. About You &amp; Bio
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="profileBio">
                  Bio / Headline Description <span className="req">*</span>
                </label>
                <textarea
                  id="profileBio"
                  className="form-textarea"
                  placeholder="Describe your personality, what makes your company special..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Section 4: Services Offered */}
            <div className="form-section">
              <div className="form-section-title">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                4. Services Offered
              </div>
              <div className="service-pills">
                <label className="service-pill-label selected"><input type="checkbox" defaultChecked /> Dinner Dates</label>
                <label className="service-pill-label selected"><input type="checkbox" defaultChecked /> Overnight Companionship</label>
                <label className="service-pill-label selected"><input type="checkbox" defaultChecked /> Relaxing Body Massage</label>
                <label className="service-pill-label"><input type="checkbox" /> Travel / Weekend Companion</label>
                <label className="service-pill-label selected"><input type="checkbox" defaultChecked /> Private Hotel Incall</label>
                <label className="service-pill-label"><input type="checkbox" /> Discreet Outcall</label>
                <label className="service-pill-label"><input type="checkbox" /> Events &amp; Parties</label>
              </div>
            </div>

            {/* Section 5: Choose Listing Tier */}
            <div className="form-section">
              <div className="form-section-title">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
                </svg>
                5. Select Listing Tier
              </div>
              <div className="tier-plans-grid">
                {/* Standard */}
                <label
                  className={`tier-plan-card ${tier === 'Standard' ? 'active' : ''}`}
                  onClick={() => setTier('Standard')}
                >
                  <input
                    type="radio"
                    name="planTier"
                    value="Standard"
                    className="tier-plan-radio"
                    checked={tier === 'Standard'}
                    onChange={() => setTier('Standard')}
                  />
                  <div className="tier-plan-title">Standard Babe</div>
                  <div className="tier-plan-price">FREE Listing</div>
                  <ul className="tier-plan-features">
                    <li>✓ Standard directory listing</li>
                    <li>✓ Direct Call &amp; WhatsApp</li>
                    <li>✓ Unlimited profile views</li>
                  </ul>
                </label>

                {/* VIP */}
                <label
                  className={`tier-plan-card ${tier === 'VIP' ? 'active' : ''}`}
                  onClick={() => setTier('VIP')}
                >
                  <input
                    type="radio"
                    name="planTier"
                    value="VIP"
                    className="tier-plan-radio"
                    checked={tier === 'VIP'}
                    onChange={() => setTier('VIP')}
                  />
                  <div className="tier-plan-title">⭐ VIP Elite Babe</div>
                  <div className="tier-plan-price">Top Recommended</div>
                  <ul className="tier-plan-features">
                    <li>✓ Pinned in ⭐ VIP Top Grid</li>
                    <li>✓ Yellow Gold VIP Badge</li>
                    <li>✓ Verified Green Checkmark</li>
                    <li>✓ 10x More Direct Inquiries</li>
                  </ul>
                </label>
              </div>
            </div>

            {/* Section 6: Photo Upload */}
            <div className="form-section">
              <div className="form-section-title">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
                6. Upload Portrait Photos
              </div>
              <label className="upload-dropzone">
                <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <div className="upload-title">Click to upload your portrait photos</div>
                <div className="upload-hint">JPG, PNG or WEBP (Photos with clear face view get verified fastest)</div>
                <input
                  type="file"
                  className="upload-input"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>

            {/* Terms & Submit */}
            <div className="terms-agreement">
              <input type="checkbox" id="agreeTerms" required defaultChecked />
              <label htmlFor="agreeTerms">
                I confirm that I am at least 18 years old, and I consent to having my profile information and photos published on Uganda Sexy Babes.
              </label>
            </div>

            <button type="submit" className="form-submit-btn">
              ✨ Publish My Profile Now
            </button>
          </form>
        </div>

        {/* ══ LIVE PREVIEW STICKY COLUMN ══ */}
        <div className="preview-sticky">
          <div className="preview-title">
            <span>Live Card Preview</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--yellow)' }}>Updates Live ⚡</span>
          </div>

          {/* Interactive Preview Card */}
          <article className={`profile-card ${tier === 'VIP' ? 'pcard-vip' : ''}`} id="previewCard">
            <div className="card-shell">
              <a href="#" className="card-main-link" onClick={(e) => e.preventDefault()}>
                <div className="card-img-wrap">
                  <img
                    id="previewPhoto"
                    className="card-photo"
                    width={320}
                    height={480}
                    src={photoPreview}
                    alt="Profile Preview"
                  />
                  <div className="card-topbar">
                    <div className="card-media-counts">
                      <span className="media-badge">6 pics</span>
                      <span className="media-badge">2 vids</span>
                    </div>
                    <span className={`card-tier ${tier === 'VIP' ? 'tier-vip' : 'tier-standard'}`} id="previewTier">
                      {tier}
                    </span>
                  </div>
                  <div className="card-about-overlay">
                    <p id="previewAbout">{bio || 'Your bio preview...'}</p>
                  </div>
                  <div className="card-name-row">
                    <div className="card-name" id="previewName">{name || 'Your Name'}</div>
                    <span className="card-badge-new">New</span>
                  </div>
                </div>
                <div className="card-details">
                  <div className="card-location">
                    <svg className="card-icon" viewBox="0 0 24 24">
                      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/>
                      <circle cx="12" cy="10" r="2.4"/>
                    </svg>
                    <span id="previewLoc">{location}</span>
                  </div>
                  <div className="card-status-row">
                    <span className="labels">
                      <span className="label label-new">NEW</span>
                      <span className="label label-verified">VERIFIED</span>
                    </span>
                    <span className="card-status status-online">
                      <i className="status-dot"></i> Online Now
                    </span>
                  </div>
                </div>
              </a>
              <div className="card-actions">
                <a className="card-action action-call" href="#" onClick={(e) => e.preventDefault()}>
                  <svg className="action-icon" viewBox="0 0 24 24">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1Z"/>
                  </svg>
                  <span>Call</span>
                </a>
                <a className="card-action action-whatsapp" href="#" onClick={(e) => e.preventDefault()}>
                  <svg className="action-icon action-icon-wa" viewBox="0 0 24 24">
                    <path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.5L3 20.7l1.4-4.8A8.5 8.5 0 1 1 20.5 11.8Z"/>
                    <path d="M8.2 7.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.8 2c.1.3.1.5-.1.7l-.6.8c-.2.2-.1.4 0 .6.5 1 1.3 1.8 2.3 2.3.2.1.4.2.6 0l.9-1c.2-.2.4-.2.7-.1l1.9.9c.3.1.4.3.4.5 0 .3-.2 1.5-.8 2-.5.5-1.2.7-2 .7-1.2 0-3-.7-4.8-2.3-2.1-1.9-3.4-4.3-3.4-5.7 0-.7.2-1.1.4-1.4Z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
