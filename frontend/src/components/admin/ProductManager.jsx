import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import ProductImage from '../product/ProductImage.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { Alert, Button, ErrorState, Skeleton } from '../ui/index.js';
import ProductForm from './ProductForm.jsx';
import StockAdjustDialog from './StockAdjustDialog.jsx';
import { useCategories } from '../../hooks/useProducts.js';
import {
  useCreateProduct,
  useDeleteProduct,
  useProduct,
  useProducts,
  useUpdateProduct,
} from '../../hooks/useProducts.js';
import { formatPrice } from '../../utils/format.js';

const PAGE_SIZE = 12;

/** Lists catalogue products and manages their full and stock-only edits. */
export default function ProductManager() {
  const [page, setPage] = useState(0);
  const [addingProduct, setAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [stockProductId, setStockProductId] = useState(null);
  const [actionError, setActionError] = useState('');
  const productsQuery = useProducts({ page, size: PAGE_SIZE });
  const categoriesQuery = useCategories();
  const editProductQuery = useProduct(editingProductId);
  const stockProductQuery = useProduct(stockProductId);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const products = productsQuery.data?.content;
  const categories = categoriesQuery.data;
  const editProduct = editProductQuery.data;
  const stockProduct = stockProductQuery.data;

  async function saveProduct(values) {
    if (editingProductId) {
      await updateMutation.mutateAsync({
        productId: editingProductId,
        product: values,
      });
      setEditingProductId(null);
      toast.success('Product updated');
    } else {
      await createMutation.mutateAsync(values);
      setAddingProduct(false);
      toast.success('Product added');
    }
  }

  async function deleteProduct() {
    setActionError('');
    try {
      await deleteMutation.mutateAsync(deletingProduct.id);
      setDeletingProduct(null);
      toast.success('Product deleted');
    } catch (error) {
      setActionError(
        error?.message ?? 'Unable to delete this product. Try again.',
      );
    }
  }

  async function saveStock(stockQuantity) {
    await updateMutation.mutateAsync({
      productId: stockProduct.id,
      product: {
        name: stockProduct.name,
        description: stockProduct.description,
        price: stockProduct.price,
        stockQuantity,
        categoryId: stockProduct.categoryId,
        imageUrl: stockProduct.imageUrl ?? '',
      },
    });
    toast.success('Stock updated');
  }

  function beginAdd() {
    setActionError('');
    setAddingProduct(true);
    setEditingProductId(null);
  }

  return (
    <section className="admin-manager" aria-labelledby="admin-products-heading">
      <div className="admin-manager__heading">
        <div>
          <h2 id="admin-products-heading">Products</h2>
          <p>Manage product details, prices, and stock.</p>
        </div>
        {!addingProduct &&
          !editingProductId &&
          Array.isArray(products) &&
          products.length > 0 && (
            <Button onClick={beginAdd}>Add product</Button>
          )}
      </div>
      {actionError && <Alert>{actionError}</Alert>}
      {productsQuery.isPending ? (
        <div className="admin-table-skeleton">
          <Skeleton className="admin-table-skeleton__row" />
          <Skeleton className="admin-table-skeleton__row" />
          <Skeleton className="admin-table-skeleton__row" />
        </div>
      ) : productsQuery.isError ? (
        <ErrorState
          message={productsQuery.error.message}
          onRetry={() => productsQuery.refetch()}
        />
      ) : !Array.isArray(products) ? (
        <Alert>
          Products could not be displayed because the server returned an
          unexpected response.
        </Alert>
      ) : products.length === 0 ? (
        <div className="admin-empty">
          <div>
            <h3>No products yet</h3>
            <p>Add a product to start building the catalogue.</p>
          </div>
          <Button onClick={beginAdd}>Add product</Button>
        </div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table admin-product-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Category</th>
                  <th scope="col">Price</th>
                  <th scope="col">Stock status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td data-label="Product">
                      <div className="admin-product-cell">
                        <ProductImage
                          src={product.imageUrl}
                          alt={product.name}
                          name={product.name}
                        />
                        <strong>{product.name}</strong>
                      </div>
                    </td>
                    <td data-label="Category">{product.categoryName}</td>
                    <td data-label="Price">{formatPrice(product.price)}</td>
                    <td data-label="Stock status">
                      <span
                        className="admin-stock-status"
                        data-in-stock={product.inStock}
                      >
                        {product.inStock ? 'In stock' : 'Out of stock'}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="admin-table__actions">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setActionError('');
                            setAddingProduct(false);
                            setEditingProductId(String(product.id));
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setActionError('');
                            setStockProductId(String(product.id));
                          }}
                        >
                          Adjust stock
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => setDeletingProduct(product)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(productsQuery.data.totalPages ?? 0) > 1 && (
            <nav className="admin-pagination" aria-label="Product pages">
              <Button
                variant="secondary"
                disabled={page <= 0}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <span>
                Page {page + 1} of {productsQuery.data.totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={page + 1 >= productsQuery.data.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </nav>
          )}
        </>
      )}
      {(addingProduct || editingProductId) && (
        <section
          className="admin-editor"
          aria-labelledby="product-editor-heading"
        >
          <h3 id="product-editor-heading">
            {editingProductId ? 'Edit product' : 'Add a product'}
          </h3>
          {categoriesQuery.isError ? (
            <ErrorState
              message={categoriesQuery.error.message}
              onRetry={() => categoriesQuery.refetch()}
            />
          ) : categoriesQuery.isPending ? (
            <Skeleton
              className="admin-editor-skeleton"
              label="Loading categories"
            />
          ) : !Array.isArray(categories) ? (
            <Alert>
              Categories could not be displayed because the server returned an
              unexpected response.
            </Alert>
          ) : categories.length === 0 ? (
            <Alert>
              Add a category before saving products.{' '}
              <Link to="/admin/products?tab=categories">Manage categories</Link>
            </Alert>
          ) : editProductQuery.isPending && editingProductId ? (
            <Skeleton
              className="admin-editor-skeleton"
              label="Loading product details"
            />
          ) : editProductQuery.isError && editingProductId ? (
            <ErrorState
              message={editProductQuery.error.message}
              onRetry={() => editProductQuery.refetch()}
            />
          ) : (
            <ProductForm
              key={editProduct?.id ?? 'new'}
              product={editingProductId ? editProduct : null}
              categories={categories ?? []}
              onSave={saveProduct}
              onCancel={() => {
                setAddingProduct(false);
                setEditingProductId(null);
              }}
            />
          )}
        </section>
      )}
      {stockProductId && stockProductQuery.isPending && (
        <Skeleton
          className="admin-editor-skeleton"
          label="Loading stock details"
        />
      )}
      {stockProductId && stockProductQuery.isError && (
        <ErrorState
          message={stockProductQuery.error.message}
          onRetry={() => stockProductQuery.refetch()}
        />
      )}
      {stockProductId && stockProduct && (
        <StockAdjustDialog
          key={stockProduct.id}
          product={stockProduct}
          onSave={saveStock}
          onCancel={() => setStockProductId(null)}
        />
      )}
      <ConfirmDialog
        open={Boolean(deletingProduct)}
        title="Delete this product?"
        confirmLabel="Delete product"
        cancelLabel="Keep product"
        pending={deleteMutation.isPending}
        onCancel={() => setDeletingProduct(null)}
        onConfirm={deleteProduct}
      >
        <p>{deletingProduct?.name} will be removed from the catalogue.</p>
      </ConfirmDialog>
    </section>
  );
}
