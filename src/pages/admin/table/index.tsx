import React, { useEffect, useRef, useState } from "react";
import {
  Page,
  List,
  Button,
  Box,
  Text,
} from "zmp-ui";
import { useRecoilState, useRecoilValue } from "recoil";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  loadingState,
  spinnerState,
  storeListState,
  userState,
  // userState,
} from "../../../state";
import { fetchTablesForStore, uploadImagesToDown } from "../../../api/api";
import AddTableForm from "../../../components/table-admin/add_table_form";
import QRCodeViewer from "@/components/qr/viewer";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Snackbar } from "@telegram-apps/telegram-ui";
// import { APP_VERSION } from "../../../constants";
import QrCodeOutlinedIcon from "@mui/icons-material/QrCodeOutlined";
import tableIcon from "../../../static/icons/table.png";
import "./styles.scss";
import { useTranslation } from "react-i18next";
import QRCodeMultiplyViewer from "../../../components/qr/multiplyViewer";
// import { createTenantURL } from "../../../api/urlHelper";
import { domToPng } from "modern-screenshot";
import { BOT_USERNAME, SHORT_NAME } from "@/constants";
// import { toPng } from 'html-to-image';
interface Table {
  uuid: string;
  name: string;
  link: string;
}

const TablePage: React.FC = () => {
  const divRef = useRef(null);
  const { t } = useTranslation("global");
  const { store_uuid } = useParams<{ store_uuid?: string }>(); // Lấy store_uuid từ URL
  const [searchParams] = useSearchParams();
  const tenant_id = searchParams.get("tenant_id");
  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  const user = useRecoilValue(userState);

  if (!store_uuid) {
    return <div>Error: Store UUID is missing</div>;
  }

  const [tables, setTables] = useState<Table[]>([]);
  // const user = useRecoilValue(userState);
  const [selectedTableUUID, setSelectedTableUUID] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useRecoilState(loadingState);
  const [storeList, setStoreListState] = useRecoilState(storeListState);
  const [, setSpinner] = useRecoilState(spinnerState);

  const handleTableAdded = () => {
    fetchTableData();
    setStoreListState({
      is_update: false,
      stores: [...storeList.stores],
    });
  };

  useEffect(() => {
    setLoading({ ...loading, isLoading: true });
    fetchTableData();
  }, [store_uuid]);

  const fetchTableData = async () => {
    try {
      const response = await fetchTablesForStore(store_uuid);

      if (!response.error && Array.isArray(response.data)) {
        const listTables = response.data.map((tab) => ({
          ...tab,
          link: linkBuilder(tab.uuid),
        }));
        setTables(listTables);
      } else {
        console.error("Lỗi khi lấy dữ liệu bảng:", response.error);
      }
    } catch (error) {
      console.error("Lỗi không mong muốn:", error);
    } finally {
      setLoading({ ...loading, isLoading: false });
    }
  };

// const linkBuilder = (table_uuid: string): string => { 
//     return `https://menu/${store_uuid}/${table_uuid}?tenant_id=${tenant_id}&tableId=${table_uuid}&storeId=${store_uuid}`;
//   };

  const linkBuilder = (table_uuid: string): string => {
    // const botUsername = "MiLiKun_bot"; 
    // const shortName = "orderfood";
    const botUsername = BOT_USERNAME; 
    const shortName = SHORT_NAME;
    const startParam = `${tenant_id}_${table_uuid}_${store_uuid}`;
    return `tg://resolve?domain=${botUsername}&appname=${shortName}&startapp=${startParam}`;
  };
  

  const goToTableDetails = (tableUUID: string, tableName: string) => {
    navigate({
      pathname: `/admin/table/form/${store_uuid}/${tableUUID}`,
      search: `?table_name=${tableName}`,
    });
  };

  const handleSaveQr = async (element: React.RefObject<HTMLDivElement>) => {
    if (element.current) {
      setSpinner(true);
      element.current.style.fontFamily = "Montserrat";
      try {
        // const dataUrl = await domToPng(element.current, { cacheBust: true, backgroundColor: '#ffffff' });
        const dataUrl = await domToPng(element.current, { scale: 3 });

        const blob = await (await fetch(dataUrl)).blob();
        const formData = new FormData();
        formData.append("file", blob, "qr-code.png");

        const response = await uploadImagesToDown(
          store_uuid,
          user.uuid,
          formData
        );
        console.log(response.data.data.urls[0]);

        const serverImageUrl = response.data.data.urls[0];
        await sendUrlToTelegramBot(serverImageUrl);

        // downloadImage(serverImageUrl, "qr-code-from-server.png");

        setSnackbarMessage(t("tableManagement.saveQrNoti"));
        setSnackbarType("success");
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Error saving QR code:", error);
        setSnackbarMessage(t("tableManagement.saveQrFail"));
        setSnackbarType("error");
        setSnackbarOpen(true);
      }
      setSpinner(false);
    }
  };
  
  const sendUrlToTelegramBot = async (imageUrl: string) => {
    const BOT_API_KEY = "7273544566:AAFEYQS5oJZR0s9npHlbWwlBYcT1RKjoa3o"
    const botApiUrl = `https://api.telegram.org/bot${BOT_API_KEY}/sendMessage`;
    
    try {
      const response = await fetch(botApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id:"7198463939" ,
          text: `${imageUrl}`,
        }),
      });
  
      const result = await response.json();
      if (!result.ok) {
        throw new Error(`Lỗi: ${result.description}`);
      }
    } catch (error) {
      console.error("Lỗi khi gửi URL cho bot Telegram:", error);
    }
  };
  

  // const downloadImage = (blob: string, fileName: string): void => {
  //   const fakeLink = document.createElement("a");
  //   fakeLink.style.display = "none";
  //   fakeLink.download = fileName;
  //   fakeLink.href = blob;
  //   document.body.appendChild(fakeLink);
  //   fakeLink.click();
  //   document.body.removeChild(fakeLink);
  //   fakeLink.remove();
  // };

