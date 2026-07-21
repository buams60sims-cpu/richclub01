import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Users } from 'lucide-react';
import { getAllCoupons, createCoupon, deleteCoupon } from '../../services/apiService';
import { formatPrice, formatDate } from '../../utils/helpers';
import Modal from '../../components/Modal';
import './AdminCoupons.css';

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENTAGE', // PERCENTAGE or FIXED
        discountAmount: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        usageLimit: '', // Member count limit (e.g. 10)
        expiryDate: '',
        isActive: true
    });

    useEffect(() => {
        loadCoupons();
    }, [refreshKey]);

    const loadCoupons = async () => {
        try {
            setLoading(true);
            const response = await getAllCoupons();
            if (response.success) {
                setCoupons(response.data);
            }
        } catch (error) {
            console.error('Failed to load coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate
            if (!formData.code || !formData.discountAmount || !formData.expiryDate) {
                alert('Please fill required fields');
                return;
            }

            const payload = {
                code: formData.code.toUpperCase(),
                discountType: formData.discountType === 'PERCENTAGE' ? 'percentage' : 'flat',
                discountValue: Number(formData.discountAmount),
                minPurchaseAmount: Number(formData.minOrderAmount) || 0,
                maxDiscountAmount: Number(formData.maxDiscountAmount) || 0,
                usageLimit: Number(formData.usageLimit) || 0,
                expiryDate: formData.expiryDate,
                isActive: formData.isActive
            };

            await createCoupon(payload);
            alert('Coupon created successfully');
            setIsModalOpen(false);
            setRefreshKey(prev => prev + 1);

            // Reset form
            setFormData({
                code: '',
                discountType: 'PERCENTAGE',
                discountAmount: '',
                minOrderAmount: '',
                maxDiscountAmount: '',
                usageLimit: '',
                expiryDate: '',
                isActive: true
            });
        } catch (error) {
            alert(error.message || 'Failed to create coupon');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                await deleteCoupon(id);
                setRefreshKey(prev => prev + 1);
            } catch (error) {
                alert('Failed to delete coupon');
            }
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1 className="admin-title">Coupons Management</h1>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> Create Coupon
                </button>
            </div>

            {loading ? (
                <div className="loading-spinner"></div>
            ) : (
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Min Order</th>
                                <th>Expiry</th>
                                <th>Member Limit</th>
                                <th>Status</th>
                                <th>Usage</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.length > 0 ? (
                                coupons.map(coupon => {
                                    const isExhausted = coupon.usageLimit > 0 && (coupon.usageCount || 0) >= coupon.usageLimit;
                                    const isExpired = new Date(coupon.expiryDate) < new Date();

                                    return (
                                        <tr key={coupon._id}>
                                            <td>
                                                <span className="coupon-code-badge">{coupon.code}</span>
                                            </td>
                                            <td>
                                                {(coupon.discountType === 'PERCENTAGE' || coupon.discountType === 'percentage')
                                                    ? `${coupon.discountValue}% OFF`
                                                    : `₹${coupon.discountValue} OFF`}
                                                {coupon.maxDiscountAmount > 0 && (
                                                    <div className="text-secondary text-xs">
                                                        Max: {formatPrice(coupon.maxDiscountAmount)}
                                                    </div>
                                                )}
                                            </td>
                                            <td>{formatPrice(coupon.minPurchaseAmount || coupon.minOrderAmount || 0)}</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {formatDate(coupon.expiryDate)}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1">
                                                    <Users size={14} className="text-secondary" />
                                                    <span>{coupon.usageLimit > 0 ? `${coupon.usageLimit} members` : 'Unlimited'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {isExhausted ? (
                                                    <span className="badge badge-danger">Exhausted</span>
                                                ) : isExpired ? (
                                                    <span className="badge badge-danger">Expired</span>
                                                ) : (
                                                    <span className={`badge ${coupon.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                        {coupon.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="font-bold">
                                                    {coupon.usageCount || 0}
                                                </span>
                                                {coupon.usageLimit > 0 && (
                                                    <span className="text-secondary text-xs"> / {coupon.usageLimit}</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="icon-btn btn-danger"
                                                    onClick={() => handleDelete(coupon._id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center p-32">
                                        No coupons found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Coupon Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Coupon"
            >
                <form onSubmit={handleSubmit} className="coupon-form">
                    <div className="form-group">
                        <label className="form-label">Coupon Code (Uppercase)</label>
                        <input
                            type="text"
                            name="code"
                            className="form-input"
                            value={formData.code}
                            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            placeholder="e.g. SAVE20"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Discount Type</label>
                            <select
                                name="discountType"
                                className="form-select"
                                value={formData.discountType}
                                onChange={handleInputChange}
                            >
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FIXED">Fixed Amount (₹)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Value</label>
                            <input
                                type="number"
                                name="discountAmount"
                                className="form-input"
                                value={formData.discountAmount}
                                onChange={handleInputChange}
                                required
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Min Order Amount (₹)</label>
                            <input
                                type="number"
                                name="minOrderAmount"
                                className="form-input"
                                value={formData.minOrderAmount}
                                onChange={handleInputChange}
                                min="0"
                            />
                        </div>
                        {formData.discountType === 'PERCENTAGE' && (
                            <div className="form-group">
                                <label className="form-label">Max Discount (₹)</label>
                                <input
                                    type="number"
                                    name="maxDiscountAmount"
                                    className="form-input"
                                    value={formData.maxDiscountAmount}
                                    onChange={handleInputChange}
                                    min="0"
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Expiry Date</label>
                            <input
                                type="date"
                                name="expiryDate"
                                className="form-input"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Member Usage Limit</label>
                            <input
                                type="number"
                                name="usageLimit"
                                className="form-input"
                                value={formData.usageLimit}
                                onChange={handleInputChange}
                                placeholder="e.g. 10 (0 for unlimited)"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="form-check-group">
                        <label className="form-check-label">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                            />
                            Active
                        </label>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Create Coupon
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminCoupons;
