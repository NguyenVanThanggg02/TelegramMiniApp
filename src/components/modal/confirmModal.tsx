import React from "react";
import { Box, Button, Icon, Modal, Text } from "zmp-ui";
import "./styles.scss";
import { useTranslation } from "react-i18next";

interface ConfirmModalProps {
  isShowModal: boolean;
  setIsShowModal: (show: boolean) => void;
  onConfirm: () => void;
  itemDelete?: string;
  content?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isShowModal,
  setIsShowModal,
  onConfirm,
  itemDelete,
  content = "",
}) => {
  const { t } = useTranslation("global");

  return (
    <Modal
      visible={isShowModal}
      mask
      onClose={() => setIsShowModal(false)}
      className="confirm-modal"
    >
      <Box className="confirm-modal_icon">
        <Icon icon="zi-exclamation" />
      </Box>
      <Box className="confirm-modal_text">
        {content || (
          <>
            {t("main.confirmDelete")}:
            <Text className={`item-delete`}>{itemDelete}</Text>
          </>
        )}
      </Box>

      <Box flex justifyContent="space-between" className="confirm-modal_button">
        <Button onClick={onConfirm}>{t("button.confirm")}</Button>
        <Button variant="secondary" onClick={() => setIsShowModal(false)}>
          {t("button.cancel")}
        </Button>
      </Box>
    </Modal>
  );
}

export default ConfirmModal;
