export type MessageDeliveryStatus =
  | 'sending'     // reloginho
  | 'sent'        // 1 check
  | 'delivered'   // 2 checks
  | 'read';       // 2 checks azul (ou cor de destaque)

export interface UnreadMessagesBadgeProps {
  status: MessageDeliveryStatus;
}