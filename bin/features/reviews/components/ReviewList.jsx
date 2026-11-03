import { Trash2 } from 'lucide-react';
import RatingStars from '@/components/shared/RatingStars/RatingStars';
import { formatRelativeTime } from '@/shared/utils/formatDate';

export default function ReviewList({ reviews, loading, currentUser, onRemove }) {
  if (loading) return <p className="muted">Đang tải đánh giá...</p>;
  if (!reviews.length) return <p className="muted">Chưa có đánh giá nào cho cuốn sách này.</p>;

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <article key={review.id} className="review-item">
          <div className="review-item__avatar" aria-hidden="true">
            {(review.userName || 'K').charAt(0).toUpperCase()}
          </div>
          <div className="review-item__body">
            <div className="review-item__head">
              <div>
                <strong>{review.userName}</strong>
                <span className="muted"> · {formatRelativeTime(review.createdAt)}</span>
              </div>
              <RatingStars rating={review.rating} size={13} />
            </div>
            <p className="review-item__comment">{review.comment}</p>
          </div>
          {currentUser && String(currentUser.id) === String(review.userId) ? (
            <button
              type="button"
              className="review-item__delete"
              onClick={() => onRemove(review.id)}
              aria-label="Xóa đánh giá"
            >
              <Trash2 size={15} />
            </button>
          ) : null}
        </article>
      ))}
    </div>
  );
}
