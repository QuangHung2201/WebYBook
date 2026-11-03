import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/app/providers/ToastProvider';
import { bookService } from '@/features/books/services/bookService';
import { authorService } from '@/features/authors/services/authorService';
import { categoryService } from '@/features/categories/services/categoryService';
import { publisherService } from '@/features/publishers/services/publisherService';

const DEFAULT_PARAMS = {
  page: 1,
  pageSize: 10,
  sort: 'newest',
  keyword: '',
  categoryId: '',
  status: '',
};

export function useAdminBooks() {
  const toast = useToast();
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [lookups, setLookups] = useState({ authors: [], categories: [], publishers: [] });

  useEffect(() => {
    let active = true;
    Promise.all([
      authorService.getAuthors(),
      categoryService.getCategories(),
      publisherService.getPublishers(),
    ])
      .then(([authors, categories, publishers]) => {
        if (active) setLookups({ authors, categories, publishers });
      })
      .catch(() => {
        // Lookups are non-critical; the list still renders without them.
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    bookService
      .getBooks(params)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Không thể tải danh sách sách.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params, reloadKey]);

  const updateParams = useCallback((patch) => {
    setParams((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setParams((current) => ({ ...current, page }));
  }, []);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  const enrich = useCallback(
    (values) => {
      const author = lookups.authors.find((item) => String(item.id) === String(values.authorId));
      const category = lookups.categories.find(
        (item) => String(item.id) === String(values.categoryId),
      );
      const publisher = lookups.publishers.find(
        (item) => String(item.id) === String(values.publisherId),
      );
      return {
        ...values,
        authorName: author?.name || '',
        categoryName: category?.name || '',
        publisherName: publisher?.name || '',
      };
    },
    [lookups],
  );

  const createBook = useCallback(
    async (values) => {
      setSaving(true);
      try {
        await bookService.createBook(enrich(values));
        toast.success('Đã thêm sách mới.');
        refresh();
        return true;
      } catch (err) {
        toast.error(err.message || 'Không thể thêm sách.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [enrich, refresh, toast],
  );

  const updateBook = useCallback(
    async (id, values) => {
      setSaving(true);
      try {
        await bookService.updateBook(id, enrich(values));
        toast.success('Đã cập nhật thông tin sách.');
        refresh();
        return true;
      } catch (err) {
        toast.error(err.message || 'Không thể cập nhật sách.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [enrich, refresh, toast],
  );

  const deleteBook = useCallback(
    async (id) => {
      setSaving(true);
      try {
        await bookService.deleteBook(id);
        toast.success('Đã xóa sách khỏi hệ thống.');
        refresh();
        return true;
      } catch (err) {
        toast.error(err.message || 'Không thể xóa sách.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [refresh, toast],
  );

  const categoryOptions = useMemo(
    () => lookups.categories.map((item) => ({ value: String(item.id), label: item.name })),
    [lookups.categories],
  );

  return {
    books: data.items,
    total: data.total,
    page: data.page,
    totalPages: data.totalPages,
    params,
    loading,
    saving,
    error,
    lookups,
    categoryOptions,
    updateParams,
    setPage,
    refresh,
    createBook,
    updateBook,
    deleteBook,
  };
}
