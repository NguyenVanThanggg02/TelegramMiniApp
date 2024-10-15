import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getStoreByUUID } from '@/api/api';
// import { useRecoilState } from 'recoil';
// import { loadingState } from '@/state';

const useStoreDetail = () => {
  const { store_uuid } = useParams<{ store_uuid?: string }>();
  const [currency, setCurrency] = useState<String | null>(null);
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(true);

  const getStoreDetail = async () => {
    setIsLoadingCurrency(true);
    if (store_uuid) {
      const response = await getStoreByUUID(store_uuid);
      if (response.data) {
        const metadata = JSON.parse(response.data.metadata);
        const currencyValue = metadata.currency || '$'; 
        setCurrency(currencyValue);
      } else {
        console.error("Error fetching store data:", response.error);
      }
      setIsLoadingCurrency(false);

    }
  };

  useEffect(() => {
    getStoreDetail();
  }, []);

  return { currency: currency || '$',isLoadingCurrency };
};

export default useStoreDetail;
