import React, { useEffect, useState } from "react";
import { Button, List, Page, Box } from "zmp-ui";
import { useRecoilState } from "recoil";
import VoucherDetailModal from "../../../components/voucher/voucher-detail/voucherDetailModal";
import { loadingState } from "../../../state";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getVoucherByStore } from "../../../api/api";
import AddIcon from "@mui/icons-material/Add";
import VoucherCard from "@/components/voucher/voucher-card/voucherCard";
import { VoucherStatus, VoucherType } from "@/constants";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Snackbar } from "@telegram-apps/telegram-ui";

interface Voucher {
  voucher_code: string;
  voucher_value: number;
  voucher_type: VoucherType;
  voucher_min_order_value: number;
  expired_at: string;
  status: VoucherStatus;
  uuid: string; 
  name: string; 
  updated_at: string;
}



const VoucherPage: React.FC = () => {
  const { t } = useTranslation("global");
  const navigate = useNavigate();
  const [loading, setLoading] = useRecoilState(loadingState);

  const [isShowDetail, setIsShowDetail] = useState<boolean>(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | {}>({});
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const { store_uuid } = useParams<{ store_uuid: string }>();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  
  useEffect(() => {
    setLoading({ ...loading, isLoading: true });
    fetchVoucherData();
  }, [store_uuid]);

  const fetchVoucherData = async () => {
    if (!store_uuid) return;
  
    const response = await getVoucherByStore(store_uuid);
    if (response.data) {
      setVouchers([
        ...response.data.sort(
          (a: Voucher, b: Voucher) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        ),
      ]);
    } else {
      console.error("Error:", response.error);
      setSnackbarMessage(typeof response.error === "string"
        ? response.error
        : t("snackbarMessage.getVoucherFail"));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
    setLoading({ ...loading, isLoading: false });
  };
  

  return (
    <Page className="section-container" style={{ backgroundColor: "#f3f3f3" }}>
      <Box className="toolbar_add-btn">
        <Button
          className="fw-500"
          style={{ width: "100%" }}
          onClick={() => navigate(`/admin/voucher/form/${store_uuid}`)}
          prefixIcon={<AddIcon />}
        >
          {t("voucherManagement.createVoucher.createVoucher")}
        </Button>
      </Box>
      <List style={{ marginTop: "16px" }}>
        {vouchers.map((vou) => (
          <VoucherCard
            voucher={vou}
            key={vou.uuid}
            onDetails={() =>
              navigate(`/admin/voucher/update/${store_uuid}/${vou.uuid}`)
            }
          />
        ))}
      </List>
      <VoucherDetailModal
        isShow={isShowDetail}
        voucher={selectedVoucher as Voucher}
        onClose={() => {
          setIsShowDetail(false);
          setSelectedVoucher({});
        }}
        onUse={() => {}}
      />
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
    </Page>
  );
};

export default VoucherPage;
