import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { products as productsApi, homeContent as homeContentApi } from '../services/api';
import { fadeIn, revealChild, staggerContainer, pageTransition, heroTextVariants } from '../animations/variants';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ProductCard from '../components/ProductCard';
import EditorsPicks from '../components/EditorsPicks';
import CustomDesignBanner from '../components/CustomDesignBanner';
import Loader from '../components/ui/Loader';
import ErrorMessage from '../components/ui/ErrorMessage';
import './Home.css';
import '../components/EditorsPicks.css';

const Home = () => {
    // CMS Content State
    const [homeContent, setHomeContent] = useState(null);
    const [heroSlides, setHeroSlides] = useState([]);
    const [lookbookData, setLookbookData] = useState([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentLookbookSlide, setCurrentLookbookSlide] = useState(0);
    const [isPlayingLookbook, setIsPlayingLookbook] = useState(true);
    const [isTabVisible, setIsTabVisible] = useState(true);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        // Check for reduced motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const listener = (e) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', listener);

        // Visibility API to pause sliders
        const handleVisibilityChange = () => {
            setIsTabVisible(document.visibilityState === 'visible');
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        const fetchContent = async () => {
            try {
                setLoading(true);
                let content = null;

                // Fetch CMS content
                const contentResponse = await homeContentApi.get();
                if (contentResponse.success) {
                    content = contentResponse.data;
                    setHomeContent(content);
                    setHeroSlides(content.heroSlides || []);
                    setLookbookData(content.lookbookItems || []);
                }
            } catch (err) {
                console.error('Failed to load content:', err);
                setError("Failed to load page content. Please ensure backend is running.");
            } finally {
                setLoading(false);
            }
        };

        fetchContent();

        return () => {
            mediaQuery.removeEventListener('change', listener);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);


    // Global Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') {
                if (heroSlides.length > 0) setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
                if (lookbookData.length > 0) setCurrentLookbookSlide((prev) => (prev + 1) % lookbookData.length);
            } else if (e.key === 'ArrowLeft') {
                if (heroSlides.length > 0) setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
                if (lookbookData.length > 0) setCurrentLookbookSlide((prev) => (prev - 1 + lookbookData.length) % lookbookData.length);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Hero Auto-slide logic
    useEffect(() => {
        if (!isPlaying || !isTabVisible || prefersReducedMotion || heroSlides.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 7000);
        return () => clearInterval(interval);
    }, [isPlaying, isTabVisible, prefersReducedMotion, heroSlides.length]);

    // Lookbook Auto-slide logic
    useEffect(() => {
        if (!isPlayingLookbook || !isTabVisible || prefersReducedMotion || lookbookData.length === 0) return;
        const interval = setInterval(() => {
            setCurrentLookbookSlide((prev) => (prev + 1) % lookbookData.length);
        }, 8000); // 8 seconds for deeper storytelling
        return () => clearInterval(interval);
    }, [isPlayingLookbook, isTabVisible, prefersReducedMotion, lookbookData.length]);

    const slideVariants = {
        initial: { opacity: 0, scale: 1.05 },
        animate: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.8 } }
    };

    const lookbookVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.8 } }
    };

    return (
        <motion.div
            className="home-page"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageTransition}
        >
            {/* Hero Section Slider */}
            <section
                className="hero-section slider"
                onMouseEnter={() => setIsPlaying(false)}
                onMouseLeave={() => setIsPlaying(true)}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        className="hero-slide"
                        variants={slideVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragStart={() => setIsPlaying(false)}
                        onDragEnd={(_, info) => {
                            setIsPlaying(true);
                            const swipe = info.offset.x;
                            if (swipe < -50) {
                                if (heroSlides.length > 0) setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
                            } else if (swipe > 50) {
                                if (heroSlides.length > 0) setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
                            }
                        }}
                        style={{
                            backgroundImage: `url(${heroSlides[currentSlide]?.image || 'https://via.placeholder.com/1920x1080?text=Rich+Club+Luxury'})`,
                            backgroundColor: '#111'
                        }}
                    >
                        {heroSlides.length > 0 && (
                            <div className={`hero-wrapper hero-wrapper--${heroSlides[currentSlide].alignment || 'left'}`}>
                                <div className="hero-content">
                                    <motion.span
                                        className="hero-badge"
                                        custom={0}
                                        variants={heroTextVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {heroSlides[currentSlide].badge}
                                    </motion.span>
                                    <motion.h1
                                        className="serif hero-title"
                                        custom={1}
                                        variants={heroTextVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {heroSlides[currentSlide].headline}
                                    </motion.h1>
                                    <motion.p
                                        className="hero-description"
                                        custom={2}
                                        variants={heroTextVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {heroSlides[currentSlide].description}
                                    </motion.p>
                                    <motion.div
                                        className="hero-actions"
                                        custom={3}
                                        variants={heroTextVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <Link to={heroSlides[currentSlide].ctaLink}>
                                            <Button variant="secondary" size="lg">{heroSlides[currentSlide].ctaText}</Button>
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        )}
                        <div className="hero-overlay"></div>
                    </motion.div>
                </AnimatePresence>

                {/* Slider Indicators (Dots) */}
                <div className="slider-dots">
                    {heroSlides.map((_, idx) => (
                        <button
                            key={idx}
                            className={`dot ${currentSlide === idx ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(idx)}
                        />
                    ))}
                </div>
            </section>

            {/* Lookbook Slider Section */}
            <section
                className="lookbook-section"
                onMouseEnter={() => setIsPlayingLookbook(false)}
                onMouseLeave={() => setIsPlayingLookbook(true)}
            >
                <div className="container">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentLookbookSlide}
                            className="lookbook-grid"
                            variants={lookbookVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragStart={() => setIsPlayingLookbook(false)}
                            onDragEnd={(_, info) => {
                                setIsPlayingLookbook(true);
                                const swipe = info.offset.x;
                                if (swipe < -50) {
                                    if (lookbookData.length > 0) setCurrentLookbookSlide((prev) => (prev + 1) % lookbookData.length);
                                } else if (swipe > 50) {
                                    if (lookbookData.length > 0) setCurrentLookbookSlide((prev) => (prev - 1 + lookbookData.length) % lookbookData.length);
                                }
                            }}
                        >
                            {lookbookData.length > 0 && lookbookData[currentLookbookSlide] && (
                                <>
                                    <div className="lookbook-image-wrapper">
                                        <img
                                            src={lookbookData[currentLookbookSlide].image || 'https://via.placeholder.com/1200x1500?text=Rich+Club+Lookbook'}
                                            alt={lookbookData[currentLookbookSlide].title}
                                            className="lookbook-image"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="lookbook-content">
                                        <motion.span
                                            className="text-gold uppercase tracking-widest text-xs font-bold mb-4 block"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            Collection Edit
                                        </motion.span>
                                        <motion.h2
                                            className="serif lookbook-title"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            {lookbookData[currentLookbookSlide].title}
                                        </motion.h2>
                                        <motion.p
                                            className="lookbook-desc"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            {lookbookData[currentLookbookSlide].description}
                                        </motion.p>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            <Link to={lookbookData[currentLookbookSlide].link}>
                                                <Button variant="outline">View Collection</Button>
                                            </Link>
                                        </motion.div>

                                        <div className="lookbook-nav-info">
                                            <span className="current-num">0{currentLookbookSlide + 1}</span>
                                            <span className="nav-divider"></span>
                                            <span className="total-num">0{lookbookData.length}</span>
                                        </div>
                                    </div>
                                </>
                            )
                            }
                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>

            {/* Editor's Picks Section */}
            <EditorsPicks />

            {/* Trust Badges / USP */}
            <motion.section 
                className="trust-section dark"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
            >
                <motion.div variants={revealChild} className="trust-card">
                    <span className="icon">🚚</span>
                    <div>
                        <h4>Pan India Delivery</h4>
                        <p>Express shipping across India within 3–5 days</p>
                    </div>
                </motion.div>

                <motion.div variants={revealChild} className="trust-card">
                    <span className="icon">🛡️</span>
                    <div>
                        <h4>Secure Payments</h4>
                        <p>Industry-standard encryption for safe transactions</p>
                    </div>
                </motion.div>

                <motion.div variants={revealChild} className="trust-card">
                    <span className="icon">🧵</span>
                    <div>
                        <h4>Premium Quality Materials</h4>
                        <p>High-grade fabrics designed for durability and comfort</p>
                    </div>
                </motion.div>
            </motion.section>

            {/* Custom Design Banner Section */}
            {homeContent?.customDesignSection && (
                <CustomDesignBanner
                    data={homeContent.customDesignSection}
                    key={homeContent.customDesignSection.images?.join(',') || 'custom-design'}
                />
            )}

        </motion.div >
    );
};

export default Home;
