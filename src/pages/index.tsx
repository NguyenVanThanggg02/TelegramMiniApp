import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Page,
  Text,
  useSnackbar,
} from "zmp-ui";
import { storeListState, userState } from "../state";
import { useRecoilState, useRecoilValue } from "recoil";
import { getStoreList } from "../api/api";
import UserCard from "../components/user-card";
import { useTranslation } from "react-i18next";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import HistoryIcon from "@mui/icons-material/History";
import { initCloudStorage } from "@telegram-apps/sdk-react";
import QrScanner from "qr-scanner";
import CollectionsIcon from "@mui/icons-material/Collections";
import { useNavigate } from "react-router-dom";

interface StoreState {
  uuid: string;
  name: string;
  subdomain: string;
  created_at: string;
  store_settings: []; 
  ai_requests_count:number
  turn_on_table?: boolean;  
  tables_count?: number; 
  turn_on_category?: boolean;
  categories_count?: number;
  turn_on_product?: boolean;
  products_count?: number;
  turn_on_voucher?: boolean; 
  vouchers_count?: number;
  turn_on_order?: boolean; 
  orders_count?: number;
  turn_on_staff?: boolean;  
  staff_count?: number;
  turn_on_sale_report?: boolean;
}


const Index: React.FC = () => {
  const navigate = useNavigate();
  const [storeList, setStoreListState] = useRecoilState(storeListState);
  const user = useRecoilValue(userState);
  const { t } = useTranslation("global");
  const [, setScanResult] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const snackbar = useSnackbar();
  const hostname = window.location.hostname;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cloudStorage = initCloudStorage();
  const MAX_SCAN_COUNT = 5;
  const fileInputRef = useRef<HTMLInputElement | null>(null); 

 const getStoreData = async () => {
  try {
    const response = await getStoreList();
    if (response.data && !response.error) {
      const storeData: StoreState[] = response.data as StoreState[];
      setStoreListState({
        is_update: true,
        stores: storeData,
      });
    } else {
      console.log('err', response.error);
    }
  } catch (error) {
    console.log('err in getstoredata', error);
  }
 }

  useEffect(() => {
    if (storeList.stores.length > 0) {
      setDefaultStore();
    }
  }, [storeList.stores]);

  const setDefaultStore = async () => {
    const defaultStore = await cloudStorage.get("defaultStore");
    const subdomain = await cloudStorage.get('subdomain')
    const existStore = storeList.stores.find((s) => s.subdomain === subdomain);

    if (!defaultStore || !existStore) {
      await cloudStorage.set("defaultStore", JSON.stringify(storeList.stores[0]));
      await cloudStorage.set("subdomain", storeList.stores[0]?.subdomain || '');
    } else if (existStore) {
      await cloudStorage.set("defaultStore", JSON.stringify(existStore));
      await cloudStorage.set("subdomain", existStore.subdomain || '');
       
    }
  };

  useEffect(() => {
    // check hostname
    console.log(hostname);
    const isLocalhost = hostname === "localhost";
    console.log(isLocalhost ? "Running on localhost" : "Not localhost");
    if (!isLocalhost) {
      getStoreData();
    }
  }, [hostname]);

  useEffect(() => {
  let qrScanner: QrScanner | undefined;
  if (showScanner && videoRef.current) {
    qrScanner = new QrScanner(
      videoRef.current,
      (result) => {
        setTimeout(() => {
          console.log(result);
          setScanResult(result.data);
          setShowScanner(false);
          
          // Hard code các dữ liệu
          const storeId = "b5d2f76d-ce6d-4304-a124-a171b40178a6";
          const tableId = "4af29a08-9e4e-41e9-8178-ee14a1f57c33";
          const tenantId = "fdfaedea-cf03-43c7-94ec-b4cb71519e8d";

          // Gọi hàm handleScanQr với dữ liệu hard code
          handleScanQr(result.data, storeId, tableId, tenantId);
        }, 1000);
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
      },
    );
    qrScanner.start();

    return () => {
      qrScanner?.stop();
      qrScanner?.destroy();
    };
  }
}, [showScanner]);


  const handleScanQr = (qrData: string, storeId: string, tableId: string, tenantId: string) => {
    let scanCount = parseInt(localStorage.getItem("scanCount") || "0");
    let scanList: string[] = JSON.parse(localStorage.getItem("scanList") || "[]");

    if (scanCount >= MAX_SCAN_COUNT) {
      scanList.shift();
    } else {
      scanCount++;
    }

    scanList.push(qrData);
    localStorage.setItem("scanList", JSON.stringify(scanList));
    localStorage.setItem("scanCount", scanCount.toString());
    console.log(localStorage.getItem("scanCount"));
    console.log(localStorage.getItem("scanList"));

    redirectToMenu(storeId, tableId, tenantId);
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

  const handleError = (error: string) => {
    snackbar.openSnackbar({
      text: error,
      type: "error",
    });
  };

  const toggleScanner = () => {
    if (hostname === "localhost") {
      console.log("Cannot scan QR code on localhost.");
      return;
    }
    setShowScanner(!showScanner);
  };
  const hanldeReScanQr = () => {
    navigate("/recent-scan");
  };


  
  const handleSelectImage = async (event:any) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const result = await QrScanner.scanImage(file, {
          returnDetailedScanResult: true,
        });
        const urlRedirect = new URL(result.data);
        const storeId = urlRedirect.searchParams.get("storeId");
        const tableId = urlRedirect.searchParams.get("tableId");
        const tenantId = urlRedirect.searchParams.get("tenant_id");

        if (storeId && tableId && tenantId) {
          redirectToMenu(storeId, tableId, tenantId);
        } else {
          notifyErrorStoreNotFound();
        }
      } catch (error) {
        console.error("Error during QR code scan:", error);
        handleError("Lỗi quét mã qr");
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click(); 
  };

  return (
    <Page className="page">
      <Box className="section-container" height={80}>
      <UserCard isAdmin={true} />
      </Box>
      <Box flex flexDirection="column" className="section-container">
        <Box style={{ textAlign: "center" }}>
          <Text size="xLarge" bold>
            {t("main.scanQrDes")}
          </Text>
          {showScanner ? (
            <div style={{ position: "relative", display: "inline-block" }}>
              <video
                ref={videoRef}
                style={{ width: "100%", maxWidth: "550px" }}
                // onError={handleError}
              />
              <Text
                style={{
                  position: "absolute",
                  top: "45px",
                  left: "45%",
                  transform: "translateX(-45%)",
                  color: "white",
                  textShadow: "0px 0px 5px rgba(0, 0, 0, 0.5)",
                }}
              >
                Hướng camera vào mã QR
              </Text>
              {/* thêm từ thư viện */}
              <div
                className="recent-icon-container"
                style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "70px",
                  height: "70px",
                }}
                onClick={handleClick}
                >
                <div
                  className="icon"
                  style={{
                    color: "white",
                    width: "45px",
                    height: "50px",
                    backgroundColor: "#333",
                    borderRadius: "50%",
                    display: "flex",
                    opacity: 0.5,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "5px",
                  }}
                >
                  <CollectionsIcon />
                </div>
                <div
                  className="label"
                  style={{ color: "white", fontSize: "12px" }}
                >
                  {t("main.choosePicture")}
                </div>
              </div>
              {/* gần đây */}
              <div
                className="recent-icon-container"
                style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "70px",
                  height: "70px",
                }}
                onClick={hanldeReScanQr}
              >
                <div
                  className="icon"
                  style={{
                    color: "white",
                    width: "45px",
                    height: "50px",
                    backgroundColor: "#333",
                    borderRadius: "50%",
                    display: "flex",
                    opacity: 0.5,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "5px",
                  }}
                >
                  <QrCodeScannerIcon />
                </div>
                <div
                  className="label"
                  style={{ color: "white", fontSize: "12px" }}
                >
                  {t("main.reScanQr")}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleSelectImage}
              />
            </div>
          )  : (
            <div
              
              style={{marginTop:'1.5rem', display: "flex", flexDirection: "column", justifyContent:'center', alignItems:'center' }}
            >
              {/* <Spinner onClick={toggleScanner} alt="Scan QR Code" /> */}
              <Text style={{ fontSize: "20px", color:'black' }}>
                ...
              </Text>
            </div>
          )}
        </Box>
        <Box mt={1}>
          <Button
            fullWidth
            style={{ margin: "10px 0", background: "var(--blue-color)" }}
            onClick={toggleScanner}
            prefixIcon={<QrCodeScannerIcon />}
            size="large"
          >
            {showScanner ? t("main.stopScan") : t("main.scanQr")}
          </Button>
        </Box>

        <Box mt={1}>
          <Button
            fullWidth
            style={{ margin: "10px 0", background: "var(--blue-color)" }}
            onClick={() => navigate("/order-history")}
            prefixIcon={<HistoryIcon />}
            size="large"
          >
            {t("userOrder.orderHistory")}
          </Button>
        </Box>

        {user.store_uuid ? (
          <Box mt={1}>
            <Button
              fullWidth
              style={{ margin: "10px 0" }}
              onClick={() => navigate(`/admin/store/index`)}
              prefixIcon={<ManageAccountsIcon />}
              size="large"
            >
              {t("main.adminDashboard")}
            </Button>
          </Box>
        ) : (
          <Box mt={1}>
            <Button
              fullWidth
              style={{ margin: "10px 0" }}
              onClick={() => navigate(`/admin/store/form`)}
              prefixIcon={<AddBusinessIcon />}
              size="large"
            >
              {t("main.regStore")}
            </Button>
          </Box>
        )}
      </Box>
    </Page>
  );
};

export default Index;
