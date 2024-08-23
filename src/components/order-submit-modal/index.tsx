import { sum } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Box,
  Icon,
  Text,
  Button,
  Input,
  useSnackbar,
  Select,
} from 'zmp-ui';
import './styles.scss';
import { priceFormatter } from '../../utils/numberFormatter';
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
import { useNavigate } from 'react-router-dom';

interface OrderSubmitModalProps {
  isShow: boolean;
  onClose: () => void;
}
interface Order {
  uuid: string;
  created_at: string;
  store_name: string;
  status: string;
  products: { product_name: string; quantity: number; unit_price: number }[];
  notes?: string;
  actual_payment_amount: number;
  value: number;
}

const OrderSubmitModal: React.FC<OrderSubmitModalProps> = ({ isShow, onClose }) => {
  const { t } = useTranslation('global');
  const snackbar = useSnackbar();
  const navigate = useNavigate();
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
    if (!response.error && response.data) {
      const newOrder: Order = response.data;
  
      onClose();
      setCart([]);
  
      if (orderListByUser.is_update) {
        setOrderListByUser({
          is_update: true,
          orders: [...orderListByUser.orders, newOrder],
        });
      }
  
      snackbar.openSnackbar({
        duration: 3000,
        text: t('snackbarMessage.createOrderSuccess'),
        type: 'success',
      });
  
      if (tableSelected) {
        navigate(-1);
      }
    } else {
      snackbar.openSnackbar({
        duration: 3000,
        text: String(response.error),
        type: 'error',
      });
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
            style={{ fontSize: '36px' }}
            icon="zi-chevron-left"
            className="grey-color"
          />
        </Box>
        <Text className="fs-22">{t('menu.order')}</Text>
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
                    style={{ width: '80px', height: '80px' }}
                  />
                </Box>
                <Box>
                  <Text size="large">
                    {item.quantity}x <span className="fw-500">{item.name}</span>
                  </Text>
                </Box>
              </Box>
              <Box flex justifyContent="flex-end" width={80}>
                {priceFormatter(item.price)}
                <span style={{ marginLeft: '2px' }}>₫</span>
              </Box>
            </Box>
          ))}
        </Box>

        <Box className="total-bill" flex justifyContent="flex-end">
          <Text size="xLarge" bold>
            {priceFormatter(totalBill)}
            <span style={{ paddingLeft: '3px' }}>₫</span>
          </Text>
        </Box>

        {!table.uuid && (
          <Box p={3} mt={3}>
            <Select
              id="table-select"
              placeholder={t('orderManagement.selectTable')}
              errorText={t('orderManagement.tableMustSelect')}
              onChange={(value) => {
                setTableSelected(value as string); // Ensure value is string
                setTableStatus('');
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
            placeholder={t('orderManagement.orderDetail.notePlaceholder')}
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
          {t('menu.submitOrder')}: {priceFormatter(totalBill)}₫
        </Button>
      </Box>
    </Modal>
  );
};

export default OrderSubmitModal;
