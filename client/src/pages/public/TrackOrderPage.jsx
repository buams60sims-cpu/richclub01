import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import { trackOrder } from '../../services/apiService';
import './TrackOrderPage.css';

const TrackOrderPage = () => {
    const navigate = useNavigate();
    const [orderId, setOrderId] = useState('');
    const [mobile, setMobile] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!orderId.trim() || !mobile.trim()) {
            setError('Order ID and mobile number are required.');
            return;
        }

        if (!/^[6-9][0-9]{9}$/.test(mobile.trim())) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }

        try {
            setLoading(true);
            const response = await trackOrder({ orderId: orderId.trim(), mobile: mobile.trim() });
            if (response.success) {
                navigate('/track-order/result', { state: { order: response.order } });
            } else {
                setError(response.message || 'Unable to locate this order.');
            }
        } catch (err) {
            console.error('Track order error:', err);
            const message = err.response?.data?.message || err.message || 'Unable to locate this order.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout>
            <div className="track-order-page py-48">
                <div className="container">
                    <div className="track-order-card">
                        <h1>Track Your Order</h1>
                        <p>Enter your Order ID and mobile number to view the latest status.</p>

                        <form onSubmit={handleSubmit} className="track-order-form">
                            <label>
                                Order ID
                                <input
                                    type="text"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    placeholder="e.g. RC-2026-1234"
                                />
                            </label>

                            <label>
                                Mobile Number
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="10-digit mobile number"
                                />
                            </label>

                            {error && <p className="error-message">{error}</p>}

                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Checking...' : 'Track Order'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default TrackOrderPage;
