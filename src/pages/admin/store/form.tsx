import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Box,
  Page,
  Text,
} from "zmp-ui";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { storeListState, storeState, userState } from "../../../state";
import {
  validateCode,
  createStore,
} from "../../../api/api";
import { useTranslation } from "react-i18next";
import { textToDomain } from "../../../utils/stringFormatter.util";
import { useNavigate } from "react-router-dom";
import { initCloudStorage } from "@telegram-apps/sdk-react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Snackbar } from "@telegram-apps/telegram-ui";

const cloudStorage = initCloudStorage();

interface CodeValid {
  code: string;
  value_in_days: number;
  content: string;
  expired_at: string;
}

const StoreFormPage: React.FC = () => {
  const { t } = useTranslation("global");
  const user = useRecoilValue(userState);
  const setUserState = useSetRecoilState(userState);
  const setStore = useSetRecoilState(storeState);
  const [storeName, setStoreName] = useState<string>("");
  const [activationCode, setActivationCode] = useState<string>("");
  const [checkedCode, setCheckedCode] = useState<string>("");

  const [codeValid, setCodeValid] = useState<CodeValid | null>(null);

  const [, setStoreListState] = useRecoilState(storeListState);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!activationCode) {
      setCheckedCode("");
    }

    if (activationCode && activationCode != checkedCode) {
      setCodeValid(null);
      // Hủy bỏ yêu cầu trước nếu mã nhập thay đổi
      const controller = new AbortController();
      const { signal } = controller;

      const timer = setTimeout(async () => {
        const response = await validateCode({ code: activationCode });
        const data = response.data;

        if (!response.error && data) {
          setCheckedCode(activationCode);

          // Check validity of the code
          if (
            data.status === "actived" &&
            data.expired_at &&
            new Date(data.expired_at) > new Date()
          ) {
            // Transform ActivationData to CodeValid
            const codeValid: CodeValid = {
              code: data.code || activationCode,
              value_in_days: data.value_in_days || 0,
              content: data.content || "",
              expired_at: data.expired_at,
            };
            setCodeValid(codeValid);
            setSnackbarMessage(t("snackbarMessage.codeValid"));
            setSnackbarType("success");
            setSnackbarOpen(true);
          } else {
            setCodeValid(null);
            setSnackbarMessage(t("snackbarMessage.codeInvalid"));
            setSnackbarType("error");
            setSnackbarOpen(true);
          }
        } else {
          setCodeValid(null);
          
          setSnackbarMessage(t("snackbarMessage.codeNotFound"));
          setSnackbarType("error");
          setSnackbarOpen(true);
          setCheckedCode(activationCode);
          if (!signal.aborted) {
            console.error("Error validating code:", response.error);
          }
          return Promise.reject(new Error(t("snackbarMessage.codeNotFound")));
        }
      }, 1000);

      return () => {
        clearTimeout(timer);
        controller.abort(); // Hủy bỏ yêu cầu khi component unmount hoặc activationCode thay đổi
      };
    }
  }, [activationCode]);

  const handleSubmit = async () => {
    const response = await createStore({
      store: {
        name: storeName,
        subdomain: textToDomain(storeName),
      },
      code: activationCode,
    });
    const data = response.data
    if (!data.error) {
      console.log(`store_uuid: ${data.uuid}`);
      setStore({
        name: data.name,
        uuid: data.uuid,
        subdomain: data.subdomain,
        created_at: data.created_at,
        store_settings: data.store_settings,
      });
      setUserState({
        ...user,
        store_uuid: data.uuid || '',
        login: true,
      });
      setStoreListState({
        is_update: false,
        stores: [],
      });
      await cloudStorage.set('defaultStore', data);
      await cloudStorage.set('subdomain', data.subdomain);
      // Hiển thị snackbar khi lưu thành công
      
      setSnackbarMessage(t("snackbarMessage.createStoreSuccess"));
        setSnackbarType("success");
        setSnackbarOpen(true);
        setTimeout(() => {
          navigate(-1); 
        }, 2000);
    } else {
      setSnackbarMessage(String(response.error));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <Page className="page">
      <div className="section-container">
        <Box>
          <Box mb={2}>
            <Input
              id="name"
              label={t("storeManagement.storeName")}
              type="text"
              placeholder={t("storeManagement.enterStoreName")}
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              showCount
              maxLength={20}
            />
          </Box>
          <Box mb={2}>
            <Input
              type="text"
              label={t("storeManagement.activationCode")}
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
              placeholder={t("storeManagement.enterActivationCode")}
              style={{ marginBottom: "10px" }}
            />
          </Box>
          {codeValid && activationCode === codeValid?.code && (
            <Box className="active-code-container" flex alignItems="center">
              <Box
                className="active-code-date-container"
                flex
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
              >
                <Text className="active-code-date-number">
                  {codeValid.value_in_days}
                </Text>
                <Text className="active-code-date-text">
                  {t("storeManagement.days")}
                </Text>
              </Box>
              <Box
                flex
                justifyContent="center"
                flexDirection="column"
                style={{ padding: "14px", flex: 1 }}
              >
                <Text size="xLarge" bold style={{ marginBottom: "8px" }}>
                  {codeValid.code}
                </Text>
                <Text size="small" className="text-code-content">
                  {codeValid.content}
                </Text>
                <Text size="xxSmall" className="text-experied">
                  {t("voucherManagement.experiedAt")}{" "}
                  {new Date(codeValid.expired_at).toLocaleDateString("en-GB")}
                </Text>
              </Box>
            </Box>
          )}

          <Box mt={2}>
            <Button
              fullWidth
              variant="primary"
              onClick={handleSubmit}
              disabled={!codeValid || !storeName}
            >
              {t("button.register")}
            </Button>
          </Box>

          <Box mt={2}>
            <img src="https://stg-smart-order.sgp1.digitaloceanspaces.com/store_ad.png" />
          </Box>
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
      </div>
    </Page>
  );
};

export default StoreFormPage;
