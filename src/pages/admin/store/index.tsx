import React, { useState, useEffect } from "react";
import {
  Box,
  Page,
  useSnackbar,
  Select,
  Spinner,
  Button,
} from "zmp-ui";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  loadingState,
  storeListState,
  storeState,
  userState,
} from "../../../state";
import { getStoreListByTenantID, createFollowRequest } from "../../../api/api";
import "./styles.scss";
import { useTranslation } from "react-i18next";
import tableIcon from "../../../static/icons/table.png";
import catIcon from "../../../static/icons/application.png";
import foodIcon from "../../../static/icons/dish.png";
import orderIcon from "../../../static/icons/order-food.png";
import userIcon from "../../../static/icons/users.png";
import reportIcon from "../../../static/icons/report.png";
import voucherIcon from "../../../static/icons/coupon.png";
import storeIcon from "../../../static/icons/store.png";
import appLogo from "../../../static/icons/app-logo.png";
import { getStorage, setStorage } from "zmp-sdk/apis";
import AddIcon from "@mui/icons-material/Add";
import UserCard from "../../../components/user-card";
import { followOA, openChat } from "zmp-sdk/apis";
import appConfig from "../../../../app-config.json";
import { initCloudStorage } from "@telegram-apps/sdk-react";
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

interface StoreListState {
  is_update: boolean;
  stores: StoreState[];
}
interface LoadingState {
  isLoading: boolean;
  completedText: string;
  completedPercent: number;
}

