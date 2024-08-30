import React, { useEffect, useState } from "react";


import {useParams } from "react-router-dom";

import { useRecoilState } from "recoil";
import {storeState, loadingState } from "../../../state";
import { getAiRequestListByStore } from "../../../api/api";

// import { openMediaPicker } from "zmp-sdk/apis";
import { useTranslation } from "react-i18next";
import { timePeriodFormatter } from "../../../utils/timePeriodFormatter";
import { Button, List, Text } from "@telegram-apps/telegram-ui";
import { CameraAlt } from "@mui/icons-material";


interface AiRequest {
  status: string;
  created_at: string;
}


const ScaneMenuPage: React.FC = () => {
  const { t } = useTranslation("global");
  const { store_uuid } = useParams<{ store_uuid: string }>();
  const [aiRequests, setAiRequests] = useState<AiRequest[]>([]);

  // const snackbar = useSnackbar();

  const [store] = useRecoilState(storeState);
  const [loading, setLoading] = useRecoilState(loadingState);

  useEffect(() => {
    setLoading({ ...loading, isLoading: true });
    fetchAiRequestList();
  }, [store_uuid]);

  const fetchAiRequestList = async () => {
    if (!store_uuid) return;
    const data = await getAiRequestListByStore(store_uuid);
    if (!data?.error) {
      setLoading({ ...loading, isLoading: false });
      setAiRequests(data.data);
    } else {
      setLoading({ ...loading, isLoading: false });
      console.error("Error fetching ai requests:", data.error);
    }
  };

  // const handleSubmitPicture = async () => {
  //   if (user.login && user.authToken) {
  //     const baseUrl = await getBaseUrl();
  //     setStore({ ai_requests_count: store.ai_requests_count + 1 });
  //     openMediaPicker({
  //       type: "photo",
  //       serverUploadUrl: `${baseUrl}/v1/product/automenu/${store.uuid}/${user.uuid}`,
  //       success: (res) => {
  //         const obj = JSON.parse(res.data);
  //         console.log(obj);

  //         snackbar.openSnackbar({
  //           duration: 3000,
  //           text: obj.message,
  //           type: "success",
  //         });
  //         fetchAiRequestList();
  //       },
  //       fail: (error) => {
  //         console.log(error);
  //         snackbar.openSnackbar({
  //           duration: 3000,
  //           text: error.message,
  //           type: "error",
  //         });
  //         fetchAiRequestList();
  //       },
  //     });
  //   }
  // };

  return (
    <div className="page">
      <div className="section-container" style={{ backgroundColor: "#f3f3f3", height:'95vh' }}>
        <div>
          <div style={{textAlign:'center'}}>
            <div>
            <Text style={{fontSize:'20px', color:'black'}}>{t("productManagement.scanMenu.title")}</Text>
            </div>
            <Text style={{color:'black'}}>{t("productManagement.scanMenu.description")}</Text>
            <Text style={{color:'black'}}>
              {t("productManagement.scanMenu.current_count")}:{" "}
              {store.ai_requests_count}/5
            </Text>
          </div>

          <div style={{marginTop:'5px', padding:'10px 10px'}}>
            { store.ai_requests_count !== undefined &&   store.ai_requests_count > 4 ? (
              <div   style={{textAlign:'center'}}>
                <Text className="red-color" style={{fontSize:'20px', color:'black'}}>
                  {t("productManagement.scanMenu.over_limit")}
                </Text>
              </div>
            ) : (
              <Button
              //  onClick={handleSubmitPicture}
              style={{ backgroundColor: "red", marginLeft: "7px", width:'92vw', borderRadius:'20px' }}
               >
                <CameraAlt style={{verticalAlign:"middle"}} />
                {t("productManagement.createProduct.uploadImage")}
              </Button>
            )}
            <List style={{ marginTop: "10px" }}>
              <div style={{display:'flex', textAlign:'center'}}>
                <Text  style={{ flex: 1, fontSize:'20px', color:'black' }}>
                  {t("productManagement.scanMenu.status")}
                </Text>
                <Text style={{ flex: 1, fontSize:'20px', color:'black' }}>
                  {t("productManagement.scanMenu.request_date")}
                </Text>
              </div>
              {aiRequests.map((item) => (
                <div
                  style={{ backgroundColor: "#fff", margin: "10px", display:'flex', textAlign:'center' }}
                  key={item.created_at}
                >
                  <Text style={{ flex: 1, fontSize:'20px', color:'black' }}>
                    {item.status}
                  </Text>
                  <Text style={{ flex: 1, fontSize:'20px', color:'black' }}>
                    {timePeriodFormatter(item.created_at, t)}
                  </Text>
                </div>
              ))}
            </List>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScaneMenuPage;
