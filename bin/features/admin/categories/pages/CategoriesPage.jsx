import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import Button from '@/components/common/Button/Button';
import Loading from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog/ConfirmDialog';
import StatusBadge from '@/components/shared/StatusBadge/StatusBadge';
import { useCrudResource } from '@/shared/hooks/useCrudResource';
import { normalizeKeyword } from '@/shared/utils/validators';
import { categoryService } from '@/features/categories/services/categoryService';
import CategoryFormModal from '../components/CategoryFormModal';

const listCategories = () => categoryService.getCategories();
const createCategory = (data) => categoryService.createCategory(data);
const updateCategory = (id, data) => categoryService.updateCategory(id, data);
const deleteCategory = (id) => categoryService.deleteCategory(id);

const MESSAGES = {
  create: 'Đã thêm danh mục mới.',
  update: 'Đã cập nhật danh mục.',
  remove: 'Đã xóa danh mục.',
};

export default function CategoriesPage() {
  const { items, loading, saving, error, reload, createItem, updateItem, removeItem } =
    useCrudResource({
      list: listCategories,
      create: createCategory,
      update: updateCategory,
      remove: deleteCategory,
      messages: MESSAGES,
    });

  const [keyword, setKeyword] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() => {
    const needle = normalizeKeyword(keyword);
    if (!needle) return items;
    return items.filter((category) =>
      [category.name, category.slug, category.description]
        .map(normalizeKeyword)
        .some((value) => value.includes(needle)),
    );
  }, [items, keyword]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = (values) =>
    editing ? updateItem(editing.id, values) : createItem(values);

  const handleDelete = async () => {
    if (!deleting) return;
    const ok = await removeItem(deleting.id);
    if (ok) setDeleting(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Danh mục sách</h2>
          <p>Tổ chức kho sách theo thể loại để khách hàng dễ dàng tìm kiếm.</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>
          Thêm danh mục
        </Button>
      </div>

      <div className="admin-filters">
        <SearchInput value={keyword} onChange={setKeyword} placeholder="Tìm danh mục..." />
        <span className="admin-count">{filtered.length} danh mục</span>
      </div>

      {loading ? (
        <Loading label="Đang tải danh mục..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="admin-table-card">
          <div className="table-wrap admin-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Danh mục</th>
                  <th>Slug</th>
                  <th>Số sách</th>
                  <th>Mô tả</th>
                  <th aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        title="Chưa có danh mục"
                        description="Thêm danh mục đầu tiên để phân loại kho sách."
                        action={<Button icon={Plus} onClick={openCreate}>Thêm danh mục</Button>}
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <strong>{category.name}</strong>
                      </td>
                      <td>
                        <code className="muted">{category.slug}</code>
                      </td>
                      <td>
                        <StatusBadge tone="info">{category.bookCount ?? 0} sách</StatusBadge>
                      </td>
                      <td className="muted" style={{ maxWidth: 340 }}>
                        {category.description || '—'}
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-action-btn"
                            onClick={() => openEdit(category)}
                            aria-label={`Sửa ${category.name}`}
                            title="Chỉnh sửa"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="admin-action-btn admin-action-btn--danger"
                            onClick={() => setDeleting(category)}
                            aria-label={`Xóa ${category.name}`}
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CategoryFormModal
        open={formOpen}
        category={editing}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa danh mục"
        message={`Bạn có chắc muốn xóa danh mục "${deleting?.name || ''}"? Không thể xóa danh mục đang có sách.`}
        confirmLabel="Xóa danh mục"
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
