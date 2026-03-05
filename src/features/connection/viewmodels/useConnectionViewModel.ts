/**
 * useConnectionViewModel — ViewModel (Conexão)
 * Gerencia as conexões aceitas e pedidos pendentes.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConnections, getPendingConnections, acceptConnection, declineConnection } from '../services/connectionService';

export function useConnectionViewModel() {
  const queryClient = useQueryClient();

  const { data: connections = [], isLoading: loadingConnections } = useQuery({
    queryKey: ['connections'],
    queryFn: getConnections,
  });

  const { data: pendingConnections = [], isLoading: loadingPending } = useQuery({
    queryKey: ['connections', 'pending'],
    queryFn: getPendingConnections,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: declineConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  return {
    connections,
    pendingConnections,
    isLoading: loadingConnections || loadingPending,
    acceptConnection: (id: number) => acceptMutation.mutate(id),
    declineConnection: (id: number) => declineMutation.mutate(id),
  };
}