// hết tb allow-downloads
// const downloadImage = (blob: string): void => {
//   const iframe = document.createElement("iframe");
//   iframe.setAttribute("sandbox", "allow-same-origin allow-scripts allow-downloads"); 
//   iframe.src = blob; 
//   iframe.style.display = "none"; 
//   document.body.appendChild(iframe); 
//   document.body.removeChild(iframe); 
// };

  return (
    <Page className="page"  //@ts-ignore
    ref={divRef}>
      <div className="section-container">
        <AddTableForm store_uuid={store_uuid} onTableAdded={handleTableAdded} />
        <List style={{ marginBottom: "60px" }}>
          {tables.length > 0 ? (
            tables.map((table, index) => (
              <Box key={index}>
                <Box
                  className="table-card-container"
                  onClick={() => goToTableDetails(table.uuid, table.name)}
                >
                  <img className="table-img" src={tableIcon}></img>
                  <Box>
                    <Box flex flexDirection="column">
                      <Text
                        size="xLarge"
                        bold
                        style={{ marginLeft: "10px", color: "black" }}
                      >
                        {table.name}
                      </Text>
                    </Box>
                  </Box>
                  <Button
                    icon={<QrCodeOutlinedIcon />}
                    className="qr-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTableUUID(
                        selectedTableUUID === table.uuid ? "" : table.uuid
                      );
                    }}
                  ></Button>
                </Box>
                <Box>
                  {selectedTableUUID === table.uuid && (
                    <QRCodeViewer
                      value={table.link}
                      title={table.name.toUpperCase()}
                      handleSave={handleSaveQr}
                     
                    />
                  )}
                </Box>
              </Box>
            ))
          ) : (
            <Box
              className="order-table_empty"
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                marginTop:'50px'

              }}
            >
              <Text
                style={{ color: "rgba(0, 0, 0, 0.5)", textAlign: "center" }}
              >
                {t("main.table")}
              </Text>
            </Box>
          )}
        </List>
        {tables?.length > 0 && (
          <QRCodeMultiplyViewer listItems={tables} handleSave={handleSaveQr} />
        )}
      </div>
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
    </Page>
  );
};

export default TablePage;
