import React, { useState } from 'react';
import { Button, Input, Icon, useSnackbar } from 'zmp-ui';
import { addCategoryToStore } from '../../api/api';
import { useTranslation } from 'react-i18next';

// Define types for the props
interface AddVoucherFormProps {
  authToken: string;
  store_uuid: string;
  onVoucherAdded: () => void;
}

const AddVoucherForm: React.FC<AddVoucherFormProps> = ({
  // authToken,
  // store_uuid,
  // onVoucherAdded,
}) => {
  const { t } = useTranslation('global');
  const [voucherCode, setVoucherCode] = useState<string>('');
  const snackbar = useSnackbar();

  const handleAddVoucher = () => {
    // if (voucherCode) {
    //   const payload = {
    //     coupon: {
    //       store_uuid: store_uuid,
    //       code: voucherCode,
    //     },
    //   };
    //   console.log(`authToken: ${authToken}`);
    //   addCategoryToStore(authToken, payload)
    //   .then((response) => {
    //     if (response.error) {
    //       console.error('Error adding voucher to store:', response.error);
    //       snackbar.openSnackbar({
    //         duration: 3000,
    //         text: `Error: ${response.error}`,
    //         type: 'error',
    //       });
    //     } else {
    //       onVoucherAdded();
    //       setVoucherCode(''); 
    //     }
    //   })
    //     .catch((error) => {
    //       console.error('Error adding voucher:', error);
    //     });
    // } else {
    //   snackbar.openSnackbar({
    //     duration: 10000,
    //     text: t('snackbarMessage.voucherCodeEmpty'),
    //     type: 'countdown',
    //   });
    // }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Input
        type="text"
        value={voucherCode}
        onChange={(e) => setVoucherCode(e.target.value)}
        placeholder={t('navbar.promotion.addVoucherPlaceholder')}
        style={{ marginRight: '10px' }}
      />
      <Button onClick={handleAddVoucher}>
        <Icon icon="zi-plus-circle" /> {t('navbar.promotion.add')}
      </Button>
    </div>
  );
};

export default AddVoucherForm;
