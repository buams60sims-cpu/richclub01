import React from 'react';
import './Footer.css';

/**
 * Footer Component
 * Luxury minimal footer for streetwear brand
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>Rich Club</h3>
                        <p>Premium streetwear, crafted with purpose.</p>
                    </div>
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul className="footer-links">
                            <li><a href="/about">About Us</a></li>
                            <li><a href="/contact">Contact</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Contact</h4>
                        <p>info@richclub.com</p>
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
