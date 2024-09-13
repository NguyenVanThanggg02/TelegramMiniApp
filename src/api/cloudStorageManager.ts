// src/api/cloudStorageManager.ts
import { initCloudStorage } from '@telegram-apps/sdk';

const cloudStorage = initCloudStorage();

let subdomainCache: string | undefined;
let authTokenCache: string | undefined;
let languageCache: string | undefined;

// Phương thức để làm mới cache khi có thay đổi store
export const refreshCache = async () => {
  subdomainCache = undefined;
  authTokenCache = undefined;
  languageCache = undefined;
};

const getSubdomain = async (): Promise<string | undefined> => {
  if (subdomainCache !== undefined) {
    return subdomainCache;
  }

  try {
    const subdomain = await cloudStorage.get('subdomain');
    subdomainCache = subdomain;
    return subdomain;
  } catch (error) {
    console.log("Error when getting subdomain", error);
    throw error;
  }
};


const getAuthToken = async (): Promise<string | undefined> => {
  if (authTokenCache === undefined) {
    const authToken = await cloudStorage.get('auth_token');
    authTokenCache = authToken;
  }

  return authTokenCache;
};

const getLanguage = async (): Promise<string | undefined> => {
  if (languageCache === undefined) {
    const language = await cloudStorage.get('language');
    languageCache = language;
  }

  return languageCache;
};

export { getSubdomain, getAuthToken, getLanguage };
