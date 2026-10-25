import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
            <p className="footer-tagline">Uganda&apos;s #1 Adult Hookup &amp; Escorts Platform</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Browse</h4>
              <ul>
                <li><Link href="/#vip-section">VIP Babes</Link></li>
                <li><Link href="/#all-section">All Babes</Link></li>
                <li><Link href="/register" style={{ color: '#FFD600', fontWeight: 600 }}>✨ Create Profile</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Top Cities</h4>
              <ul>
                <li><Link href="/location/kampala">Kampala</Link></li>
                <li><Link href="/location/entebbe">Entebbe</Link></li>
                <li><Link href="/location/jinja">Jinja</Link></li>
                <li><Link href="/location/mbarara">Mbarara</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>About</h4>
              <ul>
                <li><Link href="/#about">About Us</Link></li>
                <li><Link href="/register">Join Platform</Link></li>
                <li><Link href="/register">VIP Membership</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Account</h4>
              <ul>
                <li><Link href="/register">Register</Link></li>
                <li><Link href="/register">Login</Link></li>
                <li><Link href="/admin" style={{ color: '#FFD600' }}>Admin Portal 🔒</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">&copy; {new Date().getFullYear()} Uganda Sexy Babes. All rights reserved.</p>
          <div className="footer-legal">
            <Link href="/">Privacy Policy</Link>
            <Link href="/">Terms of Use</Link>
            <Link href="/">Disclaimer</Link>
          </div>
          <p className="footer-disclaimer">
            This site is strictly for adults (18+) only. All listed models and companions have independently confirmed their age and consented to their profiles being published.
          </p>
        </div>
      </div>
    </footer>
  );
}
