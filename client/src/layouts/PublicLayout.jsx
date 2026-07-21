import Header from '../components/Header.jsx';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';

const PublicLayout = ({ children }) => {
    return (
        <div className="public-layout">
            <Header />
            <main className="main-content">
                {children}
            </main>
            <Footer />
            <MobileBottomNav />
        </div>
    );
};

export default PublicLayout;
