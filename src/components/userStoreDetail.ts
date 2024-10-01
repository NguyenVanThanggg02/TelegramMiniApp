import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getStoreByUUID } from '@/api/api';
import { useRecoilState } from 'recoil';
import { loadingState } from '@/state';

const useStoreDetail = () => {
  const { store_uuid } = useParams<{ store_uuid?: string }>();
  const [currency, setCurrency] = useState<string | null>(null); 
  const [loading, setLoading] = useRecoilState(loadingState);

  const getStoreDetail = async () => {
    setLoading({ ...loading, isLoading: true }); 
    if (store_uuid) {
      const response = await getStoreByUUID(store_uuid);
      if (response.data) {
        const metadata = JSON.parse(response.data.metadata);
        if(metadata.currency === null){
          const currencyValue = "USD"
          setCurrency(currencyValue);
        }else{
          setCurrency(metadata.currency);
        }
        
      } else {
        console.error("Error fetching store data:", response.error);
      }
      setLoading({ ...loading, isLoading: false }); 
    }
  };

  useEffect(() => {
    getStoreDetail();
  }, []);

  return { currency, loading };
};

export default useStoreDetail;
