import React from 'react';
import { Box, Button, Modal, Icon, Text } from 'zmp-ui';
import './styles.scss';
import { DEFAULT_IMAGE_PRODUCT } from '../../../constants';
import { useTranslation } from 'react-i18next';

interface Voucher {
  name: string;
  [key: string]: any; 
}

interface VoucherDetailModalProps {
  isShow: boolean;
  onClose: () => void;
  onUse: (voucher: Voucher) => void;
  voucher: Voucher;
}

const VoucherDetailModal: React.FC<VoucherDetailModalProps> = ({
  isShow,
  onClose,
  onUse,
  voucher,
}) => {
  const { t } = useTranslation('global');

  return (
    <Modal visible={isShow} onClose={onClose} className="voucher-details-modal">
      <Box className="container">
        <Box className="header" flex justifyContent="center">
          <Box style={{width:'100%'}}>
            <img
              src={DEFAULT_IMAGE_PRODUCT}
              alt="voucher img"
              style={{ verticalAlign: 'center' }}
            />
          </Box>
          <Box onClick={onClose} className="close-btn">
            <Icon icon="zi-close-circle-solid" className="grey-color" />
          </Box>
        </Box>

        <Box className="voucher-info">
          <Box mb={1}>
            <Text size="large" bold>
              {voucher.name}
            </Text>
          </Box>

          <Text size="large">{} ₫</Text>
        </Box>

        <Box className="divider" />

        <Box flex className="footer shadow-bottom">
          <Button
            onClick={() => {
              onUse({ ...voucher });
              onClose();
            }}
          >
            {t('menu.addToOrder')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default VoucherDetailModal;
