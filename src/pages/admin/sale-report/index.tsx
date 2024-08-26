import React, { useState } from "react";
import { Button, Text, Box, Page, DatePicker, useSnackbar } from "zmp-ui";
import { useParams } from "react-router-dom";
// import { useRecoilValue } from "recoil";
// import { userState } from "../../../state";
import { getSaleReport } from "../../../api/api";
import { useTranslation } from "react-i18next";
import { formatNumberToVND } from "../../../utils/numberFormatter";

interface FilterState {
  fromDate: Date;
  toDate: Date;
}

const SaleReportPage: React.FC = () => {
  const { t } = useTranslation("global");
  const { store_uuid } = useParams<{ store_uuid: string }>();
  // const user = useRecoilValue(userState);
  const [totalValue, setTotalValue] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<FilterState>({
    fromDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    toDate: new Date(new Date().setDate(new Date().getDate() + 1)),
  });

  const snackbar = useSnackbar();

  const handleSearch = async () => {
    setLoading(true);
    try {
      if (filter.fromDate > filter.toDate) {
        throw new Error(t("saleReport.from_date_can_not_greater_to_date"));
      }
      const today = new Date();
      if (filter.fromDate > today) {
        throw new Error(t("saleReport.from_date_can_not_greater_today"));
      }
      const response: any = await getSaleReport({
        store_uuid: store_uuid,
        from_date: filter.fromDate,
        to_date: filter.toDate,
      });
      const totalValue = response.data.total_value;
      console.log("total:", totalValue);
      setTotalValue(totalValue);
    } catch (error: unknown) {
      console.error("Error fetching sale report:", (error as Error).message);
      snackbar.openSnackbar({
        duration: 3000,
        text: (error as Error).message,
        type: "error",
      });
    }
    setLoading(false);
  };
  

  const onFilterChange = (type: keyof FilterState, value: Date) => {
    setFilter((prev) => ({ ...prev, [type]: value }));
  };

  return (
    <Page className="section-container">
      <Box mt={2}>
        <Text>{t("saleReport.fromDate")}</Text>
        <DatePicker
          mask
          maskClosable
          value={filter?.fromDate}
          onChange={(value) => {
            onFilterChange("fromDate", value);
          }}
        />
      </Box>

      <Box mt={2}>
        <Text>{t("saleReport.toDate")}</Text>
        <DatePicker
          mask
          maskClosable
          value={filter?.toDate}
          onChange={(value) => {
            onFilterChange("toDate", value);
          }}
        />
      </Box>

      <Box mt={2}>
        <Button type="danger" onClick={handleSearch} loading={loading}>
          Search
        </Button>
      </Box>

      {totalValue !== null && (
        <Box
          mt={2}
          style={{
            textAlign: "center",
            padding: "10px",
            border: "1px solid green",
          }}
        >
          <Text size="xLarge" bold style={{ marginBottom: "8px" }}>
            {formatNumberToVND(totalValue)} VND
          </Text>
        </Box>
      )}
    </Page>
  );
};

export default SaleReportPage;
