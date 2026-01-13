import { useState, useEffect } from 'react';
import { Save, AlertCircle, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { getHomeContent, updateHomeContent, getAllProducts } from '../../services/apiService';
import './AdminHomeContent.css';

const AdminHomeContent = () => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('hero');
    const [products, setProducts] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [contentRes, productsRes] = await Promise.all([
                getHomeContent(),
                getAllProducts({})
            ]);

            if (contentRes.success) {
                setContent(contentRes.data);
            }
            if (productsRes.success) {
                setProducts(productsRes.data);
            }
        } catch (error) {
            console.error('Failed to load CMS data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateHomeContent(content);
            alert('Content updated successfully!');
        } catch (error) {
            alert('Failed to update content');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (section, field, value) => {
        setContent(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    /* ==================== HERO SLIDES HANDLERS ==================== */
    const handleSlideChange = (index, field, value) => {
        setContent(prev => {
            const newSlides = [...prev.heroSlides];
            newSlides[index] = { ...newSlides[index], [field]: value };
            return { ...prev, heroSlides: newSlides };
        });
    };

    const addSlide = () => {
        setContent(prev => ({
            ...prev,
            heroSlides: [
                ...prev.heroSlides,
                {
                    image: '',
                    badge: 'New Arrival',
                    headline: 'New Collection',
                    description: 'Discover our latest premium styles.',
                    ctaText: 'Shop Now',
                    ctaLink: '/shop',
                    alignment: 'left',
                    isActive: true
                }
            ]
        }));
    };

    const removeSlide = (index) => {
        if (content.heroSlides.length <= 1) {
            alert('Must have at least one slide');
            return;
        }
        setContent(prev => ({
            ...prev,
            heroSlides: prev.heroSlides.filter((_, i) => i !== index)
        }));
    };

    const moveSlide = (index, direction) => {
        if (
            (direction === -1 && index === 0) ||
            (direction === 1 && index === content.heroSlides.length - 1)
        ) return;

        const newSlides = [...content.heroSlides];
        const temp = newSlides[index];
        newSlides[index] = newSlides[index + direction];
        newSlides[index + direction] = temp;

        setContent(prev => ({ ...prev, heroSlides: newSlides }));
    };

    /* ==================== FEATURED PRODUCTS HANDLERS ==================== */
    const handleFeaturedProductToggle = (productId) => {
        setContent(prev => {
            const currentIds = prev.featuredSection.productIds || [];
            let newIds;
            if (currentIds.includes(productId)) {
                newIds = currentIds.filter(id => id !== productId);
            } else {
                newIds = [...currentIds, productId];
            }
            return {
                ...prev,
                featuredSection: {
                    ...prev.featuredSection,
                    productIds: newIds
                }
            };
        });
    };

    /* ==================== CUSTOM DESIGN IMAGES HANDLERS ==================== */
    const handleCustomImageChange = (index, value) => {
        setContent(prev => {
            const newImages = [...prev.customDesignSection.images];
            newImages[index] = value;
            return {
                ...prev,
                customDesignSection: {
                    ...prev.customDesignSection,
                    images: newImages
                }
            };
        });
    };

    if (loading) return <div className="loading-spinner"></div>;

    return (
        <div className="admin-page admin-cms-page">
            <div className="admin-header sticky-header">
                <h1 className="admin-title">Home Page Content</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    <Save size={20} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="cms-tabs">
                <button
                    className={`cms-tab ${activeTab === 'hero' ? 'active' : ''}`}
                    onClick={() => setActiveTab('hero')}
                >
                    Hero Banner
                </button>
                <button
                    className={`cms-tab ${activeTab === 'featured' ? 'active' : ''}`}
                    onClick={() => setActiveTab('featured')}
                >
                    Featured Products
                </button>
                <button
                    className={`cms-tab ${activeTab === 'custom' ? 'active' : ''}`}
                    onClick={() => setActiveTab('custom')}
                >
                    Custom Design
                </button>
                <button
                    className={`cms-tab ${activeTab === 'usp' ? 'active' : ''}`}
                    onClick={() => setActiveTab('usp')}
                >
                    Trust Badges
                </button>
            </div>

            <div className="cms-content">
                {/* HERO SECTION */}
                {activeTab === 'hero' && (
                    <div className="cms-section">
                        <div className="section-header-row">
                            <h3>Hero Slides ({content.heroSlides.length})</h3>
                            <button className="btn btn-secondary btn-sm" onClick={addSlide}>
                                <Plus size={16} /> Add Slide
                            </button>
                        </div>

                        <div className="slides-list">
                            {content.heroSlides.map((slide, index) => (
                                <div key={index} className="slide-card">
                                    <div className="slide-header">
                                        <span className="slide-number">Slide {index + 1}</span>
                                        <div className="slide-actions">
                                            <button
                                                className="icon-btn"
                                                onClick={() => moveSlide(index, -1)}
                                                disabled={index === 0}
                                            >
                                                <ArrowUp size={16} />
                                            </button>
                                            <button
                                                className="icon-btn"
                                                onClick={() => moveSlide(index, 1)}
                                                disabled={index === content.heroSlides.length - 1}
                                            >
                                                <ArrowDown size={16} />
                                            </button>
                                            <button
                                                className="icon-btn btn-danger"
                                                onClick={() => removeSlide(index)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="slide-form">
                                        <div className="form-group">
                                            <label>Image URL</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={slide.image}
                                                onChange={(e) => handleSlideChange(index, 'image', e.target.value)}
                                            />
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Badge Text</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={slide.badge}
                                                    onChange={(e) => handleSlideChange(index, 'badge', e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Headline</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={slide.headline}
                                                    onChange={(e) => handleSlideChange(index, 'headline', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea
                                                className="form-textarea"
                                                value={slide.description}
                                                onChange={(e) => handleSlideChange(index, 'description', e.target.value)}
                                            />
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>CTA Text</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={slide.ctaText}
                                                    onChange={(e) => handleSlideChange(index, 'ctaText', e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>CTA Link</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={slide.ctaLink}
                                                    onChange={(e) => handleSlideChange(index, 'ctaLink', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Alignment</label>
                                                <select
                                                    className="form-select"
                                                    value={slide.alignment}
                                                    onChange={(e) => handleSlideChange(index, 'alignment', e.target.value)}
                                                >
                                                    <option value="left">Left</option>
                                                    <option value="center">Center</option>
                                                    <option value="right">Right</option>
                                                </select>
                                            </div>
                                            <div className="form-check-group" style={{ marginTop: '2rem' }}>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={slide.isActive}
                                                        onChange={(e) => handleSlideChange(index, 'isActive', e.target.checked)}
                                                    /> Active
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* FEATURED PRODUCTS */}
                {activeTab === 'featured' && (
                    <div className="cms-section">
                        <div className="form-check-group mb-4">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={content.featuredSection.isActive}
                                    onChange={(e) => handleChange('featuredSection', 'isActive', e.target.checked)}
                                /> Enable Featured Section
                            </label>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Section Badge</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={content.featuredSection.badge}
                                    onChange={(e) => handleChange('featuredSection', 'badge', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Section Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={content.featuredSection.title}
                                    onChange={(e) => handleChange('featuredSection', 'title', e.target.value)}
                                />
                            </div>
                        </div>

                        <h4 className="mt-4 mb-2">Select Products to Feature</h4>
                        <div className="product-selector-grid">
                            {products.map(product => (
                                <div
                                    key={product._id}
                                    className={`product-selector-card ${content.featuredSection.productIds.includes(product._id) ? 'selected' : ''}`}
                                    onClick={() => handleFeaturedProductToggle(product._id)}
                                >
                                    <img src={product.images[0]} alt={product.name} />
                                    <div className="p-2">
                                        <p className="font-bold text-sm truncate">{product.name}</p>
                                        {content.featuredSection.productIds.includes(product._id) && (
                                            <div className="selected-badge">Featured</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CUSTOM DESIGN */}
                {activeTab === 'custom' && (
                    <div className="cms-section">
                        <div className="form-check-group mb-4">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={content.customDesignSection.isActive}
                                    onChange={(e) => handleChange('customDesignSection', 'isActive', e.target.checked)}
                                /> Enable Custom Design Section
                            </label>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Badge</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={content.customDesignSection.badge}
                                    onChange={(e) => handleChange('customDesignSection', 'badge', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={content.customDesignSection.title}
                                    onChange={(e) => handleChange('customDesignSection', 'title', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                className="form-textarea"
                                value={content.customDesignSection.description}
                                onChange={(e) => handleChange('customDesignSection', 'description', e.target.value)}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>CTA Text</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={content.customDesignSection.ctaText}
                                    onChange={(e) => handleChange('customDesignSection', 'ctaText', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>WhatsApp Number</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={content.customDesignSection.whatsappNumber}
                                    onChange={(e) => handleChange('customDesignSection', 'whatsappNumber', e.target.value)}
                                />
                            </div>
                        </div>

                        <h4 className="mt-4 mb-2">Display Images (3 needed)</h4>
                        <div className="image-inputs">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="form-group">
                                    <label>Image {i + 1} URL</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={content.customDesignSection.images[i] || ''}
                                        onChange={(e) => handleCustomImageChange(i, e.target.value)}
                                    />
                                    {content.customDesignSection.images[i] && (
                                        <img
                                            src={content.customDesignSection.images[i]}
                                            alt="Preview"
                                            className="mt-2 h-24 object-cover rounded"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* USP / TRUST */}
                {activeTab === 'usp' && (
                    <div className="cms-section">
                        <div className="form-check-group mb-4">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={content.uspSection.isActive}
                                    onChange={(e) => handleChange('uspSection', 'isActive', e.target.checked)}
                                /> Enable Trust Badges Section
                            </label>
                        </div>

                        <div className="alert-box">
                            <AlertCircle size={20} />
                            <p>Trust badges configuration is currently static in code. You can only enable/disable the section here.</p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminHomeContent;
