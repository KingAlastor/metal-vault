import { monthsArray } from "../enums";

export function convertDateToISO(dateString: string) {
  const cleanedDateString = dateString.replace(/(\d+)(st|nd|rd|th)/, "$1");
  const date = new Date(cleanedDateString);

  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);

  return `${year}-${month}-${day}`;
}

export const formatDateAndTime = (date: Date) => {
  const d = new Date(date);

  const month = monthsArray[d.getMonth()];
  const day = d.getDate();
  const hour = d.getHours().toString().padStart(2, "0");
  const minute = d.getMinutes().toString().padStart(2, "0");

  return `${month} ${day} ${hour}:${minute}`;
};

export const formatDateWithNamedMonth = (date: Date) => {
  const d = new Date(date);

  const month = monthsArray[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();

  return `${month} ${day} ${year}`;
};

export function formatTimeToSeconds(timeString: string): number {
  if (!timeString) {
    return 0;
  }

  const [minutes, seconds] = timeString.split(":").map(Number);
  return minutes * 60 + seconds;
}

export function formatTimeFromSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function parseMetalArchivesDate(dateString: string): Date | null {
  if (!dateString) {
    return null;
  }

  // Handle "YYYY" format
  if (/^\d{4}$/.test(dateString)) {
    return new Date(Date.UTC(parseInt(dateString), 0, 1)); // January 1st of the year
  }

  // Handle "Month YYYY" format
  if (/^[a-zA-Z]+ \d{4}$/.test(dateString)) {
    const [month, year] = dateString.split(" ");
    const monthIndex = getMonthIndex(month);
    if (monthIndex === -1) {
      console.warn(`Could not parse month: ${month}`);
      return null;
    }
    return new Date(Date.UTC(parseInt(year), monthIndex, 1));
  }

  // Handle "Day Month YYYY" format (e.g., "January 2nd, 1996" or "August 23rd, 2021")
  if (/^\w+ \d{1,2}(?:st|nd|rd|th)?(?:,)? \d{4}$/.test(dateString)) {
    // Clean up the date string by removing ordinal suffixes and commas
    const cleanedDateString = dateString.replace(/(st|nd|rd|th|,)/g, "");
    const [month, day, year] = cleanedDateString.split(" ");
    const monthIndex = getMonthIndex(month);

    if (monthIndex === -1) {
      console.warn(`Could not parse month: ${month}`);
      return null;
    }
    return new Date(Date.UTC(parseInt(year), monthIndex, parseInt(day)));
  }

  console.warn(`Could not parse date string: ${dateString}`);
  return null;
}

function getMonthIndex(month: string): number {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months.findIndex(m => m.toLowerCase() === month.toLowerCase());
}

export function getFromAndToDates(period: string): { from: string, to: string } {
  const today = new Date();
  const toDate = today.toISOString().split('T')[0];

  if (period === 'W') {
    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - 7);
    return {
      from: fromDate.toISOString().split('T')[0],
      to: toDate
    };
  } else if (period === 'M') {
    const fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDateOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    return {
      from: fromDate.toISOString().split('T')[0],
      to: lastDateOfPreviousMonth.toISOString().split('T')[0]
    };
  }

  throw new Error('Invalid period specified');
}