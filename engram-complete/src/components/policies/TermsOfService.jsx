import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Policies.css';

const TermsOfService = () => {
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
          <span className="policy-badge">Terms & Conditions</span>
          <h1 className="policy-title">Terms of Service</h1>
          <p className="policy-subtitle">
            The legal agreement establishing your rights, usage policies, intellectual property ownership, and service guidelines across the Engram platform.
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
              <h2 className="policy-section-title">Acceptance of Agreement</h2>
            </div>
            <div className="policy-card-body">
              <p>
                By creating an account, chronicling entries, or conversing with your digital replica on <strong>Engram</strong>, you formally agree to be legally bound by these Terms of Service. If you disagree with any segment of these provisions, you must immediately discontinue use of the platform.
              </p>
              <div className="policy-highlight-box">
                <p>
                  <strong>Summary:</strong> Using Engram constitutes mutual agreement to safeguard data privacy, respect intellectual property, and adhere to honest, lawful interactions.
                </p>
              </div>
            </div>
          </div>

          <div className="policy-card">
            <div className="policy-section-header">
              <span className="policy-section-num">02</span>
              <h2 className="policy-section-title">Description of Service</h2>
            </div>
            <div className="policy-card-body">
              <p>
                Engram is an artificial intelligence platform developed to synthesize a personal digital companion derived from your reflections, journaling, and conversation history using scientific cognitive frameworks (including the OCEAN psychological model).
              </p>
              <p>
                The platform includes journaling modules, interactive companion chats, personality profile analytics, and cloud synchronization tools designed to capture your intellectual and philosophical perspective.
              </p>
            </div>
          </div>

          <div className="policy-card">
            <div className="policy-section-header">
              <span className="policy-section-num">03</span>
              <h2 className="policy-section-title">Intellectual Property & Content Ownership</h2>
            </div>
            <div className="policy-card-body">
              <p>
                <strong>Your Content:</strong> You retain complete, exclusive intellectual property ownership of all writings, diary entries, voice transcriptions, and qualitative reflections you submit to Engram.
              </p>
              <p>
                <strong>The Platform:</strong> Engram and its licensors retain all rights, title, and interest in and to the platform codebase, machine learning architectures, UI designs, brand logos (including the Engram typography), and underlying software engines.
              </p>
              <div className="policy-highlight-box">
                <p>
                  <strong>Zero Appropriation:</strong> Engram makes no ownership claim over your creative works or personal narratives. We serve exclusively as your software infrastructure custodian.
                </p>
              </div>
            </div>
          </div>

          <div className="policy-card">
            <div className="policy-section-header">
              <span className="policy-section-num">04</span>
              <h2 className="policy-section-title">Acceptable Conduct & Prohibitions</h2>
            </div>
            <div className="policy-card-body">
              <p>
                To preserve system integrity and safety for all users, you agree not to:
              </p>
              <ul className="policy-list">
                <li>
                  Transmit malicious code, computer viruses, Trojan horses, or unauthorized bot scrapers against the platform API or infrastructure.
                </li>
                <li>
                  Reverse engineer, decompile, or disassemble the backend reasoning architecture or extract proprietary model weights.
                </li>
                <li>
                  Impersonate another individual or chronicle entries intending to defame, harass, or inflict unlawful harm upon third parties.
                </li>
                <li>
                  Attempt to bypass access controls, authentication headers, or tenancy isolation mechanisms.
                </li>
              </ul>
            </div>
          </div>

          <div className="policy-card">
            <div className="policy-section-header">
              <span className="policy-section-num">05</span>
              <h2 className="policy-section-title">AI Companion & Medical Disclaimer</h2>
            </div>
            <div className="policy-card-body">
              <p>
                Engram companions are powered by probabilistic neural generative models. While trained to reflect your personal perspective with behavioral fidelity, companion outputs are assistive simulations:
              </p>
              <div className="policy-highlight-box">
                <p>
                  <strong>Important Notice:</strong> Engram is an intellectual reflection and self-documentation utility. It does <strong>not</strong> provide medical, psychiatric, or licensed psychological counseling. If experiencing an acute mental health crisis, please consult professional healthcare authorities immediately.
                </p>
              </div>
            </div>
          </div>

          <div className="policy-card">
            <div className="policy-section-header">
              <span className="policy-section-num">06</span>
              <h2 className="policy-section-title">Service Reliability & Continuous Updates</h2>
            </div>
            <div className="policy-card-body">
              <p>
                We strive for maximum uptime and continuous service reliability. However, Engram is provided on an <strong>"as is"</strong> and <strong>"as available"</strong> operational standard. We reserve the right to schedule platform maintenance, deploy performance patches, and introduce architectural upgrades without liability for temporary interruptions.
              </p>
            </div>
          </div>

          <div className="policy-card">
            <div className="policy-section-header">
              <span className="policy-section-num">07</span>
              <h2 className="policy-section-title">Account Termination & Offboarding</h2>
            </div>
            <div className="policy-card-body">
              <p>
                You may terminate your account at any time without penalty by submitting a deletion request through your account settings or contacting support.
              </p>
              <p>
                Upon verified termination, your personal documentation, chat records, and cognitive profiles will be permanently unlinked and scheduled for irrevocable database purge within 30 days.
              </p>
            </div>
          </div>

          <div className="policy-card">
            <div className="policy-section-header">
              <span className="policy-section-num">08</span>
              <h2 className="policy-section-title">Contact & Legal Inquiries</h2>
            </div>
            <div className="policy-card-body">
              <p>
                For legal notices, enterprise licensing inquiries, or contract reviews, please contact our legal counsel:
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
              onClick={() => navigate('/privacy-policy')}
            >
              Privacy Policy
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

export default TermsOfService;
