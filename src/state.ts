import { atom, selector } from "recoil";

// ----- USER -----
interface UserState {
  zalo_id: string;
  avatar: string;
  name: string;
  uuid: string;
  store_uuid: string;
  company_uuid: string;
  role: string;
  login: boolean;
  authToken: string;
  accessToken: string;
  has_phone: boolean;
  is_oa_follow: boolean;
}

export const userState = atom<UserState>({
  key: "user",
  default: {
    zalo_id: "",
    avatar: "",
    name: "",
    uuid: "",
    store_uuid: "",
    company_uuid: "",
    role: "",
    login: false,
    authToken: "",
    accessToken: "",
    has_phone: false,
    is_oa_follow: false,
  },
});

export const authTokenSelector = selector<string>({
  key: "authTokenSelector",
  get: ({ get }) => {
    const user = get(userState);
    return user.authToken;
  },
});

// export const zaloUserState = selector({
//   key: "zalo_user",
//   get: async ({}) => {
//     try {
//       const { userInfo } = await getUserInfo({});
//       console.log(userInfo);
//       return userInfo;
//     } catch (error) {
//       console.log(error);
//       return null;
//     }
//   },
// });

// ----- COMPANY -----
interface CompanyState {
  name: string;
  uuid: string;
}

export const companyState = atom<CompanyState>({
  key: "company",
  default: {
    name: "",
    uuid: "",
  },
});
// ----- STORE -----

interface StoreSettings {
  name: string;
  value: string;
}

interface StoreState {
  uuid: string;
  name: string;
  user?:string
  subdomain: string;
  created_at: string;
  store_settings?: StoreSettings[]; 
  ai_requests_count?:number
  turn_on_table?: boolean;  
  tables_count?: number; 
  turn_on_category?: boolean;
  categories_count?: number;
  turn_on_product?: boolean;
  products_count?: number;
  turn_on_voucher?: boolean; 
  vouchers_count?: number;
  turn_on_order?: boolean; 
  orders_count?: number;
  turn_on_staff?: boolean;  
  staff_count?: number;
  turn_on_sale_report?: boolean;
}

interface StoreListState {
  is_update: boolean;
  stores: StoreState[];
}

export const storeListState = atom<StoreListState>({
  key: "storeListState",
  default: {
    is_update: false,
    stores: [],
  },
});

export const storeState = atom<StoreState>({
  key: "store",
  default: {
    name: "",
    uuid: "",
    subdomain: "",
    created_at: "",
    store_settings: [],
    ai_requests_count: 0,
  },
});

// ----- CATEGORY -----
interface CategoryState {
  name: string;
  describe: string;
  store_uuid: string;
  uuid: string;
  index?: number; 
}

interface CategoryListState {
  is_update: boolean;
  categories: CategoryState[];
}

export const categoryListState = atom<CategoryListState>({
  key: "categoryListState",
  default: {
    is_update: false,
    categories: [],
  },
});

export const categoryState = atom<CategoryState>({
  key: "category",
  default: {
    name: "",
    describe: "",
    store_uuid: "",
    uuid: "",
  },
});

// ----- PRODUCT -----
interface ProductImage {
  uuid: string;
  url: string;
}
interface Product {
  uuid: string;
  name: string;
  price:number
  unit_price?: number;
  quantity?: number;
  images?: ProductImage[];
  product_name: string;
  product_images?: ProductImage[];
  order_item_uuid: string
  delivered_quantity: number
  product_uuid? : string
  delivery_status: string
}

interface ProductState {
  is_update: boolean;
  products: Product[];
}


export const productListState = atom<ProductState>({
  key: "product",
  default: {
    is_update: false,
    products: [],
  },
});

// ----- TABLE -----
interface Table {
  uuid: string;
  name: string;
}

interface TableState {
  is_update: boolean;
  tables: Table[]; // Change from `[]` to `Table[]`
}

export const tableListState = atom<TableState>({
  key: "tableList",
  default: {
    is_update: false,
    tables: [],
  },
});

export const tableState = atom<Record<string, []>>({
  key: "table",
  default: {},
});

// ----- ORDER -----
interface User {
  avatar: string;
}

interface Order {
  invoice_uuid?: string;
  uuid: string;
  user?: User;
  created_at: string;
  store_name: string;
  table_uuid: string;
  store_uuid: string;
  status: string;
  products: Product[]; 
  notes?: string;
  actual_payment_amount: number;
  value: number;
}

interface OrderListState {
  is_update: boolean;
  orders: Order[];
}

export const orderListState = atom<OrderListState>({
  key: "orderList",
  default: {
    is_update: false,
    orders: [],
  },
});

export const orderState = atom<Order | null>({
  key: "orderState",
  default: null, 
});

export const currentOrderByStoreClientSideState = atom<Record<string, Order>>({
  key: "currentOrderByStoreClientSide",
  default: {},
});


export const orderListByUserState = atom<OrderListState>({
  key: "orderListByUser",
  default: {
    is_update: false,
    orders: [],
  },
});

interface DishImage {
  uuid: string;
  url: string;
}

interface CartItem {
  uuid: string;
  name: string;
  quantity: number;
  price: number;
  images?: DishImage[]; 
}


export const cartState = atom<CartItem[]>({
  key: "cart",
  default: [],
});
// ----- AUTH -----
export const requestLocationTriesState = atom<number>({
  key: "requestLocationTries",
  default: 0,
});

export const authTokenState = atom<string>({
  key: "authTokenState",
  default: "",
});

export const requestPhoneTriesState = atom<number>({
  key: "requestPhoneTries",
  default: 0,
});

// export const phoneState = selector({
//   key: "phone",
//   get: async ({ get }) => {
//     const requested = get(requestPhoneTriesState);
//     if (requested) {
//       const { number, token } = await getPhoneNumber({ fail: console.warn });
//       if (number) {
//         return number;
//       }
//       console.warn(
//         "Sử dụng token này để truy xuất số điện thoại của người dùng",
//         token,
//       );
//       console.warn(
//         "Chi tiết tham khảo: ",
//         "https://mini.zalo.me/blog/thong-bao-thay-doi-luong-truy-xuat-thong-tin-nguoi-dung-tren-zalo-mini-app",
//       );
//       console.warn("Giả lập số điện thoại mặc định: 0337076898");
//       return "0337076898";
//     }
//     return false;
//   },
// });

interface LoadingState {
  isLoading: boolean;
  completedText: string;
  completedPercent: number;
}

export const loadingState = atom<LoadingState>({
  key: "loading",
  default: {
    isLoading: false,
    completedText: "Loading...",
    completedPercent: 100,
  },
});

export const spinnerState = atom<boolean>({
  key: "spinner",
  default: false,
});

export const currencyState = atom<string>({
  key: "currencyState", 
  default: "USD", 
});