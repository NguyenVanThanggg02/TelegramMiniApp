export const shortPriceFormatter = (price: number = 0): string => {
  let formattedPrice: string;

  if (price >= 1000000) {
    formattedPrice = (price / 1000000).toFixed(1) + "M";
  } else if (price >= 1000) {
    formattedPrice = (price / 1000).toFixed(1) + "K";
  } else {
    formattedPrice = price.toString();
  }

  return formattedPrice;
};
