import React, { useEffect, useState } from "react";
import { Button, Input, Box, Page, useSnackbar } from "zmp-ui";
import { getStoreByUUID, updateStore } from "../../../api/api";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getBaseUrl } from "../../../api/apiBase";
import { openMediaPicker } from "zmp-sdk/apis";
import DEFAULT_IMAGE_STORE from "../../../static/icons/store-background.png";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { userState } from "../../../state";
import { useRecoilState } from "recoil";

interface StoreDetail {
  description?: string;
  address?: string;
  phoneNumber?: string;
  bankAccount?: string;
  bankName?: string;
  avatar?: {
    url: string;
    uuid: string;
  };
}

interface StoreData {
  name: string;
  metadata: string;
}

const StoreEditPage: React.FC = () => {
  const { t } = useTranslation("global");
  const { store_uuid } = useParams<{ store_uuid?: string }>();
  const [user, ] = useRecoilState(userState);
  const [storeData, setStoreData] = useState<StoreData | undefined>(undefined);
  const [storeName, setStoreName] = useState<string | undefined>(undefined);
  const [storeDetail, setStoreDetail] = useState<StoreDetail>({});
  const [image, setImage] = useState<string>("");
  const [imageUUID, setImageUUID] = useState<string>("");

  const snackbar = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    if (storeData) {
      setStoreName(storeData.name);
      try {
        const detail = JSON.parse(storeData.metadata);
        setStoreDetail(detail || {});
        if (detail?.avatar) {
          setImage(detail.avatar?.url);
          setImageUUID(detail.avatar?.uuid);
        }
      } catch (error) {
        console.error("Error parsing store metadata:", error);
      }
    }
  }, [storeData]);

  const getStoreDetail = async () => {
    if (store_uuid) {
      const response = await getStoreByUUID(store_uuid);
      if (response.data) {
        setStoreData(response.data);
      } else {
        console.error("Error fetching store data:", response.error);
      }
    }
  };

  useEffect(() => {
    getStoreDetail();
  }, []);

  const handleSubmitPicture = async () => {
    const baseUrl = await getBaseUrl();
    openMediaPicker({
      type: "photo",
      serverUploadUrl: `${baseUrl}/v1/attachment/${store_uuid}/${user.uuid}`,
      success: (res) => {
        const obj = JSON.parse(res.data);
        const data = obj.data;
        console.log(`-----------------`);
        console.log(`data: ${data}`);

        setImage(data.urls[0]);
        setImageUUID(data.uuids[0]);

        snackbar.openSnackbar({
          duration: 3000,
          text: t("snackbarMessage.uploadImageSuccess"),
          type: "success",
        });
      },
      fail: (error) => {
        console.log(error);
        snackbar.openSnackbar({
          duration: 3000,
          text: t("snackbarMessage.uploadImageFail"),
          type: "error",
        });
      },
    });
  };

  const handleSubmit = async () => {
    const metadataStore = {
      avatar: image
        ? {
            url: image,
            uuid: imageUUID,
          }
        : {},
      description: storeDetail.description,
      address: storeDetail.address,
      phoneNumber: storeDetail.phoneNumber,
      bankAccount: storeDetail.bankAccount,
    };
    const payload = {
      uuid: store_uuid,
      name: storeName,
      metadata: JSON.stringify(metadataStore),
    };
    const data = await updateStore(payload);
    if (!data?.error) {
      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.updateStoreSuccess"),
        type: "success",
      });
      navigate(-1);
    } else {
      snackbar.openSnackbar({
        duration: 3000,
        text: String(data.error),
        type: "success",
      });
    }
  };

  return (
    <Page className="page">
      <div className="section-container">
        <Box>
          <Box flex justifyContent="center" alignItems="center" mb={5}>
            <Box style={{ position: "relative" }} onClick={handleSubmitPicture}>
              <img
                className="img-store"
                style={!image ? { filter: "grayscale(1) opacity(0.5)" } : {}}
                src={image || DEFAULT_IMAGE_STORE}
              ></img>
              <Box className="upload-photo-icon">
                <CameraAltIcon />
              </Box>
            </Box>
          </Box>
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
            <Input.TextArea
              id="description"
              label={t("editStore.description")}
              // type="text"
              placeholder={t("editStore.enterDescription")}
              value={storeDetail?.description}
              onChange={(e) =>
                setStoreDetail({ ...storeDetail, description: e.target.value })
              }
              showCount
              maxLength={250}
            />
          </Box>

          <Box mb={2}>
            <Input
              id="address"
              label={t("editStore.address")}
              type="text"
              placeholder={t("editStore.enterAddress")}
              value={storeDetail?.address}
              onChange={(e) =>
                setStoreDetail({ ...storeDetail, address: e.target.value })
              }
            />
          </Box>

          <Box mb={2}>
            <Input
              id="phone"
              label={t("editStore.phoneNumber")}
              type="text"
              placeholder={t("editStore.enterPhoneNumber")}
              value={storeDetail?.phoneNumber}
              onChange={(e) =>
                setStoreDetail({ ...storeDetail, phoneNumber: e.target.value })
              }
            />
          </Box>

          <Box mb={2}>
            <Input
              id="bank"
              label={t("editStore.bankAccount")}
              type="text"
              placeholder={t("editStore.enterBankAccount")}
              helperText={t("editStore.bankExample")}
              value={storeDetail?.bankAccount}
              onChange={(e) =>
                setStoreDetail({ ...storeDetail, bankAccount: e.target.value })
              }
            />
          </Box>

          <Box mt={5}>
            <Button fullWidth variant="primary" onClick={handleSubmit}>
              {t("button.save")}
            </Button>
          </Box>
        </Box>
      </div>
    </Page>
  );
};

export default StoreEditPage;
