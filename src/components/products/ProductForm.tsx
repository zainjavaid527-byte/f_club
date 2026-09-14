import { useEffect, useState } from 'react';
import { X, PackagePlus } from 'lucide-react';

import {
  createProduct,
  updateProduct,
} from '../../services/productService';

import type { Product } from '../../types/product';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

function ProductForm({
  product,
  onClose,
  onSuccess,
}: ProductFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(product);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(String(product.price));
      setStock(
        String(product.stock ?? product.quantity ?? 0)
      );
    } else {
      setName('');
      setPrice('');
      setStock('');
    }
  }, [product]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Product name is required');
      return;
    }

    const productPrice = Number(price);
    const productStock = Number(stock || 0);

    if (productPrice <= 0) {
      setError('Enter a valid price');
      return;
    }

    if (productStock < 0) {
      setError('Stock cannot be negative');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = {
        name: name.trim(),
        price: productPrice,
        stock: productStock,
      };

      if (product) {
        await updateProduct(product.id, data);
      } else {
        await createProduct(data);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to save product'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">

        <div className="modal-header">
          <div>
            <h2>
              {isEdit
                ? 'Edit Product'
                : 'Add Canteen Product'}
            </h2>

            <p>
              {isEdit
                ? 'Update product information'
                : 'Add a product for canteen sales'}
            </p>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Product Name</label>

            <input
              type="text"
              placeholder="e.g. Coke"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Price</label>

            <input
              type="number"
              min="1"
              placeholder="e.g. 100"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Stock</label>

            <input
              type="number"
              min="0"
              placeholder="e.g. 50"
              value={stock}
              onChange={(e) =>
                setStock(e.target.value)
              }
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="modal-actions">

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <PackagePlus size={18} />

              {loading
                ? 'Saving...'
                : isEdit
                ? 'Update Product'
                : 'Add Product'}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default ProductForm;