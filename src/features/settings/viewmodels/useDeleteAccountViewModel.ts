import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loginUser } from '@/features/auth/services/authService';
import { useAuthStore } from '@/store/authStore';
import { deleteAccount } from '../services/settingsService';
import type { DeleteAccountCredentialsDTO } from '../models/DeleteAccountDTO';

export type DeleteAccountStep = 'credentials' | 'confirm' | 'success';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type FormData = z.infer<typeof schema>;

interface UseDeleteAccountViewModelProps {
  onClose: () => void;
  onDeleteSuccess: () => void;
}

export function useDeleteAccountViewModel({ onClose, onDeleteSuccess }: UseDeleteAccountViewModelProps) {
  const loggedEmail = useAuthStore((s) => s.user?.email ?? '');
  const [step, setStep] = useState<DeleteAccountStep>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validatedEmail, setValidatedEmail] = useState<string>('');

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const handleClose = () => {
    reset();
    setStep('credentials');
    setErrorMessage(null);
    setValidatedEmail('');
    onClose();
  };

  const handleBack = () => {
    setErrorMessage(null);
    setStep('credentials');
  };

  const handleVerifyCredentials = handleSubmit(async (data: DeleteAccountCredentialsDTO) => {
    if (data.email.toLowerCase() !== loggedEmail.toLowerCase()) {
      setErrorMessage('O e-mail informado não corresponde ao da conta logada.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginUser({ email: data.email, password: data.password });
      setValidatedEmail(data.email);
      setStep('confirm');
    } catch {
      setErrorMessage('E-mail ou senha incorretos. Verifique e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  });

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await deleteAccount(validatedEmail);
      setStep('success');
      setTimeout(() => {
        onDeleteSuccess();
      }, 1500);
    } catch {
      setErrorMessage('Não foi possível excluir a conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step,
    control,
    errors,
    isLoading,
    errorMessage,
    handleVerifyCredentials,
    handleConfirmDelete,
    handleBack,
    handleClose,
  };
}
