import React from "react";
import { Box, Button, Text } from "zmp-ui";
import { VOUCHER_STATUS, VOUCHER_TYPE, VoucherType, VoucherStatus } from "../../../constants";
import "./styles.scss";
import { useTranslation } from "react-i18next";
import { shortPriceFormatter } from "../../../utils/shortPriceFormatter";

interface Voucher {
  voucher_code: string;
  voucher_value: number;
  voucher_type: VoucherType;
  voucher_min_order_value: number;
  expired_at: string;
  status: VoucherStatus;
}

interface VoucherCardProps {
  isAdmin?: boolean;
  voucher: Voucher;
  hasUseButton?: boolean;
  onDetails: (voucher: Voucher) => void;
  onUse?: () => void;
  displayStatus?: boolean;
}

const VoucherCard: React.FC<VoucherCardProps> = ({
  // isAdmin = false,
  voucher,
  hasUseButton = false,
  onDetails,
  // onUse,
  displayStatus = true,
}) => {
  const { t } = useTranslation("global");

  const renderStatus = () => {
    if (new Date(voucher.expired_at).getTime() < new Date().getTime()) {
      return (
        <Box className="voucher-status status-expired">
          {t("voucherManagement.experied")}
        </Box>
      );
    } else if (voucher.status === VOUCHER_STATUS.ACTIVE) {
      return (
        <Box className="voucher-status status-finished">
          {t("voucherManagement.active")}
        </Box>
      );
    } else if (voucher.status === VOUCHER_STATUS.INACTIVE) {
      return (
        <Box className="voucher-status status-cancelled">
          {t("voucherManagement.inactive")}
        </Box>
      );
    }
  };

  return (
    <Box
      flex
      className="voucher-card-container"
      onClick={() => {
        onDetails(voucher);
      }}
    >
      <Box className="voucher-background"></Box>
      {displayStatus && renderStatus()}
      <Box className="voucher-card-left">
        -
        {voucher.voucher_type === VOUCHER_TYPE.BY_VALUE
          ? shortPriceFormatter(voucher.voucher_value)
          : voucher.voucher_value + "%"}
      </Box>
      <Box className="voucher-card-right">
        <Text size="xLarge" bold style={{ marginBottom: "8px" }}>
          {voucher.voucher_code}
        </Text>
        <Text size="small">
          {t("voucherManagement.minValue")} ₫
          {shortPriceFormatter(voucher.voucher_min_order_value)}
        </Text>
        <Text size="xxSmall" className="text-experied">
          {t("voucherManagement.experiedAt")}{" "}
          {new Date(voucher.expired_at).toLocaleDateString("en-GB")}
        </Text>
      </Box>
      {hasUseButton && (
        <Button className="button-use">{t("button.use")}</Button>
      )}
    </Box>
  );
};

export default VoucherCard;
