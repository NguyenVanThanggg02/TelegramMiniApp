import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Page, Text, Box, Button } from "zmp-ui";
import { useRecoilState } from "recoil";
import DishMenu from "../dish/dish-card/dish-menu";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import {
  cartState,
  categoryListState,
  productListState,
  tableState,
  tableListState,
  storeState,
  loadingState,
} from "../../state";
import "./styles.scss";
import DishOrderSheet from "../../components/dish/dish-order";
import { priceFormatter } from "../../utils/numberFormatter";
import { isEmpty, sum } from "lodash";
import OrderSubmitModal from "../order-submit-modal";
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
import DishDetailModal from "../dish/dish-details";


interface DishImage {
  uuid: string;
  url: string;
}

interface Dish {
  uuid: string;
  name: string;
  price: number;
  unit_price?: number,
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

const defaultProduct: Product = {
  uuid: '',
  name: '',
  price: 0,
  unit_price: 0,
  quantity: 1,
  images: [],
  product_name: 'Product',
  product_images: [],
  order_item_uuid:'',
  delivered_quantity: 0,
  delivery_status: '',
  product_uuid:'',
};


const MenuBottomCommonPage: React.FC<MenuCommonPageProps> = () => {
  const { t } = useTranslation("global");
  const { store_uuid, table_uuid } = useParams<{ store_uuid: string; table_uuid?: string }>();
  const [searchParams, ] = useSearchParams();
  const tenant_id = searchParams.get("tenant_id");

  const [, setStore] = useRecoilState(storeState);
  //@ts-ignore
  const [table, setTable] = useRecoilState<Record<string, []> | null>(tableState);
  const [tableList, setTableList] = useRecoilState(tableListState);
  const [categoryList, setCategoryList] = useRecoilState(categoryListState);
  const [productList, setProductList] = useRecoilState(productListState);
  const [cart, setCart] = useRecoilState(cartState);

  const [showDishDetailsModal, setShowDishDetailsModal] = useState<boolean>(false);
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
  const [loading, setLoading] = useRecoilState(loadingState);

  const navigate = useNavigate();


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
          if (ref && ref.getBoundingClientRect().top <= 210) {
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

  const handleSelectedDish = (dish: Dish) => {
    const dishInCart = cart.find((item) => item.uuid === dish.uuid);
    if (!dishInCart) {
      setSelectedDish({ ...dish, quantity: 0 });
      return;
    }
    setSelectedDish(dishInCart);
  };

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
    setActiveTab(value);
    if (!table_uuid) {
      setDefaultMarginList(40);
    }
    // menuRef.current[positionMenu]?.scrollIntoView({
    //   behavior: "smooth",
    //   block: "start",
    // });
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
          setTable(null);  

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
      setLoading({ ...loading, isLoading: true });
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
      setLoading({ ...loading, isLoading: false });
    };
   
    fetchData();
  }, [store_uuid]);

  const transformDishToProduct = (dish: Dish): Product => {
    return {
      uuid: dish.uuid,
      name: dish.name,
      price: dish.price,
      unit_price: dish.unit_price,
      quantity: dish.quantity,
      images: dish.images,
      product_name: dish.name, 
      product_images: dish.images, 
      order_item_uuid: '', 
      delivered_quantity: dish.quantity || 0, 
      product_uuid: '', 
      delivery_status: '' 
    };
  };
  
  useEffect(() => {
    if (table_uuid) {
      fetchTablesByStore(String(store_uuid));
    }
  }, [table_uuid, store_uuid]);
  


  return (
    <>
      <Page className="menu-page" ref={pageRef} style={{ height: "100vh" }}>
        <Box className="top-menu-container">
          {table_uuid && storeDetail && (
            <Box style={{ display: "flex" }} alignItems="center">
              <StoreInformation
                storeData={storeDetail}
                onDetail={() => setShowStoreDetail(true)}
              />
              <Box
                flex
                alignItems="center"
                style={{ paddingLeft: "10px" }}
              >
                <TableRestaurantIcon style={{ color: "black" }} />
                <Text
                  size="xLarge"
                  bold
                  style={{ paddingLeft: "5px", color: "black" }}
                >
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
            paddingTop: table_uuid ? 0 : 0,
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
              {!isEmpty(menu) &&
                menu.map((item) => (
                  <Tab
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
                  ></Tab>
                ))}
            </Tabs>
          </Box>

          <Box
            style={{
              marginLeft: "80px",
              marginTop: table_uuid ? 50 : defaultMarginList,
            }}
          >
            {Object.keys(displayProductList).map((cate, index) => (
              <Box key={cate}>
                <Box
                  flex
                  justifyContent="space-between"
                  mt={4}
                  //@ts-ignore
                  ref={(ref: any) => {
                    menuRef.current[index] = ref!;
                  }}
                  style={{ scrollMargin: "100px" }}
                >
                  <Text size="xLarge" bold className="grey-color">
                    {cate}
                  </Text>
                </Box>

                <DishMenu
                  dishMenu={displayProductList[cate]}
                  onDetails={(dish) => {
                    setShowDishDetailsModal(true);
                    handleSelectedDish(dish);
                  }}
                  onOrder={(dish) => {
                    setShowOrderModal(true);
                    handleSelectedDish(dish);
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
              <Box
                className="sticky-payment"
                flex
                justifyContent="space-between"
                style={{ paddingBottom: "5px" }}
              >
                <Text size="large" bold style={{ color: "black" }}>
                  {t("menu.order")}
                </Text>
                <Text size="large" style={{ color: "black" }}>
                  {cart.length} {t("menu.dish")}・{priceFormatter(totalBill)}
                </Text>
              </Box>

              <Box
                className="sticky-payment-btn"
                style={{ paddingBottom: "20px" }}
              >
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
            product={transformDishToProduct(selectedDish || defaultProduct)}
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

          <DishDetailModal
            isShow={showDishDetailsModal}
            dish={selectedDish!}
            onClose={() => {
              setShowDishDetailsModal(false);
              setSelectedDish(null);
            }}
            onSubmit={handleOrderInCart}
          />

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
      <Box
        flex
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "#fff",
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: "20px",
        }}
      >
        <Box
          flex
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#f44336",
            fontSize: "12px",
          }}
          onClick={() => navigate(`/menuu/${store_uuid}/${table_uuid}`)}
        >
          <RestaurantMenuOutlinedIcon
            style={{ color: "#f44336", fontSize: "24px" }}
          />
          <span>{t("navbar.menu")}</span>
        </Box>

        <Box
          flex
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#757575",
            fontSize: "12px",
          }}
          onClick={() => navigate(`/user/order/${store_uuid}`)}
        >
          <AssignmentOutlinedIcon
            style={{ color: "#757575", fontSize: "24px" }}
          />
          <span>{t("navbar.order")}</span>
        </Box>

        <Box
          flex
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#757575",
            fontSize: "12px",
          }}
          onClick={() => navigate(`/user/profile/bottomnavbar/${store_uuid}`)}
        >
          <PersonOutlinedIcon style={{ color: "#757575", fontSize: "24px" }} />
          <span>{t("navbar.user")}</span>
        </Box>
      </Box>
    </>
  );
};

export default MenuBottomCommonPage;
