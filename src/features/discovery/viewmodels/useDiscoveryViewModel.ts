/**
 * useDiscoveryViewModel — ViewModel (Descoberta)
 *
 * Responsável por:
 * - Carregar e filtrar a lista de músicos
 * - Gerenciar o histórico de swipes (para desfazer)
 * - Expor handlers de like/dislike para o DiscoveryStack
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchMusicians, sendSwipe } from '../services/discoveryService';
import type { Musician } from '../models/Musician';
import type { DiscoveryFilters } from '../models/DiscoveryFilters';
import { DEFAULT_FILTERS } from '../models/DiscoveryFilters';

type SwipeHistoryEntry = { musician: Musician; direction: 'like' | 'dislike' };

export function useDiscoveryViewModel() {
  const [filters, setFilters] = useState<DiscoveryFilters>(DEFAULT_FILTERS);
  const [cards, setCards] = useState<Musician[]>([]);
  const [history, setHistory] = useState<SwipeHistoryEntry[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [matchedMusician, setMatchedMusician] = useState<Musician | null>(null);

  // TanStack Query v5: onSuccess removido de useQuery — usar useEffect
  const { isLoading, data, refetch } = useQuery({
    queryKey: ['musicians', filters],
    queryFn: () => fetchMusicians(filters),
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (data) setCards(data);
  }, [data]);

  // Mutation de swipe (onSuccess ainda disponível em useMutation no v5)
  const swipeMutation = useMutation({
    mutationFn: ({ musicianId, direction }: { musicianId: number; direction: 'like' | 'dislike' }) =>
      sendSwipe(musicianId, direction),
    onSuccess: (data, variables) => {
      if (data.match) {
        const musician = cards.find(c => c.id === variables.musicianId);
        if (musician) setMatchedMusician(musician);
      }
    },
  });

  const handleSwipe = useCallback((musician: Musician, direction: 'like' | 'dislike') => {
    setHistory(prev => [...prev, { musician, direction }]);
    setCards(prev => prev.filter(c => c.id !== musician.id));
    swipeMutation.mutate({ musicianId: musician.id, direction });
  }, [cards]);

  const handleUndo = useCallback(() => {
    const lastEntry = history[history.length - 1];
    if (!lastEntry) return;
    setHistory(prev => prev.slice(0, -1));
    setCards(prev => [lastEntry.musician, ...prev]);
  }, [history]);

  const handleApplyFilters = useCallback((newFilters: DiscoveryFilters) => {
    setFilters(newFilters);
    setIsFilterModalOpen(false);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    cards,
    history,
    isLoading,
    filters,
    isFilterModalOpen,
    isHistoryModalOpen,
    matchedMusician,
    handleSwipe,
    handleUndo,
    handleApplyFilters,
    handleResetFilters,
    setIsFilterModalOpen,
    setIsHistoryModalOpen,
    setMatchedMusician,
    refetch,
  };
}
