export interface RangeSliderProps {
  /** Valor absoluto mínimo do intervalo */
  min: number;
  /** Valor absoluto máximo do intervalo */
  max: number;
  /** Limite inferior selecionado atualmente */
  minValue: number;
  /** Limite superior selecionado atualmente */
  maxValue: number;
  /** Callback ao mover o thumb esquerdo */
  onMinChange: (value: number) => void;
  /** Callback ao mover o thumb direito */
  onMaxChange: (value: number) => void;
  /** Incremento mínimo entre steps — default: 1 */
  step?: number;
  /** Rótulo exibido acima do slider (ex: "Idade") */
  label: string;
  /** Sufixo exibido nos valores (ex: "anos", "km") */
  unit?: string;
}
