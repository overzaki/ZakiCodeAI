import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Extend Day.js with the plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// List of common date formats
const commonFormats: string[] = [
  'DD/MM/YYYY, H:mm', // 24-hour format
  'DD/MM/YYYY, h:mm A', // 12-hour format
  'MM/DD/YYYY, h:mm A',
  'YYYY-MM-DDTHH:mm:ssZ',
  'YYYY-MM-DDTHH:mm:ss.SSSZ',
  'YYYY-MM-DD HH:mm:ss',
  'YYYY-MM-DDTHH:mm:ss',
  'YYYY-MM-DD HH:mm',
  'YYYY-MM-DD',
  'DD-MM-YYYY HH:mm:ss',
  'DD-MM-YYYY HH:mm',
  'DD-MM-YYYY',
  'HH:mm',
  'HH:mm A',
  'hh:mm A'
];

type DateFormat =
    | 'DD/MM/YYYY, H:mm'
    | 'DD/MM/YYYY, h:mm A'
    | 'MM/DD/YYYY, h:mm A'
    | 'YYYY-MM-DDTHH:mm:ssZ'
    | 'YYYY-MM-DDTHH:mm:ss.SSSZ'
    | 'YYYY-MM-DD HH:mm:ss'
    | 'YYYY-MM-DDTHH:mm:ss'
    | 'YYYY-MM-DD HH:mm'
    | 'YYYY-MM-DD'
    | 'DD-MM-YYYY HH:mm:ss'
    | 'DD-MM-YYYY HH:mm'
    | 'DD-MM-YYYY'
    | 'HH:mm'
    | 'h:mm A'
    | 'hh:mm A'


// Function to attempt parsing with common formats
const parseDate = (dateStr: string): dayjs.Dayjs => {
  const timeOnlyFormat = 'h:mm A'
  const timeOnlyFormat2 = 'hh:mm A';

  const timeOnlyParsed = dayjs(dateStr, timeOnlyFormat, true);
  if (timeOnlyParsed.isValid()) {
    return timeOnlyParsed;
  }
  const timeOnlyParsed2 = dayjs(dateStr, timeOnlyFormat2, true);
  if (timeOnlyParsed2.isValid()) {
    return timeOnlyParsed2;
  }
  for (const format of commonFormats) {
    const parsedDate = dayjs(dateStr, format, true);
    if (parsedDate.isValid()) {
      return parsedDate;
    }
  }

  const fallbackDate = new Date(dateStr);
  if (!isNaN(fallbackDate.getTime())) {
    // console.log('Parsed date using fallback Date object:', fallbackDate); 
    return dayjs(fallbackDate);
  }

  console.error('Failed to parse date:', dateStr);
  throw new Error(`Invalid date format: ${dateStr}`);
};

// Function to convert a date to a specific timezone
export const convertToTimezone = (
    date: string | Date,
    timezone?: string,
    format?: DateFormat
): string => {
  let parsedDate: dayjs.Dayjs;

  if (date instanceof Date) {
    parsedDate = dayjs(date);
  } else if (typeof date === 'string') {
    try {
      parsedDate = parseDate(date);
    } catch (error) {
      console.log('error Parsing ', error);

      return date;
    }
  } else {
    console.log('Invalid date', date);
    return date;
  }

  if (!parsedDate.isValid()) {
    throw new Error('Invalid date format');
  }

  const outputFormat = format || 'DD MMM YYYY, h:mm A';

  if (timezone) {
    return parsedDate.tz(timezone).format(outputFormat);
  } else {
    return parsedDate.format(outputFormat);
  }
};
