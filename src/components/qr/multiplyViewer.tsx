import React, { useRef } from 'react';
import QRCode from 'qrcode.react';
import './styles.scss';
import { Box, Button, Text } from 'zmp-ui';
import { useTranslation } from 'react-i18next';
import appIcon from '../../static/icons/app-logo.png';
import QrCodeOutlinedIcon from '@mui/icons-material/QrCodeOutlined';
import appIconFull from '../../static/icons/web-icon-full.png';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ChecklistIcon from '@mui/icons-material/Checklist';

// Define the type for table item
interface TableItem {
  link: string;
  name: string;
}

// Define the type for component props
interface QRCodeMultiplyViewerProps {
  handleSave: (ref: React.RefObject<HTMLDivElement>) => void;
  listItems: TableItem[];
}

const QRCodeMultiplyViewer: React.FC<QRCodeMultiplyViewerProps> = ({
  handleSave,
  listItems,
}) => {
  const { t } = useTranslation('global');
  const saveRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLDivElement>;

  return (
    <>
      <Box
        className="qr-code-container"
        style={{ position: 'fixed', right: '-999px' }}
      >
        <Box ref={saveRef} mb={3} className="multi-qr-container">
          {listItems.map((table) => (
            <Box key={table.link} className="qr-code-content">
              <Box className="top-qr-container">
                <Box
                  style={{
                    padding: '14px 38px',
                    paddingBottom: '8px',
                    height: '223px',
                  }}
                >
                  <Box style={{ marginBottom: '4px' }}>
                    <Text className="scan-qr-title">
                      {t('tableManagement.scanQrTable')}
                    </Text>
                    <Text className="qr-code-menu">
                      {t('tableManagement.menu')}
                    </Text>
                  </Box>
                  <Box className="qr-container">
                    <QRCode
                      value={table.link}
                      renderAs="svg"
                      imageSettings={{
                        src: appIcon,
                        height: 24,
                        width: 24,
                        excavate: true,
                      }}
                    />
                  </Box>
                </Box>
                <Box className="list-sub-item-container">
                  <Box className="sub-item-container">
                    <Box className="sub-item-qr">
                      <QrCodeScannerIcon style={{ fontSize: '20px' }} />
                    </Box>
                    {t('tableManagement.scanQr')}
                  </Box>
                  <Box className="sub-item-container">
                    <Box className="sub-item-qr">
                      <RestaurantMenuIcon style={{ fontSize: '20px' }} />
                    </Box>
                    {t('tableManagement.viewMenu')}
                  </Box>
                  <Box className="sub-item-container">
                    <Box className="sub-item-qr">
                      <ChecklistIcon style={{ fontSize: '20px' }} />
                    </Box>
                    {t('tableManagement.order')}
                  </Box>
                  {/* <Box className="sub-item-container">
                    <Box className="sub-item-qr">
                      <AttachMoneyIcon style={{ fontSize: '20px' }} />
                    </Box>
                    {t('tableManagement.pay')}
                  </Box> */}
                </Box>
              </Box>
              <Box
                flex
                alignItems="center"
                justifyContent="flex-end"
                className="bottom-qr-container"
                style={{ paddingRight: '5px' }}
              >
                <Box className="txt-table-name">
                  <Box className="table-name-container">
                    <span style={{ whiteSpace: 'nowrap' }}>
                      {table.name.toUpperCase()}
                    </span>
                  </Box>
                </Box>
                <Box className="img-app-icon-container">
                  <img src={appIconFull} className="img-app-icon" alt="App icon" />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      <Box className="btn-save">
        <Button
          prefixIcon={<QrCodeOutlinedIcon />}
          style={{ margin: '8px 0', width: '100%' }}
          onClick={() => handleSave(saveRef)}
        >
          {t('tableManagement.saveAllQr')}
        </Button>
      </Box>
    </>
  );
};

export default QRCodeMultiplyViewer;
