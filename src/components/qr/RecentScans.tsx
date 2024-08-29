import React, { useEffect, useState } from "react";
import "./RecentScans.scss";
import { useNavigate } from "react-router-dom";
import { Checkbox, Icon, Text, useSnackbar } from "zmp-ui";
import { useTranslation } from "react-i18next";
import QrCodeIcon from "@mui/icons-material/QrCode";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";

interface ScanItem {
  qrData: string;
  storeName: string;
  tableName: string;
}

const RecentScans: React.FC = () => {
  const navigate = useNavigate();
  // const scanList: ScanItem[] = JSON.parse(localStorage.getItem("scanList") || "[]");
  const [scanList, setScanList] = useState<ScanItem[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const { t } = useTranslation("global");
  const snackbar = useSnackbar();

  useEffect(() => {
    const storedScanList = JSON.parse(localStorage.getItem("scanList") || "[]");
    setScanList(storedScanList);
  }, []);

  console.log(scanList);
  

  const toggleSelect = (index: number) => {
    setSelectedIndexes((prevSelectedIndexes) =>
      prevSelectedIndexes.includes(index)
        ? prevSelectedIndexes.filter((i) => i !== index)
        : [...prevSelectedIndexes, index],
    );
  };

  const handleEditClick = () => {
    setIsEditMode((prev) => !prev);
    if (isEditMode) {
      setSelectedIndexes([]);
    }
  };

  const deleteSelectedLinks = () => {
    const remainingLinks = scanList.filter(
      (_, index) => !selectedIndexes.includes(index),
    );
    localStorage.setItem("scanList", JSON.stringify(remainingLinks));
    setSelectedIndexes([]);
    // window.location.reload();
  };

  const handleRedirect = (qrData: string) => {
    try {
      const urlRedirect = new URL(qrData);
      const storeId = urlRedirect.searchParams.get("storeId");
      const tableId = urlRedirect.searchParams.get("tableId");
      const tenantId = urlRedirect.searchParams.get("tenant_id");

      if (storeId && tableId && tenantId) {
        redirectToMenu(storeId, tableId, tenantId);
      } else {
        notifyErrorStoreNotFound();
      }
    } catch (error) {
      notifyErrorStoreNotFound();
    }
  };

  const notifyErrorStoreNotFound = () => {
    snackbar.openSnackbar({
      text: t("main.not_found"),
      type: "error",
    });
  };

  const redirectToMenu = (storeId: string, tableId: string, tenantId: string) => {
    navigate({
      pathname: `/menu/${storeId}/${tableId}`,
      search: `?tenant_id=${tenantId}`,
    });
  };

  return (
    <div className="recent-scans">
      <button
        className="edit-button"
        hidden={scanList.length === 0}
        onClick={handleEditClick}
        style={{ color: "#0078ff", paddingTop: "10px" }}
      >
        <Icon icon="zi-delete" />
      </button>
      <ul className="link-list">
        {scanList.length > 0 ? (
          scanList.map((s, index) => (
            <li key={index} className="link-recent">
              {isEditMode && (
                <Checkbox
                  checked={selectedIndexes.includes(index)}
                  onChange={() => toggleSelect(index)}
                  value={index.toString()}
                />
              )}
              <div className="link-content">
                <div className="link-icon">
                  <TableRestaurantIcon />
                </div>
                <div className="link-details">
                  <a
                    className="link-text-recent"
                    href="#"
                    onClick={() => handleRedirect(s.qrData)}
                  >
                    {/* {s.storeName} - {s.tableName} */}
                    {s.qrData}
                  </a>
                </div>
              </div>
            </li>
          ))
        ) : (
          <div
            className="no-links"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              height: "100vh",
              paddingTop: "90px",
            }}
          >
            <QrCodeIcon
              style={{
                fontSize: "80px",
                color: "black",
                opacity: 0.4,
                marginTop: "100px",
              }}
            />
            <Text.Title className="title-text" style={{ color: "gray" }}>
              {t("main.textWhenNothing")}
            </Text.Title>
          </div>
        )}
      </ul>

      {isEditMode && scanList.length > 0 && (
        <div className="edit-actions">
          <Text.Title
            className="title-text"
            onClick={() =>
              setSelectedIndexes(scanList.map((_, index) => index))
            }
          >
            Chọn tất cả
          </Text.Title>
          <button
            disabled={selectedIndexes.length === 0}
            className={
              selectedIndexes.length === 0 ? "disable-btn" : "remove-btn"
            }
            onClick={deleteSelectedLinks}
          >
            <Icon icon="zi-delete" />
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentScans;