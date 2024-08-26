import React, { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Input, Box, Page, useSnackbar } from "zmp-ui";

// import { useRecoilValue } from "recoil";
// import { userState } from "../../../state";
import { editTable } from "../../../api/api";
import { useTranslation } from "react-i18next";

interface FormState {
  uuid?: string;
  name?: string;
}

const TableFormPage: React.FC = () => {
  const { t } = useTranslation("global");
  const { store_uuid, table_uuid } = useParams<{ store_uuid: string; table_uuid: string }>();
  // const user = useRecoilValue(userState);
  const [searchParams, ] = useSearchParams();
  const table_name = searchParams.get("table_name");
  const [form, setForm] = useState<FormState>({
    uuid: table_uuid,
    name: table_name || "",
  });

  const snackbar = useSnackbar();
  const navigate = useNavigate();

  const handleChangeInput = (field: keyof FormState, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = () => {
    if (form.uuid && form.name) {
      updateTableByName(form.uuid, form.name);
    }
  };


  const updateTableByName = async (uuid: string, name: string) => {
    let payload = {
      store_uuid: store_uuid,
      table: {
        name: name,
        uuid: uuid,
      },
    };
    const data = await editTable(payload);
    if (!data?.error) {
      // snackbar.openSnackbar({
      //   duration: 3000,
      //   text: t("snackbarMessage.updateTableSuccess"),
      //   type: "success",
      // });
      alert(t("snackbarMessage.updateTableSuccess"))
      navigate(-1);
    } else {
      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.updateTableFail"),
        type: "error",
      });
    }
  };

  return (
    <Page className="page">
      <div className="section-container">
        <Box>
          <Input
            id="name"
            label={t("tableManagement.tableName")}
            type="text"
            placeholder={t("tableManagement.tableName")}
            value={form?.name}
            onChange={(e) => handleChangeInput("name", e.target.value)}
            showCount
            maxLength={10}
          />

          <Box mt={4}>
            <Button fullWidth variant="primary" onClick={handleSubmit}>
              {t("categoryManagement.update")}
            </Button>
          </Box>
        </Box>
      </div>
    </Page>
  );
};

export default TableFormPage;
