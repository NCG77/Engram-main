import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../LandingPage/LandingPage.css';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="main-container loaded" style={{ padding: '2rem' }}>
      <header className="main-header" style={{ position: 'relative' }}>
        <div className="logo"><Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Engram</Link></div>
      </header>
      <main className="main-content" style={{ textAlign: 'left', minHeight: 'auto', paddingTop: '2rem' }}>
        <h1 className="headline" style={{ fontSize: '2.5rem' }}>Privacy Policy</h1>
        <div style={{ lineHeight: '1.6', fontSize: '1.1rem', maxWidth: '800px', color: '#333' }}>
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          <br/>
          <h3>1. Data Collection</h3>
          <p>We collect personal documentation, reflections, and usage data that you provide to us to train and personalize your digital companion. This includes text inputs, interaction logs, and behavioral signals.</p>
          <br/>
          <h3>2. How We Use Your Data</h3>
          <p>Your data is processed through our proprietary AI engine to extract behavioral insights and personality markers based on the OCEAN framework. This data is strictly used to construct and refine your comprehensive digital profile.</p>
          <br/>
          <h3>3. Data Ownership and Security</h3>
          <p>You maintain full intellectual property rights over your digital companion. Engram acts as a steward of your data, employing industry-standard security measures to ensure your data is safe and isolated.</p>
          <br/>
          <h3>4. Data Deletion</h3>
          <p>You may request complete data deletion at any time. We offer a seamless offboarding process to ensure your digital identity is either retained under your control or entirely removed from our systems.</p>
          <br/>
          <h3>5. Contact Us</h3>
          <p>If you have any questions about this Privacy Policy, please contact us at justin.cider.dm@gmail.com.</p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
