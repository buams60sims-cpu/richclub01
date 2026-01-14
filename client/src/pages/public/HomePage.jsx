import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, CreditCard, Award, Package } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import ProductCard from '../../components/ProductCard';
import { getHomeContent, getAllProducts } from '../../services/apiService';
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

                // Load featured products
                if (contentResponse.data.featuredSection?.productIds?.length > 0) {
                    const productsResponse = await getAllProducts({ isActive: true });
                    console.log('All products:', productsResponse.data);
                    console.log('Featured IDs:', contentResponse.data.featuredSection.productIds);
                    
                    if (productsResponse.success) {
                        // Filter featured products
                        const featured = productsResponse.data.filter(p =>
                            contentResponse.data.featuredSection.productIds.includes(p._id)
                        ).slice(0, contentResponse.data.featuredSection.maxProducts || 10);
                        console.log('Featured products:', featured);
                        setFeaturedProducts(featured);
                    }
                }
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
            {homeContent?.featuredSection?.isActive && featuredProducts.length > 0 && (
                <section className="featured-section py-48">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-badge">{homeContent.featuredSection.badge}</span>
                            <h2 className="section-title">{homeContent.featuredSection.title}</h2>
                        </div>

                        <div className="products-grid">
                            {featuredProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Product Categories */}
            <section className="categories-section py-48">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Explore</span>
                        <h2 className="section-title">Shop All Products</h2>
                    </div>

                    <div className="section-cta" style={{ textAlign: 'center' }}>
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
                                    <Truck size={32} />
                                </div>
                                <h3 className="trust-title">Fast Delivery</h3>
                                <p className="trust-description">
                                    Quick and reliable shipping across India
                                </p>
                            </div>

                            <div className="trust-item">
                                <div className="trust-icon">
                                    <CreditCard size={32} />
                                </div>
                                <h3 className="trust-title">Secure Payment</h3>
                                <p className="trust-description">
                                    Safe and encrypted payment processing
                                </p>
                            </div>

                            <div className="trust-item">
                                <div className="trust-icon">
                                    <Award size={32} />
                                </div>
                                <h3 className="trust-title">Premium Quality</h3>
                                <p className="trust-description">
                                    Finest fabrics and craftsmanship guaranteed
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

                            {homeContent.customDesignSection.images?.length > 0 && (
                                <div className="custom-design-images">
                                    {homeContent.customDesignSection.images.slice(0, 3).map((img, idx) => (
                                        <div key={idx} className="custom-design-image">
                                            <img src={img} alt={`Custom design ${idx + 1}`} loading="lazy" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
};

export default HomePage;
