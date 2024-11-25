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
}

