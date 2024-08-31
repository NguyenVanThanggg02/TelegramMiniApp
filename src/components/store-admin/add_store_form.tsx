import React, { useState, useEffect } from 'react';
import { Button, Input } from 'zmp-ui';
import { createStore, validateCode } from '../../api/api';
import { useTranslation } from 'react-i18next';
import { textToDomain } from '../../utils/stringFormatter.util';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Snackbar } from "@telegram-apps/telegram-ui";

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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  
  useEffect(() => {
    if (activationCode.length > 0 && activationCode !== checkedCode) {
      const controller = new AbortController();
      const { signal } = controller;
  
      const timer = setTimeout(() => {
        validateCode({ code: activationCode })
          .then((response) => {
            if (response.error) {
              setCodeValid(false);
              setSnackbarMessage(t("snackbarMessage.codeValidationFailed"));
              setSnackbarType("error");
              setSnackbarOpen(true);
              
              setCheckedCode(activationCode);
              return Promise.reject(new Error(t('snackbarMessage.codeValidationFailed')));
            }
  
            const data = response.data;
            if (data) {
              if (data.status === 'actived') {
                setCodeValid(true);
               
                setSnackbarMessage(t("snackbarMessage.codeValid"));
                setSnackbarType("success");
                setSnackbarOpen(true);
              } else {
                setCodeValid(false);
                setSnackbarMessage(t("snackbarMessage.codeInvalid"));
                setSnackbarType("error");
                setSnackbarOpen(true);
              }
            } else {
              setCodeValid(false);
              setSnackbarMessage(t("snackbarMessage.codeInvalid"));
                setSnackbarType("error");
                setSnackbarOpen(true);
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
  }, [activationCode, t]);
  

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
     

        setSnackbarMessage(t("snackbarMessage.createStoreSuccess"));
        setSnackbarType("success");
        setSnackbarOpen(true);

        onStoreAdded();
      } else {
        console.error('Error creating store:', data.error);
        setSnackbarMessage(String(data.error));
        setSnackbarType("error");
        setSnackbarOpen(true);
      }
    } else {
      setSnackbarMessage(t('snackbarMessage.missingInformation'));
        setSnackbarType("error");
        setSnackbarOpen(true);
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

export default AddStoreForm;
