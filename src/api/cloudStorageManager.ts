// src/api/cloudStorageManager.ts
import { initCloudStorage } from '@telegram-apps/sdk'; // Use the non-hook-based SDK

const cloudStorage = initCloudStorage();

let subdomainCache: string | undefined;
let authTokenCache: string | undefined;
let languageCache: string | undefined;

// const getSubdomain = async (): Promise<string | undefined> => {
//   if (subdomainCache === undefined) {
//     const subdomain = await cloudStorage.get('subdomain');
//     subdomainCache = subdomain;
//   }
//   return subdomainCache;
// };

const getSubdomain = async (): Promise<string | undefined> => {
  const subdomain = await cloudStorage.get('subdomain');
  // Nếu giá trị mới khác với giá trị đã lưu trong cache, cập nhật cache
  if (subdomain !== subdomainCache) {
    subdomainCache = subdomain;
  }
  return subdomainCache;
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
