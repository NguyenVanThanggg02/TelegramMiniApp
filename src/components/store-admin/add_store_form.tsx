import React, { useState, useEffect } from 'react';
import { Button, Input, useSnackbar } from 'zmp-ui';
import { createStore, validateCode } from '../../api/api';
import { useTranslation } from 'react-i18next';
import { textToDomain } from '../../utils/stringFormatter.util';
import AddIcon from '@mui/icons-material/Add';

interface AddStoreFormProps {
  authToken: string;
  onStoreAdded: () => void;
}

const AddStoreForm: React.FC<AddStoreFormProps> = ({ onStoreAdded }) => {
  const { t } = useTranslation('global');
  const [storeName, setStoreName] = useState<string>('');
  const [metadata, setMetadata] = useState<string>('');
  const [activationCode, setActivationCode] = useState<string>('');
  const [checkedCode, setCheckedCode] = useState<string>('');
  const [codeValid, setCodeValid] = useState<boolean>(false);
  const snackbar = useSnackbar();

  useEffect(() => {
    if (activationCode.length > 0 && activationCode !== checkedCode) {
      const controller = new AbortController();
      const { signal } = controller;
  
      const timer = setTimeout(() => {
        validateCode({ code: activationCode })
          .then((response) => {
            if (response.error) {
              setCodeValid(false);
              snackbar.openSnackbar({
                text: t('snackbarMessage.codeValidationFailed'),
                type: 'error',
              });
              setCheckedCode(activationCode);
              return Promise.reject(new Error(t('snackbarMessage.codeValidationFailed')));
            }
  
            const data = response.data;
            if (data) {
              if (data.status === 'actived') {
                setCodeValid(true);
                snackbar.openSnackbar({
                  text: t('snackbarMessage.codeValid'),
                  type: 'success',
                });
              } else {
                setCodeValid(false);
                snackbar.openSnackbar({
                  text: t('snackbarMessage.codeInvalid'),
                  type: 'error',
                });
              }
            } else {
              setCodeValid(false);
              snackbar.openSnackbar({
                text: t('snackbarMessage.codeInvalid'),
                type: 'error',
              });
            }
  
            setCheckedCode(activationCode);
          })
          .catch((error) => {
            if (!signal.aborted) {
              console.error('Error validating code:', error);
            }
          });
      }, 500);
  
      return () => {
        clearTimeout(timer);
        controller.abort(); 
      };
    }
  }, [activationCode, snackbar, t]);
  

  const handleAddStore = async () => {
    if (storeName && codeValid) {
      const data = await createStore({
        store: {
          name: storeName,
          subdomain: textToDomain(storeName),
          metadata,
        },
        code: activationCode,
      });

      if (!data?.error) {
        snackbar.openSnackbar({
          duration: 3000,
          text: t('snackbarMessage.createStoreSuccess'),
          type: 'success',
        });
        onStoreAdded();
      } else {
        console.error('Error creating store:', data.error);
        snackbar.openSnackbar({
          text: String(data.error),
          type: 'error',
        });
      }
    } else {
      snackbar.openSnackbar({
        text: t('snackbarMessage.missingInformation'),
        type: 'error',
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Input
        type="text"
        value={storeName}
        onChange={(e) => setStoreName(e.target.value)}
        placeholder={t('storeManagement.enterStoreName')}
        style={{ marginBottom: '10px' }}
      />
      <Input.TextArea
        value={metadata}
        onChange={(e) => setMetadata(e.target.value)}
        placeholder={t('storeManagement.enterMetadata')}
        style={{ marginBottom: '10px' }}
      />
      <Input
        type="text"
        value={activationCode}
        onChange={(e) => setActivationCode(e.target.value)}
        placeholder={t('storeManagement.enterActivationCode')}
        style={{ marginBottom: '10px' }}
      />
      <Button onClick={handleAddStore} prefixIcon={<AddIcon />}>
        {t('storeManagement.store')}
      </Button>
    </div>
  );
};

export default AddStoreForm;
