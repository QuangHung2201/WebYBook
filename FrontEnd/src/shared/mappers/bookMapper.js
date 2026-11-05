import { BOOK_STATUS } from '../../data/constants/bookStatus';

function pick(value, ...keys) {
  for (const key of keys) {
    if (value?.[key] !== undefined && value?.[key] !== null) return value[key];
  }
  return undefined;
}

/** Map a backend book DTO into the application Book model. */
export function mapBookFromApi(dto) {
  if (!dto) return null;
  const salePrice = Number(pick(dto, 'price')) || 0;
  const originalPrice = Number(pick(dto, 'originalPrice', 'original_price')) || salePrice;
  const status = String(pick(dto, 'status') || BOOK_STATUS.ACTIVE).toUpperCase();
  return {
    id: pick(dto, 'id'),
    isbn: pick(dto, 'isbn') || '',
    title: pick(dto, 'title', 'name') || '',
    author: {
      id: pick(dto.author, 'id') ?? pick(dto, 'authorId', 'author_id') ?? null,
      name: pick(dto.author, 'name') ?? pick(dto, 'authorName', 'author_name') ?? '',
    },
    category: {
      id: pick(dto.category, 'id') ?? pick(dto, 'categoryId', 'category_id') ?? null,
      name: pick(dto.category, 'name') ?? pick(dto, 'categoryName', 'category_name') ?? '',
    },
    publisher: {
      id: pick(dto.publisher, 'id') ?? pick(dto, 'publisherId', 'publisher_id') ?? null,
      name: pick(dto.publisher, 'name') ?? pick(dto, 'publisherName', 'publisher_name') ?? '',
    },
    price: originalPrice,
    discountPrice: salePrice < originalPrice ? salePrice : 0,
    stock: Number(pick(dto, 'stockQuantity', 'stock_quantity', 'stock', 'quantity')) || 0,
    coverImage: pick(dto, 'coverImage', 'cover_image') || '',
    description: pick(dto, 'description') || '',
    rating: Number(pick(dto, 'rating', 'averageRating', 'average_rating')) || 0,
    reviewCount: Number(pick(dto, 'reviewCount', 'review_count')) || 0,
    sold: Number(pick(dto, 'sold', 'soldCount', 'sold_count')) || 0,
    status,
    createdAt: pick(dto, 'createdAt', 'created_at') || null,
  };
}

/** Map the application Book model into the payload expected by Spring Boot. */
export function mapBookToApi(model) {
  const originalPrice = Number(model.price) || 0;
  const salePrice = Number(model.discountPrice) > 0 ? Number(model.discountPrice) : originalPrice;
  const pageCount = Number(model.pageCount);
  return {
    isbn: model.isbn || `WEBYBOOK-${Date.now()}`,
    title: model.title,
    authorIds: model.authorIds ?? (model.authorId ? [Number(model.authorId)] : model.author?.id ? [model.author.id] : []),
    categoryId: model.categoryId ?? model.category?.id ?? null,
    publisherId: model.publisherId ?? model.publisher?.id ?? null,
    price: salePrice,
    originalPrice,
    pageCount: Number.isInteger(pageCount) && pageCount > 0 ? pageCount : null,
    stockQuantity: Number(model.stock) || 0,
    coverImage: model.coverImage || '',
    description: model.description || '',
    status: String(model.status || BOOK_STATUS.ACTIVE).toLowerCase(),
  };
}

export function mapBookPageFromApi(payload) {
  const source = payload?.data ?? payload ?? {};
  const items = Array.isArray(source) ? source : source.items ?? source.content ?? [];
  const total = Array.isArray(source) ? items.length : source.total ?? source.totalElements ?? items.length;
  return {
    items: items.map(mapBookFromApi),
    total,
    page: source.page ?? source.number ?? 1,
    pageSize: source.pageSize ?? source.size ?? items.length,
    totalPages: source.totalPages ?? Math.max(1, Math.ceil(total / (source.limit || source.pageSize || items.length || 1))),
  };
}
