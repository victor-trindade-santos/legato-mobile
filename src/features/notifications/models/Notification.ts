/**
 * Notification.ts — Model (Notificações)
 * ══════════════════════════════════════════════════
 * CAMADA: Model (MVVM)
 *
 * Responsabilidade:
 * - Definir o contrato de dados da feature (interfaces TypeScript)
 * - Mapear exatamente o que a API retorna
 * - Sem lógica, sem chamadas de API — apenas tipos
 *
 * ──────────────────────────────────────────────────
 * CONVENÇÃO DO PROJETO:
 * - Use `type` para unions simples (NotificationType)
 * - Use `interface` para objetos com múltiplas propriedades (Notification)
 * - Campos opcionais (?) = podem vir como null/undefined da API
 * ──────────────────────────────────────────────────
 */

/**
 * Tipos de notificação suportados pelo sistema.
 * Correspondem aos valores que o backend (Spring Boot) envia no campo `type`.
 */
export type NotificationType =
  | 'follow'      // alguém seguiu o usuário
  | 'comment'     // alguém comentou em um post
  | 'connection'  // alguém enviou pedido de conexão
  | 'like'        // alguém curtiu um post
  | 'mention';    // alguém mencionou o usuário

/**
 * Representa uma notificação retornada pela API.
 * Espelho do DTO do backend: NotificationResponseDTO.java
 */
export interface Notification {
  id: number;
  type: NotificationType;

  /** Username de quem gerou a notificação */
  userName: string;

  /** URL do avatar do usuário que gerou a ação (pode ser null no backend) */
  userAvatar?: string;

  /** Texto descritivo gerado pelo backend (ex: "curtiu sua publicação") */
  text: string;

  /** Link de navegação opcional (ex: '/posts/42') */
  link?: string;

  /** false = não lida (exibe fundo roxo + ponto indicador) */
  read: boolean;

  /** Tempo relativo já formatado pelo backend (ex: "há 2 horas") */
  time: string;

  /** ISO 8601 completo — usar para ordenação se necessário */
  createdAt?: string;
}
