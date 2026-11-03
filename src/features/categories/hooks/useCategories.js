import { useCollection } from '@/shared/hooks/useCollection';
import { categoryService } from '../services/categoryService';

export function useCategories() {
  const state = useCollection(categoryService.getCategories);
  return { ...state, categories: state.items };
}
