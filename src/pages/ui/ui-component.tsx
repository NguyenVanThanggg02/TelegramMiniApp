// import React from "react";
import { Box, Page, Text } from "zmp-ui";
import { ORDER_STATUS } from "../../constants";
import OrderStatus from "../../components/order-status";

function UIComponent() {
  const handleStatusChange = () => {
  };

  return (
    <Page className="section-container">
      <Box mb={4}>
        <Box mb={2}>
          <Text size="xLarge" bold>
            Status Order
          </Text>
        </Box>
        <Box>
          {Object.values(ORDER_STATUS).map((item, index) => (
            <Box mb={2} key={index}>
              <OrderStatus status={item} onChange={handleStatusChange} />
            </Box>
          ))}
        </Box>
      </Box>
    </Page>
  );
}

export default UIComponent;
