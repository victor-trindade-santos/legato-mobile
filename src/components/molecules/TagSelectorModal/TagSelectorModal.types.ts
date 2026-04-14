export interface TagSelectorModalProps {
  visible: boolean;
  title: string;
  items: readonly string[];
  selected: string[];
  onConfirm: (selected: string[]) => void;
  onClose: () => void;
  getItemLabel?: (item: string) => string;
}
