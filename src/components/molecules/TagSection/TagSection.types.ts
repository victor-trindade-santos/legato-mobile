export interface TagSectionProps {
  /** Título da seção (ex: "Habilidades", "Gêneros Musicais") */
  label: string;
  /** Itens atualmente selecionados */
  selected: string[];
  /** Chamado ao pressionar uma tag — normalmente remove o item */
  onRemove: (item: string) => void;
  /** Abre o seletor de itens (TagSelectorModal ou similar) */
  onAdd: () => void;
  /** Variante visual das tags — default: 'filled' */
  tagVariant?: 'filled' | 'outline';
  /** Cor das tags — default: Colors.primary */
  tagColor?: string;
  /** Mensagem quando não há itens selecionados */
  emptyMessage?: string;
}
