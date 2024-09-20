import React, { MutableRefObject, useRef } from "react";
import QRCode from "qrcode.react";
import "./styles.scss";
import { Box, Button, Text } from "zmp-ui";
import { useTranslation } from "react-i18next";
import appIcon from "../../static/icons/app-logo.png";
import appIconFull from "../../static/icons/web-icon-full.png";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ChecklistIcon from "@mui/icons-material/Checklist";
//@ts-ignore
import domtoimage from "dom-to-image";
import { saveAs } from "file-saver";

interface QRCodeViewerProps {
  value: string;
  title: string;
  handleSave: (ref: MutableRefObject<HTMLDivElement | null>) => void;
}

const QRCodeViewer: React.FC<QRCodeViewerProps> = ({ value, title }) => {
  const { t } = useTranslation("global");
  const exportRef = useRef<HTMLDivElement>(
    null
  ) as React.MutableRefObject<HTMLDivElement>;
  const saveImage = () => {
    if (exportRef.current) {
      domtoimage
        .toBlob(exportRef.current)
        //@ts-ignore
        .then(function (blob) {
          saveAs(blob, `${title}-QRCode.png`); // Lưu file với tên theo table title
        })

        //@ts-ignore
        .catch(function (error) {
          console.error("Oops, something went wrong!", error);
        });
    }
  };
  return (
    <Box className="qr-code-container">
      <Box className="qr-code-content" mb={3} ref={exportRef}>
        <Box className="top-qr-container">
          <Box
            style={{
              padding: "14px 38px",
              paddingBottom: "8px",
              height: "223px",
            }}
          >
            <Box style={{ marginBottom: "4px" }}>
              <Text className="scan-qr-title">
                {t("tableManagement.scanQrTable")}
              </Text>
              <Text className="qr-code-menu">{t("tableManagement.menu")}</Text>
            </Box>
            <Box className="qr-container">
              <QRCode
                value={value}
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
                <QrCodeScannerIcon style={{ fontSize: "20px" }} />
              </Box>
              {t("tableManagement.scanQr")}
            </Box>
            <Box className="sub-item-container">
              <Box className="sub-item-qr">
                <RestaurantMenuIcon style={{ fontSize: "20px" }} />
              </Box>
              {t("tableManagement.viewMenu")}
            </Box>
            <Box className="sub-item-container">
              <Box className="sub-item-qr">
                <ChecklistIcon style={{ fontSize: "20px" }} />
              </Box>
              {t("tableManagement.order")}
            </Box>
            {/* <Box className="sub-item-container">
              <Box className="sub-item-qr">
                <AttachMoneyIcon style={{ fontSize: "20px" }} />
              </Box>
              {t("tableManagement.pay")}
            </Box> */}
          </Box>
        </Box>
        <Box
          flex
          alignItems="center"
          justifyContent="flex-end"
          className="bottom-qr-container"
          style={{ paddingRight: "5px" }}
        >
          <Box className="txt-table-name">
            <Box className="table-name-container">
              <span style={{ whiteSpace: "nowrap" }}>{title}</span>
            </Box>
          </Box>
          <Box className="img-app-icon-container">
            <img src={appIconFull} className="img-app-icon"></img>
          </Box>
        </Box>
      </Box>
      <Button onClick={saveImage}>{t("button.save")}</Button>
    </Box>
  );
};

export default QRCodeViewer;
