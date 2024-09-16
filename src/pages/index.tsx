import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Page,
  Text,
} from "zmp-ui";
import { storeListState, userState } from "../state";
import { useRecoilState, useRecoilValue } from "recoil";
import { fetchTablesForStore, getStoreByUUID, getStoreList } from "../api/api";
import UserCard from "../components/user-card";
import { useTranslation } from "react-i18next";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import HistoryIcon from "@mui/icons-material/History";
import { initCloudStorage, useInitData } from "@telegram-apps/sdk-react";
import QrScanner from "qr-scanner";
import CollectionsIcon from "@mui/icons-material/Collections";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Snackbar } from "@telegram-apps/telegram-ui";
import {refreshCache } from "@/api/cloudStorageManager";
interface Table {
  uuid: string;
  name: string;
}

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [storeList, setStoreListState] = useRecoilState(storeListState);
  const user = useRecoilValue(userState);
  const { t } = useTranslation("global");
  const [, setScanResult] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  
  const hostname = window.location.hostname;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cloudStorage = initCloudStorage();
  const MAX_SCAN_COUNT = 5;
  const fileInputRef = useRef<HTMLInputElement | null>(null); 
  const [isProcessing, setIsProcessing] = useState(false); 
  const initData = useInitData();
console.log(initData);
 const getStoreData = async () => {
    const response = await getStoreList();
    const data = response.data
    if (!data.error) {
      setStoreListState({
        is_update: true,
        stores: data,
      });
    } else {
      console.log('err', data.error);
    }

 }

  useEffect(() => {
    if (storeList.stores.length > 0) {
      setDefaultStore();
    }
  }, [storeList.stores]);

  const setDefaultStore = async () => {
    const defaultStore = await cloudStorage.get("defaultStore");
    const subdomain = await cloudStorage.get("subdomain")
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
    const isLocalhost = hostname === "localhost";
    console.log(isLocalhost ? "Running on localhost" : "Not localhost");
    if (!isLocalhost) {
      getStoreData();
    }
  }, [hostname]);

  useEffect(() => {
    
    let qrScanner: QrScanner | undefined;;
    if (showScanner && videoRef.current) {
      qrScanner = new QrScanner(
        videoRef.current,
        async (result) => {
          if (isProcessing) return; 

          setIsProcessing(true); 
          // setTimeout(async () => {
            console.log(result);
            setScanResult(result.data);
            setShowScanner(false);

            const data = result.data
            const startApp = data.split("startapp=")[1];
            console.log(startApp);

            let startAppArray: string[] = [];
            if (startApp) {
              startAppArray = startApp.split('_');
            }

            console.log('start arr', startAppArray);

            const tenantId = startAppArray[0]
            const tableId = startAppArray[1]
            const storeId = startAppArray[2]

            // const urlRedirect = new URL(result.data);
            // const storeId = urlRedirect.searchParams.get("storeId");
            // const tableId = urlRedirect.searchParams.get("tableId");
            // const tenantId = urlRedirect.searchParams.get("tenant_id");

            if (storeId && tableId && tenantId) {
              await handleScanQr(result.data, storeId, tableId, tenantId);
            } else {
              notifyErrorStoreNotFound();
            }

            setIsProcessing(false); 
          // }, 800);
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
  }, [showScanner, isProcessing]);

  const getNamesByStoreAndTable = async (storeId: string, tableId: string) => {
    try {
      //get tableName
      const response = await fetchTablesForStore(storeId);
      const tables: Table[] = response.data as Table[]; 
      const table = tables.find((table) => table.uuid === tableId);
      const tableName = table ? table.name : null;
      console.log(tableName);

      //get storeName
      const data = await getStoreByUUID(storeId);
      const storeData = data.data;
      const storeName = storeData ? storeData.name : null;
      console.log(storeName);

      return { storeName, tableName };
    } catch (error) {
      console.error("Error fetching store or table name:", error);
      return { storeName: null, tableName: null };
    }
  };

  useEffect(() => {
    if (initData?.startParam) {
      let parts = initData?.startParam.split("_");
      console.log(parts);
      redirectToMenu(parts[2], parts[1], parts[0]);
    }

  },[])
  const handleScanQr = async (qrData: string, storeId: string, tableId: string, tenantId: string) => {
    await refreshCache();

    // const subdomain = await getSubdomain();
    // console.log(subdomain);
    
    // if (!subdomain) {
    //     console.error('Error: Subdomain not found');
    //     return;
    // }

    let scanCount: number = parseInt(localStorage.getItem("scanCount") || "0", 10);
    let scanList: { qrData: string; storeName: string; tableName: string }[] = 
        JSON.parse(localStorage.getItem("scanList") || "[]");

    if (scanCount >= MAX_SCAN_COUNT) {
        scanList.shift();
        scanCount--;   
    } else {
        scanCount++;
    }

    getNamesByStoreAndTable(storeId, tableId).then(({ storeName, tableName }) => {
        if (storeName && tableName) {
            scanList.push({ qrData, storeName, tableName });  
            localStorage.setItem("scanList", JSON.stringify(scanList));
            localStorage.setItem("scanCount", scanCount.toString());
            console.log(localStorage.getItem("scanCount"));
            console.log(localStorage.getItem("scanList"));
        }
        redirectToMenu(storeId, tableId, tenantId);
    }).catch(error => {
        console.error('Error fetching store and table names:', error);
    });
};


  const notifyErrorStoreNotFound = () => {
    setSnackbarMessage(t("main.not_found"));
    setSnackbarType("error");
    setSnackbarOpen(true);
  };

  const redirectToMenu = (storeId: string, tableId: string, tenantId: string) => {
    navigate({
      pathname: `/menuu/${storeId}/${tableId}`,
      search: `?tenant_id=${tenantId}`,
    });
  };

  const handleError = (error: string) => {
    setSnackbarMessage(error);
    setSnackbarType("error");
    setSnackbarOpen(true);
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

  const handleSelectImage = async (event: any) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const img = new Image();
        img.onload = async () => {
          try {
            const result = await QrScanner.scanImage(file, {
              returnDetailedScanResult: true,
            });
            // const urlRedirect = new URL(result.data);
            // const storeId = urlRedirect.searchParams.get("storeId");
            // const tableId = urlRedirect.searchParams.get("tableId");
            // const tenantId = urlRedirect.searchParams.get("tenant_id");

            const data = result.data
            const startApp = data.split("startapp=")[1];
            console.log(startApp);

            let startAppArray: string[] = [];
            if (startApp) {
              startAppArray = startApp.split('_');
            }

            console.log('start arr', startAppArray);

            const tenantId = startAppArray[0]
            const tableId = startAppArray[1]
            const storeId = startAppArray[2]

  
            if (storeId && tableId && tenantId) {
              redirectToMenu(storeId, tableId, tenantId);
            } else {
              notifyErrorStoreNotFound();
            }
          } catch (error) {
            console.error("Error during QR code scan:", error);
            handleError("Lỗi quét mã QR");
          }
        };
        img.onerror = () => {
          handleError("Lỗi tải hình ảnh.");
        };
        img.src = URL.createObjectURL(file);
      } catch (error) {
        console.error("Error during image handling:", error);
        handleError("Lỗi xử lý hình ảnh.");
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
        <Box style={{ textAlign: "center" , color:'black'}}>
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
      <div style={{borderRadius:'10px'}}>
          {snackbarOpen && (
            <Snackbar onClose={() => setSnackbarOpen(false)} duration={3000}>
              <div className={`snackbar ${snackbarType === "success" ? "snackbar-success" : "snackbar-error"}`}>
                <div style={{display:'flex'}}>
                  {snackbarType === "success" && <CheckCircleIcon style={{ marginRight: 8, color:'green' }} />} 
                  {snackbarType === "error" && <ErrorIcon style={{ marginRight: 8, color:'red' }} />} 
                  {snackbarMessage}
                </div>
              </div>
            </Snackbar>
          )}
        </div>
    </Page>
  );
};

export default Index;
