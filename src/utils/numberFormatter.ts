
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getStoreByUUID } from '@/api/api';

export const useStoreDetail = () => {
  const { store_uuid } = useParams<{ store_uuid?: string }>();
  const [currency, setCurrency] = useState<String | null>(null);

  const getStoreDetail = async () => {
    if (store_uuid) {
      const response = await getStoreByUUID(store_uuid);
      if (response.data) {
        const metadata = JSON.parse(response.data.metadata);
        const currencyValue = metadata.currency || '$'; 
        setCurrency(currencyValue);
      } else {
        console.error("Error fetching store data:", response.error);
      }
    }
  };

  useEffect(() => {
    getStoreDetail();
  }, []);
  
  const formatPrice = (price: number) => {
    return currency === '$' ? formatPriceToUSD(price) : priceFormatter(price);
  };
  return { currency, formatPrice };

};


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

export const formatPriceToUSD = (price: number = 0): string =>
  price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
