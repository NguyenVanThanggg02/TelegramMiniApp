import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Page, Text, Box, Button } from "zmp-ui";
import { useRecoilState } from "recoil";
import DishMenu from "../dish/dish-card/dish-menu";
import {
  cartState,
  categoryListState,
  productListState,
  tableState,
  tableListState,
  storeState,
} from "../../state";
import "./styles.scss";
import DishOrderSheet from "../../components/dish/dish-order";
import { priceFormatter } from "../../utils/numberFormatter";
import { isEmpty, sum } from "lodash";
import OrderSubmitModal from "../order-submit-modal";
// import DishDetailModal from "../../components/dish/dish-details";
import { useTranslation } from "react-i18next";
import {
  fetchTablesForStore,
  getCategoryByStore,
  getProductListByStore,
  getStoreByUUID,
} from "../../api/api";
import StoreInformation from "../store-information";
import StoreDetailModal from "../store-information/storeDetail";
import { Tabs, Tab } from "@mui/material";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import { initCloudStorage } from "@telegram-apps/sdk-react";


interface DishImage {
  uuid: string;
  url: string;
}

interface Dish {
  uuid: string;
  name: string;
  price: number;
  describe?: string;
  quantity?: number;
  images?: DishImage[];
  categories?: Category[];
}

interface Category {
  name: string;
  describe: string;
  store_uuid: string;
  uuid: string;
}
interface ApiResponse<T> {
  name?: string;
  uuid?: string;
  subdomain?: string;
  data?: T;       
  error?: string | unknown;    
  orders?: [];
  status?: string;
  expired_at?: string;
}
interface MenuCommonPageProps {
}

interface StoreSetting {
  key: string;
  value: any; 
}
interface Store {
  uuid: string;
  name: string;
  subdomain: string;
  created_at: string;
  store_settings: StoreSetting[];
  ai_requests_count:number
  metadata: string; 
}

