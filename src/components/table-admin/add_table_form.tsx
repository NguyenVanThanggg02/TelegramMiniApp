import React, { useState } from 'react';
import { Button, Input, useSnackbar } from 'zmp-ui';
import { addTableToStore } from '../../api/api';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';

interface AddTableFormProps {
  store_uuid: string;
  onTableAdded: () => void;
}

const AddTableForm: React.FC<AddTableFormProps> = ({ store_uuid, onTableAdded }) => {
  const { t } = useTranslation('global');
  const [tableName, setTableName] = useState<string>('');
  const snackbar = useSnackbar();

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
          snackbar.openSnackbar({
            duration: 3000,
            text: t('snackbarMessage.addTableSuccess'),
            type: 'success',
          });
        } else {
          snackbar.openSnackbar({
            duration: 3000,
            text: typeof data.error === 'string' ? data.error : t('snackbarMessage.addTableFail'),
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
        text: t('snackbarMessage.tableNameEmpty'),
        type: 'warning',
      });
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Input
        type="text"
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
        placeholder={t('tableManagement.enterTableName')}
        style={{ marginRight: '10px' }}
        showCount
        maxLength={10}
      />
      <Button onClick={handleAddTable} prefixIcon={<AddIcon />}>
        {t('tableManagement.table')}
      </Button>
    </div>
  );
};

export default AddTableForm;
