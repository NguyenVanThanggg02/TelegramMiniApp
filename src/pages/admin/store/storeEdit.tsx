import React, {ChangeEvent, useEffect, useState } from "react";
import { Button, Input, Box, Page, Select } from "zmp-ui";
import { getStoreByUUID, updateStore, uploadImages } from "../../../api/api";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DEFAULT_IMAGE_STORE from "../../../static/icons/store-background.png";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { storeState, userState } from "../../../state";
import { useRecoilState, useRecoilValue } from "recoil";
import { SelectValueType } from "zmp-ui/select";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Snackbar } from "@telegram-apps/telegram-ui";
import countriesData from '../../../locales/country/country.json' assert { type: 'json' };
interface StoreDetail {
  description?: string;
  address?: string;
  phoneNumber?: string;
  bankAccount?: string;
  bankName?: string;
  country?: string;
  currency?: string;
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
  const store = useRecoilValue(storeState);
  // const [, setCurrency] = useRecoilState(currencyState);

  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  const [countries, setCountries] = useState<string[]>([]);
  const [banks, setBanks] = useState<string[]>([]);

  useEffect(() => {
    setCountries(countriesData.countries.map(country => country.name)); 
  }, []);

  useEffect(() => {
    setCountries(countriesData.countries.map(country => country.name));
    // Nếu storeDetail.country đã có, thì lấy danh sách ngân hàng cho quốc gia đó
    if (storeDetail.country) {
      const countryData = countriesData.countries.find(country => country.name === storeDetail.country);
      if (countryData) {
        setBanks(countryData.banks); // Cập nhật danh sách ngân hàng
      }
    }
  }, [storeDetail.country]); // Thay đổi khi storeDetail.country thay đổi

  const handleCountryChange = (selected: SelectValueType | SelectValueType[] | undefined) => {
    const value = Array.isArray(selected) ? selected[0] : selected;
    setStoreDetail((prevDetail: StoreDetail) => ({ ...prevDetail, country: value as string }));

    // Cập nhật ngân hàng tương ứng với quốc gia đã chọn
    const countryData = countriesData.countries.find(country => country.name === value);
    if (countryData) {
      setBanks(countryData.banks); // Cập nhật danh sách ngân hàng
    } else {
      setBanks([]); // Nếu không tìm thấy, đặt lại danh sách ngân hàng
    }
  };
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

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;
  
