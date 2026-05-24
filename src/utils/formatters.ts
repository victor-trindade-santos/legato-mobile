/** Formatadores de dados — exibição na UI */

const pad = (n: number) => String(n).padStart(2, '0');

const isToday = (date: Date): boolean => {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  );
};

/**
 * Formata o lastSeen para exibição após "Visto por último ".
 * Exemplos: "há pouco", "há 5min", "às 16:26", "ontem às 16:26", "em 24/05"
 */
export const formatLastSeen = (isoString: string | null | undefined): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  if (diffMin < 1) return 'há pouco';
  if (diffMin < 60) return `há ${diffMin}min`;
  if (isToday(date)) return `às ${timeStr}`;
  if (isYesterday(date)) return `ontem às ${timeStr}`;

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const currentYear = now.getFullYear();
  return year !== currentYear
    ? `em ${day}/${month}/${year}`
    : `em ${day}/${month}`;
};

/**
 * Formata o timestamp do último item da lista de chats.
 * Exemplos: "16:26", "ontem", "24/05"
 */
export const formatChatTimestamp = (isoString: string | null | undefined): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  if (isToday(date)) return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  if (isYesterday(date)) return 'ontem';

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  return `${day}/${month}`;
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'agora';
  if (diffMin < 60) return `${diffMin}min`;
  if (diffHour < 24) return `${diffHour}h`;
  if (diffDay < 7) return `${diffDay}d`;
  return date.toLocaleDateString('pt-BR');
};

export const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
