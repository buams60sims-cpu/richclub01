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

                        <h1 className="thank-you-title">🎉 Order Confirmed!</h1>
                        <p className="thank-you-message">
                            Your order has been placed successfully.
                        </p>

                        <div className="order-id-highlight">
                            <p className="order-id-label">Your Order ID</p>
                            <h2 className="order-id-value">{invoiceNumber}</h2>
                            <button 
                                className="btn-copy-order-id"
                                onClick={() => {
                                    navigator.clipboard.writeText(invoiceNumber);
                                    alert('Order ID copied!');
                                }}
                            >
                                Copy Order ID
                            </button>
                            <p className="order-id-note">
                                ⚠️ Please save or screenshot this Order ID. You will need it to track your order.
                            </p>
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
