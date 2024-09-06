import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Page, Text } from "zmp-ui";
import {
  ApiResponse,
  fetchCurrentOrdersByStoreClientSide,
  fetchHistoryOrdersByStore,
  getProductListByStore,
  sendInvoice,
  updateOrderRequest,
  // updatePaymentMethod,
} from "../../../api/api";
import { useRecoilState, useRecoilValue } from "recoil";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Snackbar } from "@telegram-apps/telegram-ui";

import {
  currentOrderByStoreClientSideState,
  loadingState,
  orderListByUserState,
  productListState,
  spinnerState,
  storeListState,
  storeState,
  userState,
} from "../../../state";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_IMAGE_PRODUCT,
  ORDER_STATUS,
  ORDER_STATUS_NOT_FINISHED_ARR,
  OrderStatus,
} from "../../../constants";

import "./styles.scss";
import { priceFormatter } from "../../../utils/numberFormatter";
import { dateFormatterYYYYMMDD } from "../../../utils/dateFormatter";
import PaymentModal from "../../../components/payment-modal";
import LoadingComponent from "../../../components/loading_component";
import { clone, groupBy, isEmpty } from "lodash";
import CachedIcon from "@mui/icons-material/Cached";
import { useNavigate, useParams } from "react-router-dom";
import AddProductModal from "../../admin/order-management/add-products-modal";

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
  
interface User {
  avatar: string;
  name?: string;
}

interface Order {
  invoice_uuid?: string;
  uuid: string;
  user?: User;
  created_at: string;
  store_name: string;
  table_uuid: string;
  store_uuid: string;
  status: OrderStatus;
  products: Product[]; 
  notes?: string;
  actual_payment_amount: number;
  value: number;
}

interface PaymentPayload {
  order_uuid: Order;
  voucher_code?: string;
}

