import React, { useState } from 'react';
import { Box, Button, List, Text } from 'zmp-ui';
import { PRODUCT_STATUS } from '../../../constants';
import './styles.scss';
import { useTranslation } from 'react-i18next';
import { priceFormatter } from '../../../utils/numberFormatter';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';


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

interface StoreDetail {
  description?: string;
  address?: string;
  phoneNumber?: string;
  bankAccount?: string;
  bankName?: string;
  currency?: string;
  avatar?: {
    url: string;
    uuid: string;
  };
}

interface ProductCardProps {
  product: Product;
  onDetails: (product: Product) => void;
  setIsShowConfirm: (show: boolean) => void;
  setSelectedProduct: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onDetails,
  setIsShowConfirm,
  setSelectedProduct,
}) => {
  const { t } = useTranslation('global');
  const [storeDetail, ] = useState<StoreDetail>({});

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
        <Text size="normal" style={{color:'black'}}>{storeDetail?.currency && (
              <List.Item
                style={{ marginBottom: "0", color: "black" }}
                title={t("editStore.currency")}
              >
                <Text>{storeDetail?.currency}</Text>
              </List.Item>
            )}{priceFormatter(product.price)}</Text>
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
