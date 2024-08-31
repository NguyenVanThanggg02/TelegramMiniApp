import React, { useState } from 'react';
import { Button, Input, Select, Box, Text } from 'zmp-ui';
import { addUserStore } from '../../api/api';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Snackbar } from "@telegram-apps/telegram-ui";

interface AddStoreUserFormProps {
  store_uuid: string;
  onUserAdded: () => void;
}

const AddStoreUserForm: React.FC<AddStoreUserFormProps> = ({ store_uuid, onUserAdded }) => {
  const { t } = useTranslation('global');
  const [userUUID, setUserUUID] = useState<string>('');
  const [role, setRole] = useState<string>('staff');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  

  const handleAddUserStore = async () => {
    if (userUUID) {
      const payload = {
        store_uuid: store_uuid,
        user_uuid: userUUID.replace(/\s/g, ''),
        role: role,
      };

      try {
        const data = await addUserStore(payload);
        if (!data?.error) {
          onUserAdded();
          setUserUUID('');
          setSnackbarMessage(t("snackbarMessage.addUserSuccess"));
          setSnackbarType("success");
          setSnackbarOpen(true);
        } else {
        setSnackbarMessage(typeof data.error === 'string' ? data.error : t('snackbarMessage.userIDIncorrect'));
        setSnackbarType("error");
        setSnackbarOpen(true);
        }
      } catch (error) {
        setSnackbarMessage(t("snackbarMessage.serverError"));
        setSnackbarType("error");
        setSnackbarOpen(true);
      }
    } else {
        setSnackbarMessage(t("snackbarMessage.userUUIDEmpty"));
        setSnackbarType("error");
        setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Text size="large" style={{ fontWeight: 500, color:'black' }}>
        {t('userManagement.add_user')}
      </Text>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Box mt={6} style={{ marginRight: '10px', width: '78%', marginTop: '0px' }}>
          <Input
            type="text"
            value={userUUID}
            onChange={(e) => setUserUUID(e.target.value)}
            placeholder={t('userManagement.userUUIDEnter')}
            style={{ marginRight: '10px' }} // Adjust width as needed
          />
        </Box>
        <Box mt={6} style={{ marginRight: '10px', marginTop: '0px', color:'black' }}>
          <Select
            placeholder={t('categoryManagement.selectRole')}
            value={role}
            closeOnSelect={true}
            onChange={(value) => {
              if (typeof value === 'string') {
                setRole(value);
              }
            }}
          >
            <Select.Option value="staff" title={t('userManagement.staff')} />
            <Select.Option value="admin" title={t('userManagement.admin')} />
          </Select>
        </Box>
        <Box mt={6} style={{ marginTop: '0px' }}>
          <Button
            onClick={handleAddUserStore}
            icon={<AddIcon />}
            style={{ width: '100%', padding: '12px 24px', borderRadius: '8px' }}
          >
            {t('userManagement.add')}
          </Button>
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
    </>
  );
};

export default AddStoreUserForm;
