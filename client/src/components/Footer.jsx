import React from 'react';
import './Footer.css';

/**
 * Footer Component
 * Site footer with links and copyright
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>Rich Club</h3>
                        <p>Your premium eCommerce destination</p>
                    </div>
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul className="footer-links">
                            <li><a href="/about">About Us</a></li>
                            <li><a href="/contact">Contact</a></li>
                            <li><a href="/privacy">Privacy Policy</a></li>
                            <li><a href="/terms">Terms of Service</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Contact</h4>
                        <p>Email: info@richclub.com</p>
                        <p>Phone: +1 234 567 8900</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {currentYear} Rich Club. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
