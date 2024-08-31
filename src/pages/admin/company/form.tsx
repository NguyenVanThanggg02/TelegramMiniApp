import React, { useState } from "react";
import { Button, Input, Box, Page } from "zmp-ui";
import { useRecoilState, useSetRecoilState } from "recoil";
import { companyState, userState } from "../../../state";
import { addCompany } from "../../../api/api";
import { useTranslation } from "react-i18next";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Snackbar } from "@telegram-apps/telegram-ui";

interface CompanyState {
  name: string;
  uuid: string;
}
interface ApiResponse<T> {
  data?: T;       
  error?: string | unknown;    
  name?: string;
  uuid?: string;
  subdomain?: string;
  orders?: [];
  status?: string;
  expired_at?: string;
}


const CompanyFormPage: React.FC = () => {
  const { t } = useTranslation("global");
  const [company, setCompany] = useRecoilState<CompanyState>(companyState);
  const [form, setForm] = React.useState<CompanyState>({ ...company });
  const setUserState = useSetRecoilState(userState);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  
  const handleChangeInput = (field: keyof CompanyState, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    const response = await addCompany({
      company: {
        name: form.name,
      },
    });

    if (!response.error) {
      const companyData = response as ApiResponse<CompanyState>; // Ensure type assertion

      setCompany({
        name: companyData.name ?? '',
        uuid: companyData.uuid ?? '',
      });

      setUserState(prevState => ({
        ...prevState,
        company_uuid: companyData.uuid ?? '',
      }));

      setSnackbarMessage(t("snackbarMessage.createCompanySuccess"));
        setSnackbarType("success");
        setSnackbarOpen(true);
    } else {
      console.error("Error:", response.error);

      // Handle unknown error safely
      const errorMessage = typeof response.error === 'string'
        ? response.error
        : 'An unknown error occurred';

      setSnackbarMessage(t("snackbarMessage.createCompanyFail") + `: ${errorMessage}`);
        setSnackbarType("error");
        setSnackbarOpen(true);
    }
  };

  return (
    <Page className="page">
      <div className="section-container">
        <Box>
          <Input
            id="name"
            label={t("main.companyName")}
            type="text"
            placeholder={t("main.enterCompanyName")}
            value={form?.name}
            onChange={(e) => handleChangeInput("name", e.target.value)}
          />
          <Box mt={4}>
            <Button fullWidth variant="primary" onClick={handleSubmit}>
              {t("button.save")}
            </Button>
          </Box>
        </Box>
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
      </div>
    </Page>
  );
};

export default CompanyFormPage;
