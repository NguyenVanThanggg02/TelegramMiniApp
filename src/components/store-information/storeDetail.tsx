import React, { useState, useEffect } from 'react';
import { Box, Modal, Icon, Text, List } from 'zmp-ui';
import './styles.scss';
import { useTranslation } from 'react-i18next';
import DEFAULT_IMAGE_STORE from '../../static/icons/store-background.png';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Snackbar } from "@telegram-apps/telegram-ui";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface StoreDetail {
  avatar?: {
    url?: string;
  };
  description?: string;
  address?: string;
  phoneNumber?: string;
  bankName?:string
  bankAccount?: string;
  name?: string;
}

interface StoreData {
  name?: string;
  metadata?: string;
}

interface StoreDetailModalProps {
  storeData: StoreData;
  isShow: boolean;
  onClose: () => void;
}

const StoreDetailModal: React.FC<StoreDetailModalProps> = ({ storeData, isShow, onClose }) => {
  const [storeDetail, setStoreDetail] = useState<StoreDetail>({});
  const { t } = useTranslation('global');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (!storeData) return;
    try {
      setStoreDetail(JSON.parse(storeData.metadata || '{}'));
    } catch {
    }
  }, [storeData]);
  
  const copyBankAccountToClipboard = (bankAccount: string) => {
    navigator.clipboard.writeText(bankAccount);
    setSnackbarMessage(t("snackbarMessage.copiedBankAccount"));
    setSnackbarType("success");
    setSnackbarOpen(true);
    onClose();
  };

  return (
    <>
    <Modal visible={isShow} onClose={onClose} className="dish-details-modal">
      <Box className="container">
        <Box onClick={onClose} className="close-btn">
          <Icon icon="zi-chevron-left" className="close-icon" />
        </Box>
        <Box
          flex
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          style={{ padding: "30px 0", backgroundColor: "#f1f1f1" }}
        >
          <Box>
            <img
              className="img-store"
              style={
                !storeDetail?.avatar?.url
                  ? { filter: "grayscale(1) opacity(0.5)" }
                  : {}
              }
              src={storeDetail?.avatar?.url || DEFAULT_IMAGE_STORE}
              alt="store avatar"
            />
          </Box>
          <Box flex flexDirection="row" alignItems="center" mt={3}>
            <Box>
              <Text style={{ fontSize: "21px", color: "black" }} bold>
                {storeData?.name}
              </Text>
            </Box>
          </Box>
          <Box mt={6} style={{ padding: "0 20px" }}>
            <Text style={{ color: "black" }}>{storeDetail?.description}</Text>
          </Box>
        </Box>
        <Box>
          <List>
            {storeDetail?.address && (
              <List.Item
                style={{ marginBottom: "0", color: "black" }}
                title={t("menu.address")}
                subTitle={storeDetail?.address}
              />
            )}
            {storeDetail?.phoneNumber && (
              <List.Item
                style={{ marginBottom: "0", color: "black" }}
                title={t("menu.phoneNumber")}
              >
                <Text>{storeDetail?.phoneNumber}</Text>
              </List.Item>
            )}

            {storeDetail?.bankName && (
              <List.Item
                style={{ marginBottom: "0", color: "black" }}
                title={t("menu.bankName")}
              >
                <Text>{storeDetail?.bankName}</Text>
              </List.Item>
            )}

            {storeDetail?.bankAccount && (
              <List.Item
                style={{ color: "black" }}
                title={t("menu.bankAccount")}
              >
                <Box
                  className="total-bill"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onClick={() => copyBankAccountToClipboard(storeDetail?.bankAccount || '')}
                > 
                  <Box>
                    <Text>{storeDetail?.bankAccount}</Text>
                  </Box>
                  <Box>
                    <ContentCopyIcon
                      style={{ color: "gray", fontSize: "20px" }}
                    />
                  </Box>
                </Box>
              </List.Item>
            )}
          </List>
        </Box>
      </Box>
    </Modal>
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
};

export default StoreDetailModal;
