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

  useEffect(() => {
    setCountries(countriesData.countries.map(country => country.name)); 
  }, []);
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
  const handleCountryChange = (selected: SelectValueType | SelectValueType[] | undefined) => {
    const value = Array.isArray(selected) ? selected[0] : selected;
    setStoreDetail((prevDetail: StoreDetail) => ({ ...prevDetail, country: value as string }));
  };
  
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
              <option
                value="agribank"
                title="Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam (Agribank)"
              >
                Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam
                (Agribank)
              </option>
              <option
                value="gpbank"
                title="Ngân hàng TNHH MTV Dầu khí toàn cầu (GPBank)"
              >
                Ngân hàng TNHH MTV Dầu khí toàn cầu (GPBank)
              </option>
              <option
                value="oceanbank"
                title="Ngân hàng TNHH MTV Đại Dương (OceanBank)"
              >
                Ngân hàng TNHH MTV Đại Dương (OceanBank)
              </option>
              <option
                value="cbbank"
                title="Ngân hàng TNHH MTV Xây dựng (CBBank)"
              >
                Ngân hàng TNHH MTV Xây dựng (CBBank)
              </option>
              <option
                value="vietinbank"
                title="Ngân hàng TMCP Công thương Việt Nam (VietinBank)"
              >
                Ngân hàng TMCP Công thương Việt Nam (VietinBank)
              </option>
              <option
                value="bidv"
                title="Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)"
              >
                Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)
              </option>
              <option
                value="vietcombank"
                title="Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)"
              >
                Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)
              </option>
              <option value="acb" title="Ngân hàng TMCP Á Châu (ACB)">
                Ngân hàng TMCP Á Châu (ACB)
              </option>
              <option value="abbank" title="Ngân hàng TMCP An Bình (ABBANK)">
                Ngân hàng TMCP An Bình (ABBANK)
              </option>
              <option
                value="vietcapitalbank"
                title="Ngân hàng TMCP Bản Việt (Viet Capital Bank)"
              >
                Ngân hàng TMCP Bản Việt (Viet Capital Bank)
              </option>
              <option
                value="baovietbank"
                title="Ngân hàng TMCP Bảo Việt (BAOVIET Bank)"
              >
                Ngân hàng TMCP Bảo Việt (BAOVIET Bank)
              </option>
              <option
                value="bacabank"
                title="Ngân hàng TMCP Bắc Á (Bac A Bank)"
              >
                Ngân hàng TMCP Bắc Á (Bac A Bank)
              </option>
              <option
                value="lienvietpostbank"
                title="Ngân hàng TMCP Bưu điện Liên Việt (LienVietPostBank)"
              >
                Ngân hàng TMCP Bưu điện Liên Việt (LienVietPostBank)
              </option>
              <option
                value="pvcombank"
                title="Ngân hàng TMCP Đại Chúng Việt Nam (PVcomBank)"
              >
                Ngân hàng TMCP Đại Chúng Việt Nam (PVcomBank)
              </option>
              <option value="donga" title="Ngân hàng TMCP Đông Á (DongA Bank)">
                Ngân hàng TMCP Đông Á (DongA Bank)
              </option>
              <option
                value="seabank"
                title="Ngân hàng TMCP Đông Nam Á (SeABank)"
              >
                Ngân hàng TMCP Đông Nam Á (SeABank)
              </option>
              <option value="msb" title="Ngân hàng TMCP Hàng Hải (MSB)">
                Ngân hàng TMCP Hàng Hải (MSB)
              </option>
              <option
                value="kienlongbank"
                title="Ngân hàng TMCP Kiên Long (Kienlongbank)"
              >
                Ngân hàng TMCP Kiên Long (Kienlongbank)
              </option>
              <option
                value="techcombank"
                title="Ngân hàng TMCP Kỹ Thương (Techcombank)"
              >
                Ngân hàng TMCP Kỹ Thương (Techcombank)
              </option>
              <option
                value="namabank"
                title="Ngân hàng TMCP Nam Á (Nam A Bank)"
              >
                Ngân hàng TMCP Nam Á (Nam A Bank)
              </option>
              <option value="ocb" title="Ngân hàng TMCP Phương Đông (OCB)">
                Ngân hàng TMCP Phương Đông (OCB)
              </option>
              <option value="mbbank" title="Ngân hàng TMCP Quân Đội (MB Bank)">
                Ngân hàng TMCP Quân Đội (MB Bank)
              </option>
              <option value="vib" title="Ngân hàng TMCP Quốc Tế (VIB)">
                Ngân hàng TMCP Quốc Tế (VIB)
              </option>
              <option value="ncb" title="Ngân hàng TMCP Quốc dân (NCB)">
                Ngân hàng TMCP Quốc dân (NCB)
              </option>
              <option value="scb" title="Ngân hàng TMCP Sài Gòn (SCB)">
                Ngân hàng TMCP Sài Gòn (SCB)
              </option>
              <option
                value="saigonbank"
                title="Ngân hàng TMCP Sài Gòn Công Thương (SAIGONBANK)"
              >
                Ngân hàng TMCP Sài Gòn Công Thương (SAIGONBANK)
              </option>
              <option value="shb" title="Ngân hàng TMCP Sài Gòn – Hà Nội (SHB)">
                Ngân hàng TMCP Sài Gòn – Hà Nội (SHB)
              </option>
              <option
                value="sacombank"
                title="Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)"
              >
                Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)
              </option>
              <option value="tpbank" title="Ngân hàng TMCP Tiên Phong (TPBank)">
                Ngân hàng TMCP Tiên Phong (TPBank)
              </option>
              <option
                value="vietabank"
                title="Ngân hàng TMCP Việt Á (VietABank)"
              >
                Ngân hàng TMCP Việt Á (VietABank)
              </option>
              <option
                value="vpbank"
                title="Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)"
              >
                Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)
              </option>
              <option
                value="vietbank"
                title="Ngân hàng TMCP Việt Nam Thương Tín (Vietbank)"
              >
                Ngân hàng TMCP Việt Nam Thương Tín (Vietbank)
              </option>
              <option
                value="pgbank"
                title="Ngân hàng TMCP Xăng dầu Petrolimex (PG Bank)"
              >
                Ngân hàng TMCP Xăng dầu Petrolimex (PG Bank)
              </option>
              <option
                value="eximbank"
                title="Ngân hàng TMCP Xuất Nhập Khẩu (Eximbank)"
              >
                Ngân hàng TMCP Xuất Nhập Khẩu (Eximbank)
              </option>
              <option
                value="hdbank"
                title="Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh (HDBank)"
              >
                Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh (HDBank)
              </option>
              <option value="indovina" title="Ngân hàng TNHH Indovina (IVB)">
                Ngân hàng TNHH Indovina (IVB)
              </option>
              <option value="vrb" title="Ngân hàng Liên doanh Việt Nga (VRB)">
                Ngân hàng Liên doanh Việt Nga (VRB)
              </option>
              <option
                value="anzvl"
                title="Ngân hàng TNHH MTV ANZ Việt Nam (ANZVL)"
              >
                Ngân hàng TNHH MTV ANZ Việt Nam (ANZVL)
              </option>
              <option
                value="hlbvn"
                title="Ngân hàng TNHH MTV Hong Leong Việt Nam (HLBVN)"
              >
                Ngân hàng TNHH MTV Hong Leong Việt Nam (HLBVN)
              </option>
              <option
                value="hsbc"
                title="Ngân hàng TNHH MTV HSBC Việt Nam (HSBC)"
              >
                Ngân hàng TNHH MTV HSBC Việt Nam (HSBC)
              </option>
              <option
                value="shbvn"
                title="Ngân hàng TNHH MTV Shinhan Việt Nam (SHBVN)"
              >
                Ngân hàng TNHH MTV Shinhan Việt Nam (SHBVN)
              </option>
              <option
                value="scbvl"
                title="Ngân hàng TNHH MTV Standard Chartered Việt Nam (SCBVL)"
              >
                Ngân hàng TNHH MTV Standard Chartered Việt Nam (SCBVL)
              </option>
              <option
                value="pbvn"
                title="Ngân hàng TNHH MTV Public Bank Việt Nam (PBVN)"
              >
                Ngân hàng TNHH MTV Public Bank Việt Nam (PBVN)
              </option>
              <option
                value="cimb"
                title="Ngân hàng TNHH MTV CIMB Việt Nam (CIMB)"
              >
                Ngân hàng TNHH MTV CIMB Việt Nam (CIMB)
              </option>
              <option
                value="woori"
                title="Ngân hàng TNHH MTV Woori Việt Nam (Woori)"
              >
                Ngân hàng TNHH MTV Woori Việt Nam (Woori)
              </option>
              <option value="uob" title="Ngân hàng TNHH MTV UOB Việt Nam (UOB)">
                Ngân hàng TNHH MTV UOB Việt Nam (UOB)
              </option>
              <option
                value="vbsp"
                title="Ngân hàng Chính sách xã hội Việt Nam (VBSP)"
              >
                Ngân hàng Chính sách xã hội Việt Nam (VBSP)
              </option>
              <option value="vdb" title="Ngân hàng Phát triển Việt Nam (VDB)">
                Ngân hàng Phát triển Việt Nam (VDB)
              </option>
              <option
                value="coopbank"
                title="Ngân hàng Hợp tác xã Việt Nam (Co-opBank)"
              >
                Ngân hàng Hợp tác xã Việt Nam (Co-opBank)
              </option>
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
