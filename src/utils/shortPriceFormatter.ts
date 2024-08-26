export const shortPriceFormatter = (price: number = 0): string => {
  let formattedPrice: string;

  if (price >= 1000000) {
    // Nếu phần thập phân là 0 => không hiển thị
    formattedPrice = (price / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (price >= 1000) {
    // Nếu phần thập phân là 0 => không hiển thị
    formattedPrice = (price / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  } else {
    formattedPrice = price.toString();
  }

  return formattedPrice;
};
