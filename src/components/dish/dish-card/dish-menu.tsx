import React from "react";
import { Box } from "zmp-ui";
import DishCard from "./dish-card";


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

interface DishMenuProps {
  dishMenu: DishItem[];
  onDetails: (dish: DishItem) => void;
  onOrder: (dish: DishItem) => void;
  currency: string; 
}

const DishMenu: React.FC<DishMenuProps> = ({ dishMenu, onDetails, onOrder,currency }) => {
  return (
    <Box>
      {dishMenu.map((dish, index) => (
        <Box key={dish.uuid}>
          <DishCard dishItem={dish} onDetails={onDetails} onOrder={onOrder}  currency={String(currency)} />
          {dishMenu.length > index + 1 ? (
            <Box
              style={{
                width: "100%",
                height: "0.5px",
                backgroundColor: "#e9ebed",
              }}
            ></Box>
          ) : (
            <Box
              style={{
                width: "100%",
                height: "15px",
              }}
            ></Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default DishMenu;
