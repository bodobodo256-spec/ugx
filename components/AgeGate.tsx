'use client';

import React, { useState, useEffect } from 'react';

export default function AgeGate() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const verified = sessionStorage.getItem('usb_age_verified');
      if (!verified) {
        setIsOpen(true);
      }
    } catch (e) {
      // fallback
      setIsOpen(false);
    }
  }, []);

  const handleEnter = () => {
    try {
      sessionStorage.setItem('usb_age_verified', 'true');
    } catch (e) {}
    setIsOpen(false);
  };

  const handleLeave = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="age-gate active" id="ageGate" role="dialog" aria-modal="true" aria-labelledby="ageGateTitle">
        <div className="age-gate-logo">
          <div className="logo-text">
            <span className="logo-ug">Uganda</span>
            <span className="logo-sb">
              <span style={{ color: '#FF2E55', fontStyle: 'italic', marginRight: '4px' }}>Sexy</span>
              <span style={{ color: '#FFD600' }}>Babes</span>
            </span>
          </div>
        </div>
        <h2 id="ageGateTitle">Adults Only (18+)</h2>
        <p>
          This website contains adult dating &amp; companionship profiles intended strictly for persons 18 years of age or older. By entering, you confirm you are at least 18 years old and agree to our Terms of Use.
        </p>
        <div className="age-gate-actions">
          <button className="btn-enter" id="ageGateEnter" onClick={handleEnter}>
            I am 18+ — Enter Site
          </button>
          <button className="btn-leave" onClick={handleLeave}>
            I am under 18 — Leave
          </button>
        </div>
      </div>
      <div className="age-gate-overlay active" id="ageGateOverlay"></div>
    </>
  );
}
