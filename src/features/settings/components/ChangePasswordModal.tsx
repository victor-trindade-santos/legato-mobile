import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { ModalTemplate } from '@/components/templates/ModalTemplate/ModalTemplate';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Button } from '@/components/atoms/Button/Button';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing } from '@/theme';
import { useColors } from '@/hooks/useColors';
import { requestPasswordReset } from '@/features/auth/services/authService';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
});

type FormData = z.infer<typeof schema>;

interface ChangePasswordModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
}

export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const colors = useColors();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const handleClose = () => {
    reset();
    setErrorMessage(null);
    setSuccess(false);
    onClose();
  };

  const handleSend = handleSubmit(async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await requestPasswordReset(data);
      setSuccess(true);
    } catch {
      setErrorMessage('Não foi possível enviar o e-mail. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <ModalTemplate visible={visible} onClose={handleClose}>
      {success ? (
        <View style={styles.successContainer}>
          <Ionicons name="mail-outline" size={56} color={Colors.primary} />
          <LegatoText variant="sectionTitle" color={colors.textPrimary} align="center">
            E-mail enviado!
          </LegatoText>
          <LegatoText variant="bodySmall" color={colors.textSecondary} align="center">
            Verifique sua caixa de entrada e clique no link para criar uma nova senha.
          </LegatoText>
          <Button
            label="Fechar"
            variant="primary"
            size="md"
            fullWidth
            onPress={handleClose}
            style={styles.btn}
          />
        </View>
      ) : (
        <View style={styles.container}>
          <LegatoText variant="subtitle" color={colors.textPrimary}>
            Alterar senha
          </LegatoText>
          <LegatoText variant="bodySmall" color={colors.textSecondary} style={styles.description}>
            Para redefinir sua senha, confirme seu e-mail abaixo. Enviaremos um link seguro para você.
          </LegatoText>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <FormField
                label="E-mail"
                placeholder="Confirme seu e-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                errorMessage={errors.email?.message}
              />
            )}
          />

          {!!errorMessage && (
            <LegatoText variant="caption" color={Colors.error} style={styles.errorMsg}>
              {errorMessage}
            </LegatoText>
          )}

          <View style={styles.buttons}>
            <Button
              label="Cancelar"
              variant="outline_gray"
              size="md"
              style={styles.cancelBtn}
              onPress={handleClose}
            />
            <Button
              label="Alterar"
              variant="primary"
              size="md"
              style={styles.submitBtn}
              isLoading={isLoading}
              onPress={handleSend}
            />
          </View>
        </View>
      )}
    </ModalTemplate>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  description: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  errorMsg: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  cancelBtn: {
    flex: 1,
  },
  submitBtn: {
    flex: 1,
  },
  successContainer: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  btn: {
    marginTop: Spacing.sm,
    width: '100%',
  },
});
