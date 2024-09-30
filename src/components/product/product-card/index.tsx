import React, { useEffect, useState } from 'react';
import { Box, Button, Text } from 'zmp-ui';
import { PRODUCT_STATUS } from '../../../constants';
import './styles.scss';
import { useTranslation } from 'react-i18next';
import { priceFormatter } from '../../../utils/numberFormatter';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { getStoreByUUID } from '@/api/api';
import { useParams } from 'react-router-dom';
// import { useRecoilValue } from 'recoil';
// import { currencyState } from '@/state';


interface Category {
  name: string;
}

interface Product {
  uuid: string;
  name: string;
  price: number;
  status: string;
  images: { url: string }[];
  categories: Category[];
}

interface ProductCardProps {
  product: Product;
  onDetails: (product: Product) => void;
  setIsShowConfirm: (show: boolean) => void;
  setSelectedProduct: (product: Product) => void;
}
// interface StoreData {
//   name: string;
//   metadata: string;
// }

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onDetails,
  setIsShowConfirm,
  setSelectedProduct,
}) => {
  const { t } = useTranslation('global');
  const { store_uuid } = useParams<{ store_uuid?: string }>();
  const [currency, setCurrency] = useState('USD')
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(true); // Thêm trạng thái để theo dõi việc load currency

 console.log(currency);
 const getStoreDetail = async () => {
  if (store_uuid) {
    const response = await getStoreByUUID(store_uuid);
    if (response.data) {
      const metadata = JSON.parse(response.data.metadata);
      const currencyValue = metadata.currency || 'USD'; // Đặt mặc định là USD nếu không có currency
      setCurrency(currencyValue);
      setIsLoadingCurrency(false); // Đánh dấu là đã load xong
    } else {
      console.error("Error fetching store data:", response.error);
      setIsLoadingCurrency(false); // Đánh dấu là đã load xong ngay cả khi có lỗi
    }
  }
};
  useEffect(() => {
    getStoreDetail();
  }, []);
  if (isLoadingCurrency) {
    return <Text>{t('loading')}</Text>; // Hiển thị trạng thái loading trong khi chờ currency
  }
  return (
    <Box
      flex
      className="product-card-container"
      onClick={() => {
        onDetails(product);
      }}
    >
      <Box className="product-card-left">
        {product.images.length > 0 && (
          <img
            className="product-img"
            src={product.images[0].url}
            alt={product.name}
          />
        )}
      </Box>
      <Box className="product-card-right">
        <Text size="xLarge" bold className="product-name" style={{color:'black'}}>
          {product.name}
        </Text>
        {product.status === PRODUCT_STATUS.DISPLAY ? (
          <Box className="product-status status-finished">
            {t('productManagement.status.display')}
          </Box>
        ) : (
          <Box className="product-status status-expired">
            {t('productManagement.status.hidden')}
          </Box>
        )}
        <Text size="normal" style={{color:'black'}}>{currency+" "}{priceFormatter(product.price)}</Text>
        <Text size="xxSmall" className="text-category">
          {t('storeManagement.categories')}:
          {product.categories.map((item, index) =>
            index === 0 ? ` ${item.name}` : `, ${item.name}`
          )}
        </Text>
      </Box>
      <Button
        icon={<DeleteForeverOutlinedIcon />}
        className="delete-icon"
        onClick={(e) => {
          e.stopPropagation();
          setIsShowConfirm(true);
          setSelectedProduct(product);
        }}
      ></Button>
    </Box>
  );
};

export default ProductCard;
