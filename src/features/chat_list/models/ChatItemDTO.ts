export interface ChatItemDTO {
    id: string;
    otherUserId: number;
    otherUserName: string;
    otherUserProfilePictureUrl?: string;
    lastMessageContent: string;
    lastMessageTimestamp: string;
}