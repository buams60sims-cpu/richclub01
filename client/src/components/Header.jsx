import React from 'react';
import './Header.css';

/**
 * Header Component
 * Navigation bar for the application
 */
const Header = () => {
    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <div className="logo">
                        <h2>Rich Club</h2>
                    </div>
                    <nav className="nav">
                        <ul className="nav-list">
                            <li className="nav-item">
                                <a href="/" className="nav-link">Home</a>
                            </li>
                            <li className="nav-item">
                                <a href="/products" className="nav-link">Products</a>
                            </li>
                            <li className="nav-item">
                                <a href="/about" className="nav-link">About</a>
                            </li>
                            <li className="nav-item">
                                <a href="/contact" className="nav-link">Contact</a>
                            </li>
                        </ul>
                    </nav>
                    <div className="header-actions">
                        <button className="btn btn-outline">Login</button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
