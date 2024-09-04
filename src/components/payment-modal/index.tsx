import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Icon, Input, Modal, Text } from "zmp-ui";
import { DEFAULT_IMAGE_PRODUCT, VOUCHER_TYPE, VoucherStatus, VoucherType } from "../../constants";
import { priceFormatter } from "../../utils/numberFormatter";
import { useTranslation } from "react-i18next";

import "./styles.scss";
import { useRecoilValue } from "recoil";
import { storeState } from "../../state";
import { getVoucherDetailByStore } from "../../api/api";
import VoucherCard from "../../components/voucher/voucher-card/voucherCard";


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

export interface Voucher {
  voucher_code: string;
  voucher_value: number;
  voucher_type: VoucherType;
  voucher_min_order_value: number;
  expired_at: string;
  status: VoucherStatus;
  uuid: string;
  name: string;
  updated_at: string;
  notes:string
}

interface PaymentModalProps {
  show: boolean;
  order: Order;
  onClose: () => void;
  onPayment: (voucher: string) => void;
}


function PaymentModal({ show, order, onClose, onPayment }: PaymentModalProps) {
  const { t } = useTranslation("global");
  const store = useRecoilValue(storeState);

  const [voucherData, setVoucherData] = useState<Voucher | null>(null);
  const [voucher, setVoucher] = useState("");
  const [errorVoucher, setErrorVoucher] = useState("");
  
  const totalBill = useMemo(
    () =>
      order && Array.isArray(order) 
        ? order.reduce(
            (acc, cur) => {
              const unitPrice = cur.unit_price ?? 0; 
              const quantity = cur.quantity ?? 0; 
              return acc + unitPrice * quantity;
            },
            0
          )
        : 0, 
    [order]
  );
  
  

  const totalBillUsingVoucher = useMemo(() => {
    if (!voucherData || !totalBill) return;

    const { voucher_type, voucher_value, voucher_min_order_value } =
      voucherData;
    if (voucher_min_order_value > totalBill)
      return { reduce: 0, price: totalBill };

    let price, reduce;

    switch (voucher_type) {
      case VOUCHER_TYPE.BY_PERCENT:
        reduce = totalBill * (voucher_value / 100);
        price = totalBill - reduce;
        break;
      case VOUCHER_TYPE.BY_VALUE:
        reduce = voucher_value;
        price = totalBill - reduce;
        break;
      default:
        return "";
    }

    return {
      reduce,
      price: price < 0 ? 0 : price,
    };
  }, [voucherData, totalBill]);

  const getVoucherByStore = async (code: string) => {
    try {
      const response: ApiResponse<Voucher> = await getVoucherDetailByStore(code, store.uuid);
      
      // Kiểm tra dữ liệu trả về
      if (response.data && response.data.status === "actived" && response.data.expired_at) {
        const expirationDate = new Date(response.data.expired_at);
  
        if (expirationDate.getTime() > new Date().getTime()) {
          setVoucherData(response.data); 
          setErrorVoucher(""); 
        } else {
          setVoucherData(null);
          setErrorVoucher(t("userOrder.voucherExpired")); 
        }
      } else {
        setVoucherData(null);
        setErrorVoucher(t("userOrder.voucherInvalid")); 
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorVoucher(t("userOrder.voucherError"));
    }
  };
  

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVoucherData(null);
    setVoucher(e.target.value.toUpperCase());
    setErrorVoucher("");
  };

  useEffect(() => {
    if (!voucher) return;

    const delayInputTimeoutId = setTimeout(() => {
      getVoucherByStore(voucher);
    }, 2000);
    return () => clearTimeout(delayInputTimeoutId);
  }, [voucher]);

  const resetDefault = () => {
    setVoucher("");
    setVoucherData(null);
  };

  useEffect(() => {
    if (!show) resetDefault();
  }, [show]);

  return (
    <Modal visible={show} mask onClose={onClose} className="payment-modal">
      <Box
        className="close-btn"
        style={{ opacity: 0.3 }}
        mb={4}
        flex
        alignItems="center"
        onClick={onClose}
      >
        <Icon
          style={{ fontSize: "36px" }}
          icon="zi-chevron-left"
          className="grey-color"
        />
      </Box>
      <Box className="main" mt={8}>
        <Box mb={2}>
          <Text.Title size="xLarge">{t("menu.payment")}</Text.Title>
        </Box>
        <Box className="products">
          {Array.isArray(order) &&
            order.map((item, index) => (
              <Box
                flex
                justifyContent="space-between"
                alignItems="center"
                key={index}
                className="product-item"
              >
                <Box flex alignItems="center" className="product-info">
                  <Box mr={3} flex alignItems="center">
                    <img
                      src={
                        item.product_images?.[0]?.url || DEFAULT_IMAGE_PRODUCT
                      }
                      alt="dish img"
                      className="product-image"
                      style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "8px",
                      }}
                    />
                  </Box>
                  <Box>
                    <Text size="large">
                      <span className="fw-500">
                        {item.product_name} <span>(x{item.quantity})</span>
                      </span>
                    </Text>
                    <Box flex style={{ gap: "8px" }}>
                      <Text size="normal">
                        {priceFormatter(item.unit_price)}
                        <span style={{ marginLeft: "2px" }}>₫</span>
                      </Text>
                    </Box>
                  </Box>
                </Box>
                <Box>
                  <Text size="xLarge">
                    {priceFormatter(
                      (item.unit_price ?? 0) * (item.quantity ?? 0)
                    )}
                  </Text>
                </Box>
              </Box>
            ))}
        </Box>
        <Box className="total-bill" flex justifyContent="space-between" my={2}>
          <Text bold>{t("orderManagement.orderDetail.total")}:</Text>
          <Text>
            <span style={{ paddingLeft: "6px" }}>
              {priceFormatter(totalBill)}₫
            </span>
          </Text>
        </Box>
        {totalBillUsingVoucher && (
          <>
            <Box flex justifyContent="space-between" mb={2}>
              <span>{t("orderManagement.orderDetail.reduce")}:</span>
              <Text className="red-color">
                <span style={{ paddingLeft: "6px" }}>
                  -{priceFormatter(totalBillUsingVoucher.reduce)}₫
                </span>
              </Text>
            </Box>
            <Box flex justifyContent="space-between" mb={4}>
              <span>{t("orderManagement.orderDetail.totalPayment")}:</span>
              <Text className="red-color">
                <span style={{ paddingLeft: "6px" }}>
                  {priceFormatter(totalBillUsingVoucher.price)}₫
                </span>
              </Text>
            </Box>
          </>
        )}
        <Box>
          <Text>{t("userOrder.voucherIfHave")}</Text>
          <Input
            type="text"
            value={voucher}
            onChange={onChangeInput}
            placeholder={t("voucherManagement.createVoucher.enterVoucherCode")}
          />
          {errorVoucher && <i className="red-color">{errorVoucher}</i>}
          {voucherData && (
            <Box className="voucher-view-container">
              <VoucherCard voucher={voucherData} displayStatus={false} />
            </Box>
          )}
        </Box>
      </Box>
      <Box className="action">
        <Button
          fullWidth
          disabled={!!errorVoucher}
          onClick={() => onPayment(voucher)}
        >
          {t("menu.payment")}
        </Button>
      </Box>
    </Modal>
  );
}

export default PaymentModal;
