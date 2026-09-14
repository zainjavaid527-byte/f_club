import { useEffect, useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
} from 'lucide-react';

import {
  getProducts,
  deleteProduct,
} from '../services/productService';

import type { Product } from '../types/product';

import ProductForm from '../components/products/ProductForm';

import '../style/common.css';
import '../style/Products.css';

function Products() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const loadProducts = async () => {
    try {
      const data = await getProducts();

      setProducts(data);
    } catch (error) {
      console.error(
        'Failed to load products:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        'Are you sure you want to delete this product?'
      )
    ) {
      return;
    }

    try {
      await deleteProduct(id);

      await loadProducts();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          'Failed to delete product'
      );
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="page">

      <div className="page-header">

        <div>
          <h1>Canteen Products</h1>

          <p>
            Manage food, drinks and other canteen items
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleAdd}
        >
          <Plus size={18} />
          Add Product
        </button>

      </div>

      <div className="search-box">

        <Search size={20} />

        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {loading ? null : filteredProducts.length === 0 ? (

        <div className="empty-state">

          <Package size={42} />

          <h3>No products found</h3>

          <p>
            Add your first canteen product.
          </p>

        </div>

      ) : (

        <div className="product-grid">

          {filteredProducts.map((product) => {

            const stock =
              product.stock ??
              product.quantity ??
              0;

            return (
              <div
                className="product-card"
                key={product.id}
              >

                <div className="product-icon">
                  <Package size={25} />
                </div>

                <div className="product-info">

                  <h3>{product.name}</h3>

                  <strong>
                    Rs.{' '}
                    {Number(
                      product.price
                    ).toFixed(0)}
                  </strong>

                  <span
                    className={
                      stock <= 5
                        ? 'low-stock'
                        : 'stock'
                    }
                  >
                    Stock: {stock}
                  </span>

                </div>

                <div className="product-actions">

                  <button
                    className="edit-button"
                    onClick={() =>
                      handleEdit(product)
                    }
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className="delete-button"
                    onClick={() =>
                      handleDelete(product.id)
                    }
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

              </div>
            );
          })}

        </div>
      )}

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSuccess={loadProducts}
        />
      )}

    </div>
  );
}

export default Products;