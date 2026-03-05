import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPassword } from '../services/authService';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
});

type FormData = z.infer<typeof schema>;

export function useResetPasswordViewModel() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const handleReset = form.handleSubmit(async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await resetPassword(data);
      setSent(true);
    } catch {
      setErrorMessage('Não foi possível enviar o e-mail. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  });

  return { form, handleReset, isLoading, sent, errorMessage };
}
