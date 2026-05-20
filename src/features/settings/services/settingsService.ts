import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';

export async function deleteAccount(email: string): Promise<void> {
  await api.delete(Endpoints.users.delete(email));
}
