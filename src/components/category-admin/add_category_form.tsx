import React, { useState } from "react";
import { Button, Input, useSnackbar } from "zmp-ui";
import { addCategoryToStore } from "../../api/api";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";

// Define the types for the props
interface AddCategoryFormProps {
  store_uuid: string;
  onCategoryAdded: () => void;
}

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({ store_uuid, onCategoryAdded }) => {
  const { t } = useTranslation("global");
  const [catName, setCatName] = useState<string>("");
  const snackbar = useSnackbar();

  const handleAddCategory = async () => {
    if (catName) {
      const payload = {
        category: {
          store_uuid: store_uuid,
          name: catName,
        },
      };

      try {
        const data = await addCategoryToStore(payload);
        console.log("Data", data);
        if (!data?.error) {
          onCategoryAdded();
          setCatName("");
          snackbar.openSnackbar({
            duration: 3000,
            text: t("snackbarMessage.addCatSuccess"),
            type: "success",
          });
        } else {
          console.error("Error adding category:", data.error);
          snackbar.openSnackbar({
            duration: 3000,
            text:
              typeof data.error === "string"
                ? data.error
                : t("snackbarMessage.addCatFail"),
            type: "error",
          });
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        snackbar.openSnackbar({
          duration: 3000,
          text: t("snackbarMessage.addCatFail"),
          type: "error",
        });
      }
    } else {
      snackbar.openSnackbar({
        duration: 10000,
        text: t("snackbarMessage.catNameEmpty"),
        type: "countdown",
      });
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Input
        type="text"
        value={catName}
        onChange={(e) => setCatName(e.target.value)}
        placeholder={t("categoryManagement.categoryNameEnter")}
        style={{ marginRight: "10px" }}
        showCount
        maxLength={20}
      />
      <Button onClick={handleAddCategory} prefixIcon={<AddIcon />}>
        {t("categoryManagement.category")}
      </Button>
    </div>
  );
};

export default AddCategoryForm;
