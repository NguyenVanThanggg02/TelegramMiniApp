import React, { useEffect, useState } from 'react';
import { Box, Text } from 'zmp-ui';
import DEFAULT_IMAGE_STORE from '../../static/icons/store-background.png';

interface StoreDetail {
  avatar?: {
    url?: string;
  };
}

interface StoreData {
  name: string;
  metadata?: string;
}

interface StoreInformationProps {
  storeData: StoreData;
  onDetail: () => void;
}

const StoreInformation: React.FC<StoreInformationProps> = ({ storeData, onDetail }) => {
  const [storeDetail, setStoreDetail] = useState<StoreDetail | undefined>(undefined);

  useEffect(() => {
    try {
      if (storeData.metadata) {
        setStoreDetail(JSON.parse(storeData.metadata));
      }
    } catch {
      // Handle JSON parsing error if needed
    }
  }, [storeData]);

  return (
    <Box
      flex
      justifyContent="flex-start"
      alignItems="center"
      style={{
        margin: '10px',
        boxShadow: '0 0 8px 0 rgba(0, 0, 0, 0.2)',
        width: 'fit-content',
        padding: '5px 10px',
        borderRadius: '8px',
        maxWidth: '70%',
      }}
      onClick={onDetail}
    >
      <Box
        flex
        justifyContent="center"
        alignItems="center"
        style={{
          borderRadius: '8px',
          marginRight: '10px',
        }}
      >
        <img
          style={
            !storeDetail?.avatar?.url
              ? { filter: 'grayscale(1) opacity(0.5)' }
              : {}
          }
          className="img-avatar-store"
          src={storeDetail?.avatar?.url || DEFAULT_IMAGE_STORE}
          alt="store avatar"
        />
      </Box>
      <Box>
        <Text size="large" bold style={{color:'black'}}>
          {storeData.name}
        </Text>
      </Box>
    </Box>
  );
};

export default StoreInformation;
