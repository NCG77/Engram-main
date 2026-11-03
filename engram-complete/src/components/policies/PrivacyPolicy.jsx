import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Policies.css';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.classList.remove('dark-mode', 'light-mode');
    document.body.removeAttribute('data-theme');
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#111111';
  }, []);

  const handleBack = () => {
    if (localStorage.getItem('token')) {
      navigate('/new_page');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="policy-page-container">
      <header className="policy-header">
        <div
          className="policy-logo"
          onClick={handleBack}
          role="button"
          tabIndex={0}
          title="Engram"
        >
          Engram
        </div>
        <button
          className="policy-back-btn"
          onClick={handleBack}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {localStorage.getItem('token') ? 'Back to Workspace' : 'Back to Home'}
        </button>
      </header>

      <main className="policy-main">
        <div className="policy-hero">
          <span className="policy-badge">Legal & Security</span>
          <h1 className="policy-title">Privacy Policy</h1>
          <p className="policy-subtitle">
            Transparency regarding how Engram captures, processes, and safeguards your thoughts, personal documentation, and digital companion architecture.
          </p>
          <div className="policy-meta">
            <span>Last Updated: November 2026</span>
            <span>Version: 2.4</span>
          </div>
        </div>

        <div className="policy-content">
          <div className="policy-card">
            <div className="policy-section-header">
              <span className="policy-section-num">01</span>
              <h2 className="policy-section-title">Introduction & Principles</h2>
            </div>
            <div className="policy-card-body">
              <p>
                At <strong>Engram</strong>, we recognize that chronicling your personal thoughts, internal dialogue, and emotional reflections requires unwavering trust. Our privacy architecture is designed on a single fundamental tenet: <strong>you own your consciousness, reflections, and derived data</strong>.
              </p>
              <div className="policy-highlight-box">
                <p>
                  <strong>Core Commitment:</strong> Engram does not sell, rent, license, or monetize your journals or persona data to third-party data brokers, marketers, or advertisers. Your entries exist exclusively to build and refine your personal digital companion.
                </p>
              </div>
            </div>
          </div>

          <div className="policy-card">
            <div className="policy-section-header">
              <span className="policy-section-num">02</span>
              <h2 className="policy-section-title">Information We Collect</h2>
            </div>
            <div className="policy-card-body">
              <p>
                To construct a true-to-life digital replica that mirrors your perspective and cognitive nuances, Engram collects the following categories of information:
              </p>
              <ul className="policy-list">
                <li>
                  <strong>Journal & Diary Submissions:</strong> Daily reflections, notes, narratives, and contextual experiences you record in the personal diary module.
                </li>
                <li>
                  <strong>Conversational Interactions:</strong> Queries, replies, feedback ratings, and conversational patterns exchanged with your companion in the chat interface.
                </li>
                <li>
                  <strong>Psychological Markers (OCEAN Framework):</strong> Extracted behavioral dimensions—Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism—computed solely to fine-tune your companion’s conversational tone.
                </li>
                <li>
                  <strong>Account & Authentication Identifiers:</strong> Your verified email address, hashed credentials, and session authentication tokens.
                </li>
              </ul>
            </div>
          </div>

          <div className="policy-card">
            <div className="policy-section-header">
              <span className="policy-section-num">03</span>
              <h2 className="policy-section-title">How Your Data is Processed & Used</h2>
            </div>
            <div className="policy-card-body">
              <p>
                Your documentation and chat history undergo automated cognitive synthesis through our private inference pipelines:
              </p>
              <ul className="policy-list">
                <li>
                  <strong>Model Synthesis & Persona Calibration:</strong> Ingesting reflections to synthesize behavioral representations, voice parameters, and knowledge graphs aligned with your true perspective.
                </li>
                <li>
                  <strong>Memory Continuity:</strong> Maintaining semantic continuity across sessions so your companion remembers past discussions, commitments, and philosophical viewpoints.
                </li>
                <li>
                  <strong>System Integrity & Abuse Prevention:</strong> Verifying authentication integrity, preventing unauthorized account intrusions, and ensuring platform reliability.
                </li>
              </ul>
              <div className="policy-highlight-box">
                <p>
                  <strong>No Cross-Tenant Training:</strong> Your private journals are never incorporated into public, shared base models. All persona weights and memory vectors remain cryptographically isolated within your tenant sandbox.
                </p>
              </div>
            </div>
          </div>

          <div className="policy-card">
            <div className="policy-section-header">
              <span className="policy-section-num">04</span>
              <h2 className="policy-section-title">Ownership & Intellectual Property</h2>
            </div>
            <div className="policy-card-body">
              <p>
                You retain complete, unencumbered intellectual property rights to every piece of personal documentation, journal submission, and custom persona output generated by your account.
              </p>
              <p>
                Engram acts solely as a secure custodian of your information. By utilizing the platform, you grant Engram a restricted, revocable license strictly to store, process, and execute inference on your content to deliver the companion experience to you.
              </p>
            </div>
          </div>

          <div className="policy-card">
            <div className="policy-section-header">
              <span className="policy-section-num">05</span>
              <h2 className="policy-section-title">Security & Encryption Architecture</h2>
            </div>
            <div className="policy-card-body">
              <p>
                We enforce multi-tiered defense-in-depth security standards to prevent unauthorized access or disclosure:
              </p>
              <ul className="policy-list">
                <li>
                  <strong>In-Transit Encryption:</strong> All network communication is mandated through TLS 1.3 cryptographic protocols with modern cipher suites.
                </li>
                <li>
                  <strong>At-Rest Encryption:</strong> Journal databases, personality embeddings, and user credentials are encrypted using industry-standard AES-256 encryption.
                </li>
                <li>
                  <strong>Credential Hashing:</strong> Passwords and authorization keys are salted and hashed using bcrypt; plain-text credentials are never stored.
                </li>
              </ul>
            </div>
          </div>

          <div className="policy-card">
            <div className="policy-section-header">
              <span className="policy-section-num">06</span>
              <h2 className="policy-section-title">Data Deletion & User Rights</h2>
            </div>
            <div className="policy-card-body">
              <p>
                You hold absolute sovereignty over your records. At any point, you are entitled to:
              </p>
              <ul className="policy-list">
                <li>
                  <strong>Inspect & Export:</strong> Request a complete export of your journal entries, cognitive evaluations, and conversation transcripts.
                </li>
                <li>
                  <strong>Individual Entry Deletion:</strong> Modify or purge individual diary entries or conversational turns at your discretion.
                </li>
                <li>
                  <strong>Permanent Account Purge:</strong> Submit an offboarding request to irrevocably erase your account, all associated diaries, and your persona model from our servers within 30 days.
                </li>
              </ul>
            </div>
          </div>

          <div className="policy-card">
            <div className="policy-section-header">
              <span className="policy-section-num">07</span>
              <h2 className="policy-section-title">Contact & Data Governance</h2>
            </div>
            <div className="policy-card-body">
              <p>
                If you have questions, data protection requests, or wish to exercise your rights under global privacy regulations (including GDPR and CCPA), please contact our privacy compliance team directly:
              </p>
              <p>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:justin.cider.dm@gmail.com"
                  className="policy-contact-link"
                >
                  justin.cider.dm@gmail.com
                </a>
              </p>
              <p>
                Our specialists will respond to verify your identity and address your inquiry within 48 business hours.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="policy-footer">
        <div className="policy-footer-container">
          <p className="policy-footer-copy">
            © {new Date().getFullYear()} Engram Technologies. All rights reserved.
          </p>
          <div className="policy-footer-links">
            <button
              className="policy-footer-btn"
              onClick={() => navigate('/terms-of-service')}
            >
              Terms of Service
            </button>
            <button
              className="policy-footer-btn"
              onClick={handleBack}
            >
              Back to {localStorage.getItem('token') ? 'Workspace' : 'Home'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
