import React, { useEffect, useState } from "react";
import { Box, Icon, useSnackbar } from "zmp-ui";
import { useRecoilState, useRecoilValue } from "recoil";
import { orderListState, orderState, storeState } from "../../state";
import { fetchOrderByUUID } from "../../api/api";
import createCable from "./cable";
import { TYPE_SOCKET, ORDER_STATUS } from "../../constants";
import { clone } from "lodash";
// import { vibrate } from "zmp-sdk/apis";
import { useTranslation } from "react-i18next";
import { priceFormatter } from "../../utils/numberFormatter";
import { useNavigate } from "react-router-dom";
import { getSubdomain } from "@/api/cloudStorageManager";

interface OrderNotificationProps {
  authToken: string;
  store_uuid?: string;
}

interface WebSocketData {
  type: string;
  message: {
    uuid: string;
    store_uuid: string;
    notification_type: string;
    status: string;
    value: number;
    table: {
      name: string;
    };
  };
}

interface User {
  avatar: string;
}

interface Order {
  uuid:string;
  user?:User
  created_at: string;
  store_name: string;
  table_uuid: string;
  store_uuid: string
  status: string;
  products: { product_name: string; quantity: number; unit_price: number }[];
  notes?: string;
  actual_payment_amount: number;
  value: number;
}

interface ApiResponse<T> {
  name?: string;
  uuid?: string;
  subdomain?: string;
  data?: T;       
  error?: string | unknown;    
  orders?: [];
  status?: string;
  expired_at?: string;
}

const OrderNotification: React.FC<OrderNotificationProps> = ({
  authToken,
  store_uuid,
}) => {
  const snackbar = useSnackbar();
  const store = useRecoilValue(storeState);
  const { t } = useTranslation("global");
  const [orderList, setOrderList] = useRecoilState(orderListState);
  const [, setOrder] = useRecoilState(orderState);
  const [subdomain, setSubdomain] = useState<string | undefined>();
  const navigate = useNavigate();

  const getOrderByUUID = async (order_uuid: string): Promise<Order | undefined> => {
    const data: ApiResponse<Order> = await fetchOrderByUUID(store.uuid, order_uuid);
    if (!data?.error && data?.data) {
      return data.data;
    } else {
      console.log("Error:", data?.error);
      return undefined;
    }
  };
  

  const handleVibrate = async () => {
    // await vibrate({
    //   milliseconds: 5000,
    //   type: "oneShot", 
    //   success: () => {},  
    //   fail: (error) => {
    //     console.log(error);
    //   },
    // });
  };
  
  
  const handleSnackbarActionClick = (order_uuid: string, store_uuid: string) => {
    navigate({
      pathname: `/admin/order-management/details/index/${order_uuid}/${store_uuid}`,
    });
  };

  const handleUpdateOrderList = async (data: WebSocketData["message"], type: "create" | "update") => {
    const newOrder = await getOrderByUUID(data.uuid);
    if (!newOrder) return;

    let newOrderList = clone(orderList.orders);

    switch (type) {
      case "create":
        newOrderList.unshift(newOrder);
        break;
      case "update":
        newOrderList = newOrderList.map((order) =>
          order.uuid === newOrder.uuid ? newOrder : order,
        );
        setOrder(newOrder);
        break;
      default:
        break;
    }

  
    setOrderList({
      is_update: true,
      orders: newOrderList,
    });
  };
  

  const getTenant = async () => {
    const tenant = await getSubdomain();
    if (!tenant) return;

    setSubdomain(tenant);
  };

  useEffect(() => {
    getTenant();
  }, []);

  useEffect(() => {
    if (authToken && store_uuid && subdomain && orderList.is_update) {
      console.log("ws connecting...");
      const newCable = createCable(authToken, store_uuid, subdomain);
      console.log(`ws connected to...`);

      const subscription = newCable.subscriptions.create(
        { channel: "UserNotificationChannel" },
        {
          received(data: WebSocketData) {
            console.log("Data received from ws:", data);

            let notify = "";
            const { type, message } = data;

            if (type === TYPE_SOCKET.ORDER) {
              switch (message.notification_type) {
                case "create":
                  notify = `${t("websocket.new_order")}`;
                  handleUpdateOrderList(message, "create");
                  handleVibrate();
                  break;

                case "update":
                  if (message.status === ORDER_STATUS.WAIT_FOR_PAY) {
                    notify = `${t("websocket.wait_for_pay")} | ${t(
                      "websocket.value",
                    )}: ${priceFormatter(message.value)}₫`;
                    handleVibrate();
                  } else {
                    notify = `${t("websocket.update_order")}`;
                  }

                  handleUpdateOrderList(message, "update");
                  break;

                default:
                  break;
              }
            }

            // Snackbar
            snackbar.openSnackbar({
              duration: 30000,
              text: String(
                <Box>
                  <Box>[{message.table.name}]</Box>
                  {notify}
                </Box>
              ),
              prefixIcon: (
                <Icon icon="zi-notif-ring" style={{ color: "yellow" }} />
              ),
              type: "countdown",
              action: {
                text: t("websocket.view_detail"),
                close: true,
                onClick: () =>
                  handleSnackbarActionClick(message.uuid, message.store_uuid),
              },
              zIndex: 7000,
            });
          },
        },
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [authToken, store_uuid, subdomain, orderList]);

  return <div>{/* Your component UI here */}</div>;
};

export default OrderNotification;
