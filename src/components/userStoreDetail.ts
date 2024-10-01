import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getStoreByUUID } from '@/api/api';
import { useRecoilState } from 'recoil';
import { loadingState } from '@/state';

const useStoreDetail = () => {
  const { store_uuid } = useParams<{ store_uuid?: string }>();
  const [currency, setCurrency] = useState('USD'); // Khởi tạo với giá trị USD
  const [loading, setLoading] = useRecoilState(loadingState);
  const [isCurrencyLoaded, setIsCurrencyLoaded] = useState(false); // Trạng thái để theo dõi việc tải currency

  const getStoreDetail = async () => {
    setLoading({ ...loading, isLoading: true }); 
    if (store_uuid) {
      const response = await getStoreByUUID(store_uuid);
      if (response.data) {
        const metadata = JSON.parse(response.data.metadata);
        const currencyValue = metadata.currency || 'USD'; 
        setCurrency(currencyValue); // Cập nhật giá trị currency
        setIsCurrencyLoaded(true); // Đánh dấu rằng currency đã được tải
      } else {
        console.error("Error fetching store data:", response.error);
      }
    }
    setLoading({ ...loading, isLoading: false }); 
  };

  useEffect(() => {
    getStoreDetail();
  }, []);

  return { currency, loading, isCurrencyLoaded };
};

export default useStoreDetail;
