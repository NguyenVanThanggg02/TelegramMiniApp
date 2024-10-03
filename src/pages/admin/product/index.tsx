import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteProduct, getProductListByStore } from "../../../api/api";
import { useRecoilState } from "recoil";
import { loadingState } from "../../../state";
import {
  List,
  Page,
  Button,
  Box,
  Text,
} from "zmp-ui";
import { useTranslation } from "react-i18next";
import ProductCard from "../../../components/product/product-card";
import ConfirmModal from "../../../components/modal/confirmModal";
import AddIcon from "@mui/icons-material/Add";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Snackbar } from "@telegram-apps/telegram-ui";

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
  // const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const [loading, setLoading] = useRecoilState(loadingState);
  const [isShowConfirm, setIsShowConfirm] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  
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
    if (!selectedProduct) return;

    setLoading({ ...loading, isLoading: true });
    const data = await deleteProduct({
      product: {
        store_uuid: store_uuid,
        uuid: selectedProduct.uuid,
      },
    });
    setLoading({ ...loading, isLoading: false });

    if (JSON.stringify(data)) {
      fetchProductList(); // Cập nhật lại danh sách sản phẩm sau khi xoá thành công
      setSnackbarMessage(t("snackbarMessage.deleteSuccess"));
      setSnackbarType("success");
      setSnackbarOpen(true);

    } else {

      setSnackbarMessage(typeof data.error === "string"
        ? data.error
        : t("snackbarMessage.deleteFail"));
        setSnackbarType("error");
        setSnackbarOpen(true);
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
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product.uuid}
              product={product}
              onDetails={() => goToProductDetails(product.uuid)}
              setIsShowConfirm={setIsShowConfirm}
              setSelectedProduct={setSelectedProduct}
            />
          ))
        ) : (
          <Box
            className="order-table_empty"
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              marginTop:'50px'

            }}
          >
            <Text style={{ color: "rgba(0, 0, 0, 0.5)", textAlign: "center" }}>
              {t("main.product")}
            </Text>
          </Box>
        )}
      </List>
      <div style={{ borderRadius: "10px" }}>
        {snackbarOpen && (
          <Snackbar onClose={() => setSnackbarOpen(false)} duration={3000}>
            <div
              className={`snackbar ${snackbarType === "success" ? "snackbar-success" : "snackbar-error"}`}
            >
              <div style={{ display: "flex" }}>
                {snackbarType === "success" && (
                  <CheckCircleIcon style={{ marginRight: 8, color: "green" }} />
                )}
                {snackbarType === "error" && (
                  <ErrorIcon style={{ marginRight: 8, color: "red" }} />
                )}
                {snackbarMessage}
              </div>
            </div>
          </Snackbar>
        )}
      </div>
    </Page>
  );
};

export default ProductPage;
