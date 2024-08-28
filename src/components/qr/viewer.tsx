import React, { useRef } from "react";
import QRCode from "qrcode.react";
import "./styles.scss";
import { Box, Button, Text } from "zmp-ui";
import { useTranslation } from "react-i18next";
import appIcon from "../../static/icons/app-logo.png";
import appIconFull from "../../static/icons/web-icon-full.png";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ChecklistIcon from "@mui/icons-material/Checklist";

interface QRCodeViewerProps {
  value: string;
  title: string;
  sendPhotoToTelegram: (base64: string) => Promise<void>;
}

const QRCodeViewer: React.FC<QRCodeViewerProps> = ({ value, title, sendPhotoToTelegram }) => {
  const { t } = useTranslation("global");
  const exportRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLDivElement>;

  const handleSaveQr = async () => {
    if (exportRef.current) {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const svg = exportRef.current.querySelector("svg");

        if (svg && context) {
          const svgData = new XMLSerializer().serializeToString(svg);
          const img = new Image();
          img.src = "data:image/svg+xml;base64," + btoa(svgData);

          img.onload = async () => {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            const base64 = canvas.toDataURL("image/png").replace("data:image/png;base64,", "");

            // Gọi hàm sendPhotoToTelegram với base64
            await sendPhotoToTelegram(base64);
          };
        }
      } catch (error) {
        console.error("Error converting QR code to image:", error);
      }
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
      <Button onClick={handleSaveQr}>{t("button.save")}</Button>
    </Box>
  );
};

export default QRCodeViewer