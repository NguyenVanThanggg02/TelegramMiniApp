import React, { useState, useEffect } from "react";
import { Box, Button, Modal, Icon, Text, Swiper } from "zmp-ui";
import { priceFormatter } from "../../../utils/numberFormatter";
import "./styles.scss";
import { useTranslation } from "react-i18next";

interface DishImage {
  uuid: string;
  url: string;
}

interface Dish {
  uuid: string;
  name: string;
  price: number;
  describe?: string;
  quantity?: number;
  images?: DishImage[];
}

interface DishDetailModalProps {
  isShow: boolean;
  onClose: () => void;
  onSubmit: (dish: Dish & { quantity: number }) => void;
  dish: Dish| null;
}

const DishDetailModal: React.FC<DishDetailModalProps> = ({
  isShow,
  onClose,
  onSubmit,
  dish,
}) => {
  const { t } = useTranslation("global");
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (!isShow || !dish) return;

    setQuantity(dish?.quantity || 1);
  }, [isShow, dish]);

  if (!dish) return null;
  
  const resetDefault = () => {
    setQuantity(1);
  };
  

  return (
    <Modal visible={isShow} onClose={onClose} className="dish-details-modal">
      <Box className="container">
        <Box className="header" flex justifyContent="center">
          <Box width={100} height={100} style={{ overflow: "hidden" }}>
            {dish?.images && (
              <Swiper style={{ height: "100%" }}>
                {dish.images.map((img) => (
                  <Swiper.Slide key={img.uuid} style={{ height: "100%" }}>
                    <img
                      style={{ verticalAlign: "center" }}
                      src={img.url}
                      alt="dish img"
                    />
                  </Swiper.Slide>
                ))}
              </Swiper>
            )}
          </Box>
          <Box onClick={onClose} className="close-btn">
            <Icon icon="zi-chevron-left" className="close-icon" />
          </Box>
        </Box>

        <Box className="dish-info" mt={3}>
          <Box mb={3}>
            <Text style={{ fontSize: "23px" }} bold>
              {dish.name}
            </Text>
          </Box>

          <Text style={{ fontSize: "15px", padding: "10px 0" }}>
            {dish.describe}
          </Text>

          <Text size="xLarge" bold className="txt-price">
            {priceFormatter(dish.price)} ₫
          </Text>
        </Box>

        <Box className="divider" />

        <Box flex className="footer shadow-bottom">
          <Box className="num-order" flex>
            <Box className="fs-24" pr={3} onClick={() => {
                  if (quantity > 1) {
                    setQuantity(quantity - 1);
                  }
                }}>
              <Icon
                icon="zi-minus-circle"
                style={{
                  pointerEvents: !quantity ? "none" : "visible",
                  color: !quantity ? "grey" : "#141415",
                }}
                
              />
            </Box>
            <Box className="fs-24" style={{ marginTop: "2px" }}>
              {quantity}
            </Box>
            <Box className="fs-24" px={3} onClick={() => {
                  setQuantity(quantity + 1);
                }}>
              <Icon
                icon="zi-plus-circle"
              />
            </Box>
          </Box>

          <Button
            onClick={() => {
              onSubmit({ ...dish, quantity });
              onClose();
              resetDefault();
            }}
          >
            {t("menu.addToOrder")} - {priceFormatter(dish.price * quantity)}₫
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default DishDetailModal;