const StorePage: React.FC = () => {
  const { t } = useTranslation("global");
  const [storeList, setStoreListState] = useRecoilState(storeListState);
  const [loading, setLoading] = useRecoilState<LoadingState>(loadingState);
  const navigate = useNavigate();
  const [user, setUserState] = useRecoilState(userState);
  const [errorGetStore, setErrorGetStore] = useState<null | boolean>(null);
  const snackbar = useSnackbar();
  const [store, setStore] = useRecoilState(storeState);
  const [folowOALoading, setFolowOALoading] = useState<boolean>(false);
  const cloudStorage = initCloudStorage();

  useEffect(() => {
    if (!user.store_uuid) {
      navigate("/");
      return;
    }

    setLoading({ ...loading, isLoading: true });
    sendRequestGetStore();
  }, []);

  useEffect(() => {
    setDefaultStore();
  }, [storeList.stores]);

  const setDefaultStore = async () => {
    const defaultStore = await  cloudStorage.get("defaultStore") 
    console.log("defaultStore", defaultStore);
    if (defaultStore) {
      try {
        const parsedStore: StoreState = JSON.parse(defaultStore);
        handleChangeStore(parsedStore.uuid, false);
      } catch (error) {
        console.error("Error parsing default store:", error);
      }
    }
  };

  const handleChangeStore = async (value: string | undefined, getStore: boolean) => {
    if (typeof value === 'string') {
      const selectedStore = storeList.stores.find((s) => s.uuid === value);
      if (!selectedStore) return;
  
      setStore(selectedStore);
  
      await cloudStorage.set("defaultStore", JSON.stringify(selectedStore));
      await cloudStorage.set("subdomain", selectedStore.subdomain);
  
      if (getStore) {
        sendRequestGetStore();
      }
    }
  };
  
  const options = storeList.stores.map((sto) => ({
    value: sto.uuid,
    label: sto.name,
  }));

  const goToTable = (storeUUID: string, tenantId: string) => {
    navigate({
      pathname: `/admin/table/index/${storeUUID}`,
      search: `?tenant_id=${tenantId}`,
    });
  };
  const goToProduct = (storeUUID: string) => {
    navigate(`/admin/product/index/${storeUUID}`);
  };
  const goToCategory = (storeUUID: string) => {
    navigate(`/admin/category/index/${storeUUID}`);
  };
  const goToVoucher = (storeUUID: string) => {
    navigate(`/admin/voucher/index/${storeUUID}`);
  };
  const goToOrderManagement = (storeUUID: string) => {
    navigate(`/admin/order-management/index/${storeUUID}`);
  };
  const goToUserManagement = (storeUUID: string) => {
    navigate(`/admin/user/index/${storeUUID}`);
  };
  const goToSaleReport = (storeUUID: string) => {
    navigate(`/admin/sale-report/${storeUUID}`);
  };

  const goToEditStore = (storeUUID: string) => {
    navigate(`/admin/store/edit/${storeUUID}`);
  };

  const follow_oa = () => {
    setFolowOALoading(true);

    followOA({
      id: appConfig.offical_oa_id,
      success: () => {
        createFollowRequest(appConfig.offical_oa_id);
        setUserState((prevUserState) => ({
          ...prevUserState,
          is_oa_follow: true,
        }));

        setFolowOALoading(false);
      },
      fail: (err) => {
        snackbar.openSnackbar({
          duration: 3000,
          text: t("snackbarMessage.followedOAFailed"),
          type: "error",
        });
      },
    });
  };

  const send_message = () => {
    setFolowOALoading(true);

    openChat({
      type: "oa",
      id: appConfig.offical_oa_id,
      message: "Tôi cần hỗ trợ",
      success: () => {
        console.log("done openChat");
        setFolowOALoading(false);
      },
      fail: (err) => {
        console.log("failed to followed OA");
        snackbar.openSnackbar({
          duration: 3000,
          text: t("snackbarMessage.followedOAFailed"),
          type: "error",
        });
      },
    });
  };

  useEffect(() => {
    if (errorGetStore) {
      snackbar.openSnackbar({
        duration: 10000,
        text: t("snackbarMessage.getStoreFail"),
        type: "countdown",
      });
    }
  }, [errorGetStore, snackbar]);

  const sendRequestGetStore = async () => {
    setLoading({ ...loading, isLoading: true });
    const data = await getStoreListByTenantID();
    if (!data.error) {
      setStoreListState({
        is_update: true,
        stores: data.data || [],
      });
      // console.log(`get stores.length: ${data.length}`);
      setLoading({ ...loading, isLoading: false });
    } else {
      console.error("Error:", data.error);
      setErrorGetStore(true);
      setLoading({ ...loading, isLoading: false });
    }
  };

  return (
    <Page className="page">
      <div className="section-container">
      <UserCard isAdmin={true} />
      </div>
      <Box className="section-container store-container">
        <Box flex alignItems="center">
          <Select
            id="store"
            value={store?.uuid} 
            onChange={(value) => {
              if (typeof value === 'string') {
                handleChangeStore(value, true);
              }
            }}
            closeOnSelect={true}
          >
            {storeList.stores.map((sto) => (
              <option key={sto.uuid} value={sto.uuid} title={sto.name}>
                {sto.name}
              </option>
            ))}
          </Select>

          <Button
            className="fw-500"
            style={{ marginLeft: "14px" }}
            onClick={() => navigate(`/admin/store/form`)}
            prefixIcon={<AddIcon />}
          >
            {t("storeManagement.regStore")}
          </Button>
        </Box>
        <Box className="store_list-item_main" flex>
          {store?.turn_on_table && (
            <Box
              onClick={() => goToTable(store.uuid, store.subdomain)}
              className="store_list-item_main_item"
            >
              <img className="icon-img" src={tableIcon}></img>
              <span className="count-badge status-finished">
                {store?.tables_count}
              </span>
              <span>{t("storeManagement.tables")}</span>
            </Box>
          )}

          {store?.turn_on_category && (
            <Box
              onClick={() => goToCategory(store.uuid)}
              className="store_list-item_main_item"
            >
              <img className="icon-img" src={catIcon}></img>
              <span className="count-badge status-finished">
                {store?.categories_count}
              </span>
              <span>{t("storeManagement.categories")}</span>
            </Box>
          )}

          {store?.turn_on_product && (
            <Box
              onClick={() => goToProduct(store.uuid)}
              className="store_list-item_main_item"
            >
              <img className="icon-img" src={foodIcon}></img>
              <span className="count-badge status-finished">
                {store?.products_count}
              </span>
              <span>{t("storeManagement.products")}</span>
            </Box>
          )}

          {store?.turn_on_voucher && (
            <Box
              onClick={() => goToVoucher(store.uuid)}
              className="store_list-item_main_item"
            >
              <img className="icon-img" src={voucherIcon}></img>
              <span className="count-badge status-finished">
                {store?.vouchers_count}
              </span>
              <span>{t("storeManagement.voucher")}</span>
            </Box>
          )}

          {store?.turn_on_order && (
            <Box
              onClick={() => goToOrderManagement(store.uuid)}
              className="store_list-item_main_item"
            >
              <img className="icon-img" src={orderIcon}></img>
              <span className="count-badge status-finished">
                {store?.orders_count}
              </span>
              <span>{t("storeManagement.order")}</span>
            </Box>
          )}

          {store?.turn_on_staff && (
            <Box
              onClick={() => goToUserManagement(store.uuid)}
              className="store_list-item_main_item"
            >
              <img className="icon-img" src={userIcon}></img>
              <span className="count-badge status-finished">
                {store?.staff_count}
              </span>
              <span>{t("storeManagement.user")}</span>
            </Box>
          )}

          {store?.turn_on_sale_report && (
            <Box
              onClick={() => goToSaleReport(store.uuid)}
              className="store_list-item_main_item"
            >
              <img className="icon-img" src={reportIcon}></img>
              <span>{t("storeManagement.sale_report")}</span>
            </Box>
          )}

          {store?.turn_on_staff && (
            <Box
              onClick={() => goToEditStore(store.uuid)}
              className="store_list-item_main_item"
            >
              <img className="icon-img" src={storeIcon}></img>
              <span>{t("storeManagement.editStore")}</span>
            </Box>
          )}

          <Box
            onClick={
              user?.is_oa_follow ? () => send_message() : () => follow_oa()
            }
            className="store_list-item_main_item"
          >
            {folowOALoading ? (
              <div className="spinner-container">
                <Spinner visible={folowOALoading} logo={appLogo} />
              </div>
            ) : (
              <img className="icon-img" src={appLogo} alt="App Logo" />
            )}
            <span>
              {user?.is_oa_follow
                ? t("storeManagement.send_message")
                : t("storeManagement.follow_oa")}
            </span>
          </Box>
        </Box>
      </Box>
    </Page>
  );
};

export default StorePage;
