import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Box,
  Page,
  useSnackbar,
  Select,
} from "zmp-ui";

import { useRecoilState, useRecoilValue } from "recoil";
import {
  // categoryListState,
  // userState,
  categoryState,
  storeListState,
} from "../../../state";
import {
  fetchCategoryDetails,
  editCategoryByCategoryUUID,
} from "../../../api/api";
import { useTranslation } from "react-i18next";

const { Option } = Select;

interface CategoryForm {
  name: string;
  describe?: string;
  store_uuid: string;
  uuid?: string;
}

const CategoryFormPage: React.FC = () => {
  const { t } = useTranslation("global");
  const [category, ] = useRecoilState(categoryState);
  const { store_uuid, category_uuid } = useParams<{ store_uuid?: string; category_uuid?: string }>();
  const [form, setForm] = React.useState<CategoryForm>({ ...category });
  // const user = useRecoilValue(userState);
  const storeList = useRecoilValue(storeListState);

  const snackbar = useSnackbar();
  const navigate = useNavigate();

  const handleChangeInput = (field: keyof CategoryForm, value: string) => {
    setForm({ ...form, [field]: value });
  };

  useEffect(() => {
    if (category_uuid) {
      loadCategoryDetails(category_uuid);
    }
  }, [category_uuid]);



  const loadCategoryDetails = async (category_uuid: string) => {
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
      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.fetchProductDetailFail"),
        type: "error",
      });
    }
  };

  const updateCategoryByName = async (uuid: string, name: string) => {
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

      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.updateCatSuccess"),
        type: "success",
      });
      navigate(-1);
    } else {
      console.error("Error update category", response.error);
      snackbar.openSnackbar({
        duration: 3000,
        text:
          typeof response.error === "string"
            ? response.error
            : t("snackbarMessage.updateCatFail"),
        type: "error",
      });
    }
  };

  const handleSubmit = () => {
    console.log(
      `form.store_uuid: ${form.store_uuid} | form.name: ${form.name}`,
    );

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
      </div>
    </Page>
  );
};

export default CategoryFormPage;
