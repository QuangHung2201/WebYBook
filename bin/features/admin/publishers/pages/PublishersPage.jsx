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
import { publisherService } from '@/features/publishers/services/publisherService';
import PublisherFormModal from '../components/PublisherFormModal';

const listPublishers = () => publisherService.getPublishers();
const createPublisher = (data) => publisherService.createPublisher(data);
const updatePublisher = (id, data) => publisherService.updatePublisher(id, data);
const deletePublisher = (id) => publisherService.deletePublisher(id);

const MESSAGES = {
  create: 'Đã thêm nhà xuất bản mới.',
  update: 'Đã cập nhật nhà xuất bản.',
  remove: 'Đã xóa nhà xuất bản.',
};

export default function PublishersPage() {
  const { items, loading, saving, error, reload, createItem, updateItem, removeItem } =
    useCrudResource({
      list: listPublishers,
      create: createPublisher,
      update: updatePublisher,
      remove: deletePublisher,
      messages: MESSAGES,
    });

  const [keyword, setKeyword] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() => {
    const needle = normalizeKeyword(keyword);
    if (!needle) return items;
    return items.filter((publisher) =>
      [publisher.name, publisher.address, publisher.website]
        .map(normalizeKeyword)
        .some((value) => value.includes(needle)),
    );
  }, [items, keyword]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (publisher) => {
    setEditing(publisher);
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
          <h2>Nhà xuất bản</h2>
          <p>Danh sách đơn vị phát hành sách và thông tin liên hệ.</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>
          Thêm nhà xuất bản
        </Button>
      </div>

      <div className="admin-filters">
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          placeholder="Tìm nhà xuất bản..."
        />
        <span className="admin-count">{filtered.length} nhà xuất bản</span>
      </div>

      {loading ? (
        <Loading label="Đang tải nhà xuất bản..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="admin-table-card">
          <div className="table-wrap admin-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nhà xuất bản</th>
                  <th>Địa chỉ</th>
                  <th>Website</th>
                  <th>Số sách</th>
                  <th aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        title="Chưa có nhà xuất bản"
                        description="Thêm nhà xuất bản mới để gắn vào các đầu sách."
                        action={<Button icon={Plus} onClick={openCreate}>Thêm nhà xuất bản</Button>}
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((publisher) => (
                    <tr key={publisher.id}>
                      <td>
                        <strong>{publisher.name}</strong>
                      </td>
                      <td className="muted">{publisher.address || '—'}</td>
                      <td className="muted">{publisher.website || '—'}</td>
                      <td>
                        <StatusBadge tone="info">{publisher.bookCount ?? 0} sách</StatusBadge>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-action-btn"
                            onClick={() => openEdit(publisher)}
                            aria-label={`Sửa ${publisher.name}`}
                            title="Chỉnh sửa"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="admin-action-btn admin-action-btn--danger"
                            onClick={() => setDeleting(publisher)}
                            aria-label={`Xóa ${publisher.name}`}
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

      <PublisherFormModal
        open={formOpen}
        publisher={editing}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa nhà xuất bản"
        message={`Bạn có chắc muốn xóa nhà xuất bản "${deleting?.name || ''}"? Không thể xóa nhà xuất bản đang có sách.`}
        confirmLabel="Xóa nhà xuất bản"
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
