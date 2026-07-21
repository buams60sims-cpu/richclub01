import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';
import ProductCard from '../../components/ProductCard';
import { getAllProducts } from '../../services/apiService';
import { getCategoryName } from '../../utils/helpers';
import './ShopPage.css';

const CATEGORIES = [
    { value: 'all', label: 'All Products' },
    { value: 'normal-tshirts', label: 'Normal T-Shirts' },
    { value: 'oversize-tshirts', label: 'Oversize T-Shirts' },
    { value: 'collar-tshirts', label: 'Collar T-Shirts' },
    { value: 'hoodies', label: 'Hoodies' },
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'name-a-z', label: 'Name: A to Z' },
    { value: 'name-z-a', label: 'Name: Z to A' },
];

const ShopPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        loadProducts();
    }, [activeCategory]);

    useEffect(() => {
        const params = {};

        if (activeCategory !== 'all') {
            params.category = activeCategory;
        }

        if (searchQuery.trim()) {
            params.search = searchQuery.trim();
        }

        setSearchParams(params, { replace: true });
    }, [activeCategory, searchQuery, setSearchParams]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const params = { isActive: true };

            if (activeCategory !== 'all') {
                params.category = activeCategory;
            }

            const response = await getAllProducts(params);

            if (response.success) {
                setProducts(response.data || []);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setSearchQuery('');
    };

    const filteredProducts = useMemo(() => {
        const normalizedSearch = searchQuery.trim().toLowerCase();

        return products
            .filter((product) => {
                if (!normalizedSearch) return true;
                return (
                    product.name?.toLowerCase().includes(normalizedSearch) ||
                    product.category?.toLowerCase().includes(normalizedSearch) ||
                    product.description?.toLowerCase().includes(normalizedSearch)
                );
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'price-low-high':
                        return (a.price?.selling || a.price?.original || 0) - (b.price?.selling || b.price?.original || 0);
                    case 'price-high-low':
                        return (b.price?.selling || b.price?.original || 0) - (a.price?.selling || a.price?.original || 0);
                    case 'name-a-z':
                        return a.name.localeCompare(b.name);
                    case 'name-z-a':
                        return b.name.localeCompare(a.name);
                    case 'newest':
                    default:
                        const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
                        const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
                        return dateB - dateA;
                }
            });
    }, [products, searchQuery, sortBy]);

    return (
        <PublicLayout>
            <div className="shop-page-shell">
                <div className="shop-page-content container">
                    <section className="shop-page-header">
                        <p className="shop-page-label">Collection</p>
                        <h1 className="shop-page-title">Shop</h1>
                        <p className="shop-page-copy">
                            Curated premium fashion for a modern lifestyle.
                        </p>
                        <div className="shop-page-meta">
                            <span>{filteredProducts.length} products</span>
                            {activeCategory !== 'all' && (
                                <span className="shop-page-meta-divider">|</span>
                            )}
                            {activeCategory !== 'all' && (
                                <span>{getCategoryName(activeCategory)}</span>
                            )}
                        </div>
                    </section>

                    <section className="shop-page-filters">
                        <div className="category-chip-row" role="tablist" aria-label="Shop categories">
                            {CATEGORIES.map((category) => (
                                <button
                                    key={category.value}
                                    className={`category-chip ${activeCategory === category.value ? 'active' : ''}`}
                                    onClick={() => handleCategoryChange(category.value)}
                                    aria-pressed={activeCategory === category.value}
                                >
                                    {category.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="shop-results">
                        {loading ? (
                            <div className="results-loading">
                                <div className="shop-spinner"></div>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="products-grid">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={`${product._id}-${product.name}`} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state-panel">
                                <p className="empty-state-icon">✨</p>
                                <h2 className="empty-state-heading">No results found</h2>
                                <p className="empty-state-copy">
                                    Try a different keyword, reset filters, or browse the full collection.
                                </p>
                                <div className="empty-state-actions">
                                    <button type="button" className="btn btn-primary" onClick={() => {
                                        setSearchQuery('');
                                        setActiveCategory('all');
                                    }}>
                                        Reset search
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => {
                                        setActiveCategory('all');
                                        setSearchQuery('');
                                    }}>
                                        View All Products
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </PublicLayout>
    );
};

export default ShopPage;

