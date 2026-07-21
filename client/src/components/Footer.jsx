import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-shell">
                <div className="footer-grid">
                    <div className="footer-intro">
                        <h2 className="footer-brand">Rich Club</h2>
                        <p className="footer-copy">
                            Quietly elegant apparel for those who value calm confidence and considered style.
                        </p>

                        <div className="footer-contact">
                            <a className="contact-item" href="mailto:richclubcustomiseprinting@gmail.com">
                                <Mail size={16} />
                                <span>richclubcustomiseprinting@gmail.com</span>
                            </a>
                            <a className="contact-item" href="tel:+918660538107">
                                <Phone size={16} />
                                <span>+91 86605 38107</span>
                            </a>
                            <div className="contact-item">
                                <MapPin size={16} />
                                <span>Bangalore, Karnataka, India</span>
                            </div>
                        </div>
                    </div>

                    <div className="footer-links-col">
                        <h3 className="footer-heading">LINKS</h3>
                        <ul className="footer-nav-list">
                            <li>
                                <Link to="/contact">Contact us</Link>
                            </li>
                            <li>
                                <Link to="/refund-policy">Refund policy</Link>
                            </li>
                            <li>
                                <Link to="/shipping-policy">Shipping Policy</Link>
                            </li>
                            <li>
                                <Link to="/privacy-policy">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link to="/track-order">Track your order</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="footer-legal">© {currentYear} Rich Club. All rights reserved.</p>
                    <p className="footer-legal footer-legal-meta">Bangalore, Karnataka · Premium everyday pieces.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
