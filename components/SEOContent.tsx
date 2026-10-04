import React from 'react';
import Link from 'next/link';
import { LOCATIONS } from '@/data/locations';
import { getBaseUrl } from '@/lib/site';

const FAQS = [
  {
    question: 'What is Uganda Sexy Babes?',
    answer:
      'Uganda Sexy Babes is an all-purpose adult platform for dating, hookups, casual encounters, and meet-and-mingle experiences across Uganda. Whether you want a no-strings-attached hookup, a steamy date, massage and companionship, or a verified escort companion in Kampala, Entebbe, or Jinja — we connect you directly with real, verified ladies.',
  },
  {
    question: 'How do I hook up with a babe in Uganda?',
    answer:
      'Simple — browse verified profiles, pick a babe in your city, tap the Call or WhatsApp button and connect immediately. All ladies listed have confirmed phone numbers and are ready to meet. No agencies, no middlemen. Just direct, discreet hookups.',
  },
  {
    question: 'Are these escorts and hookup girls verified?',
    answer:
      'Yes. All profiles with the VERIFIED badge have been manually reviewed by our team. VIP and Premium babes provide genuine photos, real WhatsApp numbers, and are actively available for dates, hookups, massage sessions, and companionship.',
  },
  {
    question: 'Which cities in Uganda have the most escorts and hookup babes?',
    answer:
      'Kampala leads with the most listings — especially in Kololo, Ntinda, Makindye, Kawempe, Kasubi, Muyenga, Munyonyo, Nakasero, and Kabalagala. Entebbe, Jinja, Mbarara, Gulu, Arua, and Lira also have active profiles. New babes join daily across all major towns.',
  },
  {
    question: 'Can I find massage and full-package services on Uganda Sexy Babes?',
    answer:
      'Yes. Many listed companions offer massage, companionship, and full-package adult services. Browse the profiles, check their bios, and contact them directly on WhatsApp or phone to arrange your preferred service. Everything is handled privately between you and the companion.',
  },
  {
    question: 'Is the platform discreet and private?',
    answer:
      'Completely. You can browse all profiles anonymously. No public account is required to view or contact babes. All arrangements are handled directly between you and the lady via private WhatsApp or phone call — fast, discreet, and confidential.',
  },
  {
    question: 'How do I register my profile as a companion or escort?',
    answer:
      'Ladies aged 18+ can register by clicking the "Register" button. Fill in your details, upload your best photos, and choose your listing tier — Standard or VIP. Profiles are reviewed and approved before going live to ensure quality and authenticity.',
  },
];

