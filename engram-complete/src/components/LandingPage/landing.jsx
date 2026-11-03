import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import heroHands from "./assets/Logo.jpg";
import diary from "./assets/Diary.jpg";
import review from "./assets/review.jpg";
import OCEAN from "./assets/OCEAN.jpg";

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const sectionOneRef = useRef(null);
  const sectionTwoRef = useRef(null);
  const sectionThreeRef = useRef(null);
  const faqSectionRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    // Reset any leaked styles or classes from other pages
    document.body.classList.remove("dark-mode", "light-mode");
    document.body.removeAttribute("data-theme");
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#111111";
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
    document.documentElement.style.height = "auto";
    document.body.style.height = "auto";

    setIsLoaded(true);
  }, []);

  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const faqItems = [
    {
      question: "What happens after I submit my personal documentation?",
      answer:
        "Your reflections are processed through our proprietary AI engine, which extracts behavioral insights and personality markers. This data is then analyzed using the OCEAN framework to construct your comprehensive digital profile.",
    },
    {
      question: "How will I access and interact with my digital companion?",
      answer:
        "Your personalized AI companion is delivered through a dedicated interface where you can engage in natural conversations, test its understanding of your perspective, and validate its authenticity against your expectations.",
    },
    {
      question: "Can I enhance my digital companion over time?",
      answer:
        "Absolutely. Continuous interaction and regular diary reflections expand your companion's memory, refine its contextual understanding, and elevate its behavioral fidelity based on your evolving thoughts.",
    },
    {
      question: "Do I retain complete ownership of my digital identity?",
      answer:
        "Yes. You maintain full ownership and intellectual property rights over your personal reflections and digital companion. Engram serves strictly as the secure custodian of your data, guaranteeing your privacy remains uncompromised.",
    },
    {
      question: "What payment and subscription options are available?",
      answer:
        "Engram currently offers full free access to chronicle your thoughts and interact with your companion. Advanced subscription tiers with expanded context windows and custom fine-tuning will be introduced in future updates.",
    },
    {
      question: "What happens if I decide to discontinue the service?",
      answer:
        "You maintain the right to request complete data deletion at any time. We provide an immediate, seamless offboarding process that permanently deletes your digital identity and entries from our systems.",
    },
    {
      question: "Still have questions?",
      answer:
        "Our specialist team is available to assist you. Contact us directly at justin.cider.dm@gmail.com and we will provide comprehensive guidance tailored to your specific inquiries.",
    },
  ];

  return (
    <div className={`main-container ${isLoaded ? "loaded" : ""}`}>
      <header className="main-header">
        <div
          className="logo"
          onClick={() => {
            if (localStorage.getItem("token")) {
              navigate("/new_page");
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          role="button"
          tabIndex={0}
          title="Engram"
        >
          Engram
        </div>
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
            onClick={() =>
              sectionTwoRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Analysis
          </div>
          <div
            className="nav-item"
            onClick={() =>
              faqSectionRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          >
            FAQ
          </div>
          <div
            className="nav-item nav-signin"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </div>
          <button
            className="nav-cta-btn"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </button>
        </nav>
      </header>

      <div className="background-patterns" aria-hidden="true">
        <img src={heroHands} alt="" className="pattern-image" decoding="async" fetchPriority="high" />
      </div>

      <main className="main-content">
        <p className="hero-text-top">
          Create a personalized AI companion that authentically captures your
          unique identity, cognitive architecture, and intellectual essence.
        </p>
        <h1 className="headline">Engram</h1>
        <div className="hero-hands-spacer" aria-hidden="true" />
        <div className="hero-actions">
          <button
            className="cta-button cta-primary"
            onClick={() => navigate("/auth")}
          >
            Free – Start Now
          </button>
          <button
            className="cta-button cta-secondary"
            onClick={() =>
              sectionOneRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explore the Process
          </button>
        </div>
      </main>

      <section
        className="concept-section section-one"
        ref={sectionOneRef}
      >
        <div className="concept-cards">
          <div className="concept-card">
            <img src={diary} alt="Personal documentation and journaling" className="card-image" loading="lazy" decoding="async" />
          </div>
        </div>

        <div className="concept-header">
          <span className="concept-number">01 / Personal Documentation</span>
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
          <span className="concept-number">02 / Cognitive Analysis</span>
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
              alt="OCEAN personality framework model"
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
            <img src={review} alt="Validation and optimization" className="card-image" loading="lazy" decoding="async" />
          </div>
        </div>

        <div className="concept-header">
          <span className="concept-number">03 / Refinement & Deployment</span>
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

      <section className="final-cta-section" ref={ctaRef}>
        <div className="final-cta-badge">Digital Continuum</div>
        <h2 className="final-cta-title">Preserve Your Consciousness Online</h2>
        <p className="final-cta-description">
          Start journaling today and watch your authentic AI companion come to life.
          Complete data privacy and full intellectual property ownership guaranteed.
        </p>
        <button
          className="cta-button cta-primary cta-large"
          onClick={() => navigate("/auth")}
        >
          Free – Start Now
        </button>
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
                <span>{item.question}</span>
                <span className="faq-icon" aria-hidden="true">
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
          <div className="footer-col brand-col">
            <div
              className="footer-brand"
              onClick={() => {
                if (localStorage.getItem("token")) {
                  navigate("/new_page");
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              role="button"
              tabIndex={0}
              title="Engram"
            >
              Engram
            </div>
            <p className="footer-tagline">
              Preserving your intellect, consciousness, and voice in the digital continuum.
            </p>
          </div>

          <div className="footer-links">
            <button
              className="footer-link-btn"
              onClick={() => sectionOneRef.current?.scrollIntoView({ behavior: "smooth" })}
            >
              Process
            </button>
            <button
              className="footer-link-btn"
              onClick={() => faqSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
            >
              FAQ
            </button>
            <a
              className="footer-link-btn"
              href="mailto:justin.cider.dm@gmail.com"
            >
              Support
            </a>
            <button
              className="footer-link-btn"
              onClick={() => navigate("/privacy-policy")}
            >
              Privacy Policy
            </button>
            <button
              className="footer-link-btn"
              onClick={() => navigate("/terms-of-service")}
            >
              Terms of Service
            </button>
          </div>

          <div className="footer-cta-col">
            <button
              className="footer-cta"
              onClick={() => navigate("/auth")}
            >
              Free – Start Now
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Engram. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
