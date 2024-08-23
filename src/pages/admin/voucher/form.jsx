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

import { useRecoilState } from "recoil";
import { userState } from "../../../state";
import {
  fetchVoucherDetails,
  addVoucherToStore,
  updateVoucherRequest,
} from "../../../api/api";

const { Option } = Select;

import { useTranslation } from "react-i18next";
import { VOUCHER_TYPE } from "../../../constants";

const VoucherFormPage = () => {
  const { t } = useTranslation("global");
  const { store_uuid, voucher_uuid } = useParams();
  const [form, setForm] = useState({
    voucher_code: "",
    notes: "",
    voucher_type: VOUCHER_TYPE.BY_VALUE,
    voucher_value: "",
    expired_at: "",
    status: "inactive",
    voucher_min_order_value: "",
  });

  const snackbar = useSnackbar();

  const [user, setUserState] = useRecoilState(userState);

  const navigate = useNavigate();

  const [showButtonStatus, setShowButtonStatus] = useState(false);
  const [isEmptyField, setIsEmptyField] = useState(false);
  const handleChangeInput = (field, value) => {
    if (field === "voucher_value" || field === "voucher_min_order_value") {
      const formattedValue = formatNumberToVND(value);
      setForm({ ...form, [field]: formattedValue });
      return;
    }

    if (field === "voucher_code") {
      setForm({ ...form, [field]: value.toUpperCase() });
      return;
    }

    setForm({ ...form, [field]: value });
  };

  useEffect(() => {
    if (voucher_uuid && voucher_uuid !== "null") {
      loadVoucherDetails(voucher_uuid);
    }
  }, []);

  const handleCheckboxChange = () => {
    setShowButtonStatus((prevStatus) => !prevStatus);
  };

  const loadVoucherDetails = async (voucher_uuid) => {
    const data = await fetchVoucherDetails(voucher_uuid);
    if (!data?.error) {
      setForm({
        store_uuid: store_uuid,
        voucher_code: data.voucher_code,
        notes: data.notes,
        voucher_type: data.voucher_type,
        voucher_value: formatNumberToVND(data.voucher_value),
        expired_at: new Date(data.expired_at),
        status: data.status,
        voucher_min_order_value: formatNumberToVND(
          data.voucher_min_order_value,
        ),
      });

      if (data.status == "inactive") {
        setShowButtonStatus(false);
      } else {
        setShowButtonStatus(true);
      }
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
        text: data.error,
        type: "error",
      });
    }
  };

  const updateVoucher = async () => {
    let payload = buildPayload();
    console.log(JSON.stringify(payload));

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
        text: data.error,
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
        expired_at: form.expired_at.getTime() / 1000,
        status: showButtonStatus ? "actived" : "inactive",
        voucher_min_order_value: parseInt(
          (form.voucher_min_order_value || "0").replace(/\D/g, ""),
          10,
        ),
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
                "voucherManagement.createVoucher.enterVoucherCode",
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
              type="textarea"
              placeholder={t(
                "voucherManagement.createVoucher.enterDescription",
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
                  "voucherManagement.createVoucher.selectVoucherType",
                )}
                value={form?.voucher_type}
                onChange={(value) => handleChangeInput("voucher_type", value)}
              >
                {Object.keys(VOUCHER_TYPE).map((item, index) => (
                  <Option
                    key={index}
                    value={VOUCHER_TYPE[item]}
                    title={t(
                      "voucherManagement.createVoucher.typeSelect." +
                        VOUCHER_TYPE[item],
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
                "voucherManagement.createVoucher.enterVoucherValue",
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
                "voucherManagement.createVoucher.enterVoucherMinOrderValue",
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
              value={form?.expired_at}
              onChange={(value) => {
                handleChangeInput("expired_at", value);
              }}
              status={isEmptyField && !form?.expired_at ? "error" : ""}
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
