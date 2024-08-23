import React from "react";
import { Button, Input, Box, Page, useSnackbar } from "zmp-ui";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { companyState, userState } from "../../../state";
import { addCompany } from "../../../api/api";
import { useTranslation } from "react-i18next";

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

interface UserState {
  zalo_id: string;
  avatar: string;
  name: string;
  uuid: string;
  store_uuid: string;
  company_uuid: string;
  role: string;
  login: boolean;
  authToken: string;
  accessToken: string;
  has_phone: boolean;
  is_oa_follow: boolean;
}

const CompanyFormPage: React.FC = () => {
  const { t } = useTranslation("global");
  const [company, setCompany] = useRecoilState<CompanyState>(companyState);
  const [form, setForm] = React.useState<CompanyState>({ ...company });
  const snackbar = useSnackbar();
  const setUserState = useSetRecoilState(userState);

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

      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.createCompanySuccess"),
        type: "success",
      });
    } else {
      console.error("Error:", response.error);

      // Handle unknown error safely
      const errorMessage = typeof response.error === 'string'
        ? response.error
        : 'An unknown error occurred';

      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.createCompanyFail") + `: ${errorMessage}`,
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
      </div>
    </Page>
  );
};

export default CompanyFormPage;
