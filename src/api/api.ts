import { DEFAULT_TENANT_ID, VoucherStatus, VoucherType } from "../constants";
import {
  sendGetRequest,
  sendPostRequest,
  sendPutRequest,
  sendDeleteRequest,
  getBaseUrl,
} from "@/api/apiBase";
import { createTenantURL } from "@/api/urlHelper";


export interface ApiResponse<T> {
  name?: string;
  uuid?: string;
  subdomain?: string;
  data?: T;       
  error?: string | unknown;    
  orders?: [];
  status?: string;
  expired_at?: string;
}

interface Store {
  uuid: string;
  name: string;
  subdomain: string;
  created_at: string;
  store_settings: []; 
  ai_requests_count:number
  metadata: string; 
}

interface Category {
  name: string;
  describe: string;
  store_uuid: string;
  uuid: string;
}

interface Product {
  uuid: string;
  name: string;
  describe: string;
  price: number;
  store_uuid: string;
  categories: { uuid: string }[];
  status: string;
  images: { url: string; uuid: string }[];
}
interface ProductPayload {
  product: {
    uuid?: string;         
    cat_uuids: string[];
    store_uuid: string | undefined;
    name: string;
    describe: string;
    status: string;
    price: number;
    image_uuids: string[];
  };
}

// ----- AUTH -----
export const sendPostLogin = async (token: string): Promise<ApiResponse<any>> => {
  const baseURL = createTenantURL(DEFAULT_TENANT_ID);

  try {
    const response = await fetch(`${baseURL}/v1/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": `${token}`,
      },
    });

    const data = await response.json();
    return { data };
  } catch (err) {
    return { data: null, error: err };
  }
};

// ----- COMPANY -----
export const addCompany = (dataToSend: any): Promise<ApiResponse<any>> => {
  return sendPostRequest("company", {}, dataToSend, true);
};

// ----- STORE -----
export const getStoreList = (): Promise<ApiResponse<any>> => {
  return sendGetRequest("store", {}, true, true);
};

export const getStoreByUUID = (uuid: string): Promise<ApiResponse<Store>> => {
  return sendGetRequest(`store/${uuid}`, {}, true, true);
};


export const getStoreListByTenantID = async (): Promise<ApiResponse<Store[]>> => {
  try {
    const response = await sendGetRequest("store", {}, false, true);
    return { data: response.data as Store[], error: response.error };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
};
export const createStore = (dataToSend: any): Promise<ApiResponse<any>> => {
  return sendPostRequest("store", {}, dataToSend, true);
};

export const updateStore = (dataToSend: any): Promise<ApiResponse<any>> => {
  return sendPutRequest("store", {}, dataToSend, true);
};

// ----- CATEGORY -----
interface Category {
  uuid: string;
  name: string;
  describe: string;
  store_uuid: string;
  index: number;
}

export const getCategoryList = async (): Promise<ApiResponse<any>> => {
  return sendGetRequest("category/all", {}, false, true);
};

export const getCategoryByStore = async (store_uuid: string | undefined): Promise<ApiResponse<Category[]>> => {
  return sendGetRequest(
    "category",
    { store_uuid: store_uuid || "" },
    false,
    false,
  );
};

export const editCategoryByCategoryUUID = async (dataToSend: any): Promise<ApiResponse<Category>> => {
  return sendPutRequest("category", {}, dataToSend, false);
};

export const addCategoryToStore = async (dataToSend: any): Promise<ApiResponse<any>> => {
  return sendPostRequest("category", {}, dataToSend, false);
};

export const fetchCategoryDetails = async (category_uuid: string): Promise<ApiResponse<Category>> => {
  return sendGetRequest(`category/detail/${category_uuid}`, {}, false, false);
};

export const deleteCategory = async (dataToSend: any): Promise<ApiResponse<any>> => {
  return sendDeleteRequest("category", {}, dataToSend, false);
};

export const sortCategory = async (dataToSend: any): Promise<ApiResponse<any>> => {
  return sendPutRequest("category/sort", {}, dataToSend, false);
};

// ----- PRODUCT -----
export const sendCreateProductRequest = async (dataToSend: any): Promise<ApiResponse<any>> => {
  return sendPostRequest("product", {}, dataToSend, false);
};

export const sendUpdateProductRequest = async (dataToSend: ProductPayload): Promise<ApiResponse<any>> => {
  return sendPutRequest("product", {}, dataToSend, false);
};


export const getProductListByStore = async (store_uuid: string, is_admin: boolean): Promise<ApiResponse<any>> => {
  return sendGetRequest(
    "product",
    { store_uuid: store_uuid, all: is_admin },
    false,
    false,
  );
};

export const fetchProductDetails = async (productUUID: string): Promise<ApiResponse<Product>> => {
  return sendGetRequest(`product/detail/${productUUID}`, {}, false, false);
};


export const deleteProduct = async (dataToSend: any): Promise<ApiResponse<any>> => {
  return sendDeleteRequest("product", {}, dataToSend, false);
};

//  ----- SALE REPORT -----
export const getSaleReport = async (dataToSend: any): Promise<ApiResponse<any>>  => {
  return sendGetRequest("sale_report", dataToSend, false, true);
};

// ------ AI REQUEST -------

export const getAiRequestListByStore = async (store_uuid: string): Promise<ApiResponse<any>>  => {
  return sendGetRequest("ai_request", { store_uuid: store_uuid }, false, true);
};

// ----- TABLE -----
export const fetchTablesForStore = async (store_uuid: string): Promise<ApiResponse<any>> => {
  return sendGetRequest(`table`, { store_uuid: store_uuid }, false, false);
};

export const addTableToStore = async (dataToSend: any): Promise<ApiResponse<any>> => {
  return sendPostRequest("table", {}, dataToSend, false);
};

export const deleteTablesForStore = async (store_uuid: string): Promise<ApiResponse<any>> => {
  return sendDeleteRequest("table", { store_uuid: store_uuid }, {}, false);
};

export const editTable = async (dataToSend: any): Promise<ApiResponse<any>> => {
  return sendPutRequest("table", {}, dataToSend, false);
};

// ----- ORDER -----
export const sendCreateOrderRequest = async (dataToSend: any): Promise<ApiResponse<any>> => {
  return sendPostRequest("order", {}, dataToSend, false);
};

export const fetchOrdersByStore = async (params: any): Promise<ApiResponse<any>> => {
  return sendGetRequest("order", params, false, true);
};

export const fetchCurrentOrdersByStoreClientSide = async (store_uuid: string): Promise<ApiResponse<any>> => {
  return sendGetRequest(
    `order/curent_order_by_store/${store_uuid}`,
    {},
    false,
    true,
  );
};

export const fetchHistoryOrdersByStore = async (): Promise<ApiResponse<any>> => {
  return sendGetRequest("order/order_by_user", {}, false, true);
};

export const fetchOrderByUUID = async (store_uuid: string, order_uuid: string): Promise<ApiResponse<any>> => {
  return sendGetRequest(
    `order/${order_uuid}`,
    { store_uuid: store_uuid },
    false,
    false,
  );
};

export const updateOrderRequest = async (dataToSend: any): Promise<ApiResponse<any>> => {
  return sendPutRequest(`order`, {}, dataToSend, false);
};

export const updateStatusOrderRequest = async (order_uuid: string, dataToSend: any): Promise<ApiResponse<any>> => {
  return sendPutRequest(`order/status/${order_uuid}`, {}, dataToSend, false);
};

export const updateQuantityProductRequest = async (order_uuid: string, dataToSend: any) : Promise<ApiResponse<any>> => {
  return sendPutRequest(`order/delivery/${order_uuid}`, {}, dataToSend, false);
};

// ----- USER -----

interface StoreUser {
  uuid: string;
  name: string;
  avatar: string;
}

interface StoreUserRole {
  role: string;
  user: StoreUser;
}

export const updateUserPhoneRequest = async (dataToSend: any): Promise<ApiResponse<any>> => {
  return sendPutRequest(`user`, {}, dataToSend, false);
};


export const getUserByStore = async (store_uuid: string): Promise<ApiResponse<StoreUserRole[]>> => {
  const response = await sendGetRequest(`store_user`, { store_uuid: store_uuid }, false, true);
  return { data: response.data || [], error: response.error };
};


export const deleteUserStore = async (dataToSend: any): Promise<ApiResponse<any>> => {
  return sendDeleteRequest("store_user", {}, dataToSend, false);
};

export const addUserStore = async (dataToSend: any): Promise<ApiResponse<any>> => {
  return sendPostRequest("store_user", {}, dataToSend, false);
};

// ------ FOLLOW OA REQUEST -------
export const createFollowRequest = async (zalo_oa_id: string): Promise<ApiResponse<any>> => {
  return sendPostRequest(
    "zalo_oa_followers",
    {},
    { zalo_oa: zalo_oa_id },
    false,
  );
};

// ------ GET LOGIN TOKEN -------
export const getLoginToken = async (): Promise<ApiResponse<any>> => {
  return sendPostRequest("user/login_token", {}, {}, false);
};


//  ----- LICENSE -----
interface ActivationData {
  status: string;
  expired_at: string;
  value_in_days?: number;
  code?: string;
  content?: string;
}
export const validateCode = (params: Record<string, any>): Promise<ApiResponse<ActivationData>> => {
  return sendGetRequest(`lic`, params, true, true).then(response => {
    return {
      data: response.data ? response.data as ActivationData : undefined,
      error: response.error
    };
  });
};


// ----- VOUCHER -----

export interface Voucher {
  voucher_code: string;
  voucher_value: number;
  voucher_type: VoucherType;
  voucher_min_order_value: number;
  expired_at: string;
  status: VoucherStatus;
  uuid: string;
  name: string;
  updated_at: string;
  notes:string
}

export const getVoucherByStore = async (store_uuid: string | undefined): Promise<ApiResponse<Voucher[]>> => {
  if (!store_uuid) {
    return { error: "Store UUID is undefined" };
  }
  return sendGetRequest(`voucher/by_store/${store_uuid}`, {}, false, true);
};

export const getVoucherDetailByStore = async (code: string, store_uuid: string): Promise<ApiResponse<Voucher>> => {
  return sendGetRequest(`voucher/code/${code}/${store_uuid}`, {}, false, false);
};

export const updateVoucherRequest = async (uuid: string, dataToSend: any): Promise<ApiResponse<any>> => {
  return sendPutRequest(`voucher/${uuid || ""}`, {}, dataToSend, false);
};

export const addVoucherToStore = async (dataToSend: any): Promise<ApiResponse<any>> => {
  return sendPostRequest(`voucher`, {}, dataToSend, false);
};

export const fetchVoucherDetails = async (voucher_uuid: string): Promise<ApiResponse<Voucher>> => {
  return sendGetRequest(`voucher/${voucher_uuid}`, {}, false, false);
};

// ----- INVOICE -----

interface InvoiceData {
  voucher?: {
    voucher_type: string;
    voucher_value: number;
    voucher_min_order_value: number;
  };
}

interface InvoiceResponse extends ApiResponse<InvoiceData> {
  voucher?: {
    voucher_type: string;
    voucher_value: number;
    voucher_min_order_value: number;
  };
}

export const fetchInvoiceDetails = async (invoice_uuid: string): Promise<InvoiceResponse> => {
  return sendGetRequest(`invoice/${invoice_uuid}`, {}, false, true);
};


export const sendInvoice = async (dataToSend: any): Promise<ApiResponse<any>> => {
  return sendPostRequest(`invoice`, {}, dataToSend, false);
};


// UPLOAD IMAGES
export const uploadImages = async (store_uuid: string, user_uuid: string, images: File[]): Promise<ApiResponse<any>> => {
  // const baseUrl = "https://endpoint.hatkeo.com/api";
  const baseUrl = await getBaseUrl();
  const urlApi = `${baseUrl}/v1/attachment/${store_uuid}/${user_uuid}`;
  const formData = new FormData();
  
  images.forEach((image) => {
    formData.append('file', image);
  });

  formData.forEach((value, key) => {
    console.log(key, value);
  });

  try {
    const response = await fetch(urlApi, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
};

// upimagetodownqr
export const uploadImagesToDown = async (store_uuid: string, user_uuid: string, formData: FormData): Promise<ApiResponse<any>> => {
  const baseUrl = await getBaseUrl();
  const urlApi = `${baseUrl}/v1/attachment/${store_uuid}/${user_uuid}`;
  
  try {
    const response = await fetch(urlApi, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
};
