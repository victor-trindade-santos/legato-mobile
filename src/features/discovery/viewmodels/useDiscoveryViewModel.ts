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

  const { isLoading, data, refetch, isError, error } = useQuery({
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
      const duplicates = data.filter(m => seenIdsRef.current.has(m.id));
      if (duplicates.length > 0) {
        console.warn('[Discovery] ⚠️ Carga inicial — backend retornou IDs já vistos:', duplicates.map(m => `${m.id}(${m.displayName})`).join(', '));
      }
      data.forEach(m => seenIdsRef.current.add(m.id));
      setHasMore(data.length >= PAGE_SIZE);
      console.log(`[Discovery] Carga inicial — ${data.length} cards: ${data.map(m => `${m.id}(${m.displayName})`).join(' | ')}`);
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
      console.log('[Discovery] Reiniciando busca — todos os usuários foram avaliados...');
      const newData = await fetchMusicians(filters);
      if (newData.length === 0) {
        console.log('[Discovery] Nenhum músico disponível após reinício.');
        hasExhaustedAllRef.current = true;
        setHasMore(false);
      } else {
        console.log(`[Discovery] Reinício — ${newData.length} cards: ${newData.map(m => `${m.id}(${m.displayName})`).join(' | ')}`);
        newData.forEach(m => seenIdsRef.current.add(m.id));
        setHasMore(newData.length >= PAGE_SIZE);
        setCards(newData);
      }
    } catch (err) {
      console.error('[Discovery] resetAndRefresh falhou:', err);
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

  useEffect(() => {
    if (isError) console.error('[Discovery] fetchMusicians falhou:', error);
  }, [isError, error]);

  // ── Fetch do próximo lote (só quando a fila zera) ─────────────────────────────

  const fetchMore = useCallback(async () => {
    if (isFetchingMoreRef.current) return;
    isFetchingMoreRef.current = true;
    setIsFetchingMore(true);
    console.log('[Discovery] Fila zerou — buscando próximo lote...');
    try {
      const newData = await fetchMusicians(filters);
      const duplicates = newData.filter(m => seenIdsRef.current.has(m.id));
      if (duplicates.length > 0) {
        console.warn('[Discovery] ⚠️ Backend retornou IDs já vistos no fetchMore:', duplicates.map(m => `${m.id}(${m.displayName})`).join(', '));
      }
      if (newData.length === 0) {
        console.log('[Discovery] Backend não retornou novos cards (fila global esgotada).');
        setHasMore(false);
      } else {
        console.log(`[Discovery] Novo lote — ${newData.length} cards: ${newData.map(m => `${m.id}(${m.displayName})`).join(' | ')}`);
        newData.forEach(m => seenIdsRef.current.add(m.id));
        setHasMore(newData.length >= PAGE_SIZE);
        // Usa atualização funcional para preservar qualquer card restaurado via undo durante o fetch
        setCards(prev => [...prev, ...newData]);
      }
    } catch (err) {
      console.error('[Discovery] fetchMore falhou:', err);
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
    console.log(`[Discovery] ${direction === 'like' ? 'Like ❤️ ' : 'Dislike ✗ '} → ID ${musician.id} (${musician.displayName})`);
    setHistory(prev => [...prev, { musician, direction }]);
    setCards(prev => {
      const next = prev.filter(c => c.id !== musician.id);
      console.log(`[Discovery] Fila: ${next.length} card(s) restante(s)`);
      return next;
    });
    if (direction === 'like') {
      likeMutation.mutate(musician.id);
    } else {
      dislikeMutation.mutate(musician.id);
    }
  }, [likeMutation, dislikeMutation]);

  const handleUndo = useCallback(() => {
    const lastEntry = history[history.length - 1];
    if (!lastEntry) return;
    console.log(`[Discovery] Undo → ID ${lastEntry.musician.id} (${lastEntry.musician.displayName}) restaurado | ação desfeita: ${lastEntry.direction}`);
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
