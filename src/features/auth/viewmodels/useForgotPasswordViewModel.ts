import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { requestPasswordReset } from '../services/authService';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
});

type FormData = z.infer<typeof schema>;

export function useForgotPasswordViewModel() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const handleSend = form.handleSubmit(async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await requestPasswordReset(data);
      setSuccessMessage('Enviamos o e-mail de recuperação. Verifique sua caixa de entrada e clique no link para redefinir a senha.');
    } catch {
      setErrorMessage('Não foi possível enviar o e-mail. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  });

  return { form, handleSend, isLoading, successMessage, errorMessage };
}