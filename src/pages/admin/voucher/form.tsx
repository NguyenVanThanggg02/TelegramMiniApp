import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Box,
  Page,
  useSnackbar,
  Select,
  Switch,
  DatePicker,
} from "zmp-ui";
import { useNavigate, useParams } from "react-router-dom";
import { formatNumberToVND } from "../../../utils/numberFormatter";
import {
  fetchVoucherDetails,
  addVoucherToStore,
  updateVoucherRequest,
} from "../../../api/api";

import { useTranslation } from "react-i18next";
import { VOUCHER_TYPE } from "../../../constants";
const { Option } = Select;

interface FormState {
  voucher_code: string;
  notes: string;
  voucher_type: string;
  voucher_value: string;
  expired_at: Date | string;
  status: string;
  voucher_min_order_value: string;
  store_uuid?: string
}


const VoucherFormPage: React.FC = () => {
  const { t } = useTranslation("global");
  const { store_uuid, voucher_uuid } = useParams<{ store_uuid: string; voucher_uuid: string }>();
  const [form, setForm] = useState<FormState>({
    voucher_code: "",
    notes: "",
    voucher_type: "BY_VALUE", 
    voucher_value: "",
    expired_at: "",
    status: "inactive",
    voucher_min_order_value: "",
  });
  const navigate = useNavigate();
  const [showButtonStatus, setShowButtonStatus] = useState<boolean>(false);
  const [isEmptyField, setIsEmptyField] = useState<boolean>(false);
  const snackbar = useSnackbar();

  const handleChangeInput = (field: keyof FormState, value: string | number | (string | number)[] | undefined) => {
    // Convert value to a string if it's not undefined
    let stringValue: string = "";
  
    if (Array.isArray(value)) {
      // If value is an array, use the first element or handle accordingly
      stringValue = value[0] ? value[0].toString() : "";
    } else if (value !== undefined) {
      // If value is not undefined, convert it to string
      stringValue = value.toString();
    }
  
    // Handle specific fields
    if (field === "voucher_value" || field === "voucher_min_order_value") {
      const formattedValue = formatNumberToVND(stringValue);
      setForm((prevForm) => ({ ...prevForm, [field]: formattedValue }));
      return;
    }
  
    if (field === "voucher_code") {
      setForm((prevForm) => ({ ...prevForm, [field]: stringValue.toUpperCase() }));
      return;
    }
  
    setForm((prevForm) => ({ ...prevForm, [field]: stringValue }));
  };
  
  

  useEffect(() => {
    if (voucher_uuid && voucher_uuid !== "null") {
      loadVoucherDetails(voucher_uuid);
    }
  }, [voucher_uuid]);

  const handleCheckboxChange = () => {
    setShowButtonStatus((prevStatus) => !prevStatus);
  };

  const loadVoucherDetails = async (voucher_uuid: string) => {
    const response  = await fetchVoucherDetails(voucher_uuid);
    if (response .error) {
      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.fetchVoucherDetailFail"),
        type: "error",
      });
      return;
    }
  
    const data = response.data;
    if (data) {
      setForm({
        store_uuid: store_uuid,
        voucher_code: data.voucher_code,
        notes: data.notes,
        voucher_type: data.voucher_type,
        voucher_value: formatNumberToVND(data.voucher_value.toString()),
        expired_at: new Date(data.expired_at),
        status: data.status,
        voucher_min_order_value: formatNumberToVND(data.voucher_min_order_value.toString()),
      });

      setShowButtonStatus(data.status === "active");
    } else {
      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.fetchVoucherDetailFail"),
        type: "error",
      });
    }
  };

  const handleSubmit = () => {
    if (
      !form.voucher_value ||
      !form.notes ||
      !form.voucher_code ||
      !form.expired_at
    ) {
      setIsEmptyField(true);
      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.fillRequireInput"),
        type: "error",
      });
      return;
    }
    if (voucher_uuid && voucher_uuid !== "null") {
      updateVoucher();
    } else {
      createVoucher();
    }
  };

  const createVoucher = async () => {
    const payload = buildPayload();

    const data = await addVoucherToStore(payload);
    if (!data?.error) {
      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.voucherCreateSuccess"),
        type: "success",
      });
      navigate(-1);
    } else {
      snackbar.openSnackbar({
        duration: 3000,
        text: String(data.error),
        type: "error",
      });
    }
  };

  const updateVoucher = async () => {
    if (!voucher_uuid) {
      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.invalidVoucherUuid"),
        type: "error",
      });
      return;
    }
  
    const payload = buildPayload();
    const data = await updateVoucherRequest(voucher_uuid, payload);
  
    if (!data?.error) {
      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.voucherUpdateSuccess"),
        type: "success",
      });
      navigate(-1);
    } else {
      snackbar.openSnackbar({
        duration: 3000,
        text: String(data.error),
        type: "error",
      });
    }
  };
  

  const buildPayload = () => {
    return {
      voucher: {
        store_uuid: store_uuid,
        voucher_code: form.voucher_code,
        notes: form.notes,
        voucher_type: form.voucher_type,
        voucher_value: parseInt(form.voucher_value.replace(/\D/g, ""), 10),
        expired_at: (new Date(form.expired_at).getTime() / 1000),
        status: showButtonStatus ? "actived" : "inactive",
        voucher_min_order_value: parseInt(form.voucher_min_order_value.replace(/\D/g, ""), 10),
      },
    };
  };
  return (
    <Page className="page">
      <div className="section-container">
        <Box>
          <Box>
            <Input
              id="name"
              label={t("voucherManagement.createVoucher.voucherCode")}
              type="text"
              placeholder={t(
                "voucherManagement.createVoucher.enterVoucherCode"
              )}
              status={isEmptyField && !form?.voucher_code ? "error" : ""}
              value={form?.voucher_code}
              onChange={(e) =>
                handleChangeInput("voucher_code", e.target.value)
              }
            />

            <Input.TextArea
              id="describe"
              label={t("voucherManagement.createVoucher.description")}
              // type="textarea"
              placeholder={t(
                "voucherManagement.createVoucher.enterDescription"
              )}
              status={isEmptyField && !form?.notes ? "error" : ""}
              value={form?.notes}
              onChange={(e) => handleChangeInput("notes", e.target.value)}
              showCount
              maxLength={250}
            />

            <Box mt={6}>
              <Select
                id="type"
                label={t("voucherManagement.createVoucher.voucherType")}
                placeholder={t(
                  "voucherManagement.createVoucher.selectVoucherType"
                )}
                value={form?.voucher_type}
                onChange={(value) => handleChangeInput("voucher_type", value)}
              >
                {Object.keys(VOUCHER_TYPE).map((key) => (
                  <Option
                    key={key}
                    value={VOUCHER_TYPE[key as keyof typeof VOUCHER_TYPE]}
                    title={t(
                      "voucherManagement.createVoucher.typeSelect." +
                        VOUCHER_TYPE[key as keyof typeof VOUCHER_TYPE]
                    )}
                  />
                ))}
              </Select>
            </Box>

            <Input
              id="value"
              label={t("voucherManagement.createVoucher.voucherValue")}
              type="text"
              placeholder={t(
                "voucherManagement.createVoucher.enterVoucherValue"
              )}
              status={isEmptyField && !form?.voucher_value ? "error" : ""}
              value={form?.voucher_value}
              onChange={(e) =>
                handleChangeInput("voucher_value", e.target.value)
              }
            />

            <Input
              id="voucher_min_order_value"
              label={t("voucherManagement.createVoucher.voucherMinOrderValue")}
              type="text"
              placeholder={t(
                "voucherManagement.createVoucher.enterVoucherMinOrderValue"
              )}
              value={form?.voucher_min_order_value}
              onChange={(e) =>
                handleChangeInput("voucher_min_order_value", e.target.value)
              }
            />
            <DatePicker
              mask
              maskClosable
              label={t("voucherManagement.createVoucher.experiedAt")}
              value={form.expired_at ? new Date(form.expired_at) : undefined} // Chuyển đổi giá trị ngày thành kiểu Date
              onChange={(value) => {
                if (value instanceof Date) {
                  handleChangeInput("expired_at", value.toISOString()); // Chuyển đổi Date thành chuỗi ISO
                }
              }}
              status={isEmptyField && !form.expired_at ? "error" : ""}
            />
          </Box>

          <Box mt={6}>
            <Box>
              <Switch
                checked={showButtonStatus}
                label={t("voucherManagement.createVoucher.active")}
                onChange={handleCheckboxChange}
              />
            </Box>
          </Box>

          <Box mt={4}>
            <Button fullWidth variant="primary" onClick={handleSubmit}>
              {t("button.save")}
            </Button>
          </Box>
        </Box>
      </div>
    </Page>
  );
};

export default VoucherFormPage;
