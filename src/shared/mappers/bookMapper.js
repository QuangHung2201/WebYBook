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
  const price = Number(pick(dto, 'price')) || 0;
  return {
    id: pick(dto, 'id'),
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
    price,
    discountPrice: Number(pick(dto, 'discountPrice', 'discount_price')) || price,
    stock: Number(pick(dto, 'stock', 'quantity')) || 0,
    coverImage: pick(dto, 'coverImage', 'cover_image') || '',
    description: pick(dto, 'description') || '',
    rating: Number(pick(dto, 'rating', 'averageRating', 'average_rating')) || 0,
    reviewCount: Number(pick(dto, 'reviewCount', 'review_count')) || 0,
    sold: Number(pick(dto, 'sold', 'soldCount', 'sold_count')) || 0,
    status: pick(dto, 'status') || BOOK_STATUS.ACTIVE,
    createdAt: pick(dto, 'createdAt', 'created_at') || null,
  };
}

/** Map the application Book model into the payload expected by Spring Boot. */
export function mapBookToApi(model) {
  return {
    title: model.title,
    authorId: model.author?.id ?? null,
    categoryId: model.category?.id ?? null,
    publisherId: model.publisher?.id ?? null,
    price: Number(model.price) || 0,
    discountPrice: Number(model.discountPrice) || 0,
    stock: Number(model.stock) || 0,
    coverImage: model.coverImage || '',
    description: model.description || '',
    status: model.status || BOOK_STATUS.ACTIVE,
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
    totalPages: source.totalPages ?? source.totalPages ?? Math.max(1, Math.ceil(total / (source.pageSize || items.length || 1))),
  };
}
