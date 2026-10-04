'use client';

import React, { useState, useMemo, useRef, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type Profile } from '@/db/schema';
import { LOCATIONS } from '@/data/locations';
import {
  toggleProfileApproval,
  toggleProfileArchive,
  toggleProfileVip,
  toggleProfilePremium,
  toggleProfileNew,
  toggleProfileVerified,
  updatePaymentStatus,
  adminCreateProfile,
  adminUpdateProfile,
  deleteProfile,
  fetchAdminProfiles,
} from '@/app/actions/profiles';
import '@/app/admin/admin.css';

interface AdminDashboardProps {
  initialProfiles: Profile[];
}

export default function AdminDashboard({ initialProfiles }: AdminDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ── Authentication Gate ──
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ug_admin_auth') === 'true';
    }
    return false;
  });
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState('');

  // ── Data & Filters State ──
  const [profilesList, setProfilesList] = useState<Profile[]>(initialProfiles);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'payments' | 'vip' | 'premium' | 'new' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastIsError, setToastIsError] = useState(false);

  // ── Modals State ──
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [paymentModalProfile, setPaymentModalProfile] = useState<Profile | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // ── View Mode (table for desktop, cards for mobile) ──
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  const addPhotoInputRef = useRef<HTMLInputElement>(null);
  const editPhotoInputRef = useRef<HTMLInputElement>(null);

  // ── Sync profilesList when server re-fetches (router.refresh()) ──
  useEffect(() => {
    setProfilesList(initialProfiles);
  }, [initialProfiles]);

  // ── Toast Notification Helper ──
  const showToast = (msg: string, isError = false) => {
    setToastMsg(msg);
    setToastIsError(isError);
    setTimeout(() => setToastMsg(null), isError ? 6000 : 3500);
  };

  // ── Manual Refresh (re-fetch from DB) ──
  const handleRefresh = async () => {
    showToast('Refreshing data from database...');
    try {
      const fresh = await fetchAdminProfiles();
      if (fresh && fresh.length) {
        setProfilesList(fresh);
        showToast(`✅ Database synced (${fresh.length} profiles)!`);
      }
    } catch (err) {
      showToast('❌ Refresh failed: ' + String(err), true);
    }
    startTransition(() => {
      router.refresh();
    });
  };

  // ── Login Handler ──
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Only accept the single configured passkey (case-sensitive)
    if (passkeyInput.trim() === 'Badman256') {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ug_admin_auth', 'true');
      }
      setAuthError('');
      showToast('Welcome to Uganda Sexy Babes Admin Portal!');
    } else {
      setAuthError('Incorrect admin passkey. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ug_admin_auth');
    }
  };

  // ── Filtered Profiles ──
  const filteredProfiles = useMemo(() => {
    return profilesList.filter((p) => {
      // Tab filter
      if (activeTab === 'pending' && p.isApproved) return false;
      if (activeTab === 'payments' && p.paymentStatus === 'verified') return false;
      if (activeTab === 'vip' && !p.tier.startsWith('VIP')) return false;
      if (activeTab === 'premium' && !p.isPremium && p.tier !== 'Premium') return false;
      if (activeTab === 'new' && !p.isNew) return false;
      if (activeTab === 'archived' && !p.isArchived) return false;
      if (activeTab !== 'archived' && p.isArchived) return false; // Hide archived in regular tabs

      // City filter
      if (selectedCity && p.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesPhone = p.phone.toLowerCase().includes(q);
        const matchesWa = p.whatsapp.toLowerCase().includes(q);
        const matchesLoc = p.location.toLowerCase().includes(q);
        const matchesRef = (p.paymentRef ?? '').toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesWa || matchesLoc || matchesRef;
      }

      return true;
    });
  }, [profilesList, activeTab, selectedCity, searchQuery]);

  // ── Stats Calculations ──
  const stats = useMemo(() => {
    const total = profilesList.length;
    const pendingApproval = profilesList.filter((p) => !p.isApproved && !p.isArchived).length;
    const pendingPayments = profilesList.filter((p) => p.paymentStatus !== 'verified' && !p.isArchived).length;
    const vipCount = profilesList.filter((p) => p.tier.startsWith('VIP') && !p.isArchived).length;
    const premiumCount = profilesList.filter((p) => (p.isPremium || p.tier === 'Premium') && !p.isArchived).length;
    const archivedCount = profilesList.filter((p) => p.isArchived).length;

    return { total, pendingApproval, pendingPayments, vipCount, premiumCount, archivedCount };
  }, [profilesList]);

  // ── Generic action runner: calls server action, shows toast, then refreshes from DB ──
  const runAction = async <T extends { success: boolean; error?: string }>(
    label: string,
    action: () => Promise<T>,
    successMsg: string,
    optimisticUpdate?: () => void
  ) => {
    optimisticUpdate?.();
    const res = await action();
    if (res.success) {
      showToast(`✅ ${successMsg}`);
      // Refresh state directly from DB
      try {
        const fresh = await fetchAdminProfiles();
        if (fresh && fresh.length) setProfilesList(fresh);
      } catch (err) {
        console.error('Fetch error:', err);
      }
      startTransition(() => { router.refresh(); });
    } else {
      const errMsg = res.error ?? 'Unknown error';
      showToast(`❌ ${label} failed: ${errMsg}`, true);
      // Revert optimistic update by re-syncing from server
      try {
        const fresh = await fetchAdminProfiles();
        if (fresh && fresh.length) setProfilesList(fresh);
      } catch (err) {
        console.error('Fetch error:', err);
      }
      startTransition(() => { router.refresh(); });
    }
  };

  // ── Quick Toggle Handlers ──

  const handleToggleApproval = async (profile: Profile) => {
    const nextVal = !profile.isApproved;
    setActionLoadingId(profile.id);
    await runAction(
      'Approval',
      () => toggleProfileApproval(profile.id, nextVal),
      `${profile.name} is now ${nextVal ? 'Approved & Live ✅' : 'Revoked — Hidden from public'}`,
      () => setProfilesList((prev) => prev.map((p) => p.id === profile.id ? { ...p, isApproved: nextVal } : p))
    );
    setActionLoadingId(null);
  };

  const handleToggleArchive = async (profile: Profile) => {
    const nextVal = !profile.isArchived;
    setActionLoadingId(profile.id);
    await runAction(
      'Archive',
      () => toggleProfileArchive(profile.id, nextVal),
      `${profile.name} ${nextVal ? 'archived 📦' : 'restored to active ↩️'}`,
      () => setProfilesList((prev) => prev.map((p) => p.id === profile.id ? { ...p, isArchived: nextVal } : p))
    );
    setActionLoadingId(null);
  };

  const handleToggleVip = async (profile: Profile) => {
    const isCurrentlyVip = profile.tier.startsWith('VIP');
    const nextVal = !isCurrentlyVip;
    setActionLoadingId(profile.id);
    await runAction(
      'VIP',
      () => toggleProfileVip(profile.id, nextVal),
      `${profile.name} tier → ${nextVal ? 'VIP ⭐' : 'Standard'}`,
      () => setProfilesList((prev) => prev.map((p) => p.id === profile.id ? { ...p, tier: nextVal ? 'VIP' : 'Standard' } : p))
    );
    setActionLoadingId(null);
  };

  const handleTogglePremium = async (profile: Profile) => {
    const nextVal = !profile.isPremium;
    setActionLoadingId(profile.id);
    await runAction(
      'Premium',
      () => toggleProfilePremium(profile.id, nextVal),
      `${profile.name} Premium ${nextVal ? 'activated 💎' : 'removed'}`,
      () => setProfilesList((prev) => prev.map((p) => p.id === profile.id ? { ...p, isPremium: nextVal } : p))
    );
    setActionLoadingId(null);
  };

  const handleToggleNew = async (profile: Profile) => {
    const nextVal = !profile.isNew;
    setActionLoadingId(profile.id);
    await runAction(
      'New badge',
      () => toggleProfileNew(profile.id, nextVal),
      `${profile.name} "New" badge ${nextVal ? 'enabled 🆕' : 'removed'}`,
      () => setProfilesList((prev) => prev.map((p) => p.id === profile.id ? { ...p, isNew: nextVal } : p))
    );
    setActionLoadingId(null);
  };

  const handleQuickVerifyPayment = async (profile: Profile) => {
    const isCurrentlyPaid = profile.paymentStatus === 'verified';
    const nextStatus = isCurrentlyPaid ? 'pending' : 'verified';
    const amount = profile.tier.startsWith('VIP') ? 25000 : 10000;
    setActionLoadingId(profile.id);
    await runAction(
      'Payment',
      () => updatePaymentStatus(profile.id, nextStatus, amount),
      nextStatus === 'verified'
        ? `Payment verified (${amount.toLocaleString()} UGX) — Profile approved! 💳`
        : 'Payment marked as Pending',
      () => setProfilesList((prev) =>
        prev.map((p) => p.id === profile.id
          ? { ...p, paymentStatus: nextStatus, paymentAmount: amount, isApproved: nextStatus === 'verified' ? true : p.isApproved }
          : p
        )
      )
    );
    setActionLoadingId(null);
  };

  const handleDeleteProfile = async (profile: Profile) => {
    if (!confirm(`Permanently delete ${profile.name}'s profile? This cannot be undone.`)) return;
    setActionLoadingId(profile.id);
    await runAction(
      'Delete',
      () => deleteProfile(profile.id),
      `Deleted ${profile.name}`,
      () => setProfilesList((prev) => prev.filter((p) => p.id !== profile.id))
    );
    setActionLoadingId(null);
  };

  // ── Add Profile Form Submission ──
  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await adminCreateProfile(formData);
    if (res.success) {
      showToast('✅ New profile created and saved to database!');
      setIsAddModalOpen(false);
      try {
        const fresh = await fetchAdminProfiles();
        if (fresh && fresh.length) setProfilesList(fresh);
      } catch (err) {
        console.error('Fetch error:', err);
      }
      startTransition(() => { router.refresh(); });
    } else {
      const err = 'error' in res ? res.error : 'Failed to create profile';
      showToast(`❌ Create failed: ${err}`, true);
      alert(`Failed to create profile:\n\n${err}`);
    }
  };

  // ── Edit Profile Form Submission ──
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProfile) return;
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Explicitly guarantee ID is present in formData
    formData.set('id', String(editingProfile.id));

    // Capture submitted values for immediate UI update
    const submittedName = (formData.get('name') as string)?.trim() || editingProfile.name;
    const submittedAge = parseInt(formData.get('age') as string, 10) || editingProfile.age;
    const submittedCity = (formData.get('city') as string) || editingProfile.city;
    const submittedLocation = (formData.get('location') as string) || editingProfile.location;
    const submittedTier = ((formData.get('tier') as string) || editingProfile.tier) as Profile['tier'];
    const submittedPhone = (formData.get('phone') as string) || editingProfile.phone;
    const submittedWhatsapp = (formData.get('whatsapp') as string) || editingProfile.whatsapp;
    const submittedAbout = ((formData.get('about') as string) ?? editingProfile.about);
    const submittedPhotoUrl = (formData.get('photoUrl') as string)?.trim() || editingProfile.photoUrl;
    const submittedStatus = (formData.get('status') as Profile['status']) || editingProfile.status;
    const submittedIsApproved = formData.get('isApproved') === 'true';
    const submittedIsArchived = formData.get('isArchived') === 'true';
    const submittedIsPremium = formData.get('isPremium') === 'true' || submittedTier === 'Premium';
    const submittedIsNew = formData.get('isNew') === 'true';
    const submittedIsVerified = formData.get('isVerified') === 'true';
    const submittedPaymentStatus = (formData.get('paymentStatus') as Profile['paymentStatus']) || editingProfile.paymentStatus;
    const submittedPaymentAmount = parseInt(formData.get('paymentAmount') as string, 10) || editingProfile.paymentAmount;
    const submittedPaymentRef = (formData.get('paymentRef') as string) ?? editingProfile.paymentRef;

    const res = await adminUpdateProfile(formData);
    if (res.success) {
      showToast(`✅ ${submittedName} updated and saved to database!`);
      // Update local state immediately so user sees the change right away
      setProfilesList((prev) =>
        prev.map((p) =>
          p.id === editingProfile.id
            ? {
                ...p,
                name: submittedName,
                age: submittedAge,
                city: submittedCity,
                location: submittedLocation,
                tier: submittedTier,
                phone: submittedPhone,
                whatsapp: submittedWhatsapp,
                about: submittedAbout,
                photoUrl: submittedPhotoUrl,
                status: submittedStatus,
                isApproved: submittedIsApproved,
                isArchived: submittedIsArchived,
                isPremium: submittedIsPremium,
                isNew: submittedIsNew,
                isVerified: submittedIsVerified,
                paymentStatus: submittedPaymentStatus,
                paymentAmount: submittedPaymentAmount,
                paymentRef: submittedPaymentRef,
              }
            : p
        )
      );
      setEditingProfile(null);
      try {
        const fresh = await fetchAdminProfiles();
        if (fresh && fresh.length) setProfilesList(fresh);
      } catch (err) {
        console.error('Fetch error:', err);
      }
      startTransition(() => { router.refresh(); });
    } else {
      const err = 'error' in res ? res.error : 'Failed to update profile';
      showToast(`❌ Update failed: ${err}`, true);
      alert(`Failed to update profile:\n\n${err}`);
    }
  };

  // ── Payment Detail Modal Update ──
  const handleSavePaymentModal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!paymentModalProfile) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const status = formData.get('paymentStatus') as 'verified' | 'pending' | 'unpaid' | 'failed';
    const amount = parseInt((formData.get('paymentAmount') as string) || '0', 10);
    const ref = (formData.get('paymentRef') as string) || '';

    setActionLoadingId(paymentModalProfile.id);
    await runAction(
      'Payment update',
      () => updatePaymentStatus(paymentModalProfile.id, status, amount, ref),
      `Payment updated for ${paymentModalProfile.name}!`,
      () => setProfilesList((prev) =>
        prev.map((p) =>
          p.id === paymentModalProfile.id
            ? { ...p, paymentStatus: status, paymentAmount: amount, paymentRef: ref, isApproved: status === 'verified' ? true : p.isApproved }
            : p
        )
      )
    );
    setActionLoadingId(null);
    setPaymentModalProfile(null);
  };

  // ── Render Authentication Screen ──
  if (!isAuthenticated) {
    return (
      <div className="admin-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: '#121212', border: '1px solid #333', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>Uganda</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FF2E55', fontStyle: 'italic' }}>Sexy</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFD600' }}>Babes</span>
            </div>
            <div className="uganda-tri-bar" style={{ justifyContent: 'center', margin: '0.4rem auto 0.8rem' }}>
              <span className="bar-stripe bar-black"></span>
              <span className="bar-stripe bar-yellow"></span>
              <span className="bar-stripe bar-red"></span>
            </div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>Admin Portal Access</h2>
            <p style={{ color: '#888', fontSize: '0.85rem' }}>Enter your administrator passkey to manage profiles, verify weekly payments, and approve listings.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#aaa', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Admin Passkey
              </label>
              <input
                type="password"
                className="admin-input"
                style={{ width: '100%' }}
                placeholder="Enter passkey (e.g. admin256)"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                autoFocus
                required
              />
              {authError && (
                <div style={{ color: '#FF2E55', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>
                  ⚠️ {authError}
                </div>
              )}
            </div>

            <button type="submit" className="admin-btn admin-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              🔒 Unlock Admin Dashboard
            </button>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link href="/" style={{ color: '#888', fontSize: '0.82rem', textDecoration: 'none' }}>
                ← Return to Public Website
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">

        {/* ══ HEADER ══ */}
        <header className="admin-header">
          <div className="admin-header-left">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 className="admin-title">
                  <span style={{ color: '#FFD600' }}>Uganda Sexy Babes</span>
                  <span style={{ fontSize: '1rem', color: '#888' }}>/</span>
                  <span style={{ fontSize: '1.1rem' }}>Admin Dashboard</span>
                </h1>
                <span className="admin-badge">LIVE ADMIN</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#777', marginTop: '2px' }}>
                Manage models, approve pending submissions, verify weekly mobile money payments (10,000shs / 25,000shs), and configure VIP/Premium statuses.
              </div>
            </div>
          </div>

          <div className="admin-header-actions">
            <Link href="/" target="_blank" className="admin-btn admin-btn-secondary">
              🌐 View Live Site
            </Link>
            <button
              type="button"
              onClick={handleRefresh}
              className="admin-btn admin-btn-secondary"
              title="Sync latest data directly from Cloudflare D1"
              disabled={isPending}
            >
              🔄 Refresh DB
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="admin-btn admin-btn-primary"
            >
              ➕ Add New Profile
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="admin-btn admin-btn-secondary"
              title="Logout from admin session"
            >
              🚪 Logout
            </button>
          </div>
        </header>

        {/* ══ KPI SUMMARY CARDS ══ */}
        <div className="admin-kpis">
          <div
            className={`kpi-card ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <div className="kpi-title">
              <span>Total Profiles</span>
              <span>👥</span>
            </div>
            <div className="kpi-value">{stats.total}</div>
            <div className="kpi-indicator">All registered babes</div>
          </div>

          <div
            className={`kpi-card ${stats.pendingApproval > 0 ? 'kpi-alert' : ''} ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <div className="kpi-title">
              <span>Pending Approval</span>
              <span>⏳</span>
            </div>
            <div className="kpi-value" style={{ color: stats.pendingApproval > 0 ? '#FFD600' : '#fff' }}>
              {stats.pendingApproval}
            </div>
            <div className="kpi-indicator">Needs admin review</div>
          </div>

          <div
            className={`kpi-card ${stats.pendingPayments > 0 ? 'kpi-alert' : ''} ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <div className="kpi-title">
              <span>Unverified Payments</span>
              <span>💳</span>
            </div>
            <div className="kpi-value" style={{ color: stats.pendingPayments > 0 ? '#FF2E55' : '#fff' }}>
              {stats.pendingPayments}
            </div>
            <div className="kpi-indicator">MoMo fee verification</div>
          </div>

          <div
            className={`kpi-card ${activeTab === 'vip' ? 'active' : ''}`}
            onClick={() => setActiveTab('vip')}
          >
            <div className="kpi-title">
              <span>VIP Babes</span>
              <span>⭐</span>
            </div>
            <div className="kpi-value" style={{ color: '#FFD600' }}>{stats.vipCount}</div>
            <div className="kpi-indicator">25,000shs / week</div>
          </div>

          <div
            className={`kpi-card ${activeTab === 'premium' ? 'active' : ''}`}
            onClick={() => setActiveTab('premium')}
          >
            <div className="kpi-title">
              <span>Premium Babes</span>
              <span>💎</span>
            </div>
            <div className="kpi-value" style={{ color: '#d2b4de' }}>{stats.premiumCount}</div>
            <div className="kpi-indicator">Elite badge active</div>
          </div>

          <div
            className={`kpi-card ${activeTab === 'archived' ? 'active' : ''}`}
            onClick={() => setActiveTab('archived')}
          >
            <div className="kpi-title">
              <span>Archived</span>
              <span>📦</span>
            </div>
            <div className="kpi-value" style={{ color: '#888' }}>{stats.archivedCount}</div>
            <div className="kpi-indicator">Hidden from public</div>
          </div>
        </div>

        {/* ══ CONTROLS: TABS & SEARCH ══ */}
        <div className="admin-controls">
          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Profiles <span className="tab-badge">{stats.total - stats.archivedCount}</span>
            </button>
            <button
              className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              ⏳ Pending Approval <span className="tab-badge" style={{ background: stats.pendingApproval > 0 ? '#FFD600' : '#333', color: stats.pendingApproval > 0 ? '#000' : '#fff' }}>{stats.pendingApproval}</span>
            </button>
            <button
              className={`admin-tab ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              💳 Payment Verification <span className="tab-badge" style={{ background: stats.pendingPayments > 0 ? '#FF2E55' : '#333' }}>{stats.pendingPayments}</span>
            </button>
            <button
              className={`admin-tab ${activeTab === 'vip' ? 'active' : ''}`}
              onClick={() => setActiveTab('vip')}
            >
              ⭐ VIP Profiles <span className="tab-badge">{stats.vipCount}</span>
            </button>
            <button
              className={`admin-tab ${activeTab === 'premium' ? 'active' : ''}`}
              onClick={() => setActiveTab('premium')}
            >
              💎 Premium Profiles <span className="tab-badge">{stats.premiumCount}</span>
            </button>
            <button
              className={`admin-tab ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => setActiveTab('new')}
            >
              🆕 New Babes
            </button>
            <button
              className={`admin-tab ${activeTab === 'archived' ? 'active' : ''}`}
              onClick={() => setActiveTab('archived')}
            >
              📦 Archived Babes <span className="tab-badge">{stats.archivedCount}</span>
            </button>
          </div>

          <div className="admin-filter-row">
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by name, phone, WhatsApp, location, or payment ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className="admin-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">All Cities / Districts</option>
              {LOCATIONS.map((loc) => (
                <option key={loc.slug} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>

            {/* View mode toggle */}
            <div className="view-mode-toggle">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Card view — works on all screen sizes"
              >
                🃏 Cards
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table view — best for desktop"
              >
                📋 Table
              </button>
            </div>

            {(searchQuery || selectedCity) && (
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('');
                }}
              >
                ✕ Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* ══ CARD VIEW (default — all buttons visible on mobile & desktop) ══ */}
        {viewMode === 'cards' && (
          filteredProfiles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#888', background: '#111', borderRadius: '14px', border: '1px solid #222', marginBottom: '1.5rem' }}>
              No profiles found matching this filter or search.
            </div>
          ) : (
            <div className="admin-cards-grid">
              {filteredProfiles.map((p) => {
                const isVip = p.tier.startsWith('VIP');
                const isPaid = p.paymentStatus === 'verified';
                const isLoading = actionLoadingId === p.id;
                return (
                  <div
                    key={p.id}
                    className={`admin-profile-card ${!p.isApproved && !p.isArchived ? 'card-unapproved' : ''} ${p.isArchived ? 'card-archived' : ''}`}
                  >
                    {/* Top: Photo + Info */}
                    <div className="card-top">
                      <div
                        className="card-photo-box"
                        onClick={() => p.photoUrl && setPreviewPhotoUrl(p.photoUrl)}
                        title="Click to preview photo"
                      >
                        <img
                          src={p.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=120&q=80'}
                          alt={p.name}
                          className="card-photo-img"
                        />
                      </div>
                      <div className="card-info">
                        <div className="card-name-row">
                          <h3 className="card-name">{p.name}</h3>
                          <span className={`pill ${isVip ? 'pill-vip' : p.tier === 'Premium' ? 'pill-premium' : 'pill-standard'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                            {isVip ? '⭐ VIP' : p.tier === 'Premium' ? '💎' : p.tier}
                          </span>
                        </div>
                        <div className="card-location">📍 {p.location || p.city} · {p.age} yrs</div>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                          {p.isNew && <span className="badge-tag badge-new">NEW</span>}
                          {p.isVerified && <span className="badge-tag badge-verified">VERIFIED</span>}
                          {p.isArchived && <span className="badge-tag" style={{ background: '#444', color: '#ccc' }}>ARCHIVED</span>}
                          {p.isPremium && <span className="badge-tag" style={{ background: '#7d3c98', color: '#fff' }}>PREM</span>}
                        </div>
                        <div className="card-contacts">
                          <a href={`tel:${p.phone}`} className="contact-link">📞 {p.phone}</a>
                          <a href={`https://wa.me/${p.whatsapp}`} target="_blank" rel="noopener noreferrer" className="contact-link wa">💬 WhatsApp</a>
                        </div>
                      </div>
                    </div>

                    {/* Status Strip */}
                    <div className="card-status-strip">
                      <span className={`pill ${p.isApproved ? 'pill-approved' : 'pill-pending'}`} style={{ fontSize: '0.72rem' }}>
                        {p.isApproved ? '✅ Approved' : '⏳ Pending'}
                      </span>
                      <span className={`pill ${isPaid ? 'pill-approved' : p.paymentStatus === 'unpaid' ? 'pill-unpaid' : 'pill-pending'}`} style={{ fontSize: '0.72rem' }}>
                        {isPaid ? `🟢 Paid (${(p.paymentAmount || (isVip ? 25000 : 10000)).toLocaleString()}shs)` : p.paymentStatus === 'unpaid' ? '🔴 Unpaid' : '🟡 Pending Pay'}
                      </span>
                      {p.paymentRef && (
                        <span style={{ fontSize: '0.7rem', color: '#FFD600' }} title={p.paymentRef}>
                          Ref: {p.paymentRef.slice(0, 14)}{p.paymentRef.length > 14 ? '…' : ''}
                        </span>
                      )}
                    </div>

                    {/* Primary Buttons */}
                    <div className="card-primary-actions">
                      <button type="button" className="btn-card-edit" onClick={() => setEditingProfile(p)} disabled={isLoading}>
                        ✏️ Edit Full Profile
                      </button>
                      <button type="button" className="btn-card-payment" onClick={() => setPaymentModalProfile(p)} disabled={isLoading}>
                        💳 Payment Details
                      </button>
                    </div>

                    {/* Toggle Chips Grid */}
                    <div className="card-toggles-section">
                      <div className="toggles-header">
                        <span>Quick Actions</span>
                        {isLoading && <span style={{ color: '#FFD600', fontWeight: 700 }}>⏳ Saving to DB...</span>}
                      </div>
                      <div className="toggles-buttons-grid">
                        <button
                          type="button"
                          className={`toggle-chip ${p.isApproved ? 'active-approval' : ''}`}
                          onClick={() => handleToggleApproval(p)}
                          disabled={isLoading}
                        >
                          {p.isApproved ? '✅ Approved' : '⏳ Approve'}
                        </button>
                        <button
                          type="button"
                          className={`toggle-chip ${isPaid ? 'active-approval' : ''}`}
                          onClick={() => handleQuickVerifyPayment(p)}
                          disabled={isLoading}
                        >
                          {isPaid ? '💳 Paid ✓' : '💳 Verify Pay'}
                        </button>
                        <button
                          type="button"
                          className={`toggle-chip ${isVip ? 'active-vip' : ''}`}
                          onClick={() => handleToggleVip(p)}
                          disabled={isLoading}
                        >
                          ⭐ {isVip ? 'VIP ON' : 'Make VIP'}
                        </button>
                        <button
                          type="button"
                          className={`toggle-chip ${p.isPremium ? 'active-prem' : ''}`}
                          onClick={() => handleTogglePremium(p)}
                          disabled={isLoading}
                        >
                          💎 {p.isPremium ? 'Prem ON' : 'Premium'}
                        </button>
                        <button
                          type="button"
                          className={`toggle-chip ${p.isNew ? 'active-new' : ''}`}
                          onClick={() => handleToggleNew(p)}
                          disabled={isLoading}
                        >
                          🆕 {p.isNew ? 'New ON' : 'New OFF'}
                        </button>
                        <button
                          type="button"
                          className={`toggle-chip ${p.isArchived ? 'active-archive' : ''}`}
                          onClick={() => handleToggleArchive(p)}
                          disabled={isLoading}
                        >
                          {p.isArchived ? '↩️ Restore' : '📦 Archive'}
                        </button>
                        <button
                          type="button"
                          className="toggle-chip chip-delete"
                          onClick={() => handleDeleteProfile(p)}
                          disabled={isLoading}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ══ TABLE VIEW (desktop only) ══ */}
        {viewMode === 'table' && (
          <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Tier &amp; Badges</th>
                <th>Contact</th>
                <th>Approval</th>
                <th>Weekly Payment</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#888' }}>
                    No profiles found matching this filter or search.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p) => {
                  const isVip = p.tier.startsWith('VIP');
                  const isPaid = p.paymentStatus === 'verified';
                  const isLoading = actionLoadingId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className={`${!p.isApproved ? 'row-unapproved' : ''} ${p.isArchived ? 'row-archived' : ''}`}
                    >
                      {/* Column 1: Profile info & photo */}
                      <td>
                        <div className="profile-cell">
                          <div
                            className="profile-thumb-wrap"
                            onClick={() => p.photoUrl && setPreviewPhotoUrl(p.photoUrl)}
                            title="Click to view full photo"
                          >
                            <img
                              src={p.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=120&q=80'}
                              alt={p.name}
                              className="profile-thumb"
                            />
                          </div>
                          <div>
                            <div className="profile-info-name">
                              <span>{p.name}</span>
                              <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 500 }}>
                                ({p.age} yrs)
                              </span>
                            </div>
                            <div className="profile-info-sub">
                              📍 {p.location || p.city}
                            </div>
                            <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.35rem' }}>
                              {p.isNew && <span className="badge-tag badge-new">NEW</span>}
                              {p.isVerified && <span className="badge-tag badge-verified">VERIFIED</span>}
                              {p.isArchived && <span className="badge-tag" style={{ background: '#444', color: '#ccc' }}>ARCHIVED</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Tier & Badges */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                          <span className={`pill ${isVip ? 'pill-vip' : p.tier === 'Premium' ? 'pill-premium' : 'pill-standard'}`}>
                            {isVip ? '⭐ VIP' : p.tier === 'Premium' ? '💎 Premium' : p.tier}
                          </span>
                          {p.isPremium && p.tier !== 'Premium' && (
                            <span className="pill pill-premium" style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}>
                              💎 Premium
                            </span>
                          )}
                          <span style={{ fontSize: '0.72rem', color: '#888' }}>
                            {isVip ? '25,000shs/wk' : '10,000shs/wk'}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Contact */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <a
                            href={`tel:${p.phone}`}
                            style={{ color: '#fff', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            📞 {p.phone}
                          </a>
                          <a
                            href={`https://wa.me/${p.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#22C55E', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            💬 {p.whatsapp}
                          </a>
                        </div>
                      </td>

                      {/* Column 4: Approval Status */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-start' }}>
                          <span className={`pill ${p.isApproved ? 'pill-approved' : 'pill-pending'}`}>
                            {p.isApproved ? '✅ Approved' : '⏳ Pending'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#888' }}>
                            {p.isApproved ? 'Live in directory' : 'Hidden from public'}
                          </span>
                        </div>
                      </td>

                      {/* Column 5: Payment Status */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-start' }}>
                          <span className={`pill ${isPaid ? 'pill-approved' : p.paymentStatus === 'unpaid' ? 'pill-unpaid' : 'pill-pending'}`}>
                            {isPaid ? `🟢 Paid (${(p.paymentAmount || (isVip ? 25000 : 10000)).toLocaleString()}shs)` : p.paymentStatus === 'unpaid' ? '🔴 Unpaid' : '🟡 Pending'}
                          </span>
                          {p.paymentRef && (
                            <span style={{ fontSize: '0.74rem', color: '#FFD600', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.paymentRef}>
                              Ref: {p.paymentRef}
                            </span>
                          )}
                          <button
                            type="button"
                            className="btn-mini"
                            style={{ background: '#1c1c1c', border: '1px solid #333', color: '#bbb' }}
                            onClick={() => setPaymentModalProfile(p)}
                          >
                            ⚙️ Details
                          </button>
                        </div>
                      </td>

                      {/* Column 6: Actions Toolbar */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                          {/* Approve / Revoke */}
                          <button
                            type="button"
                            className={`btn-mini ${p.isApproved ? 'btn-mini-revoke' : 'btn-mini-approve'}`}
                            onClick={() => handleToggleApproval(p)}
                            disabled={isLoading}
                            title={p.isApproved ? 'Revoke Approval' : 'Approve Profile'}
                          >
                            {p.isApproved ? 'Revoke' : '✅ Approve'}
                          </button>

                          {/* Quick Verify Payment */}
                          <button
                            type="button"
                            className={`btn-mini ${isPaid ? 'btn-mini-revoke' : 'btn-mini-approve'}`}
                            onClick={() => handleQuickVerifyPayment(p)}
                            disabled={isLoading}
                            title={isPaid ? 'Mark Payment as Pending' : 'Verify Weekly Payment'}
                          >
                            {isPaid ? 'Unverify' : '💳 Verify'}
                          </button>

                          {/* VIP toggle */}
                          <button
                            type="button"
                            className={`btn-mini btn-mini-vip ${isVip ? 'active' : ''}`}
                            onClick={() => handleToggleVip(p)}
                            disabled={isLoading}
                            title="Toggle VIP Status"
                          >
                            ⭐ VIP
                          </button>

                          {/* Premium toggle */}
                          <button
                            type="button"
                            className={`btn-mini btn-mini-prem ${p.isPremium ? 'active' : ''}`}
                            onClick={() => handleTogglePremium(p)}
                            disabled={isLoading}
                            title="Toggle Premium Status"
                          >
                            💎 Prem
                          </button>

                          {/* New toggle */}
                          <button
                            type="button"
                            className={`btn-mini btn-mini-new ${p.isNew ? 'active' : ''}`}
                            onClick={() => handleToggleNew(p)}
                            disabled={isLoading}
                            title="Toggle New Badge"
                          >
                            🆕 New
                          </button>

                          {/* Archive ("Achieve") toggle */}
                          <button
                            type="button"
                            className="btn-mini btn-mini-archive"
                            onClick={() => handleToggleArchive(p)}
                            disabled={isLoading}
                            title={p.isArchived ? 'Restore Profile to Active' : 'Archive Profile'}
                          >
                            {p.isArchived ? '↩️ Restore' : '📦 Archive'}
                          </button>

                          {/* Edit Full Profile */}
                          <button
                            type="button"
                            className="btn-mini btn-mini-edit"
                            onClick={() => setEditingProfile(p)}
                            title="Edit Full Profile"
                          >
                            ✏️ Edit
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            className="btn-mini btn-mini-delete"
                            onClick={() => handleDeleteProfile(p)}
                            disabled={isLoading}
                            title="Delete Profile Permanently"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
        )}

        {/* ══ MODAL 1: ADD NEW PROFILE ══ */}
        {isAddModalOpen && (
          <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">
                  <span>➕ Add New Profile</span>
                </h3>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSubmit}>
                <div className="admin-form-grid">
                  <div className="admin-field">
                    <label className="admin-label">Model Name / Alias *</label>
                    <input type="text" name="name" className="admin-input" placeholder="e.g. Shakira, Natasha" required />
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">Age (18+) *</label>
                    <input type="number" name="age" min="18" max="65" defaultValue="22" className="admin-input" required />
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">City *</label>
                    <select name="city" className="admin-modal-select" required defaultValue="Kampala">
                      {LOCATIONS.map((l) => (
                        <option key={l.slug} value={l.name}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">Specific Area / Location *</label>
                    <input type="text" name="location" className="admin-input" defaultValue="Kololo, Kampala" placeholder="e.g. Kololo, Kampala" required />
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">Tier / Subscription Plan *</label>
                    <select name="tier" className="admin-modal-select" defaultValue="VIP">
                      <option value="Standard">Standard (10,000shs / week)</option>
                      <option value="VIP">VIP (25,000shs / week)</option>
                      <option value="Premium">Premium VIP</option>
                      <option value="VIP Spa">VIP Spa &amp; Massage</option>
                    </select>
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">Phone (Direct Calls) *</label>
                    <input type="tel" name="phone" className="admin-input" placeholder="+256 700 000 000" defaultValue="+256" required />
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">WhatsApp Number *</label>
                    <input type="tel" name="whatsapp" className="admin-input" placeholder="256700000000" defaultValue="256" required />
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">Pics Count</label>
                    <input type="number" name="picsCount" className="admin-input" defaultValue="6" />
                  </div>
                </div>

                <div className="admin-field" style={{ marginBottom: '1.25rem' }}>
                  <label className="admin-label">Bio / Profile Description</label>
                  <textarea
                    name="about"
                    className="admin-textarea"
                    rows={3}
                    placeholder="Enter model description, services, personal introduction..."
                    defaultValue="Sweet, friendly and discreet companion. Available for dinner dates and private company."
                  />
                </div>

                <div className="admin-form-grid" style={{ marginBottom: '1rem' }}>
                  <div className="admin-field">
                    <label className="admin-label">Upload Photo (Cloudflare R2)</label>
                    <input type="file" name="photo" ref={addPhotoInputRef} accept="image/*" className="admin-input" />
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">Or Direct Photo URL</label>
                    <input type="url" name="photoUrl" className="admin-input" placeholder="https://..." />
                  </div>
                </div>

                {/* Flags row */}
                <div className="admin-checkbox-row">
                  <label className="checkbox-label">
                    <input type="checkbox" name="isApproved" value="true" defaultChecked />
                    <span>Approve Immediately</span>
                  </label>

                  <label className="checkbox-label">
                    <input type="checkbox" name="isVip" value="true" defaultChecked />
                    <span>Make VIP ⭐</span>
                  </label>

                  <label className="checkbox-label">
                    <input type="checkbox" name="isPremium" value="true" />
                    <span>Make Premium 💎</span>
                  </label>

                  <label className="checkbox-label">
                    <input type="checkbox" name="isNew" value="true" defaultChecked />
                    <span>Mark New 🆕</span>
                  </label>

                  <label className="checkbox-label">
                    <input type="checkbox" name="isVerified" value="true" defaultChecked />
                    <span>Verified Badge 🛡️</span>
                  </label>

                  <label className="checkbox-label">
                    <input type="checkbox" name="isArchived" value="true" />
                    <span>Archive 📦</span>
                  </label>
                </div>

                {/* Payment setup */}
                <div style={{ background: '#191919', padding: '1rem', borderRadius: '8px', border: '1px solid #333', marginBottom: '1.25rem' }}>
                  <div style={{ color: '#FFD600', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.6rem', textTransform: 'uppercase' }}>
                    💳 Weekly Payment Setup
                  </div>
                  <div className="admin-form-grid" style={{ margin: 0 }}>
                    <div className="admin-field">
                      <label className="admin-label">Payment Status</label>
                      <select name="paymentStatus" className="admin-modal-select" defaultValue="verified">
                        <option value="verified">Verified (Paid) 🟢</option>
                        <option value="pending">Pending Verification 🟡</option>
                        <option value="unpaid">Unpaid 🔴</option>
                      </select>
                    </div>

                    <div className="admin-field">
                      <label className="admin-label">Amount (UGX)</label>
                      <input type="number" name="paymentAmount" className="admin-input" defaultValue="25000" />
                    </div>

                    <div className="admin-field">
                      <label className="admin-label">Payment Reference / Tx Code</label>
                      <input type="text" name="paymentRef" className="admin-input" placeholder="e.g. MTN MoMo 078XXXXXXX or Tx ID" />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn admin-btn-primary">
                    ✨ Create Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══ MODAL 2: EDIT PROFILE ══ */}
        {editingProfile && (
          <div className="modal-overlay" onClick={() => setEditingProfile(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">
                  <span>✏️ Edit Profile: {editingProfile.name}</span>
                </h3>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setEditingProfile(null)}
                >
                  ✕
                </button>
              </div>

              <form key={editingProfile.id} onSubmit={handleEditSubmit}>
                <input type="hidden" name="id" value={editingProfile.id} />
                <div className="admin-form-grid">
                  <div className="admin-field">
                    <label className="admin-label">Name *</label>
                    <input type="text" name="name" className="admin-input" defaultValue={editingProfile.name} required />
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">Age *</label>
                    <input type="number" name="age" min="18" max="65" defaultValue={editingProfile.age} className="admin-input" required />
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">City *</label>
                    <select name="city" className="admin-modal-select" defaultValue={editingProfile.city} required>
                      {LOCATIONS.map((l) => (
                        <option key={l.slug} value={l.name}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">Location *</label>
                    <input type="text" name="location" className="admin-input" defaultValue={editingProfile.location} required />
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">Tier *</label>
                    <select name="tier" className="admin-modal-select" defaultValue={editingProfile.tier}>
                      <option value="Standard">Standard (10,000shs / week)</option>
                      <option value="VIP">VIP (25,000shs / week)</option>
                      <option value="Premium">Premium</option>
                      <option value="VIP Spa">VIP Spa</option>
                    </select>
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">Phone *</label>
                    <input type="tel" name="phone" className="admin-input" defaultValue={editingProfile.phone} required />
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">WhatsApp *</label>
                    <input type="tel" name="whatsapp" className="admin-input" defaultValue={editingProfile.whatsapp} required />
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">Pics Count</label>
                    <input type="number" name="picsCount" className="admin-input" defaultValue={editingProfile.picsCount} />
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">Activity Status</label>
                    <select name="status" className="admin-modal-select" defaultValue={editingProfile.status ?? 'recent'}>
                      <option value="online">Online Now 🟢</option>
                      <option value="recent">Recently Active ⚪</option>
                    </select>
                  </div>
                </div>

                <div className="admin-field" style={{ marginBottom: '1.25rem' }}>
                  <label className="admin-label">Bio Description</label>
                  <textarea
                    name="about"
                    className="admin-textarea"
                    rows={3}
                    defaultValue={editingProfile.about ?? ''}
                  />
                </div>

                <div className="admin-form-grid" style={{ marginBottom: '1rem' }}>
                  <div className="admin-field">
                    <label className="admin-label">Replace Photo (Upload to R2)</label>
                    <input type="file" name="photo" ref={editPhotoInputRef} accept="image/*" className="admin-input" />
                  </div>

                  <div className="admin-field">
                    <label className="admin-label">Or Custom Photo URL</label>
                    <input type="url" name="photoUrl" className="admin-input" defaultValue={editingProfile.photoUrl ?? ''} />
                  </div>
                </div>

                {/* Flags row */}
                <div className="admin-checkbox-row">
                  <label className="checkbox-label">
                    <input type="checkbox" name="isApproved" value="true" defaultChecked={editingProfile.isApproved ?? false} />
                    <span>Approved &amp; Live</span>
                  </label>

                  <label className="checkbox-label">
                    <input type="checkbox" name="isPremium" value="true" defaultChecked={editingProfile.isPremium ?? false} />
                    <span>Premium 💎</span>
                  </label>

                  <label className="checkbox-label">
                    <input type="checkbox" name="isNew" value="true" defaultChecked={editingProfile.isNew ?? false} />
                    <span>New 🆕</span>
                  </label>

                  <label className="checkbox-label">
                    <input type="checkbox" name="isVerified" value="true" defaultChecked={editingProfile.isVerified ?? false} />
                    <span>Verified 🛡️</span>
                  </label>

                  <label className="checkbox-label">
                    <input type="checkbox" name="isArchived" value="true" defaultChecked={editingProfile.isArchived ?? false} />
                    <span>Archived 📦</span>
                  </label>
                </div>

                {/* Payment setup */}
                <div style={{ background: '#191919', padding: '1rem', borderRadius: '8px', border: '1px solid #333', marginBottom: '1.25rem' }}>
                  <div style={{ color: '#FFD600', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.6rem', textTransform: 'uppercase' }}>
                    💳 Weekly Payment Details
                  </div>
                  <div className="admin-form-grid" style={{ margin: 0 }}>
                    <div className="admin-field">
                      <label className="admin-label">Payment Status</label>
                      <select name="paymentStatus" className="admin-modal-select" defaultValue={editingProfile.paymentStatus ?? 'pending'}>
                        <option value="verified">Verified (Paid) 🟢</option>
                        <option value="pending">Pending 🟡</option>
                        <option value="unpaid">Unpaid 🔴</option>
                        <option value="failed">Failed ❌</option>
                      </select>
                    </div>

                    <div className="admin-field">
                      <label className="admin-label">Amount (UGX)</label>
                      <input
                        type="number"
                        name="paymentAmount"
                        className="admin-input"
                        defaultValue={editingProfile.paymentAmount || (editingProfile.tier.startsWith('VIP') ? 25000 : 10000)}
                      />
                    </div>

                    <div className="admin-field">
                      <label className="admin-label">Payment Reference</label>
                      <input
                        type="text"
                        name="paymentRef"
                        className="admin-input"
                        defaultValue={editingProfile.paymentRef ?? ''}
                        placeholder="Sender phone or Tx ID"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setEditingProfile(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn admin-btn-primary">
                    💾 Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══ MODAL 3: PAYMENT VERIFICATION QUICK MODAL ══ */}
        {paymentModalProfile && (
          <div className="modal-overlay" onClick={() => setPaymentModalProfile(null)}>
            <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">
                  <span>💳 Payment Verification</span>
                </h3>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setPaymentModalProfile(null)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePaymentModal}>
                <div style={{ background: '#1c1c1c', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #333' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#888' }}>Model:</span>
                    <strong style={{ color: '#fff' }}>{paymentModalProfile.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#888' }}>Listing Tier:</span>
                    <span style={{ color: '#FFD600', fontWeight: 700 }}>{paymentModalProfile.tier}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#888' }}>Expected Weekly Fee:</span>
                    <strong style={{ color: '#22C55E' }}>
                      {paymentModalProfile.tier.startsWith('VIP') ? '25,000shs / week' : '10,000shs / week'}
                    </strong>
                  </div>
                  {paymentModalProfile.paymentRef && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#888' }}>Submitted Ref / MoMo:</span>
                      <strong style={{ color: '#FFD600' }}>{paymentModalProfile.paymentRef}</strong>
                    </div>
                  )}
                </div>

                <div className="admin-field" style={{ marginBottom: '1rem' }}>
                  <label className="admin-label">Verification Status</label>
                  <select
                    name="paymentStatus"
                    className="admin-modal-select"
                    defaultValue={paymentModalProfile.paymentStatus ?? 'pending'}
                  >
                    <option value="verified">🟢 Verified &amp; Paid (Approves Profile)</option>
                    <option value="pending">🟡 Pending Verification</option>
                    <option value="unpaid">🔴 Unpaid / Payment Needed</option>
                    <option value="failed">❌ Failed / Rejected</option>
                  </select>
                </div>

                <div className="admin-field" style={{ marginBottom: '1rem' }}>
                  <label className="admin-label">Amount Received (UGX)</label>
                  <input
                    type="number"
                    name="paymentAmount"
                    className="admin-input"
                    defaultValue={paymentModalProfile.paymentAmount || (paymentModalProfile.tier.startsWith('VIP') ? 25000 : 10000)}
                  />
                </div>

                <div className="admin-field" style={{ marginBottom: '1.5rem' }}>
                  <label className="admin-label">Payment Reference / Transaction ID</label>
                  <input
                    type="text"
                    name="paymentRef"
                    className="admin-input"
                    defaultValue={paymentModalProfile.paymentRef ?? ''}
                    placeholder="e.g. 078XXXXXXX or Mobile Money Tx ID"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setPaymentModalProfile(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn admin-btn-primary">
                    ✅ Update Payment Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══ LIGHTBOX PREVIEW ══ */}
        {previewPhotoUrl && (
          <div className="lightbox-overlay" onClick={() => setPreviewPhotoUrl(null)}>
            <img src={previewPhotoUrl} alt="Model Preview" className="lightbox-img" />
          </div>
        )}

        {/* ══ TOAST NOTIFICATION ══ */}
        {toastMsg && (
          <div
            className="admin-toast"
            style={{
              borderColor: toastIsError ? '#FF2E55' : '#22C55E',
              boxShadow: toastIsError ? '0 4px 20px rgba(255,46,85,0.4)' : '0 4px 20px rgba(34,197,94,0.3)',
            }}
          >
            <span>{toastIsError ? '⚠️' : '⚡'}</span>
            <span>{toastMsg}</span>
          </div>
        )}

      </div>
    </div>
  );
}
