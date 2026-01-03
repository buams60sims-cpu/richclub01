import React, { useEffect, useState } from 'react';
import { checkHealth } from '../services/api';
import './Home.css';

/**
 * Home Page Component
 * Landing page with welcome message and API health check
 */
const Home = () => {
    const [healthStatus, setHealthStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const data = await checkHealth();
                setHealthStatus(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchHealth();
    }, []);

    return (
        <div className="home-page">
            <div className="container">
                <section className="hero">
                    <h1>Welcome to Rich Club</h1>
                    <p className="hero-subtitle">
                        Your Premium eCommerce Destination
                    </p>
                    <div className="hero-actions">
                        <button className="btn btn-primary">Shop Now</button>
                        <button className="btn btn-outline">Learn More</button>
                    </div>
                </section>

                <section className="features">
                    <h2 className="text-center">Why Choose Us</h2>
                    <div className="features-grid">
                        <div className="feature-card card">
                            <div className="feature-icon">🚚</div>
                            <h3>Fast Delivery</h3>
                            <p>Get your products delivered quickly and safely</p>
                        </div>
                        <div className="feature-card card">
                            <div className="feature-icon">💳</div>
                            <h3>Secure Payment</h3>
                            <p>Your transactions are safe and encrypted</p>
                        </div>
                        <div className="feature-card card">
                            <div className="feature-icon">🎁</div>
                            <h3>Quality Products</h3>
                            <p>Only the best products for our customers</p>
                        </div>
                        <div className="feature-card card">
                            <div className="feature-icon">💬</div>
                            <h3>24/7 Support</h3>
                            <p>We're here to help you anytime</p>
                        </div>
                    </div>
                </section>

                <section className="api-status">
                    <h2 className="text-center">API Status</h2>
                    <div className="status-card card">
                        {loading ? (
                            <div className="status-loading">
                                <div className="spinner"></div>
                                <p>Checking API connection...</p>
                            </div>
                        ) : error ? (
                            <div className="status-error">
                                <p className="error-message">❌ {error}</p>
                                <p className="error-hint">
                                    Make sure the backend server is running on http://localhost:5000
                                </p>
                            </div>
                        ) : (
                            <div className="status-success">
                                <h3>✅ Backend Connected Successfully!</h3>
                                <div className="status-details">
                                    <p><strong>Environment:</strong> {healthStatus?.environment}</p>
                                    <p><strong>Timestamp:</strong> {new Date(healthStatus?.timestamp).toLocaleString()}</p>
                                    <p><strong>Message:</strong> {healthStatus?.message}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
