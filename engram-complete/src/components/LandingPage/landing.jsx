import { useState, useEffect, useRef } from "react";
import "./LandingPage.css";
import dotPattern from "./assets/Logo.svg";
import diary from "./assets/Diary.jpg";
import review from "./assets/review.jpg";
import OCEAN from "./assets/OCEAN.jpg";
export default function LandingPage() {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const sectionOneRef = useRef(null);
  const sectionTwoRef = useRef(null);
  const sectionThreeRef = useRef(null);
  const faqSectionRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);
  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    document.body.classList.add("light-mode");
    document.body.classList.remove("dark-mode");
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.2,
    };
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);
    if (sectionOneRef.current) sectionObserver.observe(sectionOneRef.current);
    if (sectionTwoRef.current) sectionObserver.observe(sectionTwoRef.current);
    if (sectionThreeRef.current)
      sectionObserver.observe(sectionThreeRef.current);
    if (faqSectionRef.current) sectionObserver.observe(faqSectionRef.current);
    if (featuresRef.current) sectionObserver.observe(featuresRef.current);
    if (ctaRef.current) sectionObserver.observe(ctaRef.current);
    return () => {
      if (sectionOneRef.current)
        sectionObserver.unobserve(sectionOneRef.current);
      if (sectionTwoRef.current)
        sectionObserver.unobserve(sectionTwoRef.current);
      if (sectionThreeRef.current)
        sectionObserver.unobserve(sectionThreeRef.current);
      if (faqSectionRef.current)
        sectionObserver.unobserve(faqSectionRef.current);
      if (featuresRef.current) sectionObserver.unobserve(featuresRef.current);
      if (ctaRef.current) sectionObserver.unobserve(ctaRef.current);
    };
  }, []);
  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };
  const faqItems = [
    {
      question: "What happens after I submit my personal documentation?",
      answer:
        "Your reflections are processed through our proprietary AI engine, which extracts behavioral insights and personality markers. This data is Then analyzed using the OCEAN framework to construct your comprehensive digital profile.",
    },
    {
      question: "How will I access and interact with my digital companion?",
      answer:
        "Your personalized AI companion is delivered through a dedicated interface where you can engage in natural conversations, test its understanding of your perspective, and validate its authenticity against your expectations.",
    },
    {
      question: "Can I enhance my digital companion over time?",
      answer:
        "Absolutely. We are planning to add tiered enhancement packages that expand your companion's capabilities, add specialized knowledge domains, and refine behavioral accuracy based on your evolving needs.",
    },
    {
      question: "Do I retain complete ownership of my digital identity?",
      answer:
        "Yes. You maintain full intellectual property rights over your digital companion. Engram serves as the steward of your data, providing secure access and control over deployment and usage parameters.",
    },
    {
      question: "What payment and subscription options are available?",
      answer:
        "We are still in the process to add major payment methods including credit cards, UPI, and bank transfers. Flexible subscription tiers will be available to accommodate both individual users and enterprise implementations.",
    },
    {
      question: "What happens if I decide to discontinue the service?",
      answer:
        "You maintain the right to request complete data deletion at any time. We provide a seamless offboarding process that ensures your digital identity is either retained under your control or completely removed, subject to our service agreement.",
    },
    {
      question: "Still have questions?",
      answer:
        "Our specialist team is available to address any inquiries. Contact us at justin.cider.dm@gmail.com and we'll provide comprehensive guidance tailored to your specific requirements.",
    },
  ];
  return (
    <div className={`main-container ${isLoaded ? "loaded" : ""}`}>
      <header className="main-header">
        <div className="logo">Engram</div>
        <nav className="navigation">
          <div
            className="nav-item"
            onClick={() =>
              sectionOneRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Process
          </div>
          <div
            className="nav-item"
            onClick={() => (window.location.href = "/auth")}
          >
            Signup
          </div>
        </nav>
      </header>
      <div className="background-patterns">
        <img src={dotPattern} alt="dotpattern" className="pattern-image" fetchpriority="high" decoding="async" />
      </div>
      <main className="main-content">
        <h1 className="headline">Engram</h1>
        <p className="sub-description">
          Create a personalized AI companion that authentically captures your
          unique identity and intellectual essence.
        </p>
        <button
          className="cta-button"
          onClick={() => (window.location.href = "/auth")}
        >
          Free – Start Now
        </button>
      </main>
      <section
        className="concept-section section-one"
        ref={sectionOneRef}
        style={{ marginTop: "80px" }}
      >
        <div className="concept-cards">
          <div className="concept-card">
            <img src={diary} alt="diary" className="card-image" loading="lazy" decoding="async" />
          </div>
        </div>
        <div className="concept-header">
          <span className="concept-number">1. Personal Documentation</span>
          <h2 className="concept-title">Chronicle Your Essence</h2>
          <p className="concept-description">
            Document your thoughts, insights, and experiences through daily
            reflections. This foundational step enables our advanced AI to
            extract meaningful personality signals and behavioral patterns that
            form the core of your digital representation.
          </p>
        </div>
      </section>
      <section className="concept-section section-two" ref={sectionTwoRef}>
        <div className="concept-header">
          <span className="concept-number">2. Cognitive Analysis</span>
          <h2 className="concept-title">OCEAN Personality Framework</h2>
          <p className="concept-description">
            Our proprietary AI leverages the scientifically validated OCEAN
            model to analyze your psychological profile. We measure Openness,
            Conscientiousness, Extraversion, Agreeableness, and Neuroticism to
            construct a comprehensive understanding of your unique personality
            architecture.
          </p>
        </div>
        <div className="concept-cards">
          <div className="concept-card">
            <img
              src={OCEAN}
              alt="OCEAN personality model"
              className="card-image"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>
      <section className="concept-section section-three" ref={sectionThreeRef}>
        <div className="concept-cards">
          <div className="concept-card">
            <img src={review} alt="Test and review" className="card-image" loading="lazy" decoding="async" />
          </div>
        </div>
        <div className="concept-header">
          <span className="concept-number">3. Refinement & Deployment</span>
          <h2 className="concept-title">
            Validate & Optimize Your Digital Identity
          </h2>
          <p className="concept-description">
            Interact with your AI companion and refine its behavioral patterns.
            Our iterative validation process ensures your digital representation
            captures the nuances of your personality with exceptional accuracy,
            delivering an authentic reflection you can deploy with confidence.
          </p>
        </div>
      </section>
      <section className="faq-section" ref={faqSectionRef}>
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <div className="faq-container">
          {faqItems.map((item, index) => (
            <div key={index} className="faq-item">
              <button
                className="faq-question"
                onClick={() => toggleQuestion(index)}
                aria-expanded={activeQuestion === index}
              >
                {item.question}
                <span className="faq-icon">
                  {activeQuestion === index ? "−" : "+"}
                </span>
              </button>
              {activeQuestion === index && (
                <div className="faq-answer">
                  <p className="ans-text">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">Engram</div>
          <div className="footer-links">
            <div className="footer-link" onClick={() => window.location.href = "mailto:justin.cider.dm@gmail.com"}>Support</div>
            <div className="footer-link" onClick={() => window.location.href = "/privacy"}>Privacy Policy</div>
            <div className="footer-link" onClick={() => window.location.href = "/terms"}>Terms of Service</div>
          </div>
          <button
            className="footer-cta"
            onClick={() => (window.location.href = "/auth")}
          >
            Free – Start Now
          </button>
        </div>
      </footer>
    </div>
  );
}
