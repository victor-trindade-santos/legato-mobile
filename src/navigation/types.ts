/**
 * LEGATO — Navigation Types
 * Tipagem completa das rotas para TypeScript.
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ResetPassword: undefined;
};

export type MainTabParamList = {
  Discovery: undefined;
  ChatTab: NavigatorScreenParams<ChatStackParamList> | undefined;
  Feed: undefined;
  Collaborations: undefined;
  Notifications: undefined;
  Profile: { musicianId?: number; displayName?: string; username?: string };
};

export type ProfileStackParamList = {
  ProfileMain: { username?: string };
  Albums: { userId: number };
  AlbumDetail: { albumId: number };
  Tracks: { userId: number };
};

export type ChatStackParamList = {
  ChatList: undefined;
  Chat: {
    conversationId: number;
    userName: string;
    avatarUri?: string;
    receiverId: number;
  }
};

export type MusicianProfileRouteParams = {
  musicianId: number;
  displayName?: string;
  username?: string;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  OnboardingEdit: undefined;
  ProfileEdit: undefined;
  Settings: undefined;
  MusicianProfile: MusicianProfileRouteParams;
};
