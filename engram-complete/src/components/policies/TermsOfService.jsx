import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../LandingPage/LandingPage.css';

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="main-container loaded" style={{ padding: '2rem' }}>
      <header className="main-header" style={{ position: 'relative' }}>
        <div className="logo"><Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Engram</Link></div>
      </header>
      <main className="main-content" style={{ textAlign: 'left', minHeight: 'auto', paddingTop: '2rem' }}>
        <h1 className="headline" style={{ fontSize: '2.5rem' }}>Terms of Service</h1>
        <div style={{ lineHeight: '1.6', fontSize: '1.1rem', maxWidth: '800px', color: '#333' }}>
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          <br/>
          <h3>1. Acceptance of Terms</h3>
          <p>By accessing or using Engram, you agree to be bound by these Terms of Service. If you do not agree to all the terms, you may not access the service.</p>
          <br/>
          <h3>2. User Responsibilities</h3>
          <p>You are responsible for the content and documentation you submit. You agree not to upload harmful, illegal, or malicious content. Engram reserves the right to suspend or terminate accounts that violate these terms.</p>
          <br/>
          <h3>3. Intellectual Property</h3>
          <p>You retain full intellectual property rights to your personal data and the specific digital companion generated from it. Engram retains the rights to the underlying platform, AI engine, and software.</p>
          <br/>
          <h3>4. Service Availability</h3>
          <p>While we strive for high availability, Engram does not guarantee uninterrupted service. We reserve the right to modify, suspend, or discontinue the service at any time without prior notice.</p>
          <br/>
          <h3>5. Limitation of Liability</h3>
          <p>Engram is provided "as is". We are not liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our services.</p>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
