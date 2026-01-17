import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
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

const ShopPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(
        searchParams.get('category') || 'all'
    );

    useEffect(() => {
        loadProducts();
    }, [activeCategory]);

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
        setSearchQuery(''); // Clear search when changing category

        if (category === 'all') {
            setSearchParams({});
        } else {
            setSearchParams({ category });
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Filter products based on search query
    const filteredProducts = products.filter((product) => {
        if (!searchQuery.trim()) return true;
        return product.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <PublicLayout>
            <div className="shop-page">
                <div className="container py-48">
                    {/* Page Header */}
                    <div className="shop-header">
                        <h1>Shop</h1>
                        <p className="shop-subtitle">
                            Discover our curated collection of premium streetwear
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="shop-search-wrapper">
                        <div className="shop-search-container">
                            <Search className="shop-search-icon" size={20} />
                            <input
                                type="text"
                                className="shop-search-input"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                aria-label="Search products"
                            />
                            {searchQuery && (
                                <button
                                    className="shop-search-clear"
                                    onClick={() => setSearchQuery('')}
                                    aria-label="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="category-tabs">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.value}
                                className={`category-tab ${activeCategory === cat.value ? 'active' : ''}`}
                                onClick={() => handleCategoryChange(cat.value)}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <>
                            <div className="products-count">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                                {searchQuery && ` matching "${searchQuery}"`}
                            </div>
                            <div className="products-grid">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                {searchQuery ? '🔍' : '📦'}
                            </div>
                            <h3 className="empty-state-title">
                                {searchQuery ? 'No Products Found' : 'No Products Available'}
                            </h3>
                            <p className="empty-state-description">
                                {searchQuery
                                    ? `No products match "${searchQuery}". Try a different search term.`
                                    : activeCategory === 'all'
                                        ? 'No products available at the moment. Check back soon!'
                                        : `No products found in ${getCategoryName(activeCategory)}. Try another category.`}
                            </p>
                            {(searchQuery || activeCategory !== 'all') && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setSearchQuery('');
                                        handleCategoryChange('all');
                                    }}
                                >
                                    View All Products
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
};

export default ShopPage;

