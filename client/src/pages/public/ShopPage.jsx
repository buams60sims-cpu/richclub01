import { useState, useEffect } from 'react';
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

const ShopPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
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

        if (category === 'all') {
            setSearchParams({});
        } else {
            setSearchParams({ category });
        }
    };

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
                    ) : products.length > 0 ? (
                        <>
                            <div className="products-count">
                                {products.length} {products.length === 1 ? 'Product' : 'Products'}
                            </div>
                            <div className="products-grid">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📦</div>
                            <h3 className="empty-state-title">No Products Found</h3>
                            <p className="empty-state-description">
                                {activeCategory === 'all'
                                    ? 'No products available at the moment. Check back soon!'
                                    : `No products found in ${getCategoryName(activeCategory)}. Try another category.`}
                            </p>
                            {activeCategory !== 'all' && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleCategoryChange('all')}
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
