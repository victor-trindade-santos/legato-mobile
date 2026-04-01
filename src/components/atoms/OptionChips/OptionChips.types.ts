export interface OptionChipsOption {
  label: string;
  value: string;
}

export interface OptionChipsProps {
  options: OptionChipsOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  label?: string;
}
