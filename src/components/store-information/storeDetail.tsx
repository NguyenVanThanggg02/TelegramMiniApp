import React, { useState, useEffect } from 'react';
import { Box, Modal, Icon, Text, List } from 'zmp-ui';
import './styles.scss';
import { useTranslation } from 'react-i18next';
import DEFAULT_IMAGE_STORE from '../../static/icons/store-background.png';

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
  // const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!storeData) return;
    try {
      setStoreDetail(JSON.parse(storeData.metadata || '{}'));
    } catch {
      // Handle JSON parsing error if needed
    }
  }, [storeData]);

  // const copyToClipboard = (text: string) => {
  //   navigator.clipboard.writeText(text);
  //   setCopied(true);
  //   setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
  // };

  const { t } = useTranslation('global');

  return (
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
              <Text style={{ fontSize: "21px" }} bold>
                {storeData?.name}
              </Text>
            </Box>
          </Box>
          <Box mt={6} style={{ padding: "0 20px" }}>
            <Text>{storeDetail?.description}</Text>
          </Box>
        </Box>
        <Box>
          <List>
            {storeDetail?.address && (
              <List.Item
                style={{ marginBottom: "0" }}
                title={t("menu.address")}
                subTitle={storeDetail?.address}
              />
            )}
            {storeDetail?.phoneNumber && (
              <List.Item
                style={{ marginBottom: "0" }}
                title={t("menu.phoneNumber")}
              >
                <Text>{storeDetail?.phoneNumber}</Text>
              </List.Item>
            )}

            {storeDetail?.bankName && (
              <List.Item
                style={{ marginBottom: "0" }}
                title={t("menu.bankName")}
              >
                <Text>{storeDetail?.bankName}</Text>
              </List.Item>
            )}

            {storeDetail?.bankAccount && (
              <List.Item
                title={t("menu.bankAccount")}
              >
                <Text>{storeDetail?.bankAccount}</Text>
              </List.Item>
            )}
          </List>
        </Box>
      </Box>
    </Modal>
  );
};

export default StoreDetailModal;
