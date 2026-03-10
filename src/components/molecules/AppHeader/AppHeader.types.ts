export interface AppHeaderProps {
  /**
   * Substitui o logo "Legato" por um título textual.
   * Útil para sub-telas (ex: "Notificações", "Configurações").
   */
  title?: string;

  /** Oculta o ícone de busca. Default: false */
  hideSearch?: boolean;

  /** Oculta o ícone de notificações. Default: false */
  hideNotifications?: boolean;

  /** Oculta o ícone de configurações. Default: false */
  hideSettings?: boolean;

  /** Callback extra ao pressionar busca (além da navegação padrão) */
  onSearchPress?: () => void;

  /** Callback extra ao pressionar configurações (além da navegação padrão) */
  onSettingsPress?: () => void;
}
