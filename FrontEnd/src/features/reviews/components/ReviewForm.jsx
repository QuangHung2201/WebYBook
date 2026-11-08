import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import Button from '@/components/common/Button/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/shared/utils/cn';

export default function ReviewForm({ submitting, myReview, onSubmit }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (myReview) {
      setRating(Number(myReview.rating) || 5);
      setComment(myReview.comment || '');
    }
  }, [myReview?.id, myReview?.updatedAt]);

  if (!user) {
    return (
      <div className="review-login">
        <p className="muted">Vui lòng đăng nhập để gửi đánh giá của bạn.</p>
        <Link to="/login">
          <Button variant="outline" size="sm">
            Đăng nhập
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedComment = comment.trim();
    if (normalizedComment.length < 5 || normalizedComment.length > 2000) return;
    await onSubmit({ rating, comment: normalizedComment });
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      {myReview ? (
        <p className="review-form__note">
          {myReview.status === 'approved'
            ? 'Bạn đã đánh giá cuốn sách này. Bạn có thể chỉnh sửa đánh giá bên dưới.'
            : 'Đánh giá của bạn đang chờ duyệt. Bạn vẫn có thể chỉnh sửa và gửi lại.'}
        </p>
      ) : null}
      <div className="review-form__rating">
        <span>Đánh giá của bạn:</span>
        <div className="review-form__stars" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHovered(value)}
              aria-label={`${value} sao`}
            >
              <Star
                size={22}
                className={cn('review-form__star', value <= (hovered || rating) && 'is-active')}
              />
            </button>
          ))}
        </div>
      </div>
      <textarea
        className="textarea"
        rows={3}
        placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        required
        minLength={5}
        maxLength={2000}
        aria-label="Nội dung đánh giá"
      />
      {comment.length > 0 && comment.trim().length < 5 ? (
        <p className="muted" role="alert">Nội dung đánh giá cần ít nhất 5 ký tự.</p>
      ) : null}
      <div className="review-form__actions">
        <Button type="submit" loading={submitting}>
          {myReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
        </Button>
      </div>
    </form>
  );
}
