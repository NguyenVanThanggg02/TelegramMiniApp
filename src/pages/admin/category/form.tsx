import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Box,
  Page,
  Select,
} from "zmp-ui";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useRecoilState, useRecoilValue } from "recoil";
import {
  categoryState,
  storeListState,
} from "../../../state";
import {
  fetchCategoryDetails,
  editCategoryByCategoryUUID,
} from "../../../api/api";
import { useTranslation } from "react-i18next";
import { Snackbar } from "@telegram-apps/telegram-ui";

const { Option } = Select;

interface CategoryForm {
  name: string;
  describe?: string;
  store_uuid: string;
  uuid?: string;
}

const CategoryFormPage: React.FC = () => {
  const { t } = useTranslation("global");
  const [category] = useRecoilState(categoryState);
  const { store_uuid, category_uuid } = useParams<{ store_uuid?: string; category_uuid?: string }>();
  const [form, setForm] = React.useState<CategoryForm>({ ...category });
  const storeList = useRecoilValue(storeListState);

  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  
  const handleChangeInput = (field: keyof CategoryForm, value: string) => {
    setForm({ ...form, [field]: value });
  };

  useEffect(() => {
    if (category_uuid) {
      loadCategoryDetails(category_uuid);
    }
  }, [category_uuid]);

  const loadCategoryDetails = async (category_uuid: string) => {
    try {
      const response = await fetchCategoryDetails(category_uuid);
      if (response.data) {
        const data = response.data;
        setForm({
          name: data.name,
          describe: data.describe,
          store_uuid: data.store_uuid,
          uuid: data.uuid,
        });
      } else {
        console.error("Error fetching category details:", response.error);
        setSnackbarMessage(t("snackbarMessage.fetchProductDetailFail"));
        setSnackbarType("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error fetching category details:", error);
      setSnackbarMessage(t("snackbarMessage.fetchProductDetailFail"));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
  };

  const updateCategoryByName = async (uuid: string, name: string) => {
    try {
      const payload = {
        category: {
          name: name,
          store_uuid: form.store_uuid,
          uuid: uuid,
        },
      };
      const response = await editCategoryByCategoryUUID(payload);
      if (response.data) {
        const data = response.data;
        setForm((prevForm) => ({
          ...prevForm,
          name: data.name,
          describe: data.describe,
          store_uuid: data.store_uuid,
          uuid: data.uuid,
        }));

        setSnackbarMessage(t("snackbarMessage.updateCatSuccess"));
        setSnackbarType("success");
        setSnackbarOpen(true);
        setTimeout(() => {
          navigate(-1); 
        }, 2000);
      } else {
        console.error("Error update category", response.error);
        setSnackbarMessage(t("snackbarMessage.updateCatFail"));
        setSnackbarType("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error update category:", error);
      setSnackbarMessage(t("snackbarMessage.updateCatFail"));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
  };

  const handleSubmit = () => {
    if (form.uuid) {
      updateCategoryByName(form.uuid, form.name);
    }
  };

  return (
    <Page className="page">
      <div className="section-container">
        <Box>
          <Input
            id="name"
            label={t("categoryManagement.categoryName")}
            type="text"
            placeholder={t("categoryManagement.categoryName")}
            value={form?.name}
            onChange={(e) => handleChangeInput("name", e.target.value)}
            showCount
            maxLength={20}
          />

          <Select
            id="store_uuid"
            label={t("categoryManagement.store")}
            closeOnSelect
            value={store_uuid}
            disabled
            style={{color:'gray'}}
          >
            {storeList.stores.map((store) => (
              <Option title={store.name} key={store.uuid} value={store.uuid} />
            ))}
          </Select>

          <Box mt={4}>
            <Button fullWidth variant="primary" onClick={handleSubmit}>
              {t("categoryManagement.update")}
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

export default CategoryFormPage;
