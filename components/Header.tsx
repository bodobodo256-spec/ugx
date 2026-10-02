'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  return (
    <>
      {/* ══ DESKTOP HEADER ══ */}
      <header
        className="desktop-header"
        id="site-header"
        style={{
          boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.8)' : 'none'
        }}
      >
        <div className="header-topbar">
          <div className="header-logo">
            <a href="/" title="Uganda Sexy Babes">
              <div className="logo-text">
                <span className="logo-ug">Uganda</span>
                <span className="logo-sb">
                  <span style={{ color: '#FF2E55', fontStyle: 'italic', marginRight: '4px' }}>Sexy</span>
                  <span style={{ color: '#FFD600' }}>Babes</span>
                </span>
              </div>
            </a>
          </div>

          <div className="header-search-wrap">
            <form className="search-form" role="search" onSubmit={handleSearch} autoComplete="off">
              <div className="search-field">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7"/><path d="M20 20l-4.2-4.2"/>
                </svg>
                <input
                  type="search"
                  className="search-input"
                  placeholder="Search babes or locations…"
                  aria-label="Search babes or locations"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="search-btn">Search</button>
              </div>
            </form>
          </div>

          <div className="header-actions">
            <a className="btn-register" href="/register">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
              Register
            </a>
            <a className="btn-login" href="/register">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              Login
            </a>
          </div>
        </div>

        <nav className="header-navbar" aria-label="Main navigation">
          <ul className="primary-nav">
            <li className="has-dropdown">
              <a href="/" className="nav-link active">Home</a>
              <ul className="dropdown-menu">
                <li className="dropdown-label">Browse Profiles</li>
                <li><a href="/#vip-section"><span>⭐ VIP Babes</span></a></li>
                <li><a href="/#all-section"><span>👩 All Babes</span></a></li>
                <li><a href="/register"><span>✨ Create Profile</span></a></li>
              </ul>
            </li>
            <li><a href="/#vip-section" className="nav-link">VIP Babes</a></li>
            <li><a href="/#all-section" className="nav-link">All Babes</a></li>
            <li><a href="/register" className="nav-link">Register Profile</a></li>
            <li><a href="/#about" className="nav-link">About</a></li>
            <li><a href="/#locations" className="nav-link">Locations</a></li>
          </ul>
        </nav>
      </header>

      {/* ══ MOBILE HEADER ══ */}
      <header className="mobile-header" id="mobile-site-header">
        <div className="mobile-top-row">
          <button
            className="mobile-menu-btn"
            type="button"
            aria-label="Open menu"
            aria-expanded={isDrawerOpen}
            onClick={() => setIsDrawerOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>
            </svg>
          </button>
          <div className="mobile-logo">
            <a href="/">
              <div className="logo-text">
                <span className="logo-ug">Uganda</span>
                <span className="logo-sb">
                  <span style={{ color: '#FF2E55', fontStyle: 'italic', marginRight: '3px' }}>Sexy</span>
                  <span style={{ color: '#FFD600' }}>Babes</span>
                </span>
              </div>
            </a>
          </div>
          <div className="mobile-top-actions">
            <a href="/register" className="mobile-icon-btn" aria-label="Register">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="mobile-search-bar">
          <form className="search-form" role="search" onSubmit={handleSearch} autoComplete="off">
            <div className="search-field">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7"/><path d="M20 20l-4.2-4.2"/>
              </svg>
              <input
                type="search"
                className="search-input"
                placeholder="Search babes or locations…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
        </div>

        <nav className="mobile-quick-links" aria-label="Quick links">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/#vip-section">VIP</a></li>
            <li><a href="/#all-section">Babes</a></li>
            <li><a href="/register">Register</a></li>
          </ul>
        </nav>

        {/* Mobile Drawer */}
        <div className={`mobile-drawer ${isDrawerOpen ? 'open' : ''}`} id="mobileDrawer" aria-hidden={!isDrawerOpen}>
          <div className="mobile-drawer-inner">
            <div className="mobile-drawer-head">
              <div className="logo-text" style={{ fontSize: '1.2rem' }}>
                <span className="logo-ug">Uganda</span>
                <span className="logo-sb">
                  <span style={{ color: '#FF2E55', fontStyle: 'italic', marginRight: '3px' }}>Sexy</span>
                  <span style={{ color: '#FFD600' }}>Babes</span>
                </span>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>
            <ul className="mobile-drawer-links">
              <li className="drawer-section-label">Browse Profiles</li>
              <li><a href="/#vip-section" onClick={() => setIsDrawerOpen(false)}><span className="dot dot-vip"></span>⭐ VIP Babes</a></li>
              <li><a href="/#all-section" onClick={() => setIsDrawerOpen(false)}><span className="dot dot-female"></span>💋 All Babes</a></li>
              <li className="drawer-section-label">Main Menu</li>
              <li><a href="/" onClick={() => setIsDrawerOpen(false)}>🏠 Home</a></li>
              <li><a href="/register" onClick={() => setIsDrawerOpen(false)} className="drawer-cta">✨ Create Profile</a></li>
              <li><a href="/register" onClick={() => setIsDrawerOpen(false)} className="drawer-login">Login</a></li>
            </ul>
          </div>
        </div>
        <div
          className={`mobile-drawer-overlay ${isDrawerOpen ? 'open' : ''}`}
          id="drawerOverlay"
          onClick={() => setIsDrawerOpen(false)}
        ></div>
      </header>
    </>
  );
}
