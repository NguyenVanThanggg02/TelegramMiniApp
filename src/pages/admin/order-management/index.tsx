import  { useEffect, useMemo, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  Avatar,
  Box,
  Button,
  DatePicker,
  Icon,
  Input,
  Page,
  Select,
  Text,
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
import { useNavigate, useParams } from "react-router-dom";
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
import moment from "moment";
import Slider from "rc-slider";
import ConfirmModal from "../../../components/modal/confirmModal";
import { useCloudStorage } from "@telegram-apps/sdk-react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Snackbar } from "@telegram-apps/telegram-ui";
import images from "../../../../assets/images.png"
interface User {
  avatar: string;
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

interface Table {
  uuid: string;
  name: string;
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

interface TableListState {
  is_update: boolean;
  tables: Table[];
}

interface ProductListState {
  is_update: boolean;
  products: Product[];
}

interface Filter {
  status: string;
  date: Date | null;
  search: string;
}

interface FetchOrderParams {
  store_uuid: string | undefined;
  page: number;
  per_page: number;
  date?: string; // Optional property
  status?: string; // Optional property
  order_by?: string
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
const OrderManagement: React.FC = () => {
  const { t } = useTranslation("global");
  const navigate = useNavigate();
  const { store_uuid } = useParams<{ store_uuid: string }>();
  const { isMobile } = useBreakpoint();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  
  const orderStatusesSlider = {
    0: t("orderManagement.statusSelect." + ORDER_STATUS.PENDING),
    50: t("orderManagement.statusSelect." + ORDER_STATUS.WAIT_FOR_PAY),
    100: t("orderManagement.statusSelect." + ORDER_STATUS.DONE),
  };

  const storeList = useRecoilValue(storeListState);
  const [, setStore] = useRecoilState(storeState);
  const [orderList, setOrderList] = useRecoilState(orderListState);
  const [tableList, setTableList] = useRecoilState<TableListState>(tableListState);
  const [, setCart] = useRecoilState(cartState);
  const [loading, setLoading] = useRecoilState(loadingState);
  const [, setProductList] = useRecoilState<ProductListState>(productListState);
  const user = useRecoilValue(userState);
  const [, setKeepScreenOn] = useState<boolean>(true);
  const cloudStorage = useCloudStorage();

  const [showModalConfirm, setShowModalConfirm] = useState<boolean>(false);
  const [orderCancelled, ] = useState<Order>({} as Order);
  const [filter, setFilter] = useState<Filter>({
    status: "all",
    date: null,
    search: "",
  });
  const [hideDatePicker, setHideDatePicker] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const [isNoMoreOrder, setIsNoMoreOrder] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);


  const onFilterChange = (type: keyof Filter, value: any) => {
    setFilter((prev) => ({ ...prev, [type]: value }));
  };


  const loadKeepScreenSetting = async () => {
    try {
      const storageData = await cloudStorage.get([KEEP_SCREEN_ON_STORE_KEY]);
      const storedKeepScreenOn = storageData[KEEP_SCREEN_ON_STORE_KEY];

      if (storedKeepScreenOn !== undefined) {
        setKeepScreenOn(JSON.parse(storedKeepScreenOn));
      }
    } catch (error) {
      console.log("Error loading keepScreenOn setting:", error);
    }
  };
  

  const displayOrders = useMemo(
    () =>
      orderList.orders.length
        ? orderList.orders.filter((item) => {
            const table = tableList.tables.find((table) => table.uuid === item.table_uuid);
            return (
              !tableList.tables.length ||
              (table?.name.toLowerCase().includes(filter.search.toLowerCase()) ?? false)
            );
          })
        : [],
    [orderList, filter, tableList],
  );
  

  // const onChangeStatus = async (order: Order, newStatus: string) => {
  //   const payload = {
  //     status: newStatus,
  //   };  
  //   const data = await updateStatusOrderRequest(order.uuid, payload);
  //   if (data?.error) {
  //     console.error("Error:", data.error);

  //     setSnackbarMessage(String(data.error));
  //     setSnackbarType("error"); 
  //     setSnackbarOpen(true);
  //   }
  // };


  const onChangeStatus = async (order: Order, newStatus: string) => {
    const payload = {
      status: newStatus,
    };
    
    try {
      const data = await updateStatusOrderRequest(order.uuid, payload);
      
      if (data?.error) {
        console.error("Error:", data.error);
        setSnackbarMessage(String(data.error));
        setSnackbarType("error");
        setSnackbarOpen(true);
      } else {
        
        setOrderList((prev) => ({
          ...prev,
          orders: prev.orders.map((o) =>
            o.uuid === order.uuid ? { ...o, status: newStatus } : o
          ).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          ),
        }));
        
        setSnackbarMessage(t("websocket.update_order")); 
        setSnackbarType("success");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setSnackbarMessage(String(error)); 
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
  };
  


  const goToOrderDetails = (order: Order) => {
    navigate(
      `/admin/order-management/details/index/${order.uuid}/${order.store_uuid}`,
    );
  };

  const fetchOrderDataByStore = async () => {
    const params: FetchOrderParams = {
      store_uuid,
      page,
      per_page: DEFAULT_PER_PAGE,
      order_by: "desc",    };
    
    if (filter.date && !hideDatePicker) {
      params.date = moment(filter.date).format("YYYY-MM-DD");
    }
    
    if (filter.status && filter.status !== "all") {
      params.status = filter.status;
    }
  
    const response = await fetchOrdersByStore(params);
  
    const data: Order[] = response.data;
  
    if (!response.error) {
      setOrderList({
        is_update: true,
        orders: data.sort(
          (a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      });
      if (data.length < DEFAULT_PER_PAGE) setIsNoMoreOrder(true);
      setLoading({ ...loading, isLoading: false });
    } else {
      setLoading({ ...loading, isLoading: false });
      console.error("Error fetching orders:", response.error);
    }
  };
  
  const fetTableDataByStore = async (store_uuid: string) => {
    const data = await fetchTablesForStore(store_uuid);
    if (!data?.error) {
      const tables = data.data as Table[]
      setTableList({
        is_update: true,
        tables,
      });
    } else {
      console.error("Error:", data.error);
    }
  };

  const fetProductDataByStore = async (store_uuid: string) => {
    const response = await getProductListByStore(store_uuid, true);
    const data = response.data
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
  
    const selectedStore = storeList.stores.find((item) => item.uuid === store_uuid);
  
    if (selectedStore) {
      setStore(selectedStore);
    } else {
      // Handle the case when the store is not found
      console.warn(`Store with uuid ${store_uuid} not found.`);
      // Optionally, set a default value or perform some other action
    }
  
    // setKeepScreen();
  
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
  
    const params: FetchOrderParams = {
      store_uuid,
      page: newPage,
      per_page: DEFAULT_PER_PAGE,
      order_by: "desc",
    };
  
    if (filter.date && !hideDatePicker) {
      params.date = moment(filter.date).format("YYYY-MM-DD");
    }
  
    if (filter.status && filter.status !== "all") {
      params.status = filter.status;
    }
  
    const response: ApiResponse<Order[]> = await fetchOrdersByStore(params);
  
    if (!response.error) {
      // Check if response.data is defined
      const orders: Order[] = response.data ?? []; // Default to empty array if undefined
  
      setIsLoadingMore(false);
  
      if (orders.length < DEFAULT_PER_PAGE) {
        setIsNoMoreOrder(true);
        console.log("No more orders");
      }
  
      setOrderList({
        is_update: true,
        orders: [...orders, ...orderList.orders].sort(
          (a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      });
    } else {
      setIsLoadingMore(false);
      setIsNoMoreOrder(true);
      console.error("Error fetching orders:", response.error);
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
      scrollRef.current?.removeEventListener("touchmove", handleTouchMove);
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
    container?.addEventListener("touchmove", handleTouchMove);
    container?.addEventListener("touchend", handleTouchEnd);
    container?.addEventListener("scroll", handleScroll);

    return () => {
      container?.removeEventListener("touchmove", handleTouchMove);
      container?.removeEventListener("touchend", handleTouchEnd);
      container?.removeEventListener("scroll", handleScroll);
    };
  }, [isLoadingMore, isNoMoreOrder, orderList]);
  const handleDateChange = (value: Date | undefined) => {
    setSelectedDate(value);
    onFilterChange("date", value);
  };
  return (
    <Page
      className="section-container order-management-container"
      ref={isMobile ? scrollRef : null}
      style={{ height: "100vh" }}
    >
      <OrderNotification
        authToken={user.authToken}
        store_uuid={store_uuid || ""}
      />
      <Box
        className="toolbar"
        flex
        justifyContent="space-between"
        alignItems="center"
      >
        <Box flex alignItems="center" className="toolbar_filter">
          <Box className="toolbar_filter_search">
            <Text style={{ color: "black" }}>
              {t("orderManagement.status")}
            </Text>
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
                  <option
                    value={value}
                    title={t("orderManagement.statusSelect." + value)}
                    key={index}
                  />
                )
              )}
            </Select>
          </Box>

          <Box className="toolbar_filter_search">
            <Text style={{ color: "black" }}>{t("orderManagement.date")}</Text>
            {hideDatePicker ? (
              <DatePicker
                key="datePicker-hideDatePicker"
                mask
                maskClosable
                value={selectedDate} // Pass the state value here
                onChange={handleDateChange}
                onVisibilityChange={(visible) => {
                  if (!visible) {
                    setHideDatePicker(false);
                  }
                }}
              />
            ) : (
              <Box style={{ position: "relative", width: "100%" }}>
                <DatePicker
                  key="datePicker-visible"
                  mask
                  maskClosable
                  value={filter?.date ?? undefined} // Convert null to undefined
                  onChange={(value) => {
                    onFilterChange("date", value);
                  }}
                />

                {filter?.date && (
                  <div
                    style={{
                      position: "absolute",
                      right: 12,
                      top: 12,
                      backgroundColor: "white",
                      cursor: "pointer",
                    }}
                    onClick={() => setHideDatePicker(true)}
                  >
                    <Icon icon="zi-close" />
                  </div>
                )}
              </Box>
            )}
          </Box>

          <Box className="toolbar_filter_search">
            <Text style={{ color: "black" }}>
              {t("orderManagement.search")}
            </Text>
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
            {displayOrders.length > 0 ? (
              displayOrders.map((order, id) => {
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
                      opacity:
                        order.status === ORDER_STATUS.CANCELLED ? 0.5 : 1,
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
                          src={order.user?.avatar}
                          style={{ marginRight: "10px" }}
                        />
                        <Text size="xLarge" bold style={{ color: "black" }}>
                          {
                            tableList.tables.find(
                              (table) => table.uuid === order.table_uuid
                            )?.name
                          }
                        </Text>
                      </Box>
                    </Box>
                    <Box
                      flex
                      justifyContent="space-between"
                      alignItems="center"
                      className="order-table-mobile_box"
                    >
                      <Text bold style={{ color: "black" }}>
                        {t("orderManagement.orderTime")}
                      </Text>
                      <Text style={{ color: "black" }}>
                        {timePeriodFormatter(order.created_at, t)}
                      </Text>
                    </Box>
                    <Box
                      flex
                      justifyContent="space-between"
                      alignItems="center"
                      className="order-table-mobile_box"
                    >
                      <Text bold style={{ color: "black" }}>
                        {t("orderManagement.notes")}
                      </Text>
                      <Text style={{ color: "black" }}>{order.notes}</Text>
                    </Box>
                    {order.status === ORDER_STATUS.CANCELLED ? (
                      <Box className="order-cancelled red-color">
                        <Text style={{ color: "black" }}>
                          {t("orderManagement.orderCancelled")}
                        </Text>
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
                                onChangeStatus(
                                  order,
                                  ORDER_STATUS.WAIT_FOR_PAY
                                );
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
              })
            ) : (
              <Box
                className="order-table_empty"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex", // Thêm thuộc tính display: flex
                    justifyContent: "center", // Căn giữa theo chiều ngang
                    alignItems: "center", // Căn giữa theo chiều dọc
                    height: "100%", // Đảm bảo div có chiều cao
                  }}
                >
                  <img
                    src={images}
                    style={{
                      width: "160px",
                      height: "auto", // Thay đổi thành auto để giữ tỷ lệ khung hình
                      opacity: 0.4,
                      marginTop: "10px",
                    }}
                  />
                </div>
                <Text
                  style={{ color: "rgba(0, 0, 0, 0.5)", textAlign: "center" }}
                >
                  không có đơn hàng!!!!
                </Text>
              </Box>
            )}
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
              ref={
                isMobile
                  ? (scrollRef as React.MutableRefObject<HTMLDivElement>)
                  : undefined
              }
            >
              <table>
                <tbody>
                  {displayOrders.map((order, i) => (
                    <tr key={i}>
                      <td className="col">
                        {/* <Avatar src={order.user.avatar} /> */}
                      </td>
                      <td className="col">
                        {
                          tableList.tables.find(
                            (table) => table.uuid === order.table_uuid
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
            <Text size="large" style={{ color: "black" }}>
              Loading...
            </Text>
          </Box>
        )}
      </Box>
      <Box mb={5}></Box>

      <ConfirmModal
        isShowModal={showModalConfirm}
        onConfirm={() => {
          onChangeStatus(orderCancelled, ORDER_STATUS.CANCELLED);
          setShowModalConfirm(false);
          // setOrderCancelled({});
        }}
        setIsShowModal={setShowModalConfirm}
        content={t("main.confirmCancel")}
      />
      <div style={{ borderRadius: "10px" }}>
        {snackbarOpen && (
          <Snackbar onClose={() => setSnackbarOpen(false)} duration={3000}>
            <div
              className={`snackbar ${snackbarType === "success" ? "snackbar-success" : "snackbar-error"}`}
            >
              <div style={{ display: "flex" }}>
                {snackbarType === "success" && (
                  <CheckCircleIcon style={{ marginRight: 8, color: "green" }} />
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
  );
}

export default OrderManagement;
