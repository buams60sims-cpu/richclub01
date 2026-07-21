import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Upload,
    X,
    Save,
    Plus,
    Package,
    Image as ImageIcon,
    Tag,
    Layers,
    SlidersHorizontal,
    Check
} from 'lucide-react';
import { createProduct, getProductById, updateProduct } from '../../services/apiService';
import { calculateDiscountPercent } from '../../utils/helpers';
import './AdminProductForm.css';

const CATEGORIES = [
    { value: 'normal-tshirts', label: 'Normal T-Shirts' },
    { value: 'oversize-tshirts', label: 'Oversize T-Shirts' },
    { value: 'collar-tshirts', label: 'Collar T-Shirts' },
    { value: 'hoodies', label: 'Hoodies' },
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const AdminProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: { original: '', selling: '' },
        sizes: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
        isActive: true,
        isOnSale: false
    });

    // Image State
    // Array of { type: 'url' | 'file', url: string, file?: File }
    const [imageList, setImageList] = useState([]);

    // Load product if edit mode
    useEffect(() => {
        if (isEditMode) {
            loadProduct();
        }
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const response = await getProductById(id);
            if (response.success) {
                const product = response.data;
                setFormData({
                    name: product.name,
                    description: product.description,
                    category: product.category,
                    price: product.price,
                    sizes: product.sizes,
                    isActive: product.isActive,
                    isOnSale: product.isOnSale
                });

                // Load existing images
                if (product.images && product.images.length > 0) {
                    setImageList(product.images.map(url => ({
                        type: 'url',
                        url: url
                    })));
                }
            }
        } catch (error) {
            alert('Failed to load product');
            navigate('/admin/products');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'number' ? Number(value) : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleStockChange = (size, value) => {
        const val = Math.max(0, Number(value));
        setFormData(prev => ({
            ...prev,
            sizes: {
                ...prev.sizes,
                [size]: val
            }
        }));
    };

    // Handle File Select
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (imageList.length + files.length > 8) {
            alert('Max 8 images allowed');
            return;
        }

        const newImages = files.map(file => ({
            type: 'file',
            file: file,
            url: URL.createObjectURL(file)
        }));

        setImageList(prev => [...prev, ...newImages]);
    };

    const handleImageRemove = (index) => {
        setImageList(prev => {
            const newList = [...prev];
            const removed = newList[index];
            if (removed.type === 'file') {
                URL.revokeObjectURL(removed.url);
            }
            newList.splice(index, 1);
            return newList;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('category', formData.category);
            data.append('isActive', formData.isActive);
            data.append('isOnSale', formData.isOnSale);
            data.append('price', JSON.stringify(formData.price));
            data.append('sizes', JSON.stringify(formData.sizes));

            imageList.forEach(img => {
                if (img.type === 'file') {
                    data.append('images', img.file);
                } else {
                    data.append('existingImages', img.url);
                }
            });

            if (isEditMode) {
                await updateProduct(id, data);
                alert('Product updated successfully');
            } else {
                await createProduct(data);
                alert('Product created successfully');
            }
            navigate('/admin/products');
        } catch (error) {
            alert(error.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const totalStock = Object.values(formData.sizes || {}).reduce((sum, val) => sum + Number(val || 0), 0);
    const discountPercent = calculateDiscountPercent(formData.price?.original, formData.price?.selling);

    if (loading && isEditMode && !formData.name) return <div className="p-8">Loading product details...</div>;

    return (
        <div className="admin-product-form-page">
            {/* Header Bar */}
            <div className="form-header-bar">
                <div className="header-left">
                    <button type="button" className="back-icon-btn" onClick={() => navigate('/admin/products')} title="Back to Products">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="form-page-title">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
                        <p className="form-page-subtitle">
                            {isEditMode ? `Updating ${formData.name || 'product'}` : 'Create a new catalog item'}
                        </p>
                    </div>
                </div>

                <div className="header-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/products')}>
                        Cancel
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                        <Save size={18} />
                        <span>{loading ? 'Saving...' : 'Save Product'}</span>
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="product-form-grid">
                {/* Left Column: Core Product Info */}
                <div className="form-column-left">
                    {/* Basic Info Card */}
                    <div className="form-card">
                        <div className="card-header-title">
                            <div className="title-with-icon">
                                <Package size={20} className="card-icon" />
                                <h3>Basic Information</h3>
                            </div>
                        </div>

                        <div className="form-field-group">
                            <label className="form-field-label">Product Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-field-input"
                                placeholder="e.g. TOXIC HOODIE (1) BLCK"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field-group">
                            <label className="form-field-label">Description</label>
                            <textarea
                                name="description"
                                className="form-field-textarea"
                                rows="5"
                                placeholder="Describe product material, fit, features, and care instructions..."
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Media Gallery Card */}
                    <div className="form-card">
                        <div className="card-header-title">
                            <div className="title-with-icon">
                                <ImageIcon size={20} className="card-icon" />
                                <h3>Product Media Gallery (Max 8)</h3>
                            </div>
                        </div>

                        <label className="upload-dropzone">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                            <Upload size={32} className="dropzone-icon" />
                            <span className="dropzone-text">Click or drag images here to upload</span>
                            <span className="dropzone-subtext">PNG, JPG, WEBP up to 10MB each</span>
                        </label>

                        {imageList.length > 0 && (
                            <div className="media-preview-grid">
                                {imageList.map((img, index) => (
                                    <div key={index} className="media-preview-box">
                                        <img src={img.url} alt={`Preview ${index}`} className="preview-img" />
                                        {index === 0 && <span className="main-image-badge">Main</span>}
                                        <button
                                            type="button"
                                            className="btn-remove-media"
                                            onClick={() => handleImageRemove(index)}
                                            title="Remove image"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}

                                {imageList.length < 8 && (
                                    <label className="media-add-more-box">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            style={{ display: 'none' }}
                                        />
                                        <Plus size={20} />
                                        <span>Add Image</span>
                                    </label>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Inventory & Sizes Card */}
                    <div className="form-card">
                        <div className="card-header-title">
                            <div className="title-with-icon">
                                <Layers size={20} className="card-icon" />
                                <h3>Inventory & Stock Levels</h3>
                            </div>
                            <span className="total-stock-badge">Total Stock: {totalStock} units</span>
                        </div>

                        <div className="stock-inputs-grid">
                            {SIZES.map(size => (
                                <div key={size} className="stock-input-item">
                                    <span className="stock-size-label">{size}</span>
                                    <input
                                        type="number"
                                        className="form-field-input stock-number-input"
                                        value={formData.sizes[size]}
                                        onChange={(e) => handleStockChange(size, e.target.value)}
                                        min="0"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Pricing & Organization Sidebar */}
                <div className="form-column-right">
                    {/* Pricing Card */}
                    <div className="form-card">
                        <div className="card-header-title">
                            <div className="title-with-icon">
                                <Tag size={20} className="card-icon" />
                                <h3>Pricing</h3>
                            </div>
                            {discountPercent > 0 && (
                                <span className="discount-calc-pill">-{discountPercent}% OFF</span>
                            )}
                        </div>

                        <div className="price-fields-grid">
                            <div className="form-field-group">
                                <label className="form-field-label">MRP Price (₹)</label>
                                <input
                                    type="number"
                                    name="price.original"
                                    className="form-field-input"
                                    placeholder="999"
                                    value={formData.price.original}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                />
                            </div>
                            <div className="form-field-group">
                                <label className="form-field-label">Selling Price (₹)</label>
                                <input
                                    type="number"
                                    name="price.selling"
                                    className="form-field-input"
                                    placeholder="590"
                                    value={formData.price.selling}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Organization & Visibility Card */}
                    <div className="form-card">
                        <div className="card-header-title">
                            <div className="title-with-icon">
                                <SlidersHorizontal size={20} className="card-icon" />
                                <h3>Organization</h3>
                            </div>
                        </div>

                        <div className="form-field-group">
                            <label className="form-field-label">Category *</label>
                            <select
                                name="category"
                                className="form-field-select"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Category</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <label className="toggle-switch-field">
                            <div className="toggle-label-text">
                                <span className="toggle-title">Active Listing</span>
                                <span className="toggle-subtitle">Visible in public storefront</span>
                            </div>
                            <input
                                type="checkbox"
                                name="isActive"
                                className="switch-checkbox"
                                checked={formData.isActive}
                                onChange={handleChange}
                            />
                        </label>

                        <label className="toggle-switch-field">
                            <div className="toggle-label-text">
                                <span className="toggle-title">On Sale Badge</span>
                                <span className="toggle-subtitle">Highlight with sale badge</span>
                            </div>
                            <input
                                type="checkbox"
                                name="isOnSale"
                                className="switch-checkbox"
                                checked={formData.isOnSale}
                                onChange={handleChange}
                            />
                        </label>
                    </div>

                    {/* Actions Box */}
                    <div className="form-card">
                        <button type="submit" className="btn btn-primary btn-full-width" disabled={loading}>
                            <Save size={20} />
                            <span>{loading ? 'Saving Changes...' : isEditMode ? 'Update Product' : 'Publish Product'}</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminProductForm;
