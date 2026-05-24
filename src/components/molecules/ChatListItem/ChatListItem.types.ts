export interface ChatListItemProps {
    /**
     * Objeto representando as informações do chat a ser exibido.
     * Deve conter:
     * - userAvatar: URL da imagem do avatar do contato
     * - userName: Nome do contato
     * - lastMessage: Texto da última mensagem trocada
     * - timeStamp: Data/hora da última mensagem (ex: "2h", "Ontem", "12/03/2024")
    */

    userAvatar: string;
    userName: string;
    lastMessage: string;
    timeStamp: string;
    isOnline?: boolean;

    onPress: () => void;
}