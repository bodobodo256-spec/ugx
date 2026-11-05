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
                <li><Link href="/register">Register</Link></li>
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
              </ul>
            </div>
          </div>
        </div>
        {/* ══ TELEGRAM CTA — appears at bottom of every page ══ */}
        <div className="footer-telegram-row" style={{ textAlign: 'center', borderTop: '1px solid rgba(34,158,217,0.2)', padding: '1.25rem 0 0.5rem', marginTop: '1rem' }}>
          <a
            href={process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/ugandasexybabes'}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '0.88rem',
              padding: '0.6rem 1.4rem',
              borderRadius: '8px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(34,158,217,0.35)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.17 3.35-1.37 3.73-1.38.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            Join our Telegram Channel →
          </a>
          <p style={{ color: 'var(--gray-4,#a0aec0)', fontSize: '0.75rem', marginTop: '0.4rem' }}>
            Hot new babes, real-time updates &amp; direct hookup announcements
          </p>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Uganda Sexy Babes. All rights reserved<Link href="/admin" style={{ color: 'inherit', textDecoration: 'none', cursor: 'default' }} title="">.</Link>
          </p>
          <div className="footer-legal">
            <Link href="/">Privacy Policy</Link>
            <Link href="/">Terms of Use</Link>
            <Link href="/">Disclaimer</Link>
          </div>
          <p className="footer-disclaimer">
            This site is strictly for adults (18+) only. All listed models and companions have independently confirmed their age and consented to their profiles being published.
          </p>
          {/* Secret invisible dot at extreme bottom of page */}
          <div style={{ textAlign: 'center', marginTop: '0.75rem', lineHeight: 1 }}>
            <Link
              href="/admin"
              className="secret-admin-dot"
              aria-label="Admin Access"
              title=""
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
