import { useState } from 'react';
import { toast } from 'sonner';
import CategoryForm from './CategoryForm.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { Alert, Button, ErrorState, Skeleton } from '../ui/index.js';
import {
  useCategoriesPage,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '../../hooks/useCategories.js';

/** Lists and manages catalogue categories with confirmed deletion. */
export default function CategoryManager() {
  const categoriesQuery = useCategoriesPage();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const [editingCategory, setEditingCategory] = useState(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [actionError, setActionError] = useState('');

  async function saveCategory(values) {
    if (editingCategory) {
      await updateMutation.mutateAsync({
        categoryId: editingCategory.id,
        category: values,
      });
      setEditingCategory(null);
      toast.success('Category updated');
    } else {
      await createMutation.mutateAsync(values);
      setAddingCategory(false);
      toast.success('Category added');
    }
  }

  async function deleteCategory() {
    setActionError('');
    try {
      await deleteMutation.mutateAsync(deletingCategory.id);
      setDeletingCategory(null);
      toast.success('Category deleted');
    } catch (error) {
      setActionError(
        error?.message ?? 'Unable to delete this category. Try again.',
      );
    }
  }

  const categories = categoriesQuery.data;

  return (
    <section
      className="admin-manager"
      aria-labelledby="admin-categories-heading"
    >
      <div className="admin-manager__heading">
        <div>
          <h2 id="admin-categories-heading">Categories</h2>
          <p>Manage the categories used to organize products.</p>
        </div>
        {!addingCategory &&
          !editingCategory &&
          Array.isArray(categoriesQuery.data) &&
          categoriesQuery.data.length > 0 && (
            <Button
              onClick={() => {
                setActionError('');
                setAddingCategory(true);
              }}
            >
              Add category
            </Button>
          )}
      </div>
      {actionError && <Alert>{actionError}</Alert>}
      {categoriesQuery.isPending ? (
        <div className="admin-table-skeleton">
          <Skeleton className="admin-table-skeleton__row" />
          <Skeleton className="admin-table-skeleton__row" />
          <Skeleton className="admin-table-skeleton__row" />
        </div>
      ) : categoriesQuery.isError ? (
        <ErrorState
          message={categoriesQuery.error.message}
          onRetry={() => categoriesQuery.refetch()}
        />
      ) : !Array.isArray(categories) ? (
        <Alert>
          Categories could not be displayed because the server returned an
          unexpected response.
        </Alert>
      ) : categories.length === 0 ? (
        <div className="admin-empty">
          <div>
            <h3>No categories yet</h3>
            <p>Add a category before assigning it to products.</p>
          </div>
          <Button onClick={() => setAddingCategory(true)}>Add category</Button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Description</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td data-label="Name">{category.name}</td>
                  <td data-label="Description">
                    {category.description || '—'}
                  </td>
                  <td data-label="Actions">
                    <div className="admin-table__actions">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setActionError('');
                          setAddingCategory(false);
                          setEditingCategory(category);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => setDeletingCategory(category)}
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
      )}
      {(addingCategory || editingCategory) && (
        <section
          className="admin-editor"
          aria-labelledby="category-editor-heading"
        >
          <h3 id="category-editor-heading">
            {editingCategory ? 'Edit category' : 'Add a category'}
          </h3>
          <CategoryForm
            key={editingCategory?.id ?? 'new'}
            category={editingCategory}
            onSave={saveCategory}
            onCancel={() => {
              setAddingCategory(false);
              setEditingCategory(null);
            }}
          />
        </section>
      )}
      <ConfirmDialog
        open={Boolean(deletingCategory)}
        title="Delete this category?"
        confirmLabel="Delete category"
        cancelLabel="Keep category"
        pending={deleteMutation.isPending}
        onCancel={() => setDeletingCategory(null)}
        onConfirm={deleteCategory}
      >
        <p>{deletingCategory?.name} will be removed if no products use it.</p>
      </ConfirmDialog>
    </section>
  );
}
