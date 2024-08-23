import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  Box,
  Button,
  DatePicker,
  Icon,
  Input,
  Page,
  Select,
  Text,
  useNavigate,
  useSnackbar,
  Avatar,
} from "zmp-ui";
import {
  cartState,
  loadingState,
  orderListState,
  productListState,
  storeListState,
  storeState,
  tableListState,
  userState,
} from "../../../state";
import "./styles.scss";
import OrderStatus from "../../../components/order-status";
import {
  DEFAULT_PER_PAGE,
  ORDER_STATUS,
  KEEP_SCREEN_ON_STORE_KEY,
} from "../../../constants";
import { timePeriodFormatter } from "../../../utils/timePeriodFormatter";
import { useParams } from "react-router-dom";
import {
  fetchOrdersByStore,
  fetchTablesForStore,
  getProductListByStore,
  updateStatusOrderRequest,
} from "../../../api/api";
import useBreakpoint from "../../../hooks/useBreakpoint";
import OrderNotification from "../../../components/ws/order_notification";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import { keepScreen, getStorage } from "zmp-sdk/apis";
import moment from "moment";
import Slider from "rc-slider";
import ConfirmModal from "../../../components/modal/confirmModal";

function OrderManagement() {
  const { t } = useTranslation("global");
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { store_uuid } = useParams();
  const { isMobile } = useBreakpoint();

  const orderStatusesSlider = {
    0: t("orderManagement.statusSelect." + ORDER_STATUS.PENDING),
    50: t("orderManagement.statusSelect." + ORDER_STATUS.WAIT_FOR_PAY),
    100: t("orderManagement.statusSelect." + ORDER_STATUS.DONE),
  };

  const storeList = useRecoilValue(storeListState);
  const [store, setStore] = useRecoilState(storeState);
  const [orderList, setOrderList] = useRecoilState(orderListState);
  const [tableList, setTableList] = useRecoilState(tableListState);
  const [cart, setCart] = useRecoilState(cartState);
  const [loading, setLoading] = useRecoilState(loadingState);
  const [productList, setProductList] = useRecoilState(productListState);
  const user = useRecoilValue(userState);
  const [keepScreenOn, setKeepScreenOn] = useState(true);

  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [orderCancelled, setOrderCancelled] = useState({});
  const [filter, setFilter] = useState({
    status: "all",
    date: null,
    search: "",
  });
  const [hideDatePicker, setHideDatePicker] = useState(false);

  const [page, setPage] = useState(1);
  const [isNoMoreOrder, setIsNoMoreOrder] = useState(false);

  const scrollRef = useRef(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const onFilterChange = (type, value) => {
    setFilter((prev) => ({ ...prev, [type]: value }));
  };

  const loadKeepScreenSetting = async () => {
    try {
      const storageData = await getStorage({
        keys: [KEEP_SCREEN_ON_STORE_KEY],
      });
      const storedKeepScreenOn = storageData[KEEP_SCREEN_ON_STORE_KEY];

      if (storedKeepScreenOn !== undefined) {
        setKeepScreenOn(storedKeepScreenOn);
      }
    } catch (error) {
      console.log("Error loading keepScreenOn setting:", error);
    }
  };

  const setKeepScreen = async () => {
    try {
      await keepScreen({
        keepScreenOn: keepScreenOn,
      });
    } catch (error) {
      // xử lý khi gọi api thất bại
      console.log(error);
    }
  };

  const displayOrders = useMemo(
    () =>
      orderList.orders.length
        ? orderList.orders.filter(
            (item) =>
              !tableList.tables.length ||
              tableList.tables
                .find((table) => table.uuid === item.table_uuid)
                .name.toLowerCase()
                .includes(filter.search.toLowerCase()),
          ) || []
        : [],
    [orderList, filter, tableList],
  );

  const onChangeStatus = async (order, newStatus) => {
    const payload = {
      status: newStatus,
    };
    const data = await updateStatusOrderRequest(order.uuid, payload);
    if (data?.error) {
      console.error("Error:", data.error);

      snackbar.openSnackbar({
        duration: 3000,
        text: data.error,
        type: "error",
      });
    }
  };

  const goToOrderDetails = (order) => {
    navigate(
      `/admin/order-management/details/index/${order.uuid}/${order.store_uuid}`,
    );
  };

  const fetchOrderDataByStore = async () => {
    const params = {
      store_uuid,
      page,
      perPage: DEFAULT_PER_PAGE,
    };
    if (filter.date && !hideDatePicker) {
      params.date = moment(filter.date).format("YYYY-MM-DD");
    }
    if (filter.status && filter.status !== "all") {
      params.status = filter.status;
    }
    const data = await fetchOrdersByStore(params);
    if (!data?.error) {
      setOrderList({
        is_update: true,
        orders: data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        ),
      });
      if (data.length < DEFAULT_PER_PAGE) setIsNoMoreOrder(true);
      setLoading({ ...loading, isLoading: false });
    } else {
      setLoading({ ...loading, isLoading: false });
      console.error("Error fetching orders:", data.error);
    }
  };

  const fetTableDataByStore = async (store_uuid) => {
    const data = await fetchTablesForStore(store_uuid);
    if (!data?.error) {
      setTableList({
        is_update: true,
        tables: data,
      });
    } else {
      console.error("Error:", data.error);
    }
  };

  const fetProductDataByStore = async (store_uuid) => {
    const data = await getProductListByStore(store_uuid, true);
    if (!data?.error) {
      setProductList({
        is_update: true,
        products: data,
      });
    } else {
      console.error("Error:", data.error);
    }
  };

  useEffect(() => {
    // Load cài đặt từ cache khi trang được load
    loadKeepScreenSetting();
  }, []);

  useEffect(() => {
    fetchOrderDataByStore();
  }, [filter.status, filter.date, hideDatePicker]);

  useEffect(() => {
    setLoading({ ...loading, isLoading: true });
    setCart([]);
    if (!store_uuid) return;

    setStore(storeList.stores.find((item) => item.uuid === store_uuid));

    setKeepScreen();

    fetchOrderDataByStore();
    fetTableDataByStore(store_uuid);
    fetProductDataByStore(store_uuid);
  }, [store_uuid, storeList]);

  // remove loading when get all needed data
  useEffect(() => {
    if (orderList.orders.length && tableList.tables.length)
      setLoading({ ...loading, isLoading: false });
  }, [orderList, tableList]);

  // LOGIC SCROLL BOTTOM TO LOAD MORE DATA
  const fetchDataMore = async () => {
    console.log("load more orders...");
    const newPage = page + 1;
    setPage(newPage);

    const params = {
      store_uuid,
      page: newPage,
      perPage: DEFAULT_PER_PAGE,
    };
    if (filter.date && !hideDatePicker) {
      params.date = moment(filter.date).format("YYYY-MM-DD");
    }
    if (filter.status && filter.status !== "all") {
      params.status = filter.status;
    }
    const data = await fetchOrdersByStore(params);
    if (!data?.error) {
      setIsLoadingMore(false);

      if (data?.length < DEFAULT_PER_PAGE) {
        setIsNoMoreOrder(true);
        console.log("No more orders");
      }

      setOrderList({
        is_update: true,
        orders: [...data, ...orderList.orders].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        ),
      });
    } else {
      setIsLoadingMore(false);
      setIsNoMoreOrder(true);
      console.error("Error fetching orders:", data.error);
    }
  };

  useEffect(() => {
    if (isNoMoreOrder) return;

    const handleTouchMove = () => {
      const container = scrollRef.current;
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollTop + clientHeight >= scrollHeight) {
          // Trigger the scroll event when reaching the bottom of the container
          const scrollEvent = new Event("scroll");
          container.dispatchEvent(scrollEvent);
        }
      }
    };

    const handleTouchEnd = () => {
      scrollRef.current.removeEventListener("touchmove", handleTouchMove);
    };

    const handleScroll = () => {
      const container = scrollRef.current;
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollTop + clientHeight >= scrollHeight && !isLoadingMore) {
          console.log("Scrolled to the bottom!");
          setIsLoadingMore(true);
          fetchDataMore();
        }
      }
    };

    const container = scrollRef.current;
    container.addEventListener("touchmove", handleTouchMove);
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [isLoadingMore, isNoMoreOrder, orderList]);

  return (
    <Page
      className="section-container order-management-container"
      ref={isMobile ? scrollRef : null}
      style={{ height: "100px" }}
    >
      <OrderNotification authToken={user.authToken} store_uuid={store_uuid} />
      <Box
        className="toolbar"
        flex
        justifyContent="space-between"
        alignItems="center"
      >
        <Box flex alignItems="center" className="toolbar_filter">
          <Box className="toolbar_filter_search">
            <Text>{t("orderManagement.status")}</Text>
            <Select
              closeOnSelect
              mask
              value={filter.status}
              onChange={(value) => {
                onFilterChange("status", value);
              }}
            >
              {Object.values({ ALL: "all", ...ORDER_STATUS }).map(
                (value, index) => (
                  <Option
                    value={value}
                    title={t("orderManagement.statusSelect." + value)}
                    key={index}
                  />
                ),
              )}
            </Select>
          </Box>

          <Box className="toolbar_filter_search">
            <Text>{t("orderManagement.date")}</Text>
            {hideDatePicker ? (
              <DatePicker
                key="datePicker-hideDatePicker"
                mask
                maskClosable
                value={null}
                onChange={(value) => {
                  onFilterChange("date", value);
                }}
                onVisibilityChange={(visible) => {
                  if (!visible) {
                    setHideDatePicker(false);
                  }
                }}
              />
            ) : (
              <Box width="100%" style={{ position: "relative" }}>
                <DatePicker
                  key="datePicker-visible"
                  mask
                  maskClosable
                  value={filter?.date}
                  onChange={(value) => {
                    onFilterChange("date", value);
                  }}
                />
                {filter?.date && (
                  <Icon
                    icon="zi-close"
                    style={{
                      position: "absolute",
                      right: 12,
                      top: 12,
                      backgroundColor: "white",
                    }}
                    onClick={() => setHideDatePicker(true)}
                  />
                )}
              </Box>
            )}
          </Box>

          <Box className="toolbar_filter_search">
            <Text>{t("orderManagement.search")}</Text>
            <Input.Search
              className="search-input"
              onChange={(e) => onFilterChange("search", e.target.value)}
            />
          </Box>
        </Box>
        <Box className="toolbar_add-btn">
          <Button
            className="fw-500"
            onClick={() =>
              navigate(`/admin/order-management/create/index/${store_uuid}`)
            }
            prefixIcon={<AddIcon />}
          >
            {t("orderManagement.createOrder")}
          </Button>
        </Box>
      </Box>

      <Box style={{ marginBottom: "50px" }}>
        {isMobile ? (
          <Box>
            {displayOrders.map((order, id) => {
              let valStatusSlider = 0;
              if (order.status === ORDER_STATUS.WAIT_FOR_PAY) {
                valStatusSlider = 50;
              } else if (order.status === ORDER_STATUS.DONE) {
                valStatusSlider = 100;
              }

              return (
                <Box
                  className="order-table order-table-mobile"
                  key={id}
                  onClick={() => goToOrderDetails(order)}
                  style={{
                    opacity: order.status === ORDER_STATUS.CANCELLED ? 0.5 : 1,
                  }}
                >
                  <Box
                    flex
                    justifyContent="space-between"
                    alignItems="center"
                    className="order-table-mobile_box"
                  >
                    <Box flex alignItems="center" justifyContent="center">
                      <Avatar
                        src={order.user.avatar}
                        style={{ marginRight: "10px" }}
                      />
                      <Text size="xLarge" bold>
                        {
                          tableList.tables.find(
                            (table) => table.uuid === order.table_uuid,
                          )?.name
                        }
                      </Text>
                    </Box>

                    {/* <OrderStatus
                    status={order.status}
                    onChange={(newStatus) => onChangeStatus(order, newStatus)}
                  /> */}

                    {/* {order.status !== ORDER_STATUS.DONE &&
                      order.status !== ORDER_STATUS.CANCELLED && (
                        <Box>
                          <Button
                            className="cancel-order-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowModalConfirm(true);
                              setOrderCancelled(order);
                            }}
                          >
                            {t("orderManagement.cancelOrder")}
                          </Button>
                        </Box>
                      )} */}
                  </Box>
                  <Box
                    flex
                    justifyContent="space-between"
                    alignItems="center"
                    className="order-table-mobile_box"
                  >
                    <Text bold>{t("orderManagement.orderTime")}</Text>
                    <Text>{timePeriodFormatter(order.created_at, t)}</Text>
                  </Box>
                  <Box
                    flex
                    justifyContent="space-between"
                    alignItems="center"
                    className="order-table-mobile_box"
                  >
                    <Text bold>{t("orderManagement.notes")}</Text>
                    <Text>{order.notes}</Text>
                  </Box>
                  {order.status === ORDER_STATUS.CANCELLED ? (
                    <Box className="order-cancelled red-color">
                      <Text>{t("orderManagement.orderCancelled")}</Text>
                    </Box>
                  ) : (
                    <Box
                      className="slider-status-order"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Slider
                        min={0}
                        value={valStatusSlider}
                        marks={orderStatusesSlider}
                        step={50}
                        onChange={(val) => {
                          switch (val) {
                            case 0:
                              onChangeStatus(order, ORDER_STATUS.PENDING);
                              break;
                            case 50:
                              onChangeStatus(order, ORDER_STATUS.WAIT_FOR_PAY);
                              break;
                            case 100:
                              onChangeStatus(order, ORDER_STATUS.DONE);
                              break;
                          }
                        }}
                        className={
                          order.status === ORDER_STATUS.DONE
                            ? "slider-green-theme"
                            : "slider-yellow-theme"
                        }
                      />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box className="order-table">
            <Box className="order-table_head">
              <table>
                <thead style={{ height: "90px" }}>
                  <tr>
                    <th className="col">
                      {t("orderManagement.orderTable.user")}
                    </th>
                    <th className="col">
                      {t("orderManagement.orderTable.tableName")}
                    </th>
                    <th className="col">
                      {t("orderManagement.orderTable.time")}
                    </th>
                    <th className="col">
                      {t("orderManagement.orderTable.status")}
                    </th>
                    <th className="col">
                      {t("orderManagement.orderTable.notes")}
                    </th>
                    <th className="col">
                      {t("orderManagement.orderTable.details")}
                    </th>
                  </tr>
                </thead>
              </table>
            </Box>

            <Box
              className="order-table_body"
              ref={!isMobile ? scrollRef : null}
            >
              <table>
                <tbody>
                  {displayOrders.map((order, i) => (
                    <tr key={i}>
                      <td className="col">
                        <Avatar src={order.user.avatar} />
                      </td>
                      <td className="col">
                        {
                          tableList.tables.find(
                            (table) => table.uuid === order.table_uuid,
                          )?.name
                        }
                      </td>
                      <td className="col">
                        {timePeriodFormatter(order.created_at, t)}
                      </td>
                      <td className="col">
                        <OrderStatus
                          status={order.status}
                          onChange={(newStatus) =>
                            onChangeStatus(order, newStatus)
                          }
                        />
                      </td>
                      <td className="col">{order.notes}</td>
                      <td className="col">
                        <Box
                          className="button-actions"
                          onClick={() => goToOrderDetails(order)}
                        >
                          <Icon icon="zi-play-solid" />
                        </Box>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Box>
        )}

        {isLoadingMore && (
          <Box>
            <Text size="large">Loading...</Text>
          </Box>
        )}
      </Box>
      <Box mb={5}></Box>

      <ConfirmModal
        isShowModal={showModalConfirm}
        onConfirm={() => {
          onChangeStatus(orderCancelled, ORDER_STATUS.CANCELLED);
          setShowModalConfirm(false);
          setOrderCancelled({});
        }}
        setIsShowModal={setShowModalConfirm}
        content={t("main.confirmCancel")}
      />
    </Page>
  );
}

export default OrderManagement;
