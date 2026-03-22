export interface SearchInputProps {
    /**
     * Molecule de barra de pesquisa com possibilidade de inserção de texto
     * para busca de infomação
     */

    /** Indica que o campo é obrigatório (exibe asterisco) */
    isRequired?: boolean;
    /** Estilos customizados para o componente */
    style?: object;
    /** Callback extra ao pressionar o ícone de busca */
    onSearchPress?: () => void;
    /** Placeholder do campo de busca */
    placeholder?: string;
    /** Valor do campo de busca */
    value?: string;
    /** Callback para mudança de texto */
    onChangeText?: (text: string) => void;
}