import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReviewPage.css';

const ReviewPage = () => {
    const navigate = useNavigate();
    // State to track ratings for each criterion
    const [ratings, setRatings] = useState({
        openness: 0,
        consciousness: 0,
        extrovertness: 0,
        agreeableness: 0,
        neuroticism: 0
    });

    // State for text inputs
    const [thoughtsReplication, setThoughtsReplication] = useState('');
    const [additionalComments, setAdditionalComments] = useState('');

    // Handle star rating click
    const handleRatingClick = (criterion, rating) => {
        setRatings({
            ...ratings,
            [criterion]: rating
        });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitted ratings:', ratings);
        console.log('Thoughts replication:', thoughtsReplication);
        console.log('Additional comments:', additionalComments);
        // Here you would typically send this data to your backend

        // Navigate to home page after submission
        navigate('/new_page');
    };

    // Render stars for a criterion
    const renderStars = (criterion) => {
        const stars = [];

        for (let i = 1; i <= 10; i++) {
            stars.push(
                <span
                    key={i}
                    className={`star ${i <= ratings[criterion] ? 'active' : ''}`}
                    onClick={() => handleRatingClick(criterion, i)}
                >
                    ★
                </span>
            );
        }

        return stars;
    };

    return (
        <div
            className="review-page-wrapper"
            style={{
                backgroundImage: "url('/src/components/auth/assets/background (1).jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                width: "100%",
                height: "100vh",
                position: "fixed",
                top: 0,
                left: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <div className="review-container">
                <h1 className="review-header">Based on your experience, please rate how well Engram could replicate your thoughts on the following criteria</h1>

                <form onSubmit={handleSubmit}>
                    <div className="criteria-section">
                        <div className="criterion">
                            <h3>Openness</h3>
                            <div className="stars-container">
                                {renderStars('openness')}
                            </div>
                        </div>

                        <div className="criterion">
                            <h3>Consciousness</h3>
                            <div className="stars-container">
                                {renderStars('consciousness')}
                            </div>
                        </div>

                        <div className="criterion">
                            <h3>Extrovertness</h3>
                            <div className="stars-container">
                                {renderStars('extrovertness')}
                            </div>
                        </div>

                        <div className="criterion">
                            <h3>Agreeableness</h3>
                            <div className="stars-container">
                                {renderStars('agreeableness')}
                            </div>
                        </div>

                        <div className="criterion">
                            <h3>Neuroticism</h3>
                            <div className="stars-container">
                                {renderStars('neuroticism')}
                            </div>
                        </div>
                    </div>

                    <div className="text-input-section">
                        <div className="text-input-group">
                            <label htmlFor="thoughts-replication">How well did engram replicate your thoughts?</label>
                            <textarea
                                id="thoughts-replication"
                                value={thoughtsReplication}
                                onChange={(e) => setThoughtsReplication(e.target.value)}
                                rows="4"
                            ></textarea>
                        </div>

                        <div className="text-input-group">
                            <label htmlFor="additional-comments">Any other comments</label>
                            <textarea
                                id="additional-comments"
                                value={additionalComments}
                                onChange={(e) => setAdditionalComments(e.target.value)}
                                rows="4"
                            ></textarea>
                        </div>
                    </div>

                    <button type="submit" className="submit-button">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default ReviewPage;