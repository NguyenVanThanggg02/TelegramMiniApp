import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  Box,
  Icon,
  Input,
  Page,
  Select,
  Text,
  Avatar,
  Button,
} from "zmp-ui";
import {
  loadingState,
  orderState,
  productListState,
  spinnerState,
  tableListState,
  userState,
} from "../../../../state";
import { priceFormatter } from "../../../../utils/numberFormatter";
// import { shortPriceFormatter } from "../../../../utils/shortPriceFormatter";
import {
  DEFAULT_IMAGE_PRODUCT,
  ORDER_STATUS,
  PRODUCT_ORDER_STATUS,
  // VOUCHER_TYPE,
} from "../../../../constants";
import "./styles.scss";
import { timePeriodFormatter } from "../../../../utils/timePeriodFormatter";
import DishOrderSheet from "../../../../components/dish/dish-order";
import {
  fetchInvoiceDetails,
  fetchOrderByUUID,
  getProductListByStore,
  updateOrderRequest,
  updateQuantityProductRequest,
  updateStatusOrderRequest,
} from "../../../../api/api";
import { isEmpty, sum } from "lodash";
import AddProductModal from "../add-products-modal";
// import useBreakpoint from "../../../../hooks/useBreakpoint";
import OrderNotification from "../../../../components/ws/order_notification";
import { useTranslation } from "react-i18next";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import ConfirmModal from "../../../../components/modal/confirmModal";

import dmIcon from "../../../../static/icons/dm.png";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Snackbar } from "@telegram-apps/telegram-ui";
import useStoreDetail from "@/components/userStoreDetail";

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
  status: string;
  products: Product[]; 
  notes?: string;
  actual_payment_amount: number;
  value: number;
}

interface InvoiceData {
  voucher?: {
    voucher_type: string;
    voucher_value: number;
    voucher_min_order_value: number;
  };
}

interface Payload {
  store_uuid: string;
  order: Order;
  uuid: string;
  product_uuid: string;
}

