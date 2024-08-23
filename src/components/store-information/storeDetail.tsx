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
  bankAccount?: string;
}

interface StoreData {
  name: string;
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
          style={{ padding: '30px 0', backgroundColor: '#f1f1f1' }}
        >
          <Box>
            <img
              className="img-store"
              style={
                !storeDetail?.avatar?.url
                  ? { filter: 'grayscale(1) opacity(0.5)' }
                  : {}
              }
              src={
                storeDetail?.avatar?.url || DEFAULT_IMAGE_STORE
              }
              alt="store avatar"
            />
          </Box>
          <Box flex flexDirection="row" alignItems="center" mt={3}>
            <Box>
              <Text style={{ fontSize: '21px' }} bold>
                {storeData?.name}
              </Text>
            </Box>
          </Box>
          <Box mt={6} style={{ padding: '0 20px' }}>
            <Text>{storeDetail?.description}</Text>
          </Box>
        </Box>
        <Box>
          <List>
            {storeDetail?.address && (
              <List.Item
                style={{ marginBottom: '0' }}
                title={t('menu.address')}
                subTitle={storeDetail?.address}
              />
            )}
            {storeDetail?.phoneNumber && (
              <List.Item
                style={{ marginBottom: '0' }}
                title={t('menu.phoneNumber')}
                // subTitle={
                //   <Box flex alignItems="center">
                //     <a
                //       style={{ color: '#767a7f' }}
                //       href={`tel:${storeDetail?.phoneNumber}`}
                //     >
                //       <Text>{storeDetail?.phoneNumber}</Text>
                //     </a>
                //   </Box>
                // }
              />
            )}
            {storeDetail?.bankAccount && (
              <List.Item
                title={t('menu.bankAccount')}
                // subTitle={
                //   <Box flex alignItems="center">
                //     <Text>{storeDetail?.bankAccount}</Text>
                //     <svg
                //       data-v-465340bc=""
                //       xmlns="http://www.w3.org/2000/svg"
                //       viewBox="0 0 12 15"
                //       width="12"
                //       height="15"
                //       onClick={() =>
                //         copyToClipboard(
                //           storeDetail?.bankAccount.split(' - ')[1] || '',
                //         )
                //       }
                //       style={{
                //         cursor: 'pointer',
                //         marginLeft: '8px',
                //         fill: '#666',
                //       }}
                //     >
                //       <path d="M7.313.188H3.11c-.386 0-.72.134-1.002.404-.28.27-.421.597-.421.984v.299h-.264c-.387 0-.72.135-1.002.404C.14 2.55 0 2.877 0 3.264v10.125c0 .386.14.72.422 1.002.281.28.615.421 1.002.421h7.312c.387 0 .715-.14.985-.421.27-.282.404-.616.404-1.002v-.264h.299c.386 0 .715-.14.984-.422.27-.281.405-.615.405-1.002V4.687l-4.5-4.5Zm0 1.564 2.935 2.936H7.313V1.752ZM9 13.389a.304.304 0 0 1-.08.21.242.242 0 0 1-.184.088H1.424a.288.288 0 0 1-.211-.087.288.288 0 0 1-.088-.211V3.264c0-.07.03-.132.088-.185A.304.304 0 0 1 1.423 3h.264v8.982c0 .387.094.674.282.862.187.187.474.281.861.281H9v.264Zm1.688-1.688a.305.305 0 0 1-.08.211.242.242 0 0 1-.184.088H3.11a.288.288 0 0 1-.21-.088.288.288 0 0 1-.088-.21V1.575c0-.07.029-.132.087-.184a.304.304 0 0 1 .211-.08h3.076v4.5h4.5v5.89Z"></path>
                //     </svg>
                //     {copied && (
                //       <Text style={{ color: 'green', marginLeft: '8px' }}>
                //         Copied!
                //       </Text>
                //     )}
                //   </Box>
                // }
              />
            )}
          </List>
        </Box>
      </Box>
    </Modal>
  );
};

export default StoreDetailModal;
