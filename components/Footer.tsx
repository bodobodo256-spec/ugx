import React from 'react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <Image
                src="/logo.png"
                alt="Uganda Sexy Babes Logo"
                width={38}
                height={38}
                style={{ borderRadius: '50%', flexShrink: 0 }}
              />
              <div className="logo-text footer-logo" style={{ marginBottom: 0 }}>
                <span className="logo-ug">Uganda</span>
                <span className="logo-sb">
                  <span style={{ color: '#FF2E55', fontStyle: 'italic', marginRight: '4px' }}>Sexy</span>
                  <span style={{ color: '#FFD600' }}>Babes</span>
                </span>
              </div>
            </div>
            <p className="footer-tagline">Uganda&apos;s #1 Adult Hookup, Escort &amp; Dating Platform</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Browse</h4>
              <ul>
                <li><a href="/#vip-section">VIP Babes</a></li>
                <li><a href="/#all-section">All Babes</a></li>
                <li><a href="/register">Create Profile</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Top Cities</h4>
              <ul>
                <li><a href="/location/kampala">Kampala</a></li>
                <li><a href="/location/entebbe">Entebbe</a></li>
                <li><a href="/location/jinja">Jinja</a></li>
                <li><a href="/location/mbarara">Mbarara</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>About</h4>
              <ul>
                <li><a href="/#about">About Us</a></li>
                <li><a href="/register">Join Platform</a></li>
                <li><a href="/register">VIP Membership</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Account</h4>
              <ul>
                <li><a href="/register">Register</a></li>
                <li><a href="/register">Login</a></li>
                <li><a href="/admin" style={{ color: '#FFD600' }}>Admin Portal 🔒</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">&copy; {new Date().getFullYear()} Uganda Sexy Babes. All rights reserved.</p>
          <div className="footer-legal">
            <a href="/">Privacy Policy</a>
            <a href="/">Terms of Use</a>
            <a href="/">Disclaimer</a>
          </div>
          <p className="footer-disclaimer">
            This site is strictly for adults (18+) only. All listed models and companions have independently confirmed their age and consented to their profiles being published.
          </p>
        </div>
      </div>
    </footer>
  );
}
