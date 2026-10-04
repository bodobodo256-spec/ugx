'use client';

import React, { useState, useMemo, useEffect } from 'react';
import ProfileCard from '@/components/ProfileCard';
import { LOCATIONS } from '@/data/locations';
import { type Profile } from '@/db/schema';

// ─── Deterministic seeded PRNG (Mulberry32) ───────────────────────────────────
// Everyone who visits at the same 2-minute UTC window sees the SAME shuffle.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  const rand = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Returns the current UTC 2-minute bucket index (same for everyone in the same window)
const SLOT_MS = 2 * 60 * 1000;
function getSlot() {
  return Math.floor(Date.now() / SLOT_MS);
}

// ─────────────────────────────────────────────────────────────────────────────

interface HomeContentProps {
  profiles: Profile[];
}

export default function HomeContent({ profiles }: HomeContentProps) {
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocationOpen, setIsLocationOpen] = useState(true);
  const [visibleStandardCount, setVisibleStandardCount] = useState(4);

  // Track the current time-slot so the component re-renders when the slot rolls over
  const [currentSlot, setCurrentSlot] = useState<number>(getSlot);

  useEffect(() => {
    // Schedule a tick exactly at the next 2-minute boundary, then repeat every 2 min
    function scheduleNext() {
      const msUntilNext = SLOT_MS - (Date.now() % SLOT_MS);
      const id = setTimeout(() => {
        setCurrentSlot(getSlot());
        scheduleNext(); // schedule the one after that
      }, msUntilNext + 50); // +50ms buffer to avoid landing in the old slot
      return id;
    }
    const id = scheduleNext();
    return () => clearTimeout(id);
  }, []);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchesCity = selectedCity
        ? p.city.toLowerCase() === selectedCity.toLowerCase() || p.location.toLowerCase().includes(selectedCity.toLowerCase())
        : true;
      const matchesSearch = searchQuery
        ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.about ?? '').toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCity && matchesSearch;
    });
  }, [profiles, selectedCity, searchQuery]);

  const rawVipProfiles      = filteredProfiles.filter((p) => p.tier.startsWith('VIP') || p.isPremium || p.tier === 'Premium');
  const rawStandardProfiles = filteredProfiles.filter((p) => !p.tier.startsWith('VIP') && !p.isPremium && p.tier !== 'Premium');

  // Seeded shuffle — VIP and Standard use different seed offsets so their orders differ
  const vipProfiles      = useMemo(() => seededShuffle(rawVipProfiles,      currentSlot * 2),     // eslint-disable-line react-hooks/exhaustive-deps
    [currentSlot, rawVipProfiles.length, selectedCity, searchQuery]);
  const standardProfiles = useMemo(() => seededShuffle(rawStandardProfiles, currentSlot * 2 + 1), // eslint-disable-line react-hooks/exhaustive-deps
    [currentSlot, rawStandardProfiles.length, selectedCity, searchQuery]);


  return (
    <div className="page-wrapper">
      <div className="content-wrapper">
        <main className="main-body" id="main-content" role="main">
          <div className="body-box">

            {/* ══ HERO SECTION ══ */}
            <section className="profiles-hero profiles-hero--compact" aria-labelledby="hero-title">
              <h1 className="hero-title hero-title--uganda" id="hero-title">
                <span className="brand-word brand-uganda">Uganda</span>
                <span className="brand-word brand-sexy">Sexy</span>
                <span className="brand-word brand-babes">Babes</span>
              </h1>
            </section>

            {/* ══ LAYOUT: SIDEBAR + CARDS AREA ══ */}
            <div className="layout-container">

              {/* Sidebar (Location only) */}
              <aside className="sidebar-left" id="locations" aria-label="Filter by location">
                <div className="location-widget">
                  <h2 className="widget-heading">
                    <button
                      type="button"
                      className="widget-toggle"
                      id="locationToggle"
                      aria-expanded={isLocationOpen}
                      aria-controls="locationList"
                      onClick={() => setIsLocationOpen(!isLocationOpen)}
                    >
                      <span className="widget-label">Babes Near You:</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ transform: isLocationOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </h2>

                  {isLocationOpen && (
                    <ul id="locationList" className="location-list">
                      {selectedCity && (
                        <li>
                          <button
                            type="button"
                            onClick={() => setSelectedCity('')}
                            style={{ background: 'none', border: 'none', color: '#FFD600', fontWeight: 700, cursor: 'pointer', padding: '0.4rem 1rem', width: '100%', textAlign: 'left' }}
                          >
                            ✕ Clear City Filter
                          </button>
                        </li>
                      )}
                      {LOCATIONS.map((loc) => {
                        const isActive = selectedCity.toLowerCase() === loc.name.toLowerCase();
                        return (
                          <li key={loc.slug}>
                            <button
                              type="button"
                              onClick={() => setSelectedCity(isActive ? '' : loc.name)}
                              style={{
                                background: isActive ? 'rgba(255,214,0,0.12)' : 'none',
                                border: 'none',
                                borderLeft: isActive ? '2px solid #FFD600' : '2px solid transparent',
                                color: isActive ? '#FFD600' : 'var(--gray-5)',
                                fontWeight: isActive ? 700 : 400,
                                cursor: 'pointer',
                                padding: '0.4rem 1rem',
                                width: '100%',
                                textAlign: 'left',
                                fontSize: '0.83rem',
                                transition: 'all 0.2s'
                              }}
                            >
                              {loc.name}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </aside>

              {/* ══ PROFILES AREA ══ */}
              <div className="profiles-area">

                {/* Active Filter Notice */}
                {(selectedCity || searchQuery) && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--black-3)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,214,0,0.3)', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#FFF' }}>
                      Filtering by: {selectedCity && <strong>City: {selectedCity} </strong>}
                      {searchQuery && <strong>Keyword: &quot;{searchQuery}&quot;</strong>}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setSelectedCity(''); setSearchQuery(''); }}
                      style={{ background: 'var(--yellow)', color: '#000', border: 'none', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Reset All
                    </button>
                  </div>
                )}

                {/* ── VIP BABES SECTION ── */}
                <div className="tier-heading tier-heading--vip" id="vip-section">
                  <span className="tier-count">{vipProfiles.length}</span>
                  <span className="tier-label">⭐ VIP Babes</span>
                </div>

                <div className="tier-description--vip">
                  <div className="desc-title">✦ The Elite Experience</div>
                  <div className="desc-text">
                    Uganda's most <em>captivating &amp; verified</em> ladies — premium photos, direct contact, and <em>unforgettable encounters</em> guaranteed.
                  </div>
                </div>

                {vipProfiles.length > 0 ? (
                  <div className="card-grid card-grid--vip">
                    {vipProfiles.map((profile, idx) => (
                      <ProfileCard key={profile.id} profile={profile} priority={idx === 0} />
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--gray-4)', padding: '1rem 0' }}>No VIP babes match your filter.</p>
                )}

                {/* ── ALL BABES SECTION ── */}
                <div className="tier-heading tier-heading--standard" id="all-section" style={{ marginTop: '2.5rem' }}>
                  <span className="tier-count">{standardProfiles.length}</span>
                  <span className="tier-label">All Babes</span>
                </div>

                <div className="tier-description--standard">
                  <div className="desc-text">
                    Real girls from across Uganda ready to meet and connect. Browse by location, check their photos and get in touch directly.
                  </div>
                </div>

                {standardProfiles.length > 0 ? (
                  <div className="card-grid card-grid--standard">
                    {standardProfiles.slice(0, visibleStandardCount).map((profile) => (
                      <ProfileCard key={profile.id} profile={profile} />
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--gray-4)', padding: '1rem 0' }}>No babes match your filter.</p>
                )}

                {/* Load More Button */}
                {standardProfiles.length > visibleStandardCount && (
                  <div className="load-more-wrap">
                    <button
                      className="btn-load-more"
                      onClick={() => setVisibleStandardCount((prev) => prev + 4)}
                    >
                      Load More Babes
                    </button>
                  </div>
                )}

              </div>{/* .profiles-area */}
            </div>{/* .layout-container */}

            {/* ══ ABOUT SECTION ══ */}
            <section className="about-section" id="about">
              <div className="about-inner">
                <h2>About Uganda Sexy Babes</h2>
                <p>
                  Uganda Sexy Babes is Uganda's premier dating platform connecting you with beautiful, fun and verified ladies across all major cities and towns in Uganda. Whether you're in Kampala, Entebbe, Jinja, Mbarara or anywhere else in Uganda, you'll find the perfect match here.
                </p>
                <p>
                  All profiles are manually reviewed and verified to ensure you always meet genuine people. Browse profiles, connect directly via phone call or WhatsApp, and enjoy unforgettable moments!
                </p>
                <div className="about-features">
                  <div className="feature-item"><span className="feature-icon">✅</span><span>Verified Profiles</span></div>
                  <div className="feature-item"><span className="feature-icon">🔒</span><span>Discreet &amp; Safe</span></div>
                  <div className="feature-item"><span className="feature-icon">📍</span><span>Nationwide Coverage</span></div>
                  <div className="feature-item"><span className="feature-icon">💬</span><span>Direct Contact</span></div>
                </div>
              </div>
            </section>

          </div>{/* .body-box */}
        </main>
      </div>
    </div>
  );
}