export default function SEOContent() {
  const baseUrl = getBaseUrl();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="seo-content-section" style={{ marginTop: '3.5rem', marginBottom: '2rem' }}>
      {/* JSON-LD Schema for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Guide Content */}
      <div
        style={{
          background: 'var(--black-2, #141414)',
          border: '1px solid rgba(255, 214, 0, 0.15)',
          borderRadius: '12px',
          padding: '2rem 1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        <h2
          style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: '#FFD600',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
          }}
        >
          Uganda&apos;s #1 Adult Hookup, Dating &amp; Escort Platform
        </h2>
        <p
          style={{
            color: 'var(--gray-4, #b0b0b0)',
            lineHeight: 1.7,
            fontSize: '0.92rem',
            marginBottom: '1rem',
          }}
        >
          Welcome to <strong>Uganda Sexy Babes</strong> — Uganda&apos;s most trusted all-purpose adult platform for{' '}
          <strong>hookups, dating, casual encounters, escorts, and meet-and-mingle</strong> experiences. Whether
          you want a no-strings-attached hookup in Kampala, a sensual massage in Entebbe, a steamy date in Jinja,
          or a discreet companion in Mbarara — our verified directory connects you directly with real, hot Ugandan babes
          who are ready to meet.
        </p>
        <p
          style={{
            color: 'var(--gray-4, #b0b0b0)',
            lineHeight: 1.7,
            fontSize: '0.92rem',
            marginBottom: '1rem',
          }}
        >
          Every companion on this platform is 18+ and has voluntarily listed their profile. You get{' '}
          <strong>real photos, direct WhatsApp contact, and confirmed phone numbers</strong> — no fake ads,
          no scam agencies. Browse, pick, and connect instantly for hookups, massage and full-package services,
          casual sex dates, and unforgettable adult entertainment across Uganda.
        </p>
        <p
          style={{
            color: 'var(--gray-4, #b0b0b0)',
            lineHeight: 1.7,
            fontSize: '0.92rem',
            marginBottom: '1.5rem',
          }}
        >
          Uganda Sexy Babes is the go-to site for finding <strong>verified escorts in Kampala</strong>,
          affordable hookup girls across all suburbs including Kololo, Ntinda, Makindye, Muyenga, Kawempe,
          Kasubi, and Kisaasi, as well as sugar mummies, massage spas, VIP companions, and independent escorts
          across all major Ugandan towns. Discreet, fast, and 100% real.
        </p>

        {/* City Navigation Tags */}
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: '0.75rem',
          }}
        >
          📍 Explore Babes by Ugandan City
        </h3>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {LOCATIONS.map((loc) => (
            <Link
              key={loc.slug}
              href={`/location/${loc.slug}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.35rem 0.8rem',
                borderRadius: '20px',
                background: 'rgba(255, 214, 0, 0.08)',
                border: '1px solid rgba(255, 214, 0, 0.25)',
                color: '#FFD600',
                fontSize: '0.82rem',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              {loc.name} Babes
            </Link>
          ))}
        </div>

        {/* Popular Kampala Suburbs & Neighborhoods */}
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#FFFFFF',
            marginTop: '1.5rem',
            marginBottom: '0.75rem',
          }}
        >
          🏙️ Top Kampala Suburbs &amp; Districts
        </h3>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.45rem',
          }}
        >
          {[
            'Kololo Escorts',
            'Ntinda Escorts',
            'Muyenga Escorts',
            'Munyonyo Escorts',
            'Makindye Escorts',
            'Kisaasi Escorts',
            'Kawempe Escorts',
            'Kasubi Escorts',
            'Entebbe Road Babes',
            'Kikoni Companions',
            'Nakasero VIP Babes',
            'Bugolobi Companions',
            'Kabalagala Babes',
          ].map((tag) => (
            <span
              key={tag}
              style={{
                display: 'inline-block',
                padding: '0.3rem 0.75rem',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--gray-4, #b0b0b0)',
                fontSize: '0.8rem',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Trending Directory Keywords */}
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#FFFFFF',
            marginTop: '1.5rem',
            marginBottom: '0.75rem',
          }}
        >
          🔥 Popular Searches &amp; Categories
        </h3>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.45rem',
          }}
        >
          {[
            'Uganda Escorts',
            'Kampala Escorts',
            'Verified Escorts UG',
            'Sexy Babes Uganda',
            'Hot Ugandan Girls',
            'Hookup Girls Uganda',
            'Casual Encounters Kampala',
            'Meet & Mingle Uganda',
            'No-Strings-Attached Dates',
            'Affordable Escorts Kampala',
            'VIP Escorts Uganda',
            'Ebony Sexy Babes',
            'Independent Escorts',
            'Discreet Escorts Uganda',
            'Massage Spas & Companions',
            'Full-Package Massage Uganda',
            'Sugar Mummies Uganda',
            'Premier Connect UG',
            'Top Escorts Sites in Uganda',
            'Call Girls Kampala',
            'Adult Entertainment Uganda',
            'Verified Hookup Girls',
            'Nightlife Companions',
            'Sexy Escort Girls',
            'Companion Services Uganda',
            'Female Escorts Kampala',
            'Hookup & Date Uganda',
            'One Night Stand Uganda',
            'NSA Dates Uganda',
          ].map((keyword) => (
            <span
              key={keyword}
              style={{
                display: 'inline-block',
                padding: '0.3rem 0.75rem',
                borderRadius: '16px',
                background: 'rgba(255, 214, 0, 0.06)',
                border: '1px solid rgba(255, 214, 0, 0.2)',
                color: '#FFD600',
                fontSize: '0.8rem',
                fontWeight: 500,
              }}
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div
        style={{
          background: 'var(--black-2, #141414)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '2rem 1.5rem',
        }}
      >
        <h2
          style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: '#FFFFFF',
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          Frequently Asked Questions (FAQ)
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {FAQS.map((faq, index) => (
            <div
              key={index}
              style={{
                borderBottom: index < FAQS.length - 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                paddingBottom: index < FAQS.length - 1 ? '1.25rem' : '0',
              }}
            >
              <h3
                style={{
                  fontSize: '1.02rem',
                  fontWeight: 700,
                  color: '#FFD600',
                  marginBottom: '0.5rem',
                }}
              >
                {faq.question}
              </h3>
              <p
                style={{
                  color: 'var(--gray-4, #b0b0b0)',
                  lineHeight: 1.6,
                  fontSize: '0.88rem',
                  margin: 0,
                }}
              >
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
