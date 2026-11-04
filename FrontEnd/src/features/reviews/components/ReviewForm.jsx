import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import Button from '@/components/common/Button/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/shared/utils/cn';

export default function ReviewForm({ submitting, onSubmit }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');

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
    const success = await onSubmit({ rating, comment });
    if (success) {
      setComment('');
      setRating(5);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
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
      />
      <div className="review-form__actions">
        <Button type="submit" loading={submitting}>
          Gửi đánh giá
        </Button>
      </div>
    </form>
  );
}
