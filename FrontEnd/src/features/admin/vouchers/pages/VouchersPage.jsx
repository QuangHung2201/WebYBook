import { useMemo, useState } from 'react';
import { Pencil, Plus, Ticket, Trash2 } from 'lucide-react';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import { Select } from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import Loading from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog/ConfirmDialog';
import StatusBadge from '@/components/shared/StatusBadge/StatusBadge';
import StatCard from '@/features/admin/components/StatCard';
import { useCrudResource } from '@/shared/hooks/useCrudResource';
import { normalizeKeyword } from '@/shared/utils/validators';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { formatDate } from '@/shared/utils/formatDate';
import {
  VOUCHER_STATUS,
  VOUCHER_STATUS_OPTIONS,
  VOUCHER_TYPE,
} from '@/data/constants/voucherStatus';
import { voucherService } from '@/features/vouchers/services/voucherService';
import VoucherFormModal from '../components/VoucherFormModal';

const listVouchers = () => voucherService.getVouchers();
const createVoucher = (data) => voucherService.createVoucher(data);
const updateVoucher = (id, data) => voucherService.updateVoucher(id, data);
const deleteVoucher = (id) => voucherService.deleteVoucher(id);

const MESSAGES = {
  create: 'Đã thêm voucher mới.',
  update: 'Đã cập nhật voucher.',
  remove: 'Đã xóa voucher.',
};

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Đang áp dụng' },
  { value: 'INACTIVE', label: 'Tạm dừng' },
  { value: 'EXPIRED', label: 'Hết hạn' },
];

function statusOf(voucher) {
  if (new Date(voucher.endDate) < new Date()) {
    return { label: 'Hết hạn', tone: 'danger', key: 'EXPIRED' };
  }
  if (voucher.status === VOUCHER_STATUS.INACTIVE) {
    return { label: 'Tạm dừng', tone: 'neutral', key: 'INACTIVE' };
  }
  return { label: 'Đang áp dụng', tone: 'success', key: 'ACTIVE' };
}

export default function VouchersPage() {
  const { items, loading, saving, error, reload, createItem, updateItem, removeItem } =
    useCrudResource({
      list: listVouchers,
      create: createVoucher,
      update: updateVoucher,
      remove: deleteVoucher,
      messages: MESSAGES,
    });

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const stats = useMemo(() => {
    const active = items.filter((voucher) => statusOf(voucher).key === 'ACTIVE').length;
    const expired = items.filter((voucher) => statusOf(voucher).key === 'EXPIRED').length;
    const used = items.reduce((sum, voucher) => sum + (Number(voucher.used) || 0), 0);
    return { total: items.length, active, expired, used };
  }, [items]);

  const filtered = useMemo(() => {
    const needle = normalizeKeyword(keyword);
    return items.filter((voucher) => {
      const matchesKeyword =
        !needle ||
        [voucher.code, voucher.name, voucher.description]
          .map(normalizeKeyword)
          .some((value) => value.includes(needle));
      const matchesStatus = !statusFilter || statusOf(voucher).key === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [items, keyword, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (voucher) => {
    setEditing(voucher);
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
          <h2>Voucher</h2>
          <p>Tạo mã giảm giá, giới hạn lượt dùng và theo dõi hiệu quả khuyến mãi.</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>
          Thêm voucher
        </Button>
      </div>

      <div className="stat-grid">
        <StatCard label="Tổng voucher" value={stats.total} icon={Ticket} tone="info" />
        <StatCard label="Đang áp dụng" value={stats.active} icon={Ticket} tone="success" />
        <StatCard label="Lượt đã dùng" value={stats.used} icon={Ticket} tone="warning" />
        <StatCard label="Đã hết hạn" value={stats.expired} icon={Ticket} tone="danger" />
      </div>

      <div className="admin-filters">
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          placeholder="Tìm theo mã hoặc tên chương trình..."
        />
        <Select
          aria-label="Lọc theo trạng thái voucher"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          options={STATUS_FILTERS}
        />
        <span className="admin-count">{filtered.length} voucher</span>
      </div>

      {loading ? (
        <Loading label="Đang tải voucher..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="admin-table-card">
          <div className="table-wrap admin-table-wrap">
            <table className="data-table" style={{ minWidth: 1040 }}>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Chương trình</th>
                  <th>Mức giảm</th>
                  <th>Điều kiện</th>
                  <th>Thời gian</th>
                  <th>Đã dùng</th>
                  <th>Trạng thái</th>
                  <th aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState
                        title="Chưa có voucher"
                        description="Tạo voucher đầu tiên để thu hút khách hàng."
                        action={<Button icon={Plus} onClick={openCreate}>Thêm voucher</Button>}
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((voucher) => {
                    const status = statusOf(voucher);
                    const used = Number(voucher.used) || 0;
                    const quantity = Number(voucher.quantity) || 0;
                    const percent = quantity ? Math.min(100, Math.round((used / quantity) * 100)) : 0;
                    return (
                      <tr key={voucher.id}>
                        <td>
                          <span className="voucher-code">{voucher.code}</span>
                        </td>
                        <td>
                          <div className="admin-table-book__info">
                            <strong>{voucher.name}</strong>
                            <span>{voucher.description || '—'}</span>
                          </div>
                        </td>
                        <td className="admin-money">
                          {voucher.type === VOUCHER_TYPE.PERCENT
                            ? `${voucher.value}%`
                            : formatCurrency(voucher.value)}
                          {voucher.maxDiscount ? (
                            <small className="muted" style={{ display: 'block', fontWeight: 500 }}>
                              tối đa {formatCurrency(voucher.maxDiscount)}
                            </small>
                          ) : null}
                        </td>
                        <td className="muted">
                          {Number(voucher.minOrder) > 0
                            ? `Đơn từ ${formatCurrency(voucher.minOrder)}`
                            : 'Mọi đơn hàng'}
                        </td>
                        <td className="muted">
                          {formatDate(voucher.startDate)}
                          <br />
                          đến {formatDate(voucher.endDate)}
                        </td>
                        <td>
                          <div className="voucher-usage">
                            <span className="voucher-usage__track">
                              <span
                                className="voucher-usage__fill"
                                style={{ width: `${percent}%` }}
                              />
                            </span>
                            <small>
                              {used}/{quantity} lượt
                            </small>
                          </div>
                        </td>
                        <td>
                          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            <button
                              type="button"
                              className="admin-action-btn"
                              onClick={() => openEdit(voucher)}
                              aria-label={`Sửa voucher ${voucher.code}`}
                              title="Chỉnh sửa"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn--danger"
                              onClick={() => setDeleting(voucher)}
                              aria-label={`Xóa voucher ${voucher.code}`}
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <VoucherFormModal
        open={formOpen}
        voucher={editing}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa voucher"
        message={`Bạn có chắc muốn xóa voucher "${deleting?.code || ''}"? Thao tác này không thể hoàn tác.`}
        confirmLabel="Xóa voucher"
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
