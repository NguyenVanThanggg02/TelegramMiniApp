import React, { useState } from "react";
import { Button, Input } from "zmp-ui";
import { addCategoryToStore } from "../../api/api";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Snackbar } from "@telegram-apps/telegram-ui";

interface AddCategoryFormProps {
  store_uuid: string;
  onCategoryAdded: () => void;
}

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({ store_uuid, onCategoryAdded }) => {
  const { t } = useTranslation("global");
  const [catName, setCatName] = useState<string>("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  

  const handleAddCategory = async () => {
    if (catName) {
      const payload = {
        category: {
          store_uuid: store_uuid,
          name: catName,
        },
      };

      try {
        const response = await addCategoryToStore(payload);
        const data = response.data
        console.log("Data", data);
        if (!data?.error) {
          onCategoryAdded();
          setCatName("");
          setSnackbarMessage(t("snackbarMessage.addCatSuccess"));
          setSnackbarType("success");
          setSnackbarOpen(true);

        } else {
          console.error("Error adding category:", data.error);
          setSnackbarMessage( typeof data.error === "string"
            ? data.error
            : t("snackbarMessage.addCatFail"),);
          setSnackbarType("error");
          setSnackbarOpen(true);

        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setSnackbarMessage(t("snackbarMessage.addCatFail"));
        setSnackbarType("error");
        setSnackbarOpen(true);
      }
    } else {
      setSnackbarMessage(t("snackbarMessage.catNameEmpty"));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Input
        type="text"
        value={catName}
        onChange={(e) => setCatName(e.target.value)}
        placeholder={t("categoryManagement.categoryNameEnter")}
        style={{ marginRight: "10px", color:'black' }}
        showCount
        maxLength={20}
      />
      <Button onClick={handleAddCategory} prefixIcon={<AddIcon />}>
        {t("categoryManagement.category")}
      </Button>
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
  );
};

export default AddCategoryForm;
