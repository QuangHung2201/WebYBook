import { useCollection } from '@/shared/hooks/useCollection';
import { publisherService } from '../services/publisherService';

export function usePublishers() {
  const state = useCollection(publisherService.getPublishers);
  return { ...state, publishers: state.items };
}
