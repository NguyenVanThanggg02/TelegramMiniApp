import React, { useEffect, useMemo, useState } from "react";
import "./styles.scss";
import { loadingState, orderListByUserState, userState } from "../../state";
import { useRecoilState, useRecoilValue } from "recoil";
import { fetchHistoryOrdersByStore } from "../../api/api";
import { Box, Page, Select, Text, useSnackbar } from "zmp-ui";
import { useTranslation } from "react-i18next";
import { groupBy, isEmpty } from "lodash";
import { dateFormatterYYYYMMDD } from "../../utils/dateFormatter";
import { priceFormatter } from "../../utils/numberFormatter";
import { ORDER_STATUS } from "../../constants";
import LoadingComponent from "../../components/loading_component";
import storeIcon from "../../static/icons/store.png";

const OrderHistory: React.FC = () => {
  const { t } = useTranslation("global");

  const user = useRecoilValue(userState);
  const [loading, setLoading] = useRecoilState(loadingState);
  const [orderListByUser, setOrderListByUser] = useRecoilState(orderListByUserState);

  const [selectedStore, setSelectedStore] = useState<string>(t("orderHistory.allStore"));
  const snackbar = useSnackbar();

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
    if (!data?.error) {
      setOrderListByUser({
        is_update: true,
        orders: [],
      });
    } else {
      snackbar.openSnackbar({
        duration: 3000,
        text:
          typeof data.error === "string"
            ? data.error
            : t("snackbarMessage.fetchOrderHistoryFailed"),
        type: "error",
      });
    }

    setLoading({ ...loading, isLoading: false });
  };

  useEffect(() => {
    setLoading({ ...loading, isLoading: true });
    if (!user?.authToken) return;

    setTimeout(() => {
      getHistoryOrders();
    }, 500);
  }, [user.authToken]);

  return (
    <Page className="section-container">
      <LoadingComponent />
      <Box className="order-history">
        {!isEmpty(orderHistoryList) ? (
          <>
            <Box className="filter-section" mb={2}>
              <Box className="filter-section_title">
                <Text>{t("orderHistory.filterByStore")}</Text>
              </Box>
              <Box className="filter-section_filter">
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
                          item.products.map((item: any, index: any) => (
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
                                  <Text size="large">
                                    <span className="fw-500">
                                      {item.product_name} (x{item.quantity})
                                    </span>
                                  </Text>
                                </Box>
                              </Box>
                              <Box>
                                <Text size="normal">
                                  {priceFormatter(
                                    item.unit_price * item.quantity,
                                  )}
                                  <span style={{ marginLeft: "2px" }}>₫</span>
                                </Text>
                              </Box>
                            </Box>
                          ))}
                      </Box>
                      <Box pt={1}>
                        {item.notes && (
                          <Box className="note">
                            <Text size="large">
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
          <Box>{t("userOrder.noHaveOrdersYet")}</Box>
        )}
      </Box>
    </Page>
  );
}

export default OrderHistory;
