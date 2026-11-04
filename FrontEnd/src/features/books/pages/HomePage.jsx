import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, RefreshCw, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import Button from '@/components/common/Button/Button';
import BookCover from '@/components/shared/BookCover/BookCover';
import { BookGridSkeleton } from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import { useBooks } from '../hooks/useBooks';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useCart } from '@/features/cart/hooks/useCart';
import BookGrid from '../components/BookGrid';
import './Books.css';

export default function HomePage() {
  const { addToCart } = useCart();
  const { categories } = useCategories();
  const bestsellers = useBooks({ sort: 'bestseller', pageSize: 8 });
  const newest = useBooks({ sort: 'newest', pageSize: 8 });

  const heroBooks = bestsellers.books.slice(0, 3);

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content">
            <span className="hero__eyebrow">
              <Sparkles size={15} /> Nhà sách trực tuyến hiện đại
            </span>
            <h1>
              Mỗi cuốn sách mở ra <span>một thế giới mới</span>
            </h1>
            <p>
              Khám phá hàng ngàn đầu sách hay thuộc mọi thể loại. Giao hàng nhanh, giá tốt và
              nhiều ưu đãi dành riêng cho bạn.
            </p>
            <div className="hero__actions">
              <Link to="/books">
                <Button size="lg" icon={ArrowRight}>
                  Khám phá sách ngay
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="ghost" size="lg">
                  Liên hệ tư vấn
                </Button>
              </Link>
            </div>

            <div className="hero__stats">
              <div>
                <strong>10.000+</strong>
                <span>Đầu sách</span>
              </div>
              <div>
                <strong>50.000+</strong>
                <span>Khách hàng</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <span>Đánh giá</span>
              </div>
            </div>
          </div>

          <div className="hero__art" aria-hidden="true">
            {heroBooks.length > 0
              ? heroBooks.map((book, index) => (
                  <div key={book.id} className={`hero__book hero__book--${index}`}>
                    <BookCover title={book.title} author={book.author?.name} coverImage={book.coverImage} />
                  </div>
                ))
              : [0, 1, 2].map((index) => (
                  <div key={index} className={`hero__book hero__book--${index} hero__book--empty`}>
                    <BookOpen size={48} />
                  </div>
                ))}
            <span className="hero__blob hero__blob--one" />
            <span className="hero__blob hero__blob--two" />
          </div>
        </div>
      </section>

      <section className="container home__categories">
        <div className="section-title">
          <h2>Khám phá theo thể loại</h2>
          <Link to="/books" className="link">
            Xem tất cả <ArrowRight size={15} />
          </Link>
        </div>
        <div className="category-grid">
          {categories.slice(0, 8).map((category) => (
            <Link key={category.id} to={`/books?category=${category.id}`} className="category-chip">
              <span className="category-chip__icon">
                <BookOpen size={18} />
              </span>
              <span>
                <strong>{category.name}</strong>
                <small>{category.bookCount ?? 0} đầu sách</small>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container home__section">
        <div className="section-title">
          <h2>Sách bán chạy</h2>
          <Link to="/books?sort=bestseller" className="link">
            Xem tất cả <ArrowRight size={15} />
          </Link>
        </div>
        {bestsellers.loading ? (
          <BookGridSkeleton count={8} />
        ) : bestsellers.error ? (
          <ErrorState message={bestsellers.error} onRetry={bestsellers.refresh} />
        ) : (
          <BookGrid books={bestsellers.books} onAddToCart={addToCart} />
        )}
      </section>

      <section className="container home__promo">
        <div className="promo-banner">
          <div className="promo-banner__content">
            <span className="promo-banner__tag">Ưu đãi đặc biệt</span>
            <h2>Giảm 10% cho đơn hàng đầu tiên</h2>
            <p>Nhập mã <strong>WELCOME10</strong> khi thanh toán để nhận ưu đãi lên đến 50.000₫.</p>
            <Link to="/books">
              <Button variant="secondary" icon={ArrowRight}>
                Mua sắm ngay
              </Button>
            </Link>
          </div>
          <div className="promo-banner__art" aria-hidden="true">
            <span>WELCOME10</span>
          </div>
        </div>
      </section>

      <section className="container home__section">
        <div className="section-title">
          <h2>Sách mới về</h2>
          <Link to="/books" className="link">
            Xem tất cả <ArrowRight size={15} />
          </Link>
        </div>
        {newest.loading ? (
          <BookGridSkeleton count={8} />
        ) : newest.error ? (
          <ErrorState message={newest.error} onRetry={newest.refresh} />
        ) : (
          <BookGrid books={newest.books} onAddToCart={addToCart} />
        )}
      </section>

      <section className="container home__services">
        <div className="service-card">
          <Truck size={24} />
          <div>
            <strong>Giao hàng nhanh</strong>
            <span>Nhận sách trong 1 - 3 ngày</span>
          </div>
        </div>
        <div className="service-card">
          <ShieldCheck size={24} />
          <div>
            <strong>Thanh toán an toàn</strong>
            <span>Nhiều phương thức linh hoạt</span>
          </div>
        </div>
        <div className="service-card">
          <RefreshCw size={24} />
          <div>
            <strong>Đổi trả dễ dàng</strong>
            <span>Trong vòng 7 ngày</span>
          </div>
        </div>
      </section>
    </div>
  );
}
