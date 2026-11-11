import { useCallback, useEffect, useState } from 'react';
import { Check, RefreshCw, Trash2, X } from 'lucide-react';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import { Select } from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import Loading from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog/ConfirmDialog';
import RatingStars from '@/components/shared/RatingStars/RatingStars';
import StatusBadge from '@/components/shared/StatusBadge/StatusBadge';
import { useToast } from '@/app/providers/ToastProvider';
import { formatDateTime } from '@/shared/utils/formatDate';
import { adminReviewService } from '@/features/reviews/services/adminReviewService';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
];

const STATUS_LABELS = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };

export default function AdminReviewsPage() {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReviews(await adminReviewService.list({ status, search: search.trim() }));
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách đánh giá.');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, nextStatus) => {
    setSavingId(id);
    try {
      await adminReviewService.updateStatus(id, nextStatus);
      toast.success(nextStatus === 'approved' ? 'Đã duyệt đánh giá.' : 'Đã từ chối đánh giá.');
      await load();
    } catch (err) {
      toast.error(err.message || 'Không thể cập nhật đánh giá.');
    } finally {
      setSavingId(null);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setSavingId(deleting.id);
    try {
      await adminReviewService.remove(deleting.id);
      toast.success('Đã xóa đánh giá.');
      setDeleting(null);
      await load();
    } catch (err) {
      toast.error(err.message || 'Không thể xóa đánh giá.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Quản lý đánh giá</h2>
          <p>Kiểm duyệt đánh giá của khách hàng đã mua và nhận sách.</p>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={load} loading={loading}>Làm mới</Button>
      </div>

      <div className="admin-filters">
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo sách, khách hàng, nội dung..." />
        <Select aria-label="Lọc trạng thái đánh giá" value={status} onChange={(event) => setStatus(event.target.value)} options={STATUS_OPTIONS} />
        <span className="admin-count">{reviews.length} đánh giá</span>
      </div>

      {loading ? <Loading label="Đang tải đánh giá..." /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <div className="admin-table-card">
          <div className="table-wrap admin-table-wrap">
            <table className="data-table" style={{ minWidth: 980 }}>
              <thead><tr><th>Sách</th><th>Khách hàng</th><th>Đánh giá</th><th>Nội dung</th><th>Trạng thái</th><th aria-label="Thao tác" /></tr></thead>
              <tbody>
                {!reviews.length ? <tr><td colSpan={6}><EmptyState title="Chưa có đánh giá" description="Đánh giá của khách hàng sẽ xuất hiện tại đây." /></td></tr> : reviews.map((review) => (
                  <tr key={review.id}>
                    <td><strong>{review.bookTitle}</strong><br /><span className="muted">Đơn #{review.orderId}</span></td>
                    <td><strong>{review.userName}</strong><br /><span className="muted">{formatDateTime(review.createdAt)}</span></td>
                    <td><RatingStars rating={review.rating} size={15} /></td>
                    <td style={{ maxWidth: 360 }}>{review.comment}</td>
                    <td><StatusBadge tone={review.status === 'approved' ? 'success' : review.status === 'rejected' ? 'danger' : 'warning'}>{STATUS_LABELS[review.status] || review.status}</StatusBadge></td>
                    <td>
                      <div className="admin-row-actions">
                        {review.status !== 'approved' ? <button type="button" className="admin-action-btn" title="Duyệt" onClick={() => updateStatus(review.id, 'approved')} disabled={savingId === review.id}><Check size={16} /></button> : null}
                        {review.status !== 'rejected' ? <button type="button" className="admin-action-btn admin-action-btn--danger" title="Từ chối" onClick={() => updateStatus(review.id, 'rejected')} disabled={savingId === review.id}><X size={16} /></button> : null}
                        <button type="button" className="admin-action-btn admin-action-btn--danger" title="Xóa" onClick={() => setDeleting(review)} disabled={savingId === review.id}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog open={Boolean(deleting)} title="Xóa đánh giá" message={`Bạn có chắc muốn xóa đánh giá của "${deleting?.userName || ''}"?`} confirmLabel="Xóa đánh giá" loading={Boolean(savingId)} onConfirm={remove} onCancel={() => setDeleting(null)} />
    </div>
  );
}