const OrderManagementDetails: React.FC = () => {
  const { t } = useTranslation("global");
  const { order_uuid, store_uuid } = useParams<{ order_uuid: string; store_uuid: string }>();

  // const { isMobile } = useBreakpoint();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");


  const [productList, setProductList] = useRecoilState(productListState);
  console.log(productList);
  
  const tableList = useRecoilValue(tableListState);
  const user = useRecoilValue(userState);
  const orderGlobal = useRecoilValue(orderState);
  const [loading, setLoading] = useRecoilState(loadingState);
  const [, setSpinner] = useRecoilState(spinnerState);
  const { currency } = useStoreDetail();

  const orderStatusesSlider = {
    0: t("orderManagement.statusSelect." + ORDER_STATUS.PENDING),
    50: t("orderManagement.statusSelect." + ORDER_STATUS.WAIT_FOR_PAY),
    100: t("orderManagement.statusSelect." + ORDER_STATUS.DONE),
  };
  const orderItemStatusesSlider = {
    0: t("orderManagement.statusItemSelect." + PRODUCT_ORDER_STATUS.PENDING),
    100: t("orderManagement.statusItemSelect." + PRODUCT_ORDER_STATUS.FINISHED),
  };

  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [order, setOrder] = useState({} as Order);
  const [statusOrderSlider, setStatusOrderSlider] = useState(0);
  // const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [, setInvoiceData] = useState<InvoiceData | null>(null);
  const [notes, setNotes] = useState("");
  const [isShowOrderUpdate, setIsShowOrderUpdate] = useState(false);
  const [selectedProduct, setSelectedProduct ] = useState<Product>({} as Product);
  const [enabledNotes, setEnabledNotes] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditableOrder, setIsEditableOrder] = useState(true);

  useEffect(() => {
    if (order.status !== ORDER_STATUS.PENDING) {
      setIsEditableOrder(false); // Ẩn  thêm món nếu trạng thái != pd
    } else {
      setIsEditableOrder(true);  // Hiện nếu trạng thái là pd
    }
  }, [order.status]);

  // const isEditableOrder = useMemo(
  //   () => order.status === ORDER_STATUS.PENDING,
  //   [order.status]
  // );

  const onOpenUpdateProduct = (product: Product) => {
    setIsShowOrderUpdate(true);
    setSelectedProduct(product);
  };

  const onUpdateDeliveryQuantity = async (product: Product) => {
   const payload = {
    order_item_uuid: product.order_item_uuid,
    delivered_quantity: product.delivered_quantity,
  };

    setSpinner(true);
    const data = await updateQuantityProductRequest(order.uuid, payload);

    if (!data?.error) {
      setOrder(data.data);
      setNotes(data.data.notes);

      setSnackbarMessage(t("snackbarMessage.deliveredSuccess"));
      setSnackbarType("success");
      setSnackbarOpen(true);
    } else {
      console.error("Error:", data.error);
      setSnackbarMessage(String(data.error));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
    setSpinner(false);
  };

  const onSubmitUpdateProductOrder = async (payload: Payload) => {
    const mappingPayload = {
      store_uuid,
      order: {
        ...payload.order,
        products: payload.order.products.map(
          ({ uuid, product_uuid, quantity }) => ({
            uuid: product_uuid || uuid,
            quantity,
          }),
        ),
      },
    };
    setSpinner(true);

    const data = await updateOrderRequest(mappingPayload);
    if (!data?.error) {
      setOrder(data.data as Order);
      setNotes(data.data.notes);
      setSpinner(false);
    } else {
      console.error("Error:", data.error);
      setSnackbarMessage(String(data.error));
      setSnackbarType("error");
      setSnackbarOpen(true);
      setSpinner(false);
    }
  };

  const onUpdateQuantity = (productUpdated: Product & { quantity: number }) => {
    const productsPayload = [
      ...order.products.filter(
        (item) => item.product_uuid !== productUpdated.product_uuid
      ),
      {
        ...productUpdated,
        order_item_uuid: productUpdated.order_item_uuid || "",
        delivered_quantity: productUpdated.delivered_quantity ?? 0,
        delivery_status: productUpdated.delivery_status || "",
      },
    ];
  
    const payload: Payload = {
      store_uuid: order.store_uuid,
      uuid: productUpdated.uuid,
      product_uuid: productUpdated.product_uuid || "",
      order: {
        ...order,
        products: productsPayload,
      },
    };
  
    onSubmitUpdateProductOrder(payload);
  };
  
  const onUpdateNotes = () => {
    const payload: Payload = {
      store_uuid: order.store_uuid,   
      uuid: order.uuid,               
      product_uuid: "",              
      order: {
        ...order,
        notes,                        
      },
    };
  
    setEnabledNotes(false);
    onSubmitUpdateProductOrder(payload);
  };
  
  const onAddProductToOrder = (newProducts: Product[]) => {
    const payload: Payload = {
        store_uuid: order.store_uuid,
        uuid: order.uuid,
        product_uuid: "",
        order: {
            ...order,
            products: [
                ...order.products.map(product => ({
                    name: product.name,  
                    price: product.price,  
                    product_name: product.product_name || '',  
                    quantity: product.quantity ?? 0,
                    unit_price: product.unit_price ?? 0,
                    uuid: product.uuid,
                    product_uuid: product.product_uuid,
                    order_item_uuid: product.order_item_uuid,  
                    delivered_quantity: product.delivered_quantity,  
                    delivery_status: product.delivery_status,  
                    product_images: product.product_images || [],  
                })),
                ...newProducts.map(product => ({
                    name: product.name,  
                    price: product.price,  
                    product_name: product.product_name || '',  
                    quantity: product.quantity ?? 0,
                    unit_price: product.unit_price ?? 0,
                    uuid: product.uuid,
                    product_uuid: product.product_uuid,
                    order_item_uuid: "",  
                    delivered_quantity: 0,  
                    delivery_status: "",  
                    product_images: product.product_images || [],  
                })),
            ],
        },
    };

    onSubmitUpdateProductOrder(payload);
};  

  const onChangeStatus = async (newStatus: any) => {
    setSpinner(true);
    const payload = {
      status: newStatus,
    };

    if (newStatus === ORDER_STATUS.DONE) {
      const orderItemsMapping = order.products
        .filter(
          (item) => item.delivery_status !== PRODUCT_ORDER_STATUS.FINISHED,
        )
        .map((item) => ({
          order_item_uuid: item.order_item_uuid,
          delivered_quantity: item.quantity,
        }));

        await Promise.all(
          orderItemsMapping.map((item) => {
            return updateQuantityProductRequest(order.uuid, item);
          }),
        );
      }
    const data = await updateStatusOrderRequest(order.uuid, payload);
      if (!data?.error) {
      setOrder((prevOrder) => ({
        ...prevOrder,
        status: newStatus,
      })); 
      setSnackbarMessage(t("websocket.update_order")); 
      setSnackbarType("success");
      setSnackbarOpen(true);
    } else {
      console.error("Error:", data.error);
      setSnackbarMessage(String(data.error));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
    setSpinner(false);
  };

  const fetchProductsByStore = async (store_uuid: string) => {
    setLoading({ ...loading, isLoading: true });
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

  const totalBill = useMemo(
    () =>
      order.products?.length &&
    sum(order.products.map((item) => (item.unit_price ?? 0) * (item.quantity ?? 0))),
    [order],
  );
  // const voucherInformation = useMemo(() => {
  //   if (!invoiceData?.voucher) return;

  //   const { voucher_type, voucher_value, voucher_min_order_value } =
  //     invoiceData.voucher;

  //   switch (voucher_type) {
  //     case VOUCHER_TYPE.BY_PERCENT:
  //       return t("userOrder.voucherInformation", {
  //         voucherValue: `${voucher_value}%`,
  //         bill: `${shortPriceFormatter(voucher_min_order_value)}`,
  //       });
  //     case VOUCHER_TYPE.BY_VALUE:
  //       return t("userOrder.voucherInformation", {
  //         voucherValue: `${shortPriceFormatter(voucher_value)}`,
  //         bill: `${shortPriceFormatter(voucher_min_order_value)}`,
  //       });
  //     default:
  //       return "";
  //   }
  // }, [invoiceData]);
  const table = useMemo(
    () =>
      !isEmpty(order) &&
      !isEmpty(tableList.tables) &&
      tableList.tables.find((item) => item.uuid === order.table_uuid),
    [order, tableList],
  );

  const getInvoiceData = async (invoice_uuid: string) => {
    console.log(`...getInvoiceData..invoice_uuid: ${invoice_uuid}`);

    const data = await fetchInvoiceDetails(invoice_uuid);
    if (!data?.error) {
      console.log(`..data.voucher: ${JSON.stringify(data.voucher)}`);
      setInvoiceData(data);
    } else {
      console.error("Error fetching invoice:", data.error);
    }
  };

  const getOrderByUuid = async () => {
    if (!store_uuid || !order_uuid) {
      return;
    }
    setSpinner(true);
    const data = await fetchOrderByUUID(store_uuid, order_uuid);
    if (!data?.error) {
      const order = data.data; 
      console.log(order);
      
      setOrder(order);

      let statusSlider = 0;
      if (order.status === ORDER_STATUS.WAIT_FOR_PAY) {
        statusSlider = 50;
      }
      if (order.status === ORDER_STATUS.DONE) {
        statusSlider = 100;
      }
      setStatusOrderSlider(statusSlider);
      setNotes(order.notes || "");
    } else {
      console.error("Error fetching products:", data.error);
    }
    setSpinner(false);
  };

  useEffect(() => {
    if (!order_uuid || !store_uuid) return;

    getOrderByUuid();
  }, [order_uuid, store_uuid]);

  // get invoice when order paying
  useEffect(() => {
    if (!order || !order?.invoice_uuid) {
      setInvoiceData(null);
      return;
    }

    getInvoiceData(order.invoice_uuid);
  }, [order]);

  useEffect(() => {
    if(!store_uuid) {
      return
    }
    if (!productList.products.length) {
      fetchProductsByStore(store_uuid);
    }
  }, [productList]);

  // receive order on socket
  useEffect(() => {
  if (orderGlobal && orderGlobal.uuid === order.uuid) {
        console.log(orderGlobal);
        
      setOrder(orderGlobal);

      let statusSlider = 0;
      if (orderGlobal.status === ORDER_STATUS.WAIT_FOR_PAY) {
        statusSlider = 50;
      }
      if (orderGlobal.status === ORDER_STATUS.DONE) {
        statusSlider = 100;
      }
      setStatusOrderSlider(statusSlider);
    }
  }, [orderGlobal]);

  function isTable(table: false | Table | undefined): table is Table {
    return table !== false && table !== undefined;
  }

  const handleChange = (val: number | number[]) => {
    if (Array.isArray(val)) {
      val = val[0];
    }
  
    if (typeof val === 'number') {
      setStatusOrderSlider(val);
      switch (val) {
        case 0:
          onChangeStatus(ORDER_STATUS.PENDING);
          break;
        case 50:
          onChangeStatus(ORDER_STATUS.WAIT_FOR_PAY);
          break;
        case 100:
          onChangeStatus(ORDER_STATUS.DONE);
          break;
        default:
          break;
      }
    }
  };
  console.log(`order.status: ${order.status}`);
  console.log(`order?.actual_payment_amount: ${order?.actual_payment_amount}`);
  return (
    <>
      <OrderNotification store_uuid={store_uuid} authToken={user.authToken} />

      <Page className="section-container order-details-container">
        <Box
          mb={3}
          mr={6}
          flex
          flexDirection="row"
          alignItems="center"
          className="avatar-order-container"
        >
          <Avatar
            size={55}
            src={order?.user?.avatar}
            style={{ marginRight: "10px" }}
          />
          <Text size="xLarge" bold style={{color:'black'}}>
            {order?.user?.name}
          </Text>
          <Box style={{ position: "absolute", right: "10px" }}>
            <Text className="fs-17" style={{ fontStyle: "italic", color:'black' }}>
              {timePeriodFormatter(order.created_at, t)}
            </Text>
          </Box>
        </Box>
        <Box className="header">
          {isTable(table) && (
            <Box>
              <Text className="fs-20 header__table-name" style={{color:'black'}}>{table.name}</Text>
            </Box>
          )}

          {order.status === ORDER_STATUS.CANCELLED ? (
            <Box className="order-cancelled red-color">
              <Text>{t("orderManagement.orderCancelled")}</Text>
            </Box>
          ) : (
            <Box className="slider-status-order">
              <Slider
                min={0}
                value={statusOrderSlider}
                marks={orderStatusesSlider}
                step={50}
                vertical={false}
                onChange={handleChange}
                className={
                  order.status === ORDER_STATUS.DONE
                    ? "slider-green-theme"
                    : "slider-yellow-theme"
                }
              />
            </Box>
          )}

          {/* <OrderStatus
            status={order.status}
            onChange={(newStatus) => onChangeStatus(newStatus)}
          /> */}
        </Box>

        <Box className="main">
          <Box className="order-list">
            {order.products?.length &&
              order.products.map((item, index) => {
                const valSlider =
                  item.delivery_status === PRODUCT_ORDER_STATUS.FINISHED
                    ? 100
                    : 0;

                return (
                  <Box
                    flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                    key={index}
                    className="product-item"
                  >
                    <Box flex alignItems="center" className="product-info">
                      <Box mr={6} flex alignItems="center">
                        <img
                          src={
                            item.product_images?.[0]?.url ||
                            DEFAULT_IMAGE_PRODUCT
                          }
                          alt="dish img"
                          className="product-image"
                        />
                      </Box>
                      <Box>
                        <Text size="large" style={{color:'black'}}>
                          <span className="fw-500">{item.product_name}</span> (
                          {item.quantity}
                          x){" "}
                          {isEditableOrder && (
                            <Box onClick={() => onOpenUpdateProduct(item)}>
                              <Icon
                                icon="zi-post"
                                style={{ color: "blue", verticalAlign: "top" }}
                              />
                            </Box>
                          )}
                        </Text>
                        <Box flex style={{ gap: "8px" }}>
                          <Text size="normal" style={{color:'black'}}>
                            {priceFormatter(item.unit_price)}
                            <span style={{ marginLeft: "2px" }}>{" "+ currency}</span>
                          </Text>
                          {/* <Text
                            className="red-color"
                            style={{ textTransform: "capitalize" }}
                          >
                            [
                            {(() => item.delivery_status.replace(/\_/g, " "))()}
                            ]
                          </Text> */}
                        </Box>
                      </Box>
                    </Box>
                    {order.status !== ORDER_STATUS.CANCELLED && (
                      <>
                        <Box className="quantity">
                          <Text style={{color:'black'}}>
                            {t("orderManagement.orderDetail.delivered")}:
                          </Text>
                          <Select
                            value={item.delivered_quantity?.toString()}
                            onChange={(e) =>
                              onUpdateDeliveryQuantity({
                                ...item,
                                delivered_quantity: +!e,
                              })
                            }
                            mask
                            closeOnSelect
                          >
                            {[...Array((item.quantity ?? 0) + 1).keys()].map(
                              (num) => (
                                <option
                                  key={num.toString()}
                                  title={num.toString()}
                                  value={num.toString()}
                                  disabled={num < item.delivered_quantity}
                                />
                              )
                            )}
                          </Select>
                          <Text style={{color:'black'}}>
                            {" "}
                            / {item.quantity}{" "}
                            {t("orderManagement.orderDetail.dish")}
                          </Text>
                        </Box>
                        <Box className="slider-status-order slider-order-item">
                          <Slider
                            min={0}
                            value={valSlider}
                            marks={orderItemStatusesSlider}
                            step={100}
                            onChange={() => {
                              // only change status order when status is pending
                              if (valSlider === 0) {
                                // call api update status order item is finished
                                onUpdateDeliveryQuantity({
                                  ...item,
                                  delivered_quantity: item.quantity ?? 0,
                                });
                              }
                            }}
                            className={
                              valSlider === 0
                                ? "slider-yellow-theme"
                                : "slider-green-theme"
                            }
                          />
                        </Box>
                      </>
                    )}
                  </Box>
                );
              })}
          </Box>

          {isEditableOrder && (
            <Box
              flex
              alignItems="center"
              style={{ gap: "4px" }}
              // ml={!isMobile && 3}
              mb={2}
              onClick={() => setIsAddingProduct(true)}
            >
              <Icon
                icon="zi-plus-circle-solid"
                size={40}
                style={{ color: "red", height: "40px" }}
              />{" "}
              <Text size="large" style={{color:'black'}}>
                {t("orderManagement.orderDetail.addDish")}
              </Text>
            </Box>
          )}

          <Box>
            <Box
              className="total-bill"
              flex
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Text size="large" bold style={{color:'black'}}>
                {t("orderManagement.orderDetail.total")}:
              </Text>
              <Text size="large" style={{color:'black'}}>{priceFormatter(totalBill)}{" "+currency}</Text>
            </Box>

            {/* {invoiceData?.voucher && ( */}
            {order.value != order?.actual_payment_amount &&
              <>
                <Box flex justifyContent="space-between" className="red-color">
                  {/* <Text style={{color:'black'}}>{voucherInformation}</Text> */}
                  <Text>{t("orderManagement.orderDetail.reduce")}:</Text>
                  <Text>
                    -
                    {priceFormatter(order.value - order?.actual_payment_amount)}
                    {" "+currency}
                  </Text>
                </Box>
                <Box
                  flex
                  justifyContent="space-between"
                  alignItems="center"
                  className="red-color"
                  mb={2}
                >
                  <Text size="xLarge" bold>
                    {t("orderManagement.orderDetail.totalPayment")}:
                  </Text>
                  <Text size="xLarge" bold>
                    {priceFormatter(Math.max(0, order?.actual_payment_amount))}{" "+ currency}
                  </Text>
                </Box>
              </>
              }
            {/* )} */}
          </Box>

          <Box flex alignContent="center" style={{ paddingTop: 0, gap: "8px" }}>
            <Input
              placeholder={t("orderManagement.orderDetail.notePlaceholder")}
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNotes(e.target.value)
              }
              readOnly={!enabledNotes}
              style={{color:'black'}}
            />

            {isEditableOrder && (
              <>
                {enabledNotes ? (
                  <Box onClick={onUpdateNotes}>
                    <Icon
                      icon="zi-check"
                      size={30}
                      style={{ color: "green" }}
                    />
                  </Box>
                ) : (
                  <Box
                    onClick={() => {
                      setEnabledNotes(true);
                    }}
                  >
                    <Icon icon="zi-post" size={30} style={{ color: "red" }} />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>

        {order.status !== ORDER_STATUS.DONE &&
          order.status !== ORDER_STATUS.CANCELLED && (
            <Box>
              <Button
                style={{ width: "100%" }}
                onClick={() => setShowModalConfirm(true)}
              >
                {t("orderManagement.cancelOrder")}
              </Button>
            </Box>
          )}

        <DishOrderSheet
          isShow={isShowOrderUpdate}
          isAdmin
          product={selectedProduct}
          onClose={() => setIsShowOrderUpdate(false)}
          onSubmit={onUpdateQuantity}
        />

        <AddProductModal
          isShow={isAddingProduct}
          data={productList.products
            .filter(
              (productItem) =>
                !order.products?.find(
                  (item) => item.product_uuid === productItem.uuid
                )
            )
            .map((item) => ({ ...item, quantity: 0 }))}
          onClose={() => setIsAddingProduct(false)}
          onSubmit={onAddProductToOrder}
        />

        <Box
          flex
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Avatar size={55} src={dmIcon} style={{ marginRight: "10px" }} />

          <Text>
            {t("main.chat_with_user")} {order?.user?.name}
          </Text>
        </Box>
      </Page>

      <ConfirmModal
        isShowModal={showModalConfirm}
        onConfirm={() => {
          onChangeStatus(ORDER_STATUS.CANCELLED);
          setShowModalConfirm(false);
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
    </>
  );
}

export default OrderManagementDetails;
