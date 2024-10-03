import React from "react";
import { Box, Icon, Text } from "zmp-ui";
import { priceFormatter } from "../../../utils/numberFormatter";
import { DEFAULT_IMAGE_PRODUCT } from "../../../constants";
import { useRecoilState } from "recoil";
import { cartState } from "../../../state";

interface DishImage {
  uuid: string;
  url: string;
}

interface DishItem {
  uuid: string;
  name: string;
  price: number;
  images?: DishImage[];
  describe?: string;
}


interface DishCardProps {
  isAdmin?: boolean;
  dishItem: DishItem;
  onDetails: (dish: DishItem) => void;
  onOrder: (dish: DishItem) => void;
  currency: string; 
}

const DishCard: React.FC<DishCardProps> = ({ isAdmin = false, dishItem, onDetails, onOrder,currency, }) => {
  const [cart, setCart] = useRecoilState(cartState);
  const itemInCart = cart.find((item) => item.uuid === dishItem.uuid);
  
  const handleUpdateQuantity = (type: "increase" | "decrease") => {
    switch (type) {
      case "increase":
        setCart(
          cart.map((item) => {
            if (item.uuid === itemInCart?.uuid) {
              return { ...item, quantity: item.quantity + 1 };
            }
            return item;
          }),
        );
        break;
      case "decrease":
        setCart(
          cart
            .map((item) => {
              if (item.uuid === itemInCart?.uuid) {
                if (item.quantity <= 1) {
                  return undefined;
                }
                return { ...item, quantity: item.quantity - 1 };
              }
              return item;
            })
            .filter(Boolean) as typeof cart, 
        );
        break;
      default:
        break;
    }
  };

  return (
    <Box
      flex
      style={{
        padding: "15px 0",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: "8px",
        position: "relative",
      }}
      onClick={() => onDetails(dishItem)}
    >
      <Box flex alignItems="center">
        <Box mr={5} flex alignItems="center">
          <img
            src={dishItem.images?.[0]?.url || DEFAULT_IMAGE_PRODUCT}
            alt="dish item"
            style={{ borderRadius: "12px", width: "80px", height: "80px" }}
          />
        </Box>
        <Box>
          <Text size="large" bold style={{color:'black'}}>
            {dishItem.name}
          </Text>
          <Text className="red-color caption-text" bold>
          {currency + " "}{priceFormatter(dishItem.price)}
          </Text>
        </Box>
      </Box>

      <Box
        flex
        onClick={(e) => e.stopPropagation()}
        style={{ position: "absolute", right: 0, bottom: "5px" }}
      >
        {isAdmin || itemInCart ? (
          <Box flex style={{ gap: "6px" }}>
            <Box onClick={() => handleUpdateQuantity("decrease")}>
              <Icon
                icon="zi-minus-circle"
                className="red-color"
                style={{ fontSize: "32px", color:'black' }}
              />
            </Box>

            <Text size="xLarge" style={{ marginTop: "3px", color:'black' }}>
              {itemInCart?.quantity || 0}
            </Text>
            <Box onClick={() => handleUpdateQuantity("increase")}>
              <Icon
                icon="zi-plus-circle-solid"
                className="red-color"
                style={{ fontSize: "32px",color:'black' }}
              />
            </Box>
          </Box>
        ) : (
          <Box
            onClick={(e) => {
              e.stopPropagation();
              onOrder(dishItem);
            }}
          >
            <Icon
              icon="zi-plus-circle-solid"
              className="red-color"
              style={{ fontSize: "32px"}}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DishCard;
