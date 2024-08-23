import React, { useEffect, useState } from "react";
import {
  List,
  Button,
  Icon,
  Box,
  Page,
  useSnackbar,
  Text,
} from "zmp-ui";

import { useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userState, loadingState, storeState } from "../../../state";
import { getAiRequestListByStore } from "../../../api/api";
import { openMediaPicker } from "zmp-sdk/apis";
import { useTranslation } from "react-i18next";
import { getBaseUrl } from "../../../api/apiBase";
import { timePeriodFormatter } from "../../../utils/timePeriodFormatter";

interface AiRequest {
  status: string;
  created_at: string;
}

const ScaneMenuPage: React.FC = () => {
  const { t } = useTranslation("global");
  const { store_uuid } = useParams<{ store_uuid: string }>();
  const [aiRequests, setAiRequests] = useState<AiRequest[]>([]);
  const snackbar = useSnackbar();
  const [user, ] = useRecoilState(userState);
  const [store, setStore] = useRecoilState(storeState);
  const [loading, setLoading] = useRecoilState(loadingState);

  useEffect(() => {
    setLoading({ ...loading, isLoading: true });
    fetchAiRequestList();
  }, [store_uuid]);

  const fetchAiRequestList = async () => {
    const data = await getAiRequestListByStore(store_uuid!);
    if (!data?.error) {
      setLoading({ ...loading, isLoading: false });
      setAiRequests(data.data.results as AiRequest[]);
    } else {
      setLoading({ ...loading, isLoading: false });
      console.error("Error fetching ai requests:", data.error);
    }
  };

  const handleSubmitPicture = async () => {
    if (user.login && user.authToken) {
      const baseUrl = await getBaseUrl();
      setStore({
        ...store,
        ai_requests_count: (store.ai_requests_count ?? 0) + 1, 
      });
      openMediaPicker({
        type: "photo",
        serverUploadUrl: `${baseUrl}/v1/product/automenu/${store.uuid}/${user.uuid}`,
        success: (res) => {
          const obj = JSON.parse(res.data);
          console.log(obj);
  
          snackbar.openSnackbar({
            duration: 3000,
            text: obj.message,
            type: "success",
          });
          fetchAiRequestList();
        },
        fail: (error) => {
          console.log(error);
          snackbar.openSnackbar({
            duration: 3000,
            text: error.message,
            type: "error",
          });
          fetchAiRequestList();
        },
      });
    }
  };
  

  return (
    <Page className="page">
      <div className="section-container" style={{ backgroundColor: "#f3f3f3" }}>
        <Box>
          <Box textAlign={"center"}>
            <Text size="xLarge">{t("productManagement.scanMenu.title")}</Text>
            <Text>{t("productManagement.scanMenu.description")}</Text>
            <Text>
              {t("productManagement.scanMenu.current_count")}:{" "}
              {store.ai_requests_count}/5
            </Text>
          </Box>

          <Box mt={6}>
            {store.ai_requests_count !== undefined &&
            store.ai_requests_count > 4 ? (
              <Box textAlign={"center"}>
                <Text className="red-color" size="xLarge">
                  {t("productManagement.scanMenu.over_limit")}
                </Text>
              </Box>
            ) : (
              <Button fullWidth variant="primary" onClick={handleSubmitPicture}>
                <Icon icon="zi-camera" />{" "}
                {t("productManagement.createProduct.uploadImage")}
              </Button>
            )}

            <List style={{ marginTop: "10px" }}>
              <Box flex textAlign="center">
                <Text size="xLarge" style={{ flex: 1 }}>
                  {t("productManagement.scanMenu.status")}
                </Text>
                <Text size="xLarge" style={{ flex: 1 }}>
                  {t("productManagement.scanMenu.request_date")}
                </Text>
              </Box>
              {aiRequests.map((item) => (
                <Box
                  flex
                  textAlign="center"
                  style={{ backgroundColor: "#fff", margin: "10px" }}
                  key={item.created_at}
                >
                  <Text size="xLarge" style={{ flex: 1 }}>
                    {item.status}
                  </Text>
                  <Text size="xLarge" style={{ flex: 1 }}>
                    {timePeriodFormatter(item.created_at, t)}
                  </Text>
                </Box>
              ))}
            </List>
          </Box>
        </Box>
      </div>
    </Page>
  );
};

export default ScaneMenuPage;
