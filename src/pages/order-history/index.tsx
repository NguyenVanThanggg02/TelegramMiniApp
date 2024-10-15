import React, { useEffect, useMemo, useState } from "react";
import "./styles.scss";
import { loadingState, orderListByUserState, userState } from "../../state";
import { useRecoilState, useRecoilValue } from "recoil";
import { fetchHistoryOrdersByStore, getStoreByUUID } from "../../api/api";
import { Box, Page, Select, Text } from "zmp-ui";
import { useTranslation } from "react-i18next";
import { groupBy, isEmpty } from "lodash";
import { dateFormatterYYYYMMDD } from "../../utils/dateFormatter";
import { priceFormatter } from "../../utils/numberFormatter";
import { ORDER_STATUS } from "../../constants";
import LoadingComponent from "../../components/loading_component";
import storeIcon from "../../static/icons/store.png";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Snackbar } from "@telegram-apps/telegram-ui";

interface User {
  avatar: string;
}

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

interface Order {
  invoice_uuid?: string;
  uuid: string;
  user?: User;
  created_at: string;
  store_name: string;
  table_uuid: string;
  store_uuid: string;
  status: string;
  products: Product[]; 
  notes?: string;
  actual_payment_amount: number;
  value: number;
}

const OrderHistory: React.FC = () => {
  const { t } = useTranslation("global");

  const user = useRecoilValue(userState);
  const [loading, setLoading] = useRecoilState(loadingState);
  const [orderListByUser, setOrderListByUser] = useRecoilState(orderListByUserState);

  const [selectedStore, setSelectedStore] = useState<string>(t("orderHistory.allStore"));
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  const [store_uuid, setStore_uuid] = useState('')

  const [dataLoaded, setDataLoaded] = useState(false);
  const [currency, setCurrency] = useState<String | null>(null);
  
  const getStoreDetail = async () => {
    if (store_uuid) {
      const response = await getStoreByUUID(store_uuid);
      console.log(response);
      
      if (response.data) {
        const metadata = JSON.parse(response.data.metadata);
        const currencyValue = metadata.currency || '$'; 
        setCurrency(currencyValue);
      } else {
        console.error("Error fetching store data:", response.error);
      }
    }

  };

  const orderHistoryList = useMemo(() => {
    if (!orderListByUser.orders?.length) return null;

    const filterOrders = orderListByUser.orders
      .filter((it) =>
        selectedStore === t("orderHistory.allStore")
          ? true
          : it.store_name === selectedStore,
      ) // filter by store name
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ) // sort newest
      .map((item) => ({
        ...item,
        created_at: dateFormatterYYYYMMDD(item.created_at),
      })); // mapping with new createdAt

    return groupBy(filterOrders, (i:any) => i.created_at);
  }, [orderListByUser, selectedStore]);

  const filterByStore = useMemo(() => {
    if (!orderListByUser.orders?.length) return null;

    const uniqStore: string[] = [];
    orderListByUser.orders.forEach((item) => {
      if (!uniqStore.includes(item.store_name)) {
        uniqStore.push(item.store_name);
      }
    });

    return uniqStore;
  }, [orderListByUser]);

  const getHistoryOrders = async () => {
    const data = await fetchHistoryOrdersByStore();
    setStore_uuid(data.data[0].store_uuid);
    
    if (!data?.error) {
      const orders = data.data as Order[]; 
      setOrderListByUser({
        is_update: true,
        orders,
      });
      if (orders.length > 0) {
        setStore_uuid(orders[0].store_uuid);  
      }
    } else {
      setSnackbarMessage(typeof data.error === "string"
        ? data.error
        : t("snackbarMessage.fetchOrderHistoryFailed"));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }

  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading({ ...loading, isLoading: true });

      try {
        await getHistoryOrders(); 

        if (store_uuid) {
          await getStoreDetail();  
        }

        setDataLoaded(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading({ ...loading, isLoading: false });
      }
    };

    fetchData();
  }, [user.authToken, store_uuid]);
  if (!dataLoaded) {
    setLoading({ ...loading, isLoading: true });
    return; 
}
  return (
    <Page className="section-container">
      <LoadingComponent />
      {dataLoaded && (
      <Box className="order-history">
        {!isEmpty(orderHistoryList) ? (
          <>
            <Box className="filter-section" mb={2}>
              <Box className="filter-section_title">
                <Text>{t("orderHistory.filterByStore")}</Text>
              </Box>
              <Box className="filter-section_filter" style={{color:'black'}}>
                <Select
                  closeOnSelect
                  placeholder={t("orderHistory.allStore")}
                  value={selectedStore}
                  onChange={(e) => {
                    if (typeof e === 'string') {
                      setSelectedStore(e);
                    }
                  }}
                >
                  <option
                    value={t("orderHistory.allStore")}
                    title={t("orderHistory.allStore")}
                  />
                  {filterByStore?.map((item, index) => (
                    <option key={index} value={item} title={item} />
                  ))}
                </Select>
              </Box>
            </Box>

            {Object.keys(orderHistoryList).map((key, keyIndex) => (
              <Box key={keyIndex}>
                <Box pt={4}>
                  <Text className="grey-color">
                    <i>{key}</i>
                  </Text>
                </Box>
                {orderHistoryList[key].map((item: any, index: any) => (
                  <Box className="order__main" mt={3} key={index}>
                    <Box className={`order__status status-${item.status}`}>
                      {item.status}
                    </Box>
                    <Box className="products-and-note">
                      <Box flex>
                        <img className="item-img" src={storeIcon}></img>
                        <Text size="small" className="grey-color">
                          {item.store_name}
                        </Text>
                      </Box>
                      <Box className="products">
                        {item.products.length &&
                          item.products.map((product: any, index: any) => (
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
                                  <Text size="large" style={{color:'black'}}>
                                    <span className="fw-500">
                                      {product.product_name} (x{product.quantity})
                                    </span>
                                  </Text>
                                </Box>
                              </Box>
                              <Box>
                                <Text size="normal" style={{color:'black'}} >
                                  {priceFormatter(
                                    product.unit_price * product.quantity
                                  )}
                                  <span style={{ marginLeft: "2px" }}>{currency}</span>
                                </Text>
                              </Box>
                            </Box>
                          ))}
                      </Box>
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
                                <Text size="large" style={{color:'black'}}>
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
                                  (total: any, product: any) =>
                                    total +
                                    product.unit_price * product.quantity,
                                  0,
                                ),
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
                                            (total: any, product: any) =>
                                              total +
                                              product.unit_price *
                                                product.quantity,
                                            0,
                                          ),
                                        )}
                                        {currency}{" "}
                                      </small>
                                    </span>
                                  </Text>
                                  <Text>
                                    <span
                                      style={{
                                        paddingLeft: "6px",color:'black'
                                      }}
                                    >
                                      {priceFormatter(
                                        item.actual_payment_amount,
                                      )}
                                      {currency}
                                    </span>
                                  </Text>
                                </>
                              ) : (
                                <Text>
                                  <span
                                    style={{
                                      paddingLeft: "6px",color:'black'
                                    }}
                                  >
                                    {priceFormatter(item.actual_payment_amount)}
                                    {currency}
                                  </span>
                                </Text>
                              )}
                            </Box>
                          </Box>
                      <Box pt={1}>
                        {item.notes && (
                          <Box className="note">
                            <Text size="large" style={{color:'black'}}>
                              {t("orderManagement.notes")}:{" "}
                              <i>"{item.notes}"</i>
                            </Text>
                          </Box>
                        )}

                        {item.status === ORDER_STATUS.PAYED && (
                          <Box flex mb={1}>
                            <Text size="large">
                              {t("orderManagement.orderDetail.totalPayment")}:
                            </Text>
                            <Text size="large">
                              <span style={{ paddingLeft: "6px" }}>
                                {priceFormatter(item.actual_payment_amount)}{currency}{" "}
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
                                      (-{priceFormatter(reduceAmount)}{currency})
                                    </span>
                                  );
                                })()}
                              </span>
                            </Text>
                          </Box>
                        )}

                        {/* <Box>
                          <Text size="large">
                            {t("storeManagement.store")}: {item.store_name}
                          </Text>
                        </Box> */}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}
          </>
        ) : (
          <Box style={{color:'black'}}>{t("userOrder.noHaveOrdersYet")}</Box>
        )}
      </Box>
    )}
      <div style={{borderRadius:'10px'}}>
          {snackbarOpen && (
            <Snackbar onClose={() => setSnackbarOpen(false)} duration={3000}>
              <div className={`snackbar ${snackbarType === "success" ? "snackbar-success" : "snackbar-error"}`}>
                <div style={{display:'flex'}}>
                  {snackbarType === "success" && <CheckCircleIcon style={{ marginRight: 8, color:'green' }} />} 
                  {snackbarType === "error" && <ErrorIcon style={{ marginRight: 8, color:'red' }} />} 
                  {snackbarMessage}
                </div>
              </div>
            </Snackbar>
          )}
        </div>
    </Page>
  );
}

export default OrderHistory;