import appConfig from "../../app-config.json";

export const BASE_URL = import.meta.env.VITE_BASE_URL;
export const BASE_SOCKET_URL = import.meta.env.VITE_BASE_SOCKET_URL;
export const DEFAULT_TENANT_ID = import.meta.env.VITE_DEFAULT_TENANT_ID;
export const BOT_USERNAME =import.meta.env.VITE_BOT_USERNAME
export const SHORT_NAME =import.meta.env.VITE_SHORT_NAME
export const APP_VERSION = appConfig.app.version;
export const DEFAULT_PER_PAGE = 100;

export const SORT_TYPE = {
  TEXT_ASC: "textAsc",
  TEXT_DESC: "textDesc",
  PRICE_ASC: "priceAsc",
  PRICE_DESC: "priceDesc",
};

export const ROLE = {
  store_owner: "store_owner",
  guest: "Guest",
  staff: "Staff",
};

// ----- STATUS -----
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  DELIVERED: "delivered",
  DONE: "done",
  WAIT_FOR_PAY: "wait_for_pay",
  PAYED: "payed",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
};

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];


export const ORDER_STATUS_NOT_FINISHED_ARR = ["payed", "refunded", "cancelled"];

export const PRODUCT_ORDER_STATUS = {
  PENDING: "pending",
  PARTIAL_DELIVERY: "partial_delivery",
  FINISHED: "finished",
};

// ----- HEADER TITLE -----

export type HeaderTitleMap = {
  [key: string]: string;
};

export const HEADER_TITLE: HeaderTitleMap = {
  "/admin/home": "main.adminDashboard",
  "/admin/profile": "profile.profile",
  "/admin/company/index": "main.companyManagement",
  "/admin/company/form": "main.createCompany",
  "/admin/store/form": "main.regStore",
  "/admin/store/index": "storeManagement.storeManagement",
  "/admin/product/index": "productManagement.productManagement",
  "/admin/product/form": "productManagement.createProduct.createProduct",
  "/admin/product/update": "productManagement.updateProduct",
  "/admin/category/index": "categoryManagement.categoryManagement",
  "/admin/category/form": "categoryManagement.updateCategory",
  "/admin/table/index": "tableManagement.tableManagement",
  "/admin/table/form": "tableManagement.updateTable",
  "/admin/voucher/index": "voucherManagement.voucherManagement",
  "/admin/voucher/form": "voucherManagement.createVoucher.createVoucher",
  "/admin/voucher/update": "voucherManagement.updateVoucher",
  "/admin/order-management/index": "orderManagement.orderManagement",
  "/admin/order-management/details/index":
    "orderManagement.orderDetail.orderDetail",
  "/admin/order-management/create/index": "orderManagement.createOrder",
  "/order-history": "userOrder.orderHistory",
  "/admin/user/index": "storeManagement.user",
  "/admin/sale-report": "storeManagement.sale_report",
  "/admin/store/edit": "storeManagement.editStore",
};

export const TYPE_SOCKET = {
  ORDER: "OrderNotification",
};
// ----- HEADER TITLE -----

export const LANGUAGE = [
  { value: "vi", title: "Tiếng Việt", icon: "" },
  { value: "en", title: "English", icon: "" },
];

export const VOUCHER_TYPE = {
  BY_VALUE: "decrease_by_value",
  BY_PERCENT: "decrease_by_percent",
} as const;
export type VoucherType = typeof VOUCHER_TYPE[keyof typeof VOUCHER_TYPE];


export const VOUCHER_STATUS = {
  ACTIVE: "actived",
  INACTIVE: "inactive",
};
export type VoucherStatus = typeof VOUCHER_STATUS[keyof typeof VOUCHER_STATUS];


export const PRODUCT_STATUS = {
  DISPLAY: "show_now",
  HIDDEN: "not_show",
};

// ----- DEFAULT IMAGE -----

export const DEFAULT_IMAGE_USER =
  "https://t4.ftcdn.net/jpg/02/29/75/83/360_F_229758328_7x8jwCwjtBMmC6rgFzLFhZoEpLobB6L8.jpg";
export const DEFAULT_IMAGE_STORE =
  "https://img.freepik.com/free-vector/shop-with-sign-we-are-open_52683-38687.jpg?size=626&ext=jpg&ga=GA1.1.2116175301.1701561600&semt=ais";
export const DEFAULT_IMAGE_PRODUCT =
  "https://images.unsplash.com/photo-1602253057119-44d745d9b860?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGlzaHxlbnwwfHwwfHx8MA%3D%3D";

export const MOCK_ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;

// ----- DEFAULT USER_SETTING -----
export const KEEP_SCREEN_ON_DEFAULT = false;
export const KEEP_SCREEN_ON_STORE_KEY = "goimonhanh_keepScreenOn";
