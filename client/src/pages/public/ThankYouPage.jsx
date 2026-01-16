import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Home, ExternalLink } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import './ThankYouPage.css';

const ThankYouPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { invoiceNumber, orderId } = location.state || {};

    useEffect(() => {
        if (!invoiceNumber) {
            navigate('/', { replace: true });
        }
    }, [invoiceNumber, navigate]);

    if (!invoiceNumber) return null;

    return (
        <PublicLayout>
            <div className="thank-you-page py-48">
                <div className="container">
                    <div className="thank-you-card">
                        <div className="success-icon">
                            <CheckCircle size={64} className="text-green-500" />
                        </div>

                        <h1 className="thank-you-title">Thank You!</h1>
                        <p className="thank-you-message">
                            Your order has been placed successfully.
                        </p>

                        <div className="order-details-box">
                            <div className="detail-row">
                                <span className="label">Invoice Number</span>
                                <span className="value font-mono">{invoiceNumber}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Payment Status</span>
                                <span className="value status-paid">Paid</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Payment Method</span>
                                <span className="value">Razorpay</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Date</span>
                                <span className="value">{new Date().toLocaleDateString('en-IN')}</span>
                            </div>
                        </div>

                        <p className="contact-info">
                            We have received your order and our team will process it shortly.
                            <br />
                            For any queries, please contact support.
                        </p>

                        <div className="action-buttons">
                            <Link to="/" className="btn btn-secondary">
                                <Home size={20} />
                                Go to Home
                            </Link>

                            <a
                                href="https://wa.me/916362145668?text=Hi, I have a query regarding my order"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                            >
                                Contact Support
                                <ExternalLink size={20} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default ThankYouPage;
