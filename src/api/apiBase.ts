import { DEFAULT_TENANT_ID } from "../constants";
import { createTenantURL } from "@/api/urlHelper";
import { getSubdomain, getAuthToken, getLanguage } from './cloudStorageManager';

// interface CloudStorageResponse {
//   subdomain?: string;
//   authToken?: string;
//   language?: string;
// }

// Define a generic API response type
interface ApiResponse<T> {
  data?: T;
  error?: any;
}

// Function to get base URL for API requests
export const getBaseUrl = async (useDefault = false): Promise<string | undefined> => {
  try {
    const subdomain = await getSubdomain();
    return createTenantURL(useDefault ? DEFAULT_TENANT_ID : subdomain);
  } catch (error) {
    // Handle API call failure
    throw error; // Re-throw the error to be handled by the calling function
  }
};

// Function to get query parameters for API requests
const getParams = async (params: Record<string, any> = {}): Promise<string> => {
  // Ensure that language is a string or provide a default value
  const language = await getLanguage() || 'en'; // Default to 'en' or any appropriate value

  // Ensure that `language` is a string before passing it to URLSearchParams
  return new URLSearchParams({ ...params, lang: language }).toString();
};


// ----- BASE REQUEST -----
export const sendGetRequest = async (
  endpoint: string,
  params: Record<string, any> = {},
  defaultDomain = false,
  withAuth = true,
): Promise<ApiResponse<any>> => {
  const baseURL = await getBaseUrl(defaultDomain);
  const queryParams = await getParams(params);
  const authToken = await getAuthToken();

  try {
    const response = await fetch(`${baseURL}/v1/${endpoint}?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(withAuth && { "Auth-Token": `${authToken}` }),
      },
    });
    const data = await response.json();
    return { data };
  } catch (err) {
    return { error: err };
  }
};

export const sendPostRequest = async (
  endpoint: string,
  params: Record<string, any> = {},
  bodyData: any,
  defaultDomain = false,
): Promise<ApiResponse<any>> => {
  const baseURL = await getBaseUrl(defaultDomain);
  const queryParams = await getParams(params);
  const authToken = await getAuthToken();

  try {
    const response = await fetch(`${baseURL}/v1/${endpoint}?${queryParams}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Auth-Token": `${authToken}`,
      },
      body: JSON.stringify(bodyData),
    });
    const data = await response.json();
    return { data };
  } catch (err) {
    return { error: err };
  }
};

export const sendPutRequest = async (
  endpoint: string,
  params: Record<string, any> = {},
  bodyData: any,
  defaultDomain = false,
): Promise<ApiResponse<any>> => {
  const baseURL = await getBaseUrl(defaultDomain);
  const queryParams = await getParams(params);
  const authToken = await getAuthToken();

  try {
    const response = await fetch(`${baseURL}/v1/${endpoint}?${queryParams}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Auth-Token": `${authToken}`,
      },
      body: JSON.stringify(bodyData),
    });
    const data = await response.json();
    return { data };
  } catch (err) {
    return { error: err };
  }
};

export const sendDeleteRequest = async (
  endpoint: string,
  params: Record<string, any> = {},
  bodyData: any,
  defaultDomain = false,
): Promise<ApiResponse<any>> => {
  const baseURL = await getBaseUrl(defaultDomain);
  const queryParams = await getParams(params);
  const authToken = await getAuthToken();

  try {
    const response = await fetch(`${baseURL}/v1/${endpoint}?${queryParams}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Auth-Token": `${authToken}`,
      },
      body: JSON.stringify(bodyData),
    });
    if (response.ok) {
      const data = await response.json();
      return { data };
    } else {
      const errorData = await response.json();
      return { data: null, error: errorData };
    }
  } catch (err) {
    return { error: err };
  }
};
