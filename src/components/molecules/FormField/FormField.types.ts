import { InputProps } from '@/components/atoms/Input/Input.types';

export interface FormFieldProps extends InputProps {
  label: string;
  errorMessage?: string;
  isRequired?: boolean;
}
