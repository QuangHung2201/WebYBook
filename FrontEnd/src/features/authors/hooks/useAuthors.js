import { useCollection } from '@/shared/hooks/useCollection';
import { authorService } from '../services/authorService';

export function useAuthors() {
  const state = useCollection(authorService.getAuthors);
  return { ...state, authors: state.items };
}
