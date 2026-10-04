import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo-text footer-logo">
              <span className="logo-ug">Uganda</span>
              <span className="logo-sb">
                <span style={{ color: '#FF2E55', fontStyle: 'italic', marginRight: '4px' }}>Sexy</span>
                <span style={{ color: '#FFD600' }}>Babes</span>
              </span>
            </div>
            <p className="footer-tagline">Uganda's #1 Dating &amp; Companionship Directory</p>
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
                <li><a href="/?city=Kampala">Kampala</a></li>
                <li><a href="/?city=Entebbe">Entebbe</a></li>
                <li><a href="/?city=Jinja">Jinja</a></li>
                <li><a href="/?city=Mbarara">Mbarara</a></li>
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
