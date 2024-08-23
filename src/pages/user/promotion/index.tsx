import React, { useEffect, useState } from "react";
import { Icon, List, Page, useSnackbar } from "zmp-ui";
import LoadingComponent from "../../../components/loading_component";
import AddVoucherForm from "../../../components/promotion-user/addVoucherForm";
import { useRecoilValue } from "recoil";
import VoucherDetailModal from "../../../components/voucher/voucher-detail/voucherDetailModal";
import { userState } from "../../../state";
import { useParams } from "react-router-dom";
import VoucherCard from "../../../components/voucher/voucher-card/voucherCard";
import "./styles.scss";

const vouchers = [
  {
    code: "HD3023",
    title: "Voucher giam 50%",
    description: "Giam gia cho nhung san pham do uong",
  },
  {
    code: "HD302",
    title: "Voucher giam 50%",
    description: "Giam gia cho nhung san pham do uong",
  },
  {
    code: "HD0232",
    title: "Voucher giam 50%",
    description: "Giam gia cho nhung san pham do uong",
  },
];

const PromotionPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isShowDetail, setIsShowDetail] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState({});
  const { store_uuid } = useParams();
  const user = useRecoilValue(userState);
  const snackbar = useSnackbar();
  const handleShowDetail = (voucher: string) => {
    console.log(`voucher: ${voucher}`);
    setSelectedVoucher(voucher);
    setIsShowDetail(true);
  };
  return (
    <>
      {/* <LoadingComponent
        isLoading={isLoading}
        completedPercent={100} // Simulated progress percentage
      />
      {!isLoading && (
        <Page
          className="section-container"
          style={{ backgroundColor: "#f3f3f3" }}
        >
          <AddVoucherForm
            authToken={user.authToken}
            store_uuid={store_uuid}
            onVoucherAdded={() => {}}
          />
          <List className="list-voucher">
            {vouchers.map((vou) => (
              <VoucherCard voucher={vou} key={vou.code} />
            ))}
          </List>
          <VoucherDetailModal
            isShow={isShowDetail}
            voucher={selectedVoucher}
            onClose={() => {
              setIsShowDetail(false);
              setSelectedVoucher({});
            }}
            onUse={() => {}}
          />
        </Page>
      )} */}
    </>
  );
};

export default PromotionPage;
