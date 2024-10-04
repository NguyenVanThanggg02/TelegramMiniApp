import { useCloudStorage, useInitData } from '@telegram-apps/sdk-react';
import React from 'react';

export const useSubdomain = () => {
  const cloudStorage = useCloudStorage();
  const [subdomain, setSubdomain] = React.useState<string | undefined>(undefined);
  const initData = useInitData();

  if(initData){
    console.log('truy cap trong tele');
  }else{
    console.log('ngoai tele');
  }
  React.useEffect(() => {
    const fetchSubdomain = async () => {
      const [storedSubdomain] = await cloudStorage.get('subdomain');
      setSubdomain(storedSubdomain);
    };

    fetchSubdomain();
  }, [cloudStorage]);

  return subdomain;
};

export const useAuthToken = () => {
  const cloudStorage = useCloudStorage();
  const [authToken, setAuthToken] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    const fetchAuthToken = async () => {
      const [storedAuthToken] = await cloudStorage.get('authToken');
      setAuthToken(storedAuthToken);
    };

    fetchAuthToken();
  }, [cloudStorage]);

  return authToken;
};

export const useLanguage = () => {
  const cloudStorage = useCloudStorage();
  const [language, setLanguage] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    const fetchLanguage = async () => {
      const [storedLanguage] = await cloudStorage.get('language');
      setLanguage(storedLanguage);
    };

    fetchLanguage();
  }, [cloudStorage]);

  return language;
};
