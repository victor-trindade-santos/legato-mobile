/**
 * LEGATO — Navigation Types
 * Tipagem completa das rotas para TypeScript.
 */

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ResetPassword: undefined;
};

export type MainTabParamList = {
  Discovery: undefined;
  Feed: undefined;
  Collaborations: undefined;
  Notifications: undefined;
  Profile: { musicianId?: number; displayName?: string };
};

export type ProfileStackParamList = {
  ProfileMain: { username?: string };
  Albums: { userId: number };
  AlbumDetail: { albumId: number };
  Tracks: { userId: number };
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatConversation: { conversationId: number; userName: string };
};

export type MusicianProfileRouteParams = {
  musicianId: number;
  displayName?: string;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProfileEdit: undefined;
  MusicianProfile: MusicianProfileRouteParams;
};
