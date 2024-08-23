import React, { useState } from "react";
import { Box, Button, Icon, Modal, Select, Text,  } from "zmp-ui";
import { ORDER_STATUS } from "../../constants";
import "./styles.scss";
import { useTranslation } from "react-i18next";

interface OrderStatusProps {
  status: string;
  onChange: (newStatus: string) => void;
}

const OrderStatus: React.FC<OrderStatusProps> = ({ status, onChange }) => {
  const { t } = useTranslation("global");
  const [newStatus, setNewStatus] = useState<string>(status);
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <Box className="order-status-container">
      <Select
        value={status}
        className={`status-${status}`}
        closeOnSelect
        mask
        onChange={(selected) => {
          if (typeof selected === 'string') {
            setNewStatus(selected);
            setShowModal(true);
          }
        }}
      >
        {Object.keys(ORDER_STATUS).map((key) => {
          const value = ORDER_STATUS[key as keyof typeof ORDER_STATUS];
          return (
            <Select.Option
              key={key}
              value={value}
              title={t("orderManagement.statusSelect." + value)}
            />
          );
        })}
      </Select>

      <Modal
        visible={showModal}
        mask
        onClose={() => setShowModal(false)}
        className="order-status-modal"
      >
        <Box className="order-status-modal_icon">
          <Icon icon="zi-exclamation" />
        </Box>
        <Box className="order-status-modal_text">
          {t("orderManagement.confirmChangeStatus")}:
          <Text className={`status-${newStatus} new-status`}>
            {t("orderManagement.statusSelect." + newStatus)}
          </Text>
        </Box>

        <Box
          flex
          justifyContent="space-between"
          className="order-status-modal_button"
        >
          <Button
            onClick={() => {
              onChange(newStatus);
              setShowModal(false);
            }}
          >
            {t("button.confirm")}
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t("button.cancel")}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}

export default OrderStatus;
