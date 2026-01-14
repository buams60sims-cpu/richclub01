import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    {/* Brand Section */}
                    <div className="footer-section">
                        <h3 className="footer-brand">Rich Club</h3>
                        <p className="footer-tagline">
                            Luxury streetwear and premium fashion for the modern individual.
                        </p>
                        <div className="footer-contact">
                            <div className="contact-item">
                                <Mail size={16} />
                                <span>richclubcustomiseprinting@gmail.com</span>
                            </div>
                            <div className="contact-item">
                                <Phone size={16} />
                                <span>+91 8660538107</span>
                            </div>
                            <div className="contact-item">
                                <MapPin size={16} />
                                <span>Bangalore, Karnataka, India</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4 className="footer-heading">Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/shop">Shop</Link></li>
                            <li><Link to="/cart">Cart</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="footer-section">
                        <h4 className="footer-heading">Categories</h4>
                        <ul className="footer-links">
                            <li><Link to="/shop?category=normal-tshirts">Normal T-Shirts</Link></li>
                            <li><Link to="/shop?category=oversize-tshirts">Oversize T-Shirts</Link></li>
                            <li><Link to="/shop?category=collar-tshirts">Collar T-Shirts</Link></li>
                            <li><Link to="/shop?category=hoodies">Hoodies</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © {currentYear} Rich Club. All rights reserved.
                    </p>
                    <p className="footer-credit">
                        Crafted with excellence for the modern individual.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
