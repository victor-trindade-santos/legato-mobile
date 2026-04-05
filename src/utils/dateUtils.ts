export function formatTimestamp(timestamp: string): string {
    // Entrada esperada: "DD/MM/YYYY HH:MM"
    const [datePart, timePart] = timestamp.split(' ');
    return `${timePart}`; // Retorna apenas "HH:MM"
}

export function extractDateLabel(timestamp: string): string {
    // Usado em DaySeparator
    // Retorna a data formatada como "DD/MM/YYYY"
    // para mensagens de hoje, retorna "Hoje"
    // para mensagens de ontem, retorna "Ontem"
    const [datePart] = timestamp.split(' ');
    const [day, month, year] = datePart.split('/');

    const date = new Date(Number(year), Number(month) - 1, Number(day));
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
    return datePart; // Retorna "DD/MM/YYYY" para outras datas
}

export function extractDateKey(timestamp: string): string {
    return timestamp.split(' ')[0]; // Retorna apenas a parte da data "DD/MM/YYYY"
}

/**
 * Formata a data atual no formato que o backend retorna: "DD/MM/YYYY HH:MM"
 * Usado para mensagens locais criadas antes da confirmação do servidor.
 */
export function formatNowToBackendFormat(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}