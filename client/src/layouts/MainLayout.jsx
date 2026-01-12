import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import './MainLayout.css';

/**
 * Main Layout Component
 * Provides consistent header and footer across all pages
 */
const MainLayout = ({ children }) => {
    return (
        <div className="main-layout">
            <Header />
            <main className="main-content">
                {children}
            </main>
            <Footer />
            <FloatingWhatsApp />
        </div>
    );
};

export default MainLayout;
