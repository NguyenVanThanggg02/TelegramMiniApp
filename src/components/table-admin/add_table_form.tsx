import React, { useState } from 'react';
import { Button, Input } from 'zmp-ui';
import { addTableToStore } from '../../api/api';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { Snackbar } from "@telegram-apps/telegram-ui";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
interface AddTableFormProps {
  store_uuid: string;
  onTableAdded: () => void;
}

const AddTableForm: React.FC<AddTableFormProps> = ({ store_uuid, onTableAdded }) => {
  const { t } = useTranslation('global');
  const [tableName, setTableName] = useState<string>('');

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  

  const handleAddTable = async () => {
    if (tableName.trim()) {
      const payload = {
        store_uuid: store_uuid,
        tables: [
          {
            name: tableName,
          },
        ],
      };

      try {
        const data = await addTableToStore(payload);
        if (!data?.error) {
          onTableAdded();
          setTableName('');
          
          setSnackbarMessage(t("snackbarMessage.addTableSuccess"));
          setSnackbarType("success");
          setSnackbarOpen(true);

        } else {
        setSnackbarMessage(t("snackbarMessage.addTableFail"));
        setSnackbarType("error");
        setSnackbarOpen(true);
        }
      } catch (error) {
        setSnackbarMessage(t("snackbarMessage.serverError"));
        setSnackbarType("error");
        setSnackbarOpen(true);
      }
    } else {
      setSnackbarMessage(t("snackbarMessage.tableNameEmpty"));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Input
        type="text"
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
        placeholder={t('tableManagement.enterTableName')}
        style={{ marginRight: '10px', color:'black' }}
        showCount
        maxLength={10}
      />
      <Button onClick={handleAddTable} prefixIcon={<AddIcon />}>
        {t('tableManagement.table')}
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

export default AddTableForm;
