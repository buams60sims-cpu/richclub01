import React from 'react';
import { Mail, Phone, MapPin, ShieldCheck, Truck, RotateCcw, Lock, HelpCircle } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import './PolicyPages.css';

export const ContactUsPage = () => {
    return (
        <PublicLayout>
            <div className="policy-page py-48">
                <div className="container">
                    <div className="policy-card">
                        <div className="policy-header">
                            <HelpCircle size={32} className="header-icon" />
                            <h1>Contact Us</h1>
                            <p>We are here to assist you with any questions or custom inquiries.</p>
                        </div>

                        <div className="contact-grid">
                            <div className="contact-card">
                                <Mail size={24} className="card-icon" />
                                <h3>Email Us</h3>
                                <p>For support, orders, or custom design queries:</p>
                                <a href="mailto:richclubcustomiseprinting@gmail.com" className="contact-link">
                                    richclubcustomiseprinting@gmail.com
                                </a>
                            </div>

                            <div className="contact-card">
                                <Phone size={24} className="card-icon" />
                                <h3>Call / WhatsApp</h3>
                                <p>Mon - Sat (10:00 AM - 7:00 PM IST):</p>
                                <a href="tel:+918660538107" className="contact-link">
                                    +91 86605 38107
                                </a>
                            </div>

                            <div className="contact-card">
                                <MapPin size={24} className="card-icon" />
                                <h3>Location</h3>
                                <p>Headquarters & Workshop:</p>
                                <span className="contact-text">Bangalore, Karnataka, India</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export const RefundPolicyPage = () => {
    return (
        <PublicLayout>
            <div className="policy-page py-48">
                <div className="container">
                    <div className="policy-card">
                        <div className="policy-header">
                            <RotateCcw size={32} className="header-icon" />
                            <h1>Refund & Exchange Policy</h1>
                            <p>Customer satisfaction is our highest priority at Rich Club.</p>
                        </div>

                        <div className="policy-body">
                            <section className="policy-section">
                                <h2>7-Day Easy Returns & Exchanges</h2>
                                <p>
                                    If you receive a defective, damaged, or incorrectly sized garment, you may request a return or exchange within 7 days of delivery.
                                </p>
                            </section>

                            <section className="policy-section">
                                <h2>Return Eligibility</h2>
                                <ul>
                                    <li>Items must be unworn, unwashed, and in original condition with all tags intact.</li>
                                    <li>Custom-printed or personalized apparel is eligible for replacement only if damaged or defective.</li>
                                    <li>Proof of purchase (invoice number or order ID) is required for processing.</li>
                                </ul>
                            </section>

                            <section className="policy-section">
                                <h2>Refund Process</h2>
                                <p>
                                    Once your returned item passes quality inspection, refunds are credited back to your original payment method (Razorpay/Bank transfer) within 5–7 business days.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export const ShippingPolicyPage = () => {
    return (
        <PublicLayout>
            <div className="policy-page py-48">
                <div className="container">
                    <div className="policy-card">
                        <div className="policy-header">
                            <Truck size={32} className="header-icon" />
                            <h1>Shipping Policy</h1>
                            <p>Fast, reliable delivery nationwide across India.</p>
                        </div>

                        <div className="policy-body">
                            <section className="policy-section">
                                <h2>Dispatch & Processing</h2>
                                <p>
                                    All orders are processed and dispatched within 24 to 48 business hours from our Bangalore facility.
                                </p>
                            </section>

                            <section className="policy-section">
                                <h2>Delivery Timelines</h2>
                                <ul>
                                    <li><strong>Metro Cities:</strong> 2 - 4 business days</li>
                                    <li><strong>Rest of India:</strong> 4 - 7 business days</li>
                                    <li><strong>Custom Prints:</strong> Additional 1-2 days for production</li>
                                </ul>
                            </section>

                            <section className="policy-section">
                                <h2>Order Tracking</h2>
                                <p>
                                    You will receive a unique tracking link via SMS / WhatsApp upon dispatch. You can also track live updates on our <a href="/track-order">Track Order</a> page.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export const PrivacyPolicyPage = () => {
    return (
        <PublicLayout>
            <div className="policy-page py-48">
                <div className="container">
                    <div className="policy-card">
                        <div className="policy-header">
                            <Lock size={32} className="header-icon" />
                            <h1>Privacy Policy</h1>
                            <p>We are committed to protecting your personal data and privacy.</p>
                        </div>

                        <div className="policy-body">
                            <section className="policy-section">
                                <h2>Data Collection</h2>
                                <p>
                                    We collect essential customer information (Name, Phone, Email, Delivery Address) strictly to fulfill your orders and provide customer support.
                                </p>
                            </section>

                            <section className="policy-section">
                                <h2>Payment Security</h2>
                                <p>
                                    We do not store credit card or bank details. All transactions are securely encrypted and processed via <strong>Razorpay</strong> payment gateway.
                                </p>
                            </section>

                            <section className="policy-section">
                                <h2>Data Protection</h2>
                                <p>
                                    Your information will never be sold or shared with unauthorized third parties.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};
