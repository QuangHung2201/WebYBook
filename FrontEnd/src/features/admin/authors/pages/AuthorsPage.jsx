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
import { authorService } from '@/features/authors/services/authorService';
import AuthorFormModal from '../components/AuthorFormModal';

const listAuthors = () => authorService.getAuthors();
const createAuthor = (data) => authorService.createAuthor(data);
const updateAuthor = (id, data) => authorService.updateAuthor(id, data);
const deleteAuthor = (id) => authorService.deleteAuthor(id);

const MESSAGES = {
  create: 'Đã thêm tác giả mới.',
  update: 'Đã cập nhật tác giả.',
  remove: 'Đã xóa tác giả.',
};

export default function AuthorsPage() {
  const { items, loading, saving, error, reload, createItem, updateItem, removeItem } =
    useCrudResource({
      list: listAuthors,
      create: createAuthor,
      update: updateAuthor,
      remove: deleteAuthor,
      messages: MESSAGES,
    });

  const [keyword, setKeyword] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() => {
    const needle = normalizeKeyword(keyword);
    if (!needle) return items;
    return items.filter((author) =>
      [author.name, author.bio].map(normalizeKeyword).some((value) => value.includes(needle)),
    );
  }, [items, keyword]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (author) => {
    setEditing(author);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = (values) => (editing ? updateItem(editing.id, values) : createItem(values));

  const handleDelete = async () => {
    if (!deleting) return;
    const ok = await removeItem(deleting.id);
    if (ok) setDeleting(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Tác giả</h2>
          <p>Quản lý hồ sơ tác giả gắn với các đầu sách trong hệ thống.</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>
          Thêm tác giả
        </Button>
      </div>

      <div className="admin-filters">
        <SearchInput value={keyword} onChange={setKeyword} placeholder="Tìm tác giả..." />
        <span className="admin-count">{filtered.length} tác giả</span>
      </div>

      {loading ? (
        <Loading label="Đang tải tác giả..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="admin-table-card">
          <div className="table-wrap admin-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tác giả</th>
                  <th>Số sách</th>
                  <th>Tiểu sử</th>
                  <th aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState
                        title="Chưa có tác giả"
                        description="Thêm tác giả mới để gắn vào các đầu sách."
                        action={<Button icon={Plus} onClick={openCreate}>Thêm tác giả</Button>}
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((author) => (
                    <tr key={author.id}>
                      <td>
                        <div className="admin-user-cell">
                          <span className="admin-user-cell__avatar">
                            {(author.name || 'T').charAt(0).toUpperCase()}
                          </span>
                          <div className="admin-user-cell__info">
                            <strong>{author.name}</strong>
                            <span>{author.avatar ? 'Đã có ảnh đại diện' : 'Chưa có ảnh'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <StatusBadge tone="info">{author.bookCount ?? 0} sách</StatusBadge>
                      </td>
                      <td className="muted" style={{ maxWidth: 420 }}>
                        {author.bio || '—'}
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-action-btn"
                            onClick={() => openEdit(author)}
                            aria-label={`Sửa ${author.name}`}
                            title="Chỉnh sửa"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="admin-action-btn admin-action-btn--danger"
                            onClick={() => setDeleting(author)}
                            aria-label={`Xóa ${author.name}`}
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

      <AuthorFormModal
        open={formOpen}
        author={editing}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa tác giả"
        message={`Bạn có chắc muốn xóa tác giả "${deleting?.name || ''}"? Không thể xóa tác giả đang có sách.`}
        confirmLabel="Xóa tác giả"
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
