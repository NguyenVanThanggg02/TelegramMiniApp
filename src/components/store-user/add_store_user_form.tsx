import React, { useState } from 'react';
import { Button, Input, Icon, useSnackbar, Select, Box, Text } from 'zmp-ui';
import { addUserStore } from '../../api/api';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';

interface AddStoreUserFormProps {
  store_uuid: string;
  onUserAdded: () => void;
}

const AddStoreUserForm: React.FC<AddStoreUserFormProps> = ({ store_uuid, onUserAdded }) => {
  const { t } = useTranslation('global');
  const [userUUID, setUserUUID] = useState<string>('');
  const [role, setRole] = useState<string>('staff');
  const snackbar = useSnackbar();

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
          snackbar.openSnackbar({
            duration: 3000,
            text: t('snackbarMessage.addUserSuccess'),
            type: 'success',
          });
        } else {
          snackbar.openSnackbar({
            duration: 3000,
            text: typeof data.error === 'string' ? data.error : t('snackbarMessage.userIDIncorrect'),
            type: 'error',
          });
        }
      } catch (error) {
        snackbar.openSnackbar({
          duration: 3000,
          text: t('snackbarMessage.serverError'),
          type: 'error',
        });
      }
    } else {
      snackbar.openSnackbar({
        duration: 3000,
        text: t('snackbarMessage.userUUIDEmpty'),
        type: 'countdown',
      });
    }
  };

  return (
    <>
      <Text size="large" style={{ fontWeight: 500 }}>
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
        <Box mt={6} style={{ marginRight: '10px', marginTop: '0px' }}>
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
      </div>
    </>
  );
};

export default AddStoreUserForm;
