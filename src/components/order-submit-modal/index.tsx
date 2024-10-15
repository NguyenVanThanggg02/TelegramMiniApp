import { sum } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Box,
  Icon,
  Text,
  Button,
  Input,
  Select,
} from 'zmp-ui';
import './styles.scss';
import { formatUSD, priceFormatter } from '../../utils/numberFormatter';
import { DEFAULT_IMAGE_PRODUCT } from '../../constants';
import { sendCreateOrderRequest } from '../../api/api';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  cartState,
  orderListByUserState,
  spinnerState,
  tableListState,
  tableState,
} from '../../state';
import { useTranslation } from 'react-i18next';
// import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Snackbar } from "@telegram-apps/telegram-ui";
import useStoreDetail from '../userStoreDetail';

interface OrderSubmitModalProps {
  isShow: boolean;
  onClose: () => void;
}


const OrderSubmitModal: React.FC<OrderSubmitModalProps> = ({ isShow, onClose }) => {
  const { t } = useTranslation('global');
  // const navigate = useNavigate();
  const { Option } = Select;

  const table = useRecoilValue(tableState);
  const [tableList] = useRecoilState(tableListState);
  const [cart, setCart] = useRecoilState(cartState);
  const [orderListByUser, setOrderListByUser] =
    useRecoilState(orderListByUserState);

  const [tableSelected, setTableSelected] = useState<string>('');
  const [tableStatus, setTableStatus] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [,setSpinner] = useRecoilState(spinnerState);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  const { currency } = useStoreDetail();
  console.log(currency);

  const totalBill = useMemo(
    () => sum(cart.map((item) => item.price * item.quantity)),
    [cart],
  );

  const resetDefault = () => {
    setNote('');
  };

  const onOrderSubmit = async () => {
    setSpinner(true);
    const payload = {
      products: cart.map(({ uuid, quantity }) => ({ uuid, quantity })),
      table_uuid: table.uuid || tableSelected,
      notes: note,
    };
  
    const response = await sendCreateOrderRequest(payload);
    const data = response.data
    if (!data.error ) {
      // const newOrder: Order = response.data;
  
      onClose();
      setCart([]);
  
      if (orderListByUser.is_update) {
        setOrderListByUser({
          is_update: true,
          orders: [...orderListByUser.orders, data],
        });
      }
      
      setSnackbarMessage(t("snackbarMessage.createOrderSuccess"));
      setSnackbarType("success");
      setSnackbarOpen(true);
        // setTimeout(() => {
        //   navigate(-1); 
        // }, 2000);
    } else {
      setSnackbarMessage(String(data.error));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
    setSpinner(false);
  };

  useEffect(() => {
    if (!isShow) resetDefault();
  }, [isShow]);

  return (
    <Modal visible={isShow} onClose={onClose} className="order-submit-modal">
      <Box
        className="header"
        flex
        justifyContent="space-between"
        alignItems="center"
      >
        <Box onClick={onClose} className="back-icon">
          <Icon
            style={{ fontSize: "36px" }}
            icon="zi-chevron-left"
            className="grey-color"
          />
        </Box>
        <Text className="fs-22">{t("menu.order")}</Text>
        <Box mr={6} />
      </Box>

      <Box className="main">
        <Box className="order-list">
          {cart.map((item) => (
            <Box
              flex
              justifyContent="space-between"
              alignItems="center"
              mb={3}
              key={item.uuid}
            >
              <Box flex alignItems="center">
                <Box mr={3} flex alignItems="center">
                  <img
                    src={item.images?.[0]?.url || DEFAULT_IMAGE_PRODUCT}
                    alt="dish img"
                    style={{ width: "80px", height: "80px" }}
                  />
                </Box>
                <Box>
                  <Text size="large" style={{ color: "black" }}>
                    {item.quantity}x <span className="fw-500">{item.name}</span>
                  </Text>
                </Box>
              </Box>
              <Box
                flex
                justifyContent="flex-end"
                width={80}
                style={{ color: "black" }}
              >
                {currency === "$"
                  ? formatUSD(item.price)
                  : `${currency} ${priceFormatter(item.price)}`}
                <span style={{ marginLeft: "2px" }}>{" " + currency}</span>
                </Box>
            </Box>
          ))}
        </Box>

        <Box
          className="total-bill"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Text className="title" bold style={{ padding: 0, color: "black" }}>
              {t("menu.total")}
            </Text>
          </Box>
          <Box flex justifyContent="flex-end">
          <Text size="xLarge" bold style={{ color: "black" }}>
              {currency === "$"
                ? formatUSD(totalBill)
                : `${currency} ${priceFormatter(totalBill)}`}{" "}
              <span style={{ paddingLeft: "3px" }}>{" " + currency}</span>
            </Text>
          </Box>
        </Box>

        {!table.uuid && (
          <Box p={3} mt={3}>
            <Select
              id="table-select"
              placeholder={t("orderManagement.selectTable")}
              errorText={t("orderManagement.tableMustSelect")}
              onChange={(value) => {
                setTableSelected(value as string); // Ensure value is string
                setTableStatus("");
              }}
              status={tableStatus}
              closeOnSelect
            >
              {tableList.tables.map((tbl) => (
                <Option key={tbl.uuid} value={tbl.uuid} title={tbl.name} />
              ))}
            </Select>
          </Box>
        )}

        <Box p={3} style={{ paddingTop: 0 }}>
          <Input
            placeholder={t("orderManagement.orderDetail.notePlaceholder")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Box>
      </Box>

      <Box className="footer shadow-bottom">
        <Button
          onClick={onOrderSubmit}
          disabled={!table.uuid && !tableSelected}
        >
          {t("menu.submitOrder")}:{" "}
          {currency === "$"
            ? formatUSD(totalBill)
            : `${currency} ${priceFormatter(totalBill)}`}{" "}
        </Button>
      </Box>
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
    </Modal>
  );
};

export default OrderSubmitModal;
