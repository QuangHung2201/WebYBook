import { BOOK_STATUS } from '../../data/constants/bookStatus';

function pick(value, ...keys) {
  for (const key of keys) {
    if (value?.[key] !== undefined && value?.[key] !== null) return value[key];
  }
  return undefined;
}

function pickAuthorName(dto) {
  const direct =
    pick(dto.author, 'name') ?? pick(dto, 'authorName', 'author_name', 'authorNames', 'author_names');
  if (direct) return direct;
  const authors = dto.authors;
  if (Array.isArray(authors) && authors.length > 0) {
    const first = authors[0];
    if (typeof first === 'string') return first;
    if (first?.name) return first.name;
  }
  return '';
}

function buildAuthorList(dto, authorName) {
  if (Array.isArray(dto.authors) && dto.authors.length > 0) {
    return dto.authors.map((item) => (typeof item === 'string' ? item : item?.name)).filter(Boolean);
  }
  const names = pick(dto, 'authorNames', 'author_names');
  if (names) {
    if (Array.isArray(names)) return names.filter(Boolean);
    return String(names)
      .split(', ')
      .map((name) => name.trim())
      .filter(Boolean);
  }
  return authorName ? [authorName] : [];
}

/** Map a backend book DTO into the application Book model. */
export function mapBookFromApi(dto) {
  if (!dto) return null;
  const salePrice = Number(pick(dto, 'price')) || 0;
  const originalPrice = Number(pick(dto, 'originalPrice', 'original_price')) || salePrice;
  const status = String(pick(dto, 'status') || BOOK_STATUS.ACTIVE).toUpperCase();
  const authorName = pickAuthorName(dto);
  const authors = buildAuthorList(dto, authorName);
  return {
    id: pick(dto, 'id'),
    isbn: pick(dto, 'isbn') || '',
    title: pick(dto, 'title', 'name') || '',
    author: {
      id: pick(dto.author, 'id') ?? pick(dto, 'authorId', 'author_id') ?? null,
      name: authorName,
    },
    authors,
    category: {
      id: pick(dto.category, 'id') ?? pick(dto, 'categoryId', 'category_id') ?? null,
      name: pick(dto.category, 'name') ?? pick(dto, 'categoryName', 'category_name') ?? '',
    },
    publisher: {
      id: pick(dto.publisher, 'id') ?? pick(dto, 'publisherId', 'publisher_id') ?? null,
      name: pick(dto.publisher, 'name') ?? pick(dto, 'publisherName', 'publisher_name') ?? '',
      address:
        pick(dto.publisher, 'address') ?? pick(dto, 'publisherAddress', 'publisher_address') ?? '',
      phone: pick(dto.publisher, 'phone') ?? pick(dto, 'publisherPhone', 'publisher_phone') ?? '',
      email: pick(dto.publisher, 'email') ?? pick(dto, 'publisherEmail', 'publisher_email') ?? '',
    },
    price: originalPrice,
    discountPrice: salePrice < originalPrice ? salePrice : 0,
    stock: Number(pick(dto, 'stockQuantity', 'stock_quantity', 'stock', 'quantity')) || 0,
    coverImage: pick(dto, 'coverImage', 'cover_image') || '',
    description: pick(dto, 'description') || '',
    pageCount: Number(pick(dto, 'pageCount', 'page_count')) || null,
    tableOfContents: pick(dto, 'tableOfContents', 'table_of_contents') || '',
    previewContent: pick(dto, 'previewContent', 'preview_content') || '',
    previewPageCount: Number(pick(dto, 'previewPageCount', 'preview_page_count')) || null,
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
