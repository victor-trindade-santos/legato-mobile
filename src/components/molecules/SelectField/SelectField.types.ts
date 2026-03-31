export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  errorMessage?: string;
  variant?: 'light' | 'dark';
}
