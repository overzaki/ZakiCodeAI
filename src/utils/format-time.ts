import {
  format,
  formatDistanceToNow,
  getTime,
  isValid,
  Locale,
  parseISO,
} from 'date-fns';
import { arEG, enUS } from 'date-fns/locale';

// ----------------------------------------------------------------------

type InputValue = Date | string | number | null | undefined;

export function fDate(
  date: InputValue,
  newFormat?: string,
  isArabic?: boolean,
) {
  const fm = newFormat || 'dd MMM yyyy';

  try {
    if (typeof date === 'string') {
      const parsedDate = parseISO(date);
      return isValid(parsedDate) ? format(parsedDate, fm) : '';
    } else if (date instanceof Date || typeof date === 'number') {
      const parsedDate = new Date(date);
      return isValid(parsedDate)
        ? format(parsedDate, fm, { locale: isArabic ? arEG : enUS })
        : '';
    }
  } catch {
    return '';
  }

  return '';
}

export function fDateTime(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}

export function fWeekdayToLocale(weekday: string, locale: string) {
  // Create a date object for the first day of the week (Sunday)
  let date = new Date('2022-01-02');

  // Calculate the number of days to add to get to the desired weekday
  let daysToAdd = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  }[weekday.toLowerCase()];

  // Add the calculated number of days to the date
  date.setDate(date.getDate() + (daysToAdd || 0));

  // Use the Intl.DateTimeFormat API to format the date in Arabic
  let arabicWeekday = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
  }).format(date);

  return arabicWeekday;
}

export function convertTo12HourFormat(time24: string) {
  const [hours, minutes] = time24.split(':').map(Number);

  // Create a new Date object
  const date = new Date();
  date.setHours(hours, minutes);

  // Format the time
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}

export function fTimestamp(date: InputValue) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date: InputValue, locale?: Locale) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: locale,
      })
    : '';
}
