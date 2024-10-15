import React, { ChangeEvent, useEffect, useState } from "react";
import {
  Button,
  Icon,
  Input,
  Box,
  Page,
  Select,
  Switch,
  ImageViewer,
} from "zmp-ui";

import { useNavigate, useParams } from "react-router-dom";

import { useRecoilState, useRecoilValue } from "recoil";
import { userState, storeState } from "../../../state";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { formatNumberToVND } from "../../../utils/numberFormatter";
import { Snackbar } from "@telegram-apps/telegram-ui";
import WarningIcon from '@mui/icons-material/Warning';
import {
  sendCreateProductRequest,
  fetchProductDetails,
  sendUpdateProductRequest,
  getCategoryByStore,
  uploadImages,
} from "../../../api/api";

const { Option } = Select;

import { useTranslation } from "react-i18next";
import useStoreDetail from "@/components/userStoreDetail";


interface ProductForm {
  name: string;
  describe: string;
  price: string;
  selectedStore?: string;
  selectedCategories: string[];
  image?: string;
}

interface ErrorForm {
  name?: string;
  describe?: string;
  price?: string;
  image?: string;
  selectedCategories?: string;
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

interface Category {
  uuid: string;
  name: string;
}
interface ImageData {
  src: string;
  alt: string;
  key: string;
  file?: File; 
  uuid?: string; 
}

const ProductFormPage: React.FC = () => {
  const { t } = useTranslation("global");
  const { store_uuid, product_uuid } = useParams<{ store_uuid?: string; product_uuid?: string }>();
  const [form, setForm] = useState<ProductForm>({
    name: "",
    describe: "",
    price: "",
    selectedStore: "",
    selectedCategories: [],
  });
  const [errorForm, setErrorForm] = useState<ErrorForm>({});


  const [user, ] = useRecoilState(userState);
  const store = useRecoilValue(storeState);

  const [categoryList, setCategoryList] = useState<Category[]>([]);

  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error" | "warning">("success");
  
  const [showButtonStatus, setShowButtonStatus] = useState<boolean>(false);
  const [images, setImages] = useState<ImageData[]>([]);
  const [imageUUIDs, setImageUUIDs] = useState<string[]>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const {currency} = useStoreDetail();
  console.log(currency);
  
  useEffect(() => {
    sendRequestGetCategory();
  }, []);

  const handleChangeInput = (field: keyof ProductForm, value: string | string[] | undefined) => {
    const newErrors = { ...errorForm };
    // delete newErrors[field];
    setErrorForm(newErrors);
  
    if (value === undefined) {
      return; 
    }
  
    // Xử lý theo kiểu data của field
    switch (field) {
      case "selectedStore":
        setForm((prevForm) => ({
          ...prevForm,
          selectedStore: value as string, 
          selectedCategories: [], 
        }));
        break;
  
        case "price":
          if (typeof value === "string") {
              let formattedValue;
      
              if (currency === "$") {
                  formattedValue = value; 
              } else {
                  formattedValue = formatNumberToVND(value);
              }
              setForm((prevForm) => ({
                  ...prevForm,
                  price: formattedValue,
              }));
          }
          break;
  
      case "selectedCategories":
        // Chuyển value sang kiểu string[]
        const selectedCategories = Array.isArray(value) ? value : [];
        setForm((prevForm) => ({
          ...prevForm,
          selectedCategories,
        }));
        break;
  
      default:
        setForm((prevForm) => ({
          ...prevForm,
          [field]: value,
        }));
        break;
    }
  };
  
  useEffect(() => {
    if (product_uuid && product_uuid !== "null") {
      loadProductDetails(product_uuid);
    } else {
      console.log(`create new product`);
    }
  }, []);

  const handleCheckboxChange = () => {
    setShowButtonStatus((prevStatus) => !prevStatus);
  };


  const removeImage = (index: any) => {
    const updatedImages = [...images];
    const updatedImageUUIDs = [...imageUUIDs];

    updatedImages.splice(index, 1); // Xóa ảnh khỏi mảng images
    updatedImageUUIDs.splice(index, 1); // Xóa uuid tương ứng khỏi mảng imageUUIDs

    setImages(updatedImages);
    setImageUUIDs(updatedImageUUIDs);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;
  
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const newImages = fileArray.map((file) => {
        const reader = new FileReader();
        return new Promise<{ src: string; file: File }>((resolve, reject) => {
          reader.onloadend = () => {
            resolve({ src: reader.result as string, file });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
  
      try {
        const imageData = await Promise.all(newImages);
        const imageObjects = imageData.map(({ src, file }) => ({
          src,
          alt: `Preview image ${file.name}`,
          key: file.name,
          file,
        }));
  
        setImages((prevImages) => [...prevImages, ...imageObjects]);
  
        const response = await uploadImages(store.uuid, user.uuid, fileArray);
        console.log("Upload successful:", response);
  
        const data = response.data.data;
        const urls = data?.urls || [];
        const uuids = data?.uuids || [];
  
        const newData = urls.map((url: string, index: string) => ({
          src: url,
          alt: `img ${images.length + index + 1}`,
          key: `${images.length + index + 1}`,
          uuid: uuids[index],
        }));
  
        setImages((prevImages) => [
          ...prevImages.filter((img) => img.uuid),
          ...newData,
        ]);
        setImageUUIDs((prevUUIDs) => [...prevUUIDs, ...uuids]);
        setSnackbarMessage(t("snackbarMessage.uploadImageSuccess"));
        setSnackbarType("success");
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Upload failed:", error);
        setSnackbarMessage(t("snackbarMessage.uploadImageFail"));
        setSnackbarType("error");
        setSnackbarOpen(true);
      }
    } else {
      console.log("No files selected.");
    }
  };
  
  const loadProductDetails = async (product_uuid: string) => {
    const data = await fetchProductDetails(product_uuid);
    if (!data?.error && data.data) {
      const product = data.data;

      console.log("Product details:", product);

      setForm({
        name: product.name,
        describe: product.describe,
        price: formatNumberToVND(product.price),
        selectedStore: product.store_uuid,
        selectedCategories: product.categories.map((cat) => cat.uuid) || [],
      });

      // if (data.status == "not_show") {
      if (product.status === "not_show") {
        setShowButtonStatus(false);
      } else {
        setShowButtonStatus(true);
      }

      const newData = product.images.map((image, index) => ({
        src: image.url,
        alt: `img ${product.images.length + index + 1}`,
        key: `${product.images.length + index + 1}`,
        uuid: image.uuid, // Thêm UUID vào dữ liệu ảnh
      }));

      // Kiểm tra nếu data.uuids không phải null hoặc undefined
      // const newImageUUIDs = product.images.map((image) => image.uuid);

      // setImages([...images, ...newData]);
      // setImageUUIDs([...imageUUIDs, ...newImageUUIDs]);

      setImages((prevImages) => [...prevImages, ...newData]);
      setImageUUIDs((prevUUIDs) => [
        ...prevUUIDs,
        ...product.images.map((image) => image.uuid),
      ]);
    } else {
      console.error("Error fetching product details:", data.error);
      setSnackbarMessage(t("snackbarMessage.fetchProductDetailFail"));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: ErrorForm = {};


    if (!form.name) {
      isValid = false;
      newErrors.name = t(
        "productManagement.createProduct.messageErrorProductName",
      );
    }

    if (!form.describe) {
      isValid = false;
      newErrors.describe = t(
        "productManagement.createProduct.messageErrorProductDescription",
      );
    }

    if (!form.price) {
      isValid = false;
      newErrors.price = t(
        "productManagement.createProduct.messageErrorProductPrice",
      );
    }

    if (!images.length) {
      isValid = false;
      newErrors.image = t(
        "productManagement.createProduct.messageErrorProductImage",
      );
    }

    if (!form.selectedCategories.length) {
      isValid = false;
      newErrors.selectedCategories = t(
        "productManagement.createProduct.messageErrorProductCategory",
      );
    }

    setErrorForm(newErrors);

    return isValid;
  };

  const handleSubmit = async () => {
    console.log(images);
  
    if (!validateForm()) return;
  
    if (images.some(img => !img.uuid)) {
      setSnackbarMessage(t("snackbarMessage.waitForImageUpload"));
      setSnackbarType("warning");
      setSnackbarOpen(true);
      return;
    }
  
    if (product_uuid && product_uuid !== "null") {
      await updateProduct();
    } else {
      await createProduct();
    }
  };
  

  const createProduct = async () => {
    const payload = buildPayload();
  
    const data = await sendCreateProductRequest(payload);
    if (!data?.error) {
      console.log("Product created:", data);
      setSnackbarMessage(t("snackbarMessage.productCreateSuccess"));
      setSnackbarType("success");
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate(-1); 
      }, 2000);
    } else {
      console.error("Error:", data.error);
      setSnackbarMessage(t("snackbarMessage.productCreateFail"));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
  };

  const updateProduct = async () => {
    let payload = buildPayload();
    payload.product.uuid = product_uuid;
  
    const data = await sendUpdateProductRequest(payload);
    if (!data?.error) {
      console.log("Updated:", data);
      setSnackbarMessage(t("snackbarMessage.productUpdateSuccess"));
      setSnackbarType("success");
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate(-1); 
      }, 2000);
    } else {
      console.error("Error:", data.error);
      setSnackbarMessage(t("snackbarMessage.productUpdateFail"));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
  };

  const buildPayload = (): ProductPayload => {
      console.log("Images:", images);
    
    return {
      product: {
        cat_uuids: form.selectedCategories,
        store_uuid: store_uuid,
        name: form.name,
        describe: form.describe,
        status: showButtonStatus ? "show_now" : "not_show",
        price: parseInt(form.price.replace(/\D/g, ""), 10),
        image_uuids: images.map((img) => img.uuid || ""), 
      },
    };
  }; 

  const sendRequestGetCategory = async () => {
    const response = await getCategoryByStore(store_uuid);
  
    if (!response?.error && response.data) {
      setCategoryList(response.data);  
    } else {
      console.error("Error:", response.error);
      setSnackbarMessage(t("snackbarMessage.getCatFail"));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
  };
  return (
    <Page className="page">
      <div className="section-container">
        <Box>
          <Box>
            <Input
              id="name"
              label={t("productManagement.createProduct.productName")}
              type="text"
              placeholder={t(
                "productManagement.createProduct.productNameEnter"
              )}
              value={form?.name}
              onChange={(e) => handleChangeInput("name", e.target.value)}
              errorText={errorForm?.name || ""}
              status={errorForm?.name ? "error" : ""}
              showCount
              maxLength={20}
            />

            <Input.TextArea
              id="describe"
              label={t("productManagement.createProduct.productDescription")}
              placeholder={t(
                "productManagement.createProduct.productDescriptionEnter"
              )}
              value={form?.describe}
              onChange={(e) => handleChangeInput("describe", e.target.value)}
              showCount
              errorText={errorForm?.describe || ""}
              status={errorForm?.describe ? "error" : ""}
              maxLength={250}
            />

            <Input
              id="price"
              label={t("productManagement.createProduct.productPrice")}
              type="text" // Change to text type to allow formatting
              placeholder={t(
                "productManagement.createProduct.productPriceEnter"
              )}
              value={form?.price}
              onChange={(e) => handleChangeInput("price", e.target.value)}
              errorText={errorForm?.price || ""}
              status={errorForm?.price ? "error" : ""}
            />

            <Box mt={6}>
              {/* Select Categories */}
              <Select
                id="category"
                label={t("productManagement.createProduct.category")}
                helperText={t("productManagement.createProduct.categoryInfo")}
                placeholder={t(
                  "productManagement.createProduct.categorySelect"
                )}
                multiple
                value={form.selectedCategories}
                onChange={(values) =>
                  handleChangeInput("selectedCategories", values as string[])
                }
                errorText={errorForm?.selectedCategories || ""}
                status={errorForm?.selectedCategories ? "error" : ""}
              >
                {categoryList.map((cat) => (
                  <Option key={cat.uuid} value={cat.uuid} title={cat.name} />
                ))}
              </Select>
            </Box>
          </Box>

          <Box mt={2}>
            <Box flex flexDirection="row" flexWrap={false}>
              {images.map((img, index) => (
                <Box
                  mr={1}
                  key={index} // Sử dụng index thay vì index.key vì đây là mảng
                  style={{
                    position: "relative",
                    width: "68px",
                    height: "69px",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    role="presentation"
                    onClick={() => {
                      setActiveIndex(index);
                      setVisible(true);
                    }}
                    src={img.src}
                    alt={img.alt}
                  />
                  {/* Nút x xoá ảnh */}
                  <div
                    style={{
                      position: "absolute",
                      top: "3px",
                      right: "3px",
                      background: "red",
                      cursor: "pointer",
                      borderRadius: "15px",
                      color: "beige",
                      width: "22px",
                      height: "22px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={() => removeImage(index)}
                  >
                    X
                  </div>
                </Box>
              ))}
            </Box>
            <ImageViewer
              onClose={() => setVisible(false)}
              activeIndex={activeIndex}
              images={images}
              visible={visible}
            />
          </Box>

          <Box mt={6}>
            <Button
              fullWidth
              variant="primary"
              onClick={() => document.getElementById("chooseFile")?.click()}
            >
              <Icon icon="zi-camera" />{" "}
              {t("productManagement.createProduct.uploadImage")}
            </Button>
            <input
              type="file"
              hidden
              id="chooseFile"
              onChange={handleFileChange}
            />
            {errorForm.image && (
              <Box
                flex
                alignItems="center"
                className="zaui-input-helper-text zaui-input-helper-text-has-error"
                mt={1}
              >
                <Icon
                  icon="zi-warning-solid"
                  size={16}
                  className="zaui-input-helper-text-icon"
                />{" "}
                {errorForm.image}
              </Box>
            )}
          </Box>

          <Box mt={6}>
            <Box style={{color:'black'}}>
              <Switch
                checked={showButtonStatus}
                label={t("productManagement.createProduct.display")}
                onChange={handleCheckboxChange}
              />
            </Box>
          </Box>

          <Box mt={4}>
            <Button fullWidth variant="primary" onClick={handleSubmit}>
              {t("productManagement.createProduct.submit")}
            </Button>
          </Box>
        </Box>
        <div style={{borderRadius:'10px'}}>
          {snackbarOpen && (
            <Snackbar onClose={() => setSnackbarOpen(false)} duration={3000}>
              {/* <div className={`snackbar ${snackbarType === "success" ? "snackbar-success" : "snackbar-error"}`}> */}
              <div className={`snackbar ${snackbarType === "success" ? "snackbar-success" : snackbarType === "warning" ? "snackbar-warning" : "snackbar-error"}`}>
                <div style={{display:'flex'}}>
                  {snackbarType === "success" && <CheckCircleIcon style={{ marginRight: 8, color:'green' }} />} 
                  {snackbarType === "warning" && <WarningIcon style={{ marginRight: 8, color:'yellow' }} />} 
                  {snackbarType === "error" && <ErrorIcon style={{ marginRight: 8, color:'red' }} />} 
                  {snackbarMessage}
                </div>
              </div>
            </Snackbar>
          )}
        </div>
      </div>
    </Page>
  );
};

export default ProductFormPage;
