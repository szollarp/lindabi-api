import { format } from 'date-fns';

type InputValue = string | number | null;

type DateInputValue = Date | string | number | null | undefined;

export const fCurrency = (inputValue: InputValue, maximumFractionDigits: number = 2, currency: string = "HUF"): string => {
  if (!inputValue) {
    inputValue = 0;
  }

  const number = Number(inputValue);

  const fm = new Intl.NumberFormat("hu-HU", {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits
  }).format(number);

  return fm;
}

export const fPercent = (inputValue: InputValue): string => {
  if (!inputValue) return '';

  const number = Number(inputValue) / 100;

  const fm = new Intl.NumberFormat("hu-HU", {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(number);

  return fm;
}

export function fDate(date: DateInputValue, newFormat?: string): string {
  const fm = newFormat || 'yyyy.MM.dd';

  return date ? format(new Date(date), fm) : '-';
}

export function fString(input: string): string {
  const normalized = input.trim().toLowerCase();
  return normalized.replace(/[^a-z0-9]/g, '');
};