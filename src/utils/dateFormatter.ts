export const isToday = (someDate: Date): boolean => {
  const today = new Date();
  return (
    someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
  );
};

export const dateFormatterYYYYMMDD = (date: Date | string): string => {
  const dateFormatter = new Date(date);

  const year = dateFormatter.getFullYear();
  const month = String(dateFormatter.getMonth() + 1).padStart(2, "0");
  const day = String(dateFormatter.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
};
