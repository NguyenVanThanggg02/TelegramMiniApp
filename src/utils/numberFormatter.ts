
export const priceFormatter = (price: number = 0): string =>
  price.toLocaleString("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

// export const formatNumberToVND = (value: number | string): string => {
//   const stringValue = String(value); // Ensure value is a string
//   // Remove all non-digits and then format
//   const number = parseInt(stringValue.replace(/\D/g, ""), 10);
//   if (isNaN(number)) return "";

//   return priceFormatter(number);
// };
export const formatNumberToVND = (value: number | string): string => {
  const stringValue = String(value); 

  const cleanedValue = stringValue.replace(/[^0-9.,]/g, ""); 

  const normalizedValue = cleanedValue.replace(/,/g, '').replace(/(\.\d{2})\./g, '$1'); 

  const number = parseFloat(normalizedValue);
  if (isNaN(number)) return "";

  return priceFormatter(number); 
};


//  const formatPriceToUSD = (price: number = 0): string =>
//   price.toLocaleString("en-US", {
//     style: "currency",
//     currency: "USD",
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   });

export function formatUSD(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }