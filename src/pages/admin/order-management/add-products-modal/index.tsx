import { isEmpty } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Icon, Sheet, Text } from "zmp-ui";
import { priceFormatter } from "../../../../utils/numberFormatter";
import { DEFAULT_IMAGE_PRODUCT } from "../../../../constants";
import "./styles.scss";
import { useTranslation } from "react-i18next";

// Define the type for product items
interface ProductImage {
  uuid: string;
  url: string;
}

interface Product {
  uuid: string;
  name: string;
  price:number
  unit_price?: number;
  quantity?: number;
  images?: ProductImage[];
  product_name: string;
  product_images?: ProductImage[];
  order_item_uuid: string
  delivered_quantity: number
  product_uuid? : string
  delivery_status: string
}

interface AddProductModalProps {
  isShow: boolean;
  onClose: () => void;
  onSubmit: (products: Product[]) => void;
  data: Product[];
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isShow, onClose, onSubmit, data }) => {
  const { t } = useTranslation("global");
  const [products, setProducts] = useState<Product[]>([]);
  
  const isChanged = useMemo(
    () => products.some((productItem) => productItem.quantity),
    [products]
  );
  
  const onChangeQuantity = (type: "increase" | "decrease", product: Product) => {
    const newProducts = products.map((productItem) => {
      if (productItem.uuid === product.uuid) {
        const currentQuantity = productItem.quantity || 0;
  
        return {
          ...productItem,
          quantity:
            type === "increase"
              ? currentQuantity + 1
              : currentQuantity > 0
              ? currentQuantity - 1
              : 0, 
        };
      }
  
      return productItem;
    });
  
    setProducts(newProducts);
  };
  

  useEffect(() => {
    setProducts(data || []);
  }, [data]);

  return (
    <Sheet
      visible={isShow}
      onClose={onClose}
      title={t("orderManagement.addDishes")}
      mask
      swipeToClose
      autoHeight
    >
      <Box className="add-products-container">
        <Box className="product-list">
          {!isEmpty(products) &&
            products.map((productItem) => (
              <Box
                key={productItem.uuid}
                flex
                justifyContent="space-between"
                className="product-item"
              >
                <Box flex alignItems="center">
                  <Box mr={5} flex alignItems="center">
                    <img
                      src={
                        productItem.images?.[0]?.url || DEFAULT_IMAGE_PRODUCT
                      }
                      alt="dish item"
                      style={{
                        borderRadius: "4px",
                        width: "80px",
                        height: "80px",
                      }}
                    />
                  </Box>
                  <Box>
                    <Text size="large" bold style={{color:'black'}}>
                      {productItem.name}
                    </Text>
                    <Text className="red-color caption-text" style={{color:'black'}}>
                      ₫{priceFormatter(productItem.price)}
                    </Text>
                  </Box>
                </Box>

                <Box flex alignItems="center" style={{ gap: "12px" }}>
                  <Box  onClick={() => onChangeQuantity("decrease", productItem)}> 
                  <Icon
                    icon="zi-minus-circle"
                    style={{
                      pointerEvents: !productItem.quantity ? "none" : "visible",
                      color: !productItem.quantity ? "grey" : "#141415",
                    }}
                  />
                  </Box>
                  <Text className="fs-22" style={{ width: "20px", color:'black' }}>
                    {productItem.quantity}
                  </Text>
                  <Box onClick={() => onChangeQuantity("increase", productItem)}>
                  <Icon
                    icon="zi-plus-circle-solid"
                    className="red-color"
                  />
                  </Box>
                 
                </Box>
              </Box>
            ))}
        </Box>
        <Box className="actions">
          <Button variant="secondary" onClick={onClose}>
            {t("button.cancel")}
          </Button>
          <Button
            disabled={!isChanged}
            onClick={() => {
              onSubmit(products.filter((item) => (item.quantity || 0) > 0));
              onClose();
            }}
          >
            {t("button.confirm")}
          </Button>
        </Box>
      </Box>
    </Sheet>
  );
}

export default AddProductModal;
