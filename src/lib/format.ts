const WEEKDAYS_SHORT = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

export function weekdayShort(date: Date): string {
  return WEEKDAYS_SHORT[date.getDay()];
}

export function formatMealTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return `Сегодня ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Вчера ${time}`;
  return `${date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} ${time}`;
}

export function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export function formatSum(value: number): string {
  return `${value.toLocaleString('ru-RU').replace(/,/g, ' ')} сум`;
}
