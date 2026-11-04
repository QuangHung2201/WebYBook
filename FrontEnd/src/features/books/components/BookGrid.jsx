import BookCard from '@/components/shared/BookCard/BookCard';

export default function BookGrid({ books, onAddToCart }) {
  return (
    <div className="book-grid">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}
