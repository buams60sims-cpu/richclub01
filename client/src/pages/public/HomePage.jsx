import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, CreditCard, Award, Package } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import ProductCard from '../../components/ProductCard';
import { getHomeContent } from '../../services/apiService';
import './HomePage.css';

const HomePage = () => {
    const [homeContent, setHomeContent] = useState(null);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        loadHomeContent();
    }, []);

    const loadHomeContent = async () => {
        try {
            setLoading(true);
            const contentResponse = await getHomeContent();

            if (contentResponse.success) {
                setHomeContent(contentResponse.data);
                console.log('Home content:', contentResponse.data);

                // Use the populated products from the backend directly
                // The backend populates 'productIds' with full product objects
                const populatedProducts = contentResponse.data.featuredSection?.productIds || [];

                // Ensure we only use valid objects (sanity check)
                const validProducts = populatedProducts.filter(p => p && p._id);

                console.log('Featured products (from CMS):', validProducts);
                setFeaturedProducts(validProducts);
            }
        } catch (error) {
            console.error('Failed to load home content:', error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-rotate hero slides
    useEffect(() => {
        if (!homeContent?.heroSlides?.length) return;

        const interval = setInterval(() => {
            setCurrentSlide(prev =>
                (prev + 1) % homeContent.heroSlides.filter(s => s.isActive).length
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [homeContent]);

    const [currentCustomSlide, setCurrentCustomSlide] = useState(0);
    // Dynamic Custom Design Images
    const customDesignImages = homeContent?.customDesignSection?.images || [];

    // Auto-rotate custom design slides
    useEffect(() => {
        if (customDesignImages.length === 0) return;

        const interval = setInterval(() => {
            setCurrentCustomSlide(prev => (prev + 1) % customDesignImages.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [customDesignImages]);

    if (loading) {
        return (
            <PublicLayout>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            </PublicLayout>
        );
    }

    const activeHeroSlides = homeContent?.heroSlides?.filter(s => s.isActive) || [];
    const activeLookbookItems = homeContent?.lookbookItems?.filter(i => i.isActive) || [];
    const currentHeroSlide = activeHeroSlides[currentSlide];

    // Helper to resolve image URL
    const getImageUrl = (img) => {
        if (!img) return '';
        if (img.startsWith('http')) return img;
        // Strip /api/v1 from base if present to get root domain
        const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '');
        // Ensure img starts with / if not present (backend usually stores /uploads/...)
        const path = img.startsWith('/') ? img : `/${img}`;
        return `${baseUrl}${path}`;
    };

    return (
        <PublicLayout>
            {/* Hero Banner */}
            {currentHeroSlide && (
                <section className="hero-banner">
                    <div
                        className="hero-image"
                        style={{ backgroundImage: `url(${currentHeroSlide.image})` }}
                    >
                        <div className="hero-overlay"></div>
                        <div className="container">
                            <div className={`hero-content hero-${currentHeroSlide.alignment}`}>
                                <span className="hero-badge">{currentHeroSlide.badge}</span>
                                <h1 className="hero-headline">{currentHeroSlide.headline}</h1>
                                <p className="hero-description">{currentHeroSlide.description}</p>
                                <Link to={currentHeroSlide.ctaLink} className="btn btn-gold btn-lg">
                                    {currentHeroSlide.ctaText}
                                    <ArrowRight size={20} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Slide Indicators */}
                    {activeHeroSlides.length > 1 && (
                        <div className="hero-indicators">
                            {activeHeroSlides.map((_, index) => (
                                <button
                                    key={index}
                                    className={`hero-indicator ${index === currentSlide ? 'active' : ''}`}
                                    onClick={() => setCurrentSlide(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Editor's Picks (Featured Products) */}
            {/* Top Products Showcase (Dynamic) */}
            <section className="categories-section py-48">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Explore</span>
                        <h2 className="section-title">
                            {homeContent?.featuredSection?.title || "Shop All Products"}
                        </h2>
                    </div>

                    <div className="products-grid">
                        {loading && (
                            <div className="col-span-full flex justify-center py-12">
                                <div className="loading-spinner"></div>
                            </div>
                        )}

                        {!loading && featuredProducts.length === 0 && (
                            <div className="col-span-full text-center text-gray-500 py-8">
                                No featured products selected in Admin Panel.
                            </div>
                        )}

                        {!loading && featuredProducts.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    <div className="section-cta" style={{ textAlign: 'center', marginTop: '32px' }}>
                        <Link to="/shop" className="btn btn-gold btn-lg">
                            View All Products
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Trust Section (USP) */}
            {homeContent?.uspSection?.isActive && (
                <section className="trust-section py-48">
                    <div className="container">
                        <div className="trust-grid">
                            <div className="trust-item">
                                <div className="trust-icon">
                                    <Truck size={28} />
                                </div>
                                <h3 className="trust-title">Fast Delivery</h3>
                                <p className="trust-description">
                                    3–5 days pan-India shipping
                                </p>
                            </div>

                            <div className="trust-item">
                                <div className="trust-icon">
                                    <CreditCard size={28} />
                                </div>
                                <h3 className="trust-title">Secure Payment</h3>
                                <p className="trust-description">
                                    Razorpay protected checkout
                                </p>
                            </div>

                            <div className="trust-item">
                                <div className="trust-icon">
                                    <Award size={28} />
                                </div>
                                <h3 className="trust-title">Premium Quality</h3>
                                <p className="trust-description">
                                    Hand-checked fabrics
                                </p>
                            </div>


                        </div>
                    </div>
                </section>
            )}

            {/* Custom Design Banner */}
            {homeContent?.customDesignSection?.isActive && (
                <section className="custom-design-section py-48">
                    <div className="container">
                        <div className="custom-design-content">
                            <div className="custom-design-text">
                                <span className="section-badge">{homeContent.customDesignSection.badge}</span>
                                <h2 className="section-title">{homeContent.customDesignSection.title}</h2>
                                <p className="custom-design-description">
                                    {homeContent.customDesignSection.description}
                                </p>
                                <a
                                    href={`https://wa.me/${homeContent.customDesignSection.whatsappNumber}?text=Hi, I'm interested in custom t-shirt designs`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary btn-lg"
                                >
                                    {homeContent.customDesignSection.ctaText}
                                    <ArrowRight size={20} />
                                </a>
                            </div>

                            <div className="custom-design-images">
                                <div className="custom-design-slider">
                                    {customDesignImages.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={getImageUrl(img)}
                                            alt="Custom design"
                                            className={idx === currentCustomSlide ? 'active' : ''}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
};

export default HomePage;
