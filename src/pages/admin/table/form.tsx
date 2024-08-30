import React, { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Input, Box, Page } from "zmp-ui";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { editTable } from "../../../api/api";
import { useTranslation } from "react-i18next";
import { Snackbar } from "@telegram-apps/telegram-ui";

interface FormState {
  uuid?: string;
  name?: string;
}

const TableFormPage: React.FC = () => {
  const { t } = useTranslation("global");
  const { store_uuid, table_uuid } = useParams<{ store_uuid: string; table_uuid: string }>();
  const [searchParams] = useSearchParams();
  const table_name = searchParams.get("table_name");
  const [form, setForm] = useState<FormState>({
    uuid: table_uuid,
    name: table_name || "",
  });

  const navigate = useNavigate();
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  
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
      setSnackbarMessage(t("snackbarMessage.updateTableSuccess"));
      setSnackbarType("success");
      setTimeout(() => {
        setSnackbarOpen(false);
        navigate(-1); 
      }, 2000);
    } else {
      setSnackbarMessage(t("snackbarMessage.updateTableFail"));
      setSnackbarType("error");
    }
    setSnackbarOpen(true);
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
        
        {snackbarOpen && (
           <Snackbar onClose={() => setSnackbarOpen(false)} duration={3000}>
           <div className={`snackbar ${snackbarType === "success" ? "snackbar-success" : "snackbar-error"}`}>
             {snackbarType === "success" && <CheckCircleIcon style={{ marginRight: 8, color:'green' }} />} 
             {snackbarType === "error" && <ErrorIcon style={{ marginRight: 8, color:'red' }} />} 
           </div>
         </Snackbar>
        )}
      </div>
    </Page>
  );
};

export default TableFormPage;
