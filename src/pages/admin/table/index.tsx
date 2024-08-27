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
import { APP_VERSION } from "../../../constants";
import QrCodeOutlinedIcon from "@mui/icons-material/QrCodeOutlined";
import tableIcon from "../../../static/icons/table.png";
import "./styles.scss";
// import { useTranslation } from "react-i18next";
import QRCodeMultiplyViewer from "../../../components/qr/multiplyViewer";
import { createTenantURL } from "../../../api/urlHelper";
import { domToPng } from "modern-screenshot";

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

  const linkBuilder = (table_uuid: string): string => {
    const url = createTenantURL();
    let qr_url = `${url}/redirect?tableId=${table_uuid}&storeId=${store_uuid}&version=${APP_VERSION}&tenantId=${tenant_id}`;

    return qr_url;
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
        const dataUrl = await domToPng(element.current, { scale: 3 });
        downloadImage(dataUrl, "hehe");
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
