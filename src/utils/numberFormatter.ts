export const priceFormatter = (price: number = 0): string =>
  price.toLocaleString("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

export const formatNumberToVND = (value: number | string): string => {
  const stringValue = String(value); // Ensure value is a string
  // Remove all non-digits and then format
  const number = parseInt(stringValue.replace(/\D/g, ""), 10);
  if (isNaN(number)) return "";

  return priceFormatter(number);
};