    if (files && files.length > 0) {
      const file = files[0]; 
  
      try {
        const response = await uploadImages(store.uuid, user.uuid, [file]);
        console.log("Upload successful:", response);
  
        const data = response.data.data;
        const url = data?.urls?.[0] || ""; 
  
        console.log("url", url);
        setImage(url);
  
      } catch (error) {
        console.error("Upload failed:", error);
      }
    } else {
      console.log("No files selected.");
    }
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
      bankName: storeDetail.bankName,
      bankAccount: storeDetail.bankAccount,
      currency: storeDetail.currency || "$",
      country: storeDetail.country,
    };
    const payload = {
      uuid: store_uuid,
      name: storeName,
      metadata: JSON.stringify(metadataStore),
    };
    const data = await updateStore(payload);
    if (!data?.error) {
        setSnackbarMessage(t("snackbarMessage.updateStoreSuccess"));
        setSnackbarType("success");
        setSnackbarOpen(true);
        setTimeout(() => {
          navigate(-1); 
        }, 2000);
    } else {
      setSnackbarMessage(String(data.error));
        setSnackbarType("success");
        setSnackbarOpen(true);
    }
  };

  const handleBankNameChange = (selected: SelectValueType | SelectValueType[] | undefined) => {
    const value = Array.isArray(selected) ? selected[0] : selected;
    setStoreDetail((prevDetail: StoreDetail) => ({ ...prevDetail, bankName: value as string }));
  };
  // const handleCountryChange = (selected: SelectValueType | SelectValueType[] | undefined) => {
  //   const value = Array.isArray(selected) ? selected[0] : selected;
  //   setStoreDetail((prevDetail: StoreDetail) => ({ ...prevDetail, country: value as string }));
  // };
  
  useEffect(() => {
    if (!storeDetail.currency) {
      setStoreDetail((prevDetail: StoreDetail) => ({
        ...prevDetail,
        currency: "$", 
      }));
    }
  }, [storeDetail]);
  

  const handleCurrencyChange = (selected: SelectValueType | SelectValueType[] | undefined) => {
    const value = Array.isArray(selected) ? selected[0] : selected;
    setStoreDetail((prevDetail: StoreDetail) => ({ ...prevDetail, currency: value as string }));
    // setCurrency(value as string); 
  };
  
  


  return (
    <Page className="page">
      <div className="section-container">
        <Box>
          <Box flex justifyContent="center" alignItems="center" mb={5}>
            <Box style={{ position: "relative" }}>
              <img
                className="img-store"
                style={!image ? { filter: "grayscale(1) opacity(0.5)" } : {}}
                src={image || DEFAULT_IMAGE_STORE}
              />
              <Box
                className="upload-photo-icon"
                onClick={() => document.getElementById("chooseFile")?.click()}
              >
                <CameraAltIcon />
              </Box>
              <input
                type="file"
                id="chooseFile"
                hidden
                onChange={handleFileChange}
              />
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
            <Select
              id="country"
              label={t("editStore.country")}
              placeholder={t("editStore.selectCountry")}
              value={storeDetail?.country}
              onChange={handleCountryChange}
              closeOnSelect={true}
            >
              {countries.map((country, index) => (
                <option key={index} value={country} title={country}>
                  {country}
                </option>
              ))}
            </Select>
          </Box>
          <Box mb={2}>
          <Select
            label={t("editStore.bankName")}
            placeholder={t("editStore.selectBank")}
            value={storeDetail?.bankName}
            onChange={handleBankNameChange}
            closeOnSelect={true}
          >
            {banks.map((bank, index) => (
              <option key={index} value={bank} title={bank}>
                {bank}
              </option>
            ))}
          </Select>
        </Box>
          <Box mb={2}>
            <Select
              label={t("editStore.currency")}
              placeholder={t("editStore.selectCurrency")}
              value={storeDetail?.currency}
              onChange={handleCurrencyChange}
              closeOnSelect={true}
            >
              <option value="$" title="USD ">
                USD
              </option>
              <option value="€" title="Euro">
                EUR
              </option>
              <option value="¥ " title="Japanese yen">
                JPY
              </option>
              <option value="£ " title="Pound sterling">
                GBP
              </option>
              <option value="$ " title="Australian dollar">
                AUD
              </option>
              <option value="$ " title="Canadian dollar">
                CAD
              </option>
              <option value="CHF" title="Swiss franc">
                CHF
              </option>
              <option value="¥ " title="Chinese yuan">
                CNY
              </option>
              <option value="$ " title="Hong Kong dollar">
                HKD
              </option>
              <option value="$ " title="New Zealand dollar">
                NZD
              </option>
              <option value="$ " title="Singapore dollar">
                SGD
              </option>
              <option value="₩ " title="South Korean won">
                KRW
              </option>
              <option value="kr " title="Norwegian krone">
                NOK
              </option>
              <option value="kr " title="Swedish krona">
                SEK
              </option>
              <option value="kr " title="Danish krone">
                DKK
              </option>
              <option value="$ " title="Mexican peso">
                MXN
              </option>
              <option value="₹ " title="Indian rupee">
                INR
              </option>
              <option value="R$" title="Brazilian real">
                BRL
              </option>
              <option value="₽ " title="Russian ruble">
                RUB
              </option>
              <option value="R " title="South African rand">
                ZAR
              </option>
            </Select>
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
        <div style={{ borderRadius: "10px" }}>
          {snackbarOpen && (
            <Snackbar onClose={() => setSnackbarOpen(false)} duration={3000}>
              <div
                className={`snackbar ${snackbarType === "success" ? "snackbar-success" : "snackbar-error"}`}
              >
                <div style={{ display: "flex" }}>
                  {snackbarType === "success" && (
                    <CheckCircleIcon
                      style={{ marginRight: 8, color: "green" }}
                    />
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
      </div>
    </Page>
  );
};

export default StoreEditPage;
