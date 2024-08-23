import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteProduct, getProductListByStore } from "../../../api/api";
import { useRecoilState, useRecoilValue } from "recoil";
import { loadingState, userState } from "../../../state";
import {
  List,
  Page,
  Button,
  Box,
  useSnackbar,
} from "zmp-ui";
import { useTranslation } from "react-i18next";
import ProductCard from "../../../components/product/product-card";
import ConfirmModal from "../../../components/modal/confirmModal";
import AddIcon from "@mui/icons-material/Add";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";

interface Category {
  name: string;
}

interface Product {
  uuid: string;
  name: string;
  price: number;
  status: string;
  images: { url: string }[];
  categories: Category[];
}

interface ApiResponse<T> {
  data?: T;
  error?: string | unknown;
}

const ProductPage: React.FC = () => {
  const { t } = useTranslation("global");
  const { store_uuid } = useParams<{ store_uuid: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const [loading, setLoading] = useRecoilState(loadingState);
  const [isShowConfirm, setIsShowConfirm] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const snackbar = useSnackbar();

  useEffect(() => {
    setLoading({ ...loading, isLoading: true });
    // Gọi API để lấy danh sách sản phẩm từ store_uuid
    fetchProductList();
  }, [store_uuid]);

  const goToProductDetails = (productUUID: string) => {
    console.log(`productUUID: ${productUUID}`);
    navigate(`/admin/product/update/${store_uuid}/${productUUID}`);
  };

  const goToProductCreate = (productUUID: string) => {
    console.log(`productUUID: ${productUUID}`);
    navigate(`/admin/product/form/${store_uuid}/${productUUID}`);
  };

  const fetchProductList = async () => {
    if (!store_uuid) return;
    const data: ApiResponse<Product[]> = await getProductListByStore(store_uuid, true);
    if (!data.error && data.data) {
      setLoading({ ...loading, isLoading: false });
      setProducts(data.data);
    } else {
      setLoading({ ...loading, isLoading: false });
      console.error("Error fetching products:", data.error);
    }
  };

  const onDeleteProduct = async () => {
    setIsShowConfirm(false);
    const data = await deleteProduct({
      product: {
        store_uuid: store_uuid,
        uuid: selectedProduct?.uuid,
      },
    });
    if (!data?.error) {
      fetchProductList();
      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.deleteSuccess"),
        type: "success",
      });
    } else {
      snackbar.openSnackbar({
        duration: 3000,
        text:
          typeof data.error === "string"
            ? data.error
            : t("snackbarMessage.deleteFail"),
        type: "error",
      });
    }
  };

  return (
    <Page className="section-container" style={{ backgroundColor: "#f3f3f3" }}>
      <ConfirmModal
        isShowModal={isShowConfirm}
        setIsShowModal={setIsShowConfirm}
        itemDelete={selectedProduct?.name}
        onConfirm={() => onDeleteProduct()}
      />
      <Box className="toolbar_add-btn">
        <Button
          className="fw-500"
          style={{ width: "50%" }}
          onClick={() => goToProductCreate("")}
          prefixIcon={<AddIcon />}
        >
          {t("productManagement.createProduct.createProduct")}
        </Button>
        <Button
          className="fw-500"
          style={{ width: "49%", marginLeft: "1%" }}
          onClick={() => navigate(`/admin/product/scanmenu/${store_uuid}`)}
          prefixIcon={<DocumentScannerIcon />}
        >
          {t("productManagement.scanMenu.button")}
        </Button>
      </Box>
      <List style={{ marginTop: "10px" }}>
        {products.map((product) => (
          <ProductCard
            key={product.uuid}
            product={product}
            onDetails={() => goToProductDetails(product.uuid)}
            setIsShowConfirm={setIsShowConfirm}
            setSelectedProduct={setSelectedProduct}
          ></ProductCard>
        ))}
      </List>
    </Page>
  );
};

export default ProductPage;
