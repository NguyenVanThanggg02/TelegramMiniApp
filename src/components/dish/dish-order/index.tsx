import React, { useState, useEffect } from "react";
import { Button, Sheet, Text, Box, Icon } from "zmp-ui";
import { formatUSD, priceFormatter } from "../../../utils/numberFormatter";
import "./styles.scss";
import { DEFAULT_IMAGE_PRODUCT } from "../../../constants";
import { useTranslation } from "react-i18next";
import useStoreDetail from "@/components/userStoreDetail";
import { getStoreByUUID } from "@/api/api";


interface ProductImage {
  uuid: string;
  url: string;
}
interface Product {
  uuid: string;
  name: string;
  price: number;
  unit_price?: number;
  quantity?: number;
  images?: ProductImage[];
  product_name: string;
  product_images?: ProductImage[];
  order_item_uuid: string;
  delivered_quantity: number;
  product_uuid?: string;
  delivery_status: string;
}


interface DishOrderSheetProps {
  isShow: boolean;
  isAdmin?: boolean;
  product: Product;
  onClose: () => void;
  onSubmit: (product: Product & { quantity: number }) => void;
  onPayment?: (product: Product & { quantity: number }) => void;
}

const DishOrderSheet: React.FC<DishOrderSheetProps> = ({
  isShow,
  isAdmin = false,
  product,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation("global");
  const [quantity, setQuantity] = useState<number>(1);
  const { store_uuid } = useStoreDetail();
  const [currency, setCurrency] = useState<String | null>(null);
  console.log(currency);

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
  const resetDefault = () => {
    setQuantity(1);
  };

  useEffect(() => {
    if (!isShow) {
      resetDefault();
      return;
    }

    setQuantity(product?.quantity || 1);
  }, [isShow, product]);

  return (
    <Sheet
      visible={isShow}
      onClose={onClose}
      mask
      swipeToClose
      handler
      autoHeight
      className="dish-order"
    >
      <Text.Title
        size="xLarge"
        className="header-title"
        style={{ color: "black" }}
      >
        {isAdmin ? t("orderManagement.updateDish") : t("menu.addNewDish")}
      </Text.Title>

      <Box flex p={7}>
        <Box style={{ width: "25%" }} mr={7}>
          <img
            src={
              isAdmin
                ? product.product_images?.[0]?.url || DEFAULT_IMAGE_PRODUCT
                : product.images?.[0]?.url || DEFAULT_IMAGE_PRODUCT
            }
            alt="product img"
            style={{ borderRadius: "12px", width: "100px", height: "100px" }}
          />
        </Box>
        <Box flex flexDirection="column" justifyContent="center">
          <Box mb={1}>
            <Text size="xLarge" bold style={{ color: "black" }}>
              {product.name}
            </Text>
          </Box>
          <Text size="large" bold className="red-color">
            {currency === "$"
              ? formatUSD(
                  isAdmin ? (product.unit_price ?? 0) : (product.price ?? 0)
                )
              : `${currency} ${priceFormatter(isAdmin ? (product.unit_price ?? 0) : (product.price ?? 0))}`}
          </Text>
        </Box>
      </Box>

      <hr />

      <Box>
        <Text className="title bg-gray" style={{ color: "black" }}>
          {t("menu.quantity")}
        </Text>
        <Box flex justifyContent="center" textAlign="center" py={5}>
          <Box
            className="fs-24"
            pr={6}
            onClick={() => {
              if (quantity > 1) {
                setQuantity(quantity - 1);
              }
            }}
          >
            <Icon
              icon="zi-minus-circle"
              style={{
                pointerEvents: quantity <= 1 ? "none" : "visible",
                color: quantity <= 1 ? "grey" : "#141415",
                fontSize: "32px",
              }}
            />
          </Box>
          <Box className="fs-24" style={{ marginTop: "6px", color: "black" }}>
            {quantity}
          </Box>
          <Box
            className="fs-24"
            pl={6}
            onClick={() => {
              setQuantity(quantity + 1);
            }}
          >
            <Icon
              icon="zi-plus-circle"
              style={{ fontSize: "32px", color: "black" }}
            />
          </Box>
        </Box>
      </Box>

      <Box>
        <Box className="box-summary" />
        <Box flex justifyContent="space-between" px={6} py={4}>
          <Text className="title" style={{ padding: 0, color: "black" }}>
            {t("menu.total")}
          </Text>
          <Text size="xLarge" bold className="red-color">
            {isAdmin
              ? currency === "$"
                ? formatUSD(product.unit_price! * quantity)
                : `${currency} ${priceFormatter(product.unit_price! * quantity)}`
              : currency === "$"
                ? formatUSD(product.price * quantity)
                : `${currency} ${priceFormatter(product.price * quantity)}`}
          </Text>
        </Box>
      </Box>

      <Box flex justifyContent="space-around" p={4} className="submit-section">
        {isAdmin ? (
          <Button
            onClick={() => {
              onSubmit({ ...product, quantity });
              onClose();
            }}
            style={{ width: "100%" }}
          >
            {t("orderManagement.updateDish")}
          </Button>
        ) : (
          <>
            <Button
              onClick={() => {
                onSubmit({ ...product, quantity });
                onClose();
              }}
              style={{ width: "100%" }}
            >
              {t("menu.addToOrder")}
            </Button>
          </>
        )}
      </Box>
    </Sheet>
  );
};

export default DishOrderSheet;
