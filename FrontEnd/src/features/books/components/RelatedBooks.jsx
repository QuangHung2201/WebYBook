import BookGrid from './BookGrid';

export default function RelatedBooks({ books, onAddToCart }) {
  if (!books?.length) return null;

  return (
    <section className="related-books">
      <div className="section-title">
        <h2>Sách cùng thể loại</h2>
      </div>
      <BookGrid books={books} onAddToCart={onAddToCart} />
    </section>
  );
}
