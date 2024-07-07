

export function convertDateToISO(dateString: string) {
  const cleanedDateString = dateString.replace(/(\d+)(st|nd|rd|th)/, "$1");
  const date = new Date(cleanedDateString);

  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2); 
  const day = `0${date.getDate()}`.slice(-2);

  return `${year}-${month}-${day}`;
}