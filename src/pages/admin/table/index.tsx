import React, { useEffect, useState } from "react";
import {
  Page,
  List,
  Button,
  Box,
  Text,
  // useSnackbar,
} from "zmp-ui";
import { useRecoilState } from "recoil";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  loadingState,
  spinnerState,
  storeListState,
  // userState,
} from "../../../state";
import { fetchTablesForStore } from "../../../api/api";
import AddTableForm from "../../../components/table-admin/add_table_form";
import QRCodeViewer from "@/components/qr/viewer";
// import { APP_VERSION } from "../../../constants";
import QrCodeOutlinedIcon from "@mui/icons-material/QrCodeOutlined";
import tableIcon from "../../../static/icons/table.png";
import "./styles.scss";
// import { useTranslation } from "react-i18next";
import QRCodeMultiplyViewer from "../../../components/qr/multiplyViewer";
// import { createTenantURL } from "../../../api/urlHelper";
// import { domToPng } from "modern-screenshot";
// import { toPng } from 'html-to-image';
interface Table {
  uuid: string;
  name: string;
  link: string;
}

const TablePage: React.FC = () => {
  // const { t } = useTranslation("global");
  const { store_uuid } = useParams<{ store_uuid?: string }>(); // Lấy store_uuid từ URL
  const [searchParams] = useSearchParams();
  const tenant_id = searchParams.get("tenant_id");
  const navigate = useNavigate();

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
  // const snackbar = useSnackbar();
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
  //   const url = createTenantURL();
  //   let qr_url = `${url}/redirect?tableId=${table_uuid}&storeId=${store_uuid}&version=${APP_VERSION}&tenantId=${tenant_id}`;
  //   return qr_url;
  // };
  const linkBuilder = (table_uuid: string): string => {
    return `https://zalo.me/s//menu/${store_uuid}/${table_uuid}?tenant_id=${tenant_id}&tableId=${table_uuid}&storeId=${store_uuid}`;
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
        // const dataUrl = await toPng(element.current, { cacheBust: true, backgroundColor: '#ffffff' });
        // console.log(dataUrl,"dataUrl");
        const a = 'data:image/png;base64,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'
        downloadImage(a, "qr-code.png");
        alert("success");
      } catch (error) {
        console.error("Error saving QR code:", error);
      } finally {
        setSpinner(false);
      }
    }
  };
  
  const downloadImage = (blob: string, fileName: string): void => {
    const fakeLink = document.createElement("a");
    fakeLink.style.display = "none";
    fakeLink.download = fileName;

    fakeLink.href = blob;
    document.body.appendChild(fakeLink);
    fakeLink.click();
    document.body.removeChild(fakeLink);
    fakeLink.remove();
  };

  return (
    <Page className="page">
      <div className="section-container">
        <AddTableForm store_uuid={store_uuid} onTableAdded={handleTableAdded} />
        <List style={{ marginBottom: "60px" }}>
          {tables.map((table, index) => (
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
          ))}
        </List>
        {tables?.length > 0 && (
          <QRCodeMultiplyViewer listItems={tables} handleSave={handleSaveQr} />
        )}
      </div>
    </Page>
  );
};

export default TablePage;
