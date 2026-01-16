import Header from '../components/Header.jsx';
import Footer from '../components/Footer';

const PublicLayout = ({ children }) => {
    return (
        <div className="public-layout">
            <Header />
            <main className="main-content">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
