// src/api/cloudStorageManager.ts
import { initCloudStorage } from '@telegram-apps/sdk'; // Use the non-hook-based SDK

const cloudStorage = initCloudStorage();

let subdomainCache: string | undefined;
let authTokenCache: string | undefined;
let languageCache: string | undefined;

const getSubdomain = async (): Promise<string | undefined> => {
  try {
    // Lấy giá trị subdomain mới nhất từ cloudStorage mỗi lần gọi hàm
    const subdomain = await cloudStorage.get('subdomain');
    return subdomain;
  } catch (error) {
    console.error("Error retrieving subdomain:", error);
    return undefined;
  }
};

// Nếu bạn cần hàm cập nhật giá trị mới nhất vào cache, bạn có thể sử dụng hàm sau
const refreshSubdomainCache = async (): Promise<void> => {
  try {
    subdomainCache = await cloudStorage.get('subdomain');
  } catch (error) {
    console.error("Error refreshing subdomain cache:", error);
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

export { getSubdomain, getAuthToken, getLanguage,refreshSubdomainCache };