const OrderPage: React.FC = () => {
  const { t } = useTranslation("global");
  const { store_uuid, table_uuid } = useParams<{ store_uuid: string; table_uuid?: string }>();
  const [productList, setProductList] = useRecoilState(productListState);
  const [store, setStore] = useRecoilState(storeState);
  const [storeList, ] = useRecoilState(storeListState);
  const user = useRecoilValue(userState);
  const [orderListByUser, setOrderListByUser] =
    useRecoilState(orderListByUserState);
  const [currentOrder, setCurrentOrder] = useRecoilState(
    currentOrderByStoreClientSideState,
  );
  const [loading, setLoading] = useRecoilState(loadingState);
  const [, setSpinner] = useRecoilState(spinnerState);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOrderMore, setShowOrderMore] = useState(false);
  const [disableMenuPayment, setDisableMenuPayment] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  const navigate = useNavigate();

  console.log(disableMenuPayment);
  

  const totalBill = useMemo(() => {
    if (
      typeof currentOrder?.actual_payment_amount === 'number' && 
      currentOrder.actual_payment_amount === 0 &&
      Array.isArray(currentOrder.products)
    ) {
      return currentOrder.products.reduce(
        (acc, item) => acc + (item.unit_price ?? 0) * (item.quantity ?? 0),
        0
      );
    }
    return currentOrder?.actual_payment_amount ?? 0;
  }, [currentOrder]);
  
  const zalo_pay_setting = useMemo(() => {
    const storeData = storeList.stores.find((s) => s.uuid === store.uuid);
    const zaloPaySetting = storeData?.store_settings?.find(
      (setting) => setting.name === "zalo_pay",
    )?.value;
    console.log(`zaloPaySetting: ${zaloPaySetting}`);

    return zaloPaySetting?.trim().toLowerCase() === "true" ? true : false;
  }, [storeList]);

  const orderHistoryList = useMemo(() => {
    if (!orderListByUser.orders?.length) return null;

    const ordersSortedNewest = clone(orderListByUser.orders).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const ordersMapping = ordersSortedNewest.map((item) => ({
      ...item,
      created_at: dateFormatterYYYYMMDD(item.created_at),
    }));

    return groupBy(ordersMapping, (i) => i.created_at);
  }, [orderListByUser]);

  const onSubmitOrderMore = async (data: Product[]) => {
    // merge current product order & data order more
    const mergeProducts = [
      ...data,
      ...(Array.isArray(currentOrder.products) ? 
          currentOrder.products.map((item) => ({
            ...item,
            uuid: item.product_uuid,
          })) 
          : []),
    ];
    const quantities: Record<string, number> = {};
    mergeProducts.forEach((product) => {
      if (quantities[product.uuid]) {
        quantities[product.uuid] += product.quantity;
        return;
      }

      quantities[product.uuid] = product.quantity;
    });
    const newOrderProducts = Object.keys(quantities).map((uuid) => ({
      uuid: uuid,
      quantity: quantities[uuid],
    }));

    const payload = {
      store_uuid,
      order: {
        ...currentOrder,
        products: newOrderProducts,
      },
    };

    setSpinner(true);
    const res = await updateOrderRequest(payload);
    if (!res?.error) {
      setCurrentOrder(res.data);
      setSpinner(false);
    } else {
      console.error("Error:", res.error);
      setSnackbarMessage(String(res.error));
      setSnackbarType("error");
      setSnackbarOpen(true);
      setSpinner(false);
    }
  };
  const onZaloPay = async () => {
    const payload = {
      order_uuid: currentOrder.uuid,
    };
    // if (voucher) {
    //   payload.voucher_code = voucher;
    // }
    const data = await sendInvoice(payload);
    if (!data?.error) {
     
      setSnackbarMessage(t("snackbarMessage.paymentOrderSuccess"));
      setSnackbarType("success");
      setSnackbarOpen(true);
      // await handleCreateOrder(data.uuid);

      getCurrentOrder();
    } else {
      console.error("Error:", data.error);
      setSnackbarMessage(String(data.error));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
    setShowPaymentModal(false);
  };

  const onManuallyPayment = async (voucher: string) => {
    const payload: PaymentPayload = {
      order_uuid: currentOrder.uuid,
    };
    if (voucher) {
      payload.voucher_code = voucher;
    }

    const response = await sendInvoice(payload);
    const data = response.data
    if (!data?.error) {
      setSnackbarMessage(t("snackbarMessage.paymentOrderSuccess"));
      setSnackbarType("success");
      setSnackbarOpen(true);
      getCurrentOrder();
    } else {
      console.error("Error:", data.error);
      setSnackbarMessage(String(data.error));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
    setShowPaymentModal(false);
  };

  const getHistoryOrders = async () => {
    const response: ApiResponse<Order[]> = await fetchHistoryOrdersByStore();
  
    if (!response.error) {
      // Ensure that response.data is of the correct type
      const orders = response.data;
  
      if (Array.isArray(orders)) {
        setOrderListByUser({
          is_update: true,
          orders: orders.filter((item) => item.store_uuid === store_uuid),
        });
      } else {
        console.error("Data is not an array of orders.");
      }
    } else {
      console.error("Error:", response.error);
    }
    
    setLoading({ ...loading, isLoading: false });
  };
  

  const getCurrentOrder = async () => {
    if (store_uuid === undefined) {
      console.error("store_uuid is undefined");
      setLoading({ ...loading, isLoading: false });
      return;
    }
  
    try {
      const data = await fetchCurrentOrdersByStoreClientSide(store_uuid);
  
      if (!data?.error) {
        if (ORDER_STATUS_NOT_FINISHED_ARR.includes(data.data.status)) {
          setCurrentOrder({});
          return;
        }
  
        // Check status
        // if (
        //   data.status === ORDER_STATUS.DONE ||
        //   data.status === ORDER_STATUS.WAIT_FOR_PAY ||
        //   data.status === ORDER_STATUS.PAYED
        // ) {
        //   setDisableMenuPayment(true);
        // } else {
        //   const hasDeliveredQuantityGreaterThanZero = data.data.products.some(
        //     (product: Product) => product.delivered_quantity > 0
        //   );
  
        //   setDisableMenuPayment(!hasDeliveredQuantityGreaterThanZero);
        // }

        if (data.data.status !== ORDER_STATUS.PENDING) {
          setDisableMenuPayment(true);
        } else {
          setDisableMenuPayment(false);
        }
  
        setCurrentOrder(data.data);
      } else {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading({ ...loading, isLoading: false });
    }
  };
  

  const getProductsByStore = async (store_uuid: string) => {
    const data = await getProductListByStore(store_uuid, false);
    if (!data?.error) {
      const products = data.data as Product[]
      setProductList({
        is_update: true,
        products
      });
      setLoading({ ...loading, isLoading: false });
    } else {
      setLoading({ ...loading, isLoading: false });
      console.error("Error fetching products:", data.error);
    }
  };

  const getData = () => {
    getHistoryOrders();
    getCurrentOrder();
    if (!productList.products.length) {
      if (store_uuid) {
        getProductsByStore(store_uuid);
      } else {
        console.error("store_uuid is undefined");
      }
    }
  };

  useEffect(() => {
    setLoading({ ...loading, isLoading: true });
  
    if (!user.authToken || !store_uuid) {
      setLoading({ ...loading, isLoading: false });
      return;
    }
  
    if (!store.uuid) {
      setStore(prevStore => ({
        ...prevStore,
        uuid: store_uuid,
      }));
    }
  
    getData();
  }, [user.authToken, store_uuid]);
  
  useEffect(() => {
    if (String(currentOrder.status) === ORDER_STATUS.WAIT_FOR_PAY) {
      setDisableMenuPayment(true);
    }
  }, [currentOrder.status]);

  return (
    <>
      <LoadingComponent />
      <Page className="section-container order-history-container" style={{height:'100vh',padding:'30px 16px'}}>
        <Box className="header" style={{ color: "black" }}>
          {t("menu.order")}
        </Box>
        <Box className="current-order">
          <Box>
            <Box
              flex
              justifyContent="space-between"
              alignItems="center"
              style={{ color: "black" }}
            >
              <Text size="xLarge" bold className="current-order__title">
                {t("userOrder.currentOrder")}
              </Text>
              <Box mb={2}>
                <Button
                  prefixIcon={<CachedIcon />}
                  onClick={getData}
                  className="refresh-btn"
                >
                  {t("userOrder.refreshOrder")}
                </Button>
              </Box>
            </Box>

            {!isEmpty(currentOrder) ? (
              <Box className="current-order__main" mt={3}>
                <Box
                  className={`current-order__status status-${currentOrder.status}`}
                >
                  {t("orderManagement.statusSelect." + currentOrder.status)}
                </Box>
                <Box className="products-and-note">
                  <Box className="products">
                    {Array.isArray(currentOrder.products) &&
                      currentOrder.products.map((item, index) => (
                        <Box
                          flex
                          justifyContent="space-between"
                          alignItems="center"
                          key={index}
                          className="product-item"
                        >
                          <Box
                            flex
                            alignItems="center"
                            className="product-info"
                          >
                            <Box mr={3} flex alignItems="center">
                              <img
                                src={
                                  item.product_images?.[0]?.url ||
                                  DEFAULT_IMAGE_PRODUCT
                                }
                                alt="dish img"
                                className="product-image"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "8px",
                                }}
                              />
                            </Box>
                            <Box>
                              <Text size="large" style={{ color: "black" }}>
                                <span className="fw-500">
                                  {item.product_name}
                                </span>
                              </Text>
                              <Box flex style={{ gap: "8px", color: "black" }}>
                                <Text size="normal">
                                  {priceFormatter(item.unit_price)}
                                  <span style={{ marginLeft: "2px" }}>₫</span>
                                </Text>
                              </Box>
                            </Box>
                          </Box>
                          <Box style={{ color: "black" }}>
                            <Text size="xLarge">x{item.quantity}</Text>
                          </Box>
                        </Box>
                      ))}
                  </Box>
                  <Box flex justifyContent="space-between">
                    {typeof currentOrder.notes === "string" &&
                    currentOrder.notes ? (
                      <Box className="note" style={{ color: "black" }}>
                        <Text size="large">
                          <b>{t("orderManagement.notes")}</b>:{" "}
                          <i>"{currentOrder.notes}"</i>
                        </Text>
                      </Box>
                    ) : (
                      <Box />
                    )}
                    {totalBill ? (
                      <Box
                        className="total-bill"
                        flex
                        alignItems="center"
                        style={{ gap: "4px" }}
                      >
                        <Text size="large" bold>
                          {t("orderManagement.orderDetail.total")}:
                        </Text>
                        <Text size="large" style={{ color: "black" }}>
                          {priceFormatter(totalBill)}₫
                        </Text>
                      </Box>
                    ) : (
                      <Box />
                    )}
                  </Box>
                </Box>
                <Box className="actions">
                  {String(currentOrder.status) === ORDER_STATUS.PENDING && (
                    <Button
                      variant="secondary"
                      onClick={() => setShowOrderMore(true)}
                    >
                      {t("userOrder.orderMore")}
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      if (String(currentOrder.status) === ORDER_STATUS.PENDING) {
                        setShowPaymentModal(true);
                      } else if (
                        String(currentOrder.status) === ORDER_STATUS.WAIT_FOR_PAY
                      ) {
                        setDisableMenuPayment(true);
                        setShowPaymentModal(false);
                        // handleCreateOrder();
                      }
                    }}
                    disabled={disableMenuPayment}
                  >
                    {t("menu.payment")}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box style={{ color: "black" }}>
                {t("userOrder.noHaveOrdersYet")}
              </Box>
            )}
          </Box>
        </Box>

        <Box className="order-history">
          <Box>
            <Text
              size="xLarge"
              bold
              className="current-order__title"
              style={{ color: "black" }}
            >
              {t("userOrder.orderHistory")}
            </Text>
            {!isEmpty(orderHistoryList) ? (
              Object.keys(orderHistoryList).map((key, keyIndex) => (
                <Box key={keyIndex}>
                  <Box pt={4}>
                    <Text>{key}</Text>
                  </Box>
                  {orderHistoryList[key].map((item, index) => (
                    <Box className="current-order__main" mt={3} key={index}>
                      <Box
                        className={`current-order__status status-${item.status}`}
                      >
                        {item.status}
                      </Box>
                      <Box className="products-and-note">
                        <Box className="products">
                          {item.products.length &&
                            item.products.map((product, index) => (
                              <Box
                                flex
                                justifyContent="space-between"
                                alignItems="center"
                                key={index}
                                className="product-item"
                              >
                                <Box
                                  flex
                                  alignItems="center"
                                  className="product-info"
                                >
                                  <Box>
                                    <Text
                                      size="large"
                                      style={{ color: "black" }}
                                    >
                                      <span className="fw-500">
                                        {product.product_name} (x
                                        {product.quantity})
                                      </span>
                                    </Text>
                                  </Box>
                                </Box>
                                <Box>
                                  <Text
                                    size="normal"
                                    style={{ color: "black" }}
                                  >
                                    {priceFormatter(
                                      (product.unit_price ?? 0) *
                                        (product.quantity ?? 0)
                                    )}
                                    <span
                                      style={{
                                        marginLeft: "2px",
                                        color: "black",
                                      }}
                                    >
                                      ₫
                                    </span>
                                  </Text>
                                </Box>
                              </Box>
                            ))}
                          <Box
                            flex
                            justifyContent="space-between"
                            alignItems="center"
                            className="product-item"
                          >
                            <Box
                              flex
                              alignItems="center"
                              className="product-info"
                            >
                              <Box>
                                <Text size="large" style={{ color: "black" }}>
                                  <span>
                                    <span>
                                      {t("orderManagement.orderDetail.total")}:
                                    </span>
                                  </span>
                                </Text>
                              </Box>
                            </Box>
                            <Box flex>
                              {priceFormatter(
                                item.products.reduce(
                                  (total, product) =>
                                    total +
                                    (product.unit_price ?? 0) *
                                      (product.quantity ?? 0),
                                  0
                                )
                              ) !==
                              priceFormatter(item.actual_payment_amount) ? (
                                <>
                                  <Text
                                    className="red-color"
                                    style={{
                                      textDecorationLine: "line-through",
                                    }}
                                  >
                                    <span style={{ paddingLeft: "6px" }}>
                                      <small>
                                        {" "}
                                        {priceFormatter(
                                          item.products.reduce(
                                            (total, product) =>
                                              total +
                                              (product.unit_price ?? 0) *
                                                (product.quantity ?? 0),
                                            0
                                          )
                                        )}
                                        ₫{" "}
                                      </small>
                                    </span>
                                  </Text>
                                  <Text>
                                    <span
                                      style={{
                                        paddingLeft: "6px",
                                        color: "black",
                                      }}
                                    >
                                      {priceFormatter(
                                        item.actual_payment_amount
                                      )}
                                      ₫
                                    </span>
                                  </Text>
                                </>
                              ) : (
                                <Text>
                                  <span
                                    style={{
                                      paddingLeft: "6px",
                                    }}
                                  >
                                    {priceFormatter(item.actual_payment_amount)}
                                    ₫
                                  </span>
                                </Text>
                              )}
                            </Box>
                          </Box>
                        </Box>
                        <Box pt={3} pb={2}>
                          {item.notes && (
                            <Box className="note">
                              <Text size="large" style={{ color: "black" }}>
                                {t("orderManagement.notes")}:{" "}
                                <i>"{item.notes}"</i>
                              </Text>
                            </Box>
                          )}

                          {item.status === ORDER_STATUS.PAYED && (
                            <Box flex mt={1}>
                              <Text size="large">
                                {t("orderManagement.orderDetail.totalPayment")}:
                              </Text>
                              <Text size="large">
                                <span style={{ paddingLeft: "6px" }}>
                                  {priceFormatter(item.actual_payment_amount)}₫{" "}
                                  {(() => {
                                    if (!item?.actual_payment_amount) return "";
                                    const reduceAmount =
                                      item?.value - item?.actual_payment_amount;
                                    if (reduceAmount === 0) return "";

                                    return (
                                      <span
                                        className="red-color"
                                        style={{
                                          marginLeft: "3px",
                                          fontWeight: 500,
                                        }}
                                      >
                                        (-{priceFormatter(reduceAmount)}₫)
                                      </span>
                                    );
                                  })()}
                                </span>
                              </Text>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ))
            ) : (
              <Box style={{ color: "black" }}>
                {t("userOrder.noHaveOrdersYet")}
              </Box>
            )}
          </Box>
        </Box>

        {!isEmpty(currentOrder) && (
          <PaymentModal
            show={showPaymentModal}
            order={currentOrder.products}
            onClose={() => setShowPaymentModal(false)}
            onPayment={zalo_pay_setting ? onZaloPay : onManuallyPayment}
          />
        )}

        <AddProductModal
          isShow={showOrderMore}
          data={productList.products.map((item) => ({ ...item, quantity: 0 }))}
          onClose={() => setShowOrderMore(false)}
          onSubmit={onSubmitOrderMore}
        />
        <div style={{ borderRadius: "10px" }}>
          {snackbarOpen && (
            <Snackbar onClose={() => setSnackbarOpen(false)} duration={3000}>
              <div
                className={`snackbar ${snackbarType === "success" ? "snackbar-success" : "snackbar-error"}`}
              >
                <div style={{ display: "flex" }}>
                  {snackbarType === "success" && (
                    <CheckCircleIcon
                      style={{ marginRight: 8, color: "green" }}
                    />
                  )}
                  {snackbarType === "error" && (
                    <ErrorIcon style={{ marginRight: 8, color: "red" }} />
                  )}
                  {snackbarMessage}
                </div>
              </div>
            </Snackbar>
          )}
        </div>
      </Page>
      <Box
        flex
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "#fff",
          position: "sticky",
          bottom: 0, 
          left: 0, 
          right: 0, 
        }}
      >
        <Box
          flex
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#757575",
            fontSize: "12px",
          }}
          onClick={() => navigate(`/menuu/${store_uuid}/${table_uuid}`)}
        >
          <RestaurantMenuOutlinedIcon
            style={{ color: "#757575", fontSize: "24px" }}
          />
          <span>{t("navbar.menu")}</span>
        </Box>

        <Box
          flex
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#f44336",
            fontSize: "12px",
          }}
          onClick={() => navigate(`/user/order/${store_uuid}`)}
        >
          <AssignmentOutlinedIcon
            style={{ color: "#f44336", fontSize: "24px" }}
          />
          <span>{t("navbar.order")}</span>
        </Box>

        <Box
          flex
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#757575",
            fontSize: "12px",
          }}
          onClick={() => navigate('/user/profile/bottomnavbar')}
        >
          <PersonOutlinedIcon style={{ color: "#757575", fontSize: "24px" }} />
          <span>{t("navbar.user")}</span>
        </Box>
      </Box>
    </>
  );
};

export default OrderPage;
