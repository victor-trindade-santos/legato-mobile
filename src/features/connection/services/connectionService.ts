import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';
import type { Connection } from '../models/Connection';

export async function getConnections(): Promise<Connection[]> {
  const res = await api.get<Connection[]>(Endpoints.connections.list);
  return res.data;
}

export async function getPendingConnections(): Promise<Connection[]> {
  const res = await api.get<Connection[]>(Endpoints.connections.pending);
  return res.data;
}

export async function acceptConnection(id: number): Promise<void> {
  await api.post(Endpoints.connections.accept(id));
}

export async function declineConnection(id: number): Promise<void> {
  await api.post(Endpoints.connections.decline(id));
}
