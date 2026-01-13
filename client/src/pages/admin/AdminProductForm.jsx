import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Save, Plus } from 'lucide-react';
import { createProduct, getProductById, updateProduct } from '../../services/apiService';
import './AdminProducts.css';

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
            // Clean up object URL to avoid memory leaks
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

            // Use FormData for file upload
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('category', formData.category);
            data.append('isActive', formData.isActive);
            data.append('isOnSale', formData.isOnSale);
            data.append('price', JSON.stringify(formData.price));
            data.append('sizes', JSON.stringify(formData.sizes));

            // Append Images
            imageList.forEach(img => {
                if (img.type === 'file') {
                    data.append('images', img.file);
                } else {
                    data.append('existingImages', img.url);
                }
            });

            if (isEditMode) {
                await updateProduct(id, data); // API service needs to handle FormData
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

    if (loading && isEditMode && !formData.name) return <div className="p-8">Loading...</div>;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="icon-btn" onClick={() => navigate('/admin/products')}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="admin-title">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="form-container">
                {/* Left Column: Main Info */}
                <div className="form-left">
                    <div className="form-section">
                        <h3 className="section-title">Basic Information</h3>
                        <div className="form-group">
                            <label className="form-label">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                className="form-textarea"
                                rows="5"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">Images (Max 8)</h3>
                        <div className="image-action-bar" style={{ marginBottom: '1rem' }}>
                            <label className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <Upload size={16} />
                                <span>Select Images from Computer</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>

                        <div className="image-upload-grid">
                            {imageList.map((img, index) => (
                                <div key={index} className="image-upload-box" style={{ border: 'none' }}>
                                    <img src={img.url} alt={`Preview ${index}`} className="upload-preview" />
                                    <button
                                        type="button"
                                        className="remove-image-btn"
                                        onClick={() => handleImageRemove(index)}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}

                            {imageList.length < 8 && (
                                <label className="image-upload-box" style={{ cursor: 'pointer' }}>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                    />
                                    <div className="upload-placeholder">
                                        <Plus size={24} />
                                        <span>Add</span>
                                    </div>
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">Inventory & Stock</h3>
                        <div className="stock-grid">
                            {SIZES.map(size => (
                                <div key={size} className="stock-item">
                                    <label>{size}</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.sizes[size]}
                                        onChange={(e) => handleStockChange(size, e.target.value)}
                                        min="0"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings */}
                <div className="form-right">
                    <div className="form-section">
                        <h3 className="section-title">Pricing</h3>
                        <div className="form-group">
                            <label className="form-label">Original Price (₹)</label>
                            <input
                                type="number"
                                name="price.original"
                                className="form-input"
                                value={formData.price.original}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Selling Price (₹)</label>
                            <input
                                type="number"
                                name="price.selling"
                                className="form-input"
                                value={formData.price.selling}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">Organization</h3>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select
                                name="category"
                                className="form-select"
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

                        <div className="form-check-group" style={{ marginTop: '1rem' }}>
                            <label className="form-check-label">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />
                                Active (Visible in shop)
                            </label>
                        </div>

                        <div className="form-check-group">
                            <label className="form-check-label">
                                <input
                                    type="checkbox"
                                    name="isOnSale"
                                    checked={formData.isOnSale}
                                    onChange={handleChange}
                                />
                                On Sale Badge
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        <Save size={20} />
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProductForm;
