import type { StyleProp, ViewStyle } from 'react-native';

export interface TabItem {
  key: string;
  label: string;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  style?: StyleProp<ViewStyle>;
}
