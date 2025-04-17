import { useState, useEffect, useRef } from 'react';
import './LandingPage.css';
import dotPattern from '../LandingPage/assets/Logo.svg';
import diary from '../LandingPage/assets/Diary.png';
import review from '../LandingPage/assets/review.png';
import OCEAN from '../LandingPage/assets/OCEAN.png';

export default function LandingPage() {
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const sectionOneRef = useRef(null);
    const sectionTwoRef = useRef(null);
    const sectionThreeRef = useRef(null);
    const faqSectionRef = useRef(null);

    useEffect(() => {
        setTimeout(() => {
            setIsLoaded(true);
        }, 300);

        // Create intersection observer for all sections
        const observerOptions = {
            root: null, // viewport
            rootMargin: '0px',
            threshold: 0.2 // 20% of the element must be visible
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe all sections
        if (sectionOneRef.current) sectionObserver.observe(sectionOneRef.current);
        if (sectionTwoRef.current) sectionObserver.observe(sectionTwoRef.current);
        if (sectionThreeRef.current) sectionObserver.observe(sectionThreeRef.current);
        if (faqSectionRef.current) sectionObserver.observe(faqSectionRef.current);

        return () => {
            // Clean up observer
            if (sectionOneRef.current) sectionObserver.unobserve(sectionOneRef.current);
            if (sectionTwoRef.current) sectionObserver.unobserve(sectionTwoRef.current);
            if (sectionThreeRef.current) sectionObserver.unobserve(sectionThreeRef.current);
            if (faqSectionRef.current) sectionObserver.unobserve(faqSectionRef.current);
        };
    }, []);

    const toggleQuestion = (index) => {
        setActiveQuestion(activeQuestion === index ? null : index);
    };

    const faqItems = [
        {
            question: "What's the process after I write the diary?",
            answer: "After you write your diary, we store and extract important details from it. Our AI model then learns from this data to create a digital replica of you."
        },
        {
            question: "How will my final digital version be usable?",
            answer: "Your final digital replica will be delivered through the a seperate page, test, and interact with it"
        },
        {
            question: "Can I upgrade my digital version?",
            answer: "Yes, you can upgrade your digital version at any time. We offer different tiers of service with additional features and capabilities that can be added as-per your needs."
        },
        {
            question: "Do I get full ownership of my personality?",
            answer: "Yes, you retain full ownership of your digital replica. We provide you with complete access and control over how it's used and implemented."
        },
        {
            question: "What are your payment methods?",
            answer: "We accept all major credit cards, UPI, and bank transfers. Payment plans are also available for our premium packages."
        },
        {
            question: "Can I request a deletion?",
            answer: "We offer a persona delete option. If you're not happy with our service, or want to delete your data you can request a deletion , subject to our terms and conditions."
        },
        {
            question: "I have more questions!",
            answer: "Feel free to contact us at justin.cider.dm@gmail.com, and our team will be happy to assist you with any additional questions or concerns you may have."
        }
    ];

    return (
        <div className={`main-container ${isLoaded ? 'loaded' : ''}`}>
            <header className="main-header">
                <div className="logo">Engram</div>
                <nav className="navigation">
                    <div className="nav-item">
                        <span>Process</span>
                        <span className="badge">NEW</span>
                    </div>
                    <div className="nav-item" onClick={() => window.location.href = '/auth'}>Signup</div>
                </nav>
            </header>

            <div className="background-patterns">
                <img src={dotPattern} alt="dotpattern" className="pattern-image" />
            </div>

            <main className="main-content">
                <h1 className="headline">
                    Engram
                </h1>
                <p className="subheadline">
                    Replicate your digital self.
                </p>
                <button className="cta-button" onClick={() => window.location.href = '/auth'}>
                    Free – Start Now
                </button>
            </main>

            <section className="concept-section section-one" ref={sectionOneRef}>
                <div className="concept-cards">
                    <div className="concept-card">
                        <img src={diary} alt="diary" className="card-image" />
                    </div>
                </div>

                <div className="concept-header">
                    <span className="concept-number">1. Daily Diary.</span>
                    <h2 className="concept-title">Writing daily diary</h2>
                    <p className="concept-description">
                        Keep a record of your daily thoughts, feelings, and experiences. This helps in self-reflection and personal growth.
                        We collect personality data from your diary and use it to create a digital twin of you.
                    </p>
                </div>
            </section>

            <section className="concept-section section-two" ref={sectionTwoRef}>
                <div className="concept-header">
                    <span className="concept-number">2. Text extraction.</span>
                    <h2 className="concept-title">The OCEAN format</h2>
                    <p className="concept-description">
                        The AI model then extracts the text and learns from it. It uses the OCEAN format to understand your personality traits.
                    </p>
                </div>

                <div className="concept-cards">
                    <div className="concept-card">
                        <img src={OCEAN} alt="OCEAN personality model" className="card-image" />
                    </div>
                </div>
            </section>

            <section className="concept-section section-three" ref={sectionThreeRef}>
                <div className="concept-cards">
                    <div className="concept-card">
                        <img src={review} alt="Test and review" className="card-image" />
                    </div>
                </div>

                <div className="concept-header">
                    <span className="concept-number">3. Test and review.</span>
                    <h2 className="concept-title">Test the replica and review</h2>
                    <p className="concept-description">
                        Test the replica and review the results. This helps in understanding how well the AI model has learned from your data.
                        You can also provide feedback to improve the model's accuracy.
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
                                <span className="faq-icon">{activeQuestion === index ? '−' : '+'}</span>
                            </button>
                            {activeQuestion === index && (
                                <div className="faq-answer">
                                    <p>{item.answer}</p>
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
                        <div className="footer-link">Support</div>
                    </div>
                    <button className="footer-cta" onClick={() => window.location.href = '/auth'}>Free – Start Now</button>
                </div>
            </footer>
        </div>
    );
}