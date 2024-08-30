import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Box,
  Page,
  useSnackbar,
  Text,
} from "zmp-ui";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { storeListState, storeState, userState } from "../../../state";
import {
  validateCode,
  updateUserPhoneRequest,
  createStore,
} from "../../../api/api";
import { useTranslation } from "react-i18next";
import { textToDomain } from "../../../utils/stringFormatter.util";
import { useNavigate } from "react-router-dom";
import { initCloudStorage } from "@telegram-apps/sdk-react";
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

  const snackbar = useSnackbar();
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(true);

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
            snackbar.openSnackbar({
              text: t("snackbarMessage.codeValid"),
              type: "success",
            });
          } else {
            setCodeValid(null);
            snackbar.openSnackbar({
              text: t("snackbarMessage.codeInvalid"),
              type: "error",
            });
          }
        } else {
          setCodeValid(null);
          snackbar.openSnackbar({
            text: t("snackbarMessage.codeNotFound"),
            type: "error",
          });
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
    // if (!user.has_phone && showButton) {
    //   snackbar.openSnackbar({
    //     duration: 3000,
    //     text: t("snackbarMessage.pleaseLinkPhoneNumber"),
    //     type: "countdown",
    //   });
    //   return;
    // }
    const response = await createStore({
      store: {
        name: storeName,
        subdomain: textToDomain(storeName),
      },
      code: activationCode,
    });
    if (!response.error) {
      setStore({
        name: response.data.name,
        uuid: response.data.uuid,
        subdomain: response.data.subdomain,
        created_at: response.data.created_at,
        store_settings: response.data.store_settings,
      });
      setUserState({
        ...user,
        store_uuid: response.uuid || '',
        login: true,
      });
      setStoreListState({
        is_update: false,
        stores: [],
      });
      await cloudStorage.set('defaultStore', response.data);
      await cloudStorage.set('subdomain', response.data.subdomain);
      // Hiển thị snackbar khi lưu thành công
      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.createStoreSuccess"),
        type: "success",
      });
      navigate(-1);
    } else {
      snackbar.openSnackbar({
        duration: 3000,
        text: String(response.error),
        type: "error",
      });
    }
  };

  const handlePhoneSupport = async () => {
    try {
      const data = await cloudStorage.get('auth_token');
      const token  = data;
      await updateUserPhoneRequest({code: token });

      setShowButton(false);
    } catch (error) {
      console.log(error);
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
          {/* <Box mb={2}>
            <Input.TextArea
              type="textarea"
              label={t("storeManagement.storeDescription")}
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              placeholder={t("storeManagement.enterMetadata")}
              style={{ marginBottom: "10px" }}
              showCount
            />
          </Box> */}
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

          {!user.has_phone && showButton && (
            <Box mt={2}>
              <Button fullWidth variant="primary" onClick={handlePhoneSupport}>
                <Text size="xxSmall">
                  {t("storeManagement.getPhoneSupport")}
                </Text>
              </Button>
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
      </div>
    </Page>
  );
};

export default StoreFormPage;
