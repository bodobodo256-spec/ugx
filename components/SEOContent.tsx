import React from 'react';
import Link from 'next/link';
import { LOCATIONS } from '@/data/locations';
import { getBaseUrl } from '@/lib/site';

const FAQS = [
  {
    question: 'How do I connect with babes and companions in Uganda?',
    answer:
      'Connecting is simple and direct. Browse the profiles on Uganda Sexy Babes, choose a verified profile in your city (such as Kampala, Entebbe, or Jinja), and click either the Call button to call directly or the WhatsApp button to chat with them immediately. There are no middlemen.',
  },
  {
    question: 'Are the profiles on Uganda Sexy Babes verified?',
    answer:
      'Yes, we prioritize safety and authenticity. Profiles with the "VERIFIED" badge have been reviewed and approved by our team. VIP babes feature high-resolution genuine photos, confirmed phone numbers, and active status.',
  },
  {
    question: 'Which cities and regions in Uganda are covered?',
    answer:
      'Uganda Sexy Babes covers all major cities and districts across Uganda, including Kampala (Central, Kololo, Ntinda, Bugolobi, Kansanga, Kabalagala), Entebbe, Jinja, Wakiso, Mukono, Mbarara, Fort Portal, Gulu, Arua, and Lira.',
  },
  {
    question: 'How can I create or register a profile on Uganda Sexy Babes?',
    answer:
      'Ladies aged 18 and older can create a profile by clicking "Register" or "Create Profile". Fill in your name, age, city, bio, and contact details, upload your best photo, and submit. Profiles are reviewed promptly to ensure quality and discretion.',
  },
  {
    question: 'Is browsing and contacting models completely private and discreet?',
    answer:
      'Yes. Uganda Sexy Babes values user confidentiality. You can browse all profiles anonymously without creating a public account. Direct contacts are handled securely between you and the companion through standard phone or WhatsApp channels.',
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
          Uganda&apos;s #1 Dating &amp; Companionship Directory
        </h2>
        <p
          style={{
            color: 'var(--gray-4, #b0b0b0)',
            lineHeight: 1.7,
            fontSize: '0.92rem',
            marginBottom: '1rem',
          }}
        >
          Welcome to <strong>Uganda Sexy Babes</strong>, the premier online destination for meeting
          verified babes, dating singles, and discrete companions across Uganda. Whether you are
          looking for genuine romance, casual hookups, VIP escort companions in Kampala, or lively
          meetups in Entebbe, Jinja, or Mbarara, our directory connects you instantly with the
          hottest companions in the country.
        </p>
        <p
          style={{
            color: 'var(--gray-4, #b0b0b0)',
            lineHeight: 1.7,
            fontSize: '0.92rem',
            marginBottom: '1.5rem',
          }}
        >
          Every verified model provides direct phone and WhatsApp contact info, verified pictures,
          and transparent details. Skip bogus agencies and unverified ads — discover trusted,
          high-class companions ready for memorable encounters today.
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
            'Affordable Escorts Kampala',
            'VIP Escorts Uganda',
            'Ebony Sexy Babes',
            'Independent Escorts',
            'Discreet Escorts Uganda',
            'Massage Spas & Companions',
            'Sugar Mummies Uganda',
            'Premier Connect UG',
            'Top Escorts Sites in Uganda',
            'Call Girls Kampala',
            'Nightlife Companions',
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
