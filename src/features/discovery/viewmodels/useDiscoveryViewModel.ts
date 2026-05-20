import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchMusicians, likeMusician, dislikeMusician } from '../services/discoveryService';
import type { Musician } from '../models/Musician';
import type { DiscoveryFilters } from '../models/DiscoveryFilters';
import { DEFAULT_FILTERS } from '../models/DiscoveryFilters';

const PAGE_SIZE = 20;

type SwipeHistoryEntry = { musician: Musician; direction: 'like' | 'dislike' };

export function useDiscoveryViewModel() {
  const [filters, setFilters] = useState<DiscoveryFilters>(DEFAULT_FILTERS);
  const [cards, setCards] = useState<Musician[]>([]);
  const [history, setHistory] = useState<SwipeHistoryEntry[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [matchedMusician, setMatchedMusician] = useState<Musician | null>(null);
  const [matchConversationId, setMatchConversationId] = useState<number | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  // IDs já exibidos — usado apenas para detectar duplicatas do backend nos logs
  const seenIdsRef = useRef<Set<number>>(new Set());
  const isFetchingMoreRef = useRef(false);
  const isResettingRef = useRef(false);
  const hasLoadedOnceRef = useRef(false);
  const hasExhaustedAllRef = useRef(false);

  // ── Carga inicial ─────────────────────────────────────────────────────────────

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['musicians', filters],
    queryFn: () => fetchMusicians(filters),
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (data) {
      hasLoadedOnceRef.current = true;
      data.forEach(m => seenIdsRef.current.add(m.id));
      setHasMore(data.length >= PAGE_SIZE);
      setCards(data);
    }
  }, [data]);

  // ── Reset quando todos os usuários foram vistos ───────────────────────────────

  const resetAndRefresh = useCallback(async () => {
    if (isResettingRef.current) return;
    isResettingRef.current = true;
    setIsResetting(true);
    seenIdsRef.current = new Set();
    setCards([]);
    try {
      const newData = await fetchMusicians(filters);
      if (newData.length === 0) {
        hasExhaustedAllRef.current = true;
        setHasMore(false);
      } else {
        newData.forEach(m => seenIdsRef.current.add(m.id));
        setHasMore(newData.length >= PAGE_SIZE);
        setCards(newData);
      }
    } catch (err) {
      hasExhaustedAllRef.current = true;
      setHasMore(false);
    } finally {
      isResettingRef.current = false;
      setIsResetting(false);
    }
  }, [filters]);

  useEffect(() => {
    if (
      hasLoadedOnceRef.current &&
      !hasExhaustedAllRef.current &&
      !isLoading &&
      !isFetchingMoreRef.current &&
      !hasMore &&
      cards.length === 0 &&
      !isResettingRef.current
    ) {
      resetAndRefresh();
    }
  }, [cards.length, isLoading, hasMore, resetAndRefresh]);


  // ── Fetch do próximo lote (só quando a fila zera) ─────────────────────────────

  const fetchMore = useCallback(async () => {
    if (isFetchingMoreRef.current) return;
    isFetchingMoreRef.current = true;
    setIsFetchingMore(true);
    try {
      const newData = await fetchMusicians(filters);
      if (newData.length === 0) {
        setHasMore(false);
      } else {
        newData.forEach(m => seenIdsRef.current.add(m.id));
        setHasMore(newData.length >= PAGE_SIZE);
        setCards(prev => [...prev, ...newData]);
      }
    } catch (err) {
      // silently handled — UI already shows empty state
    } finally {
      isFetchingMoreRef.current = false;
      setIsFetchingMore(false);
    }
  }, [filters]);

  // Dispara fetchMore quando a fila zera e ainda há cards no servidor
  useEffect(() => {
    if (!hasLoadedOnceRef.current || isLoading || !hasMore || isFetchingMoreRef.current || isResettingRef.current) return;
    if (cards.length === 0) {
      fetchMore();
    }
  }, [cards.length, isLoading, hasMore, fetchMore]);

  // ── Mutations ─────────────────────────────────────────────────────────────────

  const likeMutation = useMutation({
    mutationFn: (musicianId: number) => likeMusician(musicianId),
    onSuccess: (result, musicianId) => {
      if (result.match) {
        const musician = cards.find(c => c.id === musicianId);
        if (musician) setMatchedMusician(musician);
        setMatchConversationId(result.conversationId);
      }
    },
  });

  const dislikeMutation = useMutation({
    mutationFn: (musicianId: number) => dislikeMusician(musicianId),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleSwipe = useCallback((musician: Musician, direction: 'like' | 'dislike') => {
    setHistory(prev => [...prev, { musician, direction }]);
    setCards(prev => prev.filter(c => c.id !== musician.id));
    if (direction === 'like') {
      likeMutation.mutate(musician.id);
    } else {
      dislikeMutation.mutate(musician.id);
    }
  }, [likeMutation, dislikeMutation]);

  const handleUndo = useCallback(() => {
    const lastEntry = history[history.length - 1];
    if (!lastEntry) return;
    setHistory(prev => prev.slice(0, -1));
    setCards(prev => [lastEntry.musician, ...prev]);
  }, [history]);

  const handleApplyFilters = useCallback((newFilters: DiscoveryFilters) => {
    seenIdsRef.current = new Set();
    hasExhaustedAllRef.current = false;
    setHasMore(true);
    setCards([]);
    setFilters(newFilters);
    setIsFilterModalOpen(false);
  }, []);

  const handleResetFilters = useCallback(() => {
    seenIdsRef.current = new Set();
    hasExhaustedAllRef.current = false;
    setHasMore(true);
    setCards([]);
    setFilters(DEFAULT_FILTERS);
  }, []);

  const dismissMatch = useCallback(() => {
    setMatchedMusician(null);
    setMatchConversationId(null);
  }, []);

  return {
    cards,
    history,
    isLoading: isLoading || isResetting,
    isFetchingMore,
    hasMore,
    filters,
    isFilterModalOpen,
    isHistoryModalOpen,
    matchedMusician,
    matchConversationId,
    handleSwipe,
    handleUndo,
    handleApplyFilters,
    handleResetFilters,
    dismissMatch,
    setIsFilterModalOpen,
    setIsHistoryModalOpen,
    setMatchedMusician,
    refetch,
  };
}
