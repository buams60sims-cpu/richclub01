import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { changePassword } from '../../services/apiService';
import './AdminChangePassword.css';

const AdminChangePassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('');

    const validatePasswordStrength = (password) => {
        if (password.length < 8) return 'weak';
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*]/.test(password);
        
        const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
        if (strength < 3) return 'medium';
        return 'strong';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'newPassword') {
            setPasswordStrength(validatePasswordStrength(value));
        }
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        if (!passwordRegex.test(formData.newPassword)) {
            setError('Password must contain uppercase, lowercase, and number');
            return;
        }

        try {
            setLoading(true);
            const response = await changePassword(formData.currentPassword, formData.newPassword);

            if (response.success) {
                alert('Password changed successfully. Please login again.');
                // clear auth token so user is effectively logged out
                localStorage.removeItem('token');
                // redirect to the public login page (not nested under /admin)
                navigate('/admin/login');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <AdminLayout>
            <div className="admin-change-password">
                <div className="password-container">
                    <div className="password-header">
                        <Lock size={32} />
                        <h1>Change Password</h1>
                        <p>Update your admin account password</p>
                    </div>

                    <form onSubmit={handleSubmit} className="password-form">
                        {error && <div className="error-message">{error}</div>}

                        <div className="form-group">
                            <label>Current Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => togglePasswordVisibility('current')}
                                >
                                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>New Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => togglePasswordVisibility('new')}
                                >
                                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {formData.newPassword && (
                                <div className={`password-strength ${passwordStrength}`}>
                                    Strength: {passwordStrength}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                >
                                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="password-requirements">
                            <p>Password must contain:</p>
                            <ul>
                                <li>At least 8 characters</li>
                                <li>One uppercase letter</li>
                                <li>One lowercase letter</li>
                                <li>One number</li>
                            </ul>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate('/admin/dashboard')}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminChangePassword;
