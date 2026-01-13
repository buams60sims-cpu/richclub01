import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading, isAdmin } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.5rem',
                color: 'var(--gray-600)'
            }}>
                Loading...
            </div>
        );
    }

    if (!user || !isAdmin()) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