const MenuCommonPage: React.FC<MenuCommonPageProps> = () => {
  const { t } = useTranslation("global");
  const { store_uuid, table_uuid } = useParams<{ store_uuid: string; table_uuid?: string }>();
  const [searchParams, ] = useSearchParams();
  const tenant_id = searchParams.get("tenant_id");

  const [, setStore] = useRecoilState(storeState);
  const [table, setTable] = useRecoilState(tableState);
  const [tableList, setTableList] = useRecoilState(tableListState);
  const [categoryList, setCategoryList] = useRecoilState(categoryListState);
  const [productList, setProductList] = useRecoilState(productListState);
  const [cart, setCart] = useRecoilState(cartState);

//   const [showDishDetailsModal, setShowDishDetailsModal] = useState<boolean>(false);
  const [, setShowDishDetailsModal] = useState<boolean>(false);
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [showOrderSubmitModal, setShowOrderSubmitModal] = useState<boolean>(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [menu, setMenu] = useState<Category[]>([]);
  const [storeDetail, setStoreDetail] = useState<Store | null>(null);
  const [showStoreDetail, setShowStoreDetail] = useState<boolean>(false);
  const [displayProductList, setDisplayProductList] = useState<Record<string, Dish[]>>({});
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [defaultMarginList, setDefaultMarginList] = useState<number>(0);
  const cloudStorage = initCloudStorage();
  const menuRef = useRef<(HTMLDivElement | null)[]>([]);
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pageRef.current) return;

    const handleTouchMove = () => {
      const container = pageRef.current;
      if (container) {
        const scrollEvent = new Event("scroll");
        container.dispatchEvent(scrollEvent);
      }
    };

    const handleScroll = () => {
      const container = pageRef.current;
      if (container) {
        const { scrollTop } = container;
        if (scrollTop === 0) return;
        menuRef.current.forEach((ref, index) => {
          if (ref && ref.getBoundingClientRect().top <= 500) {
            setActiveTab(menu[index].uuid);
          }
        });
      }
    };

    const container = pageRef.current;
    container.addEventListener("touchmove", handleTouchMove);
    container.addEventListener("scroll", handleScroll);
    return () => {
      if (container) {
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [menu]);

//   const handleSelectedDish = (dish: Dish) => {
//     const dishInCart = cart.find((item) => item.uuid === dish.uuid);
//     if (!dishInCart) {
//       setSelectedDish({ ...dish, quantity: 0 });
//       return;
//     }

//     // setSelectedDish(dishInCart);
//   };

  const getStoreDetail = async () => {
    if (!store_uuid) return;
  
    const response: ApiResponse<Store> = await getStoreByUUID(store_uuid);
  
    if (response.data) {
      setStoreDetail(response.data);
    } else {
      setStoreDetail(null);
      console.error("Error fetching store details:", response.error);
    }
  };
  
  

  const totalBill = useMemo(
    () => sum(cart.map(({ price, quantity }) => (price || 0) * (quantity || 0))),
    [cart],
  );

  const handleOrderInCart = (dishOrder: Dish & { quantity: number }) => {
    const hasInCart = cart.find((item) => item.uuid === dishOrder.uuid);
  
    if (!dishOrder.quantity && !hasInCart) return;
  
    if (hasInCart) {
      const replaceProduct = dishOrder.quantity ? dishOrder : null;
      setCart(cart => [
        ...cart.filter((item) => item.uuid !== dishOrder.uuid),
        ...(replaceProduct ? [replaceProduct] : []),
      ]);
      return;
    }
  
    setCart([...cart, dishOrder]);
  };
  

  useEffect(() => {
    setMenu(
      categoryList.categories.map((category, index) => ({
        ...category,
        index,
      }))
    );
    setActiveTab(categoryList.categories[0]?.uuid || null);
  }, [categoryList]);

  const groupProductByCategory = (cateList: Category[], prodList: Dish[]) => {
    const resultPro: Record<string, Dish[]> = {};
    cateList.forEach((cate) => {
      resultPro[cate.name] = prodList.filter((prod) =>
        prod.categories?.find((c) => c.uuid === cate.uuid),
      );
    });
    return resultPro;
  };

  useEffect(() => {
    const result = groupProductByCategory(
      categoryList.categories,
      productList.products,
    );
    setDisplayProductList(result);
  }, [productList, categoryList]);

  const handleChangeTab = (value: string) => {
    const positionMenu = menu.map((m) => m.uuid).indexOf(value);
    if (positionMenu === -1) return;
    if (!table_uuid) {
      setDefaultMarginList(40);
    }
    menuRef.current[positionMenu]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const fetchCategoriesByStore = async (store_uuid: string) => {
    const response = await getCategoryByStore(store_uuid);
    
    if (!response?.error) {
      const categories = response.data || []; 
      setCategoryList({
        is_update: true,
        categories: categories.sort((a, b) => a.index - b.index),
      });
    } else {
      console.error("Error:", response.error);
    }
  };
  
  
  

  const fetchProductsByStore = async (store_uuid: string) => {
    try {
      const response: ApiResponse<Product[]> = await getProductListByStore(store_uuid, false);
  
      if (!response.error && Array.isArray(response.data)) {
        setProductList({
          is_update: true,
          products: response.data, 
        });
      } else {
        console.error("Error fetching products:", response.error);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };
  

  const fetchTablesByStore = async (store_uuid: string) => {
    const response = await fetchTablesForStore(store_uuid);
    
    if (!response?.error) {
      const tables = response.data || []; 
  
      setTableList({
        is_update: true,
        tables: tables, 
      });
      if (table_uuid) {
        const currentTable = tables.find((item: any) => item.uuid === table_uuid);
        if (currentTable) {
          setTable(currentTable);
        }
      }
    } else {
      console.error("Error fetching tables:", response.error);
    }
  };
  

  useEffect(() => {
    const fetchData = async () => {
      if (!store_uuid) return;
      
      await getStoreDetail();
  
      if (tenant_id) {
        await cloudStorage.set('subdomain', tenant_id); 
      } else {
        await fetchCategoriesByStore(store_uuid);
        await fetchProductsByStore(store_uuid);
        await fetchTablesByStore(store_uuid);
      }
  
    const subdomain: string = tenant_id || '';
    
    const name = ''; 
    const created_at = ''; 
    setStore({
      uuid: store_uuid,
      subdomain,
      name,
      created_at,
      store_settings: [],
      ai_requests_count: 0
    });
  
      if (!categoryList.categories.length) {
        await fetchCategoriesByStore(store_uuid);
      }
  
      if (!productList.products.length) {
        await fetchProductsByStore(store_uuid);
      }
  
      if (!tableList.tables.length) {
        await fetchTablesByStore(store_uuid);
      }
    };
  
    fetchData();
  }, [store_uuid]);

  interface ProductImage {
    uuid: string;
    url: string;
  }

  interface Product {
    uuid: string;
    name: string;
    price: number;
    unit_price?: number;
    quantity?: number;
    images?: ProductImage[];
    product_images?: ProductImage[];
  }

  const defaultProduct: Product = {
    uuid: '',
    name: '',
    price: 0,
    unit_price: 0,
    quantity: 1,
    images: [],
    product_images: []
  };

  return (
    <Page className="menu-page" ref={pageRef}>
      <Box className="top-menu-container">
        {table_uuid && storeDetail && (
          <Box>
            <StoreInformation
              storeData={storeDetail}
              onDetail={() => setShowStoreDetail(true)}
            />
            <Box
              flex
              alignItems="center"
              style={{ paddingLeft: "10px", paddingBottom: "10px" }}
            >
              <TableRestaurantIcon />
              <Text size="xLarge" bold style={{ paddingLeft: "5px" }}>
                {table?.name}
              </Text>
            </Box>
          </Box>
        )}
      </Box>
      <Box
        className="section-container"
        style={{
          marginBottom: !isEmpty(cart) ? 110 : 0,
          paddingTop: table_uuid ? 0 : 16,
        }}
      >
        <Box className="menu-tabs-container">
          <Tabs
            id="menu-tabs"
            value={activeTab}
            orientation="vertical"
            variant="scrollable"
            onChange={(_e, value) => handleChangeTab(value)}
            sx={{ width: "65px" }}
          >
            {menu.map((item) => (
              <Tab
                key={item.uuid}
                value={item.uuid}
                label={item.name}
                sx={{
                  paddingLeft: "0px",
                  alignItems: "flex-start",
                  textAlign: "left",
                  textTransform: "none",
                  fontSize: "14px",
                  minWidth: "60px",
                }}
              />
            ))}
          </Tabs>
        </Box>

        <Box
          style={{
            marginLeft: "80px",
            marginTop: table_uuid ? 100 : defaultMarginList,
          }}
        >
          {Object.keys(displayProductList).map((cate) => (
            <Box key={cate}>
              <Box
                flex
                justifyContent="space-between"
                mt={4}
                // ref={(ref:any) => {
                //   menuRef.current[index] = ref!;
                // }}
                style={{ scrollMargin: "100px" }}
              >
                <Text size="xLarge" bold className="grey-color">
                  {cate}
                </Text>
              </Box>

              <DishMenu
                dishMenu={displayProductList[cate]}
                onDetails={() => {
                  setShowDishDetailsModal(true);
                //   handleSelectedDish(dish);
                }}
                onOrder={() => {
                  setShowOrderModal(true);
                //   handleSelectedDish(dish);
                }}
              />
            </Box>
          ))}
        </Box>

        {!isEmpty(cart) && (
          <Box
            className="sticky-payment-container"
            style={true ? { bottom: "48px" } : { bottom: "0" }}
          >
            <Box className="sticky-payment" flex justifyContent="space-between">
              <Text size="large" bold>
                {t("menu.order")}
              </Text>
              <Text size="large">
                {cart.length} {t("menu.dish")}・{priceFormatter(totalBill)}
              </Text>
            </Box>

            <Box className="sticky-payment-btn">
              <Button
                onClick={() => {
                  setShowOrderSubmitModal(true);
                }}
              >
                {t("menu.finishOrder")}
              </Button>
            </Box>
          </Box>
        )}

        <DishOrderSheet
          isShow={showOrderModal}
          product={selectedDish || defaultProduct}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedDish(null);
          }}
          onSubmit={handleOrderInCart}
          onPayment={(dishOrder) => {
            handleOrderInCart(dishOrder);
            setShowOrderSubmitModal(true);
          }}
        />

        {/* <DishDetailModal
          isShow={showDishDetailsModal}
          dish={selectedDish || {}}
          onClose={() => {
            setShowDishDetailsModal(false);
            setSelectedDish(null);
          }}
          onSubmit={handleOrderInCart}
        /> */}

        <OrderSubmitModal
          isShow={showOrderSubmitModal}
          onClose={() => {
            setShowOrderSubmitModal(false);
          }}
        />

        <StoreDetailModal
          storeData={storeDetail || {}}
          isShow={showStoreDetail}
          onClose={() => {
            setShowStoreDetail(false);
          }}
        />
      </Box>
    </Page>
  );
};

export default MenuCommonPage;
